import { create } from 'zustand'
import type { Hero } from '@/systems/genes/types'
import {
  createTowerSession,
  advanceTowerFloor,
  getRetreatFloor,
  HP_RECOVERY_TOWER,
  type TowerSession,
} from '@/systems/endgame/towers'
import { computeHpMax } from '@/systems/battle/engine'

interface TowerStore {
  session: TowerSession | null
  weeklyBestFloor: number
  allTimeBestFloor: number
  heroes: Hero[]

  startTower(heroes: Hero[]): void
  recordFloorVictory(
    heroCombatants: Record<string, { currentHp: number; maxHp: number; isAlive: boolean }>
  ): void
  applyHpRecovery(): void
  handleDefeat(): void
  exitTower(): void
}

export const useTowerStore = create<TowerStore>((set, get) => ({
  session: null,
  weeklyBestFloor: 0,
  allTimeBestFloor: 0,
  heroes: [],

  startTower(heroes) {
    const session = createTowerSession(heroes.map(h => h.id))
    set({ session, heroes })
  },

  recordFloorVictory(heroCombatants) {
    const { session } = get()
    if (!session) return

    const snapshot: Record<string, number> = {}
    for (const [id, c] of Object.entries(heroCombatants)) {
      if (!c.isAlive) {
        snapshot[id] = 0
      } else {
        snapshot[id] = c.currentHp
      }
    }

    const advanced = advanceTowerFloor({
      ...session,
      heroHpSnapshot: snapshot,
    })

    const nextFloor = advanced.currentFloor
    set(s => ({
      session: advanced,
      weeklyBestFloor: Math.max(s.weeklyBestFloor, session.currentFloor),
      allTimeBestFloor: Math.max(s.allTimeBestFloor, session.currentFloor),
    }))

    return nextFloor
  },

  applyHpRecovery() {
    const { session, heroes } = get()
    if (!session) return

    const snapshot = { ...session.heroHpSnapshot }
    for (const hero of heroes) {
      const maxHp = computeHpMax(hero.genome, hero.level)
      const current = snapshot[hero.id] === -1 ? maxHp : (snapshot[hero.id] ?? maxHp)
      if (current <= 0) continue
      const recovered = Math.round(maxHp * HP_RECOVERY_TOWER)
      snapshot[hero.id] = Math.min(maxHp, current + recovered)
    }

    set(s => ({ session: s.session ? { ...s.session, heroHpSnapshot: snapshot } : null }))
  },

  handleDefeat() {
    const { session } = get()
    if (!session) return

    const retreatFloor = getRetreatFloor(session.currentFloor)
    // Reset HP para máximo ao retroceder para início da zona
    set(s => ({
      session: s.session
        ? {
            ...s.session,
            currentFloor: retreatFloor,
            heroHpSnapshot: Object.fromEntries(
              Object.keys(s.session.heroHpSnapshot).map(id => [id, -1])
            ),
          }
        : null,
    }))
  },

  exitTower() {
    set({ session: null, heroes: [] })
  },
}))
