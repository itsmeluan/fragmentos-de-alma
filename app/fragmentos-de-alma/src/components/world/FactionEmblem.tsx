import React from 'react'
import { View, type ViewStyle } from 'react-native'
import { SvgXml } from 'react-native-svg'

const EMBLEMS = {
  'chama-eterna': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8H52V28C52 43 43 54 32 60C21 54 12 43 12 28V8Z" fill="#8B1A1A" stroke="#C0392B" stroke-width="2"/><path d="M31 49C21 41 21 31 28 21C29 30 36 29 36 18C46 31 43 42 31 49Z" fill="#C0392B"/><path d="M34 47C28 41 29 34 33 28C34 35 40 34 39 27C45 36 42 43 34 47Z" fill="#FF6B3D" opacity="0.85"/><path d="M19 14H45" stroke="#FF6B3D" stroke-width="1.5"/></svg>`,
  'mare-profunda': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8H52V28C52 43 43 54 32 60C21 54 12 43 12 28V8Z" fill="#0D47A1" stroke="#1565C0" stroke-width="2"/><path d="M18 36L25 29L32 36L39 29L46 36" stroke="#42A5F5" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter"/><path d="M18 44L25 39L32 44L39 39L46 44" stroke="#42A5F5" stroke-width="2" opacity="0.7"/><path d="M32 15V42" stroke="#42A5F5" stroke-width="2"/><path d="M25 22H39" stroke="#42A5F5" stroke-width="2"/><path d="M24 31C24 41 40 41 40 31" stroke="#42A5F5" stroke-width="2"/></svg>`,
  'punho-de-pedra': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8H52V28C52 43 43 54 32 60C21 54 12 43 12 28V8Z" fill="#3E2723" stroke="#4E342E" stroke-width="2"/><path d="M20 28H44V43L38 49H26L20 43V28Z" fill="#4E342E" stroke="#A1887F" stroke-width="2"/><path d="M20 22H27V30H20V22Z" fill="#A1887F"/><path d="M28 18H35V30H28V18Z" fill="#A1887F"/><path d="M36 21H44V30H36V21Z" fill="#A1887F"/><path d="M32 34L40 40L32 47L24 40L32 34Z" fill="#3E2723" stroke="#A1887F" stroke-width="1.5"/></svg>`,
  'vento-livre': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8H52V28C52 43 43 54 32 60C21 54 12 43 12 28V8Z" fill="#263238" stroke="#37474F" stroke-width="2"/><path d="M19 37L31 25L45 29L36 38L24 40" stroke="#B0BEC5" stroke-width="2.5" stroke-linejoin="miter"/><path d="M26 21L44 43" stroke="#B0BEC5" stroke-width="2"/><path d="M18 45L38 25" stroke="#B0BEC5" stroke-width="2"/><path d="M21 25L30 21L29 30" fill="#37474F" stroke="#B0BEC5" stroke-width="1.5"/><path d="M43 39L34 43L35 34" fill="#37474F" stroke="#B0BEC5" stroke-width="1.5"/></svg>`,
  'veu-etereo': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8H52V28C52 43 43 54 32 60C21 54 12 43 12 28V8Z" fill="#4A148C" stroke="#6A1B9A" stroke-width="2"/><path d="M16 32L32 18L48 32L32 46L16 32Z" fill="#6A1B9A" opacity="0.45" stroke="#CE93D8" stroke-width="2"/><path d="M23 32L32 25L41 32L32 39L23 32Z" stroke="#CE93D8" stroke-width="2"/><path d="M29 32L32 29L35 32L32 35L29 32Z" fill="#CE93D8"/><path d="M20 44C26 49 38 49 44 44" stroke="#CE93D8" stroke-width="1.5" opacity="0.6"/></svg>`,
  'coroa-solar': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8H52V28C52 43 43 54 32 60C21 54 12 43 12 28V8Z" fill="#E65100" stroke="#F57F17" stroke-width="2"/><path d="M18 39L22 22L29 34L32 18L35 34L42 22L46 39H18Z" fill="#F57F17" stroke="#FFF176" stroke-width="2"/><path d="M19 45H45" stroke="#FFF176" stroke-width="2"/><path d="M32 8V14" stroke="#FFF176" stroke-width="1.5"/><path d="M48 14L44 18" stroke="#FFF176" stroke-width="1.5"/><path d="M16 14L20 18" stroke="#FFF176" stroke-width="1.5"/></svg>`,
  'sombra-vasta': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8H52V28C52 43 43 54 32 60C21 54 12 43 12 28V8Z" fill="#0D0D1A" stroke="#1A1A2E" stroke-width="2"/><path d="M18 25L32 15L46 25L42 44L32 50L22 44L18 25Z" fill="#1A1A2E" stroke="#7B1FA2" stroke-width="2"/><path d="M24 31L30 29L27 35L24 31Z" fill="#7B1FA2"/><path d="M40 31L34 29L37 35L40 31Z" fill="#7B1FA2"/><path d="M27 42H37" stroke="#7B1FA2" stroke-width="2"/><path d="M12 30L4 26M52 30L60 26M16 45L8 52M48 45L56 52" stroke="#7B1FA2" stroke-width="1.5" opacity="0.65"/></svg>`,
} as const

type FactionKey = keyof typeof EMBLEMS

interface FactionEmblemProps {
  faction: string
  size?: number
  style?: ViewStyle
}

function normalizeFaction(faction: string): FactionKey {
  const key = faction
    .trim()
    .toLowerCase()
    .replace(/[áàãâ]/g, 'a')
    .replace(/[éê]/g, 'e')
    .replace(/[í]/g, 'i')
    .replace(/[óôõ]/g, 'o')
    .replace(/[úü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')

  if (key in EMBLEMS) return key as FactionKey
  return 'chama-eterna'
}

export function FactionEmblem({ faction, size = 64, style }: FactionEmblemProps) {
  const xml = EMBLEMS[normalizeFaction(faction)]

  return (
    <View style={[{ width: size, height: size }, style]}>
      <SvgXml xml={xml} width={size} height={size} />
    </View>
  )
}
