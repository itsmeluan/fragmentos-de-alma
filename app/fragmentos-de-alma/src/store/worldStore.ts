import { create } from 'zustand'
import type { TerritoryId, TerritoryState, WorldState } from '@/systems/world/types'
import { TERRITORY_DEFS } from '@/systems/world/mapData'

function createInitialTerritoryState(id: TerritoryId): TerritoryState {
  const INITIAL_CORRUPTIONS: Record<TerritoryId, number> = {
    axis:       8,
    kethara:   15,
    mnemos:    22,
    verdania:  10,
    cinderfall: 38,
    limiar:    28,
    venula:    45,
  }
  return {
    id,
    corruptionLevel: INITIAL_CORRUPTIONS[id] ?? 10,
    playerProgress: { surfaceFloors: 0, depthsFloors: 0, bossDefeated: false },
    factionReputation: 0,
    politicalTension: [],
  }
}

function createInitialWorldState(): WorldState {
  const territories = Object.fromEntries(
    TERRITORY_DEFS.map(t => [t.id, createInitialTerritoryState(t.id)])
  ) as Record<TerritoryId, TerritoryState>

  const globalCorruption = Math.round(
    Object.values(territories).reduce((s, t) => s + t.corruptionLevel, 0) /
    TERRITORY_DEFS.length
  )

  return { territories, globalCorruption, currentCycle: 1 }
}

function recalcGlobalCorruption(territories: Record<TerritoryId, TerritoryState>): number {
  const values = Object.values(territories)
  return Math.round(values.reduce((s, t) => s + t.corruptionLevel, 0) / values.length)
}

interface WorldStore extends WorldState {
  setCorruption(id: TerritoryId, level: number): void
  recordFloorCompleted(id: TerritoryId, layer: 'surface' | 'depths'): void
  setBossDefeated(id: TerritoryId): void
  setReputation(id: TerritoryId, value: number): void
  addReputation(id: TerritoryId, delta: number): void
}

export const useWorldStore = create<WorldStore>((set) => ({
  ...createInitialWorldState(),

  setCorruption(id, level) {
    set(state => {
      const territories = {
        ...state.territories,
        [id]: { ...state.territories[id], corruptionLevel: Math.max(0, Math.min(100, level)) },
      }
      return { territories, globalCorruption: recalcGlobalCorruption(territories) }
    })
  },

  recordFloorCompleted(id, layer) {
    set(state => {
      const t = state.territories[id]
      const progress = { ...t.playerProgress }
      if (layer === 'surface' && progress.surfaceFloors < 10) progress.surfaceFloors += 1
      if (layer === 'depths' && progress.depthsFloors < 10) progress.depthsFloors += 1
      return { territories: { ...state.territories, [id]: { ...t, playerProgress: progress } } }
    })
  },

  setBossDefeated(id) {
    set(state => {
      const t = state.territories[id]
      return {
        territories: {
          ...state.territories,
          [id]: { ...t, playerProgress: { ...t.playerProgress, bossDefeated: true } },
        },
      }
    })
  },

  setReputation(id, value) {
    set(state => ({
      territories: {
        ...state.territories,
        [id]: {
          ...state.territories[id],
          factionReputation: Math.max(-100, Math.min(100, value)),
        },
      },
    }))
  },

  addReputation(id, delta) {
    set(state => {
      const cur = state.territories[id].factionReputation
      const next = Math.max(-100, Math.min(100, cur + delta))
      return {
        territories: {
          ...state.territories,
          [id]: { ...state.territories[id], factionReputation: next },
        },
      }
    })
  },
}))
