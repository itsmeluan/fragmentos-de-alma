import { describe, it, expect } from '@jest/globals'
import {
  getResonanceDef,
  isResonanceEligible,
  getResonanceVariant,
  hasExaltedForm,
  findResonancePairs,
  resolveResonance,
  RESONANCE_TABLE,
} from './resonance'
import type { Combatant, BattleState } from './types'
import type { Genome } from '../genes/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeGenome(affinity: string, forca = 50, ressonancia = 50, aura = 50, agilidade = 50, resistencia = 50, vontade = 50, mutations: unknown[] = []): Genome {
  return {
    attributes: { forca, resistencia, agilidade, ressonancia, aura, vontade },
    essence: {
      affinity: affinity as Genome['essence']['affinity'],
      coreType: 'Destruidor',
      tier: 'Primário',
    },
    mutations: mutations as Genome['mutations'],
  }
}

function makeCombatant(overrides: Partial<Combatant> & { id: string; name: string; genome: Genome }): Combatant {
  return {
    rarity: 'raro',
    skills: { active: [], passive: [], unique: [], emergent: [] },
    level: 10,
    maxHp: 800,
    currentHp: 800,
    ultimateCharge: 100,
    isDefending: false,
    isAlive: true,
    cooldowns: {},
    statusEffects: [],
    slot: 'front',
    isEnemy: false,
    generation: 1,
    bond: 50,   // ≥ 3★ (heroBondStars(50) = 3, threshold=[10,25,50,100,200])
    resonanceExaustaRemaining: 0,
    ...overrides,
  }
}

function makeState(combatants: Record<string, Combatant>): BattleState {
  return {
    id: 'test',
    phase: 'active',
    combatants,
    turnOrder: [],
    currentTurnIndex: 0,
    turnNumber: 1,
    rngSeed: 42,
    log: [],
    pendingEvents: [],
  }
}

const heroAgua = makeCombatant({ id: 'h1', name: 'Aqua', genome: makeGenome('Água'), slot: 'front' })
const heroTerra = makeCombatant({ id: 'h2', name: 'Terra', genome: makeGenome('Terra'), slot: 'center' })
const heroFogo = makeCombatant({ id: 'h3', name: 'Fogo', genome: makeGenome('Fogo'), slot: 'back' })
const heroVento = makeCombatant({ id: 'h4', name: 'Vento', genome: makeGenome('Vento'), slot: 'front' })
const heroLuz = makeCombatant({ id: 'h5', name: 'Luz', genome: makeGenome('Luz'), slot: 'center' })
const heroSombra = makeCombatant({ id: 'h6', name: 'Sombra', genome: makeGenome('Sombra'), slot: 'back' })

const enemySimple = makeCombatant({
  id: 'e1', name: 'Inimigo', genome: makeGenome('Fogo'),
  isEnemy: true, slot: 'enemy_0' as Combatant['slot'],
  ultimateCharge: 0, bond: 0,
})

// ─── getResonanceDef ─────────────────────────────────────────────────────────

describe('getResonanceDef', () => {
  it('encontra Dilúvio Pétreo (água+terra)', () => {
    expect(getResonanceDef('Água', 'Terra')?.name).toBe('Dilúvio Pétreo')
  })

  it('tabela é simétrica — terra+água também funciona', () => {
    expect(getResonanceDef('Terra', 'Água')?.name).toBe('Dilúvio Pétreo')
  })

  it('encontra Colapso Dimensional (éter+vazio)', () => {
    expect(getResonanceDef('Éter', 'Vazio')?.name).toBe('Colapso Dimensional')
  })

  it('encontra Tempestade Ardente (fogo+vento)', () => {
    expect(getResonanceDef('Fogo', 'Vento')?.name).toBe('Tempestade Ardente')
  })

  it('encontra Colisão Primordial (luz+sombra)', () => {
    expect(getResonanceDef('Luz', 'Sombra')?.name).toBe('Colisão Primordial')
  })

  it('encontra Fluxo Primordial (água+vazio) — suporte', () => {
    expect(getResonanceDef('Água', 'Vazio')?.type).toBe('suporte')
  })

  it('encontra Chuva Sagrada (água+vento) — cura', () => {
    expect(getResonanceDef('Água', 'Vento')?.type).toBe('cura')
  })

  it('retorna undefined para par sem sinergia (água+fogo)', () => {
    expect(getResonanceDef('Água', 'Fogo')).toBeUndefined()
  })

  it('retorna undefined para mesmo elemento', () => {
    expect(getResonanceDef('Fogo', 'Fogo')).toBeUndefined()
  })
})

describe('RESONANCE_TABLE — estrutura', () => {
  it('tem exatamente 12 entradas', () => {
    expect(RESONANCE_TABLE.length).toBe(12)
  })

  it('4 pares de DANO', () => {
    expect(RESONANCE_TABLE.filter(r => r.type === 'dano').length).toBe(4)
  })

  it('4 pares de SUPORTE', () => {
    expect(RESONANCE_TABLE.filter(r => r.type === 'suporte').length).toBe(4)
  })

  it('4 pares de CURA', () => {
    expect(RESONANCE_TABLE.filter(r => r.type === 'cura').length).toBe(4)
  })

  it('todos os 8 elementos aparecem como affinityA ou affinityB', () => {
    const affinities = new Set<string>()
    RESONANCE_TABLE.forEach(r => { affinities.add(r.affinityA); affinities.add(r.affinityB) })
    expect(affinities.size).toBe(8)
  })
})

// ─── isResonanceEligible ──────────────────────────────────────────────────────

describe('isResonanceEligible', () => {
  it('aprovado quando todos os critérios são atendidos', () => {
    expect(isResonanceEligible(heroAgua, heroTerra)).toBe(true)
  })

  it('reprovado se herói no banco', () => {
    const bench = { ...heroTerra, slot: 'bench_a' as Combatant['slot'] }
    expect(isResonanceEligible(heroAgua, bench)).toBe(false)
  })

  it('reprovado se herói morto', () => {
    const dead = { ...heroTerra, isAlive: false }
    expect(isResonanceEligible(heroAgua, dead)).toBe(false)
  })

  it('reprovado se raridade abaixo de Raro', () => {
    const common = { ...heroTerra, rarity: 'incomum' as const }
    expect(isResonanceEligible(heroAgua, common)).toBe(false)
  })

  it('aprovado com raridade Épico', () => {
    const epic = { ...heroTerra, rarity: 'epico' as const }
    expect(isResonanceEligible(heroAgua, epic)).toBe(true)
  })

  it('reprovado se vínculo baixo (< 3★)', () => {
    const lowBond = { ...heroTerra, bond: 9 }  // heroBondStars(9) = 0
    expect(isResonanceEligible(heroAgua, lowBond)).toBe(false)
  })

  it('reprovado se ultimate não está em 100%', () => {
    const noUlt = { ...heroTerra, ultimateCharge: 80 }
    expect(isResonanceEligible(heroAgua, noUlt)).toBe(false)
  })

  it('reprovado se herói está em Ressonância Exausta', () => {
    const exausta = { ...heroTerra, resonanceExaustaRemaining: 1 }
    expect(isResonanceEligible(heroAgua, exausta)).toBe(false)
  })

  it('reprovado se afinidades sem sinergia (água+fogo)', () => {
    expect(isResonanceEligible(heroAgua, heroFogo)).toBe(false)
  })
})

// ─── getResonanceVariant ──────────────────────────────────────────────────────

describe('getResonanceVariant', () => {
  it('bruta quando forca domina', () => {
    const h = makeCombatant({ id: 'x', name: 'X', genome: makeGenome('Água', 90, 30, 30, 30, 40, 30) })
    expect(getResonanceVariant(h, h)).toBe('bruta')
  })

  it('elemental quando ressonancia domina', () => {
    const h = makeCombatant({ id: 'x', name: 'X', genome: makeGenome('Água', 30, 90, 80, 30, 30, 30) })
    expect(getResonanceVariant(h, h)).toBe('elemental')
  })

  it('agil quando agilidade domina', () => {
    const h = makeCombatant({ id: 'x', name: 'X', genome: makeGenome('Água', 30, 30, 30, 90, 30, 80) })
    expect(getResonanceVariant(h, h)).toBe('agil')
  })
})

// ─── hasExaltedForm ───────────────────────────────────────────────────────────

describe('hasExaltedForm', () => {
  it('false quando nenhum tem mutação', () => {
    expect(hasExaltedForm(heroAgua, heroTerra)).toBe(false)
  })

  it('true quando heroA tem mutação', () => {
    const mutated = { ...heroAgua, genome: makeGenome('Água', 50, 50, 50, 50, 50, 50, [{ id: 'M1' }]) }
    expect(hasExaltedForm(mutated, heroTerra)).toBe(true)
  })

  it('true quando heroB tem mutação', () => {
    const mutated = { ...heroTerra, genome: makeGenome('Terra', 50, 50, 50, 50, 50, 50, [{ id: 'M1' }]) }
    expect(hasExaltedForm(heroAgua, mutated)).toBe(true)
  })
})

// ─── findResonancePairs ───────────────────────────────────────────────────────

describe('findResonancePairs', () => {
  it('encontra um par sinérgico', () => {
    const state = makeState({ [heroAgua.id]: heroAgua, [heroTerra.id]: heroTerra, [enemySimple.id]: enemySimple })
    const pairs = findResonancePairs(state)
    expect(pairs.length).toBe(1)
    expect(pairs[0].def.name).toBe('Dilúvio Pétreo')
  })

  it('não encontra pares sem sinergia (água+fogo)', () => {
    const state = makeState({ [heroAgua.id]: heroAgua, [heroFogo.id]: heroFogo, [enemySimple.id]: enemySimple })
    expect(findResonancePairs(state).length).toBe(0)
  })

  it('encontra múltiplos pares em time de 3', () => {
    // água+terra=DANO, fogo+vento=DANO, luz+sombra=DANO — mas só 2 no campo ativo simultaneamente
    // água+terra e fogo+vento não coexistem nos 3 slots ativos; testamos água+terra + água+vento
    // Água com Terra (DANO) e Água com Vento (CURA) no mesmo campo:
    const heroVentoSlot = { ...heroVento, slot: 'back' as Combatant['slot'] }
    const state = makeState({
      [heroAgua.id]: heroAgua,
      [heroTerra.id]: heroTerra,
      [heroVentoSlot.id]: heroVentoSlot,
      [enemySimple.id]: enemySimple,
    })
    const pairs = findResonancePairs(state)
    expect(pairs.length).toBe(2)
  })

  it('ignora heróis no banco', () => {
    const bench = { ...heroTerra, slot: 'bench_a' as Combatant['slot'] }
    const state = makeState({ [heroAgua.id]: heroAgua, [bench.id]: bench, [enemySimple.id]: enemySimple })
    expect(findResonancePairs(state).length).toBe(0)
  })

  it('ignora inimigos', () => {
    const enemyTerra = { ...enemySimple, genome: makeGenome('Terra'), isEnemy: true, bond: 0 }
    const state = makeState({ [heroAgua.id]: heroAgua, [enemyTerra.id]: enemyTerra })
    expect(findResonancePairs(state).length).toBe(0)
  })
})

// ─── resolveResonance ─────────────────────────────────────────────────────────

describe('resolveResonance — Dilúvio Pétreo (DANO)', () => {
  const state = makeState({
    [heroAgua.id]: heroAgua,
    [heroTerra.id]: heroTerra,
    [enemySimple.id]: enemySimple,
  })
  const def = getResonanceDef('Água', 'Terra')!
  const pair = { heroA: heroAgua, heroB: heroTerra, def, variant: 'bruta' as const, exaltada: false }
  const events = resolveResonance(pair, state)

  it('emite evento resonance_used', () => {
    expect(events.some(e => e.type === 'resonance_used')).toBe(true)
  })

  it('emite evento resonance_exausta', () => {
    expect(events.some(e => e.type === 'resonance_exausta')).toBe(true)
  })

  it('emite dano ao inimigo', () => {
    expect(events.some(e => e.type === 'damage' && e.targetId === enemySimple.id)).toBe(true)
  })

  it('dano é positivo', () => {
    const dmgEvent = events.find(e => e.type === 'damage' && e.targetId === enemySimple.id)
    expect((dmgEvent?.value ?? 0) > 0).toBe(true)
  })
})

describe('resolveResonance — Chuva Sagrada (CURA)', () => {
  const state = makeState({
    [heroAgua.id]: heroAgua,
    [heroVento.id]: heroVento,
    [enemySimple.id]: enemySimple,
  })
  const def = getResonanceDef('Água', 'Vento')!
  const pair = { heroA: heroAgua, heroB: heroVento, def, variant: 'elemental' as const, exaltada: false }
  const events = resolveResonance(pair, state)

  it('emite cura aos aliados', () => {
    expect(events.some(e => e.type === 'heal')).toBe(true)
  })

  it('não causa dano a aliados', () => {
    const healTargets = events.filter(e => e.type === 'heal').map(e => e.targetId)
    for (const id of healTargets) {
      expect(state.combatants[id!]?.isEnemy).toBe(false)
    }
  })
})

describe('resolveResonance — Forma Exaltada amplifica efeito', () => {
  const state = makeState({
    [heroAgua.id]: heroAgua,
    [heroTerra.id]: heroTerra,
    [enemySimple.id]: enemySimple,
  })
  const def = getResonanceDef('Água', 'Terra')!
  const normalPair = { heroA: heroAgua, heroB: heroTerra, def, variant: 'bruta' as const, exaltada: false }
  const exaltedPair = { heroA: heroAgua, heroB: heroTerra, def, variant: 'bruta' as const, exaltada: true }

  it('Forma Exaltada causa mais dano', () => {
    const normalDmg = resolveResonance(normalPair, state).find(e => e.type === 'damage')?.value ?? 0
    const exaltedDmg = resolveResonance(exaltedPair, state).find(e => e.type === 'damage')?.value ?? 0
    expect(exaltedDmg).toBeGreaterThan(normalDmg)
  })
})

describe('resolveResonance — Chama Alquímica (SUPORTE)', () => {
  const heroEter = makeCombatant({ id: 'he', name: 'Éter', genome: makeGenome('Éter'), slot: 'front' })
  const heroFogoAlt = makeCombatant({ id: 'hf', name: 'Fogo2', genome: makeGenome('Fogo'), slot: 'center' })
  const state = makeState({
    [heroEter.id]: heroEter,
    [heroFogoAlt.id]: heroFogoAlt,
    [enemySimple.id]: enemySimple,
  })
  const def = getResonanceDef('Éter', 'Fogo')!
  const pair = { heroA: heroEter, heroB: heroFogoAlt, def, variant: 'elemental' as const, exaltada: false }
  const events = resolveResonance(pair, state)

  it('emite ultimate_charged para aliados', () => {
    expect(events.some(e => e.type === 'ultimate_charged')).toBe(true)
  })

  it('carga é positiva', () => {
    const chargeEv = events.find(e => e.type === 'ultimate_charged')
    expect((chargeEv?.value ?? 0) > 0).toBe(true)
  })
})
