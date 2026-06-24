import { describe, it, expect } from '@jest/globals'
import { generateRewards } from './rewards'
import type { BattleConditions, RewardContext } from './rewards'

// ─── Factories ────────────────────────────────────────────────────────────────

function baseConditions(overrides?: Partial<BattleConditions>): BattleConditions {
  return {
    type: 'common',
    floor: 1,
    turnCount: 8,
    heroesLost: 1,
    ultimatesUsed: true,
    sameOriginTeam: false,
    firstAttempt: false,
    ...overrides,
  }
}

function baseCtx(overrides?: Partial<RewardContext>): RewardContext {
  return {
    recentRewardTypes: [],
    winStreak: 0,
    battlesWithoutRare: 0,
    ...overrides,
  }
}

const rng = () => 0.99  // alta — garante itens opcionais aleatórios

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('generateRewards — tipos de batalha', () => {
  it('batalha comum dá fragmentos comuns', () => {
    const result = generateRewards(baseConditions({ type: 'common' }), baseCtx(), rng)
    expect(result.rewards.some(r => r.type === 'soul_fragments_common')).toBe(true)
  })

  it('batalha elite dá fragmentos raros', () => {
    const result = generateRewards(baseConditions({ type: 'elite', floor: 4 }), baseCtx(), rng)
    expect(result.rewards.some(r => r.type === 'soul_fragments_rare')).toBe(true)
  })

  it('mini-chefe dá cristais de essência', () => {
    const result = generateRewards(baseConditions({ type: 'mini_boss', floor: 5 }), baseCtx(), rng)
    expect(result.rewards.some(r => r.type === 'essence_crystals')).toBe(true)
  })

  it('chefe de bioma dá fragmento de gene', () => {
    const result = generateRewards(baseConditions({ type: 'biome_boss' }), baseCtx(), rng)
    expect(result.rewards.some(r => r.type === 'gene_fragment')).toBe(true)
  })

  it('chefe de evento dá fragmento de habilidade', () => {
    const result = generateRewards(baseConditions({ type: 'event_boss' }), baseCtx(), rng)
    expect(result.rewards.some(r => r.type === 'skill_fragment')).toBe(true)
  })
})

describe('generateRewards — condições bônus', () => {
  it('sem herói perdido → bonus no_heroes_lost + fragmentos extras', () => {
    const result = generateRewards(
      baseConditions({ heroesLost: 0 }),
      baseCtx(),
      rng
    )
    expect(result.bonusMet).toContain('no_heroes_lost')
    const bonusFragments = result.rewards.filter(r => r.isBonus && r.type === 'soul_fragments_common')
    expect(bonusFragments.length).toBeGreaterThan(0)
  })

  it('sem Ultimate → bonus no_ultimates + cristal extra', () => {
    const result = generateRewards(
      baseConditions({ ultimatesUsed: false }),
      baseCtx(),
      rng
    )
    expect(result.bonusMet).toContain('no_ultimates')
    expect(result.rewards.some(r => r.isBonus && r.type === 'essence_crystals')).toBe(true)
  })

  it('menos de 5 turnos → bonus under_5_turns + gene fragment', () => {
    const result = generateRewards(
      baseConditions({ turnCount: 3 }),
      baseCtx(),
      rng
    )
    expect(result.bonusMet).toContain('under_5_turns')
    expect(result.rewards.some(r => r.isBonus && r.type === 'gene_fragment')).toBe(true)
  })

  it('time de mesma ORIGEM → eco bônus', () => {
    const result = generateRewards(
      baseConditions({ sameOriginTeam: true }),
      baseCtx(),
      rng
    )
    expect(result.bonusMet).toContain('same_origin_team')
    expect(result.rewards.some(r => r.type === 'eco_bonus')).toBe(true)
  })

  it('chefe na primeira tentativa → cosmético exclusivo', () => {
    const result = generateRewards(
      baseConditions({ type: 'biome_boss', firstAttempt: true }),
      baseCtx(),
      rng
    )
    expect(result.bonusMet).toContain('boss_first_try')
    expect(result.rewards.some(r => r.isBonus && r.isCosmetic)).toBe(true)
  })

  it('múltiplas condições bônus acumulam', () => {
    const result = generateRewards(
      baseConditions({ heroesLost: 0, ultimatesUsed: false, turnCount: 2 }),
      baseCtx(),
      rng
    )
    expect(result.bonusMet).toContain('no_heroes_lost')
    expect(result.bonusMet).toContain('no_ultimates')
    expect(result.bonusMet).toContain('under_5_turns')
  })
})

describe('generateRewards — multiplicador de sequência', () => {
  it('streak 0 → multiplicador 1', () => {
    const result = generateRewards(baseConditions(), baseCtx({ winStreak: 0 }), rng)
    expect(result.streakMultiplier).toBe(1)
  })

  it('streak 1 → multiplicador 1.2', () => {
    const result = generateRewards(baseConditions(), baseCtx({ winStreak: 1 }), rng)
    expect(result.streakMultiplier).toBe(1.2)
  })

  it('streak 3+ → multiplicador 2 (máximo)', () => {
    const result = generateRewards(baseConditions(), baseCtx({ winStreak: 10 }), rng)
    expect(result.streakMultiplier).toBe(2)
  })

  it('streak aumenta a quantidade de fragmentos', () => {
    const r0 = generateRewards(baseConditions(), baseCtx({ winStreak: 0 }), rng)
    const r3 = generateRewards(baseConditions(), baseCtx({ winStreak: 3 }), rng)
    const frags0 = r0.rewards.find(r => r.type === 'soul_fragments_common')?.amount ?? 0
    const frags3 = r3.rewards.find(r => r.type === 'soul_fragments_common')?.amount ?? 0
    expect(frags3).toBeGreaterThanOrEqual(frags0)
  })

  it('newWinStreak é sempre ctx.winStreak + 1', () => {
    const result = generateRewards(baseConditions(), baseCtx({ winStreak: 4 }), rng)
    expect(result.newWinStreak).toBe(5)
  })
})

describe('generateRewards — anti-repetição de cosméticos', () => {
  it('não repete cosmético já recebido recentemente', () => {
    // O chefe de evento sempre dá cosmetic_title
    const ctx = baseCtx({ recentRewardTypes: ['cosmetic_title'] })
    const result = generateRewards(baseConditions({ type: 'event_boss' }), ctx, rng)
    expect(result.rewards.filter(r => r.type === 'cosmetic_title').length).toBe(0)
  })

  it('fragmentos nunca são filtrados pelo anti-repetição', () => {
    const ctx = baseCtx({ recentRewardTypes: ['soul_fragments_common'] })
    const result = generateRewards(baseConditions({ type: 'common' }), ctx, rng)
    expect(result.rewards.some(r => r.type === 'soul_fragments_common')).toBe(true)
  })
})

describe('generateRewards — pity', () => {
  it('pity ativo após 10 batalhas sem raro', () => {
    const ctx = baseCtx({ battlesWithoutRare: 10 })
    const result = generateRewards(baseConditions({ type: 'common' }), ctx, rng)
    const pityReward = result.rewards.find(r => r.label.includes('Pity'))
    expect(pityReward).toBeDefined()
  })

  it('pity não ativa antes de 10 batalhas', () => {
    const ctx = baseCtx({ battlesWithoutRare: 9 })
    const result = generateRewards(baseConditions({ type: 'common' }), ctx, rng)
    expect(result.rewards.some(r => r.label.includes('Pity'))).toBe(false)
  })

  it('newBattlesWithoutRare reseta quando há recompensa rara', () => {
    const result = generateRewards(baseConditions({ type: 'biome_boss' }), baseCtx({ battlesWithoutRare: 5 }), rng)
    expect(result.newBattlesWithoutRare).toBe(0)
  })

  it('newBattlesWithoutRare incrementa em batalha comum sem raro', () => {
    const ctx = baseCtx({ battlesWithoutRare: 3 })
    const result = generateRewards(baseConditions({ type: 'common' }), ctx, () => 0.01)
    expect(result.newBattlesWithoutRare).toBe(4)
  })
})

describe('generateRewards — invariantes', () => {
  it('resultado sempre tem pelo menos 1 recompensa', () => {
    const result = generateRewards(baseConditions(), baseCtx(), rng)
    expect(result.rewards.length).toBeGreaterThan(0)
  })

  it('quantidade de fragmentos é sempre positiva', () => {
    const result = generateRewards(baseConditions(), baseCtx(), rng)
    for (const r of result.rewards) {
      expect(r.amount).toBeGreaterThan(0)
    }
  })

  it('recompensas cosméticas têm amount 1', () => {
    const result = generateRewards(baseConditions({ type: 'event_boss' }), baseCtx(), rng)
    for (const r of result.rewards.filter(r => r.isCosmetic)) {
      expect(r.amount).toBe(1)
    }
  })
})
