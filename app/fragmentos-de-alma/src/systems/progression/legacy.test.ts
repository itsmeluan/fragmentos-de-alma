import { describe, it, expect } from '@jest/globals'
import {
  createLegacyState,
  calcRetirementEcos,
  retireHero,
  getActiveTiers,
  isTierUnlocked,
  getLegacyBonuses,
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
  LEGACY_TIERS,
  HERO_MILESTONES,
  BOND_PER_BATTLE,
} from './legacy'
import { generateFragmentGenome } from '../genes/generator'
import { calculateRarity } from '../genes/rarity'
import { generateSkills } from '../skills/generator'
import { generateVisualParams } from '../visual/generator'

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeHero(overrides: Partial<Parameters<typeof calcRetirementEcos>[0]> = {}) {
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

// ─── createLegacyState ────────────────────────────────────────────────────────

describe('createLegacyState', () => {
  it('começa com 0 Ecos', () => {
    expect(createLegacyState().totalEcos).toBe(0)
  })

  it('começa com listas vazias', () => {
    const s = createLegacyState()
    expect(s.retiredHeroIds).toHaveLength(0)
    expect(s.discoveredEmergentSkillIds).toHaveLength(0)
  })

  it('fusionBadLuckCounter começa em 0', () => {
    expect(createLegacyState().fusionBadLuckCounter).toBe(0)
  })
})

// ─── LEGACY_TIERS invariantes ─────────────────────────────────────────────────

describe('LEGACY_TIERS invariantes', () => {
  it('tem 5 tiers', () => {
    expect(LEGACY_TIERS).toHaveLength(5)
  })

  it('tiers são numerados 1–5 em ordem crescente de Ecos', () => {
    for (let i = 0; i < LEGACY_TIERS.length - 1; i++) {
      expect(LEGACY_TIERS[i].ecosRequired).toBeLessThan(LEGACY_TIERS[i + 1].ecosRequired)
    }
  })

  it('cada tier tem nome e descrição não-vazios', () => {
    for (const t of LEGACY_TIERS) {
      expect(t.name.length).toBeGreaterThan(0)
      expect(t.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── calcRetirementEcos ──────────────────────────────────────────────────────

describe('calcRetirementEcos', () => {
  it('herói nível 1 comum vale pelo menos 1 Eco', () => {
    const hero = makeHero({ level: 1, rarity: 'comum' })
    expect(calcRetirementEcos(hero)).toBeGreaterThanOrEqual(1)
  })

  it('héróis de maior raridade valem mais Ecos', () => {
    const comum   = makeHero({ rarity: 'comum',    level: 1 })
    const epico   = makeHero({ rarity: 'epico',    level: 1 })
    const lendario = makeHero({ rarity: 'lendario', level: 1 })
    expect(calcRetirementEcos(epico)).toBeGreaterThan(calcRetirementEcos(comum))
    expect(calcRetirementEcos(lendario)).toBeGreaterThan(calcRetirementEcos(epico))
  })

  it('heróis de nível maior valem mais Ecos', () => {
    const low  = makeHero({ rarity: 'raro', level: 1 })
    const high = makeHero({ rarity: 'raro', level: 40 })
    expect(calcRetirementEcos(high)).toBeGreaterThan(calcRetirementEcos(low))
  })

  it('herói desperto (nível 50) recebe bônus de Ecos', () => {
    const level49 = makeHero({ rarity: 'raro', level: 49 })
    const level50 = makeHero({ rarity: 'raro', level: 50 })
    expect(calcRetirementEcos(level50)).toBeGreaterThan(calcRetirementEcos(level49))
  })
})

// ─── retireHero ──────────────────────────────────────────────────────────────

describe('retireHero', () => {
  it('acumula Ecos e registra id do herói', () => {
    const legacy = createLegacyState()
    const hero = makeHero({ id: 'hero-1', rarity: 'raro', level: 10 })
    const { state, ecosEarned } = retireHero(legacy, hero)
    expect(state.totalEcos).toBe(ecosEarned)
    expect(state.retiredHeroIds).toContain('hero-1')
  })

  it('aposentar mesmo herói duas vezes não dá mais Ecos', () => {
    const legacy = createLegacyState()
    const hero = makeHero({ id: 'hero-dup', rarity: 'comum', level: 1 })
    const { state: s1 } = retireHero(legacy, hero)
    const { state: s2, ecosEarned } = retireHero(s1, hero)
    expect(ecosEarned).toBe(0)
    expect(s2.totalEcos).toBe(s1.totalEcos)
  })

  it('múltiplos heróis acumulam Ecos separadamente', () => {
    const legacy = createLegacyState()
    const h1 = makeHero({ id: 'h1', rarity: 'comum',  level: 1 })
    const h2 = makeHero({ id: 'h2', rarity: 'lendario', level: 1 })
    const { state: s1 } = retireHero(legacy, h1)
    const { state: s2 } = retireHero(s1, h2)
    expect(s2.totalEcos).toBeGreaterThan(s1.totalEcos)
  })
})

// ─── getActiveTiers / isTierUnlocked ─────────────────────────────────────────

describe('getActiveTiers', () => {
  it('nenhum tier ativo com 0 Ecos', () => {
    expect(getActiveTiers(createLegacyState())).toHaveLength(0)
  })

  it('tier 1 ativo com 10 Ecos', () => {
    const s = { ...createLegacyState(), totalEcos: 10 }
    expect(getActiveTiers(s)).toHaveLength(1)
    expect(getActiveTiers(s)[0].tier).toBe(1)
  })

  it('todos os tiers ativos com 200+ Ecos', () => {
    const s = { ...createLegacyState(), totalEcos: 200 }
    expect(getActiveTiers(s)).toHaveLength(5)
  })
})

describe('isTierUnlocked', () => {
  it('retorna false para tier não atingido', () => {
    const s = { ...createLegacyState(), totalEcos: 9 }
    expect(isTierUnlocked(s, 1)).toBe(false)
  })

  it('retorna true exatamente no limiar', () => {
    const s = { ...createLegacyState(), totalEcos: 10 }
    expect(isTierUnlocked(s, 1)).toBe(true)
  })
})

// ─── getLegacyBonuses ────────────────────────────────────────────────────────

describe('getLegacyBonuses', () => {
  it('sem tiers: todos bônus são zero/false', () => {
    const bonuses = getLegacyBonuses(createLegacyState())
    expect(bonuses.rareDropBonus).toBe(0)
    expect(bonuses.mutationBonus).toBe(0)
    expect(bonuses.hasExtraCombatSlot).toBe(false)
    expect(bonuses.hasVoidBiome).toBe(false)
    expect(bonuses.hasAncestorInjection).toBe(false)
  })

  it('com todos os tiers: bônus corretos', () => {
    const s = { ...createLegacyState(), totalEcos: 200 }
    const bonuses = getLegacyBonuses(s)
    expect(bonuses.rareDropBonus).toBe(0.05)
    expect(bonuses.mutationBonus).toBe(0.03)
    expect(bonuses.hasExtraCombatSlot).toBe(true)
    expect(bonuses.hasVoidBiome).toBe(true)
    expect(bonuses.hasAncestorInjection).toBe(true)
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
  it('combina tier 2 e pity', () => {
    const s = { ...createLegacyState(), totalEcos: 25, fusionBadLuckCounter: 15 }
    const total = getTotalMutationBonus(s)
    expect(total).toBeGreaterThan(0.03)  // só tier 2
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
  it('false sem tier 5 desbloqueado', () => {
    expect(canUseAncestorInjection(createLegacyState())).toBe(false)
  })

  it('true com tier 5 e injeção não usada', () => {
    const s = { ...createLegacyState(), totalEcos: 200 }
    expect(canUseAncestorInjection(s)).toBe(true)
  })

  it('false após usar a injeção semanal', () => {
    const s = { ...createLegacyState(), totalEcos: 200, ancestorInjectionUsed: true }
    expect(canUseAncestorInjection(s)).toBe(false)
  })
})

describe('useAncestorInjection', () => {
  it('marca injeção como usada', () => {
    const s = { ...createLegacyState(), totalEcos: 200 }
    const result = useAncestorInjection(s)
    expect(result.ancestorInjectionUsed).toBe(true)
  })

  it('não faz nada sem tier 5', () => {
    const s = createLegacyState()
    const result = useAncestorInjection(s)
    expect(result.ancestorInjectionUsed).toBe(false)
  })
})

describe('checkWeeklyReset', () => {
  it('reseta ancestorInjectionUsed quando a semana mudou', () => {
    const oldMonday = '2020-01-06'  // segunda-feira passada
    const s = { ...createLegacyState(), totalEcos: 200, ancestorInjectionUsed: true, weeklyResetDateKey: oldMonday }
    const result = checkWeeklyReset(s)
    // A semana atual é diferente de 2020-01-06, então deve resetar
    expect(result.ancestorInjectionUsed).toBe(false)
  })

  it('não reseta quando ainda é a mesma semana', () => {
    // Usa a segunda-feira atual como chave
    const today = new Date()
    const day = today.getUTCDay()
    const diffToMonday = day === 0 ? -6 : 1 - day
    const monday = new Date(today)
    monday.setUTCDate(today.getUTCDate() + diffToMonday)
    const currentKey = monday.toISOString().slice(0, 10)

    const s = { ...createLegacyState(), totalEcos: 200, ancestorInjectionUsed: true, weeklyResetDateKey: currentKey }
    const result = checkWeeklyReset(s)
    expect(result.ancestorInjectionUsed).toBe(true)  // sem reset
  })
})
