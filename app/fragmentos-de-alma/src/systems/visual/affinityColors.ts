// Cores por afinidade elemental — fonte canônica para auras/glows em Skia.
// Espelha a tabela de doc 10 (Direção de Arte) e generator.ts.

import type { Affinity } from '@/systems/genes/types'

export interface AffinityPalette {
  primary: string
  secondary: string
  glow: string
}

export const AFFINITY_PALETTE: Record<Affinity, AffinityPalette> = {
  Fogo: { primary: '#C0392B', secondary: '#E67E22', glow: '#FFEB3B' },
  Água: { primary: '#1A6E8E', secondary: '#2980B9', glow: '#AEE6FF' },
  Terra: { primary: '#5D4037', secondary: '#8D6E63', glow: '#A5D6A7' },
  Vento: { primary: '#80CBC4', secondary: '#B2EBF2', glow: '#B0BEC5' },
  Vazio: { primary: '#1A1A2E', secondary: '#6A0572', glow: '#E040FB' },
  Luz: { primary: '#FFF9C4', secondary: '#FDD835', glow: '#FFF176' },
  Sombra: { primary: '#212121', secondary: '#4A148C', glow: '#9C27B0' },
  Éter: { primary: '#E8EAF6', secondary: '#5C6BC0', glow: '#82B1FF' },
}

// Aliases de afinidades não-canônicas (dados legados/de teste) → canônica
const AFFINITY_ALIASES: Record<string, Affinity> = {
  Gelo: 'Água',
  Trovão: 'Vento',
  Raio: 'Vento',
  Eletrico: 'Vento',
  Veneno: 'Vazio',
  Metal: 'Terra',
  Vida: 'Luz',
  Morte: 'Sombra',
}

const FALLBACK_PALETTE: AffinityPalette = AFFINITY_PALETTE['Éter']

/** Retorna a paleta de uma afinidade com normalização de aliases e fallback seguro. */
export function getAffinityPalette(affinity: string): AffinityPalette {
  return AFFINITY_PALETTE[affinity as Affinity]
    ?? AFFINITY_PALETTE[AFFINITY_ALIASES[affinity]]
    ?? FALLBACK_PALETTE
}
