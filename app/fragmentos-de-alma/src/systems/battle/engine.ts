// Motor de batalha — ver doc 06_sistema_de_batalha.md
// Máquina de estados pura: cada função recebe um BattleState e retorna um novo.
// Sem efeitos colaterais, sem estado global.

import type { Hero, Genome } from '../genes/types'
import type { Skill } from '../skills/types'
import { resolveSkill } from '../skills/resolver'
import {
  type BattleState, type BattleAction, type BattleEvent,
  type Combatant, type CombatSlot, type EnemySpec, type StatusEffect,
  ACTIVE_SLOTS, BENCH_SLOTS,
  isActiveSlot, isBenchSlot, isEnemySlot,
} from './types'

// ─── RNG determinístico ───────────────────────────────────────────────────────

// LCG — mesmo algoritmo de makeSeededRng, mas em forma de step puro (sem closure)
function stepRng(seed: number): { value: number; seed: number } {
  const next = ((Math.imul(1664525, seed) + 1013904223) | 0)
  return { value: (next >>> 0) / 0x100000000, seed: next }
}

function hashSeed(s: string): number {
  let h = 0
  for (const ch of s) h = (Math.imul(31, h) + ch.charCodeAt(0)) | 0
  return h
}

// ─── Fórmulas de stats ────────────────────────────────────────────────────────

// D24: HP máximo = resistencia × 10 + level × 20 + 100
export function computeHpMax(genome: Genome, level: number): number {
  return genome.attributes.resistencia * 10 + level * 20 + 100
}

// Taxa de carga do ultimate por ponto de dano
function ultimateChargeRate(genome: Genome): number {
  return Math.max(0.05, genome.attributes.ressonancia / 100)
}

// ─── Criação de combatentes ───────────────────────────────────────────────────

function heroCombatant(hero: Hero, slot: CombatSlot): Combatant {
  const maxHp = computeHpMax(hero.genome, hero.level)
  return {
    id: hero.id,
    name: hero.name,
    genome: hero.genome,
    rarity: hero.rarity,
    skills: hero.skills,
    level: hero.level,
    maxHp,
    currentHp: maxHp,
    ultimateCharge: hero.ultimateCharge,
    isDefending: false,
    isAlive: true,
    cooldowns: {},
    statusEffects: [],
    slot,
    isEnemy: false,
    generation: hero.generation,
  }
}

function enemyCombatant(enemy: EnemySpec, slot: CombatSlot): Combatant {
  const maxHp = computeHpMax(enemy.genome, enemy.level)
  return {
    id: enemy.id,
    name: enemy.name,
    genome: enemy.genome,
    rarity: enemy.rarity,
    skills: enemy.skills,
    level: enemy.level,
    maxHp,
    currentHp: maxHp,
    ultimateCharge: 0,
    isDefending: false,
    isAlive: true,
    cooldowns: {},
    statusEffects: [],
    slot,
    isEnemy: true,
    generation: 1,
    aiPattern: enemy.aiPattern,
  }
}

// ─── Ordem de turnos ─────────────────────────────────────────────────────────

// Apenas slots ativos e inimigos tomam turnos. Ordenados por agilidade ↓; tiebreaker por id.
export function computeTurnOrder(combatants: Record<string, Combatant>): string[] {
  return Object.values(combatants)
    .filter(c => c.isAlive && (isActiveSlot(c.slot) || isEnemySlot(c.slot)))
    .sort((a, b) => {
      const diff = b.genome.attributes.agilidade - a.genome.attributes.agilidade
      return diff !== 0 ? diff : a.id.localeCompare(b.id)
    })
    .map(c => c.id)
}

// ─── Criar batalha ────────────────────────────────────────────────────────────

export function createBattle(
  heroes: Hero[],
  enemies: EnemySpec[],
  seed: string
): BattleState {
  if (heroes.length !== 6) throw new Error('createBattle: requer 6 heróis.')
  if (enemies.length < 1 || enemies.length > 4) throw new Error('createBattle: 1–4 inimigos.')

  const combatants: Record<string, Combatant> = {}

  const activeSlots: CombatSlot[] = ['front', 'center', 'back']
  const benchSlots: CombatSlot[] = ['bench_a', 'bench_b', 'bench_c']

  for (let i = 0; i < 3; i++) combatants[heroes[i].id] = heroCombatant(heroes[i], activeSlots[i])
  for (let i = 3; i < 6; i++) combatants[heroes[i].id] = heroCombatant(heroes[i], benchSlots[i - 3])
  for (let i = 0; i < enemies.length; i++) combatants[enemies[i].id] = enemyCombatant(enemies[i], `enemy_${i}`)

  const turnOrder = computeTurnOrder(combatants)
  const initEvent: BattleEvent = { type: 'phase_change', actorId: 'system', label: 'Batalha iniciada.' }

  return {
    id: `battle_${seed}`,
    phase: 'active',
    combatants,
    turnOrder,
    currentTurnIndex: 0,
    turnNumber: 1,
    rngSeed: hashSeed(seed),
    log: [initEvent],
    pendingEvents: [initEvent],
  }
}

// ─── Helpers de imutabilidade ─────────────────────────────────────────────────

function updateCombatant(
  state: BattleState,
  id: string,
  patch: Partial<Combatant>
): BattleState {
  return {
    ...state,
    combatants: { ...state.combatants, [id]: { ...state.combatants[id], ...patch } },
  }
}

function addEvents(state: BattleState, events: BattleEvent[]): BattleState {
  return { ...state, log: [...state.log, ...events], pendingEvents: events }
}

// ─── Aplicação de eventos ao estado ──────────────────────────────────────────

function applyEvents(state: BattleState, events: BattleEvent[]): BattleState {
  let s = state
  for (const ev of events) {
    const target = ev.targetId ? s.combatants[ev.targetId] : undefined
    if (!target || ev.value === undefined) continue

    switch (ev.type) {
      case 'damage': {
        // Escudos absorvem dano primeiro
        let remaining = ev.value
        const newEffects = target.statusEffects.map(e =>
          e.type === 'shield' && remaining > 0
            ? (() => { const abs = Math.min(remaining, e.magnitude); remaining -= abs; return { ...e, magnitude: e.magnitude - abs } })()
            : e
        ).filter(e => e.type !== 'shield' || e.magnitude > 0)

        const newHp = Math.max(0, target.currentHp - remaining)
        const isAlive = newHp > 0
        s = updateCombatant(s, target.id, { currentHp: newHp, isAlive, statusEffects: newEffects })

        // Ultimate charge — atacante
        if (ev.actorId && s.combatants[ev.actorId]) {
          const actor = s.combatants[ev.actorId]
          const gain = Math.round(ev.value * ultimateChargeRate(actor.genome))
          s = updateCombatant(s, actor.id, { ultimateCharge: Math.min(100, actor.ultimateCharge + gain) })
        }
        // Ultimate charge — defensor (50% da taxa)
        if (isAlive && remaining > 0) {
          const defGain = Math.round(remaining * 0.5 * ultimateChargeRate(target.genome))
          s = updateCombatant(s, target.id, { ultimateCharge: Math.min(100, target.ultimateCharge + defGain) })
        }

        if (!isAlive) {
          const deathEv: BattleEvent = { type: 'death', actorId: target.id, label: `${target.name} foi derrotado.` }
          s = { ...s, log: [...s.log, deathEv], pendingEvents: [...s.pendingEvents, deathEv] }
          s = { ...s, turnOrder: computeTurnOrder(s.combatants) }
        }
        break
      }
      case 'heal': {
        s = updateCombatant(s, target.id, { currentHp: Math.min(target.maxHp, target.currentHp + ev.value) })
        break
      }
      case 'shield_apply': {
        const shield: StatusEffect = {
          id: `shield_${ev.skillId}_${s.turnNumber}`,
          label: 'Escudo',
          type: 'shield',
          magnitude: ev.value,
          turnsRemaining: 2,
          sourceId: ev.actorId,
        }
        s = updateCombatant(s, target.id, { statusEffects: [...target.statusEffects, shield] })
        break
      }
      case 'buff_apply': {
        const buff: StatusEffect = {
          id: `buff_${ev.skillId}_${s.turnNumber}`,
          label: 'Fortalecido',
          type: 'buff',
          stat: 'forca',
          magnitude: 1.2,
          turnsRemaining: 2,
          sourceId: ev.actorId,
        }
        s = updateCombatant(s, target.id, { statusEffects: [...target.statusEffects, buff] })
        break
      }
      case 'debuff_apply': {
        const debuff: StatusEffect = {
          id: `debuff_${ev.skillId}_${s.turnNumber}`,
          label: 'Enfraquecido',
          type: 'debuff',
          stat: 'resistencia',
          magnitude: 0.8,
          turnsRemaining: 2,
          sourceId: ev.actorId,
        }
        s = updateCombatant(s, target.id, { statusEffects: [...target.statusEffects, debuff] })
        break
      }
    }
  }
  return s
}

// ─── Ações ────────────────────────────────────────────────────────────────────

function doSkill(state: BattleState, action: BattleAction): BattleState {
  const actor = state.combatants[action.actorId]
  if (!actor?.isAlive) return state

  const skill = findSkill(actor, action.skillId)
  if (!skill) return state
  if ((actor.cooldowns[skill.id] ?? 0) > 0) return state

  const target = action.targetId
    ? state.combatants[action.targetId]
    : pickDefaultTarget(state, actor)

  let rngSeed = state.rngSeed
  const stepRngFn = (): number => { const r = stepRng(rngSeed); rngSeed = r.seed; return r.value }

  const events = resolveSkill(skill, { actor, target: target ?? null, state, stepRng: stepRngFn })
  const cdTurns = skill.modifier ? 2 : 1

  let s = { ...state, rngSeed }
  s = applyEvents(s, events)
  s = updateCombatant(s, actor.id, {
    cooldowns: { ...actor.cooldowns, [skill.id]: cdTurns },
    isDefending: false,
    lastSkillId: skill.id,
  })
  s = addEvents(s, events)
  return checkPhase(s)
}

function doUltimate(state: BattleState, action: BattleAction): BattleState {
  const actor = state.combatants[action.actorId]
  if (!actor?.isAlive || actor.ultimateCharge < 100) return state

  const ult = actor.skills.unique[0] ?? actor.skills.emergent[0]
  if (!ult) return state

  const target = action.targetId
    ? state.combatants[action.targetId]
    : pickDefaultTarget(state, actor)

  let rngSeed = state.rngSeed
  const stepRngFn = (): number => { const r = stepRng(rngSeed); rngSeed = r.seed; return r.value }

  const events = resolveSkill(ult, { actor, target: target ?? null, state, stepRng: stepRngFn })
  const ultEv: BattleEvent = { type: 'ultimate_used', actorId: actor.id, skillId: ult.id, label: `${actor.name} usa Ultimate: ${ult.name}!` }

  let s = { ...state, rngSeed }
  s = applyEvents(s, events)
  s = updateCombatant(s, actor.id, { ultimateCharge: 0, isDefending: false })
  s = addEvents(s, [ultEv, ...events])
  return checkPhase(s)
}

function doDefend(state: BattleState, action: BattleAction): BattleState {
  const actor = state.combatants[action.actorId]
  if (!actor?.isAlive) return state
  const ev: BattleEvent = { type: 'defend', actorId: actor.id, label: `${actor.name} se defende.` }
  return addEvents(updateCombatant(state, actor.id, { isDefending: true }), [ev])
}

function doSwap(state: BattleState, action: BattleAction): BattleState {
  const actor = state.combatants[action.actorId]
  const incoming = action.swapInId ? state.combatants[action.swapInId] : undefined
  if (!actor?.isAlive || !incoming?.isAlive) return state
  if (!isActiveSlot(actor.slot) || !isBenchSlot(incoming.slot)) return state

  const activeSlot = actor.slot
  const benchSlot = incoming.slot
  const ev: BattleEvent = { type: 'swap', actorId: actor.id, targetId: incoming.id, label: `${actor.name} troca com ${incoming.name}.` }

  let s = updateCombatant(state, actor.id, { slot: benchSlot, isDefending: false })
  s = updateCombatant(s, incoming.id, { slot: activeSlot })
  s = { ...s, turnOrder: computeTurnOrder(s.combatants) }
  return addEvents(s, [ev])
}

// ─── API pública ──────────────────────────────────────────────────────────────

export function applyAction(state: BattleState, action: BattleAction): BattleState {
  if (state.phase !== 'active') return state
  switch (action.type) {
    case 'skill':    return doSkill(state, action)
    case 'ultimate': return doUltimate(state, action)
    case 'defend':   return doDefend(state, action)
    case 'swap':     return doSwap(state, action)
    default:         return state
  }
}

// Início de turno: aplica DoT e ticks de status, emite TurnStart.
export function startTurn(state: BattleState): BattleState {
  const actorId = state.turnOrder[state.currentTurnIndex]
  if (!actorId) return state

  const actor = state.combatants[actorId]
  const events: BattleEvent[] = [{ type: 'turn_start', actorId, label: `Turno de ${actor.name}.` }]
  let s: BattleState = state

  const surviving: StatusEffect[] = []
  for (const eff of actor.statusEffects) {
    if (eff.type === 'dot') {
      const dmg = Math.round(eff.magnitude)
      events.push({ type: 'status_tick', actorId, value: dmg, label: `${actor.name} sofre ${dmg} de ${eff.label}.` })
      s = applyEvents(s, [{ type: 'damage', actorId: 'system', targetId: actorId, value: dmg, label: '' }])
    }
    const remaining = eff.turnsRemaining - 1
    if (remaining > 0) surviving.push({ ...eff, turnsRemaining: remaining })
    else events.push({ type: 'status_expire', actorId, label: `${eff.label} expirou.` })
  }

  s = updateCombatant(s, actorId, { statusEffects: surviving })
  return addEvents(s, events)
}

// Fim de turno: ticks de cooldown, carga passiva do banco, avança turno.
export function endTurn(state: BattleState): BattleState {
  const actorId = state.turnOrder[state.currentTurnIndex]
  if (!actorId) return state

  const actor = state.combatants[actorId]
  const cdEvents: BattleEvent[] = []
  const newCooldowns: Record<string, number> = {}

  for (const [id, cd] of Object.entries(actor.cooldowns)) {
    if (cd > 1) {
      newCooldowns[id] = cd - 1
      cdEvents.push({ type: 'cooldown_tick', actorId, skillId: id, label: `${id}: ${cd - 1} turnos.` })
    }
  }

  let s = updateCombatant(state, actorId, { cooldowns: newCooldowns, isDefending: false })

  // Banco carrega ultimate a 50%
  for (const c of Object.values(s.combatants)) {
    if (isBenchSlot(c.slot) && c.isAlive && !c.isEnemy) {
      const gain = Math.round(2 * 0.5 * ultimateChargeRate(c.genome))
      if (gain > 0) s = updateCombatant(s, c.id, { ultimateCharge: Math.min(100, c.ultimateCharge + gain) })
    }
  }

  const nextIndex = (state.currentTurnIndex + 1) % state.turnOrder.length
  const nextTurn = nextIndex === 0 ? state.turnNumber + 1 : state.turnNumber
  s = { ...s, currentTurnIndex: nextIndex, turnNumber: nextTurn }
  return addEvents(s, cdEvents)
}

// ─── Verificação de fase ──────────────────────────────────────────────────────

function checkPhase(state: BattleState): BattleState {
  const all = Object.values(state.combatants)
  if (all.filter(c => c.isEnemy).every(c => !c.isAlive)) {
    const ev: BattleEvent = { type: 'phase_change', actorId: 'system', label: 'Vitória!' }
    return addEvents({ ...state, phase: 'victory' }, [ev])
  }
  if (all.filter(c => !c.isEnemy).every(c => !c.isAlive)) {
    const ev: BattleEvent = { type: 'phase_change', actorId: 'system', label: 'Derrota.' }
    return addEvents({ ...state, phase: 'defeat' }, [ev])
  }
  return state
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

function findSkill(actor: Combatant, skillId: string | undefined): Skill | undefined {
  if (!skillId) return actor.skills.active[0]
  const all = [...actor.skills.active, ...actor.skills.passive, ...actor.skills.unique, ...actor.skills.emergent]
  return all.find(s => s.id === skillId)
}

function pickDefaultTarget(state: BattleState, actor: Combatant): Combatant | undefined {
  return Object.values(state.combatants).find(
    c => c.isAlive && c.isEnemy !== actor.isEnemy && (isActiveSlot(c.slot) || isEnemySlot(c.slot))
  )
}
