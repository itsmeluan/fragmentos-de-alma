// Estado global de batalha — Zustand
// Zustand store para a tela de batalha; limpar ao sair da batalha.
import { create } from 'zustand'
import { createBattle, applyAction, startTurn, endTurn } from '@/systems/battle/engine'
import type { BattleState, BattleAction, EnemySpec } from '@/systems/battle/types'
import type { Hero } from '@/systems/genes/types'

export type BattleUiPhase =
  | 'idle'
  | 'player_selecting'   // aguardando herói ser selecionado
  | 'action_wheel'       // roda de ações aberta
  | 'targeting_enemy'    // esperando toque no inimigo
  | 'targeting_ally'     // esperando toque em aliado (cura/buff)
  | 'swapping'           // esperando escolha do banco
  | 'enemy_turn'         // inimigo agindo (bloqueia input)

interface BattleStore {
  battleState: BattleState | null
  uiPhase: BattleUiPhase
  selectedHeroId: string | null
  pendingSkillId: string | null

  initBattle: (heroes: Hero[], enemies: EnemySpec[], seed: string) => void
  selectHero: (id: string) => void
  closeWheel: () => void
  beginTargeting: (skillId: string, mode: 'enemy' | 'ally') => void
  cancelTargeting: () => void
  confirmSkill: (skillId: string, targetId: string) => BattleState | null
  confirmDefend: () => BattleState | null
  confirmUltimate: () => BattleState | null
  beginSwap: () => void
  confirmSwap: (benchId: string) => BattleState | null
  applyEnemyAction: (action: BattleAction) => BattleState | null
  clearBattle: () => void
}

// Aplica ação + endTurn + startTurn para o próximo ator; retorna o novo estado
function processAction(state: BattleState, action: BattleAction): BattleState {
  const afterAction = applyAction(state, action)
  const afterEnd = endTurn(afterAction)
  if (afterEnd.phase !== 'active') return afterEnd
  return startTurn(afterEnd)
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  battleState: null,
  uiPhase: 'idle',
  selectedHeroId: null,
  pendingSkillId: null,

  initBattle: (heroes, enemies, seed) => {
    const initial = createBattle(heroes, enemies, seed)
    const ready = startTurn(initial)
    set({ battleState: ready, uiPhase: 'player_selecting', selectedHeroId: null, pendingSkillId: null })
  },

  selectHero: (id) => {
    const { battleState } = get()
    if (!battleState) return
    const actor = battleState.combatants[id]
    if (!actor?.isAlive || actor.isEnemy) return
    set({ selectedHeroId: id, uiPhase: 'action_wheel' })
  },

  closeWheel: () => {
    set({ selectedHeroId: null, uiPhase: 'player_selecting' })
  },

  beginTargeting: (skillId, mode) => {
    set({ pendingSkillId: skillId, uiPhase: mode === 'enemy' ? 'targeting_enemy' : 'targeting_ally' })
  },

  cancelTargeting: () => {
    set({ pendingSkillId: null, uiPhase: 'action_wheel' })
  },

  confirmSkill: (skillId, targetId) => {
    const { battleState, selectedHeroId } = get()
    if (!battleState || !selectedHeroId) return null
    const next = processAction(battleState, { type: 'skill', actorId: selectedHeroId, skillId, targetId })
    set({ battleState: next, uiPhase: 'idle', selectedHeroId: null, pendingSkillId: null })
    return next
  },

  confirmDefend: () => {
    const { battleState, selectedHeroId } = get()
    if (!battleState || !selectedHeroId) return null
    const next = processAction(battleState, { type: 'defend', actorId: selectedHeroId })
    set({ battleState: next, uiPhase: 'idle', selectedHeroId: null })
    return next
  },

  confirmUltimate: () => {
    const { battleState, selectedHeroId } = get()
    if (!battleState || !selectedHeroId) return null
    const actor = battleState.combatants[selectedHeroId]
    if (!actor || actor.ultimateCharge < 100) return null
    const targetId = Object.values(battleState.combatants).find(c => c.isAlive && c.isEnemy)?.id
    const next = processAction(battleState, { type: 'ultimate', actorId: selectedHeroId, targetId })
    set({ battleState: next, uiPhase: 'idle', selectedHeroId: null })
    return next
  },

  beginSwap: () => {
    set({ uiPhase: 'swapping' })
  },

  confirmSwap: (benchId) => {
    const { battleState, selectedHeroId } = get()
    if (!battleState || !selectedHeroId) return null
    const next = processAction(battleState, { type: 'swap', actorId: selectedHeroId, swapInId: benchId })
    set({ battleState: next, uiPhase: 'idle', selectedHeroId: null })
    return next
  },

  applyEnemyAction: (action) => {
    const { battleState } = get()
    if (!battleState) return null
    set({ uiPhase: 'enemy_turn' })
    const next = processAction(battleState, action)
    set({ battleState: next, uiPhase: next.phase === 'active' ? 'idle' : 'idle' })
    return next
  },

  clearBattle: () => {
    set({ battleState: null, uiPhase: 'idle', selectedHeroId: null, pendingSkillId: null })
  },
}))
