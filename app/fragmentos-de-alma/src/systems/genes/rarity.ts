import { theme } from '@/lib/theme'
import type { Genome, Rarity } from './types'

function attributeSum(genome: Genome): number {
  const { forca, ressonancia, resistencia, agilidade, vontade, aura } = genome.attributes
  return forca + ressonancia + resistencia + agilidade + vontade + aura
}

// Raridade calculada a partir do genoma — nunca atribuída no drop (ver doc 01).
// isUnique sinaliza condições externas de evento; sem ele, 'unico' nunca é retornado.
// Nota D14: soma máxima com atributos base é 600 (6 × 100). A faixa lendário >750
// só é atingível com bônus futuros; TRANSCENDENCIA é o caminho primário agora.
export function calculateRarity(genome: Genome, isUnique = false): Rarity {
  if (isUnique) return 'unico'

  const sum = attributeSum(genome)
  const mutationCount = genome.mutations.length
  const hasHybrid = Boolean(genome.essence.hybridAffinity)
  const hasTranscendencia = genome.mutations.includes('TRANSCENDENCIA')

  if (sum > 750 || hasTranscendencia) return 'lendario'
  if (sum >= 600 || mutationCount >= 2) return 'epico'
  if (sum >= 450 || hasHybrid) return 'raro'
  if (sum >= 300 || mutationCount >= 1) return 'incomum'
  return 'comum'
}

export function getRarityColor(rarity: Rarity): string {
  return theme.colors.rarity[rarity]
}
