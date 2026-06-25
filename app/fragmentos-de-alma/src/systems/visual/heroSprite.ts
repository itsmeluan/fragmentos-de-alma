// Mapeamento genoma → sprite pixel art (PixelLab). Ver docs/14_assets_pixellab.md.
// Resolve núcleo + atributos → build visual + tier de raridade, com fallback.

import type { Core, Rarity, AttributeGenes } from '@/systems/genes/types'
import { SPRITE_REGISTRY, type SpriteDirection } from './spriteRegistry'

// Núcleo canônico → pasta de assets
const CORE_TO_FOLDER: Record<Core, string> = {
  Guardião: 'guardiao',
  Destruidor: 'destruidor',
  Arauto: 'arauto',
  Invocador: 'invocador',
  Trickster: 'trickster',
}

// Normaliza valores de núcleo legados/de teste (nomes de build usados como core)
// para o núcleo canônico correspondente. Heróis reais já vêm com core canônico.
const CORE_ALIASES: Record<string, Core> = {
  Fragmentador: 'Destruidor',
  Ancião: 'Invocador',
  Vidente: 'Trickster',
  Caçador: 'Trickster',
  Sentinela: 'Guardião',
  // sinônimos possíveis de docs antigas
  Criador: 'Invocador',
  Protetor: 'Guardião',
  Predador: 'Destruidor',
  Errante: 'Arauto',
}

function normalizeCore(core: string): Core {
  if (core in CORE_TO_FOLDER) return core as Core
  return CORE_ALIASES[core] ?? 'Guardião'
}

// Cada núcleo tem 2 builds; o "highBuild" é escolhido quando o atributo-chave
// está acima da média dos atributos do herói. Ver manifest.json / doc 14 §1.
interface BuildSelector {
  attr: keyof AttributeGenes
  high: string // build escolhido quando attr > média
  base: string // build padrão (empate ou abaixo)
}

const BUILD_SELECTORS: Record<Core, BuildSelector> = {
  Guardião: { attr: 'resistencia', high: 'sentinela', base: 'guardiao' },
  Destruidor: { attr: 'agilidade', high: 'reaver', base: 'fragmentador' },
  Arauto: { attr: 'aura', high: 'corneiro', base: 'arauto' },
  Invocador: { attr: 'ressonancia', high: 'invocador', base: 'anciao' },
  Trickster: { attr: 'agilidade', high: 'cacador', base: 'vidente' },
}

// Ordem de fallback de tier: se o tier pedido não existe, desce nesta cadeia.
const TIER_FALLBACK: Record<Rarity, Rarity[]> = {
  comum: ['comum'],
  incomum: ['incomum', 'comum'],
  raro: ['raro', 'incomum', 'comum'],
  epico: ['epico', 'raro', 'incomum', 'comum'],
  lendario: ['lendario', 'epico', 'raro', 'incomum', 'comum'],
  unico: ['unico', 'lendario', 'epico', 'raro', 'incomum', 'comum'],
}

function meanAttr(attrs: AttributeGenes): number {
  const vals = Object.values(attrs)
  return vals.reduce((sum, v) => sum + v, 0) / vals.length
}

/** Escolhe o build visual (silhueta) com base no atributo dominante do núcleo. */
export function pickBuild(core: Core, attrs: AttributeGenes): string {
  const sel = BUILD_SELECTORS[core]
  return attrs[sel.attr] > meanAttr(attrs) ? sel.high : sel.base
}

export interface ResolvedSprite {
  folder: string
  build: string
  tier: Rarity
  /** módulo do asset (require) para a direção pedida, ou null se ausente */
  source: number | null
}

/**
 * Resolve o sprite final para um herói: núcleo→build→tier (com fallback)→direção.
 * Direção padrão 'south' (frontal) para retratos de card/detalhe.
 */
export function resolveHeroSprite(
  core: string,
  rarity: Rarity,
  attrs: AttributeGenes,
  direction: SpriteDirection = 'south'
): ResolvedSprite {
  const canonical = normalizeCore(core)
  const folder = CORE_TO_FOLDER[canonical]
  const build = pickBuild(canonical, attrs)
  const buildMap = SPRITE_REGISTRY[folder]?.[build]

  // Tenta cada tier na cadeia de fallback até achar um sprite existente
  for (const tier of TIER_FALLBACK[rarity]) {
    const dirMap = buildMap?.[tier]
    if (dirMap && dirMap[direction] != null) {
      return { folder, build, tier, source: dirMap[direction] }
    }
  }

  return { folder, build, tier: 'comum', source: null }
}
