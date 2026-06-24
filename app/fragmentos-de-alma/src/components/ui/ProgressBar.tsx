import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { theme } from '@/lib/theme'

type BarType = 'hp' | 'xp' | 'ultimate'

interface ProgressBarProps {
  value: number   // 0–1
  type?: BarType
  style?: ViewStyle
}

export function ProgressBar({ value, type = 'hp', style }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value))
  return (
    <View style={[styles.track, styles[`${type}Track`], style]}>
      <View style={[styles.fill, styles[`${type}Fill`], { flex: clamped }]} />
      <View style={{ flex: 1 - clamped }} />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 1,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  fill: { borderRadius: 1 },

  hpTrack: { height: 6, backgroundColor: '#1A0A0A', borderWidth: 0.5, borderColor: theme.colors.red.dark },
  hpFill: { backgroundColor: theme.colors.red.vivid },

  xpTrack: { height: 3, backgroundColor: theme.colors.background.tertiary },
  xpFill: { backgroundColor: theme.colors.gold.dark },

  ultimateTrack: { height: 4, backgroundColor: '#0A0A1A' },
  ultimateFill: { backgroundColor: theme.colors.blue.main },
})
