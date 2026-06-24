import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { theme } from '@/lib/theme'
import { HeroVisual } from './HeroVisual'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { Hero } from '@/systems/genes/types'
import type { Skill } from '@/systems/skills/types'

const RARITY_LABEL: Record<string, string> = {
  comum: 'Comum', incomum: 'Incomum', raro: 'Raro',
  epico: 'Épico', lendario: 'Lendário', unico: 'Único',
}

function SkillRow({ skill }: { skill: Skill }) {
  return (
    <View style={styles.skillRow}>
      <View style={styles.skillHeader}>
        <Text style={styles.skillName}>{skill.name}</Text>
        {skill.isPassive && <Text style={styles.passiveBadge}>PASSIVA</Text>}
        {skill.isUnique && <Text style={styles.uniqueBadge}>ÚNICA</Text>}
        {skill.isEmergent && <Text style={styles.emergentBadge}>EMERGENTE</Text>}
      </View>
      <Text style={styles.skillDesc}>
        {skill.trigger.label} → {skill.effect.label} (poder {skill.effect.power})
        {skill.modifier ? ` · ${skill.modifier.label}` : ''}
      </Text>
      <Text style={styles.skillCond}>{skill.condition.label}</Text>
    </View>
  )
}

interface HeroDetailProps {
  hero: Hero
}

export function HeroDetail({ hero }: HeroDetailProps) {
  const { attributes } = hero.genome
  const rarityColor = theme.colors.rarity[hero.rarity]
  const allSkills = [
    ...hero.skills.active,
    ...hero.skills.passive,
    ...hero.skills.unique,
    ...hero.skills.emergent,
  ]

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <HeroVisual hero={hero} size="detail" style={{ alignSelf: 'center' }} />
        <Text style={styles.name}>{hero.name}</Text>
        <View style={styles.badgeRow}>
          <Text style={[styles.rarityBadge, { color: rarityColor, borderColor: rarityColor }]}>
            {RARITY_LABEL[hero.rarity]}
          </Text>
          <Text style={styles.essenceBadge}>
            {hero.genome.essence.origin} · {hero.genome.essence.affinity} · {hero.genome.essence.core}
          </Text>
        </View>
        {hero.genome.mutations.length > 0 && (
          <Text style={styles.mutations}>
            Mutações: {hero.genome.mutations.join(', ')}
          </Text>
        )}
      </View>

      {/* Nível e vínculo */}
      <View style={styles.section}>
        <View style={styles.levelBlock}>
          <Text style={styles.sectionLabel}>NÍVEL {hero.level}</Text>
          <ProgressBar value={hero.xp / 1000} type="xp" style={{ marginTop: theme.spacing.xs }} />
        </View>
        <View style={styles.levelBlock}>
          <Text style={styles.sectionLabel}>VÍNCULO {hero.bond}</Text>
        </View>
      </View>

      {/* Atributos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ATRIBUTOS</Text>
        <View style={styles.attrGrid}>
          {Object.entries(attributes).map(([key, val]) => (
            <View key={key} style={styles.attrRow}>
              <Text style={styles.attrLabel}>{key.toUpperCase()}</Text>
              <ProgressBar value={val / 100} type="hp" style={{ flex: 1, marginHorizontal: 8 }} />
              <Text style={styles.attrVal}>{val}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Habilidades */}
      <View style={[styles.section, { marginBottom: theme.spacing.xxl }]}>
        <Text style={styles.sectionTitle}>HABILIDADES</Text>
        {allSkills.map((skill) => <SkillRow key={skill.id} skill={skill} />)}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, minHeight: 0 },
  scrollContent: { paddingBottom: theme.spacing.xxl },
  header: { alignItems: 'center', paddingVertical: theme.spacing.lg, gap: theme.spacing.sm },
  name: {
    ...theme.typography.title,
    fontSize: 22,
    textAlign: 'center',
  },
  badgeRow: { flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  rarityBadge: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    borderWidth: 0.5,
    borderRadius: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  essenceBadge: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 0.5,
  },
  mutations: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 12,
    color: theme.colors.gold.dark,
    fontStyle: 'italic',
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border.subtle,
  },
  sectionTitle: {
    ...theme.typography.label,
    color: theme.colors.gold.main,
    marginBottom: theme.spacing.xs,
  },
  levelBlock: { flex: 1 },
  sectionLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 11,
    color: theme.colors.text.secondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  attrGrid: { gap: 6 },
  attrRow: { flexDirection: 'row', alignItems: 'center' },
  attrLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
    width: 80,
  },
  attrVal: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 14,
    color: theme.colors.text.primary,
    width: 32,
    textAlign: 'right',
  },
  skillRow: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.border.radius.sm,
    padding: theme.spacing.sm,
    gap: 4,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.gold.dark,
  },
  skillHeader: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  skillName: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 14,
    color: theme.colors.text.primary,
    flex: 1,
  },
  passiveBadge: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 8,
    color: theme.colors.blue.ice,
    borderColor: theme.colors.blue.main,
    borderWidth: 0.5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    letterSpacing: 1,
  },
  uniqueBadge: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 8,
    color: theme.colors.gold.light,
    borderColor: theme.colors.gold.main,
    borderWidth: 0.5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    letterSpacing: 1,
  },
  emergentBadge: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 8,
    color: '#E040FB',
    borderColor: '#7B1FA2',
    borderWidth: 0.5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    letterSpacing: 1,
  },
  skillDesc: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 12,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  skillCond: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.gold.dark,
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
})
