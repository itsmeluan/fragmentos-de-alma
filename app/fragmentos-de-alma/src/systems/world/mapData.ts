import type { TerritoryId } from './types'

export const MAP_WIDTH = 390
export const MAP_HEIGHT = 640

export interface TerritoryDef {
  id: TerritoryId
  name: string
  faction: string
  factionLabel: string
  affinityLabel: string
  color: string
  svgPath: string
  center: readonly [number, number]
  labelAnchor: readonly [number, number]
  neighbors: TerritoryId[]
  lore: string
}

export const TERRITORY_DEFS: TerritoryDef[] = [
  {
    id: 'axis',
    name: 'Axis',
    faction: 'arquitetos_veu',
    factionLabel: 'Arquitetos do Véu',
    affinityLabel: 'Realidade',
    color: '#7C4DFF',
    svgPath: 'M 155 20 L 235 20 L 262 108 L 195 142 L 128 108 Z',
    center: [195, 82],
    labelAnchor: [195, 78],
    neighbors: ['kethara', 'mnemos'],
    lore: 'O nó central de Solum onde as leis da Realidade foram escritas pelos Arquitetos. Aqui, a Prima circula em padrões geométricos perfeitos — e as fissuras entre o que é e o que poderia ser são seladas.',
  },
  {
    id: 'kethara',
    name: 'Kethara',
    faction: 'pedra_viva',
    factionLabel: 'Pedra Viva',
    affinityLabel: 'Matéria',
    color: '#C8960C',
    svgPath: 'M 12 78 L 148 62 L 174 180 L 124 260 L 12 228 Z',
    center: [88, 168],
    labelAnchor: [82, 164],
    neighbors: ['axis', 'verdania'],
    lore: 'Montanhas de cristal vivo que cantam ao amanhecer. A Pedra Viva carrega a memória de mil anos de erosão e renascimento — cada pedra é uma carta de um ancestral.',
  },
  {
    id: 'mnemos',
    name: 'Mnemos',
    faction: 'veu_dos_ecos',
    factionLabel: 'Véu dos Ecos',
    affinityLabel: 'Mente',
    color: '#5B9BD5',
    svgPath: 'M 242 62 L 378 78 L 378 228 L 266 260 L 216 180 Z',
    center: [306, 168],
    labelAnchor: [310, 164],
    neighbors: ['axis', 'verdania'],
    lore: 'Planícies envoltas em névoa onde cada passo deixa uma impressão mental. O Véu dos Ecos coleta sonhos dos viajantes e os tece em armas de pensamento puro.',
  },
  {
    id: 'verdania',
    name: 'Verdânia',
    faction: 'jardim_perpetuo',
    factionLabel: 'Jardim Perpétuo',
    affinityLabel: 'Vida',
    color: '#27AE60',
    svgPath: 'M 110 244 L 280 244 L 322 378 L 195 422 L 68 378 Z',
    center: [195, 330],
    labelAnchor: [195, 322],
    neighbors: ['kethara', 'mnemos', 'cinderfall', 'limiar'],
    lore: 'O coração verde de Solum. O Jardim Perpétuo cresce, morre e renasce em ciclos contínuos, absorvendo a corrupção dos territórios vizinhos e a transformando em vida nova.',
  },
  {
    id: 'cinderfall',
    name: 'Cinderfall',
    faction: 'chama_negra',
    factionLabel: 'Chama Negra',
    affinityLabel: 'Alma',
    color: '#E05C35',
    svgPath: 'M 12 362 L 122 362 L 150 462 L 78 548 L 12 500 Z',
    center: [80, 452],
    labelAnchor: [74, 444],
    neighbors: ['verdania', 'venula'],
    lore: 'Vulcões extintos que ainda exalam cinzas de almas passadas. A Chama Negra acredita que a morte é combustível — e que queimar completamente é a única forma de transcender.',
  },
  {
    id: 'limiar',
    name: 'Limiar',
    faction: 'confraria_limiar',
    factionLabel: 'Confraria do Limiar',
    affinityLabel: 'Morte',
    color: '#9E9E9E',
    svgPath: 'M 268 362 L 378 362 L 378 500 L 312 548 L 240 462 Z',
    center: [312, 452],
    labelAnchor: [316, 444],
    neighbors: ['verdania', 'venula'],
    lore: 'Deserto de ossos brancos onde o tempo passa de forma diferente. A Confraria do Limiar estuda a fronteira entre existir e não existir — e cobra passagem para atravessá-la.',
  },
  {
    id: 'venula',
    name: 'Vênula',
    faction: 'ordem_carmesim',
    factionLabel: 'Ordem Carmesim',
    affinityLabel: 'Sangue',
    color: '#C62828',
    svgPath: 'M 70 544 L 320 544 L 302 628 L 88 628 Z',
    center: [195, 582],
    labelAnchor: [195, 576],
    neighbors: ['cinderfall', 'limiar'],
    lore: 'Pântanos cor de rubi onde a Prima circula como sangue vivo. A Ordem Carmesim controla os fluxos vitais de toda Solum — e cobra tributo em essência por cada veia que percorre.',
  },
]

export interface PrimaFlowPair {
  from: TerritoryId
  to: TerritoryId
  cp: readonly [number, number]
}

export const PRIMA_FLOW_PAIRS: PrimaFlowPair[] = [
  { from: 'axis',       to: 'kethara',    cp: [118, 100] },
  { from: 'axis',       to: 'mnemos',     cp: [272, 100] },
  { from: 'kethara',    to: 'verdania',   cp: [78,  258] },
  { from: 'mnemos',     to: 'verdania',   cp: [312, 258] },
  { from: 'verdania',   to: 'cinderfall', cp: [95,  388] },
  { from: 'verdania',   to: 'limiar',     cp: [295, 388] },
  { from: 'cinderfall', to: 'venula',     cp: [78,  530] },
  { from: 'limiar',     to: 'venula',     cp: [312, 530] },
]

export function getTerritoryDef(id: TerritoryId): TerritoryDef {
  return TERRITORY_DEFS.find(t => t.id === id)!
}
