import React, { useState } from 'react'
import {
  View, Text, StyleSheet, Modal, Pressable, Dimensions,
} from 'react-native'
import { theme } from '@/lib/theme'

const { width: SW } = Dimensions.get('window')

interface OnboardingPage {
  glyph: string
  tag: string
  title: string
  body: string
}

const PAGES: OnboardingPage[] = [
  {
    glyph: '◈',
    tag: 'O MUNDO',
    title: 'SOLUM',
    body: 'Há mais de mil anos, o Prima — a força que sustentava o universo — se fragmentou em sete frequências. O que era equilíbrio virou conflito. Sete facções emergiram, cada uma reivindicando uma frequência como sua. Nenhuma consegue restaurar o que foi perdido sozinha.',
  },
  {
    glyph: '⧖',
    tag: 'O FRAGMENTADOR',
    title: 'KAEL',
    body: 'Você é Kael, nascido sem facção em uma cidade fronteiriça entre territórios que raramente se entendem. Você descobriu algo que o mundo teme: a habilidade de absorver almas corrompidas e fundi-las em algo novo — heróis que nunca existiram antes.',
  },
  {
    glyph: '⬡',
    tag: 'A JORNADA',
    title: 'FRAGMENTOS DE ALMA',
    body: 'Explore os sete territórios de Solum. Colete fragmentos de alma e una-os em heróis únicos. Cada fusão é irrepetível — o genoma resultante nunca existiu antes. Suas escolhas alteram o mapa político do mundo. Não há caminho perfeito.',
  },
]

interface Props {
  visible: boolean
  onComplete(): void
}

export function OnboardingModal({ visible, onComplete }: Props) {
  const [pageIndex, setPageIndex] = useState(0)
  const page = PAGES[pageIndex]
  const isLast = pageIndex === PAGES.length - 1

  const handleNext = () => {
    if (isLast) {
      onComplete()
    } else {
      setPageIndex(i => i + 1)
    }
  }

  return (
    <Modal visible={visible} animationType="fade" transparent={false} statusBarTranslucent>
      <View style={styles.root}>
        {/* Decoração de topo */}
        <View style={styles.topBar} />

        {/* Glifo central */}
        <View style={styles.glyphContainer}>
          <Text style={styles.glyph}>{page.glyph}</Text>
        </View>

        {/* Conteúdo */}
        <View style={styles.content}>
          <Text style={styles.tag}>{page.tag}</Text>
          <Text style={styles.title}>{page.title}</Text>
          <View style={styles.divider} />
          <Text style={styles.body}>{page.body}</Text>
        </View>

        {/* Indicadores de página */}
        <View style={styles.dots}>
          {PAGES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === pageIndex && styles.dotActive]}
            />
          ))}
        </View>

        {/* Ações */}
        <View style={styles.footer}>
          <Pressable
            style={styles.btn}
            onPress={handleNext}
            accessibilityRole="button"
            accessibilityLabel={isLast ? 'Começar' : 'Próximo'}
          >
            <Text style={styles.btnText}>{isLast ? 'COMEÇAR' : 'PRÓXIMO'}</Text>
          </Pressable>

          {!isLast && (
            <Pressable
              style={styles.skipBtn}
              onPress={onComplete}
              accessibilityRole="button"
              accessibilityLabel="Pular introdução"
            >
              <Text style={styles.skipText}>Pular introdução</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.colors.gold.dark,
  },
  glyphContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  glyph: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 64,
    color: theme.colors.gold.main,
    opacity: 0.6,
  },
  content: {
    gap: 12,
    marginBottom: 40,
  },
  tag: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.gold.dark,
    letterSpacing: 3,
    textAlign: 'center',
  },
  title: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 28,
    color: theme.colors.gold.main,
    letterSpacing: 4,
    textAlign: 'center',
  },
  divider: {
    height: 0.5,
    backgroundColor: theme.colors.gold.dark,
    opacity: 0.4,
    marginVertical: 8,
    marginHorizontal: SW * 0.1,
  },
  body: {
    fontFamily: 'LibreBaskerville_400Regular_Italic',
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.border.subtle,
  },
  dotActive: {
    backgroundColor: theme.colors.gold.main,
    width: 20,
    borderRadius: 3,
  },
  footer: {
    gap: 8,
  },
  btn: {
    backgroundColor: theme.colors.gold.dark,
    padding: 16,
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
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    minHeight: 48,
    justifyContent: 'center',
  },
  skipText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    letterSpacing: 1.5,
  },
})
