import React from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { theme } from '@/lib/theme'
import { useGameStore } from '@/store/gameStore'
import { useWorldStore } from '@/store/worldStore'
import { useBattleStore } from '@/store/battleStore'
import { useTowerStore } from '@/store/towerStore'
import {
  TOWER_ZONES,
  TOWER_MILESTONE_REWARDS,
  TOWER_UNLOCK_TERRITORIES,
  generateTowerFloorEnemies,
  getTowerZone,
} from '@/systems/endgame/towers'
import { TERRITORY_DEFS } from '@/systems/world/mapData'
import { BIOMES } from '@/systems/progression/dungeon'
import { SectionDivider } from '@/components/ui/Ornaments'

const GOLD = theme.colors.gold.main
const GOLD_D = theme.colors.gold.dark

function MilestoneRow({ floor, reward }: { floor: number; reward: string }) {
  return (
    <View style={styles.milestoneRow}>
      <Text style={styles.milestoneFloor}>ANDAR {floor}</Text>
      <Text style={styles.milestoneReward}>{reward}</Text>
    </View>
  )
}

function ZoneCard({ zone }: { zone: typeof TOWER_ZONES[1] }) {
  const colors: Record<number, string> = {
    1: '#7BA7D4',
    2: '#C8960C',
    3: '#C0392B',
    4: '#6A1B9A',
  }
  const color = colors[zone.zone]
  return (
    <View style={[styles.zoneCard, { borderLeftColor: color }]}>
      <View style={styles.zoneHeader}>
        <Text style={[styles.zoneRange, { color }]}>
          {zone.floorStart}–{zone.floorEnd}
        </Text>
        <Text style={[styles.zoneName, { color }]}>{zone.name}</Text>
      </View>
      <Text style={styles.zoneMechanic}>◆ {zone.mechanic}</Text>
      <Text style={styles.zoneDesc}>{zone.mechanicDescription}</Text>
    </View>
  )
}

export default function TowerScreen() {
  const { heroes } = useGameStore()
  const territories = useWorldStore(s => s.territories)
  const { initBattle } = useBattleStore()
  const { session, weeklyBestFloor, allTimeBestFloor, startTower } = useTowerStore()

  // Conta territórios com pelo menos 1 andar de superfície concluído
  const territoriesWithProgress = TERRITORY_DEFS.filter(def => {
    const state = territories[def.id]
    const biome = BIOMES[def.id]
    if (!state || !biome) return false
    return state.playerProgress.surfaceFloors >= 1
  }).length

  const isUnlocked = territoriesWithProgress >= TOWER_UNLOCK_TERRITORIES
  const canStart = heroes.length >= 6 && isUnlocked

  const currentFloor = session?.currentFloor ?? 1
  const currentZone = TOWER_ZONES[getTowerZone(currentFloor)]
  const progressPct = (currentFloor - 1) / 100

  const handleStart = () => {
    if (!canStart) return
    const teamHeroes = heroes.slice(0, 6)
    startTower(teamHeroes)
    const seed = `tower-${Date.now()}`
    const enemies = generateTowerFloorEnemies(currentFloor, seed)
    initBattle(teamHeroes, enemies, seed)
    router.push('/(game)/dungeon/tower-battle' as `/${string}`)
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <Text style={styles.headerBack}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>TORRES DE RESSONÂNCIA</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Progresso pessoal */}
        <View style={styles.recordsRow}>
          <View style={styles.recordItem}>
            <Text style={styles.recordValue}>{weeklyBestFloor || '—'}</Text>
            <Text style={styles.recordLabel}>MELHOR ESTA SEMANA</Text>
          </View>
          <View style={styles.recordDivider} />
          <View style={styles.recordItem}>
            <Text style={styles.recordValue}>{allTimeBestFloor || '—'}</Text>
            <Text style={styles.recordLabel}>RECORDE PESSOAL</Text>
          </View>
          {session && (
            <>
              <View style={styles.recordDivider} />
              <View style={styles.recordItem}>
                <Text style={[styles.recordValue, { color: GOLD }]}>{currentFloor}</Text>
                <Text style={styles.recordLabel}>ANDAR ATUAL</Text>
              </View>
            </>
          )}
        </View>

        {/* Barra de progresso geral da torre */}
        {session && (
          <View style={styles.towerProgress}>
            <View style={styles.towerTrack}>
              <View style={[styles.towerFill, { width: `${progressPct * 100}%` as `${number}%` }]} />
            </View>
            <Text style={styles.towerProgressText}>
              Andar {currentFloor} / 100 — {currentZone.name}
            </Text>
          </View>
        )}

        {/* Zona ativa (se em sessão) */}
        {session && (
          <View style={[styles.activeMechanic, { borderColor: GOLD_D }]}>
            <Text style={styles.activeMechanicLabel}>MECÂNICA ATIVA</Text>
            <Text style={styles.activeMechanicName}>{currentZone.mechanic}</Text>
            <Text style={styles.activeMechanicDesc}>{currentZone.mechanicDescription}</Text>
          </View>
        )}

        {/* Regras especiais */}
        <View style={styles.rulesCard}>
          <Text style={styles.sectionTitle}>REGRAS DA TORRE</Text>
          {[
            'Recuperação de HP entre andares: 15% (não 30%)',
            'Derrota retorna ao início do bloco de 25 andares',
            'Fragmentos coletados são mantidos mesmo em derrota',
            'Sessão salva por 24h se o app for fechado',
            'Ranking semanal: reset toda segunda-feira às 00h UTC',
          ].map((r, i) => (
            <Text key={i} style={styles.ruleItem}>◈ {r}</Text>
          ))}
        </View>

        <SectionDivider />

        {/* Zonas */}
        <Text style={styles.sectionTitle}>ESTRUTURA DA TORRE</Text>
        {([1, 2, 3, 4] as const).map(z => (
          <ZoneCard key={z} zone={TOWER_ZONES[z]} />
        ))}

        <SectionDivider />

        {/* Recompensas por marco */}
        <Text style={styles.sectionTitle}>RECOMPENSAS POR MARCO</Text>
        {Object.entries(TOWER_MILESTONE_REWARDS).map(([floor, reward]) => (
          <MilestoneRow key={floor} floor={Number(floor)} reward={reward} />
        ))}

        {/* Aviso de desbloqueio */}
        {!isUnlocked && (
          <View style={styles.lockCard}>
            <Text style={styles.lockText}>
              🔒 Torre bloqueada.{'\n'}
              Complete pelo menos {TOWER_UNLOCK_TERRITORIES} territórios de Solum para desbloquear.{'\n'}
              Progresso atual: {territoriesWithProgress} / {TOWER_UNLOCK_TERRITORIES}
            </Text>
          </View>
        )}

        {!canStart && isUnlocked && (
          <View style={styles.lockCard}>
            <Text style={styles.lockText}>
              Você precisa de 6 heróis para entrar na torre.
            </Text>
          </View>
        )}

      </ScrollView>

      {/* Botão */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleStart}
          disabled={!canStart}
          style={[styles.btn, !canStart && styles.btnDisabled]}
        >
          <Text style={styles.btnText}>
            {session ? `CONTINUAR — ANDAR ${currentFloor}` : 'ENTRAR NA TORRE'}
          </Text>
        </Pressable>
      </View>
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
    borderBottomColor: GOLD_D,
  },
  headerBack: { color: GOLD, fontSize: 20, minWidth: 32, lineHeight: 32 },
  headerTitle: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 13,
    color: GOLD,
    letterSpacing: 2,
  },

  content: { padding: theme.spacing.lg, gap: theme.spacing.lg, paddingBottom: 32 },

  recordsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 0.5,
    borderColor: GOLD_D,
  },
  recordItem: { flex: 1, alignItems: 'center', padding: theme.spacing.md, gap: 4 },
  recordDivider: { width: 0.5, backgroundColor: theme.colors.border.subtle },
  recordValue: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 24,
    color: theme.colors.text.primary,
  },
  recordLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 8,
    color: theme.colors.text.secondary,
    letterSpacing: 1.5,
    textAlign: 'center',
  },

  towerProgress: { gap: 6 },
  towerTrack: {
    height: 4,
    backgroundColor: theme.colors.background.tertiary,
    overflow: 'hidden',
  },
  towerFill: { height: 4, backgroundColor: GOLD },
  towerProgressText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
    textAlign: 'right',
  },

  activeMechanic: {
    borderWidth: 0.5,
    borderTopWidth: 2,
    padding: theme.spacing.md,
    gap: 6,
    backgroundColor: theme.colors.background.secondary,
  },
  activeMechanicLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 8,
    color: GOLD,
    letterSpacing: 2,
  },
  activeMechanicName: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 14,
    color: GOLD,
    letterSpacing: 1,
  },
  activeMechanicDesc: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 11,
    color: theme.colors.text.secondary,
    lineHeight: 17,
    fontStyle: 'italic',
  },

  rulesCard: {
    padding: theme.spacing.md,
    borderWidth: 0.5,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.background.secondary,
    gap: theme.spacing.xs,
  },
  sectionTitle: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: GOLD,
    letterSpacing: 2,
    marginBottom: 4,
  },
  ruleItem: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 11,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },

  zoneCard: {
    borderLeftWidth: 2,
    paddingLeft: 12,
    paddingVertical: 10,
    gap: 4,
  },
  zoneHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  zoneRange: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  zoneName: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 12,
    letterSpacing: 1,
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

  milestoneRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border.subtle,
    alignItems: 'flex-start',
  },
  milestoneFloor: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: GOLD,
    letterSpacing: 1,
    width: 72,
  },
  milestoneReward: {
    flex: 1,
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 11,
    color: theme.colors.text.secondary,
    lineHeight: 16,
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
    backgroundColor: GOLD_D,
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
})
