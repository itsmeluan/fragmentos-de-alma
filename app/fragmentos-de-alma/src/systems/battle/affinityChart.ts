// Sistema de vantagens/fraquezas elementais — tabela confirmada em sessão 2026-06-26.
// Linha = atacante, coluna = defensor.
// Pares ↑↓ (×1.5) e ↑↑↓↓ (×2.0) são simétricos: ambos os lados recebem o mesmo multiplicador.
// Pares do ciclo clássico (↑↑/↓↓) são unidirecionais: só o atacante se beneficia.
import type { Affinity } from '../genes/types'

const AFFINITY_CHART: Record<Affinity, Record<Affinity, number>> = {
  //         Água  Éter  Fogo  Luz   Sombra Terra  Vazio  Vento
  Água:   { Água: 1.0, Éter: 1.0, Fogo: 2.0, Luz: 1.0, Sombra: 1.5, Terra: 0.5, Vazio: 1.0, Vento: 1.0 },
  Éter:   { Água: 1.0, Éter: 1.0, Fogo: 1.0, Luz: 1.0, Sombra: 1.5, Terra: 1.0, Vazio: 2.0, Vento: 1.0 },
  Fogo:   { Água: 0.5, Éter: 1.0, Fogo: 1.0, Luz: 1.0, Sombra: 1.0, Terra: 1.0, Vazio: 1.0, Vento: 2.0 },
  Luz:    { Água: 1.0, Éter: 1.0, Fogo: 1.0, Luz: 1.0, Sombra: 2.0, Terra: 1.0, Vazio: 1.5, Vento: 1.0 },
  Sombra: { Água: 1.5, Éter: 1.5, Fogo: 1.0, Luz: 2.0, Sombra: 1.0, Terra: 1.0, Vazio: 1.5, Vento: 1.0 },
  Terra:  { Água: 2.0, Éter: 1.0, Fogo: 1.0, Luz: 1.0, Sombra: 1.0, Terra: 1.0, Vazio: 1.0, Vento: 0.5 },
  Vazio:  { Água: 1.0, Éter: 2.0, Fogo: 0.5, Luz: 1.5, Sombra: 1.5, Terra: 2.0, Vazio: 1.0, Vento: 1.0 },
  Vento:  { Água: 1.0, Éter: 1.0, Fogo: 1.0, Luz: 0.5, Sombra: 1.0, Terra: 2.0, Vazio: 1.0, Vento: 1.0 },
}

export function affinityMultiplier(attacker: Affinity, defender: Affinity): number {
  return AFFINITY_CHART[attacker]?.[defender] ?? 1.0
}

export type AffinityEffectiveness = 'super_efetivo' | 'efetivo' | 'fraco' | 'muito_fraco' | 'neutro'

export function affinityEffectiveness(mult: number): AffinityEffectiveness {
  if (mult >= 2.0) return 'super_efetivo'
  if (mult >= 1.5) return 'efetivo'
  if (mult <= 0.5) return 'muito_fraco'
  if (mult < 1.0) return 'fraco'
  return 'neutro'
}
