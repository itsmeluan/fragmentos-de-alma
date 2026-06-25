import React, { useMemo } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import {
  BlurMask,
  Canvas,
  Circle,
  FilterMode,
  Group,
  Image,
  Line,
  MipmapMode,
  RadialGradient,
  Rect,
  useImage,
  vec,
} from '@shopify/react-native-skia'
import { theme } from '@/lib/theme'
import { makeSeededRng } from '@/utils/random'
import { resolveHeroSprite } from '@/systems/visual/heroSprite'
import { getAffinityPalette } from '@/systems/visual/affinityColors'
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

export function HeroVisual({ hero, size = 'card', style }: HeroVisualProps) {
  const dim = SIZE_MAP[size]
  const { essence, attributes } = hero.genome
  const rarityColor = theme.colors.rarity[hero.rarity]
  const aff = getAffinityPalette(essence.affinity)

  const resolved = useMemo(
    () => resolveHeroSprite(essence.core, hero.rarity, attributes, 'south'),
    [essence.core, hero.rarity, attributes]
  )
  const image = useImage(resolved.source ?? undefined)

  // Nível de raridade 0..1 — dirige a INTENSIDADE de todos os efeitos por tier
  const rarityT = RARITY_INDEX[hero.rarity] / 5
  const rIdx = RARITY_INDEX[hero.rarity]
  const seed = hero.visualParams?.seed || hero.fusionSeed || hero.id

  // Partículas: contagem escala claramente por raridade (comum≈3 → único≈21)
  const particleCount = Math.round(3 + rIdx * 3 + (attributes.aura / 100) * 3)
  const particles = useMemo(() => seededPoints(`${seed}:aura`, particleCount, dim), [seed, particleCount, dim])

  // Raios radiais (lendário/único) — assinatura visual dos tiers altos
  const showRays = rIdx >= 4
  const rayCount = rIdx >= 5 ? 12 : 8

  // Sprite ampliado e centralizado dentro do frame
  const spriteW = dim * SPRITE_ZOOM
  const spriteX = (dim - spriteW) / 2
  const spriteY = (dim - spriteW) / 2
  const cx = dim / 2
  const cy = dim * 0.52

  return (
    <View style={[styles.container, { width: dim, height: dim, borderColor: rarityColor }, style]}>
      <Canvas style={{ width: dim, height: dim }}>
        {/* Fundo: radial escuro com tom da afinidade, mais intenso em raridades altas */}
        <Rect x={0} y={0} width={dim} height={dim}>
          <RadialGradient
            c={vec(dim / 2, dim * 0.45)}
            r={dim * 0.72}
            colors={[aff.primary + (rIdx >= 3 ? '4D' : '33'), theme.colors.background.primary]}
          />
        </Rect>

        {/* Glow de raridade (cor da raridade) — escala forte por tier */}
        <Circle cx={cx} cy={cy} r={dim * (0.20 + rarityT * 0.24)} color={rarityColor} opacity={0.10 + rarityT * 0.5}>
          <BlurMask blur={dim * (0.05 + rarityT * 0.14)} style="normal" />
        </Circle>

        {/* Raios radiais para lendário/único */}
        {showRays && (
          <Group opacity={0.25 + rarityT * 0.4}>
            {Array.from({ length: rayCount }, (_, i) => {
              const angle = (Math.PI * 2 * i) / rayCount
              return (
                <Line
                  key={`ray-${i}`}
                  p1={vec(cx + Math.cos(angle) * dim * 0.22, cy + Math.sin(angle) * dim * 0.22)}
                  p2={vec(cx + Math.cos(angle) * dim * 0.5, cy + Math.sin(angle) * dim * 0.5)}
                  color={rarityColor}
                  strokeWidth={1}
                />
              )
            })}
          </Group>
        )}

        {/* Anel de raridade (épico+) */}
        {rIdx >= 3 && (
          <Circle cx={cx} cy={cy} r={dim * 0.42} color={rarityColor} style="stroke" strokeWidth={1 + rarityT * 1.5} opacity={0.3 + rarityT * 0.4}>
            <BlurMask blur={1.5} style="normal" />
          </Circle>
        )}

        {/* Aura elemental — partículas (cor da afinidade); tamanho/opacidade sobem com raridade */}
        <Group opacity={0.45 + rarityT * 0.4}>
          {particles.map((p, i) => (
            <Circle
              key={`aura-${i}`}
              cx={p.x}
              cy={p.y}
              r={p.r * (0.9 + rarityT * 1.1)}
              color={i % 3 === 0 ? aff.glow : aff.secondary}
              opacity={0.4 + rarityT * 0.4}
            />
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

        {/* Acento de raridade no topo (mais espesso em raridades altas) */}
        <Rect x={0} y={0} width={dim} height={2 + rarityT * 2} color={rarityColor} opacity={0.95} />
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
