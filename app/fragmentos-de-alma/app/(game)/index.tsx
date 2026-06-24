import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
  View, Text, Pressable, ScrollView, StyleSheet, Dimensions,
} from 'react-native'
import Animated, { SharedValue,
  useSharedValue, useAnimatedStyle, withTiming, withRepeat,
  withSequence, Easing, useDerivedValue,
} from 'react-native-reanimated'
import {
  Canvas,
  Path as SkiaPath,
  Group,
  Skia,
} from '@shopify/react-native-skia'
import { SvgXml } from 'react-native-svg'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useGameStore } from '@/store/gameStore'
import { useWorldStore } from '@/store/worldStore'
import {
  TERRITORY_DEFS,
  PRIMA_FLOW_PAIRS,
  MAP_WIDTH,
} from '@/systems/world/mapData'
import { theme } from '@/lib/theme'
import type { TerritoryId, TerritoryState } from '@/systems/world/types'
import type { TerritoryDef } from '@/systems/world/mapData'

const { width: SW } = Dimensions.get('window')
const SCALE = SW / MAP_WIDTH
const SH_APPROX = 900
const FLOW_COUNT = PRIMA_FLOW_PAIRS.length

// ─── helpers ────────────────────────────────────────────────────────────────

function hexAlpha(hex: string, opacity: number): string {
  const a = Math.round(Math.max(0, Math.min(1, opacity)) * 255)
    .toString(16).padStart(2, '0')
  return hex + a
}

function corruptionBaseColor(level: number): string | null {
  if (level <= 20) return null
  if (level <= 40) return 'rgba(80,120,80,0.22)'
  if (level <= 60) return 'rgba(90,50,110,0.38)'
  return null // severe handled by animated overlay
}

function reputationLabel(rep: number): string {
  if (rep >= 50)  return 'Aliado'
  if (rep >= 20)  return 'Amigável'
  if (rep <= -50) return 'Inimigo'
  if (rep <= -20) return 'Hostil'
  return 'Neutro'
}

function reputationColor(rep: number): string {
  if (rep >= 20)  return '#27AE60'
  if (rep <= -20) return '#C62828'
  return theme.colors.text.secondary
}

function corruptionBarColor(level: number): string {
  if (level < 40) return '#27AE60'
  if (level < 65) return '#E09B00'
  return '#C62828'
}

function globalCorruptionColor(level: number): string {
  if (level < 40) return '#27AE60'
  if (level < 65) return '#E09B00'
  return '#C62828'
}

// ─── Alchemic compass (outside Canvas, animated rotation) ────────────────────

const COMPASS_SVG = `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
  <circle cx="28" cy="28" r="25" fill="none" stroke="rgba(200,150,12,0.3)" stroke-width="1"/>
  <circle cx="28" cy="28" r="7"  fill="none" stroke="rgba(200,150,12,0.3)" stroke-width="1"/>
  <line x1="28" y1="3"  x2="28" y2="14" stroke="rgba(200,150,12,0.55)" stroke-width="1.5"/>
  <line x1="53" y1="28" x2="42" y2="28" stroke="rgba(200,150,12,0.55)" stroke-width="1.5"/>
  <line x1="28" y1="53" x2="28" y2="42" stroke="rgba(200,150,12,0.55)" stroke-width="1.5"/>
  <line x1="3"  y1="28" x2="14" y2="28" stroke="rgba(200,150,12,0.55)" stroke-width="1.5"/>
  <line x1="46" y1="10" x2="41" y2="15" stroke="rgba(200,150,12,0.3)" stroke-width="1"/>
  <line x1="46" y1="46" x2="41" y2="41" stroke="rgba(200,150,12,0.3)" stroke-width="1"/>
  <line x1="10" y1="46" x2="15" y2="41" stroke="rgba(200,150,12,0.3)" stroke-width="1"/>
  <line x1="10" y1="10" x2="15" y2="15" stroke="rgba(200,150,12,0.3)" stroke-width="1"/>
</svg>`

function AlchemicCompassView() {
  const { bottom } = useSafeAreaInsets()
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 120000, easing: Easing.linear }),
      -1, false
    )
  }, [])

  const compassStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  return (
    <Animated.View style={[styles.compassContainer, { bottom: bottom + 80 }, compassStyle]}>
      <SvgXml xml={COMPASS_SVG} width={52} height={52} />
    </Animated.View>
  )
}

// ─── Prima flow line (animated comet) ────────────────────────────────────────

type FlowLineProps = {
  path: ReturnType<typeof Skia.Path.Make>
  index: number
  flowProgress: SharedValue<number>
}

function PrimaFlowLine({ path, index, flowProgress }: FlowLineProps) {
  const stagger = index / FLOW_COUNT

  const cometEnd = useDerivedValue(() => {
    'worklet'
    return (flowProgress.value + stagger) % 1
  })
  const cometStart = useDerivedValue(() => {
    'worklet'
    const e = (flowProgress.value + stagger) % 1
    return Math.max(0, e - 0.18)
  })

  return (
    <Group>
      <SkiaPath path={path} color="rgba(200,150,12,0.10)" style="stroke" strokeWidth={1} />
      <SkiaPath
        path={path}
        color="rgba(200,150,12,0.55)"
        style="stroke"
        strokeWidth={1.8}
        start={cometStart}
        end={cometEnd}
      />
    </Group>
  )
}

// ─── Skia canvas ─────────────────────────────────────────────────────────────

type CanvasProps = {
  selectedId: TerritoryId | null
  fillPulse: SharedValue<number>
  fogPulse: SharedValue<number>
  flowProgress: SharedValue<number>
}

function SolumMapCanvas({ selectedId, fillPulse, fogPulse, flowProgress }: CanvasProps) {
  const territories = useWorldStore(s => s.territories)

  const { territoryPaths, flowPaths, bgPath } = useMemo(() => {
    const bg = Skia.Path.Make()
    bg.addRect(Skia.XYWHRect(0, 0, SW, SH_APPROX))

    const territoryPaths = TERRITORY_DEFS.map(t => ({
      id:    t.id,
      color: t.color,
      path:  Skia.Path.MakeFromSVGString(t.svgPath)!,
    }))

    const flowPaths = PRIMA_FLOW_PAIRS.map(pair => {
      const from = TERRITORY_DEFS.find(t => t.id === pair.from)!
      const to   = TERRITORY_DEFS.find(t => t.id === pair.to)!
      const p = Skia.Path.Make()
      p.moveTo(from.center[0], from.center[1])
      p.quadTo(pair.cp[0], pair.cp[1], to.center[0], to.center[1])
      return p
    })

    return { territoryPaths, flowPaths, bgPath: bg }
  }, [])

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <SkiaPath path={bgPath} color="#0D0D18" />

      <Group transform={[{ scale: SCALE }]}>
        {/* Animated Prima flow lines */}
        {flowPaths.map((p, i) => (
          <PrimaFlowLine key={i} path={p} index={i} flowProgress={flowProgress} />
        ))}

        {/* Territories */}
        {territoryPaths.map(({ id, color, path }) => {
          const state   = territories[id]
          if (!state) return null
          const visited  = state.playerProgress.surfaceFloors > 0
          const selected = id === selectedId
          const level    = state.corruptionLevel
          const baseOverlay = corruptionBaseColor(level)
          const hasSevere = visited && level > 60

          return (
            <Group key={id}>
              {/* Animated fill — territory breathes */}
              <Group opacity={fillPulse}>
                <SkiaPath path={path} color={visited ? hexAlpha(color, 1) : '#12121E'} />
              </Group>

              {/* Static corruption overlay (20-60%) */}
              {baseOverlay && visited && (
                <SkiaPath path={path} color={baseOverlay} />
              )}

              {/* Animated fog for severe corruption (>60%) */}
              {hasSevere && (
                <Group opacity={fogPulse}>
                  <SkiaPath path={path} color="rgba(120,15,15,0.58)" />
                </Group>
              )}

              {/* Fog of war for unvisited */}
              {!visited && <SkiaPath path={path} color="rgba(8,8,20,0.68)" />}

              {/* Border */}
              <SkiaPath
                path={path}
                color={visited ? hexAlpha(color, selected ? 1.0 : 0.65) : '#2A2A3E'}
                style="stroke"
                strokeWidth={selected ? 2.8 : 1.5}
              />
            </Group>
          )
        })}
      </Group>
    </Canvas>
  )
}

// ─── Boss available indicators ───────────────────────────────────────────────

function BossIndicators() {
  const territories = useWorldStore(s => s.territories)
  const pulse = useSharedValue(0.6)

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 700 }),
        withTiming(0.5, { duration: 700 })
      ),
      -1, true
    )
  }, [])

  const indicatorStyle = useAnimatedStyle(() => ({ opacity: pulse.value }))

  return (
    <>
      {TERRITORY_DEFS.map(def => {
        const state = territories[def.id]
        if (!state) return null
        const { depthsFloors, bossDefeated } = state.playerProgress
        if (depthsFloors < 10 || bossDefeated) return null

        const left = def.center[0] * SCALE - 10
        const top  = def.center[1] * SCALE - 28

        return (
          <Animated.View
            key={def.id}
            style={[styles.bossIndicator, { left, top, borderColor: def.color }, indicatorStyle]}
            pointerEvents="none"
          >
            <Text style={[styles.bossIndicatorText, { color: def.color }]}>!</Text>
          </Animated.View>
        )
      })}
    </>
  )
}

// ─── Territory labels ─────────────────────────────────────────────────────────

function TerritoryLabels({ selectedId }: { selectedId: TerritoryId | null }) {
  const territories = useWorldStore(s => s.territories)
  return (
    <>
      {TERRITORY_DEFS.map(def => {
        const state   = territories[def.id]
        if (!state) return null
        const visited  = state.playerProgress.surfaceFloors > 0
        const selected = def.id === selectedId
        const left     = def.labelAnchor[0] * SCALE - 52
        const top      = def.labelAnchor[1] * SCALE - 12

        return (
          <View key={def.id} style={[styles.label, { left, top }]} pointerEvents="none">
            <Text style={[
              styles.labelText,
              { color: visited ? (selected ? '#FFFFFF' : def.color) : '#44445A' },
            ]}>
              {visited ? def.name.toUpperCase() : `? ${def.name.toUpperCase()}`}
            </Text>
            {visited && (
              <Text style={[styles.labelAffinity, { color: hexAlpha(def.color, 0.7) }]}>
                {def.affinityLabel.toUpperCase()}
              </Text>
            )}
          </View>
        )
      })}
    </>
  )
}

// ─── Tap targets ─────────────────────────────────────────────────────────────

function TerritoryTapTargets({ onSelect }: { onSelect: (id: TerritoryId) => void }) {
  return (
    <>
      {TERRITORY_DEFS.map(def => (
        <Pressable
          key={def.id}
          style={[styles.tapTarget, {
            left: def.center[0] * SCALE - 40,
            top:  def.center[1] * SCALE - 40,
          }]}
          onPress={() => onSelect(def.id)}
          accessibilityLabel={`Território ${def.name}`}
          accessibilityRole="button"
        />
      ))}
    </>
  )
}

// ─── Map HUD ─────────────────────────────────────────────────────────────────

function MapHUD() {
  const { top }          = useSafeAreaInsets()
  const player           = useGameStore(s => s.player)
  const globalCorruption = useWorldStore(s => s.globalCorruption)
  const corrColor        = globalCorruptionColor(globalCorruption)

  return (
    <>
      <View style={[styles.corruptionBar, { top }]}>
        <View style={[styles.corruptionFill, {
          width: `${globalCorruption}%` as `${number}%`,
          backgroundColor: corrColor,
        }]} />
      </View>

      <View style={[styles.playerInfo, { top: top + 6 }]}>
        <View style={styles.playerAvatar}>
          <Text style={styles.playerInitial}>
            {(player?.kaelName ?? 'K')[0].toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.playerName}>{player?.kaelName ?? '—'}</Text>
          <Text style={styles.playerLevel}>NÍV {player?.kaelLevel ?? 1}</Text>
        </View>
      </View>

      <View style={[styles.resources, { top: top + 6 }]}>
        <ResourceRow icon="◆" value={player?.soulFragments ?? 0} />
        <ResourceRow icon="◈" value={player?.essenceCrystals ?? 0} />
        <ResourceRow icon="✦" value={player?.echoes ?? 0} />
      </View>
    </>
  )
}

function ResourceRow({ icon, value }: { icon: string; value: number }) {
  return (
    <View style={styles.resourceRow}>
      <Text style={styles.resourceIcon}>{icon}</Text>
      <Text style={styles.resourceValue}>{value.toLocaleString('pt-BR')}</Text>
    </View>
  )
}

// ─── Territory panel ──────────────────────────────────────────────────────────

function TerritoryPanel({
  def, state, onClose, onEnter,
}: {
  def: TerritoryDef
  state: TerritoryState
  onClose: () => void
  onEnter: () => void
}) {
  const { surfaceFloors, depthsFloors, bossDefeated } = state.playerProgress
  const depthsUnlocked = surfaceFloors >= 10
  const bossUnlocked   = depthsFloors >= 10
  const repLabel       = reputationLabel(state.factionReputation)
  const repColor       = reputationColor(state.factionReputation)
  const corrColor      = corruptionBarColor(state.corruptionLevel)

  return (
    <SafeAreaView style={styles.panelRoot} edges={['top', 'bottom']}>
      <View style={[styles.panelHeader, { borderLeftColor: def.color }]}>
        <Pressable
          onPress={onClose}
          style={styles.closeBtn}
          accessibilityLabel="Fechar painel"
          accessibilityRole="button"
          hitSlop={12}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
        <Text style={styles.panelTitle}>{def.name.toUpperCase()}</Text>
        <Text style={[styles.panelFaction, { color: def.color }]}>
          {def.factionLabel.toUpperCase()}
        </Text>
        <Text style={styles.panelAffinity}>{def.affinityLabel}</Text>
      </View>

      <ScrollView style={styles.panelScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.panelSection}>
          <Text style={styles.sectionTitle}>ESTADO DO TERRITÓRIO</Text>
          <View style={styles.statBlock}>
            <View style={styles.statLabelRow}>
              <Text style={styles.statLabel}>Corrupção</Text>
              <Text style={[styles.statValue, { color: corrColor }]}>
                {state.corruptionLevel}%
              </Text>
            </View>
            <View style={styles.inlineBar}>
              <View style={[styles.inlineFill, {
                flex: state.corruptionLevel / 100,
                backgroundColor: corrColor,
              }]} />
              <View style={{ flex: 1 - state.corruptionLevel / 100 }} />
            </View>
          </View>
          <View style={styles.statLabelRow}>
            <Text style={styles.statLabel}>Reputação</Text>
            <Text style={[styles.repLabel, { color: repColor }]}>
              {repLabel} ({state.factionReputation > 0 ? '+' : ''}{state.factionReputation})
            </Text>
          </View>
        </View>

        <View style={styles.panelSection}>
          <Text style={styles.sectionTitle}>PROGRESSO</Text>
          <Text style={styles.progressRow}>
            {'›'} Superfície: {surfaceFloors}/10{surfaceFloors >= 10 ? '  ✓' : ''}
          </Text>
          <Text style={styles.progressRow}>
            {'›'} Profundezas:{' '}
            {depthsUnlocked
              ? `${depthsFloors}/10${depthsFloors >= 10 ? '  ✓' : ''}`
              : 'Bloqueado'}
          </Text>
          <Text style={styles.progressRow}>
            {'›'} Núcleo:{' '}
            {depthsUnlocked && bossUnlocked
              ? bossDefeated ? 'Derrotado  ✓' : 'Disponível'
              : 'Bloqueado'}
          </Text>
        </View>

        <View style={styles.panelSection}>
          <Text style={styles.loreText}>{def.lore}</Text>
        </View>

        <View style={styles.panelActions}>
          <Pressable
            style={[styles.enterBtn, { borderColor: def.color }]}
            onPress={onEnter}
            accessibilityRole="button"
            accessibilityLabel={`Entrar em ${def.name}`}
          >
            <Text style={[styles.enterBtnText, { color: def.color }]}>
              ENTRAR NA DUNGEON
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function MapScreen() {
  const [selectedId, setSelectedId]   = useState<TerritoryId | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const { initialize, isLoading }     = useGameStore()

  // Panel animation
  const panelX = useSharedValue(SW * 0.75)
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: panelX.value }],
  }))

  // Map idle animations — created once in the root component
  const fillPulse   = useSharedValue(0.28)
  const fogPulse    = useSharedValue(0.4)
  const flowProgress = useSharedValue(0)

  useEffect(() => {
    initialize()

    fillPulse.value = withRepeat(
      withSequence(
        withTiming(0.22, { duration: 2000 }),
        withTiming(0.32, { duration: 2000 })
      ),
      -1, true
    )

    fogPulse.value = withRepeat(
      withSequence(
        withTiming(0.28, { duration: 1400 }),
        withTiming(0.55, { duration: 1400 })
      ),
      -1, true
    )

    flowProgress.value = withRepeat(
      withTiming(1, { duration: 20000, easing: Easing.linear }),
      -1, false
    )
  }, [])

  const openPanel = useCallback((id: TerritoryId) => {
    setSelectedId(id)
    setIsPanelOpen(true)
    panelX.value = withTiming(0, { duration: 300 })
  }, [panelX])

  const closePanel = useCallback(() => {
    panelX.value = withTiming(SW * 0.75, { duration: 250 })
    setTimeout(() => setIsPanelOpen(false), 260)
  }, [panelX])

  const territories   = useWorldStore(s => s.territories)
  const selectedDef   = selectedId ? TERRITORY_DEFS.find(t => t.id === selectedId) ?? null : null
  const selectedState = selectedId ? (territories[selectedId] ?? null) : null

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Invocando Solum…</Text>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <SolumMapCanvas
        selectedId={selectedId}
        fillPulse={fillPulse}
        fogPulse={fogPulse}
        flowProgress={flowProgress}
      />
      <TerritoryLabels selectedId={selectedId} />
      <TerritoryTapTargets onSelect={openPanel} />
      <BossIndicators />
      <AlchemicCompassView />
      <MapHUD />

      {isPanelOpen && (
        <Pressable
          style={styles.backdrop}
          onPress={closePanel}
          accessibilityRole="button"
          accessibilityLabel="Fechar painel"
        />
      )}

      {isPanelOpen && selectedDef && selectedState && (
        <Animated.View style={[styles.panel, panelStyle]}>
          <TerritoryPanel
            def={selectedDef}
            state={selectedState}
            onClose={closePanel}
            onEnter={() => {
              closePanel()
              router.push(`/dungeon/${selectedId}` as `/${string}`)
            }}
          />
        </Animated.View>
      )}
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D18' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D0D18' },
  loadingText: {
    fontFamily: 'LibreBaskerville_400Regular_Italic',
    fontSize: 14,
    color: theme.colors.text.secondary,
  },

  label: { position: 'absolute', width: 104, alignItems: 'center' },
  labelText: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 9,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  labelAffinity: {
    fontFamily: 'Rajdhani_500Medium',
    fontSize: 7,
    letterSpacing: 1.2,
    textAlign: 'center',
    marginTop: 1,
  },

  tapTarget: { position: 'absolute', width: 80, height: 80 },

  compassContainer: {
    position: 'absolute',
    right: 12,
    width: 52,
    height: 52,
  },

  bossIndicator: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  bossIndicatorText: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 11,
    lineHeight: 14,
  },

  corruptionBar: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: '#1A1A24' },
  corruptionFill: { height: 2 },

  playerInfo: {
    position: 'absolute',
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(10,10,20,0.78)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  playerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gold.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInitial: { fontFamily: 'Cinzel_700Bold', fontSize: 14, color: '#0A0A0F' },
  playerName: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 11,
    color: theme.colors.gold.light,
    letterSpacing: 1,
  },
  playerLevel: {
    fontFamily: 'Rajdhani_500Medium',
    fontSize: 9,
    color: theme.colors.text.secondary,
    letterSpacing: 1.5,
  },

  resources: {
    position: 'absolute',
    right: 14,
    alignItems: 'flex-end',
    gap: 2,
    backgroundColor: 'rgba(10,10,20,0.78)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  resourceRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  resourceIcon: { fontFamily: 'Rajdhani_500Medium', fontSize: 9, color: theme.colors.gold.main },
  resourceValue: {
    fontFamily: 'Rajdhani_600SemiBold',
    fontSize: 12,
    color: theme.colors.text.primary,
    letterSpacing: 0.5,
  },

  backdrop: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0,
    width: SW * 0.25,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },

  panel: {
    position: 'absolute',
    top: 0, bottom: 0,
    left: SW * 0.25,
    width: SW * 0.75,
  },
  panelRoot: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.gold.dark,
  },
  panelHeader: {
    padding: 16,
    paddingBottom: 12,
    borderLeftWidth: 3,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(200,150,12,0.3)',
    gap: 2,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    marginTop: -8,
  },
  closeBtnText: { fontFamily: 'Rajdhani_500Medium', fontSize: 16, color: theme.colors.text.secondary },
  panelTitle: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 18,
    color: theme.colors.text.primary,
    letterSpacing: 2,
  },
  panelFaction: { fontFamily: 'Rajdhani_500Medium', fontSize: 10, letterSpacing: 2 },
  panelAffinity: {
    fontFamily: 'Rajdhani_500Medium',
    fontSize: 9,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
  },
  panelScroll: { flex: 1 },

  panelSection: {
    padding: 16,
    paddingTop: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border.subtle,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'Rajdhani_500Medium',
    fontSize: 9,
    color: theme.colors.gold.dark,
    letterSpacing: 2,
    marginBottom: 4,
  },
  statBlock: { gap: 6 },
  statLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: {
    fontFamily: 'Rajdhani_500Medium',
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
  },
  statValue: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 12 },
  inlineBar: {
    flexDirection: 'row',
    height: 5,
    borderRadius: 2,
    backgroundColor: '#1A1A2E',
    overflow: 'hidden',
  },
  inlineFill: { borderRadius: 2 },
  repLabel: { fontFamily: 'Rajdhani_500Medium', fontSize: 12, letterSpacing: 0.5 },

  progressRow: {
    fontFamily: 'Rajdhani_500Medium',
    fontSize: 11,
    color: theme.colors.text.primary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  loreText: {
    fontFamily: 'LibreBaskerville_400Regular_Italic',
    fontSize: 12,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  panelActions: { padding: 16, paddingBottom: 24 },
  enterBtn: {
    borderWidth: 1.5,
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  enterBtnText: { fontFamily: 'Cinzel_700Bold', fontSize: 12, letterSpacing: 2 },
})
