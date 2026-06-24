// Sistema de dungeons e andares — ver doc 04 (loop de progressão)
// Lógica pura: sem estado, sem efeitos colaterais.

import { generateFragmentGenome } from '../genes/generator'
import { calculateRarity } from '../genes/rarity'
import { generateSkills } from '../skills/generator'
import { generateName } from '../../utils/nameGenerator'
import type { EnemySpec } from '../battle/types'

// ─── Configuração de biomas ───────────────────────────────────────────────────

// Biomas originais + territórios de Solum (mapa vivo)
export type BiomeId =
  | 'abismo' | 'celestial' | 'genesis' | 'forja' | 'eter' | 'vazio'
  | 'axis' | 'kethara' | 'mnemos' | 'verdania' | 'cinderfall' | 'limiar' | 'venula'

/** True se o biome ID corresponde a um território do mapa */
export function isTerritoryBiome(id: BiomeId): boolean {
  return ['axis','kethara','mnemos','verdania','cinderfall','limiar','venula'].includes(id)
}

export interface BiomeConfig {
  id: BiomeId
  label: string
  floors: number            // andares para completar o bioma
  aiPatterns: EnemySpec['aiPattern'][]
  // Modificadores de atributo aplicados aos inimigos (doc 07)
  attrBoost: Partial<Record<string, number>>  // chave = atributo, valor = bônus
  attrPenalty: Partial<Record<string, number>>
  unlockCondition: UnlockCondition
}

export type UnlockCondition =
  | { type: 'always' }
  | { type: 'fusions'; min: number }
  | { type: 'rarity'; rarity: string }
  | { type: 'legacyEcos'; min: number }

export const BIOMES: Record<BiomeId, BiomeConfig> = {
  abismo: {
    id: 'abismo',
    label: 'Cavernas do Abismo',
    floors: 5,
    aiPatterns: ['defensive', 'aggressive', 'aggressive'],
    attrBoost: { resistencia: 20 },
    attrPenalty: { agilidade: 20 },
    unlockCondition: { type: 'always' },
  },
  celestial: {
    id: 'celestial',
    label: 'Pináculo Celestial',
    floors: 6,
    aiPatterns: ['aggressive', 'random', 'support'],
    attrBoost: { ressonancia: 25 },
    attrPenalty: { resistencia: 20 },
    unlockCondition: { type: 'fusions', min: 10 },
  },
  genesis: {
    id: 'genesis',
    label: 'Floresta Primordial',
    floors: 5,
    aiPatterns: ['support', 'defensive', 'defensive'],
    attrBoost: { aura: 25 },
    attrPenalty: {},
    unlockCondition: { type: 'rarity', rarity: 'raro' },
  },
  forja: {
    id: 'forja',
    label: 'Forja Eterna',
    floors: 7,
    aiPatterns: ['aggressive', 'aggressive', 'aggressive'],
    attrBoost: { forca: 30 },
    attrPenalty: { aura: 15 },
    unlockCondition: { type: 'rarity', rarity: 'epico' },
  },
  eter: {
    id: 'eter',
    label: 'Mar do Éter',
    floors: 8,
    aiPatterns: ['random', 'random', 'support'],
    attrBoost: {},
    attrPenalty: {},
    unlockCondition: { type: 'rarity', rarity: 'lendario' },
  },
  vazio: {
    id: 'vazio',
    label: 'Vazio Fragmentado',
    floors: 10,
    aiPatterns: ['random', 'aggressive', 'support'],
    attrBoost: { forca: 15, ressonancia: 15 },
    attrPenalty: {},
    unlockCondition: { type: 'legacyEcos', min: 50 },
  },

  // ─── Territórios de Solum (do mapa vivo) ────────────────────────────────────
  axis: {
    id: 'axis',
    label: 'Axis — Arquitetos do Véu',
    floors: 5,
    aiPatterns: ['aggressive', 'support', 'random'],
    attrBoost: { ressonancia: 20 },
    attrPenalty: { agilidade: 10 },
    unlockCondition: { type: 'always' },
  },
  kethara: {
    id: 'kethara',
    label: 'Kethara — Pedra Viva',
    floors: 5,
    aiPatterns: ['defensive', 'defensive', 'aggressive'],
    attrBoost: { resistencia: 25 },
    attrPenalty: { ressonancia: 10 },
    unlockCondition: { type: 'always' },
  },
  mnemos: {
    id: 'mnemos',
    label: 'Mnemos — Véu dos Ecos',
    floors: 6,
    aiPatterns: ['support', 'random', 'defensive'],
    attrBoost: { ressonancia: 25, vontade: 10 },
    attrPenalty: { forca: 15 },
    unlockCondition: { type: 'fusions', min: 5 },
  },
  verdania: {
    id: 'verdania',
    label: 'Verdânia — Jardim Perpétuo',
    floors: 7,
    aiPatterns: ['support', 'defensive', 'defensive'],
    attrBoost: { aura: 25, vontade: 10 },
    attrPenalty: {},
    unlockCondition: { type: 'fusions', min: 10 },
  },
  cinderfall: {
    id: 'cinderfall',
    label: 'Cinderfall — Chama Negra',
    floors: 7,
    aiPatterns: ['aggressive', 'aggressive', 'random'],
    attrBoost: { forca: 25, agilidade: 15 },
    attrPenalty: { resistencia: 10 },
    unlockCondition: { type: 'rarity', rarity: 'raro' },
  },
  limiar: {
    id: 'limiar',
    label: 'Limiar — Confraria do Limiar',
    floors: 8,
    aiPatterns: ['defensive', 'support', 'random'],
    attrBoost: { vontade: 20, resistencia: 15 },
    attrPenalty: { agilidade: 15 },
    unlockCondition: { type: 'rarity', rarity: 'raro' },
  },
  venula: {
    id: 'venula',
    label: 'Vênula — Ordem Carmesim',
    floors: 10,
    aiPatterns: ['aggressive', 'aggressive', 'support'],
    attrBoost: { forca: 20, resistencia: 15 },
    attrPenalty: { vontade: 10 },
    unlockCondition: { type: 'rarity', rarity: 'epico' },
  },
}

// ─── Estado de sessão de dungeon ──────────────────────────────────────────────

export interface DungeonSession {
  biome: BiomeId
  currentFloor: number       // 1–N
  battleIndexInFloor: number // 0–2 (3 batalhas por andar)
  totalBattlesWon: number
  heroHpSnapshot: Record<string, number>  // heroId → HP atual (preservado entre batalhas)
  dailyAttemptsUsed: number
  attemptDateKey: string     // 'YYYY-MM-DD' para reset diário
  fullLoot: boolean          // true nas primeiras 3 tentativas do dia
}

export const BATTLES_PER_FLOOR = 3
export const DAILY_FULL_LOOT_ATTEMPTS = 3
export const HP_RECOVERY_RATIO = 0.3  // 30% do HP máximo entre batalhas

// Cria nova sessão de dungeon
export function createDungeonSession(biome: BiomeId, heroIds: string[]): DungeonSession {
  const today = new Date().toISOString().slice(0, 10)
  return {
    biome,
    currentFloor: 1,
    battleIndexInFloor: 0,
    totalBattlesWon: 0,
    heroHpSnapshot: Object.fromEntries(heroIds.map(id => [id, -1])),  // -1 = usar HP máximo
    dailyAttemptsUsed: 0,
    attemptDateKey: today,
    fullLoot: true,
  }
}

// Verifica se tentativas diárias ainda têm loot completo
export function checkDailyLoot(session: DungeonSession): boolean {
  const today = new Date().toISOString().slice(0, 10)
  if (session.attemptDateKey !== today) return true  // novo dia
  return session.dailyAttemptsUsed < DAILY_FULL_LOOT_ATTEMPTS
}

// Avança para a próxima batalha/andar após vitória
export function advanceAfterVictory(session: DungeonSession): DungeonSession {
  const nextBattleIndex = session.battleIndexInFloor + 1
  const biomeConfig = BIOMES[session.biome]

  if (nextBattleIndex >= BATTLES_PER_FLOOR) {
    // Andar completo → próximo andar
    const nextFloor = session.currentFloor + 1
    const completed = nextFloor > biomeConfig.floors
    return {
      ...session,
      currentFloor: completed ? session.currentFloor : nextFloor,
      battleIndexInFloor: 0,
      totalBattlesWon: session.totalBattlesWon + 1,
    }
  }

  return {
    ...session,
    battleIndexInFloor: nextBattleIndex,
    totalBattlesWon: session.totalBattlesWon + 1,
  }
}

// Verifica se o bioma foi completado
export function isBiomeComplete(session: DungeonSession): boolean {
  const config = BIOMES[session.biome]
  return session.totalBattlesWon >= config.floors * BATTLES_PER_FLOOR
}

// Calcula HP recuperado (30% do max) por herói após batalha
export function calcHpRecovery(
  heroId: string,
  currentHp: number,
  maxHp: number
): number {
  const recovered = Math.round(maxHp * HP_RECOVERY_RATIO)
  return Math.min(maxHp, currentHp + recovered)
}

// ─── Geração de inimigos por andar ────────────────────────────────────────────

// Quantidade de inimigos escala pelo andar (1 + floor/3, máximo 3)
export function enemyCountForFloor(floor: number): number {
  return Math.min(3, 1 + Math.floor(floor / 2))
}

export function generateFloorEnemies(
  biome: BiomeId,
  floor: number,
  battleIndex: number,
  seed: string
): EnemySpec[] {
  const config = BIOMES[biome]
  const count = enemyCountForFloor(floor)

  return Array.from({ length: count }, (_, i) => {
    const enemySeed = `${seed}-f${floor}-b${battleIndex}-e${i}`
    const genome = generateFragmentGenome(biome)

    // Corrupção de bioma (doc 07)
    for (const [attr, bonus] of Object.entries(config.attrBoost)) {
      if (bonus === undefined) continue
      const key = attr as keyof typeof genome.attributes
      genome.attributes[key] = Math.min(100, (genome.attributes[key] ?? 50) + bonus)
    }
    for (const [attr, penalty] of Object.entries(config.attrPenalty)) {
      if (penalty === undefined) continue
      const key = attr as keyof typeof genome.attributes
      genome.attributes[key] = Math.max(1, (genome.attributes[key] ?? 50) - penalty)
    }

    // Escala de poder por andar
    genome.attributes.forca = Math.min(100, genome.attributes.forca + floor * 4)
    genome.attributes.resistencia = Math.min(100, genome.attributes.resistencia + floor * 3)

    const rarity = calculateRarity(genome)
    const id = `${biome}-f${floor}-b${battleIndex}-e${i}`
    const pattern = config.aiPatterns[i] ?? 'aggressive'

    return {
      id,
      name: generateName(genome, enemySeed),
      genome,
      rarity,
      skills: generateSkills(genome, rarity, enemySeed),
      level: Math.max(1, floor),
      aiPattern: pattern,
    }
  })
}

// ─── Verificação de desbloqueio ───────────────────────────────────────────────

export interface UnlockProgress {
  fusionCount: number
  highestRarityOwned: string
  legacyEcos: number
}

export function isBiomeUnlocked(biome: BiomeId, progress: UnlockProgress): boolean {
  const config = BIOMES[biome]
  const cond = config.unlockCondition
  switch (cond.type) {
    case 'always': return true
    case 'fusions': return progress.fusionCount >= cond.min
    case 'rarity': {
      const rarityOrder = ['comum', 'incomum', 'raro', 'epico', 'lendario', 'unico']
      const owned = rarityOrder.indexOf(progress.highestRarityOwned)
      const needed = rarityOrder.indexOf(cond.rarity)
      return owned >= needed
    }
    case 'legacyEcos': return progress.legacyEcos >= cond.min
    default: return false
  }
}
