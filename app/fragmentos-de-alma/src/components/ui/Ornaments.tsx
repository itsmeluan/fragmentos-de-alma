import React from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import Svg, { Circle, Line, Path, Polygon, Rect } from 'react-native-svg'
import { theme } from '@/lib/theme'
import type { Affinity, Rarity } from '@/systems/genes/types'

type CornerPosition = 'tl' | 'tr' | 'bl' | 'br'

interface CornerBracketProps {
  size?: number
  color?: string
  position: CornerPosition
}

export function CornerBracket({ size = 16, color = theme.colors.gold.dark, position }: CornerBracketProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={[styles.corner, cornerPositionStyles[position]]}
    >
      <Path d="M1 15V1H15" stroke={color} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" fill="none" />
      <Path d="M5 15V5H15" stroke={color} strokeWidth={0.8} strokeLinecap="square" strokeLinejoin="miter" fill="none" opacity={0.55} />
    </Svg>
  )
}

interface SectionDividerProps {
  color?: string
  width?: ViewStyle['width']
}

export function SectionDivider({ color = theme.colors.border.subtle, width = '100%' }: SectionDividerProps) {
  return (
    <View style={[styles.dividerWrap, { width }]}>
      <View style={[styles.dividerLine, { backgroundColor: color }]} />
      <Svg width={18} height={8} viewBox="0 0 18 8">
        <Polygon points="9,1 16,4 9,7 2,4" fill="none" stroke={color} strokeWidth={1} />
      </Svg>
      <View style={[styles.dividerLine, { backgroundColor: color }]} />
    </View>
  )
}

interface RarityFrameProps {
  rarity: Rarity
  children: React.ReactNode
  style?: ViewStyle
}

export function RarityFrame({ rarity, children, style }: RarityFrameProps) {
  const color = theme.colors.rarity[rarity]

  return (
    <View style={[styles.rarityFrame, { borderColor: color + 'AA' }, style]}>
      {children}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <CornerBracket position="tl" color={color} />
        <CornerBracket position="tr" color={color} />
        <CornerBracket position="bl" color={color} />
        <CornerBracket position="br" color={color} />
      </View>
    </View>
  )
}

interface GoldAccentLineProps {
  orientation: 'h' | 'v'
  length: number
  color?: string
}

export function GoldAccentLine({ orientation, length, color = theme.colors.gold.dark }: GoldAccentLineProps) {
  return (
    <View
      style={{
        width: orientation === 'h' ? length : 1,
        height: orientation === 'v' ? length : 1,
        backgroundColor: color,
      }}
    />
  )
}

type GlyphType = 'fire' | 'water' | 'earth' | 'wind' | 'ether' | 'light' | 'dark' | 'void'

const GLYPH_COLORS: Record<GlyphType, string> = {
  fire: '#C0392B',
  water: '#1565C0',
  earth: '#4E342E',
  wind: '#B0BEC5',
  ether: '#6A1B9A',
  light: '#F57F17',
  dark: '#7B1FA2',
  void: '#9E9E9E',
}

const AFFINITY_TO_GLYPH: Record<Affinity, GlyphType> = {
  Fogo: 'fire',
  Água: 'water',
  Terra: 'earth',
  Vento: 'wind',
  Éter: 'ether',
  Luz: 'light',
  Sombra: 'dark',
  Vazio: 'void',
}

interface AlchemyGlyphProps {
  type: GlyphType | Affinity
  size?: number
  color?: string
}

export function AlchemyGlyph({ type, size = 16, color }: AlchemyGlyphProps) {
  const glyphType = (type in AFFINITY_TO_GLYPH ? AFFINITY_TO_GLYPH[type as Affinity] : type) as GlyphType
  const stroke = color ?? GLYPH_COLORS[glyphType]

  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      {glyphType === 'fire' && <Polygon points="8,2 14,14 2,14" fill="none" stroke={stroke} strokeWidth={1.4} />}
      {glyphType === 'water' && <Polygon points="2,2 14,2 8,14" fill="none" stroke={stroke} strokeWidth={1.4} />}
      {glyphType === 'earth' && (
        <>
          <Polygon points="2,2 14,2 8,14" fill="none" stroke={stroke} strokeWidth={1.4} />
          <Line x1={4} y1={6} x2={12} y2={6} stroke={stroke} strokeWidth={1.2} />
        </>
      )}
      {glyphType === 'wind' && (
        <>
          <Polygon points="8,2 14,14 2,14" fill="none" stroke={stroke} strokeWidth={1.4} />
          <Line x1={4} y1={10} x2={12} y2={10} stroke={stroke} strokeWidth={1.2} />
        </>
      )}
      {glyphType === 'ether' && <Circle cx={8} cy={8} r={5.5} fill="none" stroke={stroke} strokeWidth={1.4} />}
      {glyphType === 'light' && (
        <>
          <Circle cx={8} cy={8} r={3} fill="none" stroke={stroke} strokeWidth={1.4} />
          {[0, 45, 90, 135].map(angle => (
            <Line key={angle} x1={8} y1={1.5} x2={8} y2={4} stroke={stroke} strokeWidth={1.1} transform={`rotate(${angle} 8 8)`} />
          ))}
        </>
      )}
      {glyphType === 'dark' && (
        <Path d="M10.8 2.2C7 3.2 4.8 6.7 5.8 10.2C6.5 12.7 8.6 14.2 11.2 14C8.5 15.5 4.4 13.9 3.3 10.4C2 6.4 4.4 2.7 10.8 2.2Z" fill="none" stroke={stroke} strokeWidth={1.3} />
      )}
      {glyphType === 'void' && <Rect x={3} y={3} width={10} height={10} fill="none" stroke={stroke} strokeWidth={1.3} />}
    </Svg>
  )
}

const styles = StyleSheet.create({
  corner: {
    position: 'absolute',
  },
  dividerWrap: {
    minHeight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
  },
  rarityFrame: {
    flex: 1,
    borderWidth: 1,
    backgroundColor: theme.colors.background.secondary,
    position: 'relative',
  },
})

const cornerPositionStyles = StyleSheet.create({
  tl: { top: 3, left: 3 },
  tr: { top: 3, right: 3, transform: [{ rotate: '90deg' }] },
  bl: { bottom: 3, left: 3, transform: [{ rotate: '-90deg' }] },
  br: { bottom: 3, right: 3, transform: [{ rotate: '180deg' }] },
})
