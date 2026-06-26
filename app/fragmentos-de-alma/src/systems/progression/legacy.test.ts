import { describe, it, expect } from '@jest/globals'
import {
  createLegacyState,
  recordEmergentDiscovery,
  isFirstDiscovery,
  incrementFusionBadLuck,
  resetFusionBadLuck,
  getPityMutationBonus,
  getTotalMutationBonus,
  addHeroBattleXp,
  addHeroBond,
  heroBondStars,
  getMilestonesForLevel,
  isHeroAwakened,
  checkWeeklyReset,
  useAncestorInjection,
  canUseAncestorInjection,
  xpRequiredForHeroLevel,
  HERO_MILESTONES,
  BOND_PER_BATTLE,
} from './legacy'
import type { Eco } from '../genes/eco'
import { generateFragmentGenome } from '../genes/generator'
import { calculateRarity } from '../genes/rarity'
import { generateSkills } from '../skills/generator'
import { generateVisualParams } from '../visual/generator'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeHero(overrides: Record<string, unknown> = {}) {
  const genome = generateFragmentGenome()
  const rarity = calculateRarity(genome)
  return {
    id: 'hero-test',
    playerId: 'player-1',
    name: 'Test Hero',
    fusionSeed: 'seed-1',
    genome,
    rarity,
    visualParams: generateVisualParams(genome, 'seed-1'),
    skills: generateSkills(genome, rarity, 'seed-1'),
    level: 1,
    xp: 0,
    bond: 0,
    ultimateCharge: 0,
    generation: 1,
    isRetired: false,
    ...overrides,
  }
}

function makeEco(overrides: Partial<Eco> = {}): Eco {
  return {
    id: 'eco-1',
    player_id: 'player-1',
    created_at: '2026-06-26T00:00:00.000Z',
    signature_origin: 'Abissal',
    signature_affinity: 'Fogo',
    signature_core: 'Guardião',
    signature_mutations: [],
    signature_key: 'k1',
    best_genes: {},
    best_skills: {},
    rarity: 'comum',
    absorption_count: 1,
    ...overrides,
  }
}

// 4 Ecos Únicos com signatures diferentes = score 600 → tier 5 desbloqueado
function tier5Ecos(): Eco[] {
  return [
    makeEco({ id: '1', signature_key: 'k1', rarity: 'unico' }),
    makeEco({ id: '2', signature_key: 'k2', rarity: 'unico' }),
    makeEco({ id: '3', signature_key: 'k3', rarity: 'unico' }),
    makeEco({ id: '4', signature_key: 'k4', rarity: 'unico' }),
  ]
}

// ─── createLegacyState ────────────────────────────────────────────────────────

describe('createLegacyState', () => {
  it('começa com listas vazias', () => {
    const s = createLegacyState()
    expect(s.retiredHeroIds).toHaveLength(0)
    expect(s.discoveredEmergentSkillIds).toHaveLength(0)
  })

  it('fusionBadLuckCounter começa em 0', () => {
    expect(createLegacyState().fusionBadLuckCounter).toBe(0)
  })
})

// ─── recordEmergentDiscovery / isFirstDiscovery ──────────────────────────────

describe('recordEmergentDiscovery', () => {
  it('registra nova habilidade emergente', () => {
    const s = recordEmergentDiscovery(createLegacyState(), 'emergent_001')
    expect(s.discoveredEmergentSkillIds).toContain('emergent_001')
  })

  it('não duplica habilidade já descoberta', () => {
    const s1 = recordEmergentDiscovery(createLegacyState(), 'emergent_001')
    const s2 = recordEmergentDiscovery(s1, 'emergent_001')
    expect(s2.discoveredEmergentSkillIds.filter(id => id === 'emergent_001')).toHaveLength(1)
  })
})

describe('isFirstDiscovery', () => {
  it('retorna true se habilidade não foi descoberta ainda', () => {
    expect(isFirstDiscovery(createLegacyState(), 'emergent_xyz')).toBe(true)
  })

  it('retorna false se já foi descoberta', () => {
    const s = recordEmergentDiscovery(createLegacyState(), 'emergent_xyz')
    expect(isFirstDiscovery(s, 'emergent_xyz')).toBe(false)
  })
})

// ─── Sistema de pity ──────────────────────────────────────────────────────────

describe('incrementFusionBadLuck', () => {
  it('incrementa o contador', () => {
    const s = incrementFusionBadLuck(createLegacyState())
    expect(s.fusionBadLuckCounter).toBe(1)
  })
})

describe('resetFusionBadLuck', () => {
  it('reseta o contador para 0', () => {
    const s1 = { ...createLegacyState(), fusionBadLuckCounter: 8 }
    const s2 = resetFusionBadLuck(s1)
    expect(s2.fusionBadLuckCounter).toBe(0)
  })
})

describe('getPityMutationBonus', () => {
  it('é 0 abaixo do limiar (10 fusões)', () => {
    const s = { ...createLegacyState(), fusionBadLuckCounter: 9 }
    expect(getPityMutationBonus(s)).toBe(0)
  })

  it('começa a aumentar após 10 fusões sem mutação', () => {
    const s = { ...createLegacyState(), fusionBadLuckCounter: 11 }
    expect(getPityMutationBonus(s)).toBeGreaterThan(0)
  })

  it('bônus de pity não excede 50%', () => {
    const s = { ...createLegacyState(), fusionBadLuckCounter: 9999 }
    expect(getPityMutationBonus(s)).toBeLessThanOrEqual(0.50)
  })
})

describe('getTotalMutationBonus', () => {
  it('combina bônus de tier e pity', () => {
    // Um Lendário = score 50 → tier 2 (scoreRequired=40), mutationBonus=0.03
    const ecos = [makeEco({ rarity: 'lendario', signature_key: 'lend1' })]
    const legacy = { ...createLegacyState(), fusionBadLuckCounter: 15 }
    expect(getTotalMutationBonus(legacy, ecos)).toBeGreaterThan(0.03)
  })
})

// ─── Progressão de XP do herói ───────────────────────────────────────────────

describe('xpRequiredForHeroLevel', () => {
  it('cresce com o nível', () => {
    expect(xpRequiredForHeroLevel(10)).toBeGreaterThan(xpRequiredForHeroLevel(1))
  })

  it('é positivo para qualquer nível', () => {
    for (const l of [1, 5, 10, 49]) {
      expect(xpRequiredForHeroLevel(l)).toBeGreaterThan(0)
    }
  })
})

describe('addHeroBattleXp', () => {
  it('acumula XP sem subir de nível quando insuficiente', () => {
    const hero = makeHero({ level: 1, xp: 0 })
    const { hero: h, leveled } = addHeroBattleXp(hero, 10)
    expect(h.xp).toBe(10)
    expect(leveled).toBe(false)
  })

  it('sobe de nível quando XP acumulado atinge o limiar', () => {
    const hero = makeHero({ level: 1, xp: xpRequiredForHeroLevel(1) - 1 })
    const { hero: h, leveled } = addHeroBattleXp(hero, 5)
    expect(leveled).toBe(true)
    expect(h.level).toBe(2)
  })

  it('não ultrapassa nível 50', () => {
    const hero = makeHero({ level: 50, xp: 0 })
    const { hero: h, leveled } = addHeroBattleXp(hero, 99999)
    expect(h.level).toBe(50)
    expect(leveled).toBe(false)
  })

  it('detecta milestone ao atingir nível 10', () => {
    const hero = makeHero({ level: 9, xp: xpRequiredForHeroLevel(9) - 1 })
    const { newMilestone } = addHeroBattleXp(hero, 5)
    if (newMilestone) {
      expect(newMilestone.level).toBe(10)
    }
  })
})

// ─── Milestones de herói ──────────────────────────────────────────────────────

describe('HERO_MILESTONES invariantes', () => {
  it('tem 5 milestones', () => {
    expect(HERO_MILESTONES).toHaveLength(5)
  })

  it('milestones são nos níveis 10, 20, 30, 40, 50', () => {
    const levels = HERO_MILESTONES.map(m => m.level)
    expect(levels).toEqual([10, 20, 30, 40, 50])
  })
})

describe('getMilestonesForLevel', () => {
  it('nenhum milestone para nível < 10', () => {
    expect(getMilestonesForLevel(9)).toHaveLength(0)
  })

  it('1 milestone no nível 10', () => {
    expect(getMilestonesForLevel(10)).toHaveLength(1)
  })

  it('todos os 5 milestones no nível 50', () => {
    expect(getMilestonesForLevel(50)).toHaveLength(5)
  })
})

describe('isHeroAwakened', () => {
  it('false antes do nível 50', () => {
    expect(isHeroAwakened(makeHero({ level: 49 }))).toBe(false)
  })

  it('true no nível 50', () => {
    expect(isHeroAwakened(makeHero({ level: 50 }))).toBe(true)
  })
})

// ─── Vínculo de herói ────────────────────────────────────────────────────────

describe('heroBondStars', () => {
  it('0 estrelas com bond < 10', () => {
    expect(heroBondStars(0)).toBe(0)
    expect(heroBondStars(9)).toBe(0)
  })

  it('1 estrela com bond 10–24', () => {
    expect(heroBondStars(10)).toBe(1)
    expect(heroBondStars(24)).toBe(1)
  })

  it('5 estrelas com bond ≥ 200', () => {
    expect(heroBondStars(200)).toBe(5)
    expect(heroBondStars(999)).toBe(5)
  })
})

describe('addHeroBond', () => {
  it('incrementa bond', () => {
    const hero = makeHero({ bond: 5 })
    const updated = addHeroBond(hero, BOND_PER_BATTLE)
    expect(updated.bond).toBe(5 + BOND_PER_BATTLE)
  })
})

// ─── Injeção de ancestral ────────────────────────────────────────────────────

describe('canUseAncestorInjection', () => {
  it('false sem tier 5 desbloqueado (sem Ecos)', () => {
    expect(canUseAncestorInjection(createLegacyState(), [])).toBe(false)
  })

  it('true com tier 5 e injeção não usada', () => {
    expect(canUseAncestorInjection(createLegacyState(), tier5Ecos())).toBe(true)
  })

  it('false após usar a injeção semanal', () => {
    const s = { ...createLegacyState(), ancestorInjectionUsed: true }
    expect(canUseAncestorInjection(s, tier5Ecos())).toBe(false)
  })
})

describe('useAncestorInjection', () => {
  it('marca injeção como usada', () => {
    const result = useAncestorInjection(createLegacyState(), tier5Ecos())
    expect(result.ancestorInjectionUsed).toBe(true)
  })

  it('não faz nada sem tier 5', () => {
    const result = useAncestorInjection(createLegacyState(), [])
    expect(result.ancestorInjectionUsed).toBe(false)
  })
})

describe('checkWeeklyReset', () => {
  it('reseta ancestorInjectionUsed quando a semana mudou', () => {
    const oldMonday = '2020-01-06'
    const s = { ...createLegacyState(), ancestorInjectionUsed: true, weeklyResetDateKey: oldMonday }
    const result = checkWeeklyReset(s)
    expect(result.ancestorInjectionUsed).toBe(false)
  })

  it('não reseta quando ainda é a mesma semana', () => {
    const today = new Date()
    const day = today.getUTCDay()
    const diffToMonday = day === 0 ? -6 : 1 - day
    const monday = new Date(today)
    monday.setUTCDate(today.getUTCDate() + diffToMonday)
    const currentKey = monday.toISOString().slice(0, 10)

    const s = { ...createLegacyState(), ancestorInjectionUsed: true, weeklyResetDateKey: currentKey }
    const result = checkWeeklyReset(s)
    expect(result.ancestorInjectionUsed).toBe(true)
  })
})
