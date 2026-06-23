// GENES — ver doc 01_sistema_de_genes.md
export const ORIGINS = ['Abissal', 'Celestial', 'Primordial', 'Forjada', 'Errante'] as const
export const AFFINITIES = ['Fogo', 'Água', 'Terra', 'Vento', 'Vazio', 'Luz', 'Sombra', 'Éter'] as const
export const CORES = ['Guardião', 'Destruidor', 'Arauto', 'Trickster', 'Invocador'] as const
export const ATTRIBUTE_GENES = ['forca', 'ressonancia', 'resistencia', 'agilidade', 'vontade', 'aura'] as const
export const MUTATION_GENES = ['INVERSO', 'ESPELHO', 'ANCESTRAL', 'CAOS', 'TRANSCENDENCIA'] as const

// RARIDADE — ver doc 01, seção Raridade Dinâmica
export const RARITY_THRESHOLDS = {
  comum: { maxSum: 300, maxMutations: 0 },
  incomum: { maxSum: 450, maxMutations: 1 },
  raro: { maxSum: 600 },
  epico: { maxSum: 750, minMutations: 2 },
  lendario: { minSum: 750 },
  unico: { special: true },
} as const

// FUSÃO — ver doc 01, seção Mecânica de Herança
export const FUSION_COSTS = {
  comum: 100,
  incomum: 300,
  raro: 800,
  epico: 2000,
  lendario: 5000,
} as const

export const FUSION_INHERITANCE = {
  dominanceChance: 0.6,
  dominantWeight: 0.7,
  recessiveWeight: 0.3,
  driftMax: 0.15,
  mutationPositiveChance: 0.05,
  mutationNegativeChance: 0.02,
  mutationRareChance: 0.005,
} as const

// BATALHA — ver doc 06_sistema_de_batalha.md
export const BATTLE = {
  activeSlots: 3,
  benchSlots: 3,
  positions: ['frente', 'centro', 'fundo'] as const,
  maxSkillAnimationMs: 1500,
  hpRecoveryBetweenBattles: 0.3,
  ultimateChargeOnBench: 0.5,
} as const

// PROGRESSÃO — ver doc 04_loop_de_progressao.md
export const PROGRESSION = {
  heroMaxLevel: 50,
  kaelMaxLevel: 100,
  dailyDungeonAttempts: 3,
  badLuckPityThreshold: 10,
  streakMultiplierMax: 2.0,
} as const

// BIOMAS — ver doc 04, seção Médio Prazo
export const BIOMES = {
  cavernas_abismo: {
    id: 'cavernas_abismo',
    name: 'Cavernas do Abismo',
    faction: 'chama_negra',
    dominantOrigin: 'Abissal',
    unlockCondition: 'initial',
    floors: 10,
    corruption: { resistencia: 1.3, agilidade: 0.7 },
  },
  pináculo_celestial: {
    id: 'pináculo_celestial',
    name: 'Pináculo Celestial',
    faction: 'arquitetos_veu',
    dominantOrigin: 'Celestial',
    unlockCondition: '10_fusions',
    floors: 12,
    corruption: { ressonancia: 1.4, resistencia: 0.6 },
  },
  // ... demais biomas
} as const

// RECURSOS DE JOGADOR — ver doc 05_economia.md
export const STARTING_RESOURCES = {
  soul_fragments: 500,
  essence_crystals: 5,
  echoes: 0,
} as const

export const ECHO_REWARDS = {
  comum: { min: 1, max: 2 },
  incomum: { min: 3, max: 5 },
  raro: { min: 8, max: 12 },
  epico: { min: 20, max: 30 },
  lendario: { min: 60, max: 80 },
  unico: { min: 150, max: 200 },
} as const
