import React, { useMemo } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import {
  BlurMask,
  Canvas,
  Circle,
  FilterMode,
  Image,
  MipmapMode,
  RadialGradient,
  Rect,
  useImage,
  vec,
} from '@shopify/react-native-skia'
import { theme } from '@/lib/theme'
import { getAffinityPalette } from '@/systems/visual/affinityColors'
import { ENEMY_REGISTRY } from '@/systems/visual/enemyRegistry'
import { BOSS_REGISTRY } from '@/systems/visual/bossRegistry'
import type { Combatant } from '@/systems/battle/types'

// Mapa de biomeId → chave no BOSS_REGISTRY
const BIOME_TO_BOSS_KEY: Record<string, string> = {
  axis: 'axis_velum',
  kethara: 'kethara_lithos',
  mnemos: 'mnemos_echonis',
  verdania: 'verdania_floris',
  cinderfall: 'cinderfall_ignis',
  limiar: 'limiar_umbra',
  venula: 'venula_cruor',
}

// Mapa de core canônico → pasta do inimigo
const CORE_TO_ENEMY_FOLDER: Record<string, string> = {
  Guardião: 'guardiao',
  Destruidor: 'destruidor',
  Arauto: 'arauto',
  Invocador: 'invocador',
  Trickster: 'trickster',
}

// Inimigo é "elite" quando resistência > 60 (valores de bioma boost refletem isso)
function pickVariant(resistencia: number): 'corrompido' | 'elite' {
  return resistencia > 60 ? 'elite' : 'corrompido'
}

const SPRITE_ZOOM = 1.32

interface EnemySpriteProps {
  combatant: Combatant
  /** biomeId — usado apenas para chefes para determinar boss_key */
  biomeId?: string
  size?: number
  style?: ViewStyle
  targeted?: boolean
}

/**
 * Renderiza o sprite pixel art de um inimigo ou chefe.
 * Inimigos normais: ENEMY_REGISTRY[core][corrompido|elite][south]
 * Chefes: BOSS_REGISTRY[boss_key][bossPhase][south]
 */
export function EnemySprite({ combatant, biomeId, size = 72, targeted = false, style }: EnemySpriteProps) {
  const { essence, attributes } = combatant.genome
  const aff = getAffinityPalette(essence.affinity)

  const spriteSource = useMemo(() => {
    if (combatant.isBoss && biomeId) {
      const bossKey = BIOME_TO_BOSS_KEY[biomeId]
      const phase = combatant.bossPhase ?? 1
      return BOSS_REGISTRY[bossKey]?.[phase]?.south ?? null
    }
    const folder = CORE_TO_ENEMY_FOLDER[essence.core] ?? 'guardiao'
    const variant = pickVariant(attributes.resistencia)
    return ENEMY_REGISTRY[folder]?.[variant]?.south ?? null
  }, [combatant.isBoss, combatant.bossPhase, biomeId, essence.core, attributes.resistencia])

  const image = useImage(spriteSource ?? undefined)

  const dim = size
  const spriteW = dim * SPRITE_ZOOM
  const spriteX = (dim - spriteW) / 2
  const spriteY = (dim - spriteW) / 2
  const cx = dim / 2
  const cy = dim * 0.52

  // Chefes têm glow mais intenso
  const isBoss = combatant.isBoss ?? false
  const glowRadius = dim * (isBoss ? 0.45 : 0.32)
  const glowOpacity = isBoss ? 0.55 : 0.3

  return (
    <View style={[styles.container, { width: dim, height: dim }, targeted && styles.targeted, style]}>
      <Canvas style={{ width: dim, height: dim }}>
        <Rect x={0} y={0} width={dim} height={dim}>
          <RadialGradient
            c={vec(cx, cy)}
            r={dim * 0.7}
            colors={[aff.primary + '44', theme.colors.background.primary]}
          />
        </Rect>

        <Circle cx={cx} cy={cy} r={glowRadius} color={aff.glow} opacity={glowOpacity}>
          <BlurMask blur={dim * 0.12} style="normal" />
        </Circle>

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
      </Canvas>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: theme.border.radius.sm,
    backgroundColor: theme.colors.background.tertiary,
  },
  targeted: {
    borderWidth: 2,
    borderColor: theme.colors.gold.main,
  },
})
