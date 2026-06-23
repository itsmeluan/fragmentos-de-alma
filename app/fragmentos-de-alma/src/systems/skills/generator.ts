// Gerador de habilidades procedurais — funções puras
// ver doc 03_sistema_de_habilidades.md
import { makeSeededRng } from '@/utils/random'
import type { Affinity, AttributeGenes, Genome, MutationGene, Rarity } from '../genes/types'
import type {
  ConditionId, EffectId, HeroSkills, ModifierId,
  Skill, SkillCondition, SkillEffect, SkillModifier, SkillTrigger, TriggerId,
} from './types'

// ── Contadores de habilidades por raridade (doc 03) ─────────────────────────
const SKILL_COUNTS: Record<Rarity, { active: number; passive: number; unique: number }> = {
  comum:    { active: 1, passive: 1, unique: 0 },
  incomum:  { active: 1, passive: 1, unique: 0 },
  raro:     { active: 2, passive: 1, unique: 0 },
  epico:    { active: 2, passive: 2, unique: 0 },
  lendario: { active: 2, passive: 2, unique: 1 },
  unico:    { active: 3, passive: 2, unique: 2 },
}

// ── Definições de gatilhos — pesos por gene primário ────────────────────────
interface TriggerDef { id: TriggerId; label: string; weight: (a: AttributeGenes) => number }
const TRIGGER_DEFS: TriggerDef[] = [
  { id: 'T01', label: 'Ao atacar',                weight: a => a.forca / 100 },
  { id: 'T02', label: 'Ao receber dano',           weight: a => a.resistencia / 100 },
  { id: 'T03', label: 'A cada N turnos',           weight: a => a.agilidade / 100 },
  { id: 'T04', label: 'Ao matar um inimigo',       weight: a => (a.forca + a.ressonancia) / 200 },
  { id: 'T05', label: 'Quando aliado morre',       weight: a => a.vontade / 100 },
  { id: 'T06', label: 'Ao usar habilidade ativa',  weight: a => a.ressonancia / 100 },
  { id: 'T07', label: 'No início do combate',      weight: a => a.aura / 100 },
  { id: 'T08', label: 'Ao atingir HP crítico',     weight: a => (a.vontade + a.resistencia) / 200 },
  { id: 'T09', label: 'Ao curar',                  weight: a => a.aura / 100 },
  { id: 'T10', label: 'Aleatoriamente por turno',  weight: a => a.agilidade / 100 },
]

// ── Definições de efeitos — pesos e potência por gene primário ───────────────
interface EffectDef { id: EffectId; label: string; weight: (a: AttributeGenes) => number; power: (a: AttributeGenes) => number }
const EFFECT_DEFS: EffectDef[] = [
  { id: 'E01', label: 'causa dano físico',             weight: a => a.forca / 100,                     power: a => a.forca },
  { id: 'E02', label: 'causa dano elemental',          weight: a => a.ressonancia / 100,               power: a => a.ressonancia },
  { id: 'E03', label: 'cura aliado',                   weight: a => a.aura / 100,                      power: a => a.aura },
  { id: 'E04', label: 'cria escudo',                   weight: a => a.resistencia / 100,               power: a => a.resistencia },
  { id: 'E05', label: 'aplica debuff no inimigo',      weight: a => a.vontade / 100,                   power: a => a.vontade },
  { id: 'E06', label: 'aplica buff em aliado',         weight: a => a.aura / 100,                      power: a => a.aura },
  { id: 'E07', label: 'invoca entidade menor',         weight: a => a.ressonancia / 100,               power: a => a.ressonancia },
  { id: 'E08', label: 'drena recurso do inimigo',      weight: a => (a.ressonancia + a.vontade) / 200, power: a => (a.ressonancia + a.vontade) / 2 },
  { id: 'E09', label: 'reposiciona combatentes',       weight: a => a.agilidade / 100,                 power: a => a.agilidade },
  { id: 'E10', label: 'revive aliado com HP parcial',  weight: a => (a.aura + a.vontade) / 200,        power: a => (a.aura + a.vontade) / 2 },
]

// ── Modificadores — condicionais por limiares de gene ───────────────────────
interface ModifierDef { id: ModifierId; label: string; condition: (a: AttributeGenes, m: MutationGene[], affinity: Affinity) => boolean }
const MODIFIER_DEFS: ModifierDef[] = [
  { id: 'M01', label: 'em área',                           condition: a => a.ressonancia > 50 },
  { id: 'M02', label: 'proporcional a um atributo',        condition: a => Object.values(a).some(v => v > 70) },
  { id: 'M03', label: 'com crítico aumentado',             condition: a => a.agilidade > 60 },
  { id: 'M04', label: 'que escala com inimigos derrotados',condition: a => a.forca > 65 },
  { id: 'M05', label: 'que ignora defesa',                 condition: a => a.vontade > 70 },
  { id: 'M06', label: 'com efeito elemental secundário',   condition: (_, __, af) => af === 'Éter' || af === 'Vazio' }, // placeholder até hybridAffinity no essence
  { id: 'M07', label: 'que afeta aliados também',          condition: a => a.aura > 55 },
  { id: 'M08', label: 'que persiste por N turnos',         condition: a => a.resistencia > 50 },
  { id: 'M09', label: 'com ricochete em inimigos',         condition: a => a.agilidade > 55 },
  { id: 'M10', label: 'que cresce a cada uso',             condition: (_, m) => m.includes('ESPELHO') },
]

// ── Condições especiais — pools por frequência ───────────────────────────────
const CONDITIONS: Record<ConditionId, string> = {
  C01: 'sempre',
  C02: 'se alvo tem HP abaixo de 50%',
  C03: 'se aliado específico está vivo',
  C04: 'se é o primeiro turno',
  C05: 'se usou habilidade no turno anterior',
  C06: 'se há 3 ou mais inimigos em campo',
  C07: 'se há gene de mutação ativo',
  C08: 'se linhagem tem 3 ou mais gerações',
  C09: 'durante evento global',
  C10: 'passivo permanente',
}

// Pools ponderados: passivos usam C10 com frequência, ativos usam C01/C02
const ACTIVE_CONDITION_POOL: Array<{ id: ConditionId; w: number }> = [
  { id: 'C01', w: 4 }, { id: 'C02', w: 3 }, { id: 'C03', w: 2 },
  { id: 'C04', w: 2 }, { id: 'C05', w: 2 }, { id: 'C06', w: 1 },
  { id: 'C07', w: 1 }, { id: 'C08', w: 1 }, { id: 'C09', w: 0.5 },
]
const PASSIVE_CONDITION_POOL: Array<{ id: ConditionId; w: number }> = [
  { id: 'C10', w: 5 }, { id: 'C01', w: 2 }, { id: 'C07', w: 1 }, { id: 'C08', w: 1 },
]

// ── Geração de nome de habilidade (doc 03) ───────────────────────────────────
const AFFINITY_ADJECTIVES: Record<Affinity, readonly string[]> = {
  Fogo:   ['Ardente', 'Incandescente', 'Purgadora', 'Chama', 'Brasa', 'Cinzas'],
  Água:   ['Tidal', 'Profunda', 'Corrente', 'Névoa', 'Maré', 'Abissal'],
  Terra:  ['Sólida', 'Antiga', 'Pesada', 'Rochosa', 'Enraizada', 'Inabalável'],
  Vento:  ['Veloz', 'Cortante', 'Sussurro', 'Rajada', 'Eco', 'Deriva'],
  Vazio:  ['Silente', 'Devoradora', 'Inexistente', 'Fratura', 'Colapso', 'Nula'],
  Luz:    ['Radiante', 'Eterna', 'Sagrada', 'Clarão', 'Revelação', 'Pura'],
  Sombra: ['Sombria', 'Oculta', 'Sussurrada', 'Trevas', 'Eclipse', 'Velada'],
  Éter:   ['Astral', 'Transcendente', 'Etérea', 'Ressonante', 'Além', 'Espectral'],
}

const EFFECT_NOUNS: Record<EffectId, readonly string[]> = {
  E01: ['Golpe', 'Lâmina', 'Impacto', 'Punho', 'Toque'],
  E02: ['Chama', 'Pulso', 'Descarga', 'Onda', 'Raio'],
  E03: ['Graça', 'Renovo', 'Alento', 'Bênção', 'Pulso'],
  E04: ['Veste', 'Muralha', 'Casca', 'Véu', 'Armadura'],
  E05: ['Maldição', 'Fraqueza', 'Corrente', 'Marca', 'Selagem'],
  E06: ['Bênção', 'Exaltação', 'Forja', 'Ímpeto', 'Despertar'],
  E07: ['Chamado', 'Eco', 'Manifestação', 'Convocação', 'Fragmento'],
  E08: ['Drenagem', 'Absorção', 'Extração', 'Sifão', 'Colheita'],
  E09: ['Passo', 'Desvio', 'Ruptura', 'Recuo', 'Fluxo'],
  E10: ['Ressurreição', 'Faísca', 'Retorno', 'Renascimento', 'Centelha'],
}

// ── Utilitários ──────────────────────────────────────────────────────────────

function weightedPick<T>(items: readonly T[], weights: readonly number[], rng: () => number): T {
  const total = weights.reduce((s, w) => s + w, 0)
  let r = rng() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

function pickFrom<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

// ── Seletores de componentes ─────────────────────────────────────────────────

function pickTrigger(attrs: AttributeGenes, rng: () => number): SkillTrigger {
  const weights = TRIGGER_DEFS.map(t => Math.max(0.1, t.weight(attrs)))
  const def = weightedPick(TRIGGER_DEFS, weights, rng)
  return { id: def.id, label: def.label }
}

function pickEffect(attrs: AttributeGenes, rng: () => number): SkillEffect {
  const weights = EFFECT_DEFS.map(e => Math.max(0.1, e.weight(attrs)))
  const def = weightedPick(EFFECT_DEFS, weights, rng)
  return { id: def.id, label: def.label, power: Math.round(def.power(attrs)) }
}

function eligibleModifiers(
  attrs: AttributeGenes, mutations: MutationGene[], affinity: Affinity
): ModifierDef[] {
  return MODIFIER_DEFS.filter(m => m.condition(attrs, mutations, affinity))
}

function pickCondition(
  pool: Array<{ id: ConditionId; w: number }>, rng: () => number
): SkillCondition {
  const ids = pool.map(p => p.id)
  const weights = pool.map(p => p.w)
  const id = weightedPick(ids, weights, rng)
  return { id, label: CONDITIONS[id] }
}

function generateSkillName(affinity: Affinity, effectId: EffectId, rng: () => number): string {
  const adj = pickFrom(AFFINITY_ADJECTIVES[affinity], rng)
  const noun = pickFrom(EFFECT_NOUNS[effectId], rng)
  return `${adj} ${noun}`
}

// ── Habilidades emergentes (doc 03 — tabela de emergência) ───────────────────

function buildEmergent(
  id: string, name: string,
  trigger: SkillTrigger, effect: SkillEffect,
  condition: SkillCondition, sourceGenes: string[]
): Skill {
  return {
    id,
    name,
    trigger,
    effect,
    condition,
    isPassive: false,
    isUnique: false,
    isEmergent: true,
    sourceGenes,
  }
}

function checkEmergentSkills(genome: Genome): Skill[] {
  const emergent: Skill[] = []
  const { essence, attributes, mutations } = genome

  // Fogo + AURA > 70 → Chama Purificadora (cura com chamas — paradoxal)
  if (essence.affinity === 'Fogo' && attributes.aura > 70) {
    emergent.push(buildEmergent(
      'emergent_fire_aura', 'Chama Purificadora',
      { id: 'T01', label: 'Ao atacar' },
      { id: 'E03', label: 'cura aliado', power: attributes.aura },
      { id: 'C01', label: CONDITIONS['C01'] },
      ['affinity:Fogo', 'aura'],
    ))
  }

  // Trickster + VONTADE > 80 → Roubo de Memória (imita última habilidade inimiga)
  if (essence.core === 'Trickster' && attributes.vontade > 80) {
    emergent.push(buildEmergent(
      'emergent_trickster_vontade', 'Roubo de Memória',
      { id: 'T06', label: 'Ao usar habilidade ativa' },
      { id: 'E05', label: 'aplica debuff no inimigo', power: attributes.vontade },
      { id: 'C05', label: CONDITIONS['C05'] },
      ['core:Trickster', 'vontade'],
    ))
  }

  // Abissal + RESISTÊNCIA > 75 → Devorar Dor (converte dano em HP temporário)
  if (essence.origin === 'Abissal' && attributes.resistencia > 75) {
    emergent.push(buildEmergent(
      'emergent_abissal_resistencia', 'Devorar Dor',
      { id: 'T02', label: 'Ao receber dano' },
      { id: 'E03', label: 'cura aliado', power: attributes.resistencia },
      { id: 'C01', label: CONDITIONS['C01'] },
      ['origin:Abissal', 'resistencia'],
    ))
  }

  // Éter + FORÇA > 80 → Passo Eterno (ataque que age antes do inimigo)
  if (essence.affinity === 'Éter' && attributes.forca > 80) {
    emergent.push(buildEmergent(
      'emergent_eter_forca', 'Passo Eterno',
      { id: 'T07', label: 'No início do combate' },
      { id: 'E01', label: 'causa dano físico', power: attributes.forca },
      { id: 'C04', label: CONDITIONS['C04'] },
      ['affinity:Éter', 'forca'],
    ))
  }

  // 3+ mutações → Caos Encarnado (habilidade completamente aleatória)
  if (mutations.length >= 3) {
    emergent.push(buildEmergent(
      'emergent_chaos_mutations', 'Caos Encarnado',
      { id: 'T10', label: 'Aleatoriamente por turno' },
      { id: 'E02', label: 'causa dano elemental', power: 75 },
      { id: 'C07', label: CONDITIONS['C07'] },
      mutations.map(m => `mutation:${m}`),
    ))
  }

  // Celestial + Invocador → Eco do Que Fui (invoca versão ancestral)
  if (essence.origin === 'Celestial' && essence.core === 'Invocador') {
    emergent.push(buildEmergent(
      'emergent_celestial_invocador', 'Eco do Que Fui',
      { id: 'T07', label: 'No início do combate' },
      { id: 'E07', label: 'invoca entidade menor', power: 90 },
      { id: 'C08', label: CONDITIONS['C08'] },
      ['origin:Celestial', 'core:Invocador'],
    ))
  }

  // TRANSCENDENCIA presente → Além das Leis (ignora todas as regras uma vez)
  if (mutations.includes('TRANSCENDENCIA')) {
    emergent.push(buildEmergent(
      'emergent_transcendencia', 'Além das Leis',
      { id: 'T08', label: 'Ao atingir HP crítico' },
      { id: 'E10', label: 'revive aliado com HP parcial', power: 100 },
      { id: 'C10', label: CONDITIONS['C10'] },
      ['mutation:TRANSCENDENCIA'],
    ))
  }

  return emergent
}

// ── Builder principal de habilidade ─────────────────────────────────────────

function buildSkill(
  id: string,
  genome: Genome,
  rng: () => number,
  isPassive: boolean,
  isUnique: boolean,
): Skill {
  const { essence, attributes, mutations } = genome
  const trigger = pickTrigger(attributes, rng)
  const effect = pickEffect(attributes, rng)
  const eligible = eligibleModifiers(attributes, mutations, essence.affinity)
  const modifier = eligible.length > 0 && rng() < 0.6
    ? pickFrom(eligible, rng)
    : undefined
  const conditionPool = isPassive ? PASSIVE_CONDITION_POOL : ACTIVE_CONDITION_POOL
  const condition = pickCondition(conditionPool, rng)
  const name = generateSkillName(essence.affinity, effect.id, rng)

  const sourceGenes: string[] = [
    `trigger:${trigger.id}`, `effect:${effect.id}`,
    ...(modifier ? [`modifier:${modifier.id}`] : []),
  ]

  return {
    id,
    name,
    trigger,
    effect,
    ...(modifier ? { modifier } : {}),
    condition,
    isPassive,
    isUnique,
    isEmergent: false,
    sourceGenes,
  }
}

// ── Função principal ─────────────────────────────────────────────────────────

export function generateSkills(genome: Genome, rarity: Rarity, seed: string): HeroSkills {
  const rng = makeSeededRng(seed)
  const { active: nActive, passive: nPassive, unique: nUnique } = SKILL_COUNTS[rarity]

  const active: Skill[] = Array.from({ length: nActive }, (_, i) =>
    buildSkill(`active_${i}`, genome, rng, false, false)
  )
  const passive: Skill[] = Array.from({ length: nPassive }, (_, i) =>
    buildSkill(`passive_${i}`, genome, rng, true, false)
  )
  const unique: Skill[] = Array.from({ length: nUnique }, (_, i) =>
    buildSkill(`unique_${i}`, genome, rng, false, true)
  )
  const emergent = checkEmergentSkills(genome)

  return { active, passive, unique, emergent }
}
