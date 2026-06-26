import React, { useMemo } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import {
  Canvas,
  FilterMode,
  Image,
  MipmapMode,
  useImage,
} from '@shopify/react-native-skia'
import { theme } from '@/lib/theme'
import { resolveHeroSprite } from '@/systems/visual/heroSprite'
import { getOriginBackground } from '@/systems/visual/originBackgroundRegistry'
import type { Hero, Rarity } from '@/systems/genes/types'

export interface HeroVisualProps {
  hero: Hero
  size?: 'card' | 'detail' | 'slot'
  style?: ViewStyle
}

const SIZE_MAP = { card: 96, detail: 200, slot: 72 } as const


// Sprites únicos têm conteúdo mais denso (136×136 vs ~124px outros tiers).
// Inset de 10% normaliza o tamanho visual do personagem entre raridades.
const UNIQUE_SPRITE_INSET_RATIO = 0.10

export function HeroVisual({ hero, size = 'card', style }: HeroVisualProps) {
  const dim = SIZE_MAP[size]
  const { essence, attributes } = hero.genome
  const rarityColor = theme.colors.rarity[hero.rarity]
  const seed = hero.visualParams?.seed || hero.fusionSeed || hero.id

  const resolved = useMemo(
    () => resolveHeroSprite(essence.core, hero.rarity, attributes, 'south'),
    [essence.core, hero.rarity, attributes]
  )
  const image = useImage(resolved.source ?? undefined)

  const bgSource = useMemo(
    () => getOriginBackground(essence.origin, hero.rarity, seed),
    [essence.origin, hero.rarity, seed]
  )
  const bgImage = useImage(bgSource)

  const spriteInset = hero.rarity === 'unico' ? dim * UNIQUE_SPRITE_INSET_RATIO : 0

  return (
    <View style={[styles.container, { width: dim, height: dim, borderColor: rarityColor }, style]}>
      <Canvas style={{ width: dim, height: dim }}>
        {bgImage && (
          <Image
            image={bgImage}
            x={0}
            y={0}
            width={dim}
            height={dim}
            fit="cover"
            sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.None }}
          />
        )}
        {image && (
          <Image
            image={image}
            x={spriteInset}
            y={spriteInset}
            width={dim - 2 * spriteInset}
            height={dim - 2 * spriteInset}
            fit="contain"
            sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.None }}
          />
        )}
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
    backgroundColor: '#121016',
  },
})
