import { describe, expect, it } from '@jest/globals'
import type { HeroSkills, Skill } from '../skills/types'
import type { Eco } from './eco'
import {
  buildSignatureKey,
  calcLegacyScore,
  calcEcoTransmutationCost,
  canUseCatalystForRarity,
  ecoToGenome,
  flattenSkills,
  getActiveLegacyTiers,
  getLegacyBonuses,
  getLegacyTier,
  getTierUpChance,
  isLegacyTierUnlocked,
  LEGACY_TIERS,
  mergeGenes,
  mergeSkills,
  previewAbsorption,
} from './eco'

function skill(id: string, power: number, name = id): Skill {
  return {
    id,
    name,
    trigger: { id: 'T01', label: 'Ao atacar' },
    effect: { id: 'E01', label: 'causa dano físico', power },
    condition: { id: 'C01', label: 'sempre' },
    isPassive: false,
    isUnique: false,
    isEmergent: false,
    sourceGenes: [],
  }
}

function eco(overrides: Partial<Eco> = {}): Eco {
  return {
    id: 'eco-1',
    player_id: 'player-1',
    created_at: '2026-06-24T00:00:00.000Z',
    signature_origin: 'Abissal',
    signature_affinity: 'Fogo',
    signature_core: 'Guardião',
    signature_mutations: [],
    signature_key: 'Abissal:Fogo:Guardião:',
    best_genes: { forca: 60, aura: 50 },
    best_skills: { active_0: skill('old', 30, 'Antiga') },
    rarity: 'comum',
    absorption_count: 1,
    ...overrides,
  }
}

describe('buildSignatureKey', () => {
  it('ordena mutações para assinatura determinística', () => {
    expect(buildSignatureKey('Abissal', 'Fogo', 'Guardião', ['CAOS', 'INVERSO'])).toBe(
      buildSignatureKey('Abissal', 'Fogo', 'Guardião', ['INVERSO', 'CAOS']),
    )
  })

  it('mantém o separador final quando não há mutações', () => {
    expect(buildSignatureKey('Celestial', 'Luz', 'Arauto', [])).toBe('Celestial:Luz:Arauto:')
  })
})

describe('legado de Ecos', () => {
  it('calcula score por Ecos únicos', () => {
    const ecos = [
      eco({ id: '1', signature_key: 'a', rarity: 'comum' }),
      eco({ id: '2', signature_key: 'b', rarity: 'raro' }),
      eco({ id: '3', signature_key: 'a', rarity: 'lendario' }),
    ]

    expect(calcLegacyScore(ecos)).toBe(9)
  })

  it('calcula tier pelos thresholds', () => {
    expect(getLegacyTier(0)).toBe(0)
    expect(getLegacyTier(10)).toBe(1)
    expect(getLegacyTier(40)).toBe(2)
    expect(getLegacyTier(100)).toBe(3)
    expect(getLegacyTier(250)).toBe(4)
    expect(getLegacyTier(600)).toBe(5)
  })
})

describe('absorção de Eco', () => {
  it('mescla genes mantendo o maior valor e cap 120', () => {
    expect(mergeGenes({ forca: 90, aura: 110 }, { forca: 80, aura: 130, vontade: 70 })).toEqual({
      forca: 90,
      aura: 120,
      vontade: 70,
    })
  })

  it('mescla skills mantendo maior poder por slot', () => {
    const merged = mergeSkills(
      { active_0: skill('old', 40), passive_0: skill('passive', 20) },
      { active_0: skill('new', 60), passive_0: skill('weak', 10) },
    )

    expect(merged.active_0.id).toBe('new')
    expect(merged.passive_0.id).toBe('passive')
  })

  it('gera preview com mudanças de genes e skills', () => {
    const preview = previewAbsorption(
      eco(),
      { forca: 80, aura: 40 },
      { active_0: skill('new', 90, 'Nova Habilidade') },
    )

    expect(preview.changes).toEqual({ forca: 80 })
    expect(preview.skillChanges).toEqual({ active_0: 'Nova Habilidade' })
    expect(preview.willAbsorb).toBe(true)
  })

  it('indica ausência de melhoria quando nada muda', () => {
    const preview = previewAbsorption(eco(), { forca: 20, aura: 40 })

    expect(preview.changes).toEqual({})
    expect(preview.skillChanges).toEqual({})
    expect(preview.willAbsorb).toBe(false)
  })
})

describe('LEGACY_TIERS (Score-based)', () => {
  it('tem 5 tiers', () => {
    expect(LEGACY_TIERS).toHaveLength(5)
  })

  it('tiers têm scoreRequired em ordem crescente', () => {
    for (let i = 0; i < LEGACY_TIERS.length - 1; i++) {
      expect(LEGACY_TIERS[i].scoreRequired).toBeLessThan(LEGACY_TIERS[i + 1].scoreRequired)
    }
  })

  it('scoreRequired alinha com LEGACY_SCORE_THRESHOLDS [10,40,100,250,600]', () => {
    expect(LEGACY_TIERS.map(t => t.scoreRequired)).toEqual([10, 40, 100, 250, 600])
  })
})

describe('getActiveLegacyTiers / isLegacyTierUnlocked', () => {
  it('nenhum tier ativo sem Ecos', () => {
    expect(getActiveLegacyTiers([])).toHaveLength(0)
  })

  it('tier 1 ativo com score 10 (1 Eco Incomum = score 3 × ?; 1 Lendário = 50)', () => {
    // 1 Lendário = score 50 → tiers 1 e 2 (10 e 40)
    const ecos = [eco({ rarity: 'lendario', signature_key: 'k1' })]
    const active = getActiveLegacyTiers(ecos)
    expect(active.map(t => t.tier)).toContain(1)
    expect(active.map(t => t.tier)).toContain(2)
  })

  it('isLegacyTierUnlocked: false abaixo do limiar', () => {
    const ecos = [eco({ rarity: 'comum', signature_key: 'k1' })]  // score 1
    expect(isLegacyTierUnlocked(ecos, 1)).toBe(false)
  })

  it('isLegacyTierUnlocked: true exatamente no limiar do tier 1 (score 10)', () => {
    // 10 × Comum = score 10
    const ecos = Array.from({ length: 10 }, (_, i) =>
      eco({ rarity: 'comum', signature_key: `k${i}` }),
    )
    expect(isLegacyTierUnlocked(ecos, 1)).toBe(true)
  })
})

describe('getLegacyBonuses', () => {
  it('sem Ecos: todos os bônus são zero/false', () => {
    const bonuses = getLegacyBonuses([])
    expect(bonuses.rareDropBonus).toBe(0)
    expect(bonuses.mutationBonus).toBe(0)
    expect(bonuses.hasExtraCombatSlot).toBe(false)
    expect(bonuses.hasVoidBiome).toBe(false)
    expect(bonuses.hasAncestorInjection).toBe(false)
  })

  it('com 4 Únicos (score 600): todos os bônus ativos', () => {
    const ecos = Array.from({ length: 4 }, (_, i) =>
      eco({ rarity: 'unico', signature_key: `u${i}` }),
    )
    const bonuses = getLegacyBonuses(ecos)
    expect(bonuses.rareDropBonus).toBe(0.05)
    expect(bonuses.mutationBonus).toBe(0.03)
    expect(bonuses.hasExtraCombatSlot).toBe(true)
    expect(bonuses.hasVoidBiome).toBe(true)
    expect(bonuses.hasAncestorInjection).toBe(true)
  })
})

describe('helpers de transmutação', () => {
  it('achata HeroSkills em slots estáveis', () => {
    const heroSkills: HeroSkills = {
      active: [skill('a0', 10)],
      passive: [skill('p0', 20)],
      unique: [skill('u0', 30)],
      emergent: [skill('e0', 40)],
    }

    expect(Object.keys(flattenSkills(heroSkills))).toEqual([
      'active_0',
      'passive_0',
      'unique_0',
      'emergent_0',
    ])
  })

  it('valida catalisador por raridade mínima', () => {
    expect(canUseCatalystForRarity('raro', 'incomum')).toBe(true)
    expect(canUseCatalystForRarity('incomum', 'raro')).toBe(false)
  })

  it('calcula custo de transmutação pela maior raridade dos Ecos principais', () => {
    const cost = calcEcoTransmutationCost(
      eco({ rarity: 'comum' }),
      eco({ rarity: 'raro' }),
    )

    expect(cost).toEqual({ fragments: 800, crystals: 8, rarity: 'raro' })
  })

  it('converte Eco em genoma completo para o motor de fusão', () => {
    const genome = ecoToGenome(eco({
      signature_origin: 'Celestial',
      signature_affinity: 'Luz',
      signature_core: 'Arauto',
      signature_mutations: ['INVERSO'],
      best_genes: { forca: 91, ressonancia: 80 },
    }))

    expect(genome.essence).toEqual({ origin: 'Celestial', affinity: 'Luz', core: 'Arauto' })
    expect(genome.attributes.forca).toBe(91)
    expect(genome.attributes.ressonancia).toBe(80)
    expect(genome.attributes.resistencia).toBe(50)
    expect(genome.mutations).toEqual(['INVERSO'])
  })

  it('calcula chance com bônus de legado e teto 99%', () => {
    expect(getTierUpChance(1, 'comum', 0)).toBe(0.70)
    expect(getTierUpChance(1, 'comum', 600)).toBe(0.80)
    expect(getTierUpChance(3, 'comum', 600)).toBe(0.99)
    expect(getTierUpChance(0, 'comum', 600)).toBe(0)
  })
})
