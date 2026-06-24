import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { theme } from '@/lib/theme'
import { HeroVisual } from './HeroVisual'
import { RarityFrame, AlchemyGlyph } from '@/components/ui/Ornaments'
import type { Hero } from '@/systems/genes/types'

const RARITY_LABEL: Record<string, string> = {
  comum: 'Comum', incomum: 'Incomum', raro: 'Raro',
  epico: 'Épico', lendario: 'Lendário', unico: 'Único',
}

interface HeroCardProps {
  hero: Hero
  onPress: (hero: Hero) => void
}

export function HeroCard({ hero, onPress }: HeroCardProps) {
  const rarityColor = theme.colors.rarity[hero.rarity]
  return (
    <RarityFrame rarity={hero.rarity}>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync().catch(() => {})
          onPress(hero)
        }}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={styles.visualWrap}>
          <HeroVisual hero={hero} size="card" style={{ width: '100%', height: 110, borderRadius: 0, borderWidth: 0 }} />
          {/* Glifo de afinidade — canto superior direito */}
          <View style={styles.affinityBadge}>
            <AlchemyGlyph type={hero.genome.essence.affinity} size={18} />
          </View>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{hero.name}</Text>
          <View style={styles.meta}>
            <Text style={[styles.rarity, { color: rarityColor }]}>{RARITY_LABEL[hero.rarity]}</Text>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>Nv.</Text>
              <Text style={styles.level}>{hero.level}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </RarityFrame>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 0,
    borderRadius: 0,
    overflow: 'hidden',
    minHeight: 48,
  },
  pressed: { opacity: 0.85 },
  visualWrap: { position: 'relative' },
  affinityBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    backgroundColor: theme.colors.background.primary + 'CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { padding: theme.spacing.sm, gap: 3 },
  name: {
    fontFamily: theme.typography.heroName.fontFamily,
    fontSize: 13,
    color: theme.colors.text.primary,
    letterSpacing: 0.5,
  },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rarity: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  levelRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  levelLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  level: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 14,
    color: theme.colors.gold.main,
  },
})
