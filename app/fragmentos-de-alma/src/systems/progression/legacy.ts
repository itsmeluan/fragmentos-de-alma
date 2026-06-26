// Progressão de herói e estado de conta da sessão — ver doc 04.
// Legado de Conta (Tiers, Score, Bônus) → src/systems/genes/eco.ts
//
// Este arquivo contém:
// - LegacyState: estado de pity, habilidades emergentes e injeção ancestral
// - Progressão de herói individual: XP, nível, marco, despertar
// - Sistema de vínculo de herói
// - Sistema de pity de fusão (anti-frustração)
// - Injeção de gene ancestral (semanal, tier 5)

import type { Hero } from '../genes/types'
import type { Eco } from '../genes/eco'
import { getLegacyBonuses, isLegacyTierUnlocked } from '../genes/eco'

// ─── Estado de Conta ──────────────────────────────────────────────────────────
// totalEcos removido: Score de Legado = calcLegacyScore(ecos) em eco.ts,
// persistido em players.legacy_score no banco.

export interface LegacyState {
  retiredHeroIds: string[]
  discoveredEmergentSkillIds: string[]
  fusionBadLuckCounter: number
  ancestorInjectionUsed: boolean
  weeklyResetDateKey: string
}

export function createLegacyState(): LegacyState {
  return {
    retiredHeroIds: [],
    discoveredEmergentSkillIds: [],
    fusionBadLuckCounter: 0,
    ancestorInjectionUsed: false,
    weeklyResetDateKey: mondayDateKey(new Date()),
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

const PITY_THRESHOLD = 10
const PITY_BONUS_PER_STEP = 0.05
const PITY_MAX_BONUS = 0.50

export function incrementFusionBadLuck(legacy: LegacyState): LegacyState {
  return { ...legacy, fusionBadLuckCounter: legacy.fusionBadLuckCounter + 1 }
}

export function resetFusionBadLuck(legacy: LegacyState): LegacyState {
  return { ...legacy, fusionBadLuckCounter: 0 }
}

export function getPityMutationBonus(legacy: LegacyState): number {
  const excess = Math.max(0, legacy.fusionBadLuckCounter - PITY_THRESHOLD)
  return Math.min(PITY_MAX_BONUS, excess * PITY_BONUS_PER_STEP)
}

// Bônus total de mutação = bônus de tier 2 (eco.ts) + pity local
export function getTotalMutationBonus(legacy: LegacyState, ecos: readonly Eco[]): number {
  return getLegacyBonuses(ecos).mutationBonus + getPityMutationBonus(legacy)
}

// ─── Progressão do herói individual ──────────────────────────────────────────

export function xpRequiredForHeroLevel(level: number): number {
  return level * 100
}

export interface HeroMilestone {
  level: number
  name: string
  description: string
}

export const HERO_MILESTONES: HeroMilestone[] = [
  { level: 10, name: 'Primeira Memória',     description: '+1 uso extra de habilidade ativa por batalha.' },
  { level: 20, name: 'Corpo Fortalecido',    description: '+10% de HP máximo.' },
  { level: 30, name: 'Essência Amplificada', description: 'Habilidades passivas têm +15% de efeito.' },
  { level: 40, name: 'Ritmo de Batalha',     description: 'Cooldowns de habilidades ativas -1 turno.' },
  { level: 50, name: 'Despertar',            description: 'Herói desperta — visual especial. Apenas heróis despertos podem criar Ecos.' },
]

export function getMilestonesForLevel(level: number): HeroMilestone[] {
  return HERO_MILESTONES.filter(m => m.level <= level)
}

const AWAKENED_LEVEL = 50

export function isHeroAwakened(hero: Hero): boolean {
  return hero.level >= AWAKENED_LEVEL
}

export interface HeroLevelUpResult {
  hero: Hero
  leveled: boolean
  newMilestone: HeroMilestone | null
}

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

const BOND_STAR_THRESHOLDS = [10, 25, 50, 100, 200] as const

export function heroBondStars(bond: number): 0 | 1 | 2 | 3 | 4 | 5 {
  let stars = 0
  for (const threshold of BOND_STAR_THRESHOLDS) {
    if (bond >= threshold) stars++
    else break
  }
  return stars as 0 | 1 | 2 | 3 | 4 | 5
}

export const BOND_PER_BATTLE = 3
export const BOND_PER_BOSS_KILL = 8

export function addHeroBond(hero: Hero, amount: number): Hero {
  return { ...hero, bond: hero.bond + amount }
}

// ─── Injeção de gene ancestral ────────────────────────────────────────────────

function mondayDateKey(date: Date): string {
  const d = new Date(date)
  const day = d.getUTCDay()
  const diffToMonday = (day === 0 ? -6 : 1 - day)
  d.setUTCDate(d.getUTCDate() + diffToMonday)
  return d.toISOString().slice(0, 10)
}

export function checkWeeklyReset(legacy: LegacyState): LegacyState {
  const currentMonday = mondayDateKey(new Date())
  if (legacy.weeklyResetDateKey === currentMonday) return legacy
  return { ...legacy, ancestorInjectionUsed: false, weeklyResetDateKey: currentMonday }
}

export function canUseAncestorInjection(legacy: LegacyState, ecos: readonly Eco[]): boolean {
  return isLegacyTierUnlocked(ecos, 5) && !legacy.ancestorInjectionUsed
}

export function useAncestorInjection(legacy: LegacyState, ecos: readonly Eco[]): LegacyState {
  if (!canUseAncestorInjection(legacy, ecos)) return legacy
  return { ...legacy, ancestorInjectionUsed: true }
}
