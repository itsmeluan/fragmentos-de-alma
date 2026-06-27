import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated, Easing, Image as RNImage, Modal,
  PanResponder, Pressable, ScrollView, StyleSheet,
  Text, View, useWindowDimensions,
} from 'react-native'
import {
  Canvas, FilterMode, Image as SkiaImage, MipmapMode, useImage,
} from '@shopify/react-native-skia'
import { theme } from '@/lib/theme'
import { resolveHeroSprite } from '@/systems/visual/heroSprite'
import { ELEMENT_ICONS } from '@/systems/visual/elementRegistry'
import { affinityMultiplier } from '@/systems/battle/affinityChart'
import { RESONANCE_TABLE, ResonanceDef } from '@/systems/battle/resonance'
import { xpRequiredForHeroLevel, heroBondStars } from '@/systems/progression/legacy'
import type { Hero, Affinity, Rarity } from '@/systems/genes/types'

// ─── Design tokens ────────────────────────────────────────────────────────────

const CARD_SIDE_MARGIN = 30
const BORDER_W         = 10
const CARD_RATIO       = 1.55
const FLIP_MS          = 300
const CARD_BG          = '#0E0C22'
const INNER_PAD        = 12
const STAR_SIZE        = 15
const CIRCLE_SIZE      = 44

// Sprites não-únicos têm muito padding transparente no PNG;
// escalamos o desenho Skia além da canvas — ela recorta automaticamente
const SPRITE_SCALE_NONUNIQUE = 1.45

const ALL_AFFINITIES: Affinity[] = ['Fogo', 'Água', 'Terra', 'Vento', 'Vazio', 'Luz', 'Sombra', 'Éter']

const RARITY_STARS: Record<Rarity, number> = {
  comum: 1, incomum: 2, raro: 3, epico: 4, lendario: 5, unico: 6,
}

const RESONANCE_TYPE_COLORS: Record<string, string> = {
  dano:    theme.colors.red.vivid,
  suporte: theme.colors.blue.main,
  cura:    '#2E7D32',
}

const MAX_PASSIVE   = 2
const MAX_ACTIVE    = 3
const MAX_UNIQUE    = 1
const MAX_MUTATIONS = 5

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAdvantages(aff: Affinity): Affinity[] {
  return ALL_AFFINITIES.filter(a => a !== aff && affinityMultiplier(aff, a) >= 2.0)
}
function getWeaknesses(aff: Affinity): Affinity[] {
  return ALL_AFFINITIES.filter(a => a !== aff && affinityMultiplier(a, aff) >= 2.0)
}
function getResonanceDefs(aff: Affinity): ResonanceDef[] {
  return RESONANCE_TABLE.filter(r => r.affinityA === aff || r.affinityB === aff)
}
function getResonancePartner(aff: Affinity, r: ResonanceDef): Affinity {
  return r.affinityA === aff ? r.affinityB : r.affinityA
}

// ─── AttrBar ─────────────────────────────────────────────────────────────────

function AttrBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(1, value / 100)
  return (
    <View style={ab.row}>
      <Text style={ab.label}>{label}</Text>
      <View style={ab.track}>
        <View style={[ab.fill, { flex: pct }]} />
        <View style={{ flex: 1 - pct || 0.001 }} />
      </View>
      <Text style={ab.val}>{value}</Text>
    </View>
  )
}

const ab = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  label: {
    fontFamily: 'Rajdhani_500Medium',
    fontSize: 9,
    color: theme.colors.text.secondary,
    letterSpacing: 0.6,
    width: 62,
    textTransform: 'uppercase',
  },
  track: {
    flex: 1, height: 4, backgroundColor: '#1A1A24', borderRadius: 2,
    flexDirection: 'row', overflow: 'hidden',
  },
  fill: { backgroundColor: theme.colors.red.vivid, borderRadius: 2 },
  val: {
    fontFamily: 'Rajdhani_600SemiBold',
    fontSize: 11,
    color: theme.colors.text.primary,
    width: 20,
    textAlign: 'right',
  },
})

// ─── ElementIcon ──────────────────────────────────────────────────────────────

function ElementIcon({ affinity }: { affinity: Affinity }) {
  return (
    <RNImage source={ELEMENT_ICONS[affinity]} style={{ width: 26, height: 26 }} resizeMode="contain" />
  )
}

// ─── SkillCircle ──────────────────────────────────────────────────────────────

function SkillCircle({
  label, locked = false, borderColor = theme.colors.red.vivid, size = CIRCLE_SIZE,
}: { label?: string; locked?: boolean; borderColor?: string; size?: number }) {
  return (
    <View style={[sc.circle, {
      width: size, height: size, borderRadius: size / 2,
      borderColor: locked ? theme.colors.border.subtle : borderColor,
    }]}>
      {locked
        ? <Text style={sc.lock}>🔒</Text>
        : <Text style={sc.label} numberOfLines={3}>{label}</Text>
      }
    </View>
  )
}

const sc = StyleSheet.create({
  circle: { borderWidth: 1.5, backgroundColor: '#0D0C1E', alignItems: 'center', justifyContent: 'center', padding: 4 },
  lock:   { fontSize: 14, opacity: 0.30 },
  label:  { fontFamily: 'Rajdhani_500Medium', fontSize: 7, color: theme.colors.text.secondary, textAlign: 'center', lineHeight: 9 },
})

// ─── HeroSpriteCanvas ────────────────────────────────────────────────────────

function HeroSpriteCanvas({ hero, size }: { hero: Hero; size: number }) {
  const resolved = useMemo(
    () => resolveHeroSprite(hero.genome.essence.core, hero.rarity, hero.genome.attributes, 'south-east'),
    [hero.genome.essence.core, hero.rarity, hero.genome.attributes]
  )
  const spriteImage = useImage(resolved.source ?? undefined)

  const scale = hero.rarity === 'unico' ? 1.0 : SPRITE_SCALE_NONUNIQUE
  const drawW = size * scale
  const drawX = -(drawW - size) / 2

  return (
    <Canvas style={{ width: size, height: size }}>
      {spriteImage && (
        <SkiaImage
          image={spriteImage} x={drawX} y={drawX} width={drawW} height={drawW}
          fit="contain"
          sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.None }}
        />
      )}
    </Canvas>
  )
}

// ─── HeroDetailContent ────────────────────────────────────────────────────────

type PanHandlers = ReturnType<typeof PanResponder.create>['panHandlers']

interface DetailContentProps {
  hero: Hero
  heroPosition: string | null
  cardWidth: number
  scrollY: React.MutableRefObject<number>
  panHandlers: PanHandlers
  onClose: () => void
}

function HeroDetailContent({ hero, heroPosition, cardWidth, scrollY, panHandlers, onClose }: DetailContentProps) {
  const { attributes, essence, mutations } = hero.genome
  const rarityColor   = theme.colors.rarity[hero.rarity]
  const starCount     = RARITY_STARS[hero.rarity]
  const xpMax         = xpRequiredForHeroLevel(hero.level)
  const xpPct         = Math.min(1, (hero.xp ?? 0) / Math.max(1, xpMax))
  const bondStars     = heroBondStars(hero.bond ?? 0)

  const advantages    = useMemo(() => getAdvantages(essence.affinity), [essence.affinity])
  const weaknesses    = useMemo(() => getWeaknesses(essence.affinity), [essence.affinity])
  const resonanceDefs = useMemo(() => getResonanceDefs(essence.affinity), [essence.affinity])

  const innerW     = cardWidth - INNER_PAD * 2
  const spriteSize = Math.floor(innerW * 0.44)

  const passiveLocks  = MAX_PASSIVE   - hero.skills.passive.length
  const activeLocks   = MAX_ACTIVE    - hero.skills.active.length
  const uniqueLocks   = MAX_UNIQUE    - hero.skills.unique.length
  const mutationLocks = MAX_MUTATIONS - mutations.length

  return (
    <View style={{ flex: 1, backgroundColor: CARD_BG }}>

      {/* ── STICKY HEADER ── */}
      <View {...panHandlers} style={[d.stickyArea, { paddingHorizontal: INNER_PAD }]}>
        <View style={d.nameRow}>
          <Text style={d.name} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>
            {hero.name}
          </Text>
          <Text style={d.level}>Nv {hero.level}</Text>
        </View>

        <View style={d.subRow}>
          <View style={d.metaCell}>
            <Text style={d.labelGold}>ORIGEM </Text>
            <Text style={d.valueWhite} numberOfLines={1}>{essence.origin}</Text>
          </View>
          <View style={d.metaCell}>
            <Text style={d.labelGold}>GER. </Text>
            <Text style={d.valueWhite}>{hero.generation}</Text>
          </View>
          <View style={[d.metaCell, { flex: 1, minWidth: 0 }]}>
            <Text style={d.labelGold}>NÚCLEO </Text>
            <Text style={d.valueWhite} numberOfLines={1}>{essence.core}</Text>
          </View>
          <View style={d.metaCell}>
            <Text style={d.labelGold}>VÍN. </Text>
            <Text style={d.valueWhite}>{bondStars}</Text>
          </View>
        </View>

        <View style={d.xpTrack}>
          <View style={[d.xpFill, { flex: xpPct }]} />
          <View style={[d.xpEmpty, { flex: 1 - xpPct || 0.001 }]} />
        </View>
      </View>

      <View style={d.headerDivider} />

      {/* ── CONTEÚDO ROLÁVEL ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[d.scrollContent, { paddingHorizontal: INNER_PAD, paddingBottom: 68 }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={e => { scrollY.current = e.nativeEvent.contentOffset.y }}
      >
        {/* Sprite + Atributos */}
        <View style={[d.mainRow, { marginTop: 8 }]}>
          <View style={{ width: spriteSize }}>
            <HeroSpriteCanvas hero={hero} size={spriteSize} />
            <View style={[d.starsRow, { width: spriteSize }]}>
              {Array.from({ length: 6 }, (_, i) => (
                <Text key={i} style={[d.star, { color: i < starCount ? rarityColor : '#1C1830' }]}>★</Text>
              ))}
            </View>
          </View>

          <View style={{ flex: 1, paddingLeft: 8 }}>
            <View style={d.attrHeaderRow}>
              <Text style={d.labelGold}>ATRIBUTOS</Text>
              {heroPosition && (
                <View style={d.metaCell}>
                  <Text style={d.labelGold}>POSIÇÃO </Text>
                  <Text style={d.valueWhite}>{heroPosition}</Text>
                </View>
              )}
            </View>
            <AttrBar label="Aura"        value={attributes.aura} />
            <AttrBar label="Força"       value={attributes.forca} />
            <AttrBar label="Vontade"     value={attributes.vontade} />
            <AttrBar label="Agilidade"   value={attributes.agilidade} />
            <AttrBar label="Resistência" value={attributes.resistencia} />
            <AttrBar label="Ressonância" value={attributes.ressonancia} />
          </View>
        </View>

        {/* ELEMENTOS */}
        <View style={d.divider} />
        <Text style={d.sectionTitle}>ELEMENTOS</Text>
        <View style={d.elemRow}>
          <View style={d.elemGroup}>
            <Text style={d.elemLabel}>AFINIDADE</Text>
            <ElementIcon affinity={essence.affinity} />
          </View>
          <View style={d.elemGroup}>
            <Text style={d.elemLabel}>VANTAGENS</Text>
            <View style={d.elemIconsRow}>
              {advantages.length > 0
                ? advantages.map(a => <ElementIcon key={a} affinity={a} />)
                : <Text style={d.dash}>—</Text>}
            </View>
          </View>
          <View style={d.elemGroup}>
            <Text style={d.elemLabel}>FRAQUEZAS</Text>
            <View style={d.elemIconsRow}>
              {weaknesses.length > 0
                ? weaknesses.map(a => <ElementIcon key={a} affinity={a} />)
                : <Text style={d.dash}>—</Text>}
            </View>
          </View>
          <View style={d.elemGroup}>
            <Text style={d.elemLabel}>SINERGIAS</Text>
            <View style={d.elemIconsRow}>
              {resonanceDefs.map(r => (
                <ElementIcon key={r.name} affinity={getResonancePartner(essence.affinity, r)} />
              ))}
            </View>
          </View>
        </View>

        {/* HABILIDADES */}
        <View style={d.divider} />
        <Text style={d.sectionTitle}>HABILIDADES</Text>
        <View style={d.skillsRow}>
          <View style={d.skillGroup}>
            <View style={d.circlesRow}>
              {hero.skills.passive.map(sk => <SkillCircle key={sk.id} label={sk.name} />)}
              {Array.from({ length: passiveLocks }, (_, i) => <SkillCircle key={`pl${i}`} locked />)}
            </View>
            <Text style={d.skillLabel}>PASSIVAS</Text>
          </View>

          <View style={d.skillGroup}>
            <View style={d.circlesRow}>
              {hero.skills.active.map(sk => <SkillCircle key={sk.id} label={sk.name} />)}
              {Array.from({ length: activeLocks }, (_, i) => <SkillCircle key={`al${i}`} locked />)}
            </View>
            <Text style={d.skillLabel}>ATIVAS</Text>
          </View>

          <View style={d.skillGroup}>
            <View style={d.circlesRow}>
              {hero.skills.unique.map(sk => (
                <SkillCircle key={sk.id} label={sk.name} borderColor={theme.colors.gold.main} />
              ))}
              {Array.from({ length: uniqueLocks }, (_, i) => <SkillCircle key={`ul${i}`} locked />)}
            </View>
            <Text style={[d.skillLabel, hero.skills.unique.length > 0 && { color: theme.colors.gold.main }]}>
              ULTIMATE
            </Text>
          </View>
        </View>

        {/* MUTAÇÕES */}
        <View style={d.divider} />
        <Text style={d.sectionTitle}>MUTAÇÕES</Text>
        <View style={d.circlesRow}>
          {mutations.map(m => <SkillCircle key={m} label={m} borderColor={theme.colors.gold.dark} />)}
          {Array.from({ length: mutationLocks }, (_, i) => <SkillCircle key={`ml${i}`} locked />)}
        </View>

        {/* RESSONÂNCIAS CRÍTICAS */}
        <View style={d.divider} />
        <Text style={d.sectionTitle}>RESSONÂNCIAS CRÍTICAS</Text>
        <View style={d.circlesRow}>
          {resonanceDefs.map(r => (
            <SkillCircle key={r.name} label={r.name} borderColor={RESONANCE_TYPE_COLORS[r.type]} />
          ))}
        </View>
      </ScrollView>

      <Pressable style={d.closePill} onPress={onClose}>
        <Text style={d.closePillText}>Fechar</Text>
      </Pressable>
    </View>
  )
}

// ─── HeroFlipDetail ───────────────────────────────────────────────────────────

export interface CardOriginLayout {
  x: number
  y: number
  width: number
  height: number
}

export interface HeroFlipDetailProps {
  hero: Hero | null
  heroPosition: string | null
  originLayout: CardOriginLayout | null
  onClose: () => void
}

export function HeroFlipDetail({ hero, heroPosition, originLayout, onClose }: HeroFlipDetailProps) {
  const { width: screenW, height: screenH } = useWindowDimensions()

  const contentW     = screenW - CARD_SIDE_MARGIN * 2
  const targetOuterW = contentW + 2 * BORDER_W
  const targetOuterH = Math.floor(contentW * CARD_RATIO) + 2 * BORDER_W

  // Todos native driver — roda inteiramente no UI thread
  const overlayOpacity = useRef(new Animated.Value(0)).current
  const flipAnim       = useRef(new Animated.Value(0)).current  // 0=frente 1=costas
  const animX          = useRef(new Animated.Value(0)).current  // offset X do centro da tela
  const animY          = useRef(new Animated.Value(0)).current  // offset Y do centro da tela
  const scaleAnim      = useRef(new Animated.Value(0)).current  // escala do card

  // frente: 0°→180° (some após 90°)   costas: 180°→360° (aparece após 270°)
  const frontRotateY = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] })
  const backRotateY  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] })

  const [mounted, setMounted] = useState(false)
  const scrollY    = useRef(0)
  const isClosing  = useRef(false)

  // Guardamos os valores de origem para o fechamento,
  // pois o prop pode ter mudado se o usuário navegar
  const originValues = useRef({ x: 0, y: 0, scale: 0 })

  useEffect(() => {
    if (!hero) return
    isClosing.current = false
    scrollY.current   = 0

    // Calcula offset do card de origem em relação ao centro da tela
    let sx = 0, sy = 0, sc = 0
    if (originLayout) {
      sx = (originLayout.x + originLayout.width  / 2) - screenW / 2
      sy = (originLayout.y + originLayout.height / 2) - screenH / 2
      sc = originLayout.width / targetOuterW
    }
    originValues.current = { x: sx, y: sy, scale: sc }

    // Inicia no lugar do card da lista
    animX.setValue(sx)
    animY.setValue(sy)
    scaleAnim.setValue(sc || 0.01)
    flipAnim.setValue(0)
    overlayOpacity.setValue(0)
    setMounted(true)

    const OPEN_MS = 380

    // Overlay aparece suavemente
    Animated.timing(overlayOpacity, {
      toValue: 1, duration: OPEN_MS, useNativeDriver: true,
    }).start()

    // Flip e translação/escala começam juntos:
    // o card voa do lugar do herói na lista até o centro enquanto vira
    Animated.timing(flipAnim, {
      toValue: 1, duration: FLIP_MS,
      easing: Easing.inOut(Easing.quad), useNativeDriver: true,
    }).start()

    Animated.timing(animX, {
      toValue: 0, duration: OPEN_MS,
      easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start()

    Animated.timing(animY, {
      toValue: 0, duration: OPEN_MS,
      easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start()

    Animated.timing(scaleAnim, {
      toValue: 1, duration: OPEN_MS,
      easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start()
  }, [hero])

  const handleClose = useCallback(() => {
    if (isClosing.current) return
    isClosing.current = true

    const { x: sx, y: sy, scale: sc } = originValues.current
    const CLOSE_MS = 350

    // Flip reverso (costas→frente) enquanto o card encolhe e volta para a lista
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0, duration: CLOSE_MS, useNativeDriver: true,
      }),
      Animated.timing(flipAnim, {
        toValue: 0, duration: FLIP_MS,
        easing: Easing.inOut(Easing.quad), useNativeDriver: true,
      }),
      Animated.timing(animX, {
        toValue: sx, duration: CLOSE_MS,
        easing: Easing.in(Easing.cubic), useNativeDriver: true,
      }),
      Animated.timing(animY, {
        toValue: sy, duration: CLOSE_MS,
        easing: Easing.in(Easing.cubic), useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: sc || 0.01, duration: CLOSE_MS,
        easing: Easing.in(Easing.cubic), useNativeDriver: true,
      }),
    ]).start(() => {
      setMounted(false)
      onClose()
    })
  }, [onClose])

  // Ref para evitar closure stale no PanResponder (criado uma única vez)
  const handleCloseRef = useRef(handleClose)
  useEffect(() => { handleCloseRef.current = handleClose }, [handleClose])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  (_, gs) => gs.dy > 6 && gs.dy > Math.abs(gs.dx),
      // animY está em 0 quando o card está centrado; swipe soma deslocamento vertical
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) animY.setValue(gs.dy * 0.40)
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 60 || gs.vy > 0.5) {
          handleCloseRef.current()
        } else {
          Animated.spring(animY, {
            toValue: 0, useNativeDriver: true, tension: 320, friction: 22,
          }).start()
        }
      },
    })
  ).current

  if (!mounted || !hero) return null

  const rarityColor = theme.colors.rarity[hero.rarity]
  const starCount   = RARITY_STARS[hero.rarity]

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleClose}>
      {/* Overlay escuro */}
      <Animated.View style={[s.overlay, { opacity: overlayOpacity }]} pointerEvents="none" />
      <Pressable
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        onPress={handleClose}
      />

      <View style={s.centeredWrap} pointerEvents="box-none">
        {/*
          translateX/Y posicionam o card na coordenada de origem.
          scale redimensiona para o tamanho do card da lista.
          Ao animar todos para 0/1, o card voa do herói até o centro.
          backfaceVisibility:hidden garante o flip 3D correto nas duas faces.
        */}
        <Animated.View style={[s.shadowWrap, {
          width: targetOuterW,
          height: targetOuterH,
          transform: [
            { translateX: animX },
            { translateY: animY },
            { scale: scaleAnim },
          ],
        }]}>
          <View style={s.cardBorder}>
            <View style={{ flex: 1 }}>

              {/* FRENTE: aparece no início (abertura) e no final (fechamento) */}
              <Animated.View style={[s.face, s.frontFace, {
                transform: [{ perspective: 1200 }, { rotateY: frontRotateY }],
              }]}>
                <View style={s.frontInner}>
                  <View style={s.frontTopStrip}>
                    <Text style={s.frontName} numberOfLines={1}>{hero.name}</Text>
                  </View>
                  <View style={s.frontMiddle}>
                    <View style={[s.frontRarityDot, { backgroundColor: rarityColor + '22', borderColor: rarityColor }]} />
                  </View>
                  <View style={s.frontBotStrip}>
                    <View style={s.frontStarsRow}>
                      {Array.from({ length: 6 }, (_, i) => (
                        <Text key={i} style={[s.frontStar, { color: i < starCount ? rarityColor : '#1C1830' }]}>★</Text>
                      ))}
                    </View>
                  </View>
                </View>
              </Animated.View>

              {/* COSTAS: os detalhes do herói */}
              <Animated.View style={[s.face, s.backFace, {
                transform: [{ perspective: 1200 }, { rotateY: backRotateY }],
              }]}>
                <HeroDetailContent
                  hero={hero}
                  heroPosition={heroPosition}
                  cardWidth={contentW}
                  scrollY={scrollY}
                  panHandlers={panResponder.panHandlers}
                  onClose={handleClose}
                />
              </Animated.View>

            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.80)',
  },
  centeredWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  shadowWrap: {
    shadowColor: '#2a0d60',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.70,
    shadowRadius: 22,
    elevation: 22,
  },
  cardBorder: {
    flex: 1, borderRadius: 16, borderWidth: BORDER_W, borderColor: '#050410', overflow: 'hidden',
  },
  face: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backfaceVisibility: 'hidden',
  },
  frontFace: { backgroundColor: '#09080f' },
  backFace:  { backgroundColor: CARD_BG },

  frontInner:    { flex: 1, justifyContent: 'space-between' },
  frontTopStrip: {
    backgroundColor: 'rgba(5,4,16,0.95)',
    paddingHorizontal: 10, paddingVertical: 8,
    borderBottomWidth: 0.5, borderBottomColor: '#1a1830',
  },
  frontName: {
    fontFamily: 'Rajdhani_700Bold', fontSize: 13, color: '#E8E0D0', letterSpacing: 0.5,
  },
  frontMiddle:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frontRarityDot: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5 },
  frontBotStrip: {
    backgroundColor: 'rgba(5,4,16,0.95)',
    paddingHorizontal: 10, paddingVertical: 8,
    borderTopWidth: 0.5, borderTopColor: '#1a1830', alignItems: 'center',
  },
  frontStarsRow: { flexDirection: 'row', gap: 3 },
  frontStar: { fontSize: 11 },
})

// Estilos do conteúdo do detalhe
const d = StyleSheet.create({
  stickyArea: { paddingTop: 10, paddingBottom: 8, backgroundColor: CARD_BG },
  nameRow:    { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 3 },
  name: {
    fontFamily: 'Rajdhani_700Bold', fontSize: 24, color: theme.colors.text.primary,
    flex: 1, marginRight: 8, letterSpacing: 0.5,
  },
  level: { fontFamily: 'Rajdhani_700Bold', fontSize: 20, color: theme.colors.gold.main },
  subRow: {
    flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 5, flexWrap: 'nowrap',
  },
  metaCell: { flexDirection: 'row', alignItems: 'baseline', flexShrink: 1, minWidth: 0 },
  labelGold: {
    fontFamily: 'Rajdhani_700Bold', fontSize: 10, color: theme.colors.gold.main,
    letterSpacing: 1.2, textTransform: 'uppercase',
  },
  valueWhite: {
    fontFamily: 'Rajdhani_700Bold', fontSize: 12, color: theme.colors.text.primary, flexShrink: 1,
  },
  xpTrack: {
    flexDirection: 'row', height: 3, borderRadius: 1.5, overflow: 'hidden',
    backgroundColor: '#2A2A3A', marginTop: 2,
  },
  xpFill:  { backgroundColor: theme.colors.red.vivid, borderRadius: 1.5 },
  xpEmpty: { backgroundColor: '#2A2A3A' },
  headerDivider: { height: 0.5, backgroundColor: theme.colors.border.subtle },
  scrollContent: { paddingTop: 8 },
  mainRow: { flexDirection: 'row', alignItems: 'flex-start' },
  starsRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 1,
  },
  star: { fontSize: STAR_SIZE, lineHeight: STAR_SIZE + 4 },
  attrHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5,
  },
  divider: { height: 0.5, backgroundColor: theme.colors.border.subtle, marginVertical: 10 },
  sectionTitle: {
    fontFamily: 'Rajdhani_700Bold', fontSize: 13, color: theme.colors.gold.main,
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 7,
  },
  elemRow:      { flexDirection: 'row', alignItems: 'flex-start' },
  elemGroup:    { flex: 1, alignItems: 'center', gap: 4 },
  elemLabel: {
    fontFamily: 'Rajdhani_600SemiBold', fontSize: 9, color: theme.colors.text.primary,
    letterSpacing: 0.3, textTransform: 'uppercase', textAlign: 'center',
  },
  elemIconsRow: { flexDirection: 'row', gap: 2, justifyContent: 'center', flexWrap: 'nowrap' },
  dash:         { fontFamily: 'Rajdhani_500Medium', fontSize: 16, color: theme.colors.text.secondary, lineHeight: 26 },
  skillsRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  skillGroup:   { alignItems: 'center', gap: 5 },
  skillLabel: {
    fontFamily: 'Rajdhani_500Medium', fontSize: 9, color: theme.colors.text.secondary,
    letterSpacing: 0.8, textTransform: 'uppercase', textAlign: 'center',
  },
  circlesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  closePill: {
    position: 'absolute', bottom: 12, right: 12,
    backgroundColor: 'rgba(255,255,255,0.09)',
    paddingHorizontal: 22, paddingVertical: 9,
    borderRadius: 100, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.16)',
    minHeight: 40, justifyContent: 'center',
  },
  closePillText: {
    fontFamily: 'Rajdhani_600SemiBold', fontSize: 13, color: theme.colors.text.primary, letterSpacing: 0.8,
  },
})
