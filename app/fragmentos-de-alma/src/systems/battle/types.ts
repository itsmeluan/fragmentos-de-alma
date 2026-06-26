// Tipos do motor de batalha — ver doc 06_sistema_de_batalha.md
import type { Genome, Rarity } from '../genes/types'
import type { HeroSkills } from '../skills/types'

// ─── Slots ───────────────────────────────────────────────────────────────────

export type ActiveSlot = 'front' | 'center' | 'back'
export type BenchSlot = 'bench_a' | 'bench_b' | 'bench_c'
export type EnemySlot = `enemy_${number}`
export type CombatSlot = ActiveSlot | BenchSlot | EnemySlot

export const ACTIVE_SLOTS: ActiveSlot[] = ['front', 'center', 'back']
export const BENCH_SLOTS: BenchSlot[] = ['bench_a', 'bench_b', 'bench_c']

export function isActiveSlot(slot: CombatSlot): slot is ActiveSlot {
  return ACTIVE_SLOTS.includes(slot as ActiveSlot)
}
export function isBenchSlot(slot: CombatSlot): slot is BenchSlot {
  return BENCH_SLOTS.includes(slot as BenchSlot)
}
export function isEnemySlot(slot: CombatSlot): slot is EnemySlot {
  return slot.startsWith('enemy_')
}

// ─── Efeitos de status ────────────────────────────────────────────────────────

export type StatKey = 'forca' | 'resistencia' | 'agilidade' | 'ressonancia' | 'aura' | 'vontade'

export interface StatusEffect {
  id: string
  label: string
  type: 'buff' | 'debuff' | 'dot' | 'shield'
  stat?: StatKey        // qual atributo modifica (buff/debuff)
  magnitude: number     // multiplicador (1.2 = +20%) ou dano plano (dot)
  turnsRemaining: number
  sourceId: string      // quem aplicou
}

// ─── Combatente ───────────────────────────────────────────────────────────────

export interface Combatant {
  id: string
  name: string
  genome: Genome
  rarity: Rarity
  skills: HeroSkills
  level: number

  maxHp: number
  currentHp: number
  ultimateCharge: number   // 0–100
  isDefending: boolean
  isAlive: boolean

  cooldowns: Record<string, number>  // skillId → turnos restantes
  statusEffects: StatusEffect[]
  slot: CombatSlot
  isEnemy: boolean

  // para C05: última habilidade usada (id da skill)
  lastSkillId?: string
  // geração — para C08
  generation: number
  // bond acumulado (espelha Hero.bond para verificação de Ressonância Crítica)
  bond: number

  // Ressonância Crítica: turnos restantes de estado Exausta (0 = livre)
  resonanceExaustaRemaining: number

  // apenas inimigos (preenchido por createBattle)
  aiPattern?: 'aggressive' | 'defensive' | 'support' | 'random'

  // campos de chefe (preenchidos por boss.ts ao iniciar batalha de chefe)
  isBoss?: boolean
  bossPhase?: 1 | 2 | 3
  uniqueAbilityCharging?: boolean   // true = aviso ao jogador (1 turno antes do disparo)
  uniqueAbilityType?: BossUniqueAbilityType
  bossAttackCount?: number          // quantos ataques o chefe já deu (controla ritmo da habilidade)
}

// ─── Template de inimigo ─────────────────────────────────────────────────────

export interface EnemySpec {
  id: string
  name: string
  genome: Genome
  rarity: Rarity
  skills: HeroSkills
  level: number
  aiPattern: 'aggressive' | 'defensive' | 'support' | 'random'
}

// ─── Chefes ───────────────────────────────────────────────────────────────────

export type BossUniqueAbilityType =
  | 'devastacao'        // dano massivo no herói da Frente
  | 'corrupcao'         // inverte buffs/debuffs de todos os heróis por 2 turnos
  | 'invocacao_massiva' // invoca 2 inimigos de suporte
  | 'roubo_de_alma'     // usa a habilidade mais usada pelo jogador
  | 'colapso'           // reduz HP de todos os heróis para 1

export interface BossSpec extends EnemySpec {
  isBoss: true
  weakness: string             // afinidade que amplifica dano (name of affinity)
  uniqueAbilityType: BossUniqueAbilityType
  loreLines: string[]          // 2–3 linhas exibidas na tela de entrada
}

// ─── Ações ───────────────────────────────────────────────────────────────────

// boss_charge: anuncio com 1 turno de antecedência; boss_unique: disparo da habilidade única
// resonance: Ressonância Crítica entre dois heróis ativos sinérgicos
export type ActionType = 'skill' | 'ultimate' | 'defend' | 'swap' | 'boss_charge' | 'boss_unique' | 'resonance'

export interface BattleAction {
  type: ActionType
  actorId: string
  targetId?: string      // para habilidades direcionadas
  skillId?: string       // qual habilidade usar (skill/ultimate)
  swapInId?: string      // quem entra (para swap)
  partnerId?: string     // segundo herói da Ressonância Crítica
}

// ─── Eventos (feed para UI e log) ────────────────────────────────────────────

export type EventType =
  | 'damage'
  | 'heal'
  | 'shield_apply'
  | 'buff_apply'
  | 'debuff_apply'
  | 'status_tick'
  | 'status_expire'
  | 'skill_used'
  | 'ultimate_charged'
  | 'ultimate_used'
  | 'defend'
  | 'swap'
  | 'death'
  | 'emergency_entry'
  | 'turn_start'
  | 'cooldown_tick'
  | 'phase_change'
  | 'boss_phase_change'
  | 'boss_unique_charging'
  | 'boss_unique_fire'
  | 'resonance_used'
  | 'resonance_exausta'

export interface BattleEvent {
  type: EventType
  actorId: string
  targetId?: string
  value?: number         // dano / cura / magnitude
  skillId?: string
  label: string
}

// ─── Estado da batalha ───────────────────────────────────────────────────────

export type BattlePhase = 'setup' | 'active' | 'victory' | 'defeat'

export interface BattleState {
  id: string
  phase: BattlePhase

  // todos os combatentes, heróis e inimigos, por id
  combatants: Record<string, Combatant>

  // ordem de turnos: apenas slots ativos + inimigos, ordenados por agilidade
  turnOrder: string[]
  currentTurnIndex: number
  turnNumber: number

  // RNG determinístico — avança a cada uso (não usa closure, mantém pureza)
  rngSeed: number

  // log completo da batalha
  log: BattleEvent[]
  // eventos produzidos pela última ação (para a UI renderizar)
  pendingEvents: BattleEvent[]
}
