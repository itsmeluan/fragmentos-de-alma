// Sistema de chefes com 3 fases — ver doc 07 (inimigos, chefes e recompensas)
// Lógica pura: sem estado interno, sem efeitos colaterais.

import { generateFragmentGenome } from '../genes/generator'
import { calculateRarity } from '../genes/rarity'
import { generateSkills } from '../skills/generator'
import { generateName } from '../../utils/nameGenerator'
import { computeHpMax } from './engine'
import {
  type BattleState, type BattleAction, type Combatant,
  type BossSpec, type BossUniqueAbilityType, type BattleEvent,
  type StatusEffect,
  isActiveSlot,
} from './types'
import { BIOMES, type BiomeId } from '../progression/dungeon'

// ─── Constantes de fase (ajustáveis pela IA Coletiva no futuro) ──────────────

export const PHASE2_TRIGGER = 0.60  // boss entra na fase 2 ao atingir ≤60% HP
export const PHASE3_TRIGGER = 0.30  // boss entra na fase 3 ao atingir ≤30% HP

// Habilidade única disparada a cada N ataques na fase 3
const UNIQUE_ABILITY_CHARGE_INTERVAL = 3

// ─── Metadados das habilidades únicas ────────────────────────────────────────

export const BOSS_ABILITY_INFO: Record<BossUniqueAbilityType, { name: string; warningText: string }> = {
  devastacao:        { name: 'Devastação',         warningText: 'concentra toda a sua corrupção para um golpe definitivo...' },
  corrupcao:         { name: 'Corrupção Alquímica', warningText: 'distorce o Prima ao redor dos heróis, invertendo sua essência...' },
  invocacao_massiva: { name: 'Invocação Massiva',   warningText: 'convoca almas corrompidas das sombras para reforçar suas fileiras...' },
  roubo_de_alma:     { name: 'Roubo de Alma',       warningText: 'observa os heróis atentamente, absorvendo suas técnicas...' },
  colapso:           { name: 'Colapso',              warningText: 'drena a força vital de todos os heróis em um único pulso...' },
}

// ─── Lore procedural por tipo de habilidade ───────────────────────────────────

const BOSS_LORE_TEMPLATES: Record<BossUniqueAbilityType, string[]> = {
  devastacao: [
    'Uma alma consumida pelo ódio puro da corrupção.',
    'Cada golpe carrega séculos de Prima distorcido.',
    'Fraqueza: frequências de cura e escudo.',
  ],
  corrupcao: [
    'Nasceu da inversão alquímica — o que nutre em seus olhos destrói.',
    'Sua presença transforma proteção em veneno.',
    'Fraqueza: heróis sem buffs ativos resistem melhor.',
  ],
  invocacao_massiva: [
    'Não combate sozinho — convoca fragmentos de almas esquecidas.',
    'Cada aliado invocado é uma memória corrompida do bioma.',
    'Fraqueza: eliminar os convocados enfraquece o núcleo.',
  ],
  roubo_de_alma: [
    'Observa antes de agir — aprende com cada habilidade usada.',
    'Volta suas próprias técnicas contra você.',
    'Fraqueza: variar as habilidades dificulta o roubo.',
  ],
  colapso: [
    'Drena a essência de múltiplas almas de uma vez.',
    'Não mata — deixa as vítimas à beira do fim.',
    'Fraqueza: manter cura disponível após o pulso.',
  ],
}

// ─── Fraquezas por afinidade (oposta à dominante) ─────────────────────────────

// Afinidades conforme genes/types.ts Affinity: Fogo | Água | Terra | Vento | Vazio | Luz | Sombra | Éter
const AFFINITY_OPPOSITES: Record<string, string> = {
  'Fogo':   'Água',
  'Água':   'Fogo',
  'Terra':  'Vento',
  'Vento':  'Terra',
  'Luz':    'Sombra',
  'Sombra': 'Luz',
  'Vazio':  'Éter',
  'Éter':   'Vazio',
}

function chooseWeakness(baseAffinity: string, _seed: string): string {
  return AFFINITY_OPPOSITES[baseAffinity] ?? 'Éter'
}

function chooseUniqueAbility(seed: string): BossUniqueAbilityType {
  const types: BossUniqueAbilityType[] = [
    'devastacao', 'corrupcao', 'invocacao_massiva', 'roubo_de_alma', 'colapso',
  ]
  // Hash seed to index
  let h = 0
  for (const ch of seed) h = (Math.imul(31, h) + ch.charCodeAt(0)) | 0
  return types[Math.abs(h) % types.length]
}

// ─── Geração de chefe ─────────────────────────────────────────────────────────

export function generateBoss(biome: BiomeId, floor: number, seed: string): BossSpec {
  const genome = generateFragmentGenome()
  const config = BIOMES[biome]

  // Chefes são muito mais fortes que inimigos comuns
  genome.attributes.forca        = Math.min(100, genome.attributes.forca + floor * 6 + 20)
  genome.attributes.resistencia  = Math.min(100, genome.attributes.resistencia + floor * 5 + 15)
  genome.attributes.ressonancia  = Math.min(100, genome.attributes.ressonancia + floor * 4 + 10)
  genome.attributes.agilidade    = Math.min(100, genome.attributes.agilidade + floor * 2 + 5)
  genome.attributes.aura         = Math.min(100, genome.attributes.aura + floor * 3 + 8)

  // Corrupção de bioma (mesma lógica dos inimigos comuns)
  for (const [attr, bonus] of Object.entries(config.attrBoost)) {
    if (bonus === undefined) continue
    const k = attr as keyof typeof genome.attributes
    genome.attributes[k] = Math.min(100, (genome.attributes[k] ?? 50) + bonus)
  }
  for (const [attr, penalty] of Object.entries(config.attrPenalty)) {
    if (penalty === undefined) continue
    const k = attr as keyof typeof genome.attributes
    genome.attributes[k] = Math.max(1, (genome.attributes[k] ?? 50) - penalty)
  }

  const rarity = floor >= 8 ? 'lendario' : floor >= 5 ? 'epico' : 'raro'
  const calculatedRarity = calculateRarity(genome)
  // Chefes nunca ficam abaixo da raridade de piso do andar
  const rarityOrder = ['comum', 'incomum', 'raro', 'epico', 'lendario', 'unico']
  const finalRarity = rarityOrder.indexOf(calculatedRarity) >= rarityOrder.indexOf(rarity)
    ? calculatedRarity
    : rarity as typeof calculatedRarity

  // Chefe tem até 4 skills ativas (fase 1: 2, fase 2: 3, fase 3: todas 4)
  const baseSkills = generateSkills(genome, finalRarity, seed)
  const extraSkills = generateSkills(genome, finalRarity, seed + '_p2')
  const phase3Skills = generateSkills(genome, finalRarity, seed + '_p3')

  const allActive = [
    ...baseSkills.active.slice(0, 2),           // fase 1
    ...(extraSkills.active.slice(0, 1)),         // desbloqueada na fase 2
    ...(phase3Skills.active.slice(0, 1)),        // desbloqueada na fase 3
  ]

  const id = `boss-${biome}-f${floor}-${seed}`
  const weakness = chooseWeakness(genome.essence.affinity, seed)
  const uniqueAbilityType = chooseUniqueAbility(seed)

  return {
    id,
    name: generateName(genome, seed),
    genome,
    rarity: finalRarity,
    skills: { ...baseSkills, active: allActive },
    level: Math.max(1, floor + 2),
    aiPattern: 'aggressive',
    isBoss: true,
    weakness,
    uniqueAbilityType,
    loreLines: BOSS_LORE_TEMPLATES[uniqueAbilityType],
  }
}

// ─── Detecção de fase ─────────────────────────────────────────────────────────

export function getBossPhase(hpRatio: number): 1 | 2 | 3 {
  if (hpRatio <= PHASE3_TRIGGER) return 3
  if (hpRatio <= PHASE2_TRIGGER) return 2
  return 1
}

// Retorna 0 se não houve transição, 2 ou 3 se houve (novo número de fase)
export function detectPhaseTransition(prevHp: number, currHp: number, maxHp: number): 0 | 2 | 3 {
  const prevRatio = prevHp / maxHp
  const currRatio = currHp / maxHp
  if (prevRatio > PHASE3_TRIGGER && currRatio <= PHASE3_TRIGGER) return 3
  if (prevRatio > PHASE2_TRIGGER && currRatio <= PHASE2_TRIGGER) return 2
  return 0
}

// ─── Helpers internos ────────────────────────────────────────────────────────

function updateCombatant(state: BattleState, id: string, patch: Partial<Combatant>): BattleState {
  return {
    ...state,
    combatants: { ...state.combatants, [id]: { ...state.combatants[id], ...patch } },
  }
}

function appendEvents(state: BattleState, events: BattleEvent[]): BattleState {
  return { ...state, log: [...state.log, ...events], pendingEvents: [...state.pendingEvents, ...events] }
}

// ─── Processamento de transição de fase ──────────────────────────────────────

export function processBossPhaseTransition(state: BattleState, bossId: string): BattleState {
  const boss = state.combatants[bossId]
  if (!boss?.isBoss || !boss.isAlive) return state

  const hpRatio = boss.currentHp / boss.maxHp
  const newPhase = getBossPhase(hpRatio)
  const currentPhase = boss.bossPhase ?? 1

  if (newPhase <= currentPhase) return state  // sem transição (fase já atingida ou inimigo regenando HP)

  const ev: BattleEvent = {
    type: 'boss_phase_change',
    actorId: bossId,
    value: newPhase,
    label: `${boss.name} entra na Fase ${newPhase}! Sua corrupção se intensifica.`,
  }
  let s = updateCombatant(state, bossId, { bossPhase: newPhase })
  s = appendEvents(s, [ev])
  return s
}

// ─── IA de chefe: escolha de ação ─────────────────────────────────────────────

// Retorna skills disponíveis com base na fase atual do chefe
function bossAvailableSkills(boss: Combatant): typeof boss.skills.active {
  const phase = boss.bossPhase ?? 1
  const maxSkills = phase === 1 ? 2 : phase === 2 ? 3 : boss.skills.active.length
  return boss.skills.active
    .slice(0, maxSkills)
    .filter(s => (boss.cooldowns[s.id] ?? 0) <= 0)
}

export function chooseBossAction(
  state: BattleState,
  bossId: string,
  rng: () => number,
): BattleAction {
  const boss = state.combatants[bossId]
  if (!boss?.isAlive || !boss.isBoss) return { type: 'defend', actorId: bossId }

  const phase = boss.bossPhase ?? 1

  // Fase 3: gerencia o ciclo de habilidade única
  if (phase === 3) {
    if (boss.uniqueAbilityCharging) {
      // Turno anterior foi o aviso — agora dispara
      return { type: 'boss_unique', actorId: bossId }
    }

    const attackCount = boss.bossAttackCount ?? 0
    if (attackCount > 0 && attackCount % UNIQUE_ABILITY_CHARGE_INTERVAL === 0) {
      // Carrega a habilidade (aviso para o jogador)
      return { type: 'boss_charge', actorId: bossId }
    }
  }

  // Ação normal: escolhe skill disponível
  const activeHeroes = Object.values(state.combatants)
    .filter(c => !c.isEnemy && c.isAlive && isActiveSlot(c.slot))
    .sort((a, b) => a.currentHp - b.currentHp)

  if (activeHeroes.length === 0) return { type: 'defend', actorId: bossId }

  const target = phase === 2
    ? activeHeroes[0]   // fase 2: sempre o mais fraco
    : activeHeroes[Math.floor(rng() * Math.min(2, activeHeroes.length))]  // fase 1: um dos dois mais fracos

  const available = bossAvailableSkills(boss)
  if (available.length === 0) return { type: 'defend', actorId: bossId }

  const skill = phase >= 2
    ? available[0]  // fase 2/3: usa a melhor skill disponível
    : available[Math.floor(rng() * available.length)]

  return { type: 'skill', actorId: bossId, skillId: skill.id, targetId: target.id }
}

// ─── Aplicação de habilidades especiais de chefe ─────────────────────────────

function stepRng(seed: number): { value: number; seed: number } {
  const next = ((Math.imul(1664525, seed) + 1013904223) | 0)
  return { value: (next >>> 0) / 0x100000000, seed: next }
}

// Aplica Devastação: dano massivo (3× força) no herói da Frente
function applyDevastacao(state: BattleState, bossId: string): BattleState {
  const boss = state.combatants[bossId]
  const frontHero = Object.values(state.combatants)
    .find(c => !c.isEnemy && c.isAlive && c.slot === 'front')
  if (!frontHero || !boss) return state

  const rawDamage = Math.round(boss.genome.attributes.forca * 3.5)
  // Devastação ignora 50% da defesa
  const mitigation = Math.max(1, frontHero.genome.attributes.resistencia / 200)
  const damage = Math.max(1, Math.round(rawDamage / mitigation))

  const ev: BattleEvent = {
    type: 'damage',
    actorId: bossId,
    targetId: frontHero.id,
    value: damage,
    label: `${boss.name} usa Devastação em ${frontHero.name} por ${damage}!`,
  }

  let s = state
  const newHp = Math.max(0, frontHero.currentHp - damage)
  s = updateCombatant(s, frontHero.id, { currentHp: newHp, isAlive: newHp > 0 })
  return appendEvents(s, [ev])
}

// Aplica Corrupção: inverte buffs ↔ debuffs de todos os heróis ativos por 2 turnos
function applyCorrupcao(state: BattleState, bossId: string): BattleState {
  const boss = state.combatants[bossId]
  if (!boss) return state

  let s = state
  const events: BattleEvent[] = [{
    type: 'boss_unique_fire',
    actorId: bossId,
    label: `${boss.name} usa Corrupção Alquímica! Buffs e debuffs são invertidos.`,
  }]

  for (const c of Object.values(s.combatants)) {
    if (c.isEnemy || !c.isAlive || !isActiveSlot(c.slot)) continue
    const flipped: StatusEffect[] = c.statusEffects.map(eff => ({
      ...eff,
      type: eff.type === 'buff' ? 'debuff' : eff.type === 'debuff' ? 'buff' : eff.type,
      turnsRemaining: 2,
    }))
    s = updateCombatant(s, c.id, { statusEffects: flipped })
  }

  return appendEvents(s, events)
}

// Aplica Invocação Massiva: adiciona 2 inimigos simples à batalha
function applyInvocacaoMassiva(state: BattleState, bossId: string, rng: () => number): BattleState {
  const boss = state.combatants[bossId]
  if (!boss) return state

  // Encontra slots de inimigo livres
  const existingSlots = new Set(
    Object.values(state.combatants).filter(c => c.isEnemy).map(c => c.slot)
  )

  let rngSeed = Math.round(rng() * 0xffffffff)
  const events: BattleEvent[] = [{
    type: 'boss_unique_fire',
    actorId: bossId,
    label: `${boss.name} invoca reforços corrompidos!`,
  }]

  let s = state
  let spawned = 0

  for (let i = 0; i < 6 && spawned < 2; i++) {
    const slotKey = `enemy_${i}` as `enemy_${number}`
    if (existingSlots.has(slotKey)) continue

    const step = stepRng(rngSeed)
    rngSeed = step.seed

    // Invocado é mais fraco que o chefe (~40% dos atributos)
    const genome = {
      ...boss.genome,
      attributes: {
        ...boss.genome.attributes,
        forca:       Math.round(boss.genome.attributes.forca * 0.4),
        resistencia: Math.round(boss.genome.attributes.resistencia * 0.4),
        agilidade:   Math.round(boss.genome.attributes.agilidade * 0.6),
        ressonancia: Math.round(boss.genome.attributes.ressonancia * 0.4),
        aura:        Math.round(boss.genome.attributes.aura * 0.4),
        vontade:     Math.round(boss.genome.attributes.vontade * 0.4),
      },
    }
    const maxHp = computeHpMax(genome, Math.max(1, boss.level - 2))
    const summonId = `summoned-${spawned + 1}-${state.turnNumber}`

    const summon: Combatant = {
      id: summonId,
      name: `Fragmento Invocado ${spawned + 1}`,
      genome,
      rarity: 'comum',
      skills: boss.skills,
      level: Math.max(1, boss.level - 2),
      maxHp,
      currentHp: maxHp,
      ultimateCharge: 0,
      isDefending: false,
      isAlive: true,
      cooldowns: {},
      statusEffects: [],
      slot: slotKey,
      isEnemy: true,
      generation: 1,
      aiPattern: 'aggressive',
    }

    s = { ...s, combatants: { ...s.combatants, [summonId]: summon } }

    // Adiciona ao turnOrder após o chefe
    const bossIndex = s.turnOrder.indexOf(bossId)
    const before = s.turnOrder.slice(0, bossIndex + 1)
    const after = s.turnOrder.slice(bossIndex + 1)
    s = { ...s, turnOrder: [...before, summonId, ...after] }

    events.push({ type: 'emergency_entry', actorId: summonId, label: `${summon.name} entra na batalha!` })
    spawned++
  }

  return appendEvents(s, events)
}

// Aplica Roubo de Alma: usa a skill mais usada pelo jogador
function applyRouboDaAlma(state: BattleState, bossId: string): BattleState {
  const boss = state.combatants[bossId]
  if (!boss) return state

  // Encontra a skill mais usada pelos heróis no log
  const heroIds = new Set(
    Object.values(state.combatants).filter(c => !c.isEnemy).map(c => c.id)
  )
  const skillUseCounts: Record<string, number> = {}
  for (const ev of state.log) {
    if (!heroIds.has(ev.actorId) || !ev.skillId) continue
    skillUseCounts[ev.skillId] = (skillUseCounts[ev.skillId] ?? 0) + 1
  }

  const events: BattleEvent[] = []

  const mostUsedId = Object.entries(skillUseCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0]

  // Alvo: herói ativo com menos HP
  const target = Object.values(state.combatants)
    .filter(c => !c.isEnemy && c.isAlive && isActiveSlot(c.slot))
    .sort((a, b) => a.currentHp - b.currentHp)[0]

  if (!target) return state

  // Dano baseado na força do chefe (sem a skill real, para simplificar MVP)
  const damage = Math.max(1, Math.round(boss.genome.attributes.forca * 1.5))
  const newHp = Math.max(0, target.currentHp - damage)

  events.push({
    type: 'boss_unique_fire',
    actorId: bossId,
    targetId: target.id,
    value: damage,
    skillId: mostUsedId,
    label: mostUsedId
      ? `${boss.name} rouba a técnica do time e causa ${damage} em ${target.name}!`
      : `${boss.name} analisa o time e causa ${damage} em ${target.name}!`,
  })
  events.push({
    type: 'damage',
    actorId: bossId,
    targetId: target.id,
    value: damage,
    label: '',
  })

  let s = updateCombatant(state, target.id, { currentHp: newHp, isAlive: newHp > 0 })
  return appendEvents(s, events)
}

// Aplica Colapso: reduz HP de todos os heróis ativos para 1 (não mata)
function applyColapso(state: BattleState, bossId: string): BattleState {
  const boss = state.combatants[bossId]
  if (!boss) return state

  const events: BattleEvent[] = [{
    type: 'boss_unique_fire',
    actorId: bossId,
    label: `${boss.name} usa Colapso! Todos os heróis ficam com 1 de HP!`,
  }]

  let s = state
  for (const c of Object.values(s.combatants)) {
    if (c.isEnemy || !c.isAlive || !isActiveSlot(c.slot)) continue
    if (c.currentHp <= 1) continue
    s = updateCombatant(s, c.id, { currentHp: 1 })
    events.push({
      type: 'damage',
      actorId: bossId,
      targetId: c.id,
      value: c.currentHp - 1,
      label: `${c.name} fica com 1 HP.`,
    })
  }

  return appendEvents(s, events)
}

// ─── API pública ─────────────────────────────────────────────────────────────

// Processa ações exclusivas do chefe (boss_charge e boss_unique)
export function applyBossSpecialAction(
  state: BattleState,
  action: BattleAction,
  rng: () => number,
): BattleState {
  const boss = state.combatants[action.actorId]
  if (!boss?.isBoss || !boss.isAlive) return state

  if (action.type === 'boss_charge') {
    const info = BOSS_ABILITY_INFO[boss.uniqueAbilityType ?? 'devastacao']
    const ev: BattleEvent = {
      type: 'boss_unique_charging',
      actorId: boss.id,
      label: `${boss.name} ${info.warningText}`,
    }
    return appendEvents(
      updateCombatant(state, boss.id, {
        uniqueAbilityCharging: true,
        bossAttackCount: (boss.bossAttackCount ?? 0) + 1,
      }),
      [ev],
    )
  }

  if (action.type === 'boss_unique') {
    const abilityType = boss.uniqueAbilityType ?? 'devastacao'
    // Limpa estado de carregamento antes de aplicar
    let s = updateCombatant(state, boss.id, {
      uniqueAbilityCharging: false,
      bossAttackCount: (boss.bossAttackCount ?? 0) + 1,
    })

    switch (abilityType) {
      case 'devastacao':        s = applyDevastacao(s, boss.id); break
      case 'corrupcao':         s = applyCorrupcao(s, boss.id); break
      case 'invocacao_massiva': s = applyInvocacaoMassiva(s, boss.id, rng); break
      case 'roubo_de_alma':     s = applyRouboDaAlma(s, boss.id); break
      case 'colapso':           s = applyColapso(s, boss.id); break
    }

    return s
  }

  return state
}

// Inicializa campos de chefe num Combatant existente
export function initBossCombatant(state: BattleState, bossSpec: BossSpec): BattleState {
  const boss = Object.values(state.combatants).find(c => c.id === bossSpec.id)
  if (!boss) return state
  return updateCombatant(state, bossSpec.id, {
    isBoss: true,
    bossPhase: 1,
    uniqueAbilityCharging: false,
    uniqueAbilityType: bossSpec.uniqueAbilityType,
    bossAttackCount: 0,
  })
}
