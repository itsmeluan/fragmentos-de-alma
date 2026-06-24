import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Hero, Genome, Rarity } from '@/systems/genes/types'
import { generateFragmentGenome } from '@/systems/genes/generator'
import { calculateRarity } from '@/systems/genes/rarity'
import { generateVisualParams } from '@/systems/visual/generator'
import { generateName } from '@/utils/nameGenerator'
import { generateSkills } from '@/systems/skills/generator'

// Fragmentos iniciais concedidos a um jogador novo (doc 09, Fase 1: "ganha
// fragmentos iniciais... funde dois fragmentos para criar um herói").
// 6 = time completo de dungeon (3 ativos + 3 no banco, doc 06), destravando
// tanto a Fusão quanto a entrada na primeira dungeon sem grind.
const STARTER_FRAGMENT_COUNT = 6

// Custo de fusão em Fragmentos por tier do pai de maior raridade (doc 05).
// A fusão básica NÃO consome Cristais — eles são para intervenções (injeção de
// gene, reroll de mutação, etc.).
const FUSION_TIER_COST: Record<Rarity, number> = {
  comum: 100,
  incomum: 300,
  raro: 800,
  epico: 2000,
  lendario: 5000,
  unico: 5000,
}

const RARITY_ORDER: Rarity[] = ['comum', 'incomum', 'raro', 'epico', 'lendario', 'unico']

// Custo da fusão, determinado pela maior raridade entre os dois pais (doc 05).
export function fusionCost(rarityA: Rarity, rarityB: Rarity): number {
  const higher = RARITY_ORDER.indexOf(rarityA) >= RARITY_ORDER.indexOf(rarityB) ? rarityA : rarityB
  return FUSION_TIER_COST[higher]
}

// Atributo mais forte do genoma — "gene mais forte" cristalizado ao aposentar
// um herói na fusão (doc 01, "Morte e Legado").
function strongestAttribute(genome: Genome): { attr: string; value: number } {
  const entries = Object.entries(genome.attributes) as [string, number][]
  return entries.reduce(
    (best, [attr, value]) => (value > best.value ? { attr, value } : best),
    { attr: entries[0][0], value: entries[0][1] },
  )
}

// Converte uma linha da tabela heroes em um objeto Hero.
function rowToHero(row: Record<string, unknown>): Hero {
  return {
    id: row.id as string,
    playerId: row.player_id as string,
    name: row.name as string,
    fusionSeed: row.fusion_seed as string,
    genome: row.genome as Hero['genome'],
    rarity: row.rarity as Rarity,
    visualParams: row.visual_params as Hero['visualParams'],
    skills: row.skills as Hero['skills'],
    level: (row.level as number) ?? 1,
    xp: (row.xp as number) ?? 0,
    bond: (row.bond as number) ?? 0,
    ultimateCharge: (row.ultimate_charge as number) ?? 0,
    parentAId: (row.parent_a_id as string) ?? undefined,
    parentBId: (row.parent_b_id as string) ?? undefined,
    generation: (row.generation as number) ?? 1,
    isRetired: (row.is_retired as boolean) ?? false,
  }
}

// Dados do herói-filho montados pela tela de fusão (genoma já fundido).
export interface FusionChildInput {
  name: string
  fusionSeed: string
  genome: Genome
  rarity: Rarity
  visualParams: Hero['visualParams']
  skills: Hero['skills']
  generation: number
}

export type FusionResult =
  | { ok: true; hero: Hero }
  | { ok: false; error: string }

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
  grantStarterFragments: () => Promise<void>
  commitFusion: (parentA: Hero, parentB: Hero, child: FusionChildInput) => Promise<FusionResult>
  grantDungeonDrop: (biomeId?: string) => Promise<void>
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

      let { data: playerRow, error: playerErr } = await supabase
        .from('players')
        .select('*')
        .eq('id', user.id)
        .single()

      // PGRST116 = nenhuma linha encontrada. Não há trigger no banco que crie o
      // registro do jogador no signup, então criamos aqui com os defaults da
      // migration 001 (500 fragmentos, 5 cristais, bioma inicial desbloqueado).
      if (playerErr && (playerErr as { code?: string }).code === 'PGRST116') {
        const created = await supabase
          .from('players')
          .insert({ id: user.id, kael_name: 'Kael' })
          .select('*')
          .single()
        if (created.error) throw created.error
        playerRow = created.data
        playerErr = null
      }

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

      // Jogador novo (nunca fundiu e sem heróis) → conceder fragmentos iniciais.
      // Sem isso o jogador fica em soft-lock: a Fusão exige 2 heróis e a dungeon
      // exige 6, mas não há outra forma de obter o primeiro herói.
      const after = get()
      if (after.heroes.length === 0 && (after.player?.totalFusions ?? 0) === 0) {
        await get().grantStarterFragments()
      }
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

      const heroes: Hero[] = (data ?? []).map(rowToHero)

      set({ heroes })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao carregar heróis.' })
    }
  },

  grantStarterFragments: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const rows = Array.from({ length: STARTER_FRAGMENT_COUNT }, (_, i) => {
        const seed = `starter:${user.id}:${i}:${Date.now()}`
        const genome = generateFragmentGenome()
        const rarity = calculateRarity(genome)
        return {
          player_id: user.id,
          name: generateName(genome, seed),
          fusion_seed: seed,
          genome,
          rarity,
          visual_params: generateVisualParams(genome, seed),
          skills: generateSkills(genome, rarity, seed),
          level: 1,
          xp: 0,
          bond: 0,
          ultimate_charge: 0,
          generation: 1,
          is_retired: false,
        }
      })

      const { error } = await supabase.from('heroes').insert(rows)
      if (error) throw error

      await get().loadHeroes()
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao conceder fragmentos iniciais.' })
    }
  },

  // Fusão (doc 01 "Morte e Legado" + doc 05 economia):
  // 1) cobra o custo em Fragmentos (por tier do pai de maior raridade);
  // 2) cria o herói-filho;
  // 3) aposenta (consome) ambos os pais;
  // 4) cristaliza o gene mais forte de cada pai num fragmento (fusion_byproduct).
  commitFusion: async (parentA, parentB, child) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { ok: false, error: 'Não autenticado.' }

      const player = get().player
      if (!player) return { ok: false, error: 'Jogador não carregado.' }

      const cost = fusionCost(parentA.rarity, parentB.rarity)
      if (player.soulFragments < cost) {
        return { ok: false, error: `Fragmentos insuficientes (precisa de ${cost}).` }
      }

      // 1) Cria o herói-filho
      const { data: childRow, error: childErr } = await supabase
        .from('heroes')
        .insert({
          player_id: user.id,
          name: child.name,
          fusion_seed: child.fusionSeed,
          genome: child.genome,
          rarity: child.rarity,
          visual_params: child.visualParams,
          skills: child.skills,
          level: 1,
          xp: 0,
          bond: 0,
          ultimate_charge: 0,
          parent_a_id: parentA.id,
          parent_b_id: parentB.id,
          generation: child.generation,
          is_retired: false,
        })
        .select()
        .single()
      if (childErr) throw childErr

      // 2) Aposenta (consome) ambos os pais
      const { error: retireErr } = await supabase
        .from('heroes')
        .update({ is_retired: true, retired_at: new Date().toISOString() })
        .in('id', [parentA.id, parentB.id])
      if (retireErr) throw retireErr

      // 3) Cristaliza o gene mais forte de cada pai (fragmento reutilizável)
      const crystallized = [parentA, parentB].map((p) => {
        const strongest = strongestAttribute(p.genome)
        return {
          player_id: user.id,
          partial_genome: { essence: p.genome.essence, strongest },
          source: 'fusion_byproduct',
          biome_origin: null,
          preview_visual: p.visualParams,
          estimated_rarity: p.rarity,
        }
      })
      // Fragmentos cristalizados são um byproduct: falha aqui não deve abortar a fusão.
      const { error: fragErr } = await supabase.from('fragments').insert(crystallized)
      if (fragErr) console.warn('[fusion] falha ao cristalizar fragmentos:', fragErr.message)

      // 4) Atualiza recursos/estatísticas do jogador
      const newFragments = player.soulFragments - cost
      const { error: playerErr } = await supabase
        .from('players')
        .update({
          soul_fragments: newFragments,
          total_fusions: player.totalFusions + 1,
        })
        .eq('id', user.id)
      if (playerErr) throw playerErr

      set({
        player: { ...player, soulFragments: newFragments, totalFusions: player.totalFusions + 1 },
      })
      await get().loadHeroes()

      return { ok: true, hero: rowToHero(childRow) }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Falha na fusão.' }
    }
  },

  // Reabastecimento: um fragmento (herói) cai ao limpar um andar da dungeon,
  // fechando o loop colecionável já que a fusão consome os pais (doc 04).
  grantDungeonDrop: async (biomeId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const seed = `drop:${user.id}:${Date.now()}`
      const genome = generateFragmentGenome(biomeId)
      const rarity = calculateRarity(genome)
      const { error } = await supabase.from('heroes').insert({
        player_id: user.id,
        name: generateName(genome, seed),
        fusion_seed: seed,
        genome,
        rarity,
        visual_params: generateVisualParams(genome, seed),
        skills: generateSkills(genome, rarity, seed),
        level: 1,
        xp: 0,
        bond: 0,
        ultimate_charge: 0,
        generation: 1,
        is_retired: false,
      })
      if (error) throw error
      await get().loadHeroes()
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao receber fragmento.' })
    }
  },

  addHero: (hero: Hero) => set((s) => ({ heroes: [hero, ...s.heroes] })),

  clearError: () => set({ error: null }),
}))
