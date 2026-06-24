export const theme = {
  colors: {
    background: {
      primary: '#0A0A0F',
      secondary: '#111118',
      tertiary: '#1A1A24',
    },
    gold: {
      dark: '#8A6508',
      main: '#C8960C',
      light: '#E8B84B',
    },
    red: {
      dark: '#5C0F0F',
      blood: '#8B1A1A',
      vivid: '#C0392B',
    },
    blue: {
      cobalt: '#1A3A6E',
      main: '#2E5FA3',
      ice: '#7BA7D4',
    },
    text: {
      primary: '#E8E0D0',
      secondary: '#8A8A9A',
    },
    border: {
      subtle: '#3A3A4A',
    },
    rarity: {
      comum: '#9E9E9E',
      incomum: '#2E7D32',
      raro: '#1565C0',
      epico: '#6A1B9A',
      lendario: '#E65100',
      unico: '#B71C1C',
    },
  },

  typography: {
    title: {
      fontFamily: 'Cinzel_700Bold',
      fontSize: 28,
      letterSpacing: 2,
      color: '#C8960C',
    },
    heroName: {
      fontFamily: 'Cinzel_400Regular',
      fontSize: 18,
      letterSpacing: 1,
      color: '#E8E0D0',
    },
    stat: {
      fontFamily: 'Rajdhani_600SemiBold',
      fontSize: 16,
      letterSpacing: 0.5,
      color: '#E8E0D0',
    },
    label: {
      fontFamily: 'Rajdhani_500Medium',
      fontSize: 12,
      letterSpacing: 1.5,
      textTransform: 'uppercase' as const,
      color: '#8A8A9A',
    },
    body: {
      fontFamily: 'LibreBaskerville_400Regular',
      fontSize: 14,
      lineHeight: 22,
      color: '#E8E0D0',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 32,
  },

  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
    fusion: 2500,
  },

  border: {
    radius: {
      none: 0,
      sm: 2,
      md: 4,
      lg: 8,
    },
  },
} as const

export type Theme = typeof theme
