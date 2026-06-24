import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, Pressable, Modal as RNModal,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '@/lib/theme'
import { useGameStore, fusionCost } from '@/store/gameStore'
import { useUiStore } from '@/store/uiStore'
import { HeroVisual } from '@/components/hero/HeroVisual'
import { HeroDetail } from '@/components/hero/HeroDetail'
import { Button } from '@/components/ui/Button'
import { AlchemicalCircle } from '@/components/fusion/AlchemicalCircle'
import { CornerBracket } from '@/components/ui/Ornaments'
import { useNarrativeStore } from '@/store/narrativeStore'
import { LoreHint } from '@/components/narrative/LoreHint'
import { fuseGenomes } from '@/systems/genes/fusion'
import { calculateRarity } from '@/systems/genes/rarity'
import { generateVisualParams } from '@/systems/visual/generator'
import { generateName } from '@/utils/nameGenerator'
import { generateSkills } from '@/systems/skills/generator'
import type { Hero } from '@/systems/genes/types'

function HeroSlot({
  label, hero, onPress
}: { label: string; hero: Hero | null; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.slot}>
      {hero ? (
        <>
          <HeroVisual hero={hero} size="slot" style={{ alignSelf: 'center' }} />
          <Text style={styles.slotName} numberOfLines={1}>{hero.name}</Text>
          <Text style={styles.slotRarity} numberOfLines={1}>
            {hero.genome.essence.affinity} · {hero.rarity}
          </Text>
        </>
      ) : (
        <>
          <View style={styles.slotEmpty}>
            <Text style={styles.slotPlus}>+</Text>
          </View>
          <Text style={styles.slotLabel}>{label}</Text>
        </>
      )}
    </Pressable>
  )
}

function SelectorModal({
  visible, heroes, onSelect, onClose, excludeId,
}: {
  visible: boolean; heroes: Hero[]; onSelect: (h: Hero) => void; onClose: () => void; excludeId?: string;
}) {
  const available = heroes.filter(h => h.id !== excludeId)
  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.selectorOverlay}>
        <View style={styles.selectorContainer}>
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <CornerBracket position="tl" />
            <CornerBracket position="tr" />
          </View>
          <View style={styles.selectorHeader}>
            <Text style={styles.selectorTitle}>ESCOLHER ALMA</Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.selectorGrid}>
            {available.map(hero => (
              <Pressable key={hero.id} onPress={() => { onSelect(hero); onClose() }} style={styles.selectorItem}>
                <HeroVisual hero={hero} size="slot" />
                <Text style={styles.selectorName} numberOfLines={1}>{hero.name}</Text>
                <Text style={styles.selectorRarity}>{hero.rarity}</Text>
              </Pressable>
            ))}
            {available.length === 0 && (
              <Text style={styles.selectorEmpty}>Nenhuma alma disponível.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  )
}

export default function FusionScreen() {
  const { heroes, player, commitFusion } = useGameStore()
  const { fusionSlotA, fusionSlotB, setFusionSlot, revelationHero, setRevelationHero, clearFusion } = useUiStore()
  const [selectorSlot, setSelectorSlot] = useState<'A' | 'B' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { hasSeenHint, markHintSeen } = useNarrativeStore()
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    if (!hasSeenHint('fusion-first')) {
      setShowHint(true)
      markHintSeen('fusion-first')
    }
  }, [])

  const canFuse = fusionSlotA !== null && fusionSlotB !== null && fusionSlotA.id !== fusionSlotB.id

  const cost = (fusionSlotA && fusionSlotB)
    ? fusionCost(fusionSlotA.rarity, fusionSlotB.rarity)
    : null
  const canAfford = cost === null || (player?.soulFragments ?? 0) >= cost

  async function handleFuse() {
    if (!fusionSlotA || !fusionSlotB) return
    setLoading(true)
    setError(null)
    try {
      const seed = `${fusionSlotA.fusionSeed}:${fusionSlotB.fusionSeed}:${Date.now()}`
      const { genome } = fuseGenomes({ parentA: fusionSlotA.genome, parentB: fusionSlotB.genome, seed })
      const rarity = calculateRarity(genome)
      const visualParams = generateVisualParams(genome, seed)
      const name = generateName(genome, seed)
      const skills = generateSkills(genome, rarity, seed)
      const generation = Math.max(fusionSlotA.generation, fusionSlotB.generation) + 1

      const result = await commitFusion(fusionSlotA, fusionSlotB, {
        name, fusionSeed: seed, genome, rarity, visualParams, skills, generation,
      })
      if (!result.ok) { setError(result.error); return }
      setRevelationHero(result.hero)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha na fusão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>RITUAL DE FUSÃO</Text>
        <Text style={styles.subtitle}>Dois fragmentos, uma nova alma</Text>
      </View>

      <View style={styles.arena}>
        <HeroSlot label="Fragmento A" hero={fusionSlotA} onPress={() => setSelectorSlot('A')} />
        <AlchemicalCircle active={canFuse} />
        <HeroSlot label="Fragmento B" hero={fusionSlotB} onPress={() => setSelectorSlot('B')} />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.footer}>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>CUSTO:</Text>
          <Text style={[styles.costValue, !canAfford && { color: theme.colors.red.vivid }]}>
            {cost !== null ? `${cost} Fragmentos` : '— Fragmentos'}
            {player ? `  (você tem ${player.soulFragments})` : ''}
          </Text>
        </View>
        <Text style={styles.consumeNote}>
          Os dois fragmentos são consumidos e cristalizados na fusão.
        </Text>
        <Button
          label="Fundir Almas"
          onPress={handleFuse}
          disabled={!canFuse || !canAfford}
          loading={loading}
          style={{ marginTop: theme.spacing.sm }}
        />
        {(fusionSlotA || fusionSlotB) && (
          <Button
            label="Limpar"
            onPress={clearFusion}
            variant="secondary"
            style={{ marginTop: theme.spacing.xs }}
          />
        )}
      </View>

      {/* Selector de heróis */}
      <SelectorModal
        visible={selectorSlot !== null}
        heroes={heroes}
        onSelect={(h) => setFusionSlot(selectorSlot!, h)}
        onClose={() => setSelectorSlot(null)}
        excludeId={selectorSlot === 'A' ? fusionSlotB?.id : fusionSlotA?.id}
      />

      {showHint && (
        <LoreHint
          id="fusion-first"
          text="A fusão não combina — ela cria. O que nasce nunca existiu antes em nenhum lugar de Solum."
          onDismiss={() => setShowHint(false)}
        />
      )}

      {/* Revelação */}
      {revelationHero && (
        <RNModal visible animationType="fade" statusBarTranslucent>
          <SafeAreaView style={styles.revelationRoot}>
            <View style={styles.revelationHeader}>
              <View style={styles.revelationLine} />
              <Text style={styles.revelationLabel}>NOVA ALMA INVOCADA</Text>
              <View style={styles.revelationLine} />
            </View>
            <View style={styles.revelationVisual}>
              <HeroVisual hero={revelationHero} size="detail" />
            </View>
            <Text style={styles.revelationName}>{revelationHero.name}</Text>
            <Text style={styles.revelationRarity}>
              {revelationHero.rarity.toUpperCase()} · Geração {revelationHero.generation}
            </Text>
            <View style={styles.revelationDetail}>
              <HeroDetail hero={revelationHero} />
            </View>
            <Button
              label="Aceitar"
              onPress={() => { setRevelationHero(null); clearFusion() }}
              style={styles.revelationBtn}
            />
          </SafeAreaView>
        </RNModal>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background.primary },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border.subtle,
  },
  title: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 20,
    color: theme.colors.gold.main,
    letterSpacing: 3,
  },
  subtitle: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  arena: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxl,
  },
  slot: {
    width: 100,
    alignItems: 'center',
    gap: theme.spacing.xs,
    minHeight: 120,
    justifyContent: 'center',
  },
  slotEmpty: {
    width: 72,
    height: 72,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderStyle: 'dashed',
    borderRadius: theme.border.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotPlus: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 24,
    color: theme.colors.border.subtle,
  },
  slotLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  slotName: {
    fontFamily: theme.typography.heroName.fontFamily,
    fontSize: 12,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  slotRarity: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border.subtle,
  },
  costRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  costLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  costValue: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 13,
    color: theme.colors.gold.light,
  },
  consumeNote: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  error: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 12,
    color: theme.colors.red.vivid,
    textAlign: 'center',
    marginHorizontal: theme.spacing.lg,
  },
  // Selector
  selectorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  selectorContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderTopLeftRadius: theme.border.radius.md,
    borderTopRightRadius: theme.border.radius.md,
    maxHeight: '75%',
    paddingBottom: 32,
  },
  selectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border.subtle,
  },
  selectorTitle: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 16,
    color: theme.colors.gold.main,
    letterSpacing: 2,
  },
  closeBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  selectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  selectorItem: {
    width: 80,
    alignItems: 'center',
    gap: 4,
  },
  selectorName: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  selectorRarity: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 8,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  selectorEmpty: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 13,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    flex: 1,
    paddingVertical: theme.spacing.xxl,
  },
  // Revelação
  revelationRoot: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  revelationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.lg,
    alignSelf: 'stretch',
  },
  revelationLine: { flex: 1, height: 0.5, backgroundColor: theme.colors.gold.dark },
  revelationLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.gold.main,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  revelationVisual: { marginBottom: theme.spacing.lg },
  revelationName: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 26,
    color: theme.colors.gold.main,
    letterSpacing: 2,
    textAlign: 'center',
  },
  revelationRarity: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 11,
    color: theme.colors.text.secondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: theme.spacing.lg,
  },
  revelationDetail: {
    flex: 1,
    alignSelf: 'stretch',
  },
  revelationBtn: {
    alignSelf: 'stretch',
    marginVertical: theme.spacing.lg,
  },
})
