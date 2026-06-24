import React from 'react'
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native'
import { theme } from '@/lib/theme'

type Variant = 'primary' | 'secondary' | 'danger'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: Variant
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
}

export function Button({ label, onPress, variant = 'primary', disabled, loading, style }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? '#0A0A0F' : '#E8E0D0'} size="small" />
        : <Text style={[styles.label, styles[`${variant}Label` as const]]}>{label}</Text>
      }
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: theme.border.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: theme.colors.gold.main,
    shadowColor: theme.colors.gold.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.gold.dark,
  },
  danger: {
    backgroundColor: theme.colors.red.blood,
    borderWidth: 1,
    borderColor: theme.colors.red.vivid,
  },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.4 },
  label: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  primaryLabel: { color: '#0A0A0F' },
  secondaryLabel: { color: theme.colors.text.primary },
  dangerLabel: { color: theme.colors.text.primary },
})
