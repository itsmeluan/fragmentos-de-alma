// Sistema de recompensas pós-batalha — ver doc 07 (Parte 4)
// Função pura: recebe contexto e retorna recompensas sem efeitos colaterais.

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export type BattleType = 'common' | 'elite' | 'mini_boss' | 'biome_boss' | 'event_boss'

export type BonusConditionId =
  | 'no_heroes_lost'    // venceu sem perder herói → +50% fragmentos
  | 'no_ultimates'      // venceu sem usar Ultimate → +1 Cristal
  | 'under_5_turns'     // venceu em <5 turnos → gene fragment garantido
  | 'same_origin_team'  // time de mesma ORIGEM → eco bônus
  | 'boss_first_try'    // chefe vencido na primeira tentativa → cosmético

export type RewardType =
  | 'soul_fragments_common'
  | 'soul_fragments_rare'
  | 'essence_crystals'
  | 'gene_fragment'
  | 'skill_fragment'
  | 'eco_bonus'
  | 'cosmetic_fusion_theme'
  | 'cosmetic_aura_effect'
  | 'cosmetic_hero_frame'
  | 'cosmetic_title'
  | 'cosmetic_ui_theme'
  | 'cosmetic_battle_track'

export interface Reward {
  type: RewardType
  amount: number       // fragmentos/cristais; 1 para cosméticos e únicos
  label: string
  isBonus: boolean     // oriundo de condição especial
  isCosmetic: boolean
}

// Condições da batalha que o chamador preenche
export interface BattleConditions {
  type: BattleType
  floor: number          // andar (1–N)
  turnCount: number      // quantos turnos durou a batalha
  heroesLost: number     // heróis que morreram e não reviveram
  ultimatesUsed: boolean // algum Ultimate foi usado
  sameOriginTeam: boolean
  firstAttempt: boolean  // primeira tentativa nesse chefe
}

// Contexto do jogador acumulado entre batalhas
export interface RewardContext {
  recentRewardTypes: RewardType[]  // últimas 5 — anti-repetição
  winStreak: number                // vitórias consecutivas atuais (zera na derrota)
  battlesWithoutRare: number       // quantas batalhas sem raro (pity counter)
}

export interface RewardResult {
  rewards: Reward[]
  bonusMet: BonusConditionId[]
  streakMultiplier: number
  newWinStreak: number
  newBattlesWithoutRare: number
}

// ─── Constantes de balanceamento ─────────────────────────────────────────────

const STREAK_MULTIPLIERS = [1, 1.2, 1.5, 2] // 0, 1, 2, 3+ vitórias

// Limiar de pity: 10 batalhas sem raro → próxima garante incomum+
const PITY_THRESHOLD = 10

// ─── Helpers ─────────────────────────────────────────────────────────────────

function streakMult(streak: number): number {
  return STREAK_MULTIPLIERS[Math.min(streak, STREAK_MULTIPLIERS.length - 1)]
}

function fragmentLabel(amount: number, rare: boolean): string {
  return `${amount}x Fragmento${amount > 1 ? 's' : ''} de Alma ${rare ? 'Raro' : 'Comum'}${amount > 1 ? 's' : ''}`
}

function reward(type: RewardType, amount: number, label: string, isBonus = false): Reward {
  const cosmeticTypes: RewardType[] = [
    'cosmetic_fusion_theme', 'cosmetic_aura_effect', 'cosmetic_hero_frame',
    'cosmetic_title', 'cosmetic_ui_theme', 'cosmetic_battle_track',
  ]
  return { type, amount, label, isBonus, isCosmetic: cosmeticTypes.includes(type) }
}

// Remove tipos que já apareceram recentemente — somente para cosméticos e únicos
function filterRecentRewards(rewards: Reward[], recentTypes: RewardType[]): Reward[] {
  return rewards.filter(r => !r.isCosmetic || !recentTypes.includes(r.type))
}

// ─── Recompensas base por tipo de batalha ────────────────────────────────────

function baseRewards(conditions: BattleConditions, mult: number, rng: () => number): Reward[] {
  const { type, floor } = conditions
  const baseFragments = Math.round((5 + floor * 2) * mult)

  switch (type) {
    case 'common':
      return [reward('soul_fragments_common', baseFragments, fragmentLabel(baseFragments, false))]

    case 'elite': {
      const fragments = Math.round(baseFragments * 1.5)
      const rewards: Reward[] = [
        reward('soul_fragments_rare', fragments, fragmentLabel(fragments, true)),
      ]
      if (rng() < 0.4) {
        rewards.push(reward('cosmetic_hero_frame', 1, 'Borda de Herói'))
      }
      return rewards
    }

    case 'mini_boss': {
      const crystals = Math.round(1 + floor / 5)
      const fragments = Math.round(baseFragments * 2)
      return [
        reward('essence_crystals', crystals, `${crystals}x Cristal de Essência`),
        reward('soul_fragments_rare', fragments, fragmentLabel(fragments, true)),
        ...(rng() < 0.5 ? [reward('cosmetic_aura_effect', 1, 'Efeito de Aura')] : []),
      ]
    }

    case 'biome_boss':
      return [
        reward('gene_fragment', 1, 'Fragmento de Gene Específico'),
        reward('essence_crystals', 2, '2x Cristal de Essência'),
        reward('cosmetic_fusion_theme', 1, 'Tema de Fusão'),
      ]

    case 'event_boss':
      return [
        reward('skill_fragment', 1, 'Fragmento de Habilidade'),
        reward('essence_crystals', 3, '3x Cristal de Essência'),
        reward('cosmetic_title', 1, 'Título de Conta'),
        reward('cosmetic_battle_track', 1, 'Trilha Sonora de Batalha'),
      ]
  }
}

// ─── Condições bônus ─────────────────────────────────────────────────────────

function bonusRewards(
  conditions: BattleConditions,
  base: Reward[]
): { bonusMet: BonusConditionId[]; bonusRewards: Reward[] } {
  const met: BonusConditionId[] = []
  const extras: Reward[] = []

  // Sem herói perdido → +50% nos fragmentos
  if (conditions.heroesLost === 0) {
    met.push('no_heroes_lost')
    for (const r of base) {
      if (r.type === 'soul_fragments_common' || r.type === 'soul_fragments_rare') {
        const bonus = Math.round(r.amount * 0.5)
        extras.push(reward(r.type, bonus, `Bônus Sobrevivente: +${bonus}`, true))
      }
    }
  }

  // Sem Ultimate → +1 Cristal
  if (!conditions.ultimatesUsed) {
    met.push('no_ultimates')
    extras.push(reward('essence_crystals', 1, 'Bônus Disciplina: +1 Cristal', true))
  }

  // Menos de 5 turnos → gene fragment garantido
  if (conditions.turnCount < 5) {
    met.push('under_5_turns')
    extras.push(reward('gene_fragment', 1, 'Bônus Velocidade: Fragmento de Gene', true))
  }

  // Time de mesma ORIGEM → eco bônus
  if (conditions.sameOriginTeam) {
    met.push('same_origin_team')
    extras.push(reward('eco_bonus', 1, 'Eco Bônus: Afinidade de Origem', true))
  }

  // Chefe na primeira tentativa → cosmético exclusivo
  if (conditions.firstAttempt && (conditions.type === 'biome_boss' || conditions.type === 'event_boss')) {
    met.push('boss_first_try')
    extras.push(reward('cosmetic_hero_frame', 1, 'Quadro de Primeira Vitória (exclusivo)', true))
  }

  return { bonusMet: met, bonusRewards: extras }
}

// ─── Pity ─────────────────────────────────────────────────────────────────────

function applyPity(
  rewards: Reward[],
  battlesWithoutRare: number
): { rewards: Reward[]; triggered: boolean } {
  const hasRare = rewards.some(r =>
    r.type !== 'soul_fragments_common' && r.type !== 'eco_bonus'
  )
  if (!hasRare && battlesWithoutRare >= PITY_THRESHOLD) {
    return {
      rewards: [...rewards, reward('soul_fragments_rare', 10, 'Pity: 10 Fragmentos Raros')],
      triggered: true,
    }
  }
  return { rewards, triggered: false }
}

// ─── Entrada pública ──────────────────────────────────────────────────────────

export function generateRewards(
  conditions: BattleConditions,
  ctx: RewardContext,
  rng: () => number
): RewardResult {
  const mult = streakMult(ctx.winStreak)

  // Recompensas base
  let rewards = baseRewards(conditions, mult, rng)

  // Condições bônus
  const { bonusMet, bonusRewards: extras } = bonusRewards(conditions, rewards)
  rewards = [...rewards, ...extras]

  // Anti-repetição de cosméticos
  rewards = filterRecentRewards(rewards, ctx.recentRewardTypes)

  // Pity
  const hasRare = rewards.some(r =>
    r.type !== 'soul_fragments_common' && r.type !== 'eco_bonus' && !r.isCosmetic
  )
  const { rewards: withPity } = applyPity(rewards, ctx.battlesWithoutRare)
  rewards = withPity

  const newBattlesWithoutRare = hasRare ? 0 : ctx.battlesWithoutRare + 1

  return {
    rewards,
    bonusMet,
    streakMultiplier: mult,
    newWinStreak: ctx.winStreak + 1,
    newBattlesWithoutRare,
  }
}
