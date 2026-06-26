import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated, FlatList, Pressable,
  StyleSheet, Text, View, useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '@/lib/theme'
import { useGameStore } from '@/store/gameStore'
import { useUiStore } from '@/store/uiStore'
import { HeroCard } from '@/components/hero/HeroCard'
import { HeroDetail } from '@/components/hero/HeroDetail'
import { Modal } from '@/components/ui/Modal'
import { RosterManager } from '@/components/transmutation/RosterManager'
import { useNarrativeStore } from '@/store/narrativeStore'
import { LoreHint } from '@/components/narrative/LoreHint'
import type { Hero, Rarity } from '@/systems/genes/types'

type SortKey = 'raridade' | 'nivel' | 'afinidade' | 'classe'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'raridade', label: 'Raridade' },
  { key: 'nivel',    label: 'Nível' },
  { key: 'afinidade', label: 'Afinidade' },
  { key: 'classe',   label: 'Classe' },
]

const RARITY_ORDER: Record<Rarity, number> = {
  unico: 6, lendario: 5, epico: 4, raro: 3, incomum: 2, comum: 1,
}

function sortHeroes(heroes: Hero[], key: SortKey): Hero[] {
  return [...heroes].sort((a, b) => {
    switch (key) {
      case 'raridade': return RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity]
      case 'nivel':    return b.level - a.level
      case 'afinidade': return a.genome.essence.affinity.localeCompare(b.genome.essence.affinity, 'pt')
      case 'classe':   return a.genome.essence.core.localeCompare(b.genome.essence.core, 'pt')
    }
  })
}

export default function HeroesScreen() {
  const { width: screenWidth } = useWindowDimensions()
  const cardWidth = Math.floor((screenWidth - 16 - 16) / 3)

  const { heroes, player, loadHeroes, isLoading } = useGameStore()
  const { selectedHero, setSelectedHero } = useUiStore()
  const { hasSeenHint, markHintSeen } = useNarrativeStore()

  const [sortBy, setSortBy] = useState<SortKey>('raridade')
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [headerBottom, setHeaderBottom] = useState(100)
  const [showRoster, setShowRoster] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const dropdownAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    loadHeroes()
    if (!hasSeenHint('collection-first')) {
      setShowHint(true)
      markHintSeen('collection-first')
    }
  }, [])

  const sorted = useMemo(() => sortHeroes(heroes, sortBy), [heroes, sortBy])

  const rosterRole = (hero: Hero): 'team' | 'bench' | undefined => {
    if (player?.teamHeroIds.includes(hero.id)) return 'team'
    if (player?.benchHeroIds.includes(hero.id)) return 'bench'
    return undefined
  }

  const openDropdown = () => {
    setDropdownVisible(true)
    dropdownAnim.setValue(0)
    Animated.spring(dropdownAnim, {
      toValue: 1,
      tension: 300,
      friction: 25,
      useNativeDriver: true,
    }).start()
  }

  const closeDropdown = () => {
    Animated.timing(dropdownAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => setDropdownVisible(false))
  }

  const selectSort = (key: SortKey) => {
    setSortBy(key)
    closeDropdown()
  }

  const dropdownAnimStyle = {
    opacity: dropdownAnim,
    transform: [{
      translateY: dropdownAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }),
    }],
  }

  const currentLabel = SORT_OPTIONS.find(o => o.key === sortBy)?.label ?? 'Raridade'

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header — sempre visível, nunca escurecido */}
      <View
        style={styles.header}
        onLayout={e => setHeaderBottom(e.nativeEvent.layout.y + e.nativeEvent.layout.height)}
      >
        <View>
          <Text style={styles.title}>HERÓIS</Text>
          <Text style={styles.counter}>{heroes.length} almas</Text>
        </View>
        <Pressable onPress={dropdownVisible ? closeDropdown : openDropdown} hitSlop={12}>
          <Text style={styles.sortBtn}>
            ordenar por{' '}
            <Text style={styles.sortValue}>{currentLabel.toLowerCase()}</Text>
          </Text>
        </Pressable>
      </View>

      {/* Grid */}
      {isLoading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Invocando almas…</Text>
        </View>
      ) : sorted.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhuma alma encontrada.</Text>
          <Text style={styles.emptyHint}>Funda fragmentos para criar seus primeiros heróis.</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={h => h.id}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <HeroCard
              hero={item}
              onPress={setSelectedHero}
              rosterRole={rosterRole(item)}
              width={cardWidth}
            />
          )}
        />
      )}

      {/* Botão flutuante "Time" */}
      <Pressable style={styles.timeBtn} onPress={() => setShowRoster(true)}>
        <Text style={styles.timeBtnText}>Time</Text>
      </Pressable>

      {/* Overlay escuro + opções de ordenação (renderizados acima do conteúdo) */}
      {dropdownVisible && (
        <>
          {/* Overlay que começa abaixo do header, não escurece o cabeçalho */}
          <Pressable
            style={[styles.dimOverlay, { top: headerBottom }]}
            onPress={closeDropdown}
          />

          {/* Opções — só texto, sem fundo, sem borda, alinhadas à direita */}
          <Animated.View style={[styles.optionsContainer, { top: headerBottom }, dropdownAnimStyle]}>
            {SORT_OPTIONS.map(opt => (
              <Pressable
                key={opt.key}
                style={styles.optionItem}
                onPress={() => selectSort(opt.key)}
              >
                <Text style={[styles.optionLabel, sortBy === opt.key && styles.optionLabelActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </Animated.View>
        </>
      )}

      {/* Modals de detalhe */}
      <Modal
        visible={selectedHero !== null}
        title={selectedHero?.name}
        onClose={() => setSelectedHero(null)}
        fill
      >
        {selectedHero && <HeroDetail hero={selectedHero} />}
      </Modal>

      <Modal visible={showRoster} title="Time" onClose={() => setShowRoster(false)}>
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
    zIndex: 1,
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
  sortBtn: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 11,
    color: theme.colors.text.secondary,
    letterSpacing: 0.3,
  },
  sortValue: {
    color: theme.colors.gold.main,
    fontFamily: 'Rajdhani_700Bold',
  },
  grid: { paddingTop: 8, paddingHorizontal: 8, gap: 8, paddingBottom: 100 },
  row: { gap: 8 },
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
  timeBtn: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 100,
    backgroundColor: theme.colors.gold.main,
    zIndex: 1,
  },
  timeBtnText: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 13,
    color: theme.colors.background.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dimOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.84)',
    zIndex: 10,
  },
  optionsContainer: {
    position: 'absolute',
    right: theme.spacing.lg,
    alignItems: 'flex-end',
    paddingTop: 8,
    zIndex: 11,
  },
  optionItem: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  optionLabel: {
    fontFamily: 'Rajdhani_500Medium',
    fontSize: 15,
    color: theme.colors.text.secondary,
    letterSpacing: 0.5,
  },
  optionLabelActive: {
    color: theme.colors.gold.main,
    fontFamily: 'Rajdhani_700Bold',
  },
})
