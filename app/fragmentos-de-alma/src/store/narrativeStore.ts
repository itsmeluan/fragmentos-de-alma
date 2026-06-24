import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

const KEYS = {
  onboarding: 'narrative:onboarding_done',
  prologue: 'narrative:prologue_done',
  hints: 'narrative:seen_hints',
}

interface NarrativeStore {
  loaded: boolean
  onboardingDone: boolean
  prologueDone: boolean
  seenHints: string[]
  load(): Promise<void>
  completeOnboarding(): Promise<void>
  completePrologue(): Promise<void>
  markHintSeen(id: string): void
  hasSeenHint(id: string): boolean
}

export const useNarrativeStore = create<NarrativeStore>((set, get) => ({
  loaded: false,
  onboardingDone: false,
  prologueDone: false,
  seenHints: [],

  async load() {
    try {
      const [ob, pr, hints] = await AsyncStorage.multiGet([
        KEYS.onboarding, KEYS.prologue, KEYS.hints,
      ])
      set({
        loaded: true,
        onboardingDone: ob[1] === 'true',
        prologueDone: pr[1] === 'true',
        seenHints: hints[1] ? JSON.parse(hints[1]) : [],
      })
    } catch {
      set({ loaded: true })
    }
  },

  async completeOnboarding() {
    set({ onboardingDone: true })
    try { await AsyncStorage.setItem(KEYS.onboarding, 'true') } catch {}
  },

  async completePrologue() {
    set({ prologueDone: true })
    try { await AsyncStorage.setItem(KEYS.prologue, 'true') } catch {}
  },

  markHintSeen(id: string) {
    const current = get().seenHints
    if (current.includes(id)) return
    const next = [...current, id]
    set({ seenHints: next })
    try { AsyncStorage.setItem(KEYS.hints, JSON.stringify(next)) } catch {}
  },

  hasSeenHint(id: string) {
    return get().seenHints.includes(id)
  },
}))
