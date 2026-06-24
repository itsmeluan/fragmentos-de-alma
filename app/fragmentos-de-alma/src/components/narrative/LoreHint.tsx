import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '@/lib/theme'

interface Props {
  id: string
  text: string
  onDismiss(): void
  autoDismissMs?: number
}

export function LoreHint({ text, onDismiss, autoDismissMs = 5000 }: Props) {
  const insets = useSafeAreaInsets()
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(onDismiss)
    }, autoDismissMs)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Animated.View style={[
      styles.container,
      { bottom: insets.bottom + 72, opacity },
    ]}>
      <Pressable onPress={onDismiss} style={styles.inner}>
        <Text style={styles.glyph}>◈</Text>
        <Text style={styles.text}>{text}</Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999,
  },
  inner: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 0.5,
    borderColor: theme.colors.gold.dark,
    borderLeftWidth: 2,
    padding: 14,
    minHeight: 56,
  },
  glyph: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 16,
    color: theme.colors.gold.main,
    opacity: 0.7,
    marginTop: 1,
  },
  text: {
    flex: 1,
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 12,
    color: theme.colors.text.secondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
})
