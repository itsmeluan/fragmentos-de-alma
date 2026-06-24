// Sistema de Legado da Conta — ver doc 04 (loop de progressão)
// Progressão de longo prazo: Ecos, Árvore de Legado, pity de fusão, XP e vínculo de herói.
// Lógica pura: sem estado interno, sem efeitos colaterais.

import type { Hero, Rarity } from '../genes/types'

// ─── Árvore de Legado (doc 04 — 5 tiers) ────────────────────────────────────

export type LegacyEffectType =
  | 'rare_drop_bonus'      // +% chance de fragmento raro
  | 'mutation_bonus'       // +% chance de mutação positiva em fusões
  | 'extra_combat_slot'    // novo slot de herói no time de combate
  | 'biome_unlock'         // acesso ao Vazio Fragmentado
  | 'ancestor_injection'   // injeção de gene ancestral (1× por semana)

export interface LegacyTier {
  tier: 1 | 2 | 3 | 4 | 5
  ecosRequired: number
  name: string
  description: string
  effectType: LegacyEffectType
  effectValue?: number  // para bônus numéricos
}

export const LEGACY_TIERS: LegacyTier[] = [
  {
    tier: 1,
    ecosRequired: 10,
    name: 'Memória Persistente',
    description: '+5% de chance de obter fragmentos raros em batalha.',
    effectType: 'rare_drop_bonus',
    effectValue: 0.05,
  },
  {
    tier: 2,
    ecosRequired: 25,
    name: 'Ressonância Alquímica',
    description: 'Fusões têm +3% de chance de mutação positiva.',
    effectType: 'mutation_bonus',
    effectValue: 0.03,
  },
  {
    tier: 3,
    ecosRequired: 50,
    name: 'Equipe Expandida',
    description: 'Novo slot de herói disponível na equipe de combate.',
    effectType: 'extra_combat_slot',
  },
  {
    tier: 4,
    ecosRequired: 100,
    name: 'Portal do Vazio',
    description: 'Acesso ao bioma "Vazio Fragmentado" desbloqueado.',
    effectType: 'biome_unlock',
  },
  {
    tier: 5,
    ecosRequired: 200,
    name: 'Memória do Ancestral',
    description: 'Injetar 1 gene de ancestral por semana em uma fusão futura.',
    effectType: 'ancestor_injection',
    effectValue: 1,
  },
]

// ─── Estado de Legado da Conta ────────────────────────────────────────────────

export interface LegacyState {
  totalEcos: number                   // Ecos acumulados (nunca reduzem — base para unlock)
  retiredHeroIds: string[]            // heróis aposentados
  discoveredEmergentSkillIds: string[]// habilidades emergentes descobertas pela primeira vez
  fusionBadLuckCounter: number        // fusões sem mutação positiva (sistema de pity)
  ancestorInjectionUsed: boolean      // se a injeção semanal já foi usada
  weeklyResetDateKey: string          // 'YYYY-MM-DD' da última segunda-feira de reset
}

export function createLegacyState(): LegacyState {
  return {
    totalEcos: 0,
    retiredHeroIds: [],
    discoveredEmergentSkillIds: [],
    fusionBadLuckCounter: 0,
    ancestorInjectionUsed: false,
    weeklyResetDateKey: mondayDateKey(new Date()),
  }
}

// ─── Ecos por aposentadoria de herói ─────────────────────────────────────────

const RARITY_ECOS: Record<Rarity, number> = {
  comum:    1,
  incomum:  2,
  raro:     3,
  epico:    5,
  lendario: 8,
  unico:    15,
}

const AWAKENED_LEVEL = 50     // nível de "desperto" — gera Ecos extras
const AWAKENED_ECO_BONUS = 5  // bônus de Ecos para heróis despertos

// Calcula quantos Ecos um herói vale na aposentadoria
export function calcRetirementEcos(hero: Hero): number {
  const rarityEcos = RARITY_ECOS[hero.rarity] ?? 1
  const levelBonus = Math.floor(hero.level / 10)
  const awakenedBonus = hero.level >= AWAKENED_LEVEL ? AWAKENED_ECO_BONUS : 0
  return rarityEcos + levelBonus + awakenedBonus
}

// Aposenta um herói: acumula Ecos e registra o id
export function retireHero(
  legacy: LegacyState,
  hero: Hero,
): { state: LegacyState; ecosEarned: number } {
  if (legacy.retiredHeroIds.includes(hero.id)) {
    return { state: legacy, ecosEarned: 0 }  // já aposentado
  }
  const ecosEarned = calcRetirementEcos(hero)
  const state: LegacyState = {
    ...legacy,
    totalEcos: legacy.totalEcos + ecosEarned,
    retiredHeroIds: [...legacy.retiredHeroIds, hero.id],
  }
  return { state, ecosEarned }
}

// ─── Tiers ativos ─────────────────────────────────────────────────────────────

export function getActiveTiers(legacy: LegacyState): LegacyTier[] {
  return LEGACY_TIERS.filter(t => legacy.totalEcos >= t.ecosRequired)
}

export function isTierUnlocked(legacy: LegacyState, tier: 1 | 2 | 3 | 4 | 5): boolean {
  const t = LEGACY_TIERS.find(lt => lt.tier === tier)
  return t ? legacy.totalEcos >= t.ecosRequired : false
}

// ─── Bônus agregados ativos ───────────────────────────────────────────────────

export interface LegacyBonuses {
  rareDropBonus: number      // ex: 0.05 (+5%)
  mutationBonus: number      // ex: 0.03 (+3%)
  hasExtraCombatSlot: boolean
  hasVoidBiome: boolean
  hasAncestorInjection: boolean
  ancestorInjectionUsed: boolean
}

export function getLegacyBonuses(legacy: LegacyState): LegacyBonuses {
  const tiers = getActiveTiers(legacy)
  const hasType = (t: LegacyEffectType) => tiers.some(lt => lt.effectType === t)
  return {
    rareDropBonus:          tiers.find(t => t.effectType === 'rare_drop_bonus')?.effectValue ?? 0,
    mutationBonus:          tiers.find(t => t.effectType === 'mutation_bonus')?.effectValue ?? 0,
    hasExtraCombatSlot:     hasType('extra_combat_slot'),
    hasVoidBiome:           hasType('biome_unlock'),
    hasAncestorInjection:   hasType('ancestor_injection'),
    ancestorInjectionUsed:  legacy.ancestorInjectionUsed,
  }
}

// ─── Registro de descobertas emergentes ──────────────────────────────────────

export function recordEmergentDiscovery(legacy: LegacyState, skillId: string): LegacyState {
  if (legacy.discoveredEmergentSkillIds.includes(skillId)) return legacy
  return { ...legacy, discoveredEmergentSkillIds: [...legacy.discoveredEmergentSkillIds, skillId] }
}

export function isFirstDiscovery(legacy: LegacyState, skillId: string): boolean {
  return !legacy.discoveredEmergentSkillIds.includes(skillId)
}

// ─── Sistema de pity de fusão (anti-frustração) ───────────────────────────────

const PITY_THRESHOLD = 10    // fusões sem mutação antes de ativar pity
const PITY_BONUS_PER_STEP = 0.05  // +5% por fusão além do limiar
const PITY_MAX_BONUS = 0.50  // cap de bônus de pity em 50%

export function incrementFusionBadLuck(legacy: LegacyState): LegacyState {
  return { ...legacy, fusionBadLuckCounter: legacy.fusionBadLuckCounter + 1 }
}

export function resetFusionBadLuck(legacy: LegacyState): LegacyState {
  return { ...legacy, fusionBadLuckCounter: 0 }
}

// Retorna bônus de pity de mutação (0.0 a PITY_MAX_BONUS)
export function getPityMutationBonus(legacy: LegacyState): number {
  const excess = Math.max(0, legacy.fusionBadLuckCounter - PITY_THRESHOLD)
  return Math.min(PITY_MAX_BONUS, excess * PITY_BONUS_PER_STEP)
}

// Total de bônus de mutação = Tier 2 + pity (jogador não vê o pity)
export function getTotalMutationBonus(legacy: LegacyState): number {
  const bonuses = getLegacyBonuses(legacy)
  return bonuses.mutationBonus + getPityMutationBonus(legacy)
}

// ─── Progressão do herói individual ──────────────────────────────────────────

// XP necessário para avançar do nível N para N+1 (linear, simples)
export function xpRequiredForHeroLevel(level: number): number {
  return level * 100
}

// Níveis-marco que desbloqueiam bônus (10, 20, 30, 40, 50)
export interface HeroMilestone {
  level: number
  name: string
  description: string  // bônus de gameplay aplicado pelo engine
}

export const HERO_MILESTONES: HeroMilestone[] = [
  { level: 10, name: 'Primeira Memória',   description: '+1 uso extra de habilidade ativa por batalha.' },
  { level: 20, name: 'Corpo Fortalecido',  description: '+10% de HP máximo.' },
  { level: 30, name: 'Essência Amplificada', description: 'Habilidades passivas têm +15% de efeito.' },
  { level: 40, name: 'Ritmo de Batalha',   description: 'Cooldowns de habilidades ativas -1 turno.' },
  { level: 50, name: 'Despertar',          description: 'Herói desperta — visual especial. Aposentadoria gera Ecos maiores.' },
]

export function getMilestonesForLevel(level: number): HeroMilestone[] {
  return HERO_MILESTONES.filter(m => m.level <= level)
}

export function isHeroAwakened(hero: Hero): boolean {
  return hero.level >= AWAKENED_LEVEL
}

export interface HeroLevelUpResult {
  hero: Hero
  leveled: boolean
  newMilestone: HeroMilestone | null
}

// Aplica XP ao herói e processa level-up(s) em cascata (cap: nível 50)
export function addHeroBattleXp(hero: Hero, xpGained: number): HeroLevelUpResult {
  let h: Hero = { ...hero, xp: hero.xp + xpGained }
  let leveled = false
  let newMilestone: HeroMilestone | null = null

  while (h.level < AWAKENED_LEVEL && h.xp >= xpRequiredForHeroLevel(h.level)) {
    h = { ...h, xp: h.xp - xpRequiredForHeroLevel(h.level), level: h.level + 1 }
    leveled = true

    const milestone = HERO_MILESTONES.find(m => m.level === h.level)
    if (milestone) newMilestone = milestone
  }

  return { hero: h, leveled, newMilestone }
}

// ─── Vínculo do herói ─────────────────────────────────────────────────────────

// Limites de pontos para cada nível de estrela (1–5)
const BOND_STAR_THRESHOLDS = [10, 25, 50, 100, 200] as const

export function heroBondStars(bond: number): 0 | 1 | 2 | 3 | 4 | 5 {
  let stars = 0
  for (const threshold of BOND_STAR_THRESHOLDS) {
    if (bond >= threshold) stars++
    else break
  }
  return stars as 0 | 1 | 2 | 3 | 4 | 5
}

// Pontos de vínculo ganhos por batalha (vitória)
export const BOND_PER_BATTLE = 3
// Pontos extras quando o herói participou de vitória sobre chefe
export const BOND_PER_BOSS_KILL = 8

export function addHeroBond(hero: Hero, amount: number): Hero {
  return { ...hero, bond: hero.bond + amount }
}

// ─── Injeção de gene ancestral ────────────────────────────────────────────────

function mondayDateKey(date: Date): string {
  const d = new Date(date)
  const day = d.getUTCDay()            // 0=dom, 1=seg...
  const diffToMonday = (day === 0 ? -6 : 1 - day)
  d.setUTCDate(d.getUTCDate() + diffToMonday)
  return d.toISOString().slice(0, 10)
}

// Verifica se houve reset semanal (segunda-feira de uma nova semana)
export function checkWeeklyReset(legacy: LegacyState): LegacyState {
  const currentMonday = mondayDateKey(new Date())
  if (legacy.weeklyResetDateKey === currentMonday) return legacy
  return { ...legacy, ancestorInjectionUsed: false, weeklyResetDateKey: currentMonday }
}

export function useAncestorInjection(legacy: LegacyState): LegacyState {
  if (!isTierUnlocked(legacy, 5) || legacy.ancestorInjectionUsed) return legacy
  return { ...legacy, ancestorInjectionUsed: true }
}

export function canUseAncestorInjection(legacy: LegacyState): boolean {
  return isTierUnlocked(legacy, 5) && !legacy.ancestorInjectionUsed
}
