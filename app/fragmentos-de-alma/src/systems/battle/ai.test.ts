import { describe, it, expect } from '@jest/globals'
import { chooseEnemyAction, availableActiveSkills } from './ai'
import { createBattle } from './engine'
import { generateFragmentGenome } from '../genes/generator'
import { calculateRarity } from '../genes/rarity'
import { generateVisualParams } from '../visual/generator'
import { generateName } from '../../utils/nameGenerator'
import { generateSkills } from '../skills/generator'
import type { Hero } from '../genes/types'
import type { EnemySpec } from './types'

// ─── Factories ───────────────────────────────────────────────────────────────

let _idx = 0

function makeHero(agil?: number): Hero {
  const seed = `ai-hero-${_idx++}`
  const genome = generateFragmentGenome()
  if (agil !== undefined) genome.attributes.agilidade = agil
  const rarity = calculateRarity(genome)
  return {
    id: `h${_idx}`,
    playerId: 'p1',
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

function makeEnemy(pattern: EnemySpec['aiPattern'], agil = 50): EnemySpec {
  const id = `enemy-ai-${_idx++}`
  const genome = generateFragmentGenome()
  genome.attributes.agilidade = agil
  const rarity = calculateRarity(genome)
  const seed = id
  return {
    id,
    name: `Inimigo ${pattern}`,
    genome,
    rarity,
    skills: generateSkills(genome, rarity, seed),
    level: 1,
    aiPattern: pattern,
  }
}

function make6Heroes(firstAgil = 10): Hero[] {
  return [makeHero(firstAgil), ...Array.from({ length: 5 }, () => makeHero())]
}

const rngSeq = () => 0.5  // rng determinístico para testes

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('availableActiveSkills', () => {
  it('exclui habilidades em cooldown', () => {
    const heroes = make6Heroes()
    const state = createBattle(heroes, [makeEnemy('aggressive')], 'ai-seed1')
    const enemyId = Object.values(state.combatants).find(c => c.isEnemy)!.id
    const actor = { ...state.combatants[enemyId], cooldowns: { [state.combatants[enemyId].skills.active[0].id]: 2 } }
    const skills = availableActiveSkills(actor)
    expect(skills.every(s => (actor.cooldowns[s.id] ?? 0) === 0)).toBe(true)
  })

  it('exclui passivas', () => {
    const heroes = make6Heroes()
    const state = createBattle(heroes, [makeEnemy('aggressive')], 'ai-seed2')
    const actor = Object.values(state.combatants).find(c => c.isEnemy)!
    const skills = availableActiveSkills(actor)
    expect(skills.every(s => !s.isPassive)).toBe(true)
  })
})

describe('chooseEnemyAction — aggressive', () => {
  it('retorna ação do tipo skill com alvo herói', () => {
    const heroes = make6Heroes(10)
    const state = createBattle(heroes, [makeEnemy('aggressive', 99)], 'ai-agg1')
    const enemyId = Object.values(state.combatants).find(c => c.isEnemy)!.id
    const action = chooseEnemyAction(state, enemyId, rngSeq)
    expect(action.type).toBe('skill')
    expect(action.targetId).toBeDefined()
    const target = state.combatants[action.targetId!]
    expect(target.isEnemy).toBe(false)
  })

  it('prefere herói com menor HP', () => {
    const heroes = make6Heroes(10)
    const state = createBattle(heroes, [makeEnemy('aggressive', 99)], 'ai-agg2')
    const enemyId = Object.values(state.combatants).find(c => c.isEnemy)!.id

    // Reduz HP do herói do centro para garantir que ele seja o alvo
    const centerId = heroes[1].id
    const weakState = {
      ...state,
      combatants: {
        ...state.combatants,
        [centerId]: { ...state.combatants[centerId], currentHp: 1 },
      },
    }
    const action = chooseEnemyAction(weakState, enemyId, rngSeq)
    expect(action.targetId).toBe(centerId)
  })

  it('defende quando não há heróis vivos', () => {
    const heroes = make6Heroes()
    const state = createBattle(heroes, [makeEnemy('aggressive', 99)], 'ai-agg3')
    const enemyId = Object.values(state.combatants).find(c => c.isEnemy)!.id
    // Remove todos os heróis ativos
    const noHeroes = {
      ...state,
      combatants: Object.fromEntries(
        Object.entries(state.combatants).map(([k, v]) =>
          [k, v.isEnemy ? v : { ...v, isAlive: false }]
        )
      ),
    }
    const action = chooseEnemyAction(noHeroes, enemyId, rngSeq)
    expect(action.type).toBe('defend')
  })
})

describe('chooseEnemyAction — defensive', () => {
  it('ataca herói da Frente quando aliados estão seguros', () => {
    const heroes = make6Heroes(10)
    const state = createBattle(heroes, [makeEnemy('defensive', 99)], 'ai-def1')
    const enemyId = Object.values(state.combatants).find(c => c.isEnemy)!.id
    const action = chooseEnemyAction(state, enemyId, rngSeq)
    expect(action.type).toBe('skill')
    // Alvo deve ser o herói da Frente (heroes[0])
    expect(action.targetId).toBe(heroes[0].id)
  })

  it('suporta aliado em perigo ao invés de atacar', () => {
    // Dois inimigos: um defensive e um com <40% HP
    const heroes = make6Heroes(1)
    const enemy1 = makeEnemy('defensive', 99)
    const enemy2 = makeEnemy('aggressive', 50)
    const state = createBattle(heroes, [enemy1, enemy2], 'ai-def2')
    const defEnemyId = enemy1.id
    const allyId = enemy2.id

    // Coloca aliado em perigo
    const dangerState = {
      ...state,
      combatants: {
        ...state.combatants,
        [allyId]: { ...state.combatants[allyId], currentHp: Math.floor(state.combatants[allyId].maxHp * 0.3) },
      },
    }

    const skills = availableActiveSkills(dangerState.combatants[defEnemyId])
    const hasSupportSkill = skills.some(s => ['E06', 'E04', 'E03'].includes(s.effect.id))

    const action = chooseEnemyAction(dangerState, defEnemyId, rngSeq)
    if (hasSupportSkill) {
      // Se tem skill de suporte, deve usar no aliado
      expect(action.targetId).toBe(allyId)
    } else {
      // Se não tem, ataca normalmente (comportamento de fallback)
      expect(action.type).toBe('skill')
    }
  })
})

describe('chooseEnemyAction — support', () => {
  it('prefere usar skill de suporte em aliado', () => {
    const heroes = make6Heroes(1)
    const enemy1 = makeEnemy('support', 99)
    const enemy2 = makeEnemy('aggressive', 50)
    const state = createBattle(heroes, [enemy1, enemy2], 'ai-sup1')
    const suppId = enemy1.id

    const skills = availableActiveSkills(state.combatants[suppId])
    const hasSupportSkill = skills.some(s => ['E06', 'E04', 'E03'].includes(s.effect.id))

    const action = chooseEnemyAction(state, suppId, rngSeq)
    expect(action.type).toBe('skill')
    if (hasSupportSkill) {
      // Alvo deve ser o aliado (enemy2), não um herói
      expect(action.targetId).toBe(enemy2.id)
    }
  })
})

describe('chooseEnemyAction — random', () => {
  it('retorna ação válida com alvo herói', () => {
    const heroes = make6Heroes(10)
    const state = createBattle(heroes, [makeEnemy('random', 99)], 'ai-rnd1')
    const enemyId = Object.values(state.combatants).find(c => c.isEnemy)!.id
    const action = chooseEnemyAction(state, enemyId, rngSeq)
    expect(action.type).toBe('skill')
    expect(action.targetId).toBeDefined()
  })

  it('vira aggressive ao atingir ≤50% HP', () => {
    const heroes = make6Heroes(10)
    const state = createBattle(heroes, [makeEnemy('random', 99)], 'ai-rnd2')
    const enemyId = Object.values(state.combatants).find(c => c.isEnemy)!.id
    const enemy = state.combatants[enemyId]

    // Reduz HP para ≤50%
    const halfHpState = {
      ...state,
      combatants: {
        ...state.combatants,
        [enemyId]: { ...enemy, currentHp: Math.floor(enemy.maxHp * 0.4) },
      },
    }

    // Com HP baixo, deve virar aggressive → ataca herói com menor HP
    const weakestHeroId = heroes
      .slice(0, 3)
      .reduce((a, b) =>
        halfHpState.combatants[a.id].currentHp <= halfHpState.combatants[b.id].currentHp ? a : b
      ).id

    const action = chooseEnemyAction(halfHpState, enemyId, rngSeq)
    expect(action.type).toBe('skill')
    expect(action.targetId).toBe(weakestHeroId)
  })
})

describe('chooseEnemyAction — edge cases', () => {
  it('retorna defend para inimigo morto', () => {
    const heroes = make6Heroes()
    const state = createBattle(heroes, [makeEnemy('aggressive')], 'ai-edge1')
    const enemyId = Object.values(state.combatants).find(c => c.isEnemy)!.id
    const deadState = {
      ...state,
      combatants: { ...state.combatants, [enemyId]: { ...state.combatants[enemyId], isAlive: false } },
    }
    const action = chooseEnemyAction(deadState, enemyId, rngSeq)
    expect(action.type).toBe('defend')
  })

  it('retorna defend para id inexistente', () => {
    const heroes = make6Heroes()
    const state = createBattle(heroes, [makeEnemy('aggressive')], 'ai-edge2')
    const action = chooseEnemyAction(state, 'nao-existe', rngSeq)
    expect(action.type).toBe('defend')
  })

  it('aiPattern ausente usa fallback aggressive', () => {
    const heroes = make6Heroes(10)
    const state = createBattle(heroes, [makeEnemy('aggressive', 99)], 'ai-edge3')
    const enemyId = Object.values(state.combatants).find(c => c.isEnemy)!.id
    // Remove aiPattern para testar fallback
    const noPattern = {
      ...state,
      combatants: {
        ...state.combatants,
        [enemyId]: { ...state.combatants[enemyId], aiPattern: undefined },
      },
    }
    const action = chooseEnemyAction(noPattern, enemyId, rngSeq)
    expect(action.type).toBe('skill')
    const target = state.combatants[action.targetId!]
    expect(target.isEnemy).toBe(false)
  })
})
