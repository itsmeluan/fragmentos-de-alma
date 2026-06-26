import React from 'react'
import { View } from 'react-native'
import { SvgXml } from 'react-native-svg'
import { theme } from '@/lib/theme'

const ICONS = {
  mapa: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" xmlns="http://www.w3.org/2000/svg"><path d="M3 5.5L8.5 3L14.5 5L21 3.5V18.5L14.5 21L8.5 19L3 20.5V5.5Z"/><path d="M8.5 3V19"/><path d="M14.5 5V21"/><path d="M5.5 8.5L7 7.5L9.5 8.2L11 7L13.2 8.8"/><path d="M16 9.5L18 8.4L19.5 9.2"/><path d="M5.2 13.5L7.2 12.7L10.2 13.8L12.8 12.6"/><path d="M15.7 14.6L18.5 13.2L20 14"/><path d="M17 16.5L19 14.5L21 16.5L19 18.5L17 16.5Z"/><path d="M16 16.5H14.5"/><path d="M22 16.5H23"/></svg>`,
  almas: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5L18 6V14.5L12 21.5L6 14.5V6L12 2.5Z"/><path d="M12 2.5V21.5"/><path d="M6 6L12 9L18 6"/><path d="M6 14.5L12 12L18 14.5"/><path d="M9 7.5L7.5 11L10.5 15.5"/><path d="M15 7.5L16.5 11L13.5 15.5"/><path d="M4 9L1.8 7.8"/><path d="M4.2 14L2 15.2"/><path d="M20 9L22.2 7.8"/><path d="M19.8 14L22 15.2"/></svg>`,
  ecos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L20 8L12 22L4 8L12 2Z"/><path d="M4 8H20"/><path d="M8.5 2.8L4 8"/><path d="M15.5 2.8L20 8"/><path d="M12 2V8"/><path d="M8 8L12 22"/><path d="M16 8L12 22"/></svg>`,
  fundir: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" xmlns="http://www.w3.org/2000/svg"><path d="M12 3L20 17H4L12 3Z"/><path d="M12 21L4 7H20L12 21Z"/><path d="M12 3V7"/><path d="M12 17V21"/><path d="M4 7L7.2 8.8"/><path d="M20 7L16.8 8.8"/><path d="M4 17L7.2 15.2"/><path d="M20 17L16.8 15.2"/><path d="M10 12H14"/><path d="M12 10V14"/></svg>`,
  kael: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" xmlns="http://www.w3.org/2000/svg"><path d="M9 3.5L12 2L15 3.5V6.5L13.5 8H10.5L9 6.5V3.5Z"/><path d="M7 10L10.5 8H13.5L17 10L18.5 18.5L15 21H9L5.5 18.5L7 10Z"/><path d="M8.5 10.8L4 12.5L3 17"/><path d="M15.5 10.8L20 12.5L21 17"/><path d="M10 21L9 23"/><path d="M14 21L15 23"/><path d="M10.2 12.2H13.8"/><path d="M12 12.2V16.5"/><path d="M10.5 15L12 16.5L13.5 15"/><path d="M8.8 18H15.2"/></svg>`,
} as const

export type TabIconName = keyof typeof ICONS

interface TabIconProps {
  name: TabIconName
  active: boolean
  size?: number
}

export function TabIcon({ name, active, size = 24 }: TabIconProps) {
  const color = active ? theme.colors.gold.main : theme.colors.text.secondary
  const xml = ICONS[name].replace(/currentColor/g, color)

  return (
    <View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
      <SvgXml xml={xml} width={size} height={size} />
      {active && (
        <View
          style={{
            position: 'absolute',
            bottom: 4,
            width: 3,
            height: 3,
            borderRadius: 2,
            backgroundColor: theme.colors.gold.main,
          }}
        />
      )}
    </View>
  )
}
