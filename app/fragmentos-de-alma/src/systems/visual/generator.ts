// Gerador de parâmetros visuais procedurais — funções puras
// ver doc 02_sistema_visual.md (6 camadas + Protocolo de Unicidade)
import { makeSeededRng } from '@/utils/random'
import type { Affinity, Genome } from '../genes/types'
import type { AuraLevel, PatternDensity, ResonanceLevel, SilhouetteWeight, VisualParams } from './types'

interface AffinityColors {
  primary: string
  secondary: string
  glow: string
}

// Cores base por afinidade — doc 02 (Camada 3)
const AFFINITY_COLORS: Record<Affinity, AffinityColors> = {
  Fogo:   { primary: '#C0392B', secondary: '#E67E22', glow: '#FFEB3B' },
  Água:   { primary: '#1A6E8E', secondary: '#2980B9', glow: '#AEE6FF' },
  Terra:  { primary: '#5D4037', secondary: '#8D6E63', glow: '#A5D6A7' },
  Vento:  { primary: '#80CBC4', secondary: '#B2EBF2', glow: '#B0BEC5' },
  Vazio:  { primary: '#1A1A2E', secondary: '#6A0572', glow: '#E040FB' },
  Luz:    { primary: '#FFF9C4', secondary: '#FDD835', glow: '#FFF176' },
  Sombra: { primary: '#212121', secondary: '#4A148C', glow: '#9C27B0' },
  Éter:   { primary: '#E8EAF6', secondary: '#5C6BC0', glow: '#82B1FF' },
}

// Paletas híbridas — doc 02 (Afinidades Híbridas)
const HYBRID_PALETTES: Record<string, AffinityColors> = {
  'Cinza Ardente': { primary: '#1C1C1C', secondary: '#3E2723', glow: '#FF6D00' },
  'Tempestade':    { primary: '#01579B', secondary: '#B3E5FC', glow: '#E8E0D0' },
  'Eclipse':       { primary: '#212121', secondary: '#F9A825', glow: '#FFF176' },
  'Fóssil Astral': { primary: '#4E342E', secondary: '#8D6E63', glow: '#82B1FF' },
}

function toResonanceLevel(ressonancia: number): ResonanceLevel {
  if (ressonancia <= 30) return 'desaturated'
  if (ressonancia <= 60) return 'standard'
  return 'vibrant'
}

function toSilhouetteWeight(resistencia: number): SilhouetteWeight {
  if (resistencia <= 30) return 'light'
  if (resistencia <= 60) return 'standard'
  return 'dense'
}

function toPatternDensity(vontade: number): PatternDensity {
  if (vontade <= 30) return 'sparse'
  if (vontade <= 60) return 'medium'
  return 'dense'
}

function toAuraLevel(aura: number): AuraLevel {
  if (aura <= 20) return 'none'
  if (aura <= 40) return 'halo'
  if (aura <= 60) return 'particles'
  if (aura <= 80) return 'distortion'
  return 'field'
}

export function generateVisualParams(genome: Genome, seed: string): VisualParams {
  const { essence, attributes, mutations } = genome
  const rng = makeSeededRng(seed)

  // Paleta híbrida tem prioridade quando reconhecida — doc 02
  const hybridName = essence.hybridAffinity
  const baseColors: AffinityColors =
    (hybridName ? HYBRID_PALETTES[hybridName] : undefined) ?? AFFINITY_COLORS[essence.affinity]

  // Micro-variações únicas por fusão — doc 02 (Protocolo de Unicidade)
  const colorHueShifts = Array.from({ length: 6 }, () => (rng() * 2 - 1) * 0.03)
  const ornamentOffsets = Array.from({ length: 8 }, () => rng())
  const animationSpeed = 0.8 + rng() * 0.4

  return {
    background: { origin: essence.origin },
    silhouette: {
      coreShape: essence.core,
      weight: toSilhouetteWeight(attributes.resistencia),
    },
    palette: {
      primary: baseColors.primary,
      secondary: baseColors.secondary,
      glow: baseColors.glow,
      resonanceLevel: toResonanceLevel(attributes.ressonancia),
      ...(hybridName !== undefined && { hybridName }),
    },
    pattern: {
      origin: essence.origin,
      density: toPatternDensity(attributes.vontade),
    },
    ornament: {
      coreBase: essence.core,
      mutationOrnaments: [...mutations],
    },
    aura: {
      level: toAuraLevel(attributes.aura),
      affinity: essence.affinity,
    },
    uniqueVariations: {
      colorHueShifts,
      ornamentOffsets,
      animationSpeed,
    },
    seed,
  }
}
