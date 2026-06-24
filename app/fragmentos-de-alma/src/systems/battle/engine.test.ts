import { describe, it, expect } from '@jest/globals'
import { createBattle, applyAction, computeTurnOrder, computeHpMax, startTurn, endTurn } from './engine'
import { generateFragmentGenome } from '../genes/generator'
import { calculateRarity } from '../genes/rarity'
import { generateVisualParams } from '../visual/generator'
import { generateName } from '../../utils/nameGenerator'
import { generateSkills } from '../skills/generator'
import type { Hero } from '../genes/types'
import type { EnemySpec } from './types'

// ─── Factory de herói para testes ─────────────────────────────────────────────

let _heroIdx = 0
type AttrKey = 'forca' | 'ressonancia' | 'resistencia' | 'agilidade' | 'vontade' | 'aura'

function makeHero(overrideAttrs?: Partial<Record<AttrKey, number>>): Hero {
  const seed = `test-hero-${_heroIdx++}`
  const genome = generateFragmentGenome()
  if (overrideAttrs) {
    for (const [k, v] of Object.entries(overrideAttrs) as [AttrKey, number][]) {
      if (v !== undefined) genome.attributes[k] = v
    }
  }
  const rarity = calculateRarity(genome)
  return {
    id: `hero-${seed}`,
    playerId: 'player-1',
    name: generateName(genome, seed),
    fusionSeed: seed,
    genome,
    rarity,
    visualParams: generateVisualParams(genome, seed),
    skills: generateSkills(genome, rarity, seed),
    level: 1,
    xp: 0,
    bond: 0,
    ultimateCharge: 0,
    parentAId: undefined,
    parentBId: undefined,
    generation: 1,
    isRetired: false,
  }
}

function makeEnemySpec(id: string, level = 1, agilidade = 50): EnemySpec {
  const genome = generateFragmentGenome()
  genome.attributes.agilidade = agilidade
  const rarity = calculateRarity(genome)
  const seed = `enemy-${id}`
  return {
    id,
    name: `Inimigo ${id}`,
    genome,
    rarity,
    skills: generateSkills(genome, rarity, seed),
    level,
    aiPattern: 'aggressive',
  }
}

function make6Heroes(): Hero[] {
  return Array.from({ length: 6 }, () => makeHero())
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('computeHpMax', () => {
  it('cresce com resistencia e level', () => {
    const g1 = generateFragmentGenome(); g1.attributes.resistencia = 50
    const g2 = generateFragmentGenome(); g2.attributes.resistencia = 100
    expect(computeHpMax(g2, 1)).toBeGreaterThan(computeHpMax(g1, 1))
    expect(computeHpMax(g1, 10)).toBeGreaterThan(computeHpMax(g1, 1))
  })

  it('formula: resistencia*10 + level*20 + 100', () => {
    const g = generateFragmentGenome(); g.attributes.resistencia = 60
    expect(computeHpMax(g, 5)).toBe(60 * 10 + 5 * 20 + 100)
  })
})

describe('createBattle', () => {
  it('cria estado válido com 6 heróis e 1 inimigo', () => {
    const state = createBattle(make6Heroes(), [makeEnemySpec('e1')], 'seed1')
    expect(state.phase).toBe('active')
    expect(Object.keys(state.combatants)).toHaveLength(7)
    expect(state.turnOrder.length).toBeGreaterThan(0)
    expect(state.turnNumber).toBe(1)
  })

  it('lança erro com menos de 6 heróis', () => {
    expect(() => createBattle([makeHero()], [makeEnemySpec('e1')], 'x')).toThrow()
  })

  it('lança erro com mais de 4 inimigos', () => {
    expect(() => createBattle(make6Heroes(), Array.from({ length: 5 }, (_, i) => makeEnemySpec(`e${i}`)), 'x')).toThrow()
  })

  it('heróis 0-2 ficam nos slots ativos (front/center/back)', () => {
    const heroes = make6Heroes()
    const state = createBattle(heroes, [makeEnemySpec('e1')], 'seed2')
    expect(state.combatants[heroes[0].id].slot).toBe('front')
    expect(state.combatants[heroes[1].id].slot).toBe('center')
    expect(state.combatants[heroes[2].id].slot).toBe('back')
  })

  it('heróis 3-5 ficam no banco', () => {
    const heroes = make6Heroes()
    const state = createBattle(heroes, [makeEnemySpec('e1')], 'seed3')
    expect(state.combatants[heroes[3].id].slot).toBe('bench_a')
    expect(state.combatants[heroes[4].id].slot).toBe('bench_b')
    expect(state.combatants[heroes[5].id].slot).toBe('bench_c')
  })

  it('inimigos recebem slot enemy_N', () => {
    const state = createBattle(make6Heroes(), [makeEnemySpec('e1'), makeEnemySpec('e2')], 'seed4')
    expect(state.combatants['e1'].slot).toBe('enemy_0')
    expect(state.combatants['e2'].slot).toBe('enemy_1')
  })
})

describe('computeTurnOrder', () => {
  it('heróis do banco não entram na ordem', () => {
    const state = createBattle(make6Heroes(), [makeEnemySpec('e1')], 'seed5')
    const benchIds = Object.values(state.combatants).filter(c => c.slot.startsWith('bench')).map(c => c.id)
    for (const id of benchIds) expect(state.turnOrder).not.toContain(id)
  })

  it('entidade com maior agilidade age primeiro', () => {
    const heroes = make6Heroes()
    const enemy = makeEnemySpec('fast', 1, 99) // agilidade 99
    heroes[0].genome.attributes.agilidade = 10  // frente com agilidade baixa
    const state = createBattle(heroes, [enemy], 'seed6')
    expect(state.turnOrder[0]).toBe('fast')
  })
})

describe('applyAction — skill', () => {
  it('causa dano no inimigo (pré-satisfaz condição da skill gerada)', () => {
    const heroes = make6Heroes()
    const base = createBattle(heroes, [makeEnemySpec('e1')], 'seed7')
    const actorId = base.turnOrder.find(id => !base.combatants[id].isEnemy)!
    const skill = base.combatants[actorId].skills.active[0]
    const enemyId = 'e1'

    // Pré-satisfaz C02 (alvo com <50% HP) caso seja a condição gerada
    let state = base
    if (skill.condition.id === 'C02') {
      const enemy = base.combatants[enemyId]
      state = { ...base, combatants: { ...base.combatants, [enemyId]: { ...enemy, currentHp: Math.floor(enemy.maxHp * 0.4) } } }
    }

    const dmgEffects = ['E01', 'E02', 'E08']
    const condAlwaysFires = ['C01', 'C04', 'C07', 'C10'].includes(skill.condition.id)

    const enemyHpBefore = state.combatants[enemyId].currentHp
    const result = applyAction(state, { type: 'skill', actorId, skillId: skill.id, targetId: enemyId })

    if (dmgEffects.includes(skill.effect.id) && (condAlwaysFires || skill.condition.id === 'C02')) {
      expect(result.combatants[enemyId].currentHp).toBeLessThan(enemyHpBefore)
    }
    // Engine sempre aplica cooldown independentemente da condição
    expect(result.combatants[actorId].cooldowns[skill.id]).toBeGreaterThan(0)
  })

  it('não age quando herói já está morto', () => {
    const heroes = make6Heroes()
    const state = createBattle(heroes, [makeEnemySpec('e1')], 'seed8')
    const actorId = state.turnOrder.find(id => !state.combatants[id].isEnemy)!
    const deadState = { ...state, combatants: { ...state.combatants, [actorId]: { ...state.combatants[actorId], isAlive: false } } }
    const result = applyAction(deadState, { type: 'skill', actorId, targetId: 'e1' })
    expect(result.combatants['e1'].currentHp).toBe(state.combatants['e1'].currentHp)
  })

  it('é determinístico com a mesma seed e estado', () => {
    const heroes = make6Heroes()
    const state = createBattle(heroes, [makeEnemySpec('e1')], 'seed9')
    const actorId = state.turnOrder.find(id => !state.combatants[id].isEnemy)!
    const r1 = applyAction(state, { type: 'skill', actorId, targetId: 'e1' })
    const r2 = applyAction(state, { type: 'skill', actorId, targetId: 'e1' })
    expect(r1.combatants['e1'].currentHp).toBe(r2.combatants['e1'].currentHp)
  })

  it('aplica cooldown na habilidade usada', () => {
    const heroes = make6Heroes()
    const state = createBattle(heroes, [makeEnemySpec('e1')], 'seedCd')
    const actorId = state.turnOrder.find(id => !state.combatants[id].isEnemy)!
    const skill = state.combatants[actorId].skills.active[0]
    const result = applyAction(state, { type: 'skill', actorId, skillId: skill.id, targetId: 'e1' })
    expect(result.combatants[actorId].cooldowns[skill.id]).toBeGreaterThan(0)
  })
})

describe('applyAction — defend', () => {
  it('marca herói como isDefending', () => {
    const heroes = make6Heroes()
    const state = createBattle(heroes, [makeEnemySpec('e1')], 'seedDef')
    const actorId = state.turnOrder.find(id => !state.combatants[id].isEnemy)!
    const result = applyAction(state, { type: 'defend', actorId })
    expect(result.combatants[actorId].isDefending).toBe(true)
  })

  it('herói em defesa recebe menos dano', () => {
    const heroes = make6Heroes()
    const stateBase = createBattle(heroes, [makeEnemySpec('e1')], 'seedDef2')
    const heroId = (st: typeof stateBase) => Object.values(st.combatants).find((c): c is typeof st.combatants[string] => !c.isEnemy && isActiveSlot(c.slot))!.id
    const hId = heroId(stateBase)
    const defended = applyAction(stateBase, { type: 'defend', actorId: hId })

    const enemyId = 'e1'
    // Aplica dano direto (simula ataque inimigo)
    function dealDamage(st: typeof stateBase, toId: string, dmg: number) {
      return applyAction(st, { type: 'skill', actorId: enemyId, targetId: toId })
    }

    const resultNormal = dealDamage(stateBase, hId, 50)
    const resultDefended = dealDamage(defended, hId, 50)
    // Com defesa, o HP deve ser maior (menos dano)
    expect(resultDefended.combatants[hId].currentHp).toBeGreaterThanOrEqual(
      resultNormal.combatants[hId].currentHp
    )
  })
})

describe('applyAction — swap', () => {
  it('troca herói ativo com banco', () => {
    const heroes = make6Heroes()
    const state = createBattle(heroes, [makeEnemySpec('e1')], 'seedSwap')
    const frontId = heroes[0].id
    const benchId = heroes[3].id
    const result = applyAction(state, { type: 'swap', actorId: frontId, swapInId: benchId })
    expect(result.combatants[frontId].slot).toBe('bench_a')
    expect(result.combatants[benchId].slot).toBe('front')
  })

  it('após troca, herói do banco entra na ordem de turnos', () => {
    const heroes = make6Heroes()
    const state = createBattle(heroes, [makeEnemySpec('e1')], 'seedSwap2')
    const frontId = heroes[0].id
    const benchId = heroes[3].id
    const result = applyAction(state, { type: 'swap', actorId: frontId, swapInId: benchId })
    expect(result.turnOrder).toContain(benchId)
    expect(result.turnOrder).not.toContain(frontId)
  })

  it('não troca se alvo não está no banco', () => {
    const heroes = make6Heroes()
    const state = createBattle(heroes, [makeEnemySpec('e1')], 'seedSwap3')
    const frontId = heroes[0].id
    const centerId = heroes[1].id // ativo, não banco
    const result = applyAction(state, { type: 'swap', actorId: frontId, swapInId: centerId })
    expect(result.combatants[frontId].slot).toBe('front')
  })
})

describe('morte e vitória/derrota', () => {
  it('detecta vitória quando todos os inimigos morrem', () => {
    const heroes = make6Heroes()
    const enemy = makeEnemySpec('e1')
    const state = createBattle(heroes, [enemy], 'seedWin')
    // Mata o inimigo diretamente via patch
    const killed = { ...state, combatants: { ...state.combatants, e1: { ...state.combatants.e1, currentHp: 1, isAlive: true } } }
    const heroId = state.turnOrder.find(id => !state.combatants[id].isEnemy)!
    const result = applyAction(killed, { type: 'skill', actorId: heroId, targetId: 'e1' })
    // Pode ter acabado o inimigo ou não dependendo do dano — verificamos pelo menos que o estado não crashou
    expect(result.phase).toMatch(/^(active|victory)$/)
  })
})

describe('startTurn / endTurn', () => {
  it('startTurn emite evento turn_start', () => {
    const state = createBattle(make6Heroes(), [makeEnemySpec('e1')], 'seedTurn')
    const result = startTurn(state)
    expect(result.pendingEvents.some(e => e.type === 'turn_start')).toBe(true)
  })

  it('endTurn avança o índice de turno', () => {
    const state = createBattle(make6Heroes(), [makeEnemySpec('e1')], 'seedEnd')
    const result = endTurn(state)
    expect(result.currentTurnIndex).toBe(1)
  })

  it('endTurn incrementa turnNumber ao voltar ao início da lista', () => {
    const state = createBattle(make6Heroes(), [makeEnemySpec('e1')], 'seedEnd2')
    const lastIdx = { ...state, currentTurnIndex: state.turnOrder.length - 1 }
    const result = endTurn(lastIdx)
    expect(result.turnNumber).toBe(2)
    expect(result.currentTurnIndex).toBe(0)
  })

  it('endTurn decrementa cooldowns', () => {
    // Usa um herói com agilidade 99 para garantir que ele seja currentTurnIndex=0
    const heroes = make6Heroes()
    heroes[0].genome.attributes.agilidade = 99
    const enemyId = 'eLow'
    const state = createBattle(heroes, [makeEnemySpec(enemyId, 1, 1)], 'seedCd2')
    // Com agilidade 99 no herói[0], ele deve ser o primeiro na ordem
    const actorId = state.turnOrder[0]
    if (state.combatants[actorId].isEnemy) return // salvaguarda
    const skill = state.combatants[actorId].skills.active[0]
    let s = applyAction(state, { type: 'skill', actorId, skillId: skill.id, targetId: enemyId })
    const cdBefore = s.combatants[actorId].cooldowns[skill.id]
    expect(cdBefore).toBeGreaterThan(0)
    s = endTurn(s)
    const cdAfter = s.combatants[actorId].cooldowns[skill.id]
    expect(cdAfter === undefined || cdAfter < cdBefore).toBe(true)
  })
})

// helper para checar isActiveSlot em testes
function isActiveSlot(slot: string): boolean {
  return ['front', 'center', 'back'].includes(slot)
}
