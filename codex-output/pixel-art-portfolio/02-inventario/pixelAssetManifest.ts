export type PixelAssetPriority = 'P0' | 'P1' | 'P2'

export type PixelAssetCategory =
  | 'identity'
  | 'ui'
  | 'resource'
  | 'gene'
  | 'hero'
  | 'kael'
  | 'boss'
  | 'map'
  | 'dungeon'
  | 'battle'
  | 'vfx'
  | 'enemy'
  | 'faction'
  | 'lore'

export interface PixelAssetSpec {
  id: string
  name: string
  category: PixelAssetCategory
  priority: PixelAssetPriority
  targetUse: string
  sourceSize: string
  exportFormat: 'png' | 'sprite-sheet' | 'app-controlled'
  notes: string
}

export const PIXEL_ART_ASSETS: readonly PixelAssetSpec[] = [
  {
    id: 'identity.app_icon',
    name: 'Ícone do App',
    category: 'identity',
    priority: 'P0',
    targetUse: 'iOS/Android launcher',
    sourceSize: '1024x1024',
    exportFormat: 'png',
    notes: 'Cristal de alma fragmentado dentro de círculo alquímico; sem texto.',
  },
  {
    id: 'identity.splash',
    name: 'Splash Vertical',
    category: 'identity',
    priority: 'P0',
    targetUse: 'abertura do app',
    sourceSize: '360x640',
    exportFormat: 'png',
    notes: 'Ritual de primeira fusão com área de respiro para UI.',
  },
  {
    id: 'ui.tab_set',
    name: 'Ícones de Tabs',
    category: 'ui',
    priority: 'P0',
    targetUse: 'Mapa, Almas, Fundir, Kael',
    sourceSize: '24x24 cada',
    exportFormat: 'png',
    notes: 'Linework pixel angular; estados ativo/inativo controlados por cor no app.',
  },
  {
    id: 'ui.core_frames',
    name: 'Frames de UI',
    category: 'ui',
    priority: 'P0',
    targetUse: 'botões, modais, painéis e cards',
    sourceSize: '9-slice variável',
    exportFormat: 'png',
    notes: 'Brackets, cantos cortados e bordas de ouro queimado.',
  },
  {
    id: 'resource.core_currencies',
    name: 'Moedas Principais',
    category: 'resource',
    priority: 'P0',
    targetUse: 'HUD e recompensas',
    sourceSize: '32x32 cada',
    exportFormat: 'png',
    notes: 'Fragmentos de Alma, Cristais de Essência e Ecos.',
  },
  {
    id: 'gene.affinity_icons',
    name: 'Ícones de Afinidade',
    category: 'gene',
    priority: 'P0',
    targetUse: 'genes, habilidades e batalha',
    sourceSize: '24x24 cada',
    exportFormat: 'png',
    notes: 'Fogo, Água, Terra, Vento, Vazio, Luz, Sombra e Éter.',
  },
  {
    id: 'gene.rarity_frames',
    name: 'Frames de Raridade',
    category: 'gene',
    priority: 'P0',
    targetUse: 'cards e detalhes de herói',
    sourceSize: '96x128 cada',
    exportFormat: 'png',
    notes: 'Comunicar raridade por cor e geometria, não apenas cor.',
  },
  {
    id: 'hero.procedural_layer_library',
    name: 'Biblioteca de Camadas de Herói',
    category: 'hero',
    priority: 'P1',
    targetUse: 'renderização procedural de heróis',
    sourceSize: '64x96 bases',
    exportFormat: 'sprite-sheet',
    notes: 'Fundo, silhueta, paleta, padrões, ornamentos e aura.',
  },
  {
    id: 'kael.core_portraits',
    name: 'Retratos de Kael',
    category: 'kael',
    priority: 'P1',
    targetUse: 'diálogos, HUD e memórias',
    sourceSize: '96x96 cada',
    exportFormat: 'png',
    notes: 'Neutro, ferido e ressonante.',
  },
  {
    id: 'boss.ancient_fragments',
    name: 'Sete Fragmentos Antigos',
    category: 'boss',
    priority: 'P1',
    targetUse: 'painel de território e batalha de núcleo',
    sourceSize: '128x160 cada',
    exportFormat: 'sprite-sheet',
    notes: 'Axis, Kethara, Mnemos, Cinderfall, Verdânia, Limiar e Vênula.',
  },
  {
    id: 'map.solum_pixel_overlays',
    name: 'Overlays Pixel do Mapa de Solum',
    category: 'map',
    priority: 'P0',
    targetUse: 'hub principal',
    sourceSize: '390x640',
    exportFormat: 'png',
    notes: 'Pode conviver com Skia: território, corrupção, pontos de interesse e compass.',
  },
  {
    id: 'dungeon.territory_splashes',
    name: 'Splashes de Território',
    category: 'dungeon',
    priority: 'P0',
    targetUse: 'entrada de dungeon',
    sourceSize: '180x320 cada',
    exportFormat: 'png',
    notes: 'Sete territórios, com área baixa segura para UI.',
  },
  {
    id: 'battle.action_icons',
    name: 'Ícones de Ação de Batalha',
    category: 'battle',
    priority: 'P0',
    targetUse: 'roda de ações',
    sourceSize: '32x32 cada',
    exportFormat: 'png',
    notes: 'Ataque, defender, trocar, habilidade, ultimate e retornar.',
  },
  {
    id: 'vfx.combat_and_fusion',
    name: 'VFX de Combate e Fusão',
    category: 'vfx',
    priority: 'P1',
    targetUse: 'batalha, fusão, revelação e mapa',
    sourceSize: 'varia por efeito',
    exportFormat: 'sprite-sheet',
    notes: 'Frames curtos, fortes e legíveis em mobile.',
  },
  {
    id: 'enemy.corrupted_soul_bases',
    name: 'Bases de Almas Corrompidas',
    category: 'enemy',
    priority: 'P1',
    targetUse: 'batalhas procedurais',
    sourceSize: '64x96 cada',
    exportFormat: 'sprite-sheet',
    notes: 'Cinco núcleos com overlays de corrupção por território.',
  },
  {
    id: 'faction.emblems',
    name: 'Emblemas de Facção',
    category: 'faction',
    priority: 'P0',
    targetUse: 'mapa, painéis e perfil',
    sourceSize: '48x48 cada',
    exportFormat: 'png',
    notes: 'Sete facções/frequências; versão ativa e inativa.',
  },
  {
    id: 'lore.memory_shards',
    name: 'Fragmentos de Memória',
    category: 'lore',
    priority: 'P1',
    targetUse: 'Codex e progressão de Kael',
    sourceSize: '32x32 cada',
    exportFormat: 'png',
    notes: 'Dez níveis de Memórias Ressurgentes; texto controlado pelo app.',
  },
] as const

export const PIXEL_ART_MVP_FILTERS = {
  prototype: ['P0'],
  visualMvp: ['P0', 'P1'],
  complete: ['P0', 'P1', 'P2'],
} as const
