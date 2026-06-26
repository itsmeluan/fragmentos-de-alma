import type { HeroSkills, Skill } from '../skills/types'
import type { AttributeGenes, Genome, MutationGene, Rarity } from './types'

export const RARITY_ORDER: Rarity[] = ['comum', 'incomum', 'raro', 'epico', 'lendario', 'unico']

export type EcoSkillRecord = Record<string, Skill>

export interface Eco {
  id: string
  player_id: string
  created_at: string
  signature_origin: string
  signature_affinity: string
  signature_core: string
  signature_mutations: string[]
  signature_key: string
  best_genes: Record<string, number>
  best_skills: EcoSkillRecord
  rarity: Rarity
  absorption_count: number
}

export interface EcoAbsorptionPreview {
  eco: Eco
  changes: Record<string, number>
  skillChanges: Record<string, string>
  willAbsorb: boolean
}

export type EcoCreateResult =
  | { ok: true; eco: Eco; absorbed: boolean }
  | { ok: false; error: string }

export type ExtractCrystalsResult =
  | { ok: true; crystals: number }
  | { ok: false; error: string }

export const TRANSMUTATION_TIER_UP_CHANCE: Record<number, Partial<Record<Rarity, number>>> = {
  1: { comum: 0.70, incomum: 0.50, raro: 0.30, epico: 0.15 },
  2: { comum: 0.85, incomum: 0.65, raro: 0.45, epico: 0.25 },
  3: { comum: 0.95, incomum: 0.80, raro: 0.60, epico: 0.40 },
}

export const CRYSTAL_EXTRACTION_YIELD: Record<Rarity, number> = {
  comum: 1,
  incomum: 3,
  raro: 8,
  epico: 20,
  lendario: 50,
  unico: 120,
}

export const TRANSMUTATION_FRAGMENT_COST: Record<Rarity, number> = {
  comum: 100,
  incomum: 300,
  raro: 800,
  epico: 2000,
  lendario: 5000,
  unico: 5000,
}

export const TRANSMUTATION_CRYSTAL_COST: Record<Rarity, number> = {
  comum: 1,
  incomum: 3,
  raro: 8,
  epico: 20,
  lendario: 50,
  unico: 120,
}

export const ECO_LEGACY_WEIGHT: Record<Rarity, number> = {
  comum: 1,
  incomum: 3,
  raro: 8,
  epico: 20,
  lendario: 50,
  unico: 150,
}

export const KAEL_LEGACY_TIER_BONUS: Record<number, number> = {
  0: 0.00,
  1: 0.02,
  2: 0.04,
  3: 0.06,
  4: 0.08,
  5: 0.10,
}

export const LEGACY_SCORE_THRESHOLDS = [10, 40, 100, 250, 600] as const

export function buildSignatureKey(
  origin: string,
  affinity: string,
  core: string,
  mutations: readonly string[],
): string {
  return `${origin}:${affinity}:${core}:${[...mutations].sort().join(',')}`
}

export function calcLegacyScore(ecos: readonly Eco[]): number {
  const uniqueBySignature = new Map<string, Eco>()
  for (const eco of ecos) {
    if (!uniqueBySignature.has(eco.signature_key)) {
      uniqueBySignature.set(eco.signature_key, eco)
    }
  }

  return [...uniqueBySignature.values()].reduce(
    (sum, eco) => sum + ECO_LEGACY_WEIGHT[eco.rarity],
    0,
  )
}

export function getLegacyTier(score: number): number {
  let tier = 0
  for (const threshold of LEGACY_SCORE_THRESHOLDS) {
    if (score >= threshold) tier++
    else break
  }
  return tier
}

export function mergeGenes(
  existing: Record<string, number>,
  incoming: Record<string, number>,
): Record<string, number> {
  const merged: Record<string, number> = { ...existing }
  for (const [key, value] of Object.entries(incoming)) {
    merged[key] = Math.min(Math.max(existing[key] ?? 0, value), 120)
  }
  return merged
}

export function flattenSkills(skills: HeroSkills): EcoSkillRecord {
  const entries: Array<[string, Skill]> = []

  skills.active.forEach((skill, index) => entries.push([`active_${index}`, skill]))
  skills.passive.forEach((skill, index) => entries.push([`passive_${index}`, skill]))
  skills.unique.forEach((skill, index) => entries.push([`unique_${index}`, skill]))
  skills.emergent.forEach((skill, index) => entries.push([`emergent_${index}`, skill]))

  return Object.fromEntries(entries)
}

export function mergeSkills(
  existing: EcoSkillRecord,
  incoming: EcoSkillRecord,
): EcoSkillRecord {
  const merged: EcoSkillRecord = { ...existing }
  for (const [slot, skill] of Object.entries(incoming)) {
    const current = merged[slot]
    if (!current || skill.effect.power > current.effect.power) {
      merged[slot] = skill
    }
  }
  return merged
}

export function previewAbsorption(
  eco: Eco,
  heroGenes: Record<string, number>,
  heroSkills: EcoSkillRecord = {},
): EcoAbsorptionPreview {
  const mergedGenes = mergeGenes(eco.best_genes, heroGenes)
  const mergedSkills = mergeSkills(eco.best_skills, heroSkills)

  const changes: Record<string, number> = {}
  for (const [key, value] of Object.entries(mergedGenes)) {
    if (value !== eco.best_genes[key]) changes[key] = value
  }

  const skillChanges: Record<string, string> = {}
  for (const [slot, skill] of Object.entries(mergedSkills)) {
    if (skill.id !== eco.best_skills[slot]?.id) {
      skillChanges[slot] = skill.name
    }
  }

  return {
    eco,
    changes,
    skillChanges,
    willAbsorb: Object.keys(changes).length > 0 || Object.keys(skillChanges).length > 0,
  }
}

export function getHigherRarity(a: Rarity, b: Rarity): Rarity {
  return RARITY_ORDER.indexOf(a) >= RARITY_ORDER.indexOf(b) ? a : b
}

export function calcEcoTransmutationCost(a: Eco, b: Eco): { fragments: number; crystals: number; rarity: Rarity } {
  const rarity = getHigherRarity(a.rarity, b.rarity)
  return {
    fragments: TRANSMUTATION_FRAGMENT_COST[rarity],
    crystals: TRANSMUTATION_CRYSTAL_COST[rarity],
    rarity,
  }
}

export function ecoToGenome(eco: Eco): Genome {
  const gene = (key: keyof AttributeGenes): number => eco.best_genes[key] ?? 50
  return {
    essence: {
      origin: eco.signature_origin as Genome['essence']['origin'],
      affinity: eco.signature_affinity as Genome['essence']['affinity'],
      core: eco.signature_core as Genome['essence']['core'],
    },
    attributes: {
      forca: gene('forca'),
      ressonancia: gene('ressonancia'),
      resistencia: gene('resistencia'),
      agilidade: gene('agilidade'),
      vontade: gene('vontade'),
      aura: gene('aura'),
    },
    mutations: eco.signature_mutations as MutationGene[],
  }
}

export function canUseCatalystForRarity(catalystRarity: Rarity, parentRarity: Rarity): boolean {
  return RARITY_ORDER.indexOf(catalystRarity) >= RARITY_ORDER.indexOf(parentRarity)
}

export function getTierUpChance(
  catalystCount: number,
  parentRarity: Rarity,
  legacyScore: number,
): number {
  if (catalystCount <= 0) return 0

  const base = TRANSMUTATION_TIER_UP_CHANCE[catalystCount]?.[parentRarity] ?? 0
  const bonus = KAEL_LEGACY_TIER_BONUS[getLegacyTier(legacyScore)] ?? 0
  return Math.min(Number((base + bonus).toFixed(2)), 0.99)
}

// ─── Legado da Conta: Tiers e Bônus por Score (doc 04) ───────────────────────
// Sistema canônico de progressão de longa duração.
// Score = soma ponderada de Ecos únicos por signature_key × ECO_LEGACY_WEIGHT.
// Thresholds em LEGACY_SCORE_THRESHOLDS = [10, 40, 100, 250, 600].

export type LegacyEffectType =
  | 'rare_drop_bonus'
  | 'mutation_bonus'
  | 'extra_combat_slot'
  | 'biome_unlock'
  | 'ancestor_injection'

export interface LegacyTier {
  tier: 1 | 2 | 3 | 4 | 5
  scoreRequired: number
  name: string
  description: string
  effectType: LegacyEffectType
  effectValue?: number
}

export const LEGACY_TIERS: LegacyTier[] = [
  {
    tier: 1,
    scoreRequired: LEGACY_SCORE_THRESHOLDS[0],
    name: 'Memória Persistente',
    description: '+5% de chance de obter fragmentos raros em batalha.',
    effectType: 'rare_drop_bonus',
    effectValue: 0.05,
  },
  {
    tier: 2,
    scoreRequired: LEGACY_SCORE_THRESHOLDS[1],
    name: 'Ressonância Alquímica',
    description: 'Fusões têm +3% de chance de mutação positiva.',
    effectType: 'mutation_bonus',
    effectValue: 0.03,
  },
  {
    tier: 3,
    scoreRequired: LEGACY_SCORE_THRESHOLDS[2],
    name: 'Equipe Expandida',
    description: 'Novo slot de herói disponível na equipe de combate.',
    effectType: 'extra_combat_slot',
  },
  {
    tier: 4,
    scoreRequired: LEGACY_SCORE_THRESHOLDS[3],
    name: 'Portal do Vazio',
    description: 'Acesso ao bioma "Vazio Fragmentado" desbloqueado.',
    effectType: 'biome_unlock',
  },
  {
    tier: 5,
    scoreRequired: LEGACY_SCORE_THRESHOLDS[4],
    name: 'Memória do Ancestral',
    description: 'Injetar 1 gene de ancestral por semana em uma fusão futura.',
    effectType: 'ancestor_injection',
    effectValue: 1,
  },
]

export interface LegacyBonuses {
  rareDropBonus: number
  mutationBonus: number
  hasExtraCombatSlot: boolean
  hasVoidBiome: boolean
  hasAncestorInjection: boolean
}

export function getActiveLegacyTiers(ecos: readonly Eco[]): LegacyTier[] {
  const score = calcLegacyScore(ecos)
  return LEGACY_TIERS.filter(t => score >= t.scoreRequired)
}

export function isLegacyTierUnlocked(ecos: readonly Eco[], tier: 1 | 2 | 3 | 4 | 5): boolean {
  const t = LEGACY_TIERS.find(lt => lt.tier === tier)
  return t ? calcLegacyScore(ecos) >= t.scoreRequired : false
}

export function getLegacyBonuses(ecos: readonly Eco[]): LegacyBonuses {
  const tiers = getActiveLegacyTiers(ecos)
  const hasType = (t: LegacyEffectType) => tiers.some(lt => lt.effectType === t)
  return {
    rareDropBonus:        tiers.find(t => t.effectType === 'rare_drop_bonus')?.effectValue ?? 0,
    mutationBonus:        tiers.find(t => t.effectType === 'mutation_bonus')?.effectValue ?? 0,
    hasExtraCombatSlot:   hasType('extra_combat_slot'),
    hasVoidBiome:         hasType('biome_unlock'),
    hasAncestorInjection: hasType('ancestor_injection'),
  }
}
