// Parâmetros visuais gerados proceduralmente a partir do genoma
// ver doc 02_sistema_visual.md — 6 camadas independentes
import type { Affinity, Core, MutationGene, Origin } from '../genes/types'

// Camada 2 — Silhueta
export type SilhouetteWeight = 'light' | 'standard' | 'dense'

// Camada 3 — Paleta
export type ResonanceLevel = 'desaturated' | 'standard' | 'vibrant'

// Camada 4 — Padrões
export type PatternDensity = 'sparse' | 'medium' | 'dense'

// Camada 6 — Aura
export type AuraLevel = 'none' | 'halo' | 'particles' | 'distortion' | 'field'

export interface BackgroundParams {
  origin: Origin
}

export interface SilhouetteParams {
  coreShape: Core
  weight: SilhouetteWeight
}

export interface PaletteParams {
  primary: string
  secondary: string
  glow: string
  resonanceLevel: ResonanceLevel
  hybridName?: string
}

export interface PatternParams {
  origin: Origin
  density: PatternDensity
}

export interface OrnamentParams {
  coreBase: Core
  mutationOrnaments: MutationGene[]
}

export interface AuraParams {
  level: AuraLevel
  affinity: Affinity
}

export interface UniqueVariations {
  colorHueShifts: readonly number[]  // 6 valores, ±3% por gene de atributo
  ornamentOffsets: readonly number[] // 8 valores de posicionamento em [0, 1]
  animationSpeed: number             // 0.8–1.2
}

export interface VisualParams {
  background: BackgroundParams
  silhouette: SilhouetteParams
  palette: PaletteParams
  pattern: PatternParams
  ornament: OrnamentParams
  aura: AuraParams
  uniqueVariations: UniqueVariations
  seed: string
}
