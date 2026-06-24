// IA de inimigos — escolhe ação baseada no aiPattern do Combatant (doc 07)
// Comportamentos por padrão:
//   aggressive → Destruidor: sempre ataca o herói com menor HP
//   defensive  → Guardião: ataca a Frente; usa buff em aliado em perigo
//   support    → Invocador: buffa aliados; debuff nos heróis; evita ataques diretos
//   random     → Trickster: aleatório; vira aggressive ao atingir 50% HP
// Função pura: sem estado interno, sem efeitos colaterais.

import type { BattleState, BattleAction, Combatant } from './types'
import { isActiveSlot, isEnemySlot } from './types'
import type { Skill } from '../skills/types'

// ─── Helpers de contexto ──────────────────────────────────────────────────────

function activeHeroes(state: BattleState): Combatant[] {
  return Object.values(state.combatants).filter(
    c => c.isAlive && !c.isEnemy && isActiveSlot(c.slot)
  )
}

function activeEnemyAllies(state: BattleState, excludeId: string): Combatant[] {
  return Object.values(state.combatants).filter(
    c => c.isAlive && c.isEnemy && c.id !== excludeId &&
         (isActiveSlot(c.slot) || isEnemySlot(c.slot))
  )
}

// ─── Seleção de habilidade ────────────────────────────────────────────────────

// Retorna habilidades ativas disponíveis (sem cooldown, não passivas)
export function availableActiveSkills(actor: Combatant): Skill[] {
  return actor.skills.active.filter(s => !s.isPassive && (actor.cooldowns[s.id] ?? 0) === 0)
}

function preferSkill(skills: Skill[], ...effectIds: string[]): Skill | undefined {
  for (const id of effectIds) {
    const found = skills.find(s => s.effect.id === id)
    if (found) return found
  }
  return undefined
}

function pickDamageSkill(skills: Skill[]): Skill {
  return preferSkill(skills, 'E01', 'E02', 'E08') ?? skills[0]
}

function pickSupportSkill(skills: Skill[]): Skill | undefined {
  return preferSkill(skills, 'E06', 'E04', 'E03')
}

function pickDebuffSkill(skills: Skill[]): Skill | undefined {
  return preferSkill(skills, 'E05', 'E09')
}

function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

// ─── Padrões ──────────────────────────────────────────────────────────────────

// Destruidor: ataca sempre o herói com menor HP
function aggressiveAction(
  state: BattleState,
  actor: Combatant,
  rng: () => number
): BattleAction {
  const heroes = activeHeroes(state)
  if (heroes.length === 0) return { type: 'defend', actorId: actor.id }

  const skills = availableActiveSkills(actor)
  if (skills.length === 0) return { type: 'defend', actorId: actor.id }

  const target = heroes.reduce((a, b) => (a.currentHp <= b.currentHp ? a : b))
  const skill = pickDamageSkill(skills)
  return { type: 'skill', actorId: actor.id, targetId: target.id, skillId: skill.id }
}

// Guardião: ataca a Frente; usa suporte em aliado em perigo (<40% HP)
function defensiveAction(
  state: BattleState,
  actor: Combatant,
  rng: () => number
): BattleAction {
  const skills = availableActiveSkills(actor)
  if (skills.length === 0) return { type: 'defend', actorId: actor.id }

  // Aliado em perigo
  const allies = activeEnemyAllies(state, actor.id)
  const allyInDanger = allies.find(a => a.currentHp / a.maxHp < 0.4)
  if (allyInDanger) {
    const supportSkill = pickSupportSkill(skills)
    if (supportSkill) {
      return { type: 'skill', actorId: actor.id, targetId: allyInDanger.id, skillId: supportSkill.id }
    }
  }

  // Ataca herói na Frente (ou o primeiro disponível)
  const heroes = activeHeroes(state)
  if (heroes.length === 0) return { type: 'defend', actorId: actor.id }
  const frontHero = heroes.find(h => h.slot === 'front') ?? heroes[0]
  const skill = pickDamageSkill(skills)
  return { type: 'skill', actorId: actor.id, targetId: frontHero.id, skillId: skill.id }
}

// Invocador: fortalece aliados; aplica debuffs; ataca apenas como último recurso
function supportAction(
  state: BattleState,
  actor: Combatant,
  rng: () => number
): BattleAction {
  const skills = availableActiveSkills(actor)
  if (skills.length === 0) return { type: 'defend', actorId: actor.id }

  const allies = activeEnemyAllies(state, actor.id)
  const heroes = activeHeroes(state)

  // Prefere buff no aliado com menos HP
  const supportSkill = pickSupportSkill(skills)
  if (supportSkill && allies.length > 0) {
    const allyTarget = allies.reduce((a, b) => (a.currentHp <= b.currentHp ? a : b))
    return { type: 'skill', actorId: actor.id, targetId: allyTarget.id, skillId: supportSkill.id }
  }

  // Debuff nos heróis
  const debuffSkill = pickDebuffSkill(skills)
  if (debuffSkill && heroes.length > 0) {
    const target = heroes[0]
    return { type: 'skill', actorId: actor.id, targetId: target.id, skillId: debuffSkill.id }
  }

  // Fallback: ataca herói com menor HP
  if (heroes.length > 0) {
    const target = heroes.reduce((a, b) => (a.currentHp <= b.currentHp ? a : b))
    const skill = pickDamageSkill(skills)
    return { type: 'skill', actorId: actor.id, targetId: target.id, skillId: skill.id }
  }

  return { type: 'defend', actorId: actor.id }
}

// Trickster: alvo e habilidade aleatórios; vira aggressive ao atingir ≤50% HP
function randomAction(
  state: BattleState,
  actor: Combatant,
  rng: () => number
): BattleAction {
  if (actor.currentHp / actor.maxHp <= 0.5) {
    return aggressiveAction(state, actor, rng)
  }

  const heroes = activeHeroes(state)
  if (heroes.length === 0) return { type: 'defend', actorId: actor.id }

  const skills = availableActiveSkills(actor)
  if (skills.length === 0) return { type: 'defend', actorId: actor.id }

  const target = pickRandom(heroes, rng)
  const skill = pickRandom(skills, rng)
  return { type: 'skill', actorId: actor.id, targetId: target.id, skillId: skill.id }
}

// ─── Entrada pública ──────────────────────────────────────────────────────────

export function chooseEnemyAction(
  state: BattleState,
  enemyId: string,
  rng: () => number
): BattleAction {
  const actor = state.combatants[enemyId]
  if (!actor?.isAlive || !actor.isEnemy) {
    return { type: 'defend', actorId: enemyId }
  }

  switch (actor.aiPattern ?? 'aggressive') {
    case 'aggressive': return aggressiveAction(state, actor, rng)
    case 'defensive':  return defensiveAction(state, actor, rng)
    case 'support':    return supportAction(state, actor, rng)
    case 'random':     return randomAction(state, actor, rng)
    default:           return aggressiveAction(state, actor, rng)
  }
}
