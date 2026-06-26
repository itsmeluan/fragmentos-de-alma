import React, { useMemo, useState } from 'react'
import { View, Text, Pressable, StyleSheet, Image as RNImage } from 'react-native'
import * as Haptics from 'expo-haptics'
import {
  Canvas, FilterMode, Image as SkiaImage, MipmapMode, useImage,
} from '@shopify/react-native-skia'
import { theme } from '@/lib/theme'
import { resolveHeroSprite } from '@/systems/visual/heroSprite'
import { getOriginBackground } from '@/systems/visual/originBackgroundRegistry'
import { ELEMENT_ICONS } from '@/systems/visual/elementRegistry'
import type { Hero, Rarity } from '@/systems/genes/types'

const RARITY_STARS: Record<Rarity, number> = {
  comum: 1, incomum: 2, raro: 3, epico: 4, lendario: 5, unico: 6,
}

// Sprites únicos têm conteúdo mais denso — inset de 10% normaliza o tamanho visual
const UNICO_SPRITE_INSET_RATIO = 0.10

const TOP_H = 26       // faixa superior: nome + nível
const BOT_INFO_H = 22  // linha: ícone de elemento + classe · origem
const BOT_STARS_H = 20 // linha: estrelas de raridade
const BOT_H = BOT_INFO_H + BOT_STARS_H
const CARD_RADIUS = 8
// Inset apenas horizontal: cria leve gap visual entre borda do card e a arte,
// sem gap vertical (os strips cobrem topo e base da arte sem deixar fundo escuro exposto)
const H_INSET = 5

interface HeroCardProps {
  hero: Hero
  onPress: (hero: Hero) => void
  rosterRole?: 'team' | 'bench'
  disabled?: boolean
  disabledLabel?: string
  width?: number
}

export function HeroCard({ hero, onPress, rosterRole, disabled, disabledLabel, width }: HeroCardProps) {
  const { essence, attributes } = hero.genome
  const rarityColor = theme.colors.rarity[hero.rarity]
  const starCount = RARITY_STARS[hero.rarity]
  const seed = hero.visualParams?.seed || hero.fusionSeed || hero.id
  const [artSize, setArtSize] = useState(0)

  const resolved = useMemo(
    () => resolveHeroSprite(essence.core, hero.rarity, attributes, 'south'),
    [essence.core, hero.rarity, attributes]
  )
  const spriteImage = useImage(resolved.source ?? undefined)

  const bgSource = useMemo(
    () => getOriginBackground(essence.origin, hero.rarity, seed),
    [essence.origin, hero.rarity, seed]
  )
  const bgImage = useImage(bgSource)

  const spriteInset = hero.rarity === 'unico' ? artSize * UNICO_SPRITE_INSET_RATIO : 0
  const nameColor = '#e8dfc8'

  return (
    // Wrapper externo carrega a sombra — overflow:hidden no card interno cancelaria a sombra no iOS
    <View style={[
      styles.shadow,
      width != null && { flex: 0, width },
      disabled && styles.disabledCard,
    ]}>
    <Pressable
      onPress={() => {
        if (disabled) return
        Haptics.selectionAsync().catch(() => {})
        onPress(hero)
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        rosterRole === 'team' && styles.teamCard,
        rosterRole === 'bench' && styles.benchCard,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {/* Espaço reservado para a faixa superior */}
      <View style={styles.topSpacer} />

      {/* Área de arte — quadrada, inset apenas nas laterais.
          O topo toca a base do topStrip e a base toca o topo do botStrip,
          eliminando o fundo escuro do card visível ao redor do PNG. */}
      <View
        style={styles.artworkWrap}
        onLayout={e => setArtSize(e.nativeEvent.layout.width)}
      >
        {artSize > 0 && (
          <Canvas style={{ width: artSize, height: artSize }}>
            {bgImage && (
              <SkiaImage
                image={bgImage}
                x={0} y={0}
                width={artSize} height={artSize}
                fit="cover"
                sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.None }}
              />
            )}
            {spriteImage && (
              <SkiaImage
                image={spriteImage}
                x={spriteInset} y={spriteInset}
                width={artSize - 2 * spriteInset}
                height={artSize - 2 * spriteInset}
                fit="contain"
                sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.None }}
              />
            )}
          </Canvas>
        )}
      </View>

      {/* Espaço reservado para a faixa inferior */}
      <View style={styles.botSpacer} />

      {/* Faixa superior — nome (branco bold) + nível (dourado bold) */}
      <View style={styles.topStrip}>
        <Text
          style={[styles.heroName, { color: nameColor }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {hero.name}
        </Text>
        <Text style={styles.heroLevel}>Nv.{hero.level}</Text>
      </View>

      {/* Faixa inferior — linha de info + linha de estrelas */}
      <View style={styles.botStrip}>
        <View style={styles.infoRow}>
          <RNImage
            source={ELEMENT_ICONS[essence.affinity]}
            style={styles.elemIcon}
            resizeMode="contain"
          />
          <Text style={styles.classOrigin} numberOfLines={1}>
            {essence.core} · {essence.origin}
          </Text>
        </View>
        <View style={styles.starsRow}>
          {Array.from({ length: 6 }, (_, i) => (
            <Text key={i} style={[styles.star, { color: i < starCount ? rarityColor : '#1e1630' }]}>
              ★
            </Text>
          ))}
        </View>
      </View>

      {/* Badge de roster */}
      {rosterRole && (
        <View style={[
          styles.rosterBadge,
          rosterRole === 'team' ? styles.teamBadge : styles.benchBadge,
        ]}>
          <Text style={styles.rosterText}>{rosterRole === 'team' ? 'TIME' : 'BANCO'}</Text>
        </View>
      )}

      {disabled && (
        <View style={styles.disabledOverlay}>
          <Text style={styles.disabledLabel}>{disabledLabel ?? 'INDISPONÍVEL'}</Text>
        </View>
      )}
    </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  // Wrapper externo: carrega sombra roxa. Não tem overflow:hidden para a sombra aparecer no iOS.
  shadow: {
    flex: 1,
    borderRadius: CARD_RADIUS,
    backgroundColor: '#09080f',
    shadowColor: '#2a0d60',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.55,
    shadowRadius: 6,
    elevation: 6,
  },
  card: {
    flex: 1,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  teamCard: { borderWidth: 1.5, borderColor: theme.colors.gold.main + '66' },
  benchCard: { borderWidth: 1.5, borderColor: theme.colors.blue.ice + '66' },
  disabledCard: { opacity: 0.45 },
  pressed: { opacity: 0.85 },
  // Sem ARTWORK_INSET vertical: artwork entra direto sob o topStrip e cobre até o botStrip
  topSpacer: { height: TOP_H },
  artworkWrap: {
    marginHorizontal: H_INSET,
    aspectRatio: 1,
  },
  botSpacer: { height: BOT_H },
  topStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: TOP_H,
    backgroundColor: 'rgba(4,3,10,0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 4,
  },
  heroName: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    flex: 1,
  },
  heroLevel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.gold.main,
    letterSpacing: 0.4,
    flexShrink: 0,
  },
  botStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BOT_H,
    backgroundColor: 'rgba(4,3,10,0.92)',
  },
  infoRow: {
    height: BOT_INFO_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: H_INSET,
    paddingRight: 5,
    gap: 4,
  },
  elemIcon: {
    width: 13,
    height: 13,
  },
  classOrigin: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 8.5,
    color: '#8a8098',
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  starsRow: {
    height: BOT_STARS_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  star: {
    fontSize: 11,
    lineHeight: 12,
  },
  rosterBadge: {
    position: 'absolute',
    top: TOP_H + 4,
    right: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderRadius: 2,
  },
  teamBadge: {
    backgroundColor: theme.colors.gold.main,
    borderColor: theme.colors.gold.light,
  },
  benchBadge: {
    backgroundColor: theme.colors.blue.cobalt,
    borderColor: theme.colors.blue.ice,
  },
  rosterText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 7,
    color: theme.colors.background.primary,
    letterSpacing: 0.8,
  },
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,15,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  disabledLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.text.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
})
