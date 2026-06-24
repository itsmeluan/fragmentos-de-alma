import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '@/lib/theme'
import { useGameStore } from '@/store/gameStore'
import { useUiStore } from '@/store/uiStore'
import { HeroCard } from '@/components/hero/HeroCard'
import { HeroDetail } from '@/components/hero/HeroDetail'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { RosterManager } from '@/components/transmutation/RosterManager'
import { EcoDetail } from '@/components/transmutation/EcoDetail'
import type { Hero, Rarity } from '@/systems/genes/types'
import type { Eco } from '@/systems/genes/eco'
import { useNarrativeStore } from '@/store/narrativeStore'
import { LoreHint } from '@/components/narrative/LoreHint'

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
  const { heroes, ecos, player, loadHeroes, loadEcos, isLoading } = useGameStore()
  const { selectedHero, setSelectedHero } = useUiStore()
  const [filter, setFilter] = useState<Rarity | 'all'>('all')
  const [activeTab, setActiveTab] = useState<'heroes' | 'ecos'>('heroes')
  const [selectedEco, setSelectedEco] = useState<Eco | null>(null)
  const { hasSeenHint, markHintSeen } = useNarrativeStore()
  const [showHint, setShowHint] = useState(false)
  const [showRoster, setShowRoster] = useState(false)

  useEffect(() => {
    loadHeroes()
    loadEcos()
    if (!hasSeenHint('collection-first')) {
      setShowHint(true)
      markHintSeen('collection-first')
    }
  }, [])

  const filtered = filter === 'all' ? heroes : heroes.filter(h => h.rarity === filter)
  const rosterRole = (hero: Hero): 'team' | 'bench' | undefined => {
    if (player?.teamHeroIds.includes(hero.id)) return 'team'
    if (player?.benchHeroIds.includes(hero.id)) return 'bench'
    return undefined
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>ALMAS</Text>
          <Text style={styles.counter}>
            {activeTab === 'heroes' ? `${heroes.length} heróis` : `${ecos.length} Ecos`}
          </Text>
        </View>
        <Button
          label="Roster"
          variant="secondary"
          onPress={() => setShowRoster(true)}
          style={styles.rosterButton}
        />
      </View>

      <View style={styles.innerTabs}>
        <Pressable
          onPress={() => setActiveTab('heroes')}
          style={[styles.innerTab, activeTab === 'heroes' && styles.innerTabActive]}
        >
          <Text style={[styles.innerTabLabel, activeTab === 'heroes' && styles.innerTabLabelActive]}>Heróis</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('ecos')}
          style={[styles.innerTab, activeTab === 'ecos' && styles.innerTabActive]}
        >
          <Text style={[styles.innerTabLabel, activeTab === 'ecos' && styles.innerTabLabelActive]}>Ecos</Text>
        </Pressable>
      </View>

      {/* Filtros */}
      {activeTab === 'heroes' && (
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
      )}

      {/* Grid */}
      {activeTab === 'heroes' && isLoading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Invocando almas…</Text>
        </View>
      ) : activeTab === 'heroes' && filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhuma alma encontrada.</Text>
          <Text style={styles.emptyHint}>Funda fragmentos para criar seus primeiros heróis.</Text>
        </View>
      ) : activeTab === 'heroes' ? (
        <FlatList
          key="heroes-grid"
          data={filtered}
          keyExtractor={h => h.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <HeroCard hero={item} onPress={setSelectedHero} rosterRole={rosterRole(item)} />
          )}
        />
      ) : ecos.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhum Eco criado.</Text>
          <Text style={styles.emptyHint}>Use o Círculo para cristalizar heróis no nível máximo.</Text>
        </View>
      ) : (
        <FlatList
          key="ecos-list"
          data={ecos}
          keyExtractor={e => e.id}
          contentContainerStyle={styles.ecoList}
          renderItem={({ item }) => (
            <EcoRow eco={item} onPress={() => setSelectedEco(item)} />
          )}
        />
      )}

      {/* Modal de detalhe */}
      <Modal
        visible={selectedHero !== null}
        title={selectedHero?.name}
        onClose={() => setSelectedHero(null)}
        fill
      >
        {selectedHero && <HeroDetail hero={selectedHero} />}
      </Modal>

      <Modal
        visible={selectedEco !== null}
        title="Eco"
        onClose={() => setSelectedEco(null)}
        fill
      >
        {selectedEco && <EcoDetail eco={selectedEco} />}
      </Modal>

      <Modal
        visible={showRoster}
        title="Roster"
        onClose={() => setShowRoster(false)}
      >
        <RosterManager onClose={() => setShowRoster(false)} />
      </Modal>

      {showHint && (
        <LoreHint
          id="collection-first"
          text="Cada fragmento de alma carrega um genoma único. Dois heróis jamais são iguais."
          onDismiss={() => setShowHint(false)}
        />
      )}
    </SafeAreaView>
  )
}

const RARITY_LABELS: Record<Rarity, string> = {
  comum: 'Comum',
  incomum: 'Incomum',
  raro: 'Raro',
  epico: 'Épico',
  lendario: 'Lendário',
  unico: 'Único',
}

function EcoRow({ eco, onPress }: { eco: Eco; onPress: () => void }) {
  const rarityColor = theme.colors.rarity[eco.rarity]
  return (
    <Pressable onPress={onPress} style={[styles.ecoCard, { borderLeftColor: rarityColor }]}>
      <View style={styles.ecoHeader}>
        <Text style={styles.ecoName}>{eco.signature_core} / {eco.signature_affinity}</Text>
        <Text style={[styles.ecoRarity, { color: rarityColor }]}>{RARITY_LABELS[eco.rarity]}</Text>
      </View>
      <Text style={styles.ecoMeta}>
        {eco.signature_origin} · absorções {eco.absorption_count} · genes {Object.keys(eco.best_genes).length}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginTop: 2,
  },
  rosterButton: {
    minWidth: 96,
    paddingHorizontal: theme.spacing.md,
  },
  innerTabs: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border.subtle,
  },
  innerTab: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.background.secondary,
  },
  innerTabActive: {
    borderColor: theme.colors.gold.main,
    backgroundColor: theme.colors.gold.dark + '26',
  },
  innerTabLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 11,
    color: theme.colors.text.secondary,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  innerTabLabelActive: { color: theme.colors.gold.main },
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
  ecoList: { padding: theme.spacing.lg, gap: theme.spacing.sm },
  ecoCard: {
    minHeight: 82,
    justifyContent: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderLeftWidth: 2,
    borderWidth: 0.5,
    borderColor: theme.colors.border.subtle,
  },
  ecoHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.sm },
  ecoName: {
    fontFamily: theme.typography.heroName.fontFamily,
    fontSize: 15,
    color: theme.colors.text.primary,
    flex: 1,
  },
  ecoRarity: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  ecoMeta: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 4,
  },
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
