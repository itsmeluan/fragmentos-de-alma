// Tipos do Sistema de Genes de Alma
// ver doc 01_sistema_de_genes.md

// ── Camada 1 — Genes de Essência (imutáveis após fusão) ──────────────────────
export type Origin = 'Abissal' | 'Celestial' | 'Primordial' | 'Forjada' | 'Errante'
export type Affinity = 'Fogo' | 'Água' | 'Terra' | 'Vento' | 'Vazio' | 'Luz' | 'Sombra' | 'Éter'
export type Core = 'Guardião' | 'Destruidor' | 'Arauto' | 'Trickster' | 'Invocador'

// ── Camada 3 — Genes de Mutação (raros, emergentes) ──────────────────────────
export type MutationGene = 'INVERSO' | 'ESPELHO' | 'ANCESTRAL' | 'CAOS' | 'TRANSCENDENCIA'

// ── Raridade dinâmica (calculada a partir do genoma — ver doc 01) ────────────
export type Rarity = 'comum' | 'incomum' | 'raro' | 'epico' | 'lendario' | 'unico'

export interface EssenceGenes {
  origin: Origin
  affinity: Affinity
  core: Core
  hybridAffinity?: string // ex: "Cinza Ardente" quando Fogo + Sombra
}

// ── Camada 2 — Genes de Atributo (numéricos, herdáveis, 1–100) ───────────────
export interface AttributeGenes {
  forca: number // 1-100 — dano físico base
  ressonancia: number // 1-100 — dano elemental e habilidades ativas
  resistencia: number // 1-100 — HP e defesa
  agilidade: number // 1-100 — velocidade de ação e esquiva
  vontade: number // 1-100 — resistência a debuffs e controle mental
  aura: number // 1-100 — poder de passivas e suporte
}

export interface Genome {
  essence: EssenceGenes
  attributes: AttributeGenes
  mutations: MutationGene[]
}

// VisualParams — sistema visual procedural (doc 02, Passo 8)
import type { VisualParams } from '../visual/types'
export type { VisualParams }

// HeroSkills — sistema de habilidades procedurais (doc 03, Passo 10)
import type { HeroSkills } from '../skills/types'
export type { HeroSkills }

export interface Hero {
  id: string
  playerId: string
  name: string
  fusionSeed: string
  genome: Genome
  rarity: Rarity
  visualParams: VisualParams // ver types em sistema visual
  skills: HeroSkills // ver types em sistema de habilidades
  level: number
  xp: number
  bond: number
  currentHp?: number
  ultimateCharge: number
  parentAId?: string
  parentBId?: string
  generation: number
  isRetired: boolean
}
