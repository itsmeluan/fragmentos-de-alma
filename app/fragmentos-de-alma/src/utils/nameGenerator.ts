// Gerador de nomes procedurais — funções puras
// Formato: [Prefixo de ORIGEM] + [Raiz de NÚCLEO] + [Sufixo de AFINIDADE]
// Mutações acrescentam epítetos (TRANSCENDENCIA, CAOS, ANCESTRAL) — ver doc 02
import { makeSeededRng } from './random'
import type { Affinity, Core, Genome, MutationGene, Origin } from '../systems/genes/types'

// Prefixo da ORIGEM — primeira palavra do nome
const ORIGIN_PREFIXES: Record<Origin, readonly string[]> = {
  Abissal:    ['Neth', 'Vor', 'Xal', 'Myr', 'Drex', 'Keth', 'Zul', 'Umbr'],
  Celestial:  ['Lyra', 'Aer', 'Sol', 'Ael', 'Syl', 'Vel', 'Aur', 'Cael'],
  Primordial: ['Korum', 'Thar', 'Grev', 'Mund', 'Brak', 'Keld', 'Rhor', 'Gor'],
  Forjada:    ['Velk', 'Mek', 'Drav', 'Tor', 'Kor', 'Drum', 'Fer', 'Strak'],
  Errante:    ['Dal', 'Mir', 'Wyn', 'Sel', 'Fal', 'Tir', 'Ash', 'Wan'],
}

// Raiz do NÚCLEO — início da segunda palavra
const CORE_ROOTS: Record<Core, readonly string[]> = {
  Guardião:   ['dur', 'gar', 'sten', 'mur', 'dun', 'beld'],
  Destruidor: ['kara', 'zar', 'gore', 'maw', 'rak', 'vex'],
  Arauto:     ['sol', 'rael', 'lyth', 'vel', 'sael', 'aen'],
  Trickster:  ['sha', 'mir', 'xis', 'dal', 'wyl', 'ren'],
  Invocador:  ['sira', 'mael', 'ryn', 'thas', 'oir', 'vel'],
}

// Sufixo de AFINIDADE — final da segunda palavra
const AFFINITY_SUFFIXES: Record<Affinity, readonly string[]> = {
  Fogo:   ['ignar', 'brax', 'pyreth', 'kareth', 'ashvel', 'solmor'],
  Água:   ['marev', 'tidhel', 'corvel', 'aequen', 'navar', 'selmar'],
  Terra:  ['rath', 'stonem', 'gravik', 'muldar', 'theron', 'kaldir'],
  Vento:  ['ventyr', 'brehal', 'galeth', 'wyval', 'kiral', 'sylmar'],
  Vazio:  ['vex', 'nulmar', 'vacor', 'zereth', 'voidar', 'nulvel'],
  Luz:    ['aen', 'lumvar', 'auren', 'lirath', 'cael', 'soldan'],
  Sombra: ['umbra', 'shavel', 'noctis', 'darvel', 'obsir', 'kethum'],
  Éter:   ['aethun', 'ethrael', 'vyrel', 'aelvar', 'ephren', 'tymel'],
}

// Epítetos por mutação — acrescentados ao nome base — ver doc 02
// ANCESTRAL: o nome do ancestral exato pertence ao orquestrador; aqui usamos
// epítetos genéricos determinísticos (ancestorName pode ser injetado externamente).
const MUTATION_EPITHETS: Partial<Record<MutationGene, readonly string[]>> = {
  TRANSCENDENCIA: ['o Eterno', 'a Sem-Fim', 'o Além', 'a Transcendente'],
  CAOS:           ['o Partido', 'a Fraturada', 'o Caótico', 'a Fragmentada'],
  ANCESTRAL:      ['Portador do Passado', 'Guardiã da Linhagem', 'Eco das Eras', 'Herdeiro das Almas'],
}

// Prioridade de epíteto quando há múltiplas mutações elegíveis
const EPITHET_PRIORITY: MutationGene[] = ['TRANSCENDENCIA', 'CAOS', 'ANCESTRAL']

function pick(arr: readonly string[], rng: () => number): string {
  return arr[Math.floor(rng() * arr.length)]
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Gera o nome do herói a partir do genoma e da seed da fusão.
// ancestorName é opcional — se fornecido, substitui o epíteto genérico do ANCESTRAL.
export function generateName(genome: Genome, seed: string, ancestorName?: string): string {
  const rng = makeSeededRng(seed)
  const { origin, core, affinity } = genome.essence

  const prefix = pick(ORIGIN_PREFIXES[origin], rng)
  const root = pick(CORE_ROOTS[core], rng)
  const suffix = pick(AFFINITY_SUFFIXES[affinity], rng)

  const firstName = prefix
  const lastName = capitalize(root + suffix)
  let name = `${firstName} ${lastName}`

  // Epíteto — mutação de maior prioridade que tenha epíteto
  const epithetMutation = EPITHET_PRIORITY.find((m) => genome.mutations.includes(m))
  if (epithetMutation) {
    let epithet: string
    if (epithetMutation === 'ANCESTRAL' && ancestorName) {
      epithet = `Portador(a) de ${ancestorName}`
    } else {
      epithet = pick(MUTATION_EPITHETS[epithetMutation]!, rng)
    }
    name = `${name}, ${epithet}`
  }

  return name
}
