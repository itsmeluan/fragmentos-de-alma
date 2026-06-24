import React, { useState } from 'react'
import {
  View, Text, StyleSheet, Modal, Pressable,
} from 'react-native'
import { theme } from '@/lib/theme'

interface Beat {
  speaker?: string
  text: string
}

const BEATS: Beat[] = [
  {
    text: 'A cidade de Crena fica entre Kethara e Limiar. Não pertence a nenhuma facção. Nenhuma a protege.',
  },
  {
    text: 'Naquela noite, as Almas Corrompidas chegaram antes dos guardas. Chegaram antes de tudo.',
  },
  {
    text: 'Meu mentor estava na rua quando a primeira delas o alcançou. Eu não tinha arma. Não tinha treinamento. Não tinha nada.',
  },
  {
    text: 'Não sei como aconteceu. Só sei que a alma da criatura entrou em mim — e algo que eu já carregava sem saber veio ao encontro dela.',
  },
  {
    text: 'O resultado surgiu entre nós: um ser que nunca havia existido. Meu primeiro herói.',
  },
  {
    text: 'Salvei meu mentor dos Corrompidos. Mas não o salvei dos Arquitetos do Véu. Eles viram a fusão. Interpretaram como ameaça. Agiram antes de perguntar.',
  },
  {
    speaker: 'KAEL',
    text: 'Saí de Crena sozinho. Com uma pergunta que não sai da cabeça: por que o mundo teme o que não entende antes de tentar entender?',
  },
]

interface Props {
  visible: boolean
  onComplete(): void
}

export function PrologueModal({ visible, onComplete }: Props) {
  const [beatIndex, setBeatIndex] = useState(0)
  const beat = BEATS[beatIndex]
  const isLast = beatIndex === BEATS.length - 1
  const progress = (beatIndex + 1) / BEATS.length

  const handleNext = () => {
    if (isLast) {
      onComplete()
    } else {
      setBeatIndex(i => i + 1)
    }
  }

  return (
    <Modal visible={visible} animationType="fade" transparent={false} statusBarTranslucent>
      <View style={styles.root}>
        {/* Barra de progresso */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as `${number}%` }]} />
        </View>

        {/* Número do beat */}
        <Text style={styles.beatNumber}>{beatIndex + 1} / {BEATS.length}</Text>

        {/* Conteúdo narrativo */}
        <View style={styles.content}>
          {beat.speaker && (
            <Text style={styles.speaker}>{beat.speaker}</Text>
          )}
          <Text style={styles.text}>
            {beat.speaker ? `"${beat.text}"` : beat.text}
          </Text>
        </View>

        {/* Ornamento decorativo */}
        <Text style={styles.ornament}>— ◈ —</Text>

        {/* Ação */}
        <Pressable
          style={styles.btn}
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Iniciar jornada' : 'Continuar'}
        >
          <Text style={styles.btnText}>{isLast ? 'INICIAR JORNADA' : 'CONTINUAR'}</Text>
        </Pressable>
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
    paddingBottom: 56,
  },
  progressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.colors.background.tertiary,
  },
  progressFill: {
    height: 2,
    backgroundColor: theme.colors.gold.dark,
  },
  beatNumber: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    letterSpacing: 2,
  },
  content: {
    gap: 16,
    marginBottom: 40,
  },
  speaker: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.gold.main,
    letterSpacing: 3,
    textAlign: 'center',
  },
  text: {
    fontFamily: 'LibreBaskerville_400Regular_Italic',
    fontSize: 16,
    color: theme.colors.text.primary,
    lineHeight: 28,
    textAlign: 'center',
  },
  ornament: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 14,
    color: theme.colors.gold.dark,
    opacity: 0.5,
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 4,
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
})
