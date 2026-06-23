// Tipos do sistema de habilidades procedurais
// ver doc 03_sistema_de_habilidades.md — anatomia: [GATILHO]+[EFEITO]+[MODIFICADOR]+[CONDIÇÃO]

export type TriggerId =
  | 'T01' | 'T02' | 'T03' | 'T04' | 'T05'
  | 'T06' | 'T07' | 'T08' | 'T09' | 'T10'

export type EffectId =
  | 'E01' | 'E02' | 'E03' | 'E04' | 'E05'
  | 'E06' | 'E07' | 'E08' | 'E09' | 'E10'

export type ModifierId =
  | 'M01' | 'M02' | 'M03' | 'M04' | 'M05'
  | 'M06' | 'M07' | 'M08' | 'M09' | 'M10'

export type ConditionId =
  | 'C01' | 'C02' | 'C03' | 'C04' | 'C05'
  | 'C06' | 'C07' | 'C08' | 'C09' | 'C10'

export interface SkillTrigger {
  id: TriggerId
  label: string
}

export interface SkillEffect {
  id: EffectId
  label: string
  power: number // 1–100, escalonado pelo gene primário
}

export interface SkillModifier {
  id: ModifierId
  label: string
}

export interface SkillCondition {
  id: ConditionId
  label: string
}

export interface Skill {
  id: string            // ex: "active_0", "passive_1", "emergent_fire_aura"
  name: string
  trigger: SkillTrigger
  effect: SkillEffect
  modifier?: SkillModifier
  condition: SkillCondition
  isPassive: boolean
  isUnique: boolean
  isEmergent: boolean
  sourceGenes: string[] // genes que contribuíram para a habilidade
}

export interface HeroSkills {
  active: Skill[]   // 1–3 conforme raridade
  passive: Skill[]  // 1–2 conforme raridade
  unique: Skill[]   // 0–2: lendário = 1, único = 2
  emergent: Skill[] // condições atendidas na criação; reveladas no combate
}
