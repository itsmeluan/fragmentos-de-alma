import React, { useMemo } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  vec,
} from '@shopify/react-native-skia'
import { theme } from '@/lib/theme'
import { makeSeededRng } from '@/utils/random'
import type { Hero } from '@/systems/genes/types'
import type { AuraLevel, PatternDensity, ResonanceLevel, SilhouetteWeight } from '@/systems/visual/types'

export interface HeroVisualProps {
  hero: Hero
  size?: 'card' | 'detail' | 'slot'
  style?: ViewStyle
}

interface Point {
  x: number
  y: number
}

const SIZE_MAP = { card: 96, detail: 200, slot: 72 } as const

function safeColor(color: string): string {
  const normalized = color.trim().toUpperCase()
  const pureWhite = `#${'F'.repeat(6)}`
  const pureWhiteShort = `#${'F'.repeat(3)}`
  if (normalized === pureWhite || normalized === pureWhiteShort) return theme.colors.text.primary
  return color
}

function shiftColor(color: string, shift: number): string {
  const hex = safeColor(color).replace('#', '')
  if (hex.length !== 6) return safeColor(color)

  const channel = (index: number): number => parseInt(hex.slice(index, index + 2), 16)
  const clamp = (value: number): number => Math.max(0, Math.min(255, Math.round(value)))
  const delta = shift * 180

  const r = clamp(channel(0) + delta)
  const g = clamp(channel(2) - delta * 0.35)
  const b = clamp(channel(4) + delta * 0.5)

  return `#${[r, g, b].map(value => value.toString(16).padStart(2, '0')).join('').toUpperCase()}`
}

function seededPoints(seed: string, count: number, dim: number): Point[] {
  const rng = makeSeededRng(seed)
  return Array.from({ length: count }, () => ({
    x: rng() * dim,
    y: rng() * dim,
  }))
}

function silhouetteBounds(dim: number, weight: SilhouetteWeight) {
  const width = weight === 'light' ? dim * 0.32 : weight === 'dense' ? dim * 0.58 : dim * 0.46
  const height = weight === 'light' ? dim * 0.62 : weight === 'dense' ? dim * 0.74 : dim * 0.68
  const cx = dim / 2
  const top = dim * 0.18
  const bottom = top + height

  return {
    cx,
    top,
    bottom,
    left: cx - width / 2,
    right: cx + width / 2,
    width,
    height,
  }
}

function polygonPath(points: Point[]): string {
  const [first, ...rest] = points
  return `M${first.x} ${first.y} ${rest.map(point => `L${point.x} ${point.y}`).join(' ')} Z`
}

function silhouettePath(dim: number, core: string, weight: SilhouetteWeight): string {
  const b = silhouetteBounds(dim, weight)
  const mid = b.top + b.height * 0.48

  switch (core) {
    case 'Guardião':
      return polygonPath([
        { x: b.cx, y: b.top },
        { x: b.right, y: b.top + b.height * 0.22 },
        { x: b.right - b.width * 0.08, y: b.bottom - b.height * 0.18 },
        { x: b.cx, y: b.bottom },
        { x: b.left + b.width * 0.08, y: b.bottom - b.height * 0.18 },
        { x: b.left, y: b.top + b.height * 0.22 },
      ])
    case 'Trickster':
      return polygonPath([
        { x: b.cx + b.width * 0.1, y: b.top },
        { x: b.right, y: mid - b.height * 0.05 },
        { x: b.cx - b.width * 0.08, y: b.bottom },
        { x: b.left, y: mid + b.height * 0.03 },
      ])
    case 'Arauto':
      return polygonPath([
        { x: b.cx, y: b.top },
        { x: b.right - b.width * 0.06, y: b.top + b.height * 0.36 },
        { x: b.cx + b.width * 0.22, y: b.top + b.height * 0.5 },
        { x: b.right, y: b.bottom - b.height * 0.08 },
        { x: b.cx, y: b.bottom },
        { x: b.left, y: b.bottom - b.height * 0.08 },
        { x: b.cx - b.width * 0.2, y: b.top + b.height * 0.5 },
        { x: b.left + b.width * 0.1, y: b.top + b.height * 0.32 },
      ])
    case 'Invocador':
      return polygonPath([
        { x: b.cx, y: b.top },
        { x: b.right, y: mid },
        { x: b.cx, y: b.bottom },
        { x: b.left, y: mid },
      ])
    case 'Criador':
      return polygonPath([
        { x: b.cx, y: b.top },
        { x: b.right, y: b.top + b.height * 0.23 },
        { x: b.right, y: b.bottom - b.height * 0.23 },
        { x: b.cx, y: b.bottom },
        { x: b.left, y: b.bottom - b.height * 0.23 },
        { x: b.left, y: b.top + b.height * 0.23 },
      ])
    case 'Errante':
      return polygonPath([
        { x: b.cx - b.width * 0.1, y: b.top },
        { x: b.right, y: b.top + b.height * 0.18 },
        { x: b.right - b.width * 0.18, y: mid },
        { x: b.right, y: b.bottom - b.height * 0.1 },
        { x: b.cx - b.width * 0.08, y: b.bottom },
        { x: b.left, y: mid + b.height * 0.07 },
      ])
    case 'Protetor':
      return polygonPath([
        { x: b.cx - b.width * 0.18, y: b.top },
        { x: b.cx + b.width * 0.18, y: b.top },
        { x: b.cx + b.width * 0.18, y: mid - b.height * 0.15 },
        { x: b.right, y: mid - b.height * 0.15 },
        { x: b.right, y: mid + b.height * 0.16 },
        { x: b.cx + b.width * 0.18, y: mid + b.height * 0.16 },
        { x: b.cx + b.width * 0.18, y: b.bottom },
        { x: b.cx - b.width * 0.18, y: b.bottom },
        { x: b.cx - b.width * 0.18, y: mid + b.height * 0.16 },
        { x: b.left, y: mid + b.height * 0.16 },
        { x: b.left, y: mid - b.height * 0.15 },
        { x: b.cx - b.width * 0.18, y: mid - b.height * 0.15 },
      ])
    case 'Destruidor':
    case 'Predador':
    default:
      return polygonPath([
        { x: b.left, y: b.top },
        { x: b.right, y: b.top },
        { x: b.cx, y: b.bottom },
      ])
  }
}

function backgroundLayer(origin: string, dim: number, seed: string): React.ReactNode {
  const stars = seededPoints(`${seed}:stars`, 36, dim)
  const grit = seededPoints(`${seed}:grit`, 16, dim)
  const base = (
    <Rect x={0} y={0} width={dim} height={dim}>
      <RadialGradient c={vec(dim / 2, dim / 2)} r={dim * 0.75} colors={[theme.colors.background.tertiary, theme.colors.background.primary]} />
    </Rect>
  )

  switch (origin) {
    case 'Abissal':
      return (
        <>
          <Rect x={0} y={0} width={dim} height={dim}>
            <RadialGradient c={vec(dim * 0.48, dim * 0.45)} r={dim * 0.78} colors={['#1A0A1A', theme.colors.background.primary]} />
          </Rect>
          <Circle cx={dim * 0.5} cy={dim * 0.5} r={dim * 0.58} color="#1A0A1A" opacity={0.22} />
        </>
      )
    case 'Errante':
      return (
        <>
          <Rect x={0} y={0} width={dim} height={dim}>
            <LinearGradient start={vec(0, 0)} end={vec(dim, dim)} colors={['#0F0F0A', '#1A1A0A']} />
          </Rect>
          {grit.slice(0, 10).map((point, index) => (
            <Line key={`sand-${index}`} p1={vec(point.x, point.y)} p2={vec(point.x + dim * 0.08, point.y + dim * 0.02)} color={theme.colors.gold.dark} opacity={0.16} strokeWidth={0.7} />
          ))}
        </>
      )
    case 'Celestial':
      return (
        <>
          <Rect x={0} y={0} width={dim} height={dim}>
            <RadialGradient c={vec(dim * 0.5, dim * 0.26)} r={dim * 0.85} colors={['#0A0A1E', theme.colors.background.primary]} />
          </Rect>
          {stars.map((point, index) => (
            <Circle key={`star-${index}`} cx={point.x} cy={point.y} r={index % 6 === 0 ? 1.2 : 0.65} color={theme.colors.text.primary} opacity={0.28 + (index % 4) * 0.1} />
          ))}
        </>
      )
    case 'Mecanico':
    case 'Mecânico':
      return (
        <>
          <Rect x={0} y={0} width={dim} height={dim} color="#0A0F0A" />
          {Array.from({ length: 7 }, (_, index) => (
            <React.Fragment key={`grid-${index}`}>
              <Line p1={vec((index + 1) * dim / 8, 0)} p2={vec((index + 1) * dim / 8, dim)} color={theme.colors.border.subtle} opacity={0.3} strokeWidth={0.6} />
              <Line p1={vec(0, (index + 1) * dim / 8)} p2={vec(dim, (index + 1) * dim / 8)} color={theme.colors.border.subtle} opacity={0.3} strokeWidth={0.6} />
            </React.Fragment>
          ))}
        </>
      )
    case 'Primordial':
    case 'Ancestral':
      return (
        <>
          <Rect x={0} y={0} width={dim} height={dim} color="#1A1510" />
          {grit.slice(0, 8).map((point, index) => (
            <Line key={`root-${index}`} p1={vec(point.x, dim)} p2={vec(dim * (0.2 + index * 0.09), point.y)} color="#4E342E" opacity={0.35} strokeWidth={1} />
          ))}
        </>
      )
    case 'Espectral':
      return (
        <>
          <Rect x={0} y={0} width={dim} height={dim} color="#1A0A1A" />
          {grit.slice(0, 9).map((point, index) => (
            <Circle key={`mist-${index}`} cx={point.x} cy={point.y} r={dim * (0.08 + (index % 3) * 0.03)} color={theme.colors.text.primary} opacity={0.05} />
          ))}
        </>
      )
    case 'Abissal Lunar':
      return (
        <>
          {backgroundLayer('Abissal', dim, seed)}
          <Circle cx={dim * 0.74} cy={dim * 0.24} r={dim * 0.085} color={theme.colors.text.primary} opacity={0.9} />
          <Circle cx={dim * 0.78} cy={dim * 0.22} r={dim * 0.085} color="#1A0A1A" opacity={1} />
        </>
      )
    case 'Forjada':
    case 'Forjado':
      return (
        <>
          <Rect x={0} y={0} width={dim} height={dim}>
            <LinearGradient start={vec(0, 0)} end={vec(dim, dim)} colors={['#0F1A0F', theme.colors.background.primary]} />
          </Rect>
          <Circle cx={dim * 0.5} cy={dim * 0.88} r={dim * 0.34} color="#E65100" opacity={0.18} />
          {grit.slice(0, 8).map((point, index) => (
            <Line key={`spark-${index}`} p1={vec(point.x, point.y)} p2={vec(point.x + 4, point.y - 6)} color={theme.colors.gold.light} opacity={0.45} strokeWidth={0.7} />
          ))}
        </>
      )
    default:
      return base
  }
}

function patternLayer(dim: number, origin: string, density: PatternDensity, color: string): React.ReactNode {
  const count = density === 'sparse' ? 3 : density === 'medium' ? 6 : 10
  const b = silhouetteBounds(dim, density === 'dense' ? 'dense' : 'standard')

  return (
    <Group opacity={0.4}>
      {Array.from({ length: count }, (_, index) => {
        const offset = (index - count / 2) * dim * 0.055
        if (density === 'medium' && index % 2 === 0) {
          const x = b.cx + offset
          const y = b.top + b.height * (0.25 + (index % 3) * 0.18)
          return <Path key={`rune-${index}`} path={polygonPath([{ x, y }, { x: x + 4, y: y + 7 }, { x: x - 4, y: y + 7 }])} color={color} style="stroke" strokeWidth={0.8} />
        }

        if (density === 'dense' && index % 3 === 0) {
          const x = b.left + index * b.width / count
          return <Path key={`sigil-${index}`} path={`M${x} ${b.top + 12}L${x + 6} ${b.top + 20}L${x - 1} ${b.top + 28}L${x + 8} ${b.top + 36}`} color={color} style="stroke" strokeWidth={0.8} />
        }

        const y1 = b.top + b.height * 0.18 + index * (b.height * 0.6 / count)
        const y2 = y1 + dim * 0.18
        const originBias = origin === 'Celestial' || origin === 'Forjada' ? 1 : -1
        return <Line key={`mark-${index}`} p1={vec(b.left + offset, y1)} p2={vec(b.right + offset * 0.2 * originBias, y2)} color={color} strokeWidth={0.75} />
      })}
    </Group>
  )
}

function ornamentLayer(dim: number, core: string, offsets: readonly number[], color: string): React.ReactNode {
  const count = Math.min(6, Math.floor(offsets.length / 2))
  const radius = dim * 0.34
  const center = dim / 2

  return (
    <Group opacity={0.72}>
      {Array.from({ length: count }, (_, index) => {
        const angle = offsets[index * 2] * Math.PI * 2
        const drift = (offsets[index * 2 + 1] - 0.5) * dim * 0.12
        const x = center + Math.cos(angle) * radius + drift
        const y = center + Math.sin(angle) * radius - drift * 0.5
        const size = dim * 0.035 + (index % 2) * dim * 0.012

        if (core === 'Invocador' || index % 3 === 0) {
          return <Circle key={`ornament-${index}`} cx={x} cy={y} r={size} color={color} style="stroke" strokeWidth={0.9} />
        }
        if (core === 'Guardião' || index % 3 === 1) {
          return <Path key={`ornament-${index}`} path={polygonPath([{ x, y: y - size }, { x: x + size, y }, { x, y: y + size }, { x: x - size, y }])} color={color} style="stroke" strokeWidth={0.9} />
        }
        return <Path key={`ornament-${index}`} path={polygonPath([{ x, y: y - size }, { x: x + size, y: y + size }, { x: x - size, y: y + size }])} color={color} style="stroke" strokeWidth={0.9} />
      })}
    </Group>
  )
}

function auraLayer(dim: number, level: AuraLevel, color: string, seed: string): React.ReactNode {
  const points = seededPoints(`${seed}:aura`, 16, dim)
  const center = dim / 2

  if (level === 'none') return null
  if (level === 'halo') {
    return <Circle cx={center} cy={center} r={dim * 0.36} color={color} style="stroke" strokeWidth={1} opacity={0.3} />
  }
  if (level === 'particles') {
    return (
      <Group opacity={0.72}>
        {points.slice(0, 10).map((point, index) => (
          <Circle key={`particle-${index}`} cx={point.x} cy={point.y} r={index % 3 === 0 ? 1.4 : 0.9} color={color} opacity={0.45} />
        ))}
      </Group>
    )
  }
  if (level === 'distortion') {
    return (
      <Group opacity={0.28}>
        <Circle cx={center - 2} cy={center} r={dim * 0.39} color={color} style="stroke" strokeWidth={1.3}>
          <BlurMask blur={5} style="normal" />
        </Circle>
        <Circle cx={center + 3} cy={center + 1} r={dim * 0.43} color={color} style="stroke" strokeWidth={0.9} />
      </Group>
    )
  }

  return (
    <Group opacity={0.5}>
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 12
        return (
          <Line
            key={`field-${index}`}
            p1={vec(center + Math.cos(angle) * dim * 0.2, center + Math.sin(angle) * dim * 0.2)}
            p2={vec(center + Math.cos(angle) * dim * 0.48, center + Math.sin(angle) * dim * 0.48)}
            color={color}
            strokeWidth={0.75}
          />
        )
      })}
    </Group>
  )
}

export function HeroVisual({ hero, size = 'card', style }: HeroVisualProps) {
  const dim = SIZE_MAP[size]
  const rarityColor = theme.colors.rarity[hero.rarity]
  const visual = hero.visualParams
  const hueShifts = visual.uniqueVariations.colorHueShifts
  const primary = shiftColor(visual.palette.primary, hueShifts[0] ?? 0)
  const secondary = shiftColor(visual.palette.secondary, hueShifts[1] ?? 0)
  const glow = shiftColor(visual.palette.glow, hueShifts[2] ?? 0)
  const blurSigma: Record<ResonanceLevel, number> = { vibrant: 20, standard: 10, desaturated: 4 }
  const core = String(visual.silhouette.coreShape)
  const origin = String(visual.background.origin)
  const path = useMemo(
    () => silhouettePath(dim, core, visual.silhouette.weight),
    [core, dim, visual.silhouette.weight]
  )
  const seed = visual.seed || hero.fusionSeed || hero.id

  return (
    <View style={[styles.container, { width: dim, height: dim, borderColor: rarityColor }, style]}>
      <Canvas style={{ width: dim, height: dim }}>
        {backgroundLayer(origin, dim, seed)}
        {auraLayer(dim, visual.aura.level, glow, seed)}
        <Path path={path} color={glow} opacity={0.34}>
          <BlurMask blur={blurSigma[visual.palette.resonanceLevel]} style="normal" />
        </Path>
        <Path path={path} color={primary} opacity={0.9} />
        <Path path={path} color={theme.colors.background.primary} style="stroke" strokeWidth={1.2} opacity={0.55} />
        {core === 'Invocador' && (
          <>
            <Circle cx={dim * 0.5} cy={dim * 0.5} r={dim * 0.16} color={secondary} opacity={0.45} />
            {[0, 1, 2].map(index => {
              const angle = index * Math.PI * 2 / 3 - Math.PI / 2
              return (
                <Line
                  key={`ray-${index}`}
                  p1={vec(dim * 0.5, dim * 0.5)}
                  p2={vec(dim * 0.5 + Math.cos(angle) * dim * 0.3, dim * 0.5 + Math.sin(angle) * dim * 0.3)}
                  color={primary}
                  strokeWidth={2}
                  opacity={0.75}
                />
              )
            })}
          </>
        )}
        {patternLayer(dim, String(visual.pattern.origin), visual.pattern.density, secondary)}
        {ornamentLayer(dim, core, visual.uniqueVariations.ornamentOffsets, glow)}
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
