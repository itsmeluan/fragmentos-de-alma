import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { theme } from '@/lib/theme'
import { useGameStore } from '@/store/gameStore'
import { useBattleStore } from '@/store/battleStore'
import { useDungeonStore } from '@/store/dungeonStore'
import { useWorldStore } from '@/store/worldStore'
import { BIOMES, isBiomeUnlocked, isTerritoryBiome } from '@/systems/progression/dungeon'
import type { BiomeId } from '@/systems/progression/dungeon'
import { getTerritoryDef } from '@/systems/world/mapData'
import type { TerritoryId } from '@/systems/world/types'
import { ProgressBar } from '@/components/ui/ProgressBar'

export default function BiomeDungeonScreen() {
  const { biomeId } = useLocalSearchParams<{ biomeId: string }>()
  const { heroes } = useGameStore()
  const { initBattle } = useBattleStore()
  const { startDungeon, currentEnemies } = useDungeonStore()
  const territories = useWorldStore(s => s.territories)

  const id = biomeId as BiomeId
  const config = BIOMES[id]
  const isTerritory = isTerritoryBiome(id)
  const territoryDef = isTerritory ? getTerritoryDef(id as TerritoryId) : null
  const territoryState = isTerritory ? territories[id as TerritoryId] : null
  const factionColor = territoryDef?.color ?? theme.colors.gold.main

  const canStart = heroes.length >= 6

  const unlockProgress = {
    fusionCount: heroes.length,
    highestRarityOwned: heroes.reduce((best, h) => {
      const rarityOrder = ['comum', 'incomum', 'raro', 'epico', 'lendario', 'unico']
      return rarityOrder.indexOf(h.rarity) > rarityOrder.indexOf(best) ? h.rarity : best
    }, 'comum'),
    legacyEcos: 0,
  }
  const unlocked = config ? isBiomeUnlocked(id, unlockProgress) : false

  const handleStart = () => {
    if (!canStart || !unlocked || !config) return
    startDungeon(id, heroes.slice(0, 6))
    const enemies = currentEnemies.length > 0 ? currentEnemies : []
    // Se enemies ainda não gerados (startDungeon gera internamente), busca do store após update
    setTimeout(() => {
      const { currentEnemies: generated, heroes: storeHeroes } = useDungeonStore.getState()
      const seed = `${id}-f1-b0-${Date.now()}`
      initBattle(storeHeroes, generated, seed)
      router.push('/(game)/dungeon/battle')
    }, 0)
  }

  if (!config) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Bioma não encontrado: {biomeId}</Text>
          <Pressable onPress={() => router.back()} style={styles.btn}>
            <Text style={styles.btnText}>VOLTAR</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, isTerritory && { borderBottomColor: factionColor + '55' }]}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <Text style={styles.headerBack}>←</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.biomeTitle, isTerritory && { color: factionColor }]}>
            {config.label.toUpperCase()}
          </Text>
          {territoryDef && (
            <Text style={[styles.headerFaction, { color: factionColor + 'BB' }]}>
              {territoryDef.affinityLabel.toUpperCase()}
            </Text>
          )}
        </View>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        {/* Reputação com a facção (território) */}
        {isTerritory && territoryState && (
          <View style={[styles.reputationCard, { borderColor: factionColor + '55' }]}>
            <Text style={[styles.reputationLabel, { color: factionColor }]}>
              REPUTAÇÃO COM {territoryDef?.factionLabel.toUpperCase()}
            </Text>
            <View style={styles.reputationBarTrack}>
              <View style={[
                styles.reputationBarFill,
                {
                  width: `${Math.max(0, (territoryState.factionReputation + 100) / 2)}%` as `${number}%`,
                  backgroundColor: territoryState.factionReputation >= 0 ? factionColor : theme.colors.red.vivid,
                },
              ]} />
              <View style={styles.reputationCenter} />
            </View>
            <Text style={[styles.reputationValue, {
              color: territoryState.factionReputation >= 0 ? factionColor : theme.colors.red.vivid,
            }]}>
              {territoryState.factionReputation > 0 ? '+' : ''}{territoryState.factionReputation}
              {' · '}
              {territoryState.factionReputation >= 50 ? 'Aliado'
                : territoryState.factionReputation >= 20 ? 'Amigável'
                : territoryState.factionReputation <= -50 ? 'Inimigo'
                : territoryState.factionReputation <= -20 ? 'Hostil'
                : 'Neutro'}
            </Text>
          </View>
        )}

        {/* Info do bioma */}
        <View style={styles.infoCard}>
          <Text style={styles.infoRow}>
            <Text style={styles.infoKey}>Andares  </Text>
            <Text style={styles.infoVal}>{config.floors}</Text>
          </Text>
          <Text style={styles.infoRow}>
            <Text style={styles.infoKey}>Batalhas por andar  </Text>
            <Text style={styles.infoVal}>3</Text>
          </Text>
          <Text style={styles.infoRow}>
            <Text style={styles.infoKey}>Padrões de IA  </Text>
            <Text style={styles.infoVal}>{config.aiPatterns.slice(0, 3).join(' · ')}</Text>
          </Text>
          {territoryDef && (
            <Text style={styles.loreText}>{territoryDef.lore}</Text>
          )}
        </View>

        {/* Modificadores de bioma */}
        {(Object.keys(config.attrBoost).length > 0 || Object.keys(config.attrPenalty).length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CORRUPÇÃO DE BIOMA</Text>
            {Object.entries(config.attrBoost).map(([attr, val]) => (
              <Text key={attr} style={styles.boostText}>▲ {attr} +{val}</Text>
            ))}
            {Object.entries(config.attrPenalty).map(([attr, val]) => (
              <Text key={attr} style={styles.penaltyText}>▼ {attr} −{val}</Text>
            ))}
          </View>
        )}

        {/* Condições bônus */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CONDIÇÕES BÔNUS</Text>
          {[
            'Vencer sem perder heróis → +50% fragmentos',
            'Vencer sem Ultimate → +1 Cristal',
            'Vencer em <5 turnos → Fragmento de Gene',
          ].map((b, i) => (
            <Text key={i} style={styles.bonusItem}>◆ {b}</Text>
          ))}
        </View>

        {/* Aviso de desbloqueio */}
        {!unlocked && (
          <View style={styles.lockCard}>
            <Text style={styles.lockText}>
              🔒 Bioma bloqueado.{'\n'}
              {config.unlockCondition.type === 'fusions' && `Realize ${config.unlockCondition.min} fusões para desbloquear.`}
              {config.unlockCondition.type === 'rarity' && `Crie um herói ${config.unlockCondition.rarity} para desbloquear.`}
              {config.unlockCondition.type === 'legacyEcos' && `Acumule ${config.unlockCondition.min} Ecos de Legado para desbloquear.`}
            </Text>
          </View>
        )}

        {/* Aviso de heróis insuficientes */}
        {!canStart && (
          <View style={styles.lockCard}>
            <Text style={styles.lockText}>
              Você precisa de 6 heróis para entrar na dungeon.
              {'\n'}Funda mais almas na tela de Fusão.
            </Text>
          </View>
        )}
      </View>

      {/* Botão */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleStart}
          disabled={!canStart || !unlocked}
          style={[styles.btn, (!canStart || !unlocked) && styles.btnDisabled]}
        >
          <Text style={styles.btnText}>ENTRAR NA DUNGEON</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.lg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border.subtle,
  },
  headerBack: { color: theme.colors.gold.main, fontSize: 20, minWidth: 32, minHeight: 32, lineHeight: 32 },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  biomeTitle: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 13,
    color: theme.colors.gold.main,
    letterSpacing: 2,
    textAlign: 'center',
  },
  headerFaction: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 8,
    letterSpacing: 2,
    textAlign: 'center',
  },

  reputationCard: {
    padding: theme.spacing.md,
    borderWidth: 0.5,
    backgroundColor: theme.colors.background.secondary,
    gap: theme.spacing.xs,
  },
  reputationLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 8,
    letterSpacing: 2,
  },
  reputationBarTrack: {
    height: 4,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  reputationBarFill: { height: 4, borderRadius: 2 },
  reputationCenter: {
    position: 'absolute',
    left: '50%',
    top: 0,
    width: 1,
    height: 4,
    backgroundColor: theme.colors.border.subtle,
  },
  reputationValue: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 11,
    letterSpacing: 0.5,
    textAlign: 'right',
  },

  loreText: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 11,
    color: theme.colors.text.secondary,
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border.subtle,
    paddingTop: theme.spacing.sm,
  },

  content: { flex: 1, padding: theme.spacing.lg, gap: theme.spacing.lg },

  infoCard: {
    padding: theme.spacing.md,
    borderWidth: 0.5,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.background.secondary,
    gap: theme.spacing.xs,
  },
  infoRow: { fontFamily: theme.typography.body.fontFamily, fontSize: 13, color: theme.colors.text.secondary },
  infoKey: { color: theme.colors.text.secondary },
  infoVal: { color: theme.colors.text.primary, fontFamily: theme.typography.stat.fontFamily },

  section: { gap: theme.spacing.xs },
  sectionLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    letterSpacing: 2,
  },
  boostText: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 12,
    color: '#4CAF50',
  },
  penaltyText: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 12,
    color: theme.colors.red.vivid,
  },
  bonusItem: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 12,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },

  lockCard: {
    padding: theme.spacing.md,
    borderWidth: 0.5,
    borderColor: theme.colors.red.blood,
    backgroundColor: theme.colors.red.dark + '22',
  },
  lockText: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 13,
    color: theme.colors.text.primary,
    lineHeight: 20,
  },

  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border.subtle,
  },
  btn: {
    backgroundColor: theme.colors.gold.dark,
    padding: theme.spacing.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  btnDisabled: { backgroundColor: theme.colors.background.tertiary, opacity: 0.5 },
  btnText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 13,
    color: theme.colors.text.primary,
    letterSpacing: 3,
  },
  emptyText: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
})
