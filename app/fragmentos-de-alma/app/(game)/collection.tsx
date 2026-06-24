import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '@/lib/theme'
import { useGameStore } from '@/store/gameStore'
import { useUiStore } from '@/store/uiStore'
import { HeroCard } from '@/components/hero/HeroCard'
import { HeroDetail } from '@/components/hero/HeroDetail'
import { Modal } from '@/components/ui/Modal'
import type { Hero, Rarity } from '@/systems/genes/types'

const RARITY_FILTERS: { label: string; value: Rarity | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Comum', value: 'comum' },
  { label: 'Incomum', value: 'incomum' },
  { label: 'Raro', value: 'raro' },
  { label: 'Épico', value: 'epico' },
  { label: 'Lendário', value: 'lendario' },
  { label: 'Único', value: 'unico' },
]

import { Pressable, ScrollView } from 'react-native'

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </Pressable>
  )
}

export default function CollectionScreen() {
  const { heroes, loadHeroes, isLoading } = useGameStore()
  const { selectedHero, setSelectedHero } = useUiStore()
  const [filter, setFilter] = useState<Rarity | 'all'>('all')

  useEffect(() => { loadHeroes() }, [])

  const filtered = filter === 'all' ? heroes : heroes.filter(h => h.rarity === filter)

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>ALMAS</Text>
        <Text style={styles.counter}>{heroes.length} fragmentos</Text>
      </View>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {RARITY_FILTERS.map(f => (
          <FilterChip
            key={f.value}
            label={f.label}
            active={filter === f.value}
            onPress={() => setFilter(f.value)}
          />
        ))}
      </ScrollView>

      {/* Grid */}
      {isLoading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Invocando almas…</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhuma alma encontrada.</Text>
          <Text style={styles.emptyHint}>Funda fragmentos para criar seus primeiros heróis.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={h => h.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <HeroCard hero={item} onPress={setSelectedHero} />
          )}
        />
      )}

      {/* Modal de detalhe */}
      <Modal
        visible={selectedHero !== null}
        title={selectedHero?.name}
        onClose={() => setSelectedHero(null)}
      >
        {selectedHero && <HeroDetail hero={selectedHero} />}
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border.subtle,
  },
  title: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 22,
    color: theme.colors.gold.main,
    letterSpacing: 3,
  },
  counter: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
  },
  filterBar: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border.subtle,
    maxHeight: 52,
  },
  filterContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.border.radius.sm,
    borderWidth: 0.5,
    borderColor: theme.colors.border.subtle,
    minHeight: 48,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: theme.colors.gold.dark + '33',
    borderColor: theme.colors.gold.main,
  },
  chipLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chipLabelActive: { color: theme.colors.gold.main },
  grid: { padding: theme.spacing.sm, gap: theme.spacing.sm },
  row: { gap: theme.spacing.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xxl, gap: theme.spacing.sm },
  emptyText: {
    fontFamily: theme.typography.heroName.fontFamily,
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  emptyHint: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 13,
    color: theme.colors.text.secondary + '99',
    textAlign: 'center',
    fontStyle: 'italic',
  },
})
