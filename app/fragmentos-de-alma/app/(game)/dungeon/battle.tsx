import React, { useEffect, useCallback, useRef } from 'react'
import {
  View, Text, Pressable, StyleSheet, ScrollView, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { theme } from '@/lib/theme'
import { useBattleStore } from '@/store/battleStore'
import { useGameStore } from '@/store/gameStore'
import { useDungeonStore } from '@/store/dungeonStore'
import { chooseEnemyAction } from '@/systems/battle/ai'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { isActiveSlot, isEnemySlot, isBenchSlot } from '@/systems/battle/types'
import type { Combatant } from '@/systems/battle/types'
import type { Skill } from '@/systems/skills/types'

// ─── Cores de afinidade (doc 02) ─────────────────────────────────────────────

const AFFINITY_COLORS: Record<string, string> = {
  Fogo: '#C0392B', Água: '#2E5FA3', Terra: '#5D4037',
  Ar: '#80DEEA', Éter: '#7B1FA2', Vazio: '#37474F',
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function EnemySlotView({ combatant, onPress, targeted }: {
  combatant: Combatant
  onPress?: () => void
  targeted?: boolean
}) {
  const affColor = AFFINITY_COLORS[combatant.genome.essence.affinity] ?? theme.colors.border.subtle
  return (
    <Pressable
      onPress={onPress}
      style={[styles.enemySlot, targeted && styles.enemySlotTargeted, { borderColor: affColor }]}
    >
      {/* Placeholder visual de inimigo */}
      <View style={[styles.enemyGlyph, { backgroundColor: affColor + '33' }]}>
        <Text style={[styles.enemyGlyphText, { color: affColor }]}>
          {combatant.name.charAt(0)}
        </Text>
      </View>
      <Text style={styles.enemyName} numberOfLines={1}>{combatant.name}</Text>
      <ProgressBar value={combatant.currentHp / combatant.maxHp} type="hp" style={styles.enemyHpBar} />
      <Text style={styles.enemyHpText}>{combatant.currentHp}/{combatant.maxHp}</Text>
    </Pressable>
  )
}

function HeroSlotView({ combatant, isSelected, isCurrent, onPress, onLongPress }: {
  combatant: Combatant
  isSelected: boolean
  isCurrent: boolean
  onPress: () => void
  onLongPress: () => void
}) {
  const rarityColor = theme.colors.rarity[combatant.rarity] ?? theme.colors.border.subtle
  const ultReady = combatant.ultimateCharge >= 100

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.heroSlot,
        isSelected && styles.heroSlotSelected,
        isCurrent && styles.heroSlotCurrent,
        { borderColor: rarityColor },
      ]}
    >
      {/* Posição */}
      <Text style={styles.heroPosition}>
        {combatant.slot === 'front' ? 'F' : combatant.slot === 'center' ? 'C' : 'B'}
      </Text>

      {/* Avatar */}
      <View style={[styles.heroGlyph, ultReady && styles.heroGlyphUlt]}>
        <Text style={[styles.heroGlyphText, { color: rarityColor }]}>
          {combatant.name.charAt(0)}
        </Text>
      </View>

      <Text style={styles.heroName} numberOfLines={1}>{combatant.name}</Text>

      {/* HP */}
      <ProgressBar value={combatant.currentHp / combatant.maxHp} type="hp" style={styles.heroHpBar} />

      {/* Ultimate */}
      <ProgressBar value={combatant.ultimateCharge / 100} type="ultimate" style={styles.heroUltBar} />

      {ultReady && <Text style={styles.ultReadyBadge}>ULT</Text>}
    </Pressable>
  )
}

function BenchSlotView({ combatant, onPress, swapMode }: {
  combatant: Combatant
  onPress: () => void
  swapMode: boolean
}) {
  const rarityColor = theme.colors.rarity[combatant.rarity] ?? theme.colors.border.subtle
  return (
    <Pressable
      onPress={onPress}
      style={[styles.benchSlot, swapMode && styles.benchSlotSwap, { borderColor: rarityColor + '88' }]}
    >
      <Text style={[styles.benchGlyphText, { color: rarityColor }]}>{combatant.name.charAt(0)}</Text>
      <ProgressBar value={combatant.currentHp / combatant.maxHp} type="hp" style={styles.benchHpBar} />
    </Pressable>
  )
}

function ActionWheel({ skills, onSkill, onDefend, onSwap, onClose }: {
  skills: Skill[]
  onSkill: (skill: Skill) => void
  onDefend: () => void
  onSwap: () => void
  onClose: () => void
}) {
  return (
    <View style={styles.wheelContainer}>
      <Pressable style={styles.wheelBackdrop} onPress={onClose} />
      <View style={styles.wheelPanel}>
        {skills.slice(0, 3).map(skill => (
          <Pressable key={skill.id} style={styles.wheelBtn} onPress={() => onSkill(skill)}>
            <Text style={styles.wheelBtnLabel} numberOfLines={2}>{skill.name}</Text>
            <Text style={styles.wheelBtnSub}>{skill.effect.id} · {skill.condition.id}</Text>
          </Pressable>
        ))}
        <View style={styles.wheelRow}>
          <Pressable style={[styles.wheelBtn, styles.wheelBtnSecondary]} onPress={onDefend}>
            <Text style={styles.wheelBtnLabel}>Defender</Text>
          </Pressable>
          <Pressable style={[styles.wheelBtn, styles.wheelBtnSecondary]} onPress={onSwap}>
            <Text style={styles.wheelBtnLabel}>Trocar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

function BattleLog({ events }: { events: Array<{ label: string; type: string }> }) {
  const scrollRef = useRef<ScrollView>(null)
  useEffect(() => { scrollRef.current?.scrollToEnd({ animated: true }) }, [events])

  return (
    <ScrollView ref={scrollRef} style={styles.log} contentContainerStyle={styles.logContent}>
      {events.slice(-12).map((ev, i) => (
        <Text key={i} style={styles.logLine}>{ev.label}</Text>
      ))}
    </ScrollView>
  )
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function BattleScreen() {
  const {
    battleState, uiPhase, selectedHeroId, pendingSkillId,
    selectHero, closeWheel, beginTargeting, cancelTargeting,
    confirmSkill, confirmDefend, confirmUltimate, beginSwap,
    confirmSwap, applyEnemyAction, clearBattle,
  } = useBattleStore()
  const { recordVictory, recordDefeat } = useDungeonStore()
  const { grantDungeonDrop } = useGameStore()

  // Processar turno de inimigo automaticamente após o estado mudar
  useEffect(() => {
    if (!battleState || battleState.phase !== 'active' || uiPhase !== 'idle') return

    const actorId = battleState.turnOrder[battleState.currentTurnIndex]
    const actor = battleState.combatants[actorId]
    if (!actor?.isEnemy) {
      useBattleStore.setState({ uiPhase: 'player_selecting' })
      return
    }

    const timer = setTimeout(() => {
      const rng = () => Math.random()
      const action = chooseEnemyAction(battleState, actorId, rng)
      applyEnemyAction(action)
    }, 600)
    return () => clearTimeout(timer)
  }, [battleState, uiPhase, applyEnemyAction])

  // Fim de batalha — integra com dungeonStore
  useEffect(() => {
    if (!battleState) return
    if (battleState.phase === 'victory') {
      setTimeout(() => {
        // Persiste HPs pós-batalha no dungeonStore
        const snapshot: Record<string, { currentHp: number; maxHp: number; isAlive: boolean }> = {}
        for (const [id, c] of Object.entries(battleState.combatants)) {
          if (!c.isEnemy) snapshot[id] = { currentHp: c.currentHp, maxHp: c.maxHp, isAlive: c.isAlive }
        }
        recordVictory(snapshot)

        // Drop de fragmento ao limpar um andar: recordVictory já avançou a
        // sessão; battleIndexInFloor === 0 indica andar concluído. Reabastece a
        // coleção, fechando o loop já que a fusão consome os pais.
        const after = useDungeonStore.getState().session
        if (after && after.battleIndexInFloor === 0) {
          grantDungeonDrop(after.biome)
        }

        clearBattle()
        router.replace('/(game)/dungeon/between')
      }, 400)
    }
    if (battleState.phase === 'defeat') {
      setTimeout(() => {
        recordDefeat()
        Alert.alert('Derrota', 'Seus heróis foram derrotados.', [
          { text: 'Sair', onPress: () => { clearBattle(); router.replace('/(game)') } },
        ])
      }, 400)
    }
  }, [battleState?.phase, clearBattle, recordVictory, recordDefeat, grantDungeonDrop])

  if (!battleState) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Sem batalha ativa.</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>VOLTAR</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const combatants = Object.values(battleState.combatants)
  const enemies = combatants.filter(c => c.isAlive && isEnemySlot(c.slot))
  const activeHeroes = combatants.filter(c => isActiveSlot(c.slot)).sort((a, b) => {
    const order = ['front', 'center', 'back']
    return order.indexOf(a.slot) - order.indexOf(b.slot)
  })
  const benchHeroes = combatants.filter(c => isBenchSlot(c.slot)).sort((a, b) => {
    const order = ['bench_a', 'bench_b', 'bench_c']
    return order.indexOf(a.slot) - order.indexOf(b.slot)
  })

  const currentActorId = battleState.turnOrder[battleState.currentTurnIndex]
  const selectedCombatant = selectedHeroId ? battleState.combatants[selectedHeroId] : null
  const activeSkills = selectedCombatant?.skills.active ?? []

  // Determina se habilidade precisa de alvo ou não
  const handleSkillPress = useCallback((skill: Skill) => {
    const noTargetEffects = ['E06', 'E07', 'E10']  // buffs/invocações sem alvo inimigo direto
    const allyTargetEffects = ['E03', 'E04', 'E06', 'E10']
    if (allyTargetEffects.includes(skill.effect.id)) {
      beginTargeting(skill.id, 'ally')
    } else if (noTargetEffects.includes(skill.effect.id)) {
      // Auto-target: usa o ator como alvo
      if (selectedHeroId) confirmSkill(skill.id, selectedHeroId)
    } else {
      beginTargeting(skill.id, 'enemy')
    }
  }, [selectedHeroId, beginTargeting, confirmSkill])

  const handleEnemyPress = useCallback((enemyId: string) => {
    if (uiPhase === 'targeting_enemy' && pendingSkillId && selectedHeroId) {
      confirmSkill(pendingSkillId, enemyId)
    }
  }, [uiPhase, pendingSkillId, selectedHeroId, confirmSkill])

  const handleAllyPress = useCallback((heroId: string) => {
    if (uiPhase === 'targeting_ally' && pendingSkillId && selectedHeroId) {
      confirmSkill(pendingSkillId, heroId)
    }
  }, [uiPhase, pendingSkillId, selectedHeroId, confirmSkill])

  const handleHeroLongPress = useCallback((heroId: string) => {
    const hero = battleState.combatants[heroId]
    if (hero?.ultimateCharge >= 100) {
      useBattleStore.setState({ selectedHeroId: heroId })
      confirmUltimate()
    }
  }, [battleState, confirmUltimate])

  const isTargetingEnemy = uiPhase === 'targeting_enemy'
  const isSwapping = uiPhase === 'swapping'

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <Text style={styles.headerBack}>✕</Text>
        </Pressable>
        <Text style={styles.headerTurn}>Turno {battleState.turnNumber}</Text>
        <Text style={styles.headerPhase}>{uiPhase}</Text>
      </View>

      {/* Área de inimigos */}
      <View style={styles.enemyArea}>
        <View style={styles.enemyRow}>
          {enemies.map(e => (
            <EnemySlotView
              key={e.id}
              combatant={e}
              targeted={isTargetingEnemy}
              onPress={() => handleEnemyPress(e.id)}
            />
          ))}
        </View>
        {isTargetingEnemy && (
          <Text style={styles.targetingHint}>Toque no inimigo para atacar</Text>
        )}
      </View>

      {/* Log de batalha */}
      <BattleLog events={battleState.log} />

      {/* Separador */}
      <View style={styles.separator} />

      {/* Heróis ativos */}
      <View style={styles.activeRow}>
        {activeHeroes.map(h => (
          <HeroSlotView
            key={h.id}
            combatant={h}
            isSelected={selectedHeroId === h.id}
            isCurrent={currentActorId === h.id}
            onPress={() => {
              if (uiPhase === 'targeting_ally') { handleAllyPress(h.id); return }
              if (h.isAlive && !h.isEnemy) selectHero(h.id)
            }}
            onLongPress={() => handleHeroLongPress(h.id)}
          />
        ))}
      </View>

      {/* Banco */}
      <View style={styles.benchRow}>
        {benchHeroes.map(h => (
          <BenchSlotView
            key={h.id}
            combatant={h}
            swapMode={isSwapping}
            onPress={() => { if (isSwapping) confirmSwap(h.id) }}
          />
        ))}
      </View>

      {/* Roda de ações */}
      {uiPhase === 'action_wheel' && selectedCombatant && (
        <ActionWheel
          skills={activeSkills}
          onSkill={handleSkillPress}
          onDefend={() => confirmDefend()}
          onSwap={() => beginSwap()}
          onClose={closeWheel}
        />
      )}

      {/* Hint de troca */}
      {isSwapping && (
        <View style={styles.swapHint}>
          <Text style={styles.targetingHint}>Escolha um herói do banco</Text>
          <Pressable onPress={closeWheel}>
            <Text style={styles.cancelBtn}>Cancelar</Text>
          </Pressable>
        </View>
      )}

      {/* Inimigo agindo */}
      {uiPhase === 'enemy_turn' && (
        <View style={styles.enemyTurnOverlay} pointerEvents="none">
          <Text style={styles.enemyTurnText}>Inimigo agindo…</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background.primary },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border.subtle,
  },
  headerBack: { color: theme.colors.text.secondary, fontSize: 18, minWidth: 32, minHeight: 32, textAlign: 'center', lineHeight: 32 },
  headerTurn: { fontFamily: theme.typography.stat.fontFamily, fontSize: 14, color: theme.colors.gold.main, letterSpacing: 2 },
  headerPhase: { fontFamily: theme.typography.label.fontFamily, fontSize: 10, color: theme.colors.text.secondary, letterSpacing: 1 },

  enemyArea: { flex: 3, justifyContent: 'center', paddingHorizontal: theme.spacing.md },
  enemyRow: { flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.sm, flexWrap: 'wrap' },

  enemySlot: {
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderRadius: theme.border.radius.sm,
    backgroundColor: theme.colors.background.secondary,
    minWidth: 80,
    minHeight: 100,
  },
  enemySlotTargeted: { borderWidth: 2, borderColor: theme.colors.red.vivid },
  enemyGlyph: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  enemyGlyphText: { fontFamily: theme.typography.title.fontFamily, fontSize: 22 },
  enemyName: { fontFamily: theme.typography.label.fontFamily, fontSize: 9, color: theme.colors.text.secondary, letterSpacing: 1, textAlign: 'center' },
  enemyHpBar: { width: '100%', marginTop: theme.spacing.xs },
  enemyHpText: { fontFamily: theme.typography.label.fontFamily, fontSize: 8, color: theme.colors.text.secondary, marginTop: 2 },

  log: { maxHeight: 80, backgroundColor: theme.colors.background.tertiary },
  logContent: { paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, gap: 2 },
  logLine: { fontFamily: theme.typography.body.fontFamily, fontSize: 10, color: theme.colors.text.secondary, lineHeight: 14 },

  separator: { height: 1, backgroundColor: theme.colors.gold.dark + '44', marginHorizontal: theme.spacing.md },

  activeRow: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },

  heroSlot: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.xs,
    marginHorizontal: 3,
    borderWidth: 1,
    borderRadius: theme.border.radius.sm,
    backgroundColor: theme.colors.background.secondary,
    minHeight: 48,
    position: 'relative',
  },
  heroSlotSelected: { borderWidth: 2, backgroundColor: theme.colors.background.tertiary },
  heroSlotCurrent: { backgroundColor: '#1A1A2E' },
  heroPosition: {
    position: 'absolute',
    top: 3, left: 5,
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 8,
    color: theme.colors.text.secondary,
  },
  heroGlyph: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  heroGlyphUlt: { borderWidth: 1, borderColor: theme.colors.blue.ice },
  heroGlyphText: { fontFamily: theme.typography.title.fontFamily, fontSize: 16 },
  heroName: { fontFamily: theme.typography.label.fontFamily, fontSize: 8, color: theme.colors.text.primary, letterSpacing: 0.5, marginTop: 2, textAlign: 'center' },
  heroHpBar: { width: '100%', marginTop: 3 },
  heroUltBar: { width: '100%', marginTop: 2 },
  ultReadyBadge: {
    position: 'absolute',
    top: 3, right: 5,
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 7,
    color: theme.colors.blue.ice,
    letterSpacing: 0.5,
  },

  benchRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border.subtle,
  },
  benchSlot: {
    alignItems: 'center',
    padding: theme.spacing.xs,
    borderWidth: 0.5,
    borderRadius: theme.border.radius.sm,
    backgroundColor: theme.colors.background.secondary,
    minWidth: 60,
    minHeight: 48,
    flex: 1,
    marginHorizontal: 4,
  },
  benchSlotSwap: { borderWidth: 2, borderColor: theme.colors.gold.main },
  benchGlyphText: { fontFamily: theme.typography.stat.fontFamily, fontSize: 18 },
  benchHpBar: { width: '100%', marginTop: 4 },

  // Roda de ações
  wheelContainer: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end' },
  wheelBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: '#00000066' },
  wheelPanel: {
    backgroundColor: theme.colors.background.tertiary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gold.dark,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  wheelBtn: {
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 0.5,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.border.radius.sm,
    padding: theme.spacing.sm,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  wheelBtnSecondary: { backgroundColor: theme.colors.background.primary },
  wheelBtnLabel: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 13,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  wheelBtnSub: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 8,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
    marginTop: 2,
  },
  wheelRow: { flexDirection: 'row', gap: theme.spacing.sm },

  targetingHint: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.gold.light,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  swapHint: { alignItems: 'center', paddingBottom: theme.spacing.sm },
  cancelBtn: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
    marginTop: theme.spacing.xs,
    padding: theme.spacing.sm,
  },

  enemyTurnOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000033',
  },
  enemyTurnText: {
    fontFamily: theme.typography.stat.fontFamily,
    fontSize: 14,
    color: theme.colors.text.secondary,
    letterSpacing: 2,
  },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.lg },
  emptyText: { fontFamily: theme.typography.body.fontFamily, fontSize: 16, color: theme.colors.text.secondary },
  backBtn: {
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gold.main,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
  },
  backBtnText: { fontFamily: theme.typography.label.fontFamily, fontSize: 12, color: theme.colors.gold.main, letterSpacing: 2 },
})
