// Motor de fusão — funções puras
// ver doc 01 (Mecânica de Herança) e doc 09 (referência 1.1 → fusion.ts)
import { ORIGINS, AFFINITIES, CORES, MUTATION_GENES, FUSION_INHERITANCE } from '@/lib/constants'
import { randomFrom, randomInt } from '@/utils/random'
import type {
  Affinity,
  AttributeGenes,
  Core,
  EssenceGenes,
  Genome,
  MutationGene,
  Origin,
} from './types'

const ATTRIBUTE_KEYS = [
  'forca',
  'ressonancia',
  'resistencia',
  'agilidade',
  'vontade',
  'aura',
] as const

// Afinidades opostas — condição da mutação INVERSO (ver doc 01).
// As 8 afinidades formam 4 pares opostos (Vazio↔Éter adicionado — ver D13).
const OPPOSITE_AFFINITIES: Record<Affinity, Affinity> = {
  Fogo: 'Água',
  Água: 'Fogo',
  Luz: 'Sombra',
  Sombra: 'Luz',
  Terra: 'Vento',
  Vento: 'Terra',
  Vazio: 'Éter',
  Éter: 'Vazio',
}

export interface InjectedGene {
  type: 'essence' | 'attribute' | 'mutation'
  key: string
  value: string | number
}

export interface FusionInput {
  parentA: Genome
  parentB: Genome
  seed: string // timestamp + parentA.id + parentB.id
  injectedGene?: InjectedGene // gene injetado via Cristal de Essência (doc 05)
}

// De onde cada gene do filho veio — para mostrar ao jogador (doc 01: "legível")
export interface InheritanceLog {
  gene: string
  source: 'parentA' | 'parentB' | 'mutation' | 'injected' | 'hybrid'
  originalValue: string | number
  finalValue: string | number
  wasDrift: boolean
}

export interface FusionResult {
  genome: Genome
  inheritanceLog: InheritanceLog[]
}

export function fuseGenomes(input: FusionInput): FusionResult {
  const { parentA, parentB } = input
  const log: InheritanceLog[] = []

  const essence = inheritEssenceGenes(parentA.essence, parentB.essence, log)
  const attributes = inheritAttributeGenes(parentA.attributes, parentB.attributes, log)
  const mutations = calculateMutations(parentA, parentB, log)

  if (input.injectedGene) {
    applyInjectedGene(input.injectedGene, essence, attributes, mutations, log)
  }

  return {
    genome: { essence, attributes, mutations },
    inheritanceLog: log,
  }
}

// Genes de essência: herda do pai dominante (70%) ou recessivo (30%); afinidade
// tem 5% de chance de gerar híbrido quando os pais diferem (ver doc 01).
function inheritEssenceGenes(
  a: EssenceGenes,
  b: EssenceGenes,
  log: InheritanceLog[]
): EssenceGenes {
  const { dominanceChance } = FUSION_INHERITANCE

  const dominant = Math.random() < dominanceChance ? a : b
  const recessive = dominant === a ? b : a
  const sourceFor = (parent: EssenceGenes): 'parentA' | 'parentB' =>
    parent === a ? 'parentA' : 'parentB'

  // ORIGEM
  const originParent = Math.random() < 0.7 ? dominant : recessive
  const origin: Origin = originParent.origin
  log.push({
    gene: 'origin',
    source: sourceFor(originParent),
    originalValue: origin,
    finalValue: origin,
    wasDrift: false,
  })

  // NÚCLEO
  const coreParent = Math.random() < 0.7 ? dominant : recessive
  const core: Core = coreParent.core
  log.push({
    gene: 'core',
    source: sourceFor(coreParent),
    originalValue: core,
    finalValue: core,
    wasDrift: false,
  })

  // AFINIDADE — chance de híbrido quando os pais diferem
  if (dominant.affinity !== recessive.affinity && Math.random() < 0.05) {
    const hybridAffinity = createHybridAffinity(dominant.affinity, recessive.affinity)
    log.push({
      gene: 'affinity',
      source: 'hybrid',
      originalValue: `${dominant.affinity}+${recessive.affinity}`,
      finalValue: hybridAffinity,
      wasDrift: false,
    })
    // A afinidade base permanece a do dominante; o híbrido é um rótulo extra.
    return { origin, core, affinity: dominant.affinity, hybridAffinity }
  }

  const affinityParent = Math.random() < 0.7 ? dominant : recessive
  const affinity: Affinity = affinityParent.affinity
  log.push({
    gene: 'affinity',
    source: sourceFor(affinityParent),
    originalValue: affinity,
    finalValue: affinity,
    wasDrift: false,
  })
  return { origin, core, affinity }
}

// Genes de atributo: blend ponderado (dominante × 0.7 + recessivo × 0.3),
// drift de ±15% e chance de mutação numérica (ver doc 01 e FUSION_INHERITANCE).
function inheritAttributeGenes(
  a: AttributeGenes,
  b: AttributeGenes,
  log: InheritanceLog[]
): AttributeGenes {
  const {
    dominantWeight,
    recessiveWeight,
    driftMax,
    mutationPositiveChance,
    mutationNegativeChance,
  } = FUSION_INHERITANCE

  const inheritOne = (gene: keyof AttributeGenes): number => {
    const valA = a[gene]
    const valB = b[gene]
    const dominant = Math.max(valA, valB)
    const recessive = Math.min(valA, valB)

    let value = dominant * dominantWeight + recessive * recessiveWeight

    const drift = (Math.random() * 2 - 1) * driftMax
    const wasDrift = Math.abs(drift) > 0.05
    value = clamp(Math.round(value * (1 + drift)), 1, 100)

    const rand = Math.random()
    if (rand < mutationPositiveChance) {
      value = Math.min(100, value + randomInt(10, 25))
    } else if (rand < mutationPositiveChance + mutationNegativeChance) {
      value = Math.max(1, value - randomInt(10, 20))
    }

    log.push({
      gene,
      source: valA >= valB ? 'parentA' : 'parentB',
      originalValue: dominant,
      finalValue: value,
      wasDrift,
    })
    return value
  }

  return {
    forca: inheritOne('forca'),
    ressonancia: inheritOne('ressonancia'),
    resistencia: inheritOne('resistencia'),
    agilidade: inheritOne('agilidade'),
    vontade: inheritOne('vontade'),
    aura: inheritOne('aura'),
  }
}

// Mutações: herda as existentes dos pais (50% cada) e tem chance rara de uma
// mutação nova. Ver doc 01 (Camada 3) e FUSION_INHERITANCE.mutationRareChance.
function calculateMutations(
  parentA: Genome,
  parentB: Genome,
  log: InheritanceLog[]
): MutationGene[] {
  const { mutationRareChance, mutationInversoChance, mutationEspelhoChance } = FUSION_INHERITANCE
  const mutations: MutationGene[] = []

  const add = (m: MutationGene, source: InheritanceLog['source']) => {
    if (!mutations.includes(m)) {
      mutations.push(m)
      log.push({ gene: 'mutation', source, originalValue: 'none', finalValue: m, wasDrift: false })
    }
  }

  // Herda mutações existentes dos pais (50% de chance cada, sem duplicar)
  const inherited = new Set<MutationGene>([...parentA.mutations, ...parentB.mutations])
  for (const m of inherited) {
    if (Math.random() < 0.5) mutations.push(m)
  }

  // Mutações condicionais — gatilhadas por escolha do jogador (ver doc 01, D11/D13).
  // INVERSO: pais com afinidades opostas.
  if (OPPOSITE_AFFINITIES[parentA.essence.affinity] === parentB.essence.affinity) {
    if (Math.random() < mutationInversoChance) add('INVERSO', 'mutation')
  }
  // ESPELHO: pais de mesma origem ("gêmeos").
  if (parentA.essence.origin === parentB.essence.origin) {
    if (Math.random() < mutationEspelhoChance) add('ESPELHO', 'mutation')
  }
  // ANCESTRAL, CAOS e TRANSCENDÊNCIA dependem de contexto fora do genoma
  // (gerações, evento de eclipse, raridade dos pais) e pertencem ao orquestrador
  // de fusão de nível superior, não a este motor (ver D12).

  // Mutação rara completamente nova (ver doc 01)
  if (Math.random() < mutationRareChance) {
    const available = MUTATION_GENES.filter((m) => !mutations.includes(m))
    if (available.length > 0) add(randomFrom(available), 'mutation')
  }

  return mutations
}

// Aplica um gene injetado via Cristal de Essência (doc 05). Apenas a aplicação
// mecânica do gene — custo e regras de quando é permitido são da economia.
function applyInjectedGene(
  injected: InjectedGene,
  essence: EssenceGenes,
  attributes: AttributeGenes,
  mutations: MutationGene[],
  log: InheritanceLog[]
): void {
  const { type, key, value } = injected

  if (type === 'attribute' && isAttributeKey(key) && typeof value === 'number') {
    const original = attributes[key]
    const finalValue = clamp(Math.round(value), 1, 100)
    attributes[key] = finalValue
    log.push({ gene: key, source: 'injected', originalValue: original, finalValue, wasDrift: false })
    return
  }

  if (type === 'essence' && typeof value === 'string') {
    if (key === 'origin' && (ORIGINS as readonly string[]).includes(value)) {
      const original = essence.origin
      essence.origin = value as Origin // validado contra ORIGINS acima
      log.push({ gene: 'origin', source: 'injected', originalValue: original, finalValue: value, wasDrift: false })
    } else if (key === 'affinity' && (AFFINITIES as readonly string[]).includes(value)) {
      const original = essence.affinity
      essence.affinity = value as Affinity // validado contra AFFINITIES acima
      log.push({ gene: 'affinity', source: 'injected', originalValue: original, finalValue: value, wasDrift: false })
    } else if (key === 'core' && (CORES as readonly string[]).includes(value)) {
      const original = essence.core
      essence.core = value as Core // validado contra CORES acima
      log.push({ gene: 'core', source: 'injected', originalValue: original, finalValue: value, wasDrift: false })
    }
    return
  }

  if (type === 'mutation' && typeof value === 'string') {
    if ((MUTATION_GENES as readonly string[]).includes(value) && !mutations.includes(value as MutationGene)) {
      const m = value as MutationGene // validado contra MUTATION_GENES acima
      mutations.push(m)
      log.push({ gene: 'mutation', source: 'injected', originalValue: 'none', finalValue: m, wasDrift: false })
    }
  }
}

// Cria afinidade híbrida a partir de duas afinidades (ver doc 09 — referência).
// Exportada para teste unitário.
export function createHybridAffinity(a: Affinity, b: Affinity): string {
  const hybrids: Record<string, string> = {
    Fogo_Sombra: 'Cinza Ardente',
    Sombra_Fogo: 'Cinza Ardente',
    Água_Vento: 'Tempestade',
    Vento_Água: 'Tempestade',
    Luz_Vazio: 'Eclipse',
    Vazio_Luz: 'Eclipse',
    Terra_Éter: 'Fóssil Astral',
    Éter_Terra: 'Fóssil Astral',
  }
  return hybrids[`${a}_${b}`] ?? `${a}/${b}`
}

function isAttributeKey(key: string): key is keyof AttributeGenes {
  return (ATTRIBUTE_KEYS as readonly string[]).includes(key)
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
