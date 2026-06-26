import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { theme } from '@/lib/theme'
import type { Eco } from '@/systems/genes/eco'
import { ECO_LEGACY_WEIGHT } from '@/systems/genes/eco'
import type { Rarity } from '@/systems/genes/types'

const RARITY_LABELS: Record<Rarity, string> = {
  comum: 'Comum',
  incomum: 'Incomum',
  raro: 'Raro',
  epico: 'Épico',
  lendario: 'Lendário',
  unico: 'Único',
}

interface EcoDetailProps {
  eco: Eco
}

export function EcoDetail({ eco }: EcoDetailProps) {
  const rarityColor = theme.colors.rarity[eco.rarity]
  const skills = Object.entries(eco.best_skills)

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.symbol}>◇</Text>
        <Text style={styles.title}>
          {eco.signature_core} / {eco.signature_affinity}
        </Text>
        <Text style={[styles.rarity, { color: rarityColor, borderColor: rarityColor }]}>
          {RARITY_LABELS[eco.rarity]}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ASSINATURA</Text>
        <Text style={styles.line}>Origem: {eco.signature_origin}</Text>
        <Text style={styles.line}>Afinidade: {eco.signature_affinity}</Text>
        <Text style={styles.line}>Classe: {eco.signature_core}</Text>
        <Text style={styles.line}>
          Mutações: {eco.signature_mutations.length > 0 ? eco.signature_mutations.join(', ') : 'nenhuma'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LEGADO</Text>
        <Text style={styles.line}>Absorções: {eco.absorption_count}</Text>
        <Text style={styles.line}>Peso no Score: {ECO_LEGACY_WEIGHT[eco.rarity]}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MELHORES GENES</Text>
        {Object.entries(eco.best_genes).map(([key, value]) => (
          <View key={key} style={styles.geneRow}>
            <Text style={styles.geneLabel}>{key.toUpperCase()}</Text>
            <Text style={styles.geneValue}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MELHORES HABILIDADES</Text>
        {skills.length === 0 ? (
          <Text style={styles.muted}>Nenhuma habilidade absorvida.</Text>
        ) : (
          skills.map(([slot, skill]) => (
            <View key={slot} style={styles.skillRow}>
              <Text style={styles.skillName}>{slot}: {skill.name}</Text>
              <Text style={styles.skillDesc}>
                {skill.trigger.label} → {skill.effect.label} (poder {skill.effect.power})
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, minHeight: 0 },
  content: { paddingBottom: theme.spacing.xxl, gap: theme.spacing.lg },
  header: { alignItems: 'center', gap: theme.spacing.sm },
  symbol: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 42,
    color: theme.colors.gold.main,
  },
  title: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 20,
    color: theme.colors.text.primary,
    letterSpacing: 1,
    textAlign: 'center',
  },
  rarity: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    borderWidth: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  section: {
    paddingTop: theme.spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border.subtle,
    gap: theme.spacing.xs,
  },
  sectionTitle: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 11,
    color: theme.colors.gold.main,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  line: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.text.primary,
  },
  muted: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  geneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 32,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border.subtle,
  },
  geneLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
  },
  geneValue: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 16,
    color: theme.colors.gold.light,
  },
  skillRow: {
    backgroundColor: theme.colors.background.tertiary,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.gold.dark,
    padding: theme.spacing.sm,
    gap: 3,
  },
  skillName: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  skillDesc: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 12,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
})
