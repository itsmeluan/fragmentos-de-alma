import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Hero } from '@/systems/genes/types'

interface Player {
  id: string
  kaelName: string
  kaelLevel: number
  kaelXp: number
  soulFragments: number
  essenceCrystals: number
  echoes: number
  totalFusions: number
  totalBattles: number
  totalWins: number
  unlockedBiomes: string[]
}

interface GameStore {
  player: Player | null
  heroes: Hero[]
  isLoading: boolean
  error: string | null
  initialize: () => Promise<void>
  loadHeroes: () => Promise<void>
  addHero: (hero: Hero) => void
  clearError: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  player: null,
  heroes: [],
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { set({ isLoading: false }); return }

      const { data: playerRow, error: playerErr } = await supabase
        .from('players')
        .select('*')
        .eq('id', user.id)
        .single()

      if (playerErr) throw playerErr

      set({
        player: {
          id: playerRow.id,
          kaelName: playerRow.kael_name,
          kaelLevel: playerRow.kael_level,
          kaelXp: playerRow.kael_xp,
          soulFragments: playerRow.soul_fragments,
          essenceCrystals: playerRow.essence_crystals,
          echoes: playerRow.echoes,
          totalFusions: playerRow.total_fusions,
          totalBattles: playerRow.total_battles,
          totalWins: playerRow.total_wins,
          unlockedBiomes: playerRow.unlocked_biomes,
        },
      })

      await get().loadHeroes()
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao carregar dados.' })
    } finally {
      set({ isLoading: false })
    }
  },

  loadHeroes: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('heroes')
        .select('*')
        .eq('player_id', user.id)
        .eq('is_retired', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      const heroes: Hero[] = (data ?? []).map((row) => ({
        id: row.id,
        playerId: row.player_id,
        name: row.name,
        fusionSeed: row.fusion_seed,
        genome: row.genome,
        rarity: row.rarity,
        visualParams: row.visual_params,
        skills: row.skills,
        level: row.level ?? 1,
        xp: row.xp ?? 0,
        bond: row.bond ?? 0,
        ultimateCharge: row.ultimate_charge ?? 0,
        parentAId: row.parent_a_id ?? undefined,
        parentBId: row.parent_b_id ?? undefined,
        generation: row.generation ?? 1,
        isRetired: row.is_retired ?? false,
      }))

      set({ heroes })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao carregar heróis.' })
    }
  },

  addHero: (hero: Hero) => set((s) => ({ heroes: [hero, ...s.heroes] })),

  clearError: () => set({ error: null }),
}))
