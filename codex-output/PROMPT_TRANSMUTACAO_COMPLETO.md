# PROMPT CODEX — Círculo de Transmutação
*Fragmentos de Alma — Enviar ao Codex para implementação*
*Gerado em: 2026-06-24*

---

## CONTEXTO DO PROJETO

Você está implementando o **Círculo de Transmutação** para o jogo mobile RPG **Fragmentos de Alma**.

**Stack:**
- React Native + Expo SDK 56 (Expo Router v4, baseado em arquivos em `app/`)
- TypeScript em tudo, sem `any`
- Zustand para estado global
- Supabase (PostgreSQL + RLS) para persistência
- Tema visual: paleta escura "Alquimia Noire" — nunca usar `#FFFFFF`, sempre `#E8E0D0` (Branco Pergaminho) ou variações

**Localização do projeto:** `app/fragmentos-de-alma/` dentro do repositório.

**Antes de implementar qualquer arquivo:** leia o documento de design correspondente em `docs/`. O projeto tem 13 documentos de design em `docs/`. O mais relevante para esta tarefa é `docs/13_transmutacao.md`.

---

## O QUE IMPLEMENTAR

### Visão geral
Substituir a tela de Fusão simples por um **Círculo de Transmutação** com 3 operações sobre heróis:
1. **Criar Eco** — aposenta um herói, cria um item blueprint genético (Eco) ou absorve em Eco existente de mesma assinatura
2. **Extrair Cristais** — aposenta um herói, obtém Cristais de Essência
3. **Transmutar Heróis** — nova fusão: 2 pais + 0-3 Ecos catalisadores → 1 filho com possibilidade de +1 tier de raridade

**Regra de proteção de roster:** as 3 operações acima NUNCA operam sobre heróis do time principal (3) ou banco (3). Se a coleção tiver apenas 6 heróis, NENHUM pode ser consumido (exceto se uma Transmutação for iniciada e vai gerar um filho novo).

---

## PASSO 1 — Migration SQL (007)

Criar o arquivo `supabase/migrations/007_transmutation.sql`:

```sql
-- Tabela de Ecos: blueprints genéticos por jogador
CREATE TABLE public.ecos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,

  -- Assinatura genética (identidade)
  signature_origin text NOT NULL,
  signature_affinity text NOT NULL,
  signature_core text NOT NULL,
  signature_mutations text[] NOT NULL DEFAULT '{}',
  -- Chave computada: '{origin}:{affinity}:{core}:{sorted_mutations_joined_by_comma}'
  signature_key text NOT NULL,

  -- Dados genéticos absorvidos (melhores valores, cap 120)
  best_genes jsonb NOT NULL DEFAULT '{}',
  -- { "forca": 85, "ressonancia": 72, "resistencia": 60, ... }

  best_skills jsonb NOT NULL DEFAULT '{}',
  -- { "active_0": {skill obj}, "passive_0": {skill obj}, ... }

  -- Raridade do herói de origem (maior raridade já absorvida)
  rarity text NOT NULL CHECK (rarity IN ('comum','incomum','raro','epico','lendario','unico')),

  -- Quantos heróis foram absorvidos neste Eco
  absorption_count integer NOT NULL DEFAULT 1,

  UNIQUE(player_id, signature_key)
);

CREATE INDEX ecos_player ON public.ecos(player_id);

ALTER TABLE public.ecos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ecos_own" ON public.ecos FOR ALL USING (auth.uid() = player_id);

-- Colunas de roster e legacy_score na tabela players
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS team_hero_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bench_hero_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS legacy_score integer NOT NULL DEFAULT 0;
```

Aplicar com: `supabase db push` na raiz do projeto ou via Supabase Dashboard (SQL Editor).

---

## PASSO 2 — Tipos TypeScript

### `src/systems/genes/eco.ts` (novo arquivo)

```typescript
import type { Rarity } from './types'

export interface Eco {
  id: string
  player_id: string
  created_at: string
  signature_origin: string
  signature_affinity: string
  signature_core: string
  signature_mutations: string[]
  signature_key: string
  best_genes: Record<string, number>
  best_skills: Record<string, unknown>
  rarity: Rarity
  absorption_count: number
}

export interface EcoAbsorptionPreview {
  eco: Eco                             // Eco existente antes da absorção
  changes: Record<string, number>      // atributos que mudariam: { forca: 92 } (novo valor)
  skillChanges: Record<string, string> // skills que mudariam: { active_1: 'Nova Habilidade' }
  willAbsorb: boolean                  // true se há mudança, false se o herói não melhora nada
}

export type EcoCreateResult =
  | { ok: true; eco: Eco; absorbed: boolean }
  | { ok: false; error: string }

export type ExtractCrystalsResult =
  | { ok: true; crystals: number }
  | { ok: false; error: string }

// Probabilidade de +1 tier por número de catalisadores e tier do par de pais
export const TRANSMUTATION_TIER_UP_CHANCE: Record<number, Record<string, number>> = {
  1: { comum: 0.70, incomum: 0.50, raro: 0.30, epico: 0.15 },
  2: { comum: 0.85, incomum: 0.65, raro: 0.45, epico: 0.25 },
  3: { comum: 0.95, incomum: 0.80, raro: 0.60, epico: 0.40 },
}

// Yield de Cristais por raridade ao usar Extrair Cristais
export const CRYSTAL_EXTRACTION_YIELD: Record<Rarity, number> = {
  comum: 1,
  incomum: 3,
  raro: 8,
  epico: 20,
  lendario: 50,
  unico: 120,
}

// Peso de cada Eco único no Score de Legado
export const ECO_LEGACY_WEIGHT: Record<Rarity, number> = {
  comum: 1,
  incomum: 3,
  raro: 8,
  epico: 20,
  lendario: 50,
  unico: 150,
}

// Bônus de chance de tier-up por tier de Legado de Kael
export const KAEL_LEGACY_TIER_BONUS: Record<number, number> = {
  0: 0.00,
  1: 0.02,
  2: 0.04,
  3: 0.06,
  4: 0.08,
  5: 0.10,
}

// Thresholds de Score de Legado para cada tier
export const LEGACY_SCORE_THRESHOLDS = [10, 40, 100, 250, 600]

// Constrói a signature_key de forma determinística
export function buildSignatureKey(
  origin: string,
  affinity: string,
  core: string,
  mutations: string[]
): string {
  return `${origin}:${affinity}:${core}:${[...mutations].sort().join(',')}`
}

// Calcula o Score de Legado total baseado na lista de Ecos
export function calcLegacyScore(ecos: Eco[]): number {
  return ecos.reduce((sum, eco) => sum + (ECO_LEGACY_WEIGHT[eco.rarity] ?? 0), 0)
}

// Retorna o tier de Legado (0–5) pelo score
export function getLegacyTier(score: number): number {
  let tier = 0
  for (const threshold of LEGACY_SCORE_THRESHOLDS) {
    if (score >= threshold) tier++
    else break
  }
  return tier
}

// Mescla os genes de dois genomas, mantendo o melhor valor com cap 120
export function mergeGenes(
  existing: Record<string, number>,
  incoming: Record<string, number>
): Record<string, number> {
  const merged: Record<string, number> = { ...existing }
  for (const [key, value] of Object.entries(incoming)) {
    merged[key] = Math.min(Math.max(existing[key] ?? 0, value), 120)
  }
  return merged
}

// Calcula preview de absorção sem modificar o Eco
export function previewAbsorption(eco: Eco, heroGenes: Record<string, number>): EcoAbsorptionPreview {
  const merged = mergeGenes(eco.best_genes, heroGenes)
  const changes: Record<string, number> = {}
  for (const [key, value] of Object.entries(merged)) {
    if (value !== eco.best_genes[key]) changes[key] = value
  }
  return {
    eco,
    changes,
    skillChanges: {},
    willAbsorb: Object.keys(changes).length > 0,
  }
}
```

---

## PASSO 3 — Atualizar `src/store/gameStore.ts`

Adicionar ao tipo `Player`:
```typescript
teamHeroIds: string[]
benchHeroIds: string[]
legacyScore: number
```

Adicionar ao mapeamento em `initialize()` (dentro do `set({ player: { ... } })`):
```typescript
teamHeroIds: playerRow.team_hero_ids ?? [],
benchHeroIds: playerRow.bench_hero_ids ?? [],
legacyScore: playerRow.legacy_score ?? 0,
```

Adicionar à interface `GameStore`:
```typescript
ecos: Eco[]
loadEcos: () => Promise<void>
commitCreateEco: (heroId: string) => Promise<EcoCreateResult>
commitExtractCrystals: (heroId: string) => Promise<ExtractCrystalsResult>
commitTransmutation: (
  parentAId: string,
  parentBId: string,
  catalystEcoIds: string[],
  child: FusionChildInput
) => Promise<FusionResult>
setRoster: (teamIds: string[], benchIds: string[]) => Promise<void>
isInRoster: (heroId: string) => boolean
canRetireHero: (heroId: string) => boolean
```

Implementar os métodos novos (adicionar dentro do `create<GameStore>((set, get) => ({...}))`):

```typescript
ecos: [],

loadEcos: async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('ecos')
      .select('*')
      .eq('player_id', user.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    set({ ecos: (data ?? []) as Eco[] })
  } catch (e) {
    set({ error: e instanceof Error ? e.message : 'Erro ao carregar Ecos.' })
  }
},

isInRoster: (heroId: string) => {
  const player = get().player
  if (!player) return false
  return player.teamHeroIds.includes(heroId) || player.benchHeroIds.includes(heroId)
},

canRetireHero: (heroId: string) => {
  const { heroes, isInRoster } = get()
  if (isInRoster(heroId)) return false
  // Garante no mínimo 6 heróis na coleção (o roster precisa estar coberto)
  const activeHeroes = heroes.filter(h => !h.isRetired)
  return activeHeroes.length > 6
},

setRoster: async (teamIds: string[], benchIds: string[]) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('players')
      .update({ team_hero_ids: teamIds, bench_hero_ids: benchIds })
      .eq('id', user.id)
    if (error) throw error
    set(state => ({
      player: state.player
        ? { ...state.player, teamHeroIds: teamIds, benchHeroIds: benchIds }
        : null,
    }))
  } catch (e) {
    set({ error: e instanceof Error ? e.message : 'Erro ao salvar roster.' })
  }
},

commitCreateEco: async (heroId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Não autenticado.' }

    const { heroes, ecos, canRetireHero } = get()
    if (!canRetireHero(heroId)) {
      return { ok: false, error: 'Herói está no roster ou coleção tem o mínimo de 6 heróis.' }
    }

    const hero = heroes.find(h => h.id === heroId)
    if (!hero) return { ok: false, error: 'Herói não encontrado.' }

    const { signature_origin, signature_affinity, signature_core, signature_mutations } = {
      signature_origin: hero.genome.essence.origin,
      signature_affinity: hero.genome.essence.affinity,
      signature_core: hero.genome.essence.core,
      signature_mutations: hero.genome.mutations ?? [],
    }
    const signature_key = buildSignatureKey(signature_origin, signature_affinity, signature_core, signature_mutations)

    const heroGenes = hero.genome.attributes as Record<string, number>
    const heroSkills = hero.skills as Record<string, unknown>

    const existingEco = ecos.find(e => e.signature_key === signature_key)
    let resultEco: Eco
    let absorbed = false

    if (existingEco) {
      // Absorção: mesclar genes e skills
      const merged_genes = mergeGenes(existingEco.best_genes, heroGenes)
      const { data, error } = await supabase
        .from('ecos')
        .update({
          best_genes: merged_genes,
          absorption_count: existingEco.absorption_count + 1,
          // Atualizar raridade se herói for de raridade maior
          rarity: RARITY_ORDER.indexOf(hero.rarity) > RARITY_ORDER.indexOf(existingEco.rarity)
            ? hero.rarity
            : existingEco.rarity,
        })
        .eq('id', existingEco.id)
        .select()
        .single()
      if (error) throw error
      resultEco = data as Eco
      absorbed = true
    } else {
      // Novo Eco
      const { data, error } = await supabase
        .from('ecos')
        .insert({
          player_id: user.id,
          signature_origin,
          signature_affinity,
          signature_core,
          signature_mutations,
          signature_key,
          best_genes: heroGenes,
          best_skills: heroSkills,
          rarity: hero.rarity,
          absorption_count: 1,
        })
        .select()
        .single()
      if (error) throw error
      resultEco = data as Eco
    }

    // Aposentar o herói
    const { error: retireErr } = await supabase
      .from('heroes')
      .update({ is_retired: true, retired_at: new Date().toISOString() })
      .eq('id', heroId)
    if (retireErr) throw retireErr

    // Recalcular legacy_score
    await get().loadEcos()
    const updatedEcos = get().ecos
    const newScore = calcLegacyScore(updatedEcos)
    await supabase.from('players').update({ legacy_score: newScore }).eq('id', user.id)

    set(state => ({
      heroes: state.heroes.filter(h => h.id !== heroId),
      player: state.player ? { ...state.player, legacyScore: newScore } : null,
    }))

    return { ok: true, eco: resultEco, absorbed }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erro ao criar Eco.' }
  }
},

commitExtractCrystals: async (heroId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Não autenticado.' }

    const { heroes, player, canRetireHero } = get()
    if (!player) return { ok: false, error: 'Jogador não carregado.' }
    if (!canRetireHero(heroId)) {
      return { ok: false, error: 'Herói está no roster ou coleção tem o mínimo de 6 heróis.' }
    }

    const hero = heroes.find(h => h.id === heroId)
    if (!hero) return { ok: false, error: 'Herói não encontrado.' }

    const crystals = CRYSTAL_EXTRACTION_YIELD[hero.rarity] ?? 1

    // Aposentar herói
    const { error: retireErr } = await supabase
      .from('heroes')
      .update({ is_retired: true, retired_at: new Date().toISOString() })
      .eq('id', heroId)
    if (retireErr) throw retireErr

    // Creditar Cristais
    const newCrystals = player.essenceCrystals + crystals
    const { error: updateErr } = await supabase
      .from('players')
      .update({ essence_crystals: newCrystals })
      .eq('id', user.id)
    if (updateErr) throw updateErr

    set(state => ({
      heroes: state.heroes.filter(h => h.id !== heroId),
      player: state.player ? { ...state.player, essenceCrystals: newCrystals } : null,
    }))

    return { ok: true, crystals }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erro ao extrair Cristais.' }
  }
},

commitTransmutation: async (parentAId, parentBId, catalystEcoIds, child) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Não autenticado.' }

    const { heroes, ecos, player, isInRoster } = get()
    if (!player) return { ok: false, error: 'Jogador não carregado.' }

    const parentA = heroes.find(h => h.id === parentAId)
    const parentB = heroes.find(h => h.id === parentBId)
    if (!parentA || !parentB) return { ok: false, error: 'Herói pai não encontrado.' }
    if (isInRoster(parentAId) || isInRoster(parentBId)) {
      return { ok: false, error: 'Pais não podem estar no roster.' }
    }

    const cost = fusionCost(parentA.rarity, parentB.rarity)
    if (player.soulFragments < cost) {
      return { ok: false, error: `Fragmentos insuficientes (precisa de ${cost}).` }
    }

    // Validar catalisadores
    if (catalystEcoIds.length > 3) return { ok: false, error: 'Máximo 3 catalisadores.' }
    const catalysts = catalystEcoIds.map(id => ecos.find(e => e.id === id)).filter(Boolean) as Eco[]

    // Criar filho
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
        parent_a_id: parentAId,
        parent_b_id: parentBId,
        generation: child.generation,
        is_retired: false,
      })
      .select()
      .single()
    if (childErr) throw childErr

    // Aposentar pais
    const { error: retireErr } = await supabase
      .from('heroes')
      .update({ is_retired: true, retired_at: new Date().toISOString() })
      .in('id', [parentAId, parentBId])
    if (retireErr) throw retireErr

    // Remover catalisadores Ecos usados
    if (catalystEcoIds.length > 0) {
      const { error: ecoErr } = await supabase
        .from('ecos')
        .delete()
        .in('id', catalystEcoIds)
      if (ecoErr) throw ecoErr
    }

    // Cristalizar genes dos pais (comportamento existente)
    const strongA = strongestAttribute(parentA.genome)
    const strongB = strongestAttribute(parentB.genome)
    await supabase.from('fragments').insert([
      { player_id: user.id, source: 'fusion_byproduct', gene_type: strongA.attr, gene_value: strongA.value, from_hero_id: parentAId },
      { player_id: user.id, source: 'fusion_byproduct', gene_type: strongB.attr, gene_value: strongB.value, from_hero_id: parentBId },
    ])

    // Atualizar recursos
    const newFragments = player.soulFragments - cost
    const newFusions = player.totalFusions + 1
    const { error: updateErr } = await supabase
      .from('players')
      .update({ soul_fragments: newFragments, total_fusions: newFusions })
      .eq('id', user.id)
    if (updateErr) throw updateErr

    // Atualizar estado local
    const newHero = rowToHero(childRow as Record<string, unknown>)
    set(state => ({
      heroes: [
        newHero,
        ...state.heroes.filter(h => h.id !== parentAId && h.id !== parentBId),
      ],
      ecos: state.ecos.filter(e => !catalystEcoIds.includes(e.id)),
      player: state.player
        ? { ...state.player, soulFragments: newFragments, totalFusions: newFusions }
        : null,
    }))

    return { ok: true, hero: newHero }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erro na transmutação.' }
  }
},
```

Adicionar ao topo do arquivo `gameStore.ts` os imports necessários:
```typescript
import type { Eco, EcoCreateResult, ExtractCrystalsResult } from '@/systems/genes/eco'
import {
  buildSignatureKey,
  calcLegacyScore,
  mergeGenes,
  CRYSTAL_EXTRACTION_YIELD,
  ECO_LEGACY_WEIGHT,
  KAEL_LEGACY_TIER_BONUS,
  RARITY_ORDER as ECO_RARITY_ORDER,
} from '@/systems/genes/eco'
```

E no `initialize()`, chamar `loadEcos()` após `loadHeroes()`:
```typescript
await get().loadHeroes()
await get().loadEcos()
```

---

## PASSO 4 — Tela Principal: `app/(game)/transmutation.tsx`

Substituir `app/(game)/fusion.tsx` com o arquivo `app/(game)/transmutation.tsx` (a tab continua existindo mas com novo nome e conteúdo).

**Estrutura de componentes:**

```
TransmutationScreen (tela principal)
├── Header: "◈ CÍRCULO DE TRANSMUTAÇÃO ◈"
├── TabBar (3 abas): [Criar Eco] [Extrair Cristais] [Transmutar]
│
├── CreateEcoTab (quando aba 0 ativa)
│   ├── Lista de heróis fora do roster (ScrollView/FlatList)
│   ├── HeroCard para cada um (reutilizar componente existente)
│   ├── Indicador visual "SERÁ ABSORVIDO" se assinatura já existe
│   └── Modal de confirmação com preview de absorção ou criação
│
├── ExtractCrystalsTab (quando aba 1 ativa)
│   ├── Lista de heróis fora do roster
│   ├── HeroCard com badge de yield de Cristais (ex: "+8 Cristais")
│   └── Modal de confirmação com yield final
│
└── TransmuteTab (quando aba 2 ativa)
    ├── SlotA + SlotB (seleção de heróis pais)
    ├── CatalystsPanel (0-3 slots de Eco catalisador)
    ├── PreviewPanel:
    │   ├── Tier garantido do filho
    │   ├── Probabilidade de +1 tier (se catalisadores > 0)
    │   └── Custo total (Fragmentos + Ecos consumidos)
    ├── AlchemicalCircle (componente existente em AlchemicalCircle.tsx)
    └── Botão "TRANSMUTAR"
```

**Implementação completa:**

```tsx
// app/(game)/transmutation.tsx
import React, { useState, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet,
  ScrollView, Alert, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGameStore, fusionCost } from '@/store/gameStore'
import { useUIStore } from '@/store/uiStore'
import { HeroCard } from '@/components/hero/HeroCard'
import { HeroDetail } from '@/components/hero/HeroDetail'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { AlchemicalCircle } from '@/components/fusion/AlchemicalCircle'
import { theme } from '@/lib/theme'
import type { Hero, Rarity } from '@/systems/genes/types'
import type { Eco } from '@/systems/genes/eco'
import {
  previewAbsorption,
  CRYSTAL_EXTRACTION_YIELD,
  TRANSMUTATION_TIER_UP_CHANCE,
  KAEL_LEGACY_TIER_BONUS,
  getLegacyTier,
  buildSignatureKey,
} from '@/systems/genes/eco'
import { fuseGenomes } from '@/systems/genes/fusion'
import { calculateRarity } from '@/systems/genes/rarity'
import { generateVisualParams } from '@/systems/visual/generator'
import { generateName } from '@/utils/nameGenerator'
import { generateSkills } from '@/systems/skills/generator'

const RARITY_ORDER: Rarity[] = ['comum', 'incomum', 'raro', 'epico', 'lendario', 'unico']
const RARITY_LABELS: Record<Rarity, string> = {
  comum: 'Comum', incomum: 'Incomum', raro: 'Raro',
  epico: 'Épico', lendario: 'Lendário', unico: 'Único',
}

type ActiveTab = 0 | 1 | 2

export default function TransmutationScreen() {
  const {
    player, heroes, ecos, isLoading,
    commitCreateEco, commitExtractCrystals, commitTransmutation,
    isInRoster, canRetireHero,
  } = useGameStore()
  const [activeTab, setActiveTab] = useState<ActiveTab>(0)

  // Heróis disponíveis (fora do roster, não aposentados)
  const availableHeroes = heroes.filter(h => !h.isRetired && canRetireHero(h.id))

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>◈ CÍRCULO DE TRANSMUTAÇÃO ◈</Text>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['Criar Eco', 'Extrair Cristais', 'Transmutar'] as const).map((label, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.tab, activeTab === i && styles.tabActive]}
            onPress={() => setActiveTab(i as ActiveTab)}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 0 && (
        <CreateEcoTab
          heroes={availableHeroes}
          ecos={ecos}
          onCommit={commitCreateEco}
          isLoading={isLoading}
        />
      )}
      {activeTab === 1 && (
        <ExtractCrystalsTab
          heroes={availableHeroes}
          onCommit={commitExtractCrystals}
          isLoading={isLoading}
        />
      )}
      {activeTab === 2 && (
        <TransmuteTab
          heroes={availableHeroes}
          ecos={ecos}
          player={player}
          onCommit={commitTransmutation}
          isLoading={isLoading}
        />
      )}
    </SafeAreaView>
  )
}

// ─── CreateEcoTab ─────────────────────────────────────────────────────────────

function CreateEcoTab({
  heroes, ecos, onCommit, isLoading,
}: {
  heroes: Hero[]
  ecos: Eco[]
  onCommit: ReturnType<typeof useGameStore>['commitCreateEco']
  isLoading: boolean
}) {
  const [selected, setSelected] = useState<Hero | null>(null)
  const [confirming, setConfirming] = useState(false)

  const getExistingEco = useCallback((hero: Hero) => {
    const key = buildSignatureKey(
      hero.genome.essence.origin,
      hero.genome.essence.affinity,
      hero.genome.essence.core,
      hero.genome.mutations ?? []
    )
    return ecos.find(e => e.signature_key === key) ?? null
  }, [ecos])

  const handleConfirm = async () => {
    if (!selected) return
    setConfirming(true)
    const result = await onCommit(selected.id)
    setConfirming(false)
    setSelected(null)
    if (!result.ok) {
      Alert.alert('Erro', result.error)
    } else {
      Alert.alert(
        result.absorbed ? 'Eco Absorvido' : 'Eco Criado',
        result.absorbed
          ? `O Eco de ${selected.name} foi absorvido num Eco existente — genes superiores preservados.`
          : `Eco de ${selected.name} cristalizado com sucesso.`
      )
    }
  }

  return (
    <View style={styles.tabContent}>
      {heroes.length === 0 ? (
        <Text style={styles.emptyText}>
          Nenhum herói disponível fora do roster.
        </Text>
      ) : (
        <FlatList
          data={heroes}
          keyExtractor={h => h.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => {
            const existing = getExistingEco(item)
            return (
              <View style={styles.cardWrapper}>
                {existing && (
                  <View style={styles.absorbBadge}>
                    <Text style={styles.absorbBadgeText}>ABSORÇÃO</Text>
                  </View>
                )}
                <HeroCard hero={item} onPress={() => setSelected(item)} />
              </View>
            )
          }}
        />
      )}

      {selected && (
        <Modal visible onClose={() => setSelected(null)}>
          <Text style={styles.modalTitle}>
            {getExistingEco(selected) ? 'Absorver no Eco existente' : 'Criar Eco'}
          </Text>
          <Text style={styles.modalHero}>{selected.name}</Text>
          <Text style={styles.modalRarity}>{RARITY_LABELS[selected.rarity]}</Text>
          <Text style={styles.modalDesc}>
            {getExistingEco(selected)
              ? 'Este herói tem a mesma assinatura genética de um Eco que você já possui. Os melhores genes serão absorvidos (cap 120). O herói será aposentado.'
              : 'O genoma deste herói será cristalizado como Eco. O herói será aposentado.'}
          </Text>
          <Button
            label={confirming ? 'Cristalizando...' : 'Confirmar'}
            variant="primary"
            onPress={handleConfirm}
            disabled={confirming}
          />
          <Button label="Cancelar" variant="secondary" onPress={() => setSelected(null)} />
        </Modal>
      )}
    </View>
  )
}

// ─── ExtractCrystalsTab ───────────────────────────────────────────────────────

function ExtractCrystalsTab({
  heroes, onCommit, isLoading,
}: {
  heroes: Hero[]
  onCommit: ReturnType<typeof useGameStore>['commitExtractCrystals']
  isLoading: boolean
}) {
  const [selected, setSelected] = useState<Hero | null>(null)
  const [confirming, setConfirming] = useState(false)

  const handleConfirm = async () => {
    if (!selected) return
    setConfirming(true)
    const result = await onCommit(selected.id)
    setConfirming(false)
    setSelected(null)
    if (!result.ok) {
      Alert.alert('Erro', result.error)
    } else {
      Alert.alert('Cristais Extraídos', `+${result.crystals} Cristais de Essência obtidos de ${selected.name}.`)
    }
  }

  const yield_ = (hero: Hero) => CRYSTAL_EXTRACTION_YIELD[hero.rarity] ?? 1

  return (
    <View style={styles.tabContent}>
      {heroes.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum herói disponível fora do roster.</Text>
      ) : (
        <FlatList
          data={heroes}
          keyExtractor={h => h.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <View style={styles.crystalBadge}>
                <Text style={styles.crystalBadgeText}>+{yield_(item)} 💎</Text>
              </View>
              <HeroCard hero={item} onPress={() => setSelected(item)} />
            </View>
          )}
        />
      )}

      {selected && (
        <Modal visible onClose={() => setSelected(null)}>
          <Text style={styles.modalTitle}>Extrair Cristais</Text>
          <Text style={styles.modalHero}>{selected.name}</Text>
          <Text style={styles.modalRarity}>{RARITY_LABELS[selected.rarity]}</Text>
          <Text style={styles.modalDesc}>
            {`Este herói será aposentado.\nVocê receberá +${yield_(selected)} Cristais de Essência.`}
          </Text>
          <Button
            label={confirming ? 'Extraindo...' : `Extrair (+${yield_(selected)} Cristais)`}
            variant="primary"
            onPress={handleConfirm}
            disabled={confirming}
          />
          <Button label="Cancelar" variant="secondary" onPress={() => setSelected(null)} />
        </Modal>
      )}
    </View>
  )
}

// ─── TransmuteTab ─────────────────────────────────────────────────────────────

function TransmuteTab({
  heroes, ecos, player, onCommit, isLoading,
}: {
  heroes: Hero[]
  ecos: Eco[]
  player: ReturnType<typeof useGameStore>['player']
  onCommit: ReturnType<typeof useGameStore>['commitTransmutation']
  isLoading: boolean
}) {
  const [parentA, setParentA] = useState<Hero | null>(null)
  const [parentB, setParentB] = useState<Hero | null>(null)
  const [catalysts, setCatalysts] = useState<Eco[]>([])
  const [selectingSlot, setSelectingSlot] = useState<'A' | 'B' | 'CAT' | null>(null)
  const [transmuting, setTransmuting] = useState(false)
  const [resultHero, setResultHero] = useState<Hero | null>(null)

  const canTransmute = parentA && parentB && parentA.id !== parentB.id
  const cost = canTransmute ? fusionCost(parentA.rarity, parentB.rarity) : 0
  const canAfford = (player?.soulFragments ?? 0) >= cost

  // Probabilidade de +1 tier
  const tierUpChance = (() => {
    if (!canTransmute || catalysts.length === 0) return null
    const higherRarity = RARITY_ORDER.indexOf(parentA!.rarity) >= RARITY_ORDER.indexOf(parentB!.rarity)
      ? parentA!.rarity : parentB!.rarity
    const base = TRANSMUTATION_TIER_UP_CHANCE[catalysts.length]?.[higherRarity] ?? 0
    const kaelTier = getLegacyTier(player?.legacyScore ?? 0)
    const bonus = KAEL_LEGACY_TIER_BONUS[kaelTier] ?? 0
    return Math.min(base + bonus, 0.99)
  })()

  const handleTransmute = async () => {
    if (!canTransmute || !canAfford) return
    setTransmuting(true)

    // Aplicar probabilidade de tier-up
    let targetRarity = calculateRarity(
      (() => {
        const result = fuseGenomes({
          parentA: parentA!.genome,
          parentB: parentB!.genome,
          seed: `transmute:${Date.now()}`,
        })
        return result.genome
      })()
    )

    // Verificar tier-up por catalisadores
    if (tierUpChance !== null && Math.random() < tierUpChance) {
      const currentIdx = RARITY_ORDER.indexOf(targetRarity)
      if (currentIdx < RARITY_ORDER.length - 1) {
        targetRarity = RARITY_ORDER[currentIdx + 1]
      }
    }

    // Gerar filho com a raridade final
    const seed = `transmute:${parentA!.id}:${parentB!.id}:${Date.now()}`
    const fusionResult = fuseGenomes({
      parentA: parentA!.genome,
      parentB: parentB!.genome,
      seed,
    })
    // Clampar atributos ao cap 120
    const genome = {
      ...fusionResult.genome,
      attributes: Object.fromEntries(
        Object.entries(fusionResult.genome.attributes).map(([k, v]) => [k, Math.min(v as number, 120)])
      ),
    }
    const visualParams = generateVisualParams(genome, seed)
    const childName = generateName(genome, seed)
    const skills = generateSkills(genome, targetRarity, seed)
    const generation = Math.max(parentA!.generation ?? 1, parentB!.generation ?? 1) + 1

    const result = await onCommit(parentA!.id, parentB!.id, catalysts.map(c => c.id), {
      name: childName,
      fusionSeed: seed,
      genome,
      rarity: targetRarity,
      visualParams,
      skills,
      generation,
    })

    setTransmuting(false)

    if (!result.ok) {
      Alert.alert('Erro na Transmutação', result.error)
    } else {
      setResultHero(result.hero)
      setParentA(null)
      setParentB(null)
      setCatalysts([])
    }
  }

  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Slots dos pais */}
      <View style={styles.parentRow}>
        <TouchableOpacity
          style={[styles.parentSlot, parentA && styles.parentSlotFilled]}
          onPress={() => setSelectingSlot('A')}
          accessibilityLabel="Selecionar Pai A"
        >
          {parentA ? (
            <>
              <Text style={styles.slotHeroName}>{parentA.name}</Text>
              <Text style={styles.slotHeroRarity}>{RARITY_LABELS[parentA.rarity]}</Text>
            </>
          ) : (
            <Text style={styles.slotEmpty}>+ Pai A</Text>
          )}
        </TouchableOpacity>

        <AlchemicalCircle size={80} />

        <TouchableOpacity
          style={[styles.parentSlot, parentB && styles.parentSlotFilled]}
          onPress={() => setSelectingSlot('B')}
          accessibilityLabel="Selecionar Pai B"
        >
          {parentB ? (
            <>
              <Text style={styles.slotHeroName}>{parentB.name}</Text>
              <Text style={styles.slotHeroRarity}>{RARITY_LABELS[parentB.rarity]}</Text>
            </>
          ) : (
            <Text style={styles.slotEmpty}>+ Pai B</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Catalisadores */}
      <Text style={styles.sectionLabel}>Catalisadores (Ecos) — máx. 3</Text>
      <View style={styles.catalystsRow}>
        {[0, 1, 2].map(i => {
          const eco = catalysts[i]
          return (
            <TouchableOpacity
              key={i}
              style={[styles.catalystSlot, eco && styles.catalystSlotFilled]}
              onPress={() => eco ? setCatalysts(catalysts.filter((_, j) => j !== i)) : setSelectingSlot('CAT')}
              accessibilityLabel={eco ? `Remover catalisador ${i + 1}` : `Adicionar catalisador ${i + 1}`}
            >
              {eco ? (
                <Text style={styles.catalystText} numberOfLines={2}>
                  {eco.signature_origin}/{eco.signature_affinity}
                  {'\n'}{RARITY_LABELS[eco.rarity]}
                </Text>
              ) : (
                <Text style={styles.slotEmpty}>+ Eco</Text>
              )}
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Preview */}
      {canTransmute && (
        <View style={styles.previewBox}>
          <Text style={styles.previewTitle}>Preview da Transmutação</Text>
          <Text style={styles.previewLine}>Custo: {cost} Fragmentos</Text>
          {catalysts.length > 0 && tierUpChance !== null && (
            <Text style={styles.previewLine}>
              Chance de +1 tier: {Math.round(tierUpChance * 100)}%
            </Text>
          )}
          {!canAfford && (
            <Text style={styles.previewWarn}>
              Fragmentos insuficientes ({player?.soulFragments ?? 0}/{cost})
            </Text>
          )}
        </View>
      )}

      {/* Botão */}
      <Button
        label={transmuting ? 'Transmutando...' : 'TRANSMUTAR'}
        variant="primary"
        onPress={handleTransmute}
        disabled={!canTransmute || !canAfford || transmuting}
      />

      {/* Modal seleção de heróis para pai A/B */}
      {(selectingSlot === 'A' || selectingSlot === 'B') && (
        <Modal visible onClose={() => setSelectingSlot(null)}>
          <Text style={styles.modalTitle}>
            Selecionar {selectingSlot === 'A' ? 'Pai A' : 'Pai B'}
          </Text>
          <FlatList
            data={heroes.filter(h => {
              if (selectingSlot === 'A') return h.id !== parentB?.id
              return h.id !== parentA?.id
            })}
            keyExtractor={h => h.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
              <View style={[styles.cardWrapper, { flex: 0.5 }]}>
                <HeroCard
                  hero={item}
                  onPress={() => {
                    if (selectingSlot === 'A') setParentA(item)
                    else setParentB(item)
                    setSelectingSlot(null)
                  }}
                />
              </View>
            )}
          />
          <Button label="Cancelar" variant="secondary" onPress={() => setSelectingSlot(null)} />
        </Modal>
      )}

      {/* Modal seleção de catalisador */}
      {selectingSlot === 'CAT' && (
        <Modal visible onClose={() => setSelectingSlot(null)}>
          <Text style={styles.modalTitle}>Selecionar Eco Catalisador</Text>
          {ecos.filter(e => !catalysts.find(c => c.id === e.id)).length === 0 ? (
            <Text style={styles.emptyText}>Nenhum Eco disponível.</Text>
          ) : (
            <FlatList
              data={ecos.filter(e => !catalysts.find(c => c.id === e.id))}
              keyExtractor={e => e.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.ecoRow}
                  onPress={() => {
                    setCatalysts([...catalysts, item])
                    setSelectingSlot(null)
                  }}
                >
                  <Text style={styles.ecoName}>
                    {item.signature_origin} / {item.signature_affinity} / {item.signature_core}
                  </Text>
                  <Text style={styles.ecoRarity}>{RARITY_LABELS[item.rarity]}</Text>
                  <Text style={styles.ecoAbsorb}>Absorções: {item.absorption_count}</Text>
                </TouchableOpacity>
              )}
            />
          )}
          <Button label="Cancelar" variant="secondary" onPress={() => setSelectingSlot(null)} />
        </Modal>
      )}

      {/* Modal resultado */}
      {resultHero && (
        <Modal visible onClose={() => setResultHero(null)}>
          <Text style={styles.modalTitle}>✨ Transmutação Concluída</Text>
          <HeroDetail hero={resultHero} />
          <Button label="Fechar" variant="primary" onPress={() => setResultHero(null)} />
        </Modal>
      )}
    </ScrollView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  title: { fontFamily: theme.typography.displayFont, fontSize: 18, color: theme.colors.gold, textAlign: 'center', paddingVertical: 16 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: theme.colors.gold },
  tabText: { fontFamily: theme.typography.labelFont, fontSize: 11, color: theme.colors.textMuted, textTransform: 'uppercase' },
  tabTextActive: { color: theme.colors.gold },
  tabContent: { flex: 1 },
  row: { justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 },
  cardWrapper: { flex: 0.48, position: 'relative', marginTop: 8 },
  absorbBadge: { position: 'absolute', top: 4, right: 4, zIndex: 10, backgroundColor: theme.colors.gold, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 },
  absorbBadgeText: { fontSize: 9, color: '#0A0A0F', fontFamily: theme.typography.labelFont },
  crystalBadge: { position: 'absolute', top: 4, right: 4, zIndex: 10, backgroundColor: '#3B82F6', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 },
  crystalBadgeText: { fontSize: 10, color: '#E8E0D0', fontFamily: theme.typography.labelFont },
  emptyText: { color: theme.colors.textMuted, textAlign: 'center', marginTop: 40, fontFamily: theme.typography.bodyFont },
  modalTitle: { fontFamily: theme.typography.displayFont, fontSize: 16, color: theme.colors.gold, textAlign: 'center', marginBottom: 12 },
  modalHero: { fontFamily: theme.typography.bodyFont, fontSize: 14, color: theme.colors.textPrimary, textAlign: 'center' },
  modalRarity: { fontFamily: theme.typography.labelFont, fontSize: 12, color: theme.colors.textMuted, textAlign: 'center', marginBottom: 12 },
  modalDesc: { fontFamily: theme.typography.bodyFont, fontSize: 13, color: theme.colors.textPrimary, textAlign: 'center', marginBottom: 16 },
  parentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  parentSlot: { width: '40%', height: 100, borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  parentSlotFilled: { borderColor: theme.colors.gold, borderStyle: 'solid', backgroundColor: 'rgba(212,175,55,0.08)' },
  slotHeroName: { fontFamily: theme.typography.bodyFont, fontSize: 12, color: theme.colors.textPrimary, textAlign: 'center' },
  slotHeroRarity: { fontFamily: theme.typography.labelFont, fontSize: 10, color: theme.colors.textMuted },
  slotEmpty: { fontFamily: theme.typography.labelFont, fontSize: 14, color: theme.colors.textMuted },
  sectionLabel: { fontFamily: theme.typography.labelFont, fontSize: 11, color: theme.colors.textMuted, textTransform: 'uppercase', marginLeft: 16, marginTop: 8, marginBottom: 4 },
  catalystsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, marginBottom: 16 },
  catalystSlot: { width: '30%', height: 72, borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  catalystSlotFilled: { borderColor: theme.colors.accent, borderStyle: 'solid', backgroundColor: 'rgba(100,80,200,0.1)' },
  catalystText: { fontFamily: theme.typography.labelFont, fontSize: 9, color: theme.colors.textPrimary, textAlign: 'center' },
  previewBox: { marginHorizontal: 16, padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 16, borderLeftWidth: 2, borderLeftColor: theme.colors.gold },
  previewTitle: { fontFamily: theme.typography.displayFont, fontSize: 12, color: theme.colors.gold, marginBottom: 6 },
  previewLine: { fontFamily: theme.typography.bodyFont, fontSize: 13, color: theme.colors.textPrimary, marginBottom: 2 },
  previewWarn: { fontFamily: theme.typography.labelFont, fontSize: 12, color: '#EF4444', marginTop: 4 },
  ecoRow: { padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  ecoName: { fontFamily: theme.typography.bodyFont, fontSize: 13, color: theme.colors.textPrimary },
  ecoRarity: { fontFamily: theme.typography.labelFont, fontSize: 11, color: theme.colors.textMuted },
  ecoAbsorb: { fontFamily: theme.typography.labelFont, fontSize: 10, color: theme.colors.textMuted },
})
```

---

## PASSO 5 — Atualizar Tab Bar

Em `app/(game)/_layout.tsx`, renomear a tab "Fundir" para "Círculo" e apontar para `transmutation`:

```tsx
// Trocar a tab de fusão:
<Tabs.Screen
  name="fusion"
  options={{ href: null }}  // esconder a antiga rota
/>
<Tabs.Screen
  name="transmutation"
  options={{
    title: 'Círculo',
    tabBarIcon: ({ focused, color }) => (
      <TabIcon name="tab-fusion" focused={focused} color={color} />
    ),
  }}
/>
```

Se `fusion.tsx` ainda for necessário (redirecionamento), pode deixar como arquivo vazio redirecionando para `transmutation`.

---

## PASSO 6 — Tela de Roster (`src/components/transmutation/RosterManager.tsx`)

Criar componente para o jogador designar seu time e banco:

```tsx
// src/components/transmutation/RosterManager.tsx
// Permite arrastar/selecionar heróis para team (3 slots) e bench (3 slots)
// Usa useGameStore().setRoster() para persistir
// Exibir em modal a partir da tela de Coleção (collection.tsx) ou como seção dedicada

// Interface:
// - 3 slots "TIME" + 3 slots "BANCO" no topo
// - Lista de heróis disponíveis abaixo
// - Toque em herói disponível → tenta adicionar ao time (se não cheio) ou ao banco
// - Toque em herói no slot → remove do roster
// - Save automático ao fechar (debounce 500ms após última mudança)
```

---

## PASSO 7 — Dados de Teste (SQL)

Para testar sem preocupação com recursos, executar no **Supabase Dashboard → SQL Editor** ou via `supabase db push`:

```sql
-- Arquivo: supabase/migrations/008_test_data_luan.sql
-- ATENÇÃO: APENAS PARA DESENVOLVIMENTO LOCAL — não incluir em produção

-- Buscar o player_id do usuário de teste
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Busca pelo email do usuário de teste
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'm.luan.mobile@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Usuário m.luan.mobile@gmail.com não encontrado. Crie a conta primeiro.';
    RETURN;
  END IF;

  -- Garantir que o registro players existe
  INSERT INTO public.players (id, kael_name)
  VALUES (v_user_id, 'Kael')
  ON CONFLICT (id) DO NOTHING;

  -- Creditar recursos abundantes para testes
  UPDATE public.players
  SET
    soul_fragments    = 50000,
    essence_crystals  = 500,
    echoes            = 999,
    kael_level        = 10,
    kael_xp           = 5000,
    legacy_score      = 300
  WHERE id = v_user_id;

  -- Desbloquear todos os biomas
  UPDATE public.players
  SET unlocked_biomes = ARRAY[
    'kethara', 'abismo', 'celestial', 'genesis', 'forja',
    'axis', 'mnemos', 'verdania', 'cinderfall', 'limiar', 'venula'
  ]
  WHERE id = v_user_id;

  RAISE NOTICE 'Recursos creditados para % (id: %)', 'm.luan.mobile@gmail.com', v_user_id;
END $$;
```

**Como aplicar:**
1. Acesse o Supabase Dashboard do projeto
2. SQL Editor → Cole o SQL acima → Run
3. Ou salve como `supabase/migrations/008_test_data_luan.sql` e rode `supabase db push`

---

## PASSO 8 — Atualizar `docs/00_documento_mestre.md`

Adicionar linha na tabela de documentos:
```
| `13_transmutacao.md` | Círculo de Transmutação: Criar Eco, Extrair Cristais, Transmutar Heróis | Antes de implementar transmutação |
```

---

## VERIFICAÇÕES FINAIS

Após implementar, executar na pasta `app/fragmentos-de-alma/`:

```bash
# TypeScript
npx tsc --noEmit

# Testes (não devem regredir)
npm test -- --runInBand

# Iniciar no simulador iOS
npx expo start --clear
```

O fluxo completo a testar:
1. Login → tela Mapa → tab "Círculo"
2. **Criar Eco**: selecionar herói, confirmar, ver herói sumir da coleção e Eco aparecer
3. **Absorção**: criar Eco com herói da mesma assinatura, ver badge "ABSORÇÃO", confirmar
4. **Extrair Cristais**: selecionar herói, ver "+X Cristais" no badge, confirmar, ver Cristais aumentar no perfil
5. **Transmutar sem catalisador**: selecionar 2 pais, ver custo, confirmar, ver filho aparecer na coleção
6. **Transmutar com 1 catalisador**: selecionar 2 pais + 1 Eco, ver % de tier-up, confirmar
7. **Proteção de roster**: heróis no team/bench não devem aparecer nas listas de Criar Eco ou Extrair Cristais

---

## REFERÊNCIAS

- `docs/13_transmutacao.md` — especificação completa do sistema
- `docs/05_economia.md` — economia atualizada (Ecos como blueprints)
- `docs/09_roadmap_mvp.md` — migrations 001–006 existentes
- `src/systems/genes/fusion.ts` — lógica de fusão existente (reutilizar)
- `src/store/gameStore.ts` — store principal (modificar)
- `src/components/fusion/AlchemicalCircle.tsx` — animação existente (reutilizar)
- `src/components/hero/HeroCard.tsx` — card existente (reutilizar)
- `src/components/ui/Modal.tsx` e `Button.tsx` — UI existente (reutilizar)
