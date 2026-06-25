import React, { useEffect, useRef } from 'react'
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { HeroVisual } from '@/components/hero/HeroVisual'
import { theme } from '@/lib/theme'
import type { Hero } from '@/systems/genes/types'
import type { Skill } from '@/systems/skills/types'

const RARITY_LABELS: Record<string, string> = {
  comum: 'Comum',
  incomum: 'Incomum',
  raro: 'Raro',
  epico: 'Épico',
  lendario: 'Lendário',
  unico: 'Único',
}

const ATTR_LABELS: Record<string, string> = {
  forca: 'FOR',
  ressonancia: 'RES',
  resistencia: 'DEF',
  agilidade: 'AGI',
  vontade: 'VON',
  aura: 'AUR',
}

function SkillChip({ skill, rarityColor }: { skill: Skill; rarityColor: string }) {
  return (
    <View style={[styles.skillChip, { borderLeftColor: rarityColor }]}>
      <View style={styles.skillHeader}>
        <Text style={styles.skillName}>{skill.name}</Text>
        {skill.isPassive && <Text style={[styles.skillBadge, { color: theme.colors.blue.ice, borderColor: theme.colors.blue.main }]}>PASSIVA</Text>}
        {skill.isUnique && <Text style={[styles.skillBadge, { color: theme.colors.gold.light, borderColor: theme.colors.gold.main }]}>ÚNICA</Text>}
        {skill.isEmergent && <Text style={[styles.skillBadge, { color: '#E040FB', borderColor: '#7B1FA2' }]}>EMERGENTE</Text>}
      </View>
      <Text style={styles.skillDesc}>
        {skill.trigger.label} → {skill.effect.label}
      </Text>
      <Text style={[styles.skillPower, { color: rarityColor }]}>poder {skill.effect.power}</Text>
    </View>
  )
}

interface HeroRevealProps {
  hero: Hero
  onClose: () => void
}

export function HeroReveal({ hero, onClose }: HeroRevealProps) {
  const rarityColor = theme.colors.rarity[hero.rarity]
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(32)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 480,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start()
  }, [fadeAnim, slideAnim])

  const allSkills = [
    ...hero.skills.active,
    ...hero.skills.passive,
    ...hero.skills.unique,
    ...hero.skills.emergent,
  ]

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      bounces
    >
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Visual com borda de raridade */}
        <View style={styles.visualSection}>
          <View style={[styles.visualWrap, { borderColor: rarityColor, shadowColor: rarityColor }]}>
            <HeroVisual hero={hero} size="detail" style={styles.visual} />
            <View style={[styles.rarityGlow, { backgroundColor: rarityColor + '18' }]} />
          </View>

          {/* Raridade */}
          <View style={[styles.rarityBadge, { borderColor: rarityColor, backgroundColor: rarityColor + '22' }]}>
            <Text style={[styles.rarityText, { color: rarityColor }]}>
              {RARITY_LABELS[hero.rarity].toUpperCase()}
            </Text>
          </View>

          {/* Nome */}
          <Text style={styles.name}>{hero.name}</Text>

          {/* Essência */}
          <Text style={styles.essence}>
            {hero.genome.essence.origin} · {hero.genome.essence.affinity} · {hero.genome.essence.core}
          </Text>
        </View>

        {/* Atributos */}
        <View style={styles.section}>
          <View style={[styles.sectionLine, { backgroundColor: rarityColor }]} />
          <Text style={styles.sectionTitle}>ATRIBUTOS</Text>
          <View style={styles.attrGrid}>
            {Object.entries(hero.genome.attributes).map(([key, val]) => (
              <View key={key} style={styles.attrCell}>
                <Text style={[styles.attrVal, { color: rarityColor }]}>{val}</Text>
                <Text style={styles.attrLabel}>{ATTR_LABELS[key] ?? key.slice(0, 3).toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Habilidades */}
        <View style={styles.section}>
          <View style={[styles.sectionLine, { backgroundColor: rarityColor }]} />
          <Text style={styles.sectionTitle}>HABILIDADES</Text>
          {allSkills.map((skill) => (
            <SkillChip key={skill.id} skill={skill} rarityColor={rarityColor} />
          ))}
        </View>

        <Button
          label="Adicionar à coleção"
          onPress={onClose}
          style={styles.closeButton}
        />
      </Animated.View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  visualSection: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  visualWrap: {
    marginTop: theme.spacing.lg,
    borderWidth: 2,
    borderRadius: 4,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 12,
  },
  visual: {
    width: 200,
    height: 200,
  },
  rarityGlow: {
    ...StyleSheet.absoluteFill,
    pointerEvents: 'none',
  },
  rarityBadge: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderRadius: 2,
  },
  rarityText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 13,
    letterSpacing: 3,
  },
  name: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 26,
    color: theme.colors.text.primary,
    letterSpacing: 2,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  essence: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 11,
    color: theme.colors.text.secondary,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  sectionLine: {
    height: 1,
    opacity: 0.4,
    marginBottom: 2,
  },
  sectionTitle: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  attrGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  attrCell: {
    flex: 1,
    minWidth: '28%',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: 2,
  },
  attrVal: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 22,
    letterSpacing: 0.5,
  },
  attrLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  skillChip: {
    width: '100%',
    backgroundColor: theme.colors.background.tertiary,
    borderLeftWidth: 2,
    padding: theme.spacing.sm,
    gap: 3,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  skillName: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 13,
    color: theme.colors.text.primary,
    flex: 1,
  },
  skillBadge: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 8,
    borderWidth: 0.5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    letterSpacing: 0.8,
  },
  skillDesc: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 12,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  skillPower: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    letterSpacing: 1,
  },
  closeButton: {
    width: '100%',
    marginTop: theme.spacing.sm,
  },
})
