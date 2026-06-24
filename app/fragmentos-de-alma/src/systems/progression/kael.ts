// Sistema de progressão de Kael — ver doc 08 (narrativa e lore)
// Kael é o jogador: Fragmentador nível 1-100, Memórias Ressurgentes e reputação de facções.
// Lógica pura: sem estado interno, sem efeitos colaterais.

// ─── Facções (doc 08, Parte 3) ───────────────────────────────────────────────

export type FactionId =
  | 'pedra_viva'      // Matéria — Kethara
  | 'veu_dos_ecos'    // Mente — Mnemos
  | 'chama_negra'     // Alma — Cinderfall
  | 'jardim_perpetuo' // Vida — Verdania
  | 'confraria_limiar'// Morte — Limiar
  | 'arquitetos_veu'  // Realidade — Axis
  | 'ordem_carmesim'  // Sangue — Vênula

export const FACTIONS: FactionId[] = [
  'pedra_viva', 'veu_dos_ecos', 'chama_negra', 'jardim_perpetuo',
  'confraria_limiar', 'arquitetos_veu', 'ordem_carmesim',
]

export const FACTION_LABELS: Record<FactionId, string> = {
  pedra_viva:        'Ordem da Pedra Viva',
  veu_dos_ecos:      'Véu dos Ecos',
  chama_negra:       'Chama Negra',
  jardim_perpetuo:   'Jardim Perpétuo',
  confraria_limiar:  'Confraria do Limiar',
  arquitetos_veu:    'Arquitetos do Véu',
  ordem_carmesim:    'Ordem Carmesim',
}

// ─── Memórias Ressurgentes (doc 08 — tabela de passivas de Kael) ─────────────

export interface RisingMemory {
  level: number        // desbloqueio (10, 20, ..., 100)
  id: string
  name: string
  description: string  // efeito de gameplay
  lore: string         // fragmento de lore revelado
}

export const RISING_MEMORIES: RisingMemory[] = [
  {
    level: 10,
    id: 'mem_10',
    name: 'Aceitação da Imperfeição',
    description: '+5% de chance de mutação positiva em fusões.',
    lore: '"Aprendi que a imperfeição é o único caminho para algo novo."',
  },
  {
    level: 20,
    id: 'mem_20',
    name: 'Tensão dos Opostos',
    description: 'Heróis com afinidades opostas no time ganham +10% de dano.',
    lore: '"Os opostos não se anulam. Eles se definem."',
  },
  {
    level: 30,
    id: 'mem_30',
    name: 'Escudo de Fragmento',
    description: 'Uma vez por batalha, pode absorver 50% do dano de um aliado.',
    lore: '"Fragmentar-me foi o único ato que fez sentido quando não havia mais nada a perder."',
  },
  {
    level: 40,
    id: 'mem_40',
    name: 'Eco Ancestral',
    description: 'Fusões têm chance de revelar gene ancestral perdido.',
    lore: '"Cada alma carrega memórias de todas as almas que a precederam. Ninguém começa do zero."',
  },
  {
    level: 50,
    id: 'mem_50',
    name: 'Vontade Primordial',
    description: 'Ultimate de todos os heróis carrega 20% mais rápido.',
    lore: '"A vontade é a frequência mais poderosa. Ela precede todas as outras."',
  },
  {
    level: 60,
    id: 'mem_60',
    name: 'Perspectiva da Derrota',
    description: 'Inimigos derrotados têm 15% de chance de deixar fragmento de gene.',
    lore: '"Derrota e vitória compartilham a mesma substância. Apenas a perspectiva muda."',
  },
  {
    level: 70,
    id: 'mem_70',
    name: 'Força da Diferença',
    description: 'Time com heróis de 4+ facções diferentes ganha +15% em todos os atributos.',
    lore: '"A Prima não era poderosa por ser una. Era poderosa por conter tudo. A diferença importa."',
  },
  {
    level: 80,
    id: 'mem_80',
    name: 'Morte Escolhida',
    description: 'Uma vez por dungeon, pode reviver um herói com 30% HP.',
    lore: '"A morte que escolhi foi diferente de todas as outras. Escolhi o que nasceria dela."',
  },
  {
    level: 90,
    id: 'mem_90',
    name: 'A Equação Pediu',
    description: 'Habilidades emergentes têm efeito 25% mais potente.',
    lore: '"O acidente nunca foi acidente. Era a equação pedindo para ser reescrita."',
  },
  {
    level: 100,
    id: 'mem_100',
    name: 'Memória Final',
    description: 'Revela a identidade do primeiro Fragmentador. Desbloqueia a Alquimia do Eu.',
    lore: '"Eu era você. Você sempre foi eu. A diferença é que agora você tem escolha."',
  },
]

// ─── Estado de Kael ───────────────────────────────────────────────────────────

export interface KaelState {
  level: number                                 // 1–100
  xp: number                                    // XP acumulado no nível atual
  xpToNextLevel: number
  unlockedMemories: string[]                    // ids de RisingMemory desbloqueadas
  factionReputation: Record<FactionId, number>  // -100 a +100
  totalFusions: number
  totalBattlesWon: number
  totalEmergentDiscoveries: number
  displayName: string
}

// ─── Curva de XP ─────────────────────────────────────────────────────────────

// XP necessário para avançar do nível N para N+1
export function xpRequiredForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.5))
}

export function createKaelState(displayName: string): KaelState {
  const reputation = Object.fromEntries(FACTIONS.map(f => [f, 0])) as Record<FactionId, number>
  return {
    level: 1,
    xp: 0,
    xpToNextLevel: xpRequiredForLevel(1),
    unlockedMemories: [],
    factionReputation: reputation,
    totalFusions: 0,
    totalBattlesWon: 0,
    totalEmergentDiscoveries: 0,
    displayName,
  }
}

// ─── Fontes de XP ────────────────────────────────────────────────────────────

export type XpSource =
  | 'battle_won'
  | 'fusion'
  | 'lore_discovery'
  | 'emergent_skill_found'
  | 'faction_decision'

export const XP_PER_SOURCE: Record<XpSource, number> = {
  battle_won:           15,
  fusion:               25,
  lore_discovery:       10,
  emergent_skill_found: 40,
  faction_decision:     20,
}

// ─── Funções puras ────────────────────────────────────────────────────────────

export function memoriesForLevel(level: number): RisingMemory[] {
  return RISING_MEMORIES.filter(m => m.level <= level)
}

export function isMemoryActive(kael: KaelState, memoryId: string): boolean {
  return kael.unlockedMemories.includes(memoryId)
}

export interface LevelUpResult {
  state: KaelState
  leveled: boolean
  newMemory: RisingMemory | null
}

// Aplica XP e processa level-up(s) em cascata
export function addXp(kael: KaelState, source: XpSource, multiplier = 1): LevelUpResult {
  const amount = Math.round(XP_PER_SOURCE[source] * multiplier)
  let state: KaelState = { ...kael, xp: kael.xp + amount }
  let leveled = false
  let newMemory: RisingMemory | null = null

  while (state.level < 100 && state.xp >= state.xpToNextLevel) {
    state = {
      ...state,
      xp: state.xp - state.xpToNextLevel,
      level: state.level + 1,
      xpToNextLevel: xpRequiredForLevel(state.level + 1),
    }
    leveled = true

    const memory = RISING_MEMORIES.find(m => m.level === state.level)
    if (memory && !state.unlockedMemories.includes(memory.id)) {
      state = { ...state, unlockedMemories: [...state.unlockedMemories, memory.id] }
      newMemory = memory
    }
  }

  return { state, leveled, newMemory }
}

export function recordFusion(kael: KaelState): LevelUpResult {
  return addXp({ ...kael, totalFusions: kael.totalFusions + 1 }, 'fusion')
}

export function recordBattleWon(kael: KaelState): LevelUpResult {
  return addXp({ ...kael, totalBattlesWon: kael.totalBattlesWon + 1 }, 'battle_won')
}

export function recordEmergentDiscovery(kael: KaelState): LevelUpResult {
  return addXp(
    { ...kael, totalEmergentDiscoveries: kael.totalEmergentDiscoveries + 1 },
    'emergent_skill_found',
  )
}

// ─── Reputação de facções ─────────────────────────────────────────────────────

export type ReputationTier = 'ally' | 'friendly' | 'neutral' | 'hostile' | 'enemy'

export function reputationTier(value: number): ReputationTier {
  if (value >= 80) return 'ally'
  if (value >= 40) return 'friendly'
  if (value <= -80) return 'enemy'
  if (value <= -40) return 'hostile'
  return 'neutral'
}

export function reputationTierLabel(tier: ReputationTier): string {
  const labels: Record<ReputationTier, string> = {
    ally:     'Aliado',
    friendly: 'Amigável',
    neutral:  'Neutro',
    hostile:  'Hostil',
    enemy:    'Inimigo',
  }
  return labels[tier]
}

export function applyFactionDecision(
  kael: KaelState,
  changes: Partial<Record<FactionId, number>>,
): KaelState {
  const rep = { ...kael.factionReputation }
  for (const [faction, delta] of Object.entries(changes) as [FactionId, number][]) {
    if (delta === undefined) continue
    rep[faction] = Math.max(-100, Math.min(100, (rep[faction] ?? 0) + delta))
  }
  const { state } = addXp({ ...kael, factionReputation: rep }, 'faction_decision')
  return state
}

// ─── Bônus passivos (consultados pelo engine de batalha) ─────────────────────

export interface KaelBattlePassives {
  fusionMutationBonus: number      // mem_10: +5% mutação positiva em fusões
  oppositeSynergyBonus: number     // mem_20: +10% dano afinidades opostas
  damageAbsorptionActive: boolean  // mem_30: absorve 50% dano de aliado 1x/batalha
  ultChargeBonus: number           // mem_50: +20% carga de Ultimate
  enemyDropBonus: number           // mem_60: +15% chance drop de gene
  diversityBonusActive: boolean    // mem_70: +15% atributos com 4+ facções no time
  reviveAvailable: boolean         // mem_80: revive 1 herói com 30% HP por dungeon
  emergentPowerBonus: number       // mem_90: +25% poder de habilidades emergentes
  finalMemoryUnlocked: boolean     // mem_100: Alquimia do Eu desbloqueada
}

export function getBattlePassives(kael: KaelState): KaelBattlePassives {
  const has = (id: string) => kael.unlockedMemories.includes(id)
  return {
    fusionMutationBonus:     has('mem_10') ? 0.05 : 0,
    oppositeSynergyBonus:    has('mem_20') ? 0.10 : 0,
    damageAbsorptionActive:  has('mem_30'),
    ultChargeBonus:          has('mem_50') ? 0.20 : 0,
    enemyDropBonus:          has('mem_60') ? 0.15 : 0,
    diversityBonusActive:    has('mem_70'),
    reviveAvailable:         has('mem_80'),
    emergentPowerBonus:      has('mem_90') ? 0.25 : 0,
    finalMemoryUnlocked:     has('mem_100'),
  }
}
