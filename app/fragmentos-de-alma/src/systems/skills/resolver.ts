// Resolução de habilidades em combate — ver doc 03 (anatomia) e doc 06 (batalha)
// Função pura: sem estado interno, sem efeitos colaterais.
import type { Skill } from './types'
import type { Combatant, BattleState, BattleEvent, StatusEffect } from '../battle/types'
import { isEnemySlot, isActiveSlot } from '../battle/types'
import { affinityMultiplier, affinityEffectiveness } from '../battle/affinityChart'

export interface ResolutionContext {
  actor: Combatant
  target: Combatant | null   // null para habilidades sem alvo
  state: BattleState
  stepRng: () => number      // RNG avança externamente; resolver apenas chama
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

function allies(ctx: ResolutionContext): Combatant[] {
  return Object.values(ctx.state.combatants).filter(
    c => c.isAlive && c.isEnemy === ctx.actor.isEnemy && c.id !== ctx.actor.id
  )
}

function enemies(ctx: ResolutionContext): Combatant[] {
  return Object.values(ctx.state.combatants).filter(
    c => c.isAlive && c.isEnemy !== ctx.actor.isEnemy && isActiveSlot(c.slot)
  )
}

function activeEnemies(ctx: ResolutionContext): Combatant[] {
  return Object.values(ctx.state.combatants).filter(
    c => c.isAlive && isEnemySlot(c.slot)
  )
}

// Multiplicadores de posição (doc 06: posição afeta habilidades)
function positionMultiplier(actor: Combatant, effectId: string): number {
  if (actor.slot === 'front') {
    if (effectId === 'E01') return 1.2   // +20% físico na frente
    if (effectId === 'E03' || effectId === 'E06') return 0.9
  }
  if (actor.slot === 'back') {
    if (effectId === 'E01') return 0.8   // -20% físico no fundo
    if (effectId === 'E03' || effectId === 'E06' || effectId === 'E07') return 1.2
  }
  return 1.0
}

// Fórmula base de dano (D24)
function calcDamage(
  power: number,
  attackStat: number,
  defenseStat: number,
  posMult: number,
  isDefending: boolean
): number {
  const base = power * (attackStat / 50) * (50 / Math.max(1, defenseStat))
  const defended = isDefending ? base * 0.5 : base
  return Math.max(1, Math.round(defended * posMult))
}

// ─── Verificação de condição ──────────────────────────────────────────────────

function checkCondition(skill: Skill, ctx: ResolutionContext): boolean {
  const { actor, target, state } = ctx
  switch (skill.condition.id) {
    case 'C01': return true
    case 'C02': // alvo abaixo de 50% HP
      return target !== null && target.currentHp / target.maxHp < 0.5
    case 'C03': // aliado com mesma afinidade vivo
      return allies(ctx).some(
        a => a.genome.essence.affinity === actor.genome.essence.affinity
      )
    case 'C04': // primeiro turno da batalha
      return state.turnNumber === 1
    case 'C05': // actor usou habilidade no turno anterior
      return actor.lastSkillId !== undefined && actor.lastSkillId !== skill.id
    case 'C06': // 3+ inimigos em campo
      return enemies(ctx).length >= 3
    case 'C07': // actor tem mutação
      return actor.genome.mutations.length > 0
    case 'C08': // linhagem com 3+ gerações
      return actor.generation >= 3
    case 'C09': // evento global (eclipse etc.) — sempre falso no MVP
      return false
    case 'C10': // passivo permanente
      return true
    default:
      return true
  }
}

// ─── Aplicação de modificador ─────────────────────────────────────────────────

// Expande os targets com base no modificador (M01 = área, M07 = afeta aliados também)
function resolveTargets(
  skill: Skill,
  primaryTarget: Combatant | null,
  ctx: ResolutionContext
): Combatant[] {
  if (!primaryTarget) return []
  const mod = skill.modifier?.id
  if (mod === 'M01') {
    // Em área: todos os inimigos/alvos do mesmo lado
    return primaryTarget.isEnemy
      ? Object.values(ctx.state.combatants).filter(c => c.isAlive && isActiveSlot(c.slot) && c.isEnemy)
      : Object.values(ctx.state.combatants).filter(c => c.isAlive && isActiveSlot(c.slot) && !c.isEnemy)
  }
  if (mod === 'M09') {
    // Ricochete: alvo primário + 1 alvo aleatório adicional
    const others = enemies(ctx).filter(c => c.id !== primaryTarget.id)
    if (others.length === 0) return [primaryTarget]
    const bounce = others[Math.floor(ctx.stepRng() * others.length)]
    return [primaryTarget, bounce]
  }
  return [primaryTarget]
}

// Escala de poder com modificadores numéricos
function scalePower(basePower: number, skill: Skill, actor: Combatant): number {
  const mod = skill.modifier?.id
  if (!mod) return basePower
  const attrs = actor.genome.attributes
  if (mod === 'M02') {
    // Proporcional ao atributo mais alto
    const maxAttr = Math.max(...Object.values(attrs))
    return Math.round(basePower * (maxAttr / 50))
  }
  if (mod === 'M04') {
    // Escala com inimigos derrotados (placeholder: +10% por default sem histórico)
    return Math.round(basePower * 1.1)
  }
  return basePower
}

function critMultiplier(skill: Skill, actor: Combatant, rng: () => number): number {
  if (skill.modifier?.id === 'M03' && actor.genome.attributes.agilidade > 60) {
    // Chance de crítico aumentada: base 30% → x1.5
    return rng() < 0.3 ? 1.5 : 1.0
  }
  return 1.0
}

// ─── Resolução de efeitos ─────────────────────────────────────────────────────

function resolveEffect(
  skill: Skill,
  scaledPower: number,
  targets: Combatant[],
  ctx: ResolutionContext
): BattleEvent[] {
  const { actor } = ctx
  const events: BattleEvent[] = []
  const posMult = positionMultiplier(actor, skill.effect.id)
  const crit = critMultiplier(skill, actor, ctx.stepRng)
  const attrs = actor.genome.attributes

  for (const target of targets) {
    const affinMult = affinityMultiplier(actor.genome.essence.affinity, target.genome.essence.affinity)
    const affinSuffix = (() => {
      const e = affinityEffectiveness(affinMult)
      if (e === 'super_efetivo') return ' — Super Efetivo!'
      if (e === 'efetivo') return ' — Efetivo!'
      if (e === 'muito_fraco') return ' — Muito Fraco...'
      if (e === 'fraco') return ' — Fraco...'
      return ''
    })()

    switch (skill.effect.id) {
      case 'E01': {  // Dano físico
        const dmg = Math.max(1, Math.round(
          calcDamage(scaledPower, attrs.forca, target.genome.attributes.resistencia, posMult, target.isDefending) * crit * affinMult
        ))
        events.push({ type: 'damage', actorId: actor.id, targetId: target.id, value: dmg, skillId: skill.id, label: `${actor.name} causa ${dmg} de dano físico em ${target.name}${affinSuffix}` })
        break
      }
      case 'E02': {  // Dano elemental
        const dmg = Math.max(1, Math.round(
          calcDamage(scaledPower, attrs.ressonancia, target.genome.attributes.resistencia, posMult, target.isDefending) * crit * affinMult
        ))
        events.push({ type: 'damage', actorId: actor.id, targetId: target.id, value: dmg, skillId: skill.id, label: `${actor.name} causa ${dmg} de dano elemental em ${target.name}${affinSuffix}` })
        break
      }
      case 'E03': {  // Cura
        const amount = Math.round(scaledPower * (attrs.aura / 50) * posMult)
        events.push({ type: 'heal', actorId: actor.id, targetId: target.id, value: amount, skillId: skill.id, label: `${actor.name} cura ${amount} HP em ${target.name}` })
        break
      }
      case 'E04': {  // Escudo
        const shield = Math.round(scaledPower * (attrs.resistencia / 50) * posMult)
        const effect: StatusEffect = {
          id: `shield_${skill.id}_${Date.now()}`,
          label: 'Escudo',
          type: 'shield',
          magnitude: shield,
          turnsRemaining: skill.modifier?.id === 'M08' ? 3 : 2,
          sourceId: actor.id,
        }
        events.push({ type: 'shield_apply', actorId: actor.id, targetId: target.id, value: shield, skillId: skill.id, label: `${actor.name} aplica escudo de ${shield} em ${target.name}` })
        void effect  // shield effect applied by engine when processing event
        break
      }
      case 'E05': {  // Debuff no inimigo
        events.push({ type: 'debuff_apply', actorId: actor.id, targetId: target.id, value: scaledPower, skillId: skill.id, label: `${actor.name} aplica debuff em ${target.name}` })
        break
      }
      case 'E06': {  // Buff em aliado
        events.push({ type: 'buff_apply', actorId: actor.id, targetId: target.id, value: scaledPower, skillId: skill.id, label: `${actor.name} fortalece ${target.name}` })
        break
      }
      case 'E07': {  // Invoca entidade (placeholder: evento registrado, lógica em Passo 13)
        events.push({ type: 'skill_used', actorId: actor.id, skillId: skill.id, label: `${actor.name} invoca entidade (${skill.name})` })
        break
      }
      case 'E08': {  // Drena recurso
        const drain = Math.max(1, Math.round(scaledPower * (attrs.vontade / 50) * affinMult))
        events.push({ type: 'damage', actorId: actor.id, targetId: target.id, value: drain, skillId: skill.id, label: `${actor.name} drena ${drain} de ${target.name}${affinSuffix}` })
        break
      }
      case 'E09': {  // Reposiciona (efeito de debuff de posição, simplificado)
        events.push({ type: 'debuff_apply', actorId: actor.id, targetId: target.id, value: scaledPower, skillId: skill.id, label: `${actor.name} desequilibra ${target.name}` })
        break
      }
      case 'E10': {  // Revive aliado (placeholder: somente regista o evento)
        events.push({ type: 'heal', actorId: actor.id, targetId: target.id, value: Math.round(target.maxHp * 0.3), skillId: skill.id, label: `${actor.name} revive ${target.name} com 30% de HP` })
        break
      }
    }
  }

  // M05: ignora defesa → remove metade do bloqueio de defending (a fórmula já calculou, mas marcamos)
  // M06: efeito secundário elemental — dano extra de afinidade
  if (skill.modifier?.id === 'M06' && targets.length > 0) {
    for (const target of targets) {
      const m = affinityMultiplier(actor.genome.essence.affinity, target.genome.essence.affinity)
      const secondary = Math.max(1, Math.round(scaledPower * 0.3 * m))
      events.push({ type: 'damage', actorId: actor.id, targetId: target.id, value: secondary, skillId: skill.id, label: `Efeito elemental secundário: ${secondary}` })
    }
  }

  return events
}

// ─── Entrada pública ─────────────────────────────────────────────────────────

export function resolveSkill(skill: Skill, ctx: ResolutionContext): BattleEvent[] {
  if (!checkCondition(skill, ctx)) return []

  const scaledPower = scalePower(skill.effect.power, skill, ctx.actor)
  const targets = resolveTargets(skill, ctx.target, ctx)

  const events: BattleEvent[] = [
    { type: 'skill_used', actorId: ctx.actor.id, skillId: skill.id, label: `${ctx.actor.name} usa ${skill.name}` }
  ]

  events.push(...resolveEffect(skill, scaledPower, targets, ctx))
  return events
}
