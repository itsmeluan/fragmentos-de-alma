// AUTO-GERADO — não editar à mão.
// Backgrounds de batalha por raridade × origem. 42 imagens total.

export type BackgroundOrigin = 'axis' | 'cinderfall' | 'kethara' | 'limiar' | 'mnemos' | 'venula' | 'verdania'
export type BackgroundRarity = 'comum' | 'incomum' | 'raro' | 'epico' | 'lendario' | 'unico'

// [raridade][origem] = asset module (require)
export const BACKGROUND_REGISTRY: Record<BackgroundRarity, Record<BackgroundOrigin, number>> = {
  comum: {
    axis: require('../../../assets/sprites/backgrounds/comum/axis.png'),
    cinderfall: require('../../../assets/sprites/backgrounds/comum/cinderfall.png'),
    kethara: require('../../../assets/sprites/backgrounds/comum/kethara.png'),
    limiar: require('../../../assets/sprites/backgrounds/comum/limiar.png'),
    mnemos: require('../../../assets/sprites/backgrounds/comum/mnemos.png'),
    venula: require('../../../assets/sprites/backgrounds/comum/venula.png'),
    verdania: require('../../../assets/sprites/backgrounds/comum/verdania.png'),
  },
  incomum: {
    axis: require('../../../assets/sprites/backgrounds/incomum/axis.png'),
    cinderfall: require('../../../assets/sprites/backgrounds/incomum/cinderfall.png'),
    kethara: require('../../../assets/sprites/backgrounds/incomum/kethara.png'),
    limiar: require('../../../assets/sprites/backgrounds/incomum/limiar.png'),
    mnemos: require('../../../assets/sprites/backgrounds/incomum/mnemos.png'),
    venula: require('../../../assets/sprites/backgrounds/incomum/venula.png'),
    verdania: require('../../../assets/sprites/backgrounds/incomum/verdania.png'),
  },
  raro: {
    axis: require('../../../assets/sprites/backgrounds/raro/axis.png'),
    cinderfall: require('../../../assets/sprites/backgrounds/raro/cinderfall.png'),
    kethara: require('../../../assets/sprites/backgrounds/raro/kethara.png'),
    limiar: require('../../../assets/sprites/backgrounds/raro/limiar.png'),
    mnemos: require('../../../assets/sprites/backgrounds/raro/mnemos.png'),
    venula: require('../../../assets/sprites/backgrounds/raro/venula.png'),
    verdania: require('../../../assets/sprites/backgrounds/raro/verdania.png'),
  },
  epico: {
    axis: require('../../../assets/sprites/backgrounds/epico/axis.png'),
    cinderfall: require('../../../assets/sprites/backgrounds/epico/cinderfall.png'),
    kethara: require('../../../assets/sprites/backgrounds/epico/kethara.png'),
    limiar: require('../../../assets/sprites/backgrounds/epico/limiar.png'),
    mnemos: require('../../../assets/sprites/backgrounds/epico/mnemos.png'),
    venula: require('../../../assets/sprites/backgrounds/epico/venula.png'),
    verdania: require('../../../assets/sprites/backgrounds/epico/verdania.png'),
  },
  lendario: {
    axis: require('../../../assets/sprites/backgrounds/lendario/axis.png'),
    cinderfall: require('../../../assets/sprites/backgrounds/lendario/cinderfall.png'),
    kethara: require('../../../assets/sprites/backgrounds/lendario/kethara.png'),
    limiar: require('../../../assets/sprites/backgrounds/lendario/limiar.png'),
    mnemos: require('../../../assets/sprites/backgrounds/lendario/mnemos.png'),
    venula: require('../../../assets/sprites/backgrounds/lendario/venula.png'),
    verdania: require('../../../assets/sprites/backgrounds/lendario/verdania.png'),
  },
  unico: {
    axis: require('../../../assets/sprites/backgrounds/unico/axis.png'),
    cinderfall: require('../../../assets/sprites/backgrounds/unico/cinderfall.png'),
    kethara: require('../../../assets/sprites/backgrounds/unico/kethara.png'),
    limiar: require('../../../assets/sprites/backgrounds/unico/limiar.png'),
    mnemos: require('../../../assets/sprites/backgrounds/unico/mnemos.png'),
    venula: require('../../../assets/sprites/backgrounds/unico/venula.png'),
    verdania: require('../../../assets/sprites/backgrounds/unico/verdania.png'),
  },
}

export function getBattleBackground(rarity: BackgroundRarity, origin: BackgroundOrigin): number {
  return BACKGROUND_REGISTRY[rarity]?.[origin] ?? BACKGROUND_REGISTRY.comum.axis
}
