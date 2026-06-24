import { create } from 'zustand'
import type { Hero } from '@/systems/genes/types'

interface UiStore {
  selectedHero: Hero | null
  fusionSlotA: Hero | null
  fusionSlotB: Hero | null
  revelationHero: Hero | null
  setSelectedHero: (hero: Hero | null) => void
  setFusionSlot: (slot: 'A' | 'B', hero: Hero | null) => void
  setRevelationHero: (hero: Hero | null) => void
  clearFusion: () => void
}

export const useUiStore = create<UiStore>((set) => ({
  selectedHero: null,
  fusionSlotA: null,
  fusionSlotB: null,
  revelationHero: null,
  setSelectedHero: (hero) => set({ selectedHero: hero }),
  setFusionSlot: (slot, hero) =>
    slot === 'A' ? set({ fusionSlotA: hero }) : set({ fusionSlotB: hero }),
  setRevelationHero: (hero) => set({ revelationHero: hero }),
  clearFusion: () => set({ fusionSlotA: null, fusionSlotB: null, revelationHero: null }),
}))
