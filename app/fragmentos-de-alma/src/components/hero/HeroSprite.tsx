import React, { useMemo } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import {
  BlurMask,
  Canvas,
  Circle,
  FilterMode,
  Group,
  Image,
  MipmapMode,
  RadialGradient,
  Rect,
  useImage,
  vec,
} from '@shopify/react-native-skia'
import { theme } from '@/lib/theme'
import { makeSeededRng } from '@/utils/random'
import { resolveHeroSprite } from '@/systems/visual/heroSprite'
import { AFFINITY_PALETTE } from '@/systems/visual/affinityColors'
import type { Hero, Rarity } from '@/systems/genes/types'

export interface HeroVisualProps {
  hero: Hero
  size?: 'card' | 'detail' | 'slot'
  style?: ViewStyle
}

const SIZE_MAP = { card: 96, detail: 200, slot: 72 } as const

// Quanto o sprite é ampliado dentro do frame (recorta a margem transparente do canvas PixelLab)
const SPRITE_ZOOM = 1.32

const RARITY_INDEX: Record<Rarity, number> = {
  comum: 0, incomum: 1, raro: 2, epico: 3, lendario: 4, unico: 5,
}

function seededPoints(seed: string, count: number, dim: number) {
  const rng = makeSeededRng(seed)
  return Array.from({ length: count }, () => ({ x: rng() * dim, y: rng() * dim, r: 0.6 + rng() * 1.1 }))
}

/** Intensidade visual 0..1 a partir da raridade + soma de atributos. */
function powerIntensity(hero: Hero): number {
  const rarity = RARITY_INDEX[hero.rarity] / 5
  const sum = Object.values(hero.genome.attributes).reduce((a, b) => a + b, 0)
  const attrs = Math.min(1, sum / 600)
  return Math.min(1, rarity * 0.65 + attrs * 0.35)
}

export function HeroVisual({ hero, size = 'card', style }: HeroVisualProps) {
  const dim = SIZE_MAP[size]
  const { essence, attributes } = hero.genome
  const rarityColor = theme.colors.rarity[hero.rarity]
  const aff = AFFINITY_PALETTE[essence.affinity]

  const resolved = useMemo(
    () => resolveHeroSprite(essence.core, hero.rarity, attributes, 'south'),
    [essence.core, hero.rarity, attributes]
  )
  const image = useImage(resolved.source ?? undefined)

  const intensity = powerIntensity(hero)
  const seed = hero.visualParams?.seed || hero.fusionSeed || hero.id

  // Aura: mais partículas com aura/ressonância altos e raridade alta
  const particleCount = Math.round(4 + intensity * 10 + (attributes.aura / 100) * 6)
  const particles = useMemo(() => seededPoints(`${seed}:aura`, particleCount, dim), [seed, particleCount, dim])

  // Sprite ampliado e centralizado dentro do frame
  const spriteW = dim * SPRITE_ZOOM
  const spriteX = (dim - spriteW) / 2
  const spriteY = (dim - spriteW) / 2

  return (
    <View style={[styles.container, { width: dim, height: dim, borderColor: rarityColor }, style]}>
      <Canvas style={{ width: dim, height: dim }}>
        {/* Fundo: radial escuro com leve tom da afinidade */}
        <Rect x={0} y={0} width={dim} height={dim}>
          <RadialGradient
            c={vec(dim / 2, dim * 0.45)}
            r={dim * 0.72}
            colors={[aff.primary + '33', theme.colors.background.primary]}
          />
        </Rect>

        {/* Glow de raridade atrás do personagem */}
        <Circle cx={dim / 2} cy={dim * 0.52} r={dim * (0.26 + intensity * 0.14)} color={aff.glow} opacity={0.12 + intensity * 0.33}>
          <BlurMask blur={dim * (0.06 + intensity * 0.08)} style="normal" />
        </Circle>

        {/* Aura elemental — partículas */}
        <Group opacity={0.4 + intensity * 0.4}>
          {particles.map((p, i) => (
            <Circle key={`aura-${i}`} cx={p.x} cy={p.y} r={p.r} color={i % 3 === 0 ? aff.glow : aff.secondary} opacity={0.5} />
          ))}
        </Group>

        {/* Sprite pixel art (nearest-neighbor para manter os pixels nítidos) */}
        {image && (
          <Image
            image={image}
            x={spriteX}
            y={spriteY}
            width={spriteW}
            height={spriteW}
            fit="contain"
            sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.None }}
          />
        )}

        {/* Acento de raridade no topo */}
        <Rect x={0} y={0} width={dim} height={2} color={rarityColor} opacity={0.95} />
      </Canvas>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: theme.border.radius.sm,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.tertiary,
  },
})
