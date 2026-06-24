import React, { useEffect, useState } from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { theme } from '@/lib/theme'
import { useTowerStore } from '@/store/towerStore'
import { useBattleStore } from '@/store/battleStore'
import { useGameStore } from '@/store/gameStore'
import {
  getTowerZone,
  TOWER_ZONES,
  TOWER_BOSS_FLOORS,
  TOWER_MILESTONE_REWARDS,
  TOWER_CHALLENGE_FLOORS,
  HP_RECOVERY_TOWER,
  generateTowerFloorEnemies,
  isTowerComplete,
  getAmplifiedAffinity,
} from '@/systems/endgame/towers'
import { computeHpMax } from '@/systems/battle/engine'
import { ProgressBar } from '@/components/ui/ProgressBar'

const ZONE_COLORS: Record<number, string> = {
  1: '#7BA7D4',
  2: '#C8960C',
  3: '#C0392B',
  4: '#6A1B9A',
}

export default function TowerBetweenScreen() {
  const { session, heroes, applyHpRecovery, exitTower } = useTowerStore()
  const { initBattle } = useBattleStore()
  const [recoveryApplied, setRecoveryApplied] = useState(false)

  useEffect(() => {
    if (!recoveryApplied && session) {
      applyHpRecovery()
      setRecoveryApplied(true)
    }
  }, [session, recoveryApplied])

  if (!session) {
    return (
      <SafeAreaView style={styles.root}>
        <Pressable onPress={() => router.replace('/(game)/dungeon/tower' as `/${string}`)} style={styles.btn}>
          <Text style={styles.btnText}>VOLTAR À TORRE</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  const clearedFloor = session.currentFloor - 1
  const currentFloor = session.currentFloor
  const zone = getTowerZone(currentFloor)
  const zoneInfo = TOWER_ZONES[zone]
  const zoneColor = ZONE_COLORS[zone]
  const overallProgress = clearedFloor / 100

  const isComplete = isTowerComplete(currentFloor)
  const isChallenge = TOWER_BOSS_FLOORS.has(currentFloor)
  const milestoneReached = TOWER_MILESTONE_REWARDS[clearedFloor]
  const amplifiedAffinity = getAmplifiedAffinity(currentFloor)

  const handleContinue = () => {
    if (!session) return
    const seed = `tower-f${currentFloor}-${Date.now()}`
    const enemies = generateTowerFloorEnemies(currentFloor, seed)
    initBattle(heroes, enemies, seed)
    router.replace('/(game)/dungeon/tower-battle' as `/${string}`)
  }

  const handleExit = () => {
    Alert.alert(
      'Sair da Torre',
      `Seu progresso está salvo no andar ${clearedFloor}. Você pode retornar quando quiser.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          onPress: () => {
            exitTower()
            router.replace('/(game)')
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Cabeçalho */}
        <View style={styles.header}>
          {isComplete ? (
            <>
              <Text style={styles.victoryTitle}>TORRE CONCLUÍDA</Text>
              <Text style={styles.subtitle}>Você alcançou o andar 100. Lendário.</Text>
            </>
          ) : (
            <>
              <Text style={[styles.floorTitle, { color: zoneColor }]}>
                ANDAR {clearedFloor} CONCLUÍDO
              </Text>
              <Text style={styles.subtitle}>
                {zoneInfo.name} · Próximo: Andar {currentFloor}
                {isChallenge && ' ⚔ CHEFE'}
              </Text>
            </>
          )}
        </View>

        {/* Recompensa de marco */}
        {milestoneReached && (
          <View style={[styles.milestoneCard, { borderColor: theme.colors.gold.main }]}>
            <Text style={styles.milestoneLabel}>MARCO ATINGIDO — ANDAR {clearedFloor}</Text>
            <Text style={styles.milestoneReward}>{milestoneReached}</Text>
          </View>
        )}

        {/* Progresso geral */}
        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>PROGRESSO DA TORRE</Text>
          <ProgressBar value={overallProgress} type="xp" style={styles.progressBar} />
          <Text style={styles.progressText}>{clearedFloor} / 100 andares</Text>
        </View>

        {/* Zona e mecânica */}
        <View style={[styles.zoneCard, { borderLeftColor: zoneColor }]}>
          <Text style={[styles.zoneName, { color: zoneColor }]}>{zoneInfo.name}</Text>
          <Text style={styles.zoneMechanic}>◆ {zoneInfo.mechanic}</Text>
          <Text style={styles.zoneDesc}>{zoneInfo.mechanicDescription}</Text>
          {amplifiedAffinity && (
            <Text style={[styles.amplified, { color: zoneColor }]}>
              ⚡ Afinidade amplificada esta fase: {amplifiedAffinity}
            </Text>
          )}
        </View>

        {/* HP dos heróis (após recuperação de 15%) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>RECUPERAÇÃO DE HP (+{HP_RECOVERY_TOWER * 100}%)</Text>
          <View style={styles.heroList}>
            {heroes.slice(0, 6).map(h => {
              const maxHp = computeHpMax(h.genome, h.level)
              const currentHp = session.heroHpSnapshot[h.id] === -1
                ? maxHp
                : (session.heroHpSnapshot[h.id] ?? maxHp)
              const isDead = currentHp <= 0
              return (
                <View key={h.id} style={styles.heroRow}>
                  <View style={styles.heroInfo}>
                    <Text style={[
                      styles.heroName,
                      { color: isDead ? theme.colors.text.secondary : theme.colors.rarity[h.rarity] }
                    ]}>
                      {h.name}{isDead ? ' (fora de combate)' : ''}
                    </Text>
                    <Text style={styles.heroHpText}>{Math.max(0, currentHp)}/{maxHp}</Text>
                  </View>
                  <ProgressBar
                    value={isDead ? 0 : currentHp / maxHp}
                    type="hp"
                    style={styles.heroHpBar}
                  />
                </View>
              )
            })}
          </View>
        </View>

        {/* Info do próximo andar */}
        {!isComplete && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PRÓXIMO ANDAR</Text>
            <Text style={styles.nextInfo}>
              {TOWER_BOSS_FLOORS.has(currentFloor)
                ? `Andar ${currentFloor} — Chefe de Zona`
                : TOWER_CHALLENGE_FLOORS.has(currentFloor)
                ? `Andar ${currentFloor} — Mini-chefe`
                : `Andar ${currentFloor} — Inimigos da ${zoneInfo.name}`}
            </Text>
          </View>
        )}

      </ScrollView>

      {/* Ações */}
      <View style={styles.footer}>
        {isComplete ? (
          <Pressable onPress={() => { exitTower(); router.replace('/(game)') }} style={styles.btn}>
            <Text style={styles.btnText}>CONCLUIR</Text>
          </Pressable>
        ) : (
          <>
            <Pressable onPress={handleContinue} style={[styles.btn, { backgroundColor: zoneColor + 'CC' }]}>
              <Text style={styles.btnText}>PRÓXIMO ANDAR</Text>
            </Pressable>
            <Pressable onPress={handleExit} style={styles.btnSecondary}>
              <Text style={styles.btnSecondaryText}>Salvar e sair</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background.primary },
  content: { padding: theme.spacing.lg, gap: theme.spacing.lg, paddingBottom: 24 },

  header: { alignItems: 'center', paddingVertical: theme.spacing.lg },
  victoryTitle: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 22,
    color: theme.colors.gold.light,
    letterSpacing: 3,
    textAlign: 'center',
  },
  floorTitle: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 18,
    letterSpacing: 3,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 2,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },

  milestoneCard: {
    padding: theme.spacing.md,
    borderWidth: 1,
    backgroundColor: theme.colors.gold.dark + '22',
    gap: 4,
  },
  milestoneLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.gold.main,
    letterSpacing: 2,
  },
  milestoneReward: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 13,
    color: theme.colors.text.primary,
  },

  progressCard: {
    padding: theme.spacing.md,
    borderWidth: 0.5,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.background.secondary,
    gap: theme.spacing.sm,
  },
  progressLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    letterSpacing: 2,
  },
  progressBar: { width: '100%' },
  progressText: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'right',
  },

  zoneCard: {
    borderLeftWidth: 2,
    paddingLeft: 12,
    paddingVertical: 10,
    gap: 4,
  },
  zoneName: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 13,
    letterSpacing: 1.5,
  },
  zoneMechanic: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    letterSpacing: 1.5,
  },
  zoneDesc: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 11,
    color: theme.colors.text.secondary,
    lineHeight: 16,
  },
  amplified: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 11,
    letterSpacing: 0.5,
    marginTop: 4,
  },

  section: { gap: theme.spacing.sm },
  sectionLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    letterSpacing: 2,
  },

  heroList: {
    gap: theme.spacing.xs,
    borderWidth: 0.5,
    borderColor: theme.colors.border.subtle,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
  },
  heroRow: { gap: 4 },
  heroInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  heroName: { fontFamily: theme.typography.stat.fontFamily, fontSize: 12, flex: 1 },
  heroHpText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    letterSpacing: 0.5,
  },
  heroHpBar: { width: '100%' },

  nextInfo: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 13,
    color: theme.colors.text.primary,
    lineHeight: 20,
  },

  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border.subtle,
    gap: theme.spacing.sm,
  },
  btn: {
    backgroundColor: theme.colors.gold.dark,
    padding: theme.spacing.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 13,
    color: theme.colors.text.primary,
    letterSpacing: 3,
  },
  btnSecondary: {
    padding: theme.spacing.sm,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  btnSecondaryText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
  },
})
