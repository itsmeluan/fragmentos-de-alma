import React, { useEffect, useState } from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { theme } from '@/lib/theme'
import { useDungeonStore, useDungeonProgress } from '@/store/dungeonStore'
import { useBattleStore } from '@/store/battleStore'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { computeHpMax } from '@/systems/battle/engine'
import { isBiomeComplete, BATTLES_PER_FLOOR } from '@/systems/progression/dungeon'

export default function BetweenBattlesScreen() {
  const { session, heroes, applyHpRecovery, nextEnemies, exitDungeon } = useDungeonStore()
  const { initBattle } = useBattleStore()
  const progress = useDungeonProgress()
  const [recoveryApplied, setRecoveryApplied] = useState(false)

  // Aplica recuperação de HP ao entrar na tela
  useEffect(() => {
    if (!recoveryApplied && session) {
      applyHpRecovery()
      setRecoveryApplied(true)
    }
  }, [session, recoveryApplied, applyHpRecovery])

  const handleContinue = () => {
    if (!session || heroes.length < 6) return
    const enemies = nextEnemies()
    const seed = `${session.biome}-f${session.currentFloor}-b${session.battleIndexInFloor}-${Date.now()}`
    initBattle(heroes, enemies, seed)
    router.replace('/(game)/dungeon/battle')
  }

  const handleExit = () => {
    Alert.alert(
      'Sair da Dungeon',
      'Seu progresso neste andar será perdido. Deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => { exitDungeon(); router.replace('/(game)') } },
      ]
    )
  }

  if (!session || !progress) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Sem sessão ativa.</Text>
          <Pressable onPress={() => router.replace('/(game)')} style={styles.btn}>
            <Text style={styles.btnText}>VOLTAR</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const isFloorComplete = session.battleIndexInFloor === 0 && session.totalBattlesWon > 0
  const biomeComplete = isBiomeComplete(session)

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Cabeçalho */}
        <View style={styles.header}>
          {biomeComplete ? (
            <>
              <Text style={styles.victoryTitle}>BIOMA CONCLUÍDO</Text>
              <Text style={styles.subtitle}>{progress.config.label}</Text>
            </>
          ) : isFloorComplete ? (
            <>
              <Text style={styles.floorTitle}>ANDAR {session.currentFloor - 1} CONCLUÍDO</Text>
              <Text style={styles.subtitle}>{progress.config.label} · Andar {session.currentFloor}</Text>
            </>
          ) : (
            <>
              <Text style={styles.floorTitle}>BATALHA VENCIDA</Text>
              <Text style={styles.subtitle}>
                {progress.config.label} · Andar {session.currentFloor} · {progress.floorProgress}
              </Text>
            </>
          )}
        </View>

        {/* Progresso do bioma */}
        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>PROGRESSO DO BIOMA</Text>
          <ProgressBar value={progress.overallProgress} type="xp" style={styles.progressBar} />
          <Text style={styles.progressText}>
            {session.totalBattlesWon} / {progress.config.floors * BATTLES_PER_FLOOR} batalhas
          </Text>
        </View>

        {/* Recuperação de HP (+30%) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>RECUPERAÇÃO DE HP (+30%)</Text>
          <View style={styles.heroList}>
            {heroes.slice(0, 6).map(h => {
              const maxHp = computeHpMax(h.genome, h.level)
              const currentHp = session.heroHpSnapshot[h.id] ?? maxHp
              return (
                <View key={h.id} style={styles.heroRow}>
                  <View style={styles.heroInfo}>
                    <Text style={[styles.heroName, { color: theme.colors.rarity[h.rarity] }]}>
                      {h.name}
                    </Text>
                    <Text style={styles.heroHpText}>{currentHp}/{maxHp}</Text>
                  </View>
                  <ProgressBar
                    value={currentHp / maxHp}
                    type="hp"
                    style={styles.heroHpBar}
                  />
                </View>
              )
            })}
          </View>
        </View>

        {/* Loot completo */}
        {!session.fullLoot && (
          <View style={styles.warnCard}>
            <Text style={styles.warnText}>
              ⚠ Tentativas com loot completo esgotadas hoje.{'\n'}
              Você ainda pode explorar, mas receberá apenas fragmentos comuns.
            </Text>
          </View>
        )}

        {/* Próxima batalha */}
        {!biomeComplete && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PRÓXIMA BATALHA</Text>
            <Text style={styles.nextBattleText}>
              {isFloorComplete
                ? `Andar ${session.currentFloor} — novo grupo de inimigos`
                : `Andar ${session.currentFloor} · Batalha ${session.battleIndexInFloor + 1} de ${BATTLES_PER_FLOOR}`}
            </Text>
          </View>
        )}

      </ScrollView>

      {/* Ações */}
      <View style={styles.footer}>
        {biomeComplete ? (
          <Pressable
            onPress={() => { exitDungeon(); router.replace('/(game)') }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>CONCLUIR EXPLORAÇÃO</Text>
          </Pressable>
        ) : (
          <>
            <Pressable onPress={handleContinue} style={styles.btn}>
              <Text style={styles.btnText}>CONTINUAR</Text>
            </Pressable>
            <Pressable onPress={handleExit} style={styles.btnSecondary}>
              <Text style={styles.btnSecondaryText}>Sair da dungeon</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.lg },

  content: { padding: theme.spacing.lg, gap: theme.spacing.lg },

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
    color: theme.colors.gold.main,
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
  heroInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  heroName: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 12,
    flex: 1,
  },
  heroHpText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    letterSpacing: 0.5,
  },
  heroHpBar: { width: '100%' },

  warnCard: {
    padding: theme.spacing.md,
    borderWidth: 0.5,
    borderColor: theme.colors.red.blood,
    backgroundColor: theme.colors.red.dark + '22',
  },
  warnText: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 12,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },

  nextBattleText: {
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
  emptyText: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
})
