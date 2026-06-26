// Backgrounds de origem para tela de detalhe/card do herói.
// Cada slot tem múltiplas variações — selecionadas deterministicamente pelo seed do herói.
import type { Origin } from '@/systems/genes/types'
import type { BackgroundRarity } from './backgroundRegistry'

type OriginKey = Lowercase<Origin>

// [raridade][origem] = array de assets (múltiplas variações por slot)
const ORIGIN_BG: Record<BackgroundRarity, Record<OriginKey, number[]>> = {
  comum: {
    abissal: [
      require('../../../assets/sprites/backgrounds/origens/comum/abissal/1.png'),
      require('../../../assets/sprites/backgrounds/origens/comum/abissal/2.png'),
      require('../../../assets/sprites/backgrounds/origens/comum/abissal/3.png'),
      require('../../../assets/sprites/backgrounds/origens/comum/abissal/4.png'),
    ],
    celestial: [
      require('../../../assets/sprites/backgrounds/origens/comum/celestial/1.png'),
    ],
    errante: [
      require('../../../assets/sprites/backgrounds/origens/comum/errante/1.png'),
      require('../../../assets/sprites/backgrounds/origens/comum/errante/2.png'),
    ],
    forjada: [
      require('../../../assets/sprites/backgrounds/origens/comum/forjada/1.png'),
      require('../../../assets/sprites/backgrounds/origens/comum/forjada/2.png'),
      require('../../../assets/sprites/backgrounds/origens/comum/forjada/3.png'),
    ],
    primordial: [
      require('../../../assets/sprites/backgrounds/origens/comum/primordial/1.png'),
      require('../../../assets/sprites/backgrounds/origens/comum/primordial/2.png'),
    ],
  },
  incomum: {
    abissal: [
      require('../../../assets/sprites/backgrounds/origens/incomum/abissal/1.png'),
      require('../../../assets/sprites/backgrounds/origens/incomum/abissal/2.png'),
    ],
    celestial: [
      require('../../../assets/sprites/backgrounds/origens/incomum/celestial/1.png'),
      require('../../../assets/sprites/backgrounds/origens/incomum/celestial/2.png'),
      require('../../../assets/sprites/backgrounds/origens/incomum/celestial/3.png'),
    ],
    errante: [
      require('../../../assets/sprites/backgrounds/origens/incomum/errante/1.png'),
    ],
    forjada: [
      require('../../../assets/sprites/backgrounds/origens/incomum/forjada/1.png'),
      require('../../../assets/sprites/backgrounds/origens/incomum/forjada/2.png'),
      require('../../../assets/sprites/backgrounds/origens/incomum/forjada/3.png'),
    ],
    primordial: [
      require('../../../assets/sprites/backgrounds/origens/incomum/primordial/1.png'),
    ],
  },
  raro: {
    abissal: [
      require('../../../assets/sprites/backgrounds/origens/raro/abissal/1.png'),
      require('../../../assets/sprites/backgrounds/origens/raro/abissal/2.png'),
      require('../../../assets/sprites/backgrounds/origens/raro/abissal/3.png'),
      require('../../../assets/sprites/backgrounds/origens/raro/abissal/4.png'),
    ],
    celestial: [
      require('../../../assets/sprites/backgrounds/origens/raro/celestial/1.png'),
      require('../../../assets/sprites/backgrounds/origens/raro/celestial/2.png'),
    ],
    errante: [
      require('../../../assets/sprites/backgrounds/origens/raro/errante/1.png'),
    ],
    forjada: [
      require('../../../assets/sprites/backgrounds/origens/raro/forjada/1.png'),
      require('../../../assets/sprites/backgrounds/origens/raro/forjada/2.png'),
      require('../../../assets/sprites/backgrounds/origens/raro/forjada/3.png'),
    ],
    primordial: [
      require('../../../assets/sprites/backgrounds/origens/raro/primordial/1.png'),
    ],
  },
  epico: {
    abissal: [
      require('../../../assets/sprites/backgrounds/origens/epico/abissal/1.png'),
      require('../../../assets/sprites/backgrounds/origens/epico/abissal/2.png'),
      require('../../../assets/sprites/backgrounds/origens/epico/abissal/3.png'),
      require('../../../assets/sprites/backgrounds/origens/epico/abissal/4.png'),
    ],
    celestial: [
      require('../../../assets/sprites/backgrounds/origens/epico/celestial/1.png'),
      require('../../../assets/sprites/backgrounds/origens/epico/celestial/2.png'),
    ],
    errante: [
      require('../../../assets/sprites/backgrounds/origens/epico/errante/1.png'),
      require('../../../assets/sprites/backgrounds/origens/epico/errante/2.png'),
    ],
    forjada: [
      require('../../../assets/sprites/backgrounds/origens/epico/forjada/1.png'),
      require('../../../assets/sprites/backgrounds/origens/epico/forjada/2.png'),
    ],
    primordial: [
      require('../../../assets/sprites/backgrounds/origens/epico/primordial/1.png'),
      require('../../../assets/sprites/backgrounds/origens/epico/primordial/2.png'),
    ],
  },
  lendario: {
    abissal: [
      require('../../../assets/sprites/backgrounds/origens/lendario/abissal/1.png'),
      require('../../../assets/sprites/backgrounds/origens/lendario/abissal/2.png'),
      require('../../../assets/sprites/backgrounds/origens/lendario/abissal/3.png'),
    ],
    celestial: [
      require('../../../assets/sprites/backgrounds/origens/lendario/celestial/1.png'),
      require('../../../assets/sprites/backgrounds/origens/lendario/celestial/2.png'),
    ],
    errante: [
      require('../../../assets/sprites/backgrounds/origens/lendario/errante/1.png'),
    ],
    forjada: [
      require('../../../assets/sprites/backgrounds/origens/lendario/forjada/1.png'),
      require('../../../assets/sprites/backgrounds/origens/lendario/forjada/2.png'),
      require('../../../assets/sprites/backgrounds/origens/lendario/forjada/3.png'),
    ],
    primordial: [
      require('../../../assets/sprites/backgrounds/origens/lendario/primordial/1.png'),
      require('../../../assets/sprites/backgrounds/origens/lendario/primordial/2.png'),
    ],
  },
  unico: {
    abissal: [
      require('../../../assets/sprites/backgrounds/origens/unico/abissal/1.png'),
      require('../../../assets/sprites/backgrounds/origens/unico/abissal/2.png'),
      require('../../../assets/sprites/backgrounds/origens/unico/abissal/3.png'),
    ],
    celestial: [
      require('../../../assets/sprites/backgrounds/origens/unico/celestial/1.png'),
      require('../../../assets/sprites/backgrounds/origens/unico/celestial/2.png'),
      require('../../../assets/sprites/backgrounds/origens/unico/celestial/3.png'),
    ],
    errante: [
      require('../../../assets/sprites/backgrounds/origens/unico/errante/1.png'),
      require('../../../assets/sprites/backgrounds/origens/unico/errante/2.png'),
      require('../../../assets/sprites/backgrounds/origens/unico/errante/3.png'),
      require('../../../assets/sprites/backgrounds/origens/unico/errante/4.png'),
    ],
    forjada: [
      require('../../../assets/sprites/backgrounds/origens/unico/forjada/1.png'),
      require('../../../assets/sprites/backgrounds/origens/unico/forjada/2.png'),
      require('../../../assets/sprites/backgrounds/origens/unico/forjada/3.png'),
    ],
    primordial: [
      require('../../../assets/sprites/backgrounds/origens/unico/primordial/1.png'),
      require('../../../assets/sprites/backgrounds/origens/unico/primordial/2.png'),
    ],
  },
}

// Hash simples de string → inteiro (djb2)
function hashStr(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i)
  return Math.abs(h)
}

export function getOriginBackground(
  origin: Origin,
  rarity: BackgroundRarity,
  seed: string,
): number {
  const key = origin.toLowerCase() as OriginKey
  const variants = ORIGIN_BG[rarity]?.[key] ?? ORIGIN_BG.comum.abissal
  return variants[hashStr(seed) % variants.length]
}
