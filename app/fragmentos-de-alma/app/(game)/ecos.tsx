import React, { useEffect, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '@/lib/theme'
import { useGameStore } from '@/store/gameStore'
import { EcoDetail } from '@/components/transmutation/EcoDetail'
import { Modal } from '@/components/ui/Modal'
import type { Eco } from '@/systems/genes/eco'
import type { Rarity } from '@/systems/genes/types'

const RARITY_LABELS: Record<Rarity, string> = {
  comum: 'Comum', incomum: 'Incomum', raro: 'Raro',
  epico: 'Épico', lendario: 'Lendário', unico: 'Único',
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

export default function EcosScreen() {
  const { ecos, loadEcos } = useGameStore()
  const [selectedEco, setSelectedEco] = useState<Eco | null>(null)

  useEffect(() => { loadEcos() }, [])

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>ECOS</Text>
        <Text style={styles.counter}>{ecos.length} ecos</Text>
      </View>

      {ecos.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhum Eco criado.</Text>
          <Text style={styles.emptyHint}>Use o Círculo para cristalizar heróis no nível máximo.</Text>
        </View>
      ) : (
        <FlatList
          data={ecos}
          keyExtractor={e => e.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <EcoRow eco={item} onPress={() => setSelectedEco(item)} />
          )}
        />
      )}

      <Modal visible={selectedEco !== null} title="Eco" onClose={() => setSelectedEco(null)} fill>
        {selectedEco && <EcoDetail eco={selectedEco} />}
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background.primary },
  header: {
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
  list: { padding: theme.spacing.lg, gap: theme.spacing.sm },
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
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
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
