// Gerador de genoma — funções puras
// ver doc 01_sistema_de_genes.md (estrutura do genoma) e doc 04 (biomas)
import { ORIGINS, AFFINITIES, CORES } from '@/lib/constants'
import { randomFrom, randomInt } from '@/utils/random'
import type { Genome, Origin } from './types'

// Gera um genoma inicial para um fragmento (pré-fusão).
// Usado quando fragmentos são dropados em dungeons.
// Se `biomeOrigin` for informado, a Origem tende para a dominante do bioma.
export function generateFragmentGenome(biomeOrigin?: string): Genome {
  const origin: Origin = biomeOrigin
    ? weightedOriginForBiome(biomeOrigin)
    : randomFrom(ORIGINS)

  return {
    essence: {
      origin,
      affinity: randomFrom(AFFINITIES),
      core: randomFrom(CORES),
    },
    attributes: {
      forca: randomInt(10, 60),
      ressonancia: randomInt(10, 60),
      resistencia: randomInt(10, 60),
      agilidade: randomInt(10, 60),
      vontade: randomInt(10, 60),
      aura: randomInt(10, 60),
    },
    mutations: [],
  }
}

// Biomas têm 60% de chance de dropar a Origem dominante; 40% aleatória.
// ver doc 04 (tabela de biomas). Bioma desconhecido cai em Origem aleatória.
function weightedOriginForBiome(biomeId: string): Origin {
  const biomeOriginMap: Record<string, Origin> = {
    cavernas_abismo: 'Abissal',
    pináculo_celestial: 'Celestial',
    floresta_primordial: 'Primordial',
    forja_eterna: 'Forjada',
  }
  const dominant = biomeOriginMap[biomeId]
  if (!dominant) return randomFrom(ORIGINS)
  return Math.random() < 0.6 ? dominant : randomFrom(ORIGINS)
}
