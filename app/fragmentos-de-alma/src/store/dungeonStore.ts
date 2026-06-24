// Estado de sessão de dungeon — Zustand
// Persiste a sessão entre batalhas (HP, andar, progresso).
import { create } from 'zustand'
import {
  type DungeonSession, type BiomeId,
  createDungeonSession, advanceAfterVictory, isBiomeComplete,
  generateFloorEnemies, calcHpRecovery, checkDailyLoot,
  BATTLES_PER_FLOOR, BIOMES,
} from '@/systems/progression/dungeon'
import type { EnemySpec } from '@/systems/battle/types'
import type { Hero } from '@/systems/genes/types'
import { computeHpMax } from '@/systems/battle/engine'

interface DungeonStore {
  session: DungeonSession | null
  heroes: Hero[]                     // time atual (pode ser reorganizado entre batalhas)
  currentEnemies: EnemySpec[]

  startDungeon: (biome: BiomeId, heroes: Hero[]) => void
  recordVictory: (heroCombatants: Record<string, { currentHp: number; maxHp: number; isAlive: boolean }>) => void
  recordDefeat: () => void
  applyHpRecovery: () => void
  swapHeroPositions: (heroes: Hero[]) => void
  exitDungeon: () => void
  nextEnemies: () => EnemySpec[]
}

function makeSeed(biome: string, floor: number, battle: number): string {
  return `${biome}-${floor}-${battle}-${Date.now()}`
}

export const useDungeonStore = create<DungeonStore>((set, get) => ({
  session: null,
  heroes: [],
  currentEnemies: [],

  startDungeon: (biome, heroes) => {
    const heroIds = heroes.map(h => h.id)
    const session = createDungeonSession(biome, heroIds)

    // Inicializa snapshot de HP com HP máximo de cada herói
    const hpSnapshot: Record<string, number> = {}
    for (const h of heroes) {
      hpSnapshot[h.id] = computeHpMax(h.genome, h.level)
    }

    const enemies = generateFloorEnemies(
      biome,
      session.currentFloor,
      session.battleIndexInFloor,
      makeSeed(biome, 1, 0)
    )

    set({
      session: { ...session, heroHpSnapshot: hpSnapshot, fullLoot: checkDailyLoot(session) },
      heroes,
      currentEnemies: enemies,
    })
  },

  recordVictory: (heroCombatants) => {
    const { session, heroes } = get()
    if (!session) return

    // Atualiza HP snapshot com HPs pós-batalha
    const newSnapshot = { ...session.heroHpSnapshot }
    for (const h of heroes) {
      const c = heroCombatants[h.id]
      if (c) newSnapshot[h.id] = c.isAlive ? c.currentHp : 0
    }

    const advanced = advanceAfterVictory({ ...session, heroHpSnapshot: newSnapshot })
    set({ session: advanced })
  },

  recordDefeat: () => {
    const { session } = get()
    if (!session) return
    set({ session: { ...session, dailyAttemptsUsed: session.dailyAttemptsUsed + 1 } })
  },

  applyHpRecovery: () => {
    const { session, heroes } = get()
    if (!session) return

    const newSnapshot = { ...session.heroHpSnapshot }
    for (const h of heroes) {
      const current = newSnapshot[h.id] ?? 0
      const max = computeHpMax(h.genome, h.level)
      newSnapshot[h.id] = calcHpRecovery(h.id, current, max)
    }
    set({ session: { ...session, heroHpSnapshot: newSnapshot } })
  },

  swapHeroPositions: (newOrder) => {
    set({ heroes: newOrder })
  },

  exitDungeon: () => {
    set({ session: null, heroes: [], currentEnemies: [] })
  },

  nextEnemies: () => {
    const { session } = get()
    if (!session) return []
    const enemies = generateFloorEnemies(
      session.biome,
      session.currentFloor,
      session.battleIndexInFloor,
      makeSeed(session.biome, session.currentFloor, session.battleIndexInFloor)
    )
    set({ currentEnemies: enemies })
    return enemies
  },
}))

// ─── Seletores úteis ──────────────────────────────────────────────────────────

export function useDungeonProgress() {
  const session = useDungeonStore(s => s.session)
  if (!session) return null
  const config = BIOMES[session.biome]
  const totalBattles = config.floors * BATTLES_PER_FLOOR
  const floorProgress = `${session.battleIndexInFloor + 1}/${BATTLES_PER_FLOOR}`
  const overallProgress = session.totalBattlesWon / totalBattles
  const complete = isBiomeComplete(session)
  return { session, config, floorProgress, overallProgress, complete }
}
