import React from 'react'
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { theme } from '@/lib/theme'
import { useGameStore } from '@/store/gameStore'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

function StatBlock({ value, label }: { value: number | string; label: string }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

export default function ProfileScreen() {
  const { player, heroes } = useGameStore()

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            router.replace('/(auth)/login')
          } catch (e) {
            Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao sair.')
          }
        },
      },
    ])
  }

  const xpProgress = player ? (player.kaelXp % 1000) / 1000 : 0
  const winRate = player && player.totalBattles > 0
    ? Math.round((player.totalWins / player.totalBattles) * 100)
    : 0

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarGlyph}>◈</Text>
        </View>
        <Text style={styles.kaelName}>{player?.kaelName ?? '—'}</Text>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>NÍVEL</Text>
          <Text style={styles.level}>{player?.kaelLevel ?? 1}</Text>
        </View>
        <View style={styles.xpBar}>
          <ProgressBar value={xpProgress} type="xp" />
          <Text style={styles.xpText}>{player?.kaelXp ?? 0} XP</Text>
        </View>
      </View>

      {/* Recursos */}
      <View style={styles.resources}>
        <View style={styles.resourceItem}>
          <Text style={styles.resourceValue}>{(player?.soulFragments ?? 0).toLocaleString('pt-BR')}</Text>
          <Text style={styles.resourceLabel}>Fragmentos de Alma</Text>
        </View>
        <View style={[styles.resourceItem, styles.resourceDivider]}>
          <Text style={styles.resourceValue}>{(player?.essenceCrystals ?? 0).toLocaleString('pt-BR')}</Text>
          <Text style={styles.resourceLabel}>Cristais</Text>
        </View>
        <View style={styles.resourceItem}>
          <Text style={styles.resourceValue}>{(player?.echoes ?? 0).toLocaleString('pt-BR')}</Text>
          <Text style={styles.resourceLabel}>Ecos</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>HISTÓRICO</Text>
        <View style={styles.statsGrid}>
          <StatBlock value={heroes.length} label="Almas" />
          <StatBlock value={player?.totalFusions ?? 0} label="Fusões" />
          <StatBlock value={player?.totalBattles ?? 0} label="Batalhas" />
          <StatBlock value={`${winRate}%`} label="Vitórias" />
        </View>
      </View>

      {/* Biomas */}
      <View style={styles.biomesSection}>
        <Text style={styles.sectionTitle}>BIOMAS DESBLOQUEADOS</Text>
        <View style={styles.biomesList}>
          {(player?.unlockedBiomes ?? ['genesis']).map(b => (
            <View key={b} style={styles.biomeTag}>
              <Text style={styles.biomeTagText}>{b}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Encerrar Sessão" onPress={handleLogout} variant="danger" />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background.primary },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border.subtle,
    gap: theme.spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: theme.colors.gold.dark,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlyph: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 32,
    color: theme.colors.gold.main,
  },
  kaelName: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 22,
    color: theme.colors.gold.main,
    letterSpacing: 2,
  },
  levelRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  levelLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  level: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 20,
    color: theme.colors.text.primary,
  },
  xpBar: { width: 180, gap: 4 },
  xpText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
    textAlign: 'right',
  },
  resources: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.secondary,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border.subtle,
  },
  resourceItem: { flex: 1, alignItems: 'center', paddingVertical: theme.spacing.lg },
  resourceDivider: {
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: theme.colors.border.subtle,
  },
  resourceValue: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 18,
    color: theme.colors.gold.main,
  },
  resourceLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 2,
  },
  statsSection: { padding: theme.spacing.lg, gap: theme.spacing.sm },
  sectionTitle: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.gold.main,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  statsGrid: { flexDirection: 'row' },
  statBlock: { flex: 1, alignItems: 'center', paddingVertical: theme.spacing.sm },
  statValue: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 22,
    color: theme.colors.text.primary,
  },
  statLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 2,
  },
  biomesSection: { paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm },
  biomesList: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  biomeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.border.radius.sm,
  },
  biomeTagText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
  },
  footer: {
    marginTop: 'auto',
    padding: theme.spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border.subtle,
  },
})
