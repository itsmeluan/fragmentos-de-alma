import React from 'react'
import { Modal as RNModal, View, Text, StyleSheet, Pressable, type StyleProp, type ViewStyle } from 'react-native'
import { theme } from '@/lib/theme'
import { CornerBracket } from './Ornaments'

interface ModalProps {
  visible: boolean
  title?: string
  onClose: () => void
  children: React.ReactNode
  fill?: boolean
  containerStyle?: StyleProp<ViewStyle>
}

export function Modal({ visible, title, onClose, children, fill, containerStyle }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/*
       * Backdrop e container são irmãos. O Pressable cobre tudo (absoluteFill)
       * para fechar ao tocar fora. O container é renderizado depois (z-order maior)
       * e recebe os toques na área do modal — sem nenhum handler próprio, deixando
       * ScrollView e outros filhos capturarem gestos livremente.
       */}
      <View style={styles.overlay} pointerEvents="box-none">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.container, fill && styles.containerFill, containerStyle]}>
          <View style={styles.topAccent} />
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <CornerBracket position="tl" />
            <CornerBracket position="tr" />
          </View>
          {title && (
            <View style={styles.titleRow}>
              <View style={styles.titleLine} />
              <Text style={styles.title}>{title}</Text>
              <View style={styles.titleLine} />
            </View>
          )}
          {children}
        </View>
      </View>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.background.secondary,
    borderTopLeftRadius: theme.border.radius.md,
    borderTopRightRadius: theme.border.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    paddingTop: theme.spacing.md,
    maxHeight: '90%',
  },
  containerFill: {
    height: '88%',
  },
  topAccent: {
    height: 2,
    backgroundColor: theme.colors.gold.main,
    marginBottom: theme.spacing.md,
    borderRadius: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  titleLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: theme.colors.border.subtle,
  },
  title: {
    ...theme.typography.title,
    fontSize: 18,
    textAlign: 'center',
  },
})
