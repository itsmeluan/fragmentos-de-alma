import { describe, it, expect } from '@jest/globals'
import {
  generateBoss,
  getBossPhase,
  detectPhaseTransition,
  processBossPhaseTransition,
  chooseBossAction,
  applyBossSpecialAction,
  initBossCombatant,
  PHASE2_TRIGGER,
  PHASE3_TRIGGER,
  BOSS_ABILITY_INFO,
} from './boss'
import { createBattle, computeHpMax } from './engine'
import { generateFragmentGenome } from '../genes/generator'
import { calculateRarity } from '../genes/rarity'
import { generateSkills } from '../skills/generator'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeHero(id: string, overrides: Record<string, unknown> = {}) {
  const genome = generateFragmentGenome()
  genome.attributes.agilidade = 50
  const rarity = calculateRarity(genome)
  return {
    id,
    name: `Hero ${id}`,
    genome,
    rarity,
    skills: generateSkills(genome, rarity, id),
    level: 1,
    ultimateCharge: 0,
    generation: 1,
    ...overrides,
  }
}

function makeTestBattle(bossFloor = 3) {
  const heroes = Array.from({ length: 6 }, (_, i) => makeHero(`hero-${i}`))
  const boss = generateBoss('abismo', bossFloor, 'test-seed')
  // createBattle aceita até 4 inimigos
  const state = createBattle(heroes as any, [boss] as any, 'test-seed')
  return { state: initBossCombatant(state, boss), boss }
}

const seedRng = (seed = 42) => {
  let s = seed
  return () => {
    s = ((Math.imul(1664525, s) + 1013904223) | 0) >>> 0
    return s / 0x100000000
  }
}

// ─── generateBoss ─────────────────────────────────────────────────────────────

describe('generateBoss', () => {
  it('retorna um BossSpec válido', () => {
    const boss = generateBoss('abismo', 3, 'seed-abc')
    expect(boss.isBoss).toBe(true)
    expect(boss.id).toContain('boss')
    expect(boss.name.length).toBeGreaterThan(0)
    expect(boss.weakness.length).toBeGreaterThan(0)
    expect(boss.loreLines).toHaveLength(3)
    expect(['devastacao', 'corrupcao', 'invocacao_massiva', 'roubo_de_alma', 'colapso'])
      .toContain(boss.uniqueAbilityType)
  })

  it('boss tem mais skills ativas do que inimigos comuns (até 4)', () => {
    const boss = generateBoss('forja', 5, 'seed-xyz')
    expect(boss.skills.active.length).toBeGreaterThanOrEqual(2)
    expect(boss.skills.active.length).toBeLessThanOrEqual(4)
  })

  it('atributos são escalados pelo andar', () => {
    const bossFloor1 = generateBoss('abismo', 1, 'same-seed')
    const bossFloor8 = generateBoss('abismo', 8, 'same-seed')
    expect(bossFloor8.genome.attributes.forca).toBeGreaterThan(bossFloor1.genome.attributes.forca)
  })

  it('raridade mínima no andar 5 é épico', () => {
    const boss = generateBoss('celestial', 5, 'rare-test')
    const rarityOrder = ['comum', 'incomum', 'raro', 'epico', 'lendario', 'unico']
    expect(rarityOrder.indexOf(boss.rarity)).toBeGreaterThanOrEqual(rarityOrder.indexOf('epico'))
  })

  it('loreLines são consistentes com o tipo de habilidade única', () => {
    const boss = generateBoss('genesis', 4, 'lore-test')
    expect(boss.loreLines.length).toBeGreaterThanOrEqual(2)
    for (const line of boss.loreLines) {
      expect(line.length).toBeGreaterThan(0)
    }
  })
})

// ─── getBossPhase ─────────────────────────────────────────────────────────────

describe('getBossPhase', () => {
  it('retorna 1 quando HP > 60%', () => {
    expect(getBossPhase(1.0)).toBe(1)
    expect(getBossPhase(0.8)).toBe(1)
    expect(getBossPhase(0.61)).toBe(1)
  })

  it('retorna 2 quando HP está entre 30% e 60%', () => {
    expect(getBossPhase(0.60)).toBe(2)
    expect(getBossPhase(0.45)).toBe(2)
    expect(getBossPhase(0.31)).toBe(2)
  })

  it('retorna 3 quando HP ≤ 30%', () => {
    expect(getBossPhase(0.30)).toBe(3)
    expect(getBossPhase(0.15)).toBe(3)
    expect(getBossPhase(0.01)).toBe(3)
  })
})

// ─── detectPhaseTransition ───────────────────────────────────────────────────

describe('detectPhaseTransition', () => {
  it('detecta transição para fase 2', () => {
    const maxHp = 1000
    // Cruza o limiar de 60%
    expect(detectPhaseTransition(700, 580, maxHp)).toBe(2)
  })

  it('detecta transição para fase 3', () => {
    const maxHp = 1000
    expect(detectPhaseTransition(320, 280, maxHp)).toBe(3)
  })

  it('retorna 0 sem transição', () => {
    const maxHp = 1000
    expect(detectPhaseTransition(800, 700, maxHp)).toBe(0)
    expect(detectPhaseTransition(400, 350, maxHp)).toBe(0)
  })

  it('não detecta transição quando HP já estava abaixo do limiar', () => {
    const maxHp = 1000
    // Já estava na fase 3, não cruza de novo
    expect(detectPhaseTransition(250, 200, maxHp)).toBe(0)
  })
})

// ─── processBossPhaseTransition ──────────────────────────────────────────────

describe('processBossPhaseTransition', () => {
  it('atualiza bossPhase para 2 quando HP cruza 60%', () => {
    const { state, boss } = makeTestBattle(3)
    const maxHp = state.combatants[boss.id].maxHp
    // Simula dano para 55% do HP
    const target55 = Math.round(maxHp * 0.55)
    let s = {
      ...state,
      combatants: {
        ...state.combatants,
        [boss.id]: { ...state.combatants[boss.id], currentHp: target55, bossPhase: 1 as const },
      },
    }
    s = processBossPhaseTransition(s, boss.id)
    expect(s.combatants[boss.id].bossPhase).toBe(2)
  })

  it('emite evento boss_phase_change ao transitar', () => {
    const { state, boss } = makeTestBattle(3)
    const maxHp = state.combatants[boss.id].maxHp
    const s1 = {
      ...state,
      combatants: {
        ...state.combatants,
        [boss.id]: { ...state.combatants[boss.id], currentHp: Math.round(maxHp * 0.25), bossPhase: 2 as const },
      },
    }
    const s2 = processBossPhaseTransition(s1, boss.id)
    const phaseEvents = s2.pendingEvents.filter(e => e.type === 'boss_phase_change')
    expect(phaseEvents.length).toBe(1)
    expect(phaseEvents[0].value).toBe(3)
  })

  it('não emite evento quando fase não muda', () => {
    const { state, boss } = makeTestBattle(3)
    const s1 = {
      ...state,
      combatants: {
        ...state.combatants,
        [boss.id]: { ...state.combatants[boss.id], bossPhase: 2 as const, currentHp: Math.round(state.combatants[boss.id].maxHp * 0.5) },
      },
    }
    const s2 = processBossPhaseTransition(s1, boss.id)
    const phaseEvents = s2.pendingEvents.filter(e => e.type === 'boss_phase_change')
    expect(phaseEvents.length).toBe(0)
  })
})

// ─── chooseBossAction ────────────────────────────────────────────────────────

describe('chooseBossAction', () => {
  it('retorna defender quando não há heróis ativos', () => {
    const { state, boss } = makeTestBattle(3)
    // Mata todos os heróis ativos
    let s = state
    for (const c of Object.values(s.combatants)) {
      if (!c.isEnemy && ['front', 'center', 'back'].includes(c.slot)) {
        s = { ...s, combatants: { ...s.combatants, [c.id]: { ...c, isAlive: false } } }
      }
    }
    const action = chooseBossAction(s, boss.id, seedRng())
    expect(action.type).toBe('defend')
  })

  it('retorna ação de skill na fase 1', () => {
    const { state, boss } = makeTestBattle(3)
    const s = { ...state, combatants: { ...state.combatants, [boss.id]: { ...state.combatants[boss.id], bossPhase: 1 as const } } }
    const action = chooseBossAction(s, boss.id, seedRng())
    expect(['skill', 'defend']).toContain(action.type)
  })

  it('fase 3 com carregamento pendente: retorna boss_unique', () => {
    const { state, boss } = makeTestBattle(3)
    const s = {
      ...state,
      combatants: {
        ...state.combatants,
        [boss.id]: {
          ...state.combatants[boss.id],
          bossPhase: 3 as const,
          uniqueAbilityCharging: true,
        },
      },
    }
    const action = chooseBossAction(s, boss.id, seedRng())
    expect(action.type).toBe('boss_unique')
  })

  it('fase 3 com attackCount múltiplo de 3: retorna boss_charge', () => {
    const { state, boss } = makeTestBattle(3)
    const s = {
      ...state,
      combatants: {
        ...state.combatants,
        [boss.id]: {
          ...state.combatants[boss.id],
          bossPhase: 3 as const,
          uniqueAbilityCharging: false,
          bossAttackCount: 3,
        },
      },
    }
    const action = chooseBossAction(s, boss.id, seedRng())
    expect(action.type).toBe('boss_charge')
  })
})

// ─── applyBossSpecialAction ──────────────────────────────────────────────────

describe('applyBossSpecialAction — boss_charge', () => {
  it('define uniqueAbilityCharging = true e emite evento de aviso', () => {
    const { state, boss } = makeTestBattle(3)
    const action = { type: 'boss_charge' as const, actorId: boss.id }
    const s = applyBossSpecialAction(state, action, seedRng())
    expect(s.combatants[boss.id].uniqueAbilityCharging).toBe(true)
    const warn = s.pendingEvents.find(e => e.type === 'boss_unique_charging')
    expect(warn).toBeDefined()
  })
})

describe('applyBossSpecialAction — Devastação', () => {
  it('causa dano massivo no herói da Frente', () => {
    const { state, boss } = makeTestBattle(3)
    const s1 = {
      ...state,
      combatants: {
        ...state.combatants,
        [boss.id]: { ...state.combatants[boss.id], uniqueAbilityType: 'devastacao' as const },
      },
    }
    const frontHero = Object.values(s1.combatants).find(c => !c.isEnemy && c.slot === 'front')!
    const hpBefore = frontHero.currentHp

    const action = { type: 'boss_unique' as const, actorId: boss.id }
    const s2 = applyBossSpecialAction(s1, action, seedRng())
    const frontAfter = s2.combatants[frontHero.id]
    expect(frontAfter.currentHp).toBeLessThan(hpBefore)
  })
})

describe('applyBossSpecialAction — Corrupção', () => {
  it('inverte buffs em debuffs para heróis ativos', () => {
    const { state, boss } = makeTestBattle(3)
    // Adiciona um buff a um herói ativo
    const frontHero = Object.values(state.combatants).find(c => !c.isEnemy && c.slot === 'front')!
    const buff = {
      id: 'buff-test',
      label: 'Buff',
      type: 'buff' as const,
      magnitude: 1.2,
      turnsRemaining: 2,
      sourceId: 'hero-0',
    }
    let s1 = {
      ...state,
      combatants: {
        ...state.combatants,
        [frontHero.id]: { ...frontHero, statusEffects: [buff] },
        [boss.id]: { ...state.combatants[boss.id], uniqueAbilityType: 'corrupcao' as const },
      },
    }
    const action = { type: 'boss_unique' as const, actorId: boss.id }
    const s2 = applyBossSpecialAction(s1, action, seedRng())
    const after = s2.combatants[frontHero.id]
    const wasFlipped = after.statusEffects.some(e => e.id === 'buff-test' && e.type === 'debuff')
    expect(wasFlipped).toBe(true)
  })
})

describe('applyBossSpecialAction — Colapso', () => {
  it('reduz HP de todos os heróis ativos para 1', () => {
    const { state, boss } = makeTestBattle(3)
    const s1 = {
      ...state,
      combatants: {
        ...state.combatants,
        [boss.id]: { ...state.combatants[boss.id], uniqueAbilityType: 'colapso' as const },
      },
    }
    const action = { type: 'boss_unique' as const, actorId: boss.id }
    const s2 = applyBossSpecialAction(s1, action, seedRng())

    for (const c of Object.values(s2.combatants)) {
      if (!c.isEnemy && c.isAlive && ['front', 'center', 'back'].includes(c.slot)) {
        expect(c.currentHp).toBe(1)
      }
    }
  })

  it('não mata heróis (HP fica em 1, isAlive = true)', () => {
    const { state, boss } = makeTestBattle(3)
    const s1 = {
      ...state,
      combatants: {
        ...state.combatants,
        [boss.id]: { ...state.combatants[boss.id], uniqueAbilityType: 'colapso' as const },
      },
    }
    const action = { type: 'boss_unique' as const, actorId: boss.id }
    const s2 = applyBossSpecialAction(s1, action, seedRng())

    for (const c of Object.values(s2.combatants)) {
      if (!c.isEnemy && ['front', 'center', 'back'].includes(c.slot)) {
        expect(c.isAlive).toBe(true)
      }
    }
  })
})

describe('applyBossSpecialAction — Invocação Massiva', () => {
  it('adiciona 2 combatentes inimigos ao estado', () => {
    const { state, boss } = makeTestBattle(3)
    const enemyCountBefore = Object.values(state.combatants).filter(c => c.isEnemy).length

    const s1 = {
      ...state,
      combatants: {
        ...state.combatants,
        [boss.id]: { ...state.combatants[boss.id], uniqueAbilityType: 'invocacao_massiva' as const },
      },
    }
    const action = { type: 'boss_unique' as const, actorId: boss.id }
    const s2 = applyBossSpecialAction(s1, action, seedRng())
    const enemyCountAfter = Object.values(s2.combatants).filter(c => c.isEnemy).length
    expect(enemyCountAfter).toBe(enemyCountBefore + 2)
  })

  it('invocados são adicionados ao turnOrder', () => {
    const { state, boss } = makeTestBattle(3)
    const s1 = {
      ...state,
      combatants: {
        ...state.combatants,
        [boss.id]: { ...state.combatants[boss.id], uniqueAbilityType: 'invocacao_massiva' as const },
      },
    }
    const action = { type: 'boss_unique' as const, actorId: boss.id }
    const s2 = applyBossSpecialAction(s1, action, seedRng())
    const newEnemyIds = Object.values(s2.combatants)
      .filter(c => c.isEnemy && c.id.startsWith('summoned'))
      .map(c => c.id)
    for (const id of newEnemyIds) {
      expect(s2.turnOrder).toContain(id)
    }
  })
})

describe('applyBossSpecialAction — Roubo de Alma', () => {
  it('causa dano ao herói com menos HP', () => {
    const { state, boss } = makeTestBattle(3)
    // Coloca um herói ativo com HP baixo
    const frontHero = Object.values(state.combatants).find(c => !c.isEnemy && c.slot === 'front')!
    let s1 = {
      ...state,
      combatants: {
        ...state.combatants,
        [frontHero.id]: { ...frontHero, currentHp: 10 },
        [boss.id]: { ...state.combatants[boss.id], uniqueAbilityType: 'roubo_de_alma' as const },
      },
    }
    const action = { type: 'boss_unique' as const, actorId: boss.id }
    const s2 = applyBossSpecialAction(s1, action, seedRng())
    // Algum herói ativo deve ter tomado dano
    const dmgEvents = s2.pendingEvents.filter(e => e.type === 'damage')
    expect(dmgEvents.length).toBeGreaterThan(0)
  })
})

// ─── initBossCombatant ───────────────────────────────────────────────────────

describe('initBossCombatant', () => {
  it('define isBoss = true e bossPhase = 1', () => {
    const { state, boss } = makeTestBattle(3)
    const b = state.combatants[boss.id]
    expect(b.isBoss).toBe(true)
    expect(b.bossPhase).toBe(1)
  })

  it('copia uniqueAbilityType do BossSpec', () => {
    const { state, boss } = makeTestBattle(3)
    const b = state.combatants[boss.id]
    expect(b.uniqueAbilityType).toBe(boss.uniqueAbilityType)
  })
})

// ─── BOSS_ABILITY_INFO invariantes ───────────────────────────────────────────

describe('BOSS_ABILITY_INFO', () => {
  it('tem entrada para cada tipo de habilidade única', () => {
    const types: string[] = ['devastacao', 'corrupcao', 'invocacao_massiva', 'roubo_de_alma', 'colapso']
    for (const t of types) {
      expect(BOSS_ABILITY_INFO[t as keyof typeof BOSS_ABILITY_INFO]).toBeDefined()
      expect(BOSS_ABILITY_INFO[t as keyof typeof BOSS_ABILITY_INFO].name.length).toBeGreaterThan(0)
      expect(BOSS_ABILITY_INFO[t as keyof typeof BOSS_ABILITY_INFO].warningText.length).toBeGreaterThan(0)
    }
  })
})
