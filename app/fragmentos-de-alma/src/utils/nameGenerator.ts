// Gerador de nomes procedurais — funções puras
// Formato: [Prefixo de ORIGEM][raiz de NÚCLEO][sufixo de AFINIDADE] — uma única palavra
// ver doc 01_sistema_de_genes.md e doc 02_sistema_visual.md
import { makeSeededRng } from './random'
import type { Affinity, Core, Genome, Origin } from '../systems/genes/types'

// Prefixo da ORIGEM — início do nome
const ORIGIN_PREFIXES: Record<Origin, readonly string[]> = {
  Abissal:    ['Neth', 'Vor', 'Xal', 'Myr', 'Drex', 'Keth', 'Zul', 'Umbr'],
  Celestial:  ['Lyra', 'Aer', 'Sol', 'Ael', 'Syl', 'Vel', 'Aur', 'Cael'],
  Primordial: ['Korum', 'Thar', 'Grev', 'Mund', 'Brak', 'Keld', 'Rhor', 'Gor'],
  Forjada:    ['Velk', 'Mek', 'Drav', 'Tor', 'Kor', 'Drum', 'Fer', 'Strak'],
  Errante:    ['Dal', 'Mir', 'Wyn', 'Sel', 'Fal', 'Tir', 'Ash', 'Wan'],
}

// Raiz do NÚCLEO — meio do nome
const CORE_ROOTS: Record<Core, readonly string[]> = {
  Guardião:   ['dur', 'gar', 'sten', 'mur', 'dun', 'beld'],
  Destruidor: ['kara', 'zar', 'gore', 'maw', 'rak', 'vex'],
  Arauto:     ['sol', 'rael', 'lyth', 'vel', 'sael', 'aen'],
  Trickster:  ['sha', 'mir', 'xis', 'dal', 'wyl', 'ren'],
  Invocador:  ['sira', 'mael', 'ryn', 'thas', 'oir', 'vel'],
}

// Sufixo de AFINIDADE — final do nome
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

function pick(arr: readonly string[], rng: () => number): string {
  return arr[Math.floor(rng() * arr.length)]
}

// Gera o nome do herói a partir do genoma e da seed da fusão.
// Formato: PrefixoOrigem + raizNúcleo + sufixoAfinidade → palavra única (ex: "Nethdurignar")
export function generateName(genome: Genome, seed: string): string {
  const rng = makeSeededRng(seed)
  const { origin, core, affinity } = genome.essence

  const prefix = pick(ORIGIN_PREFIXES[origin], rng)
  const root = pick(CORE_ROOTS[core], rng)
  const suffix = pick(AFFINITY_SUFFIXES[affinity], rng)

  return prefix + root + suffix
}
