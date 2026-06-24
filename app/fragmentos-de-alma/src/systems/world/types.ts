export type TerritoryId =
  | 'kethara'
  | 'mnemos'
  | 'cinderfall'
  | 'verdania'
  | 'limiar'
  | 'axis'
  | 'venula'

export interface TerritoryState {
  id: TerritoryId
  corruptionLevel: number // 0-100
  playerProgress: {
    surfaceFloors: number  // 0-10
    depthsFloors: number   // 0-10
    bossDefeated: boolean
  }
  factionReputation: number // -100 to 100
  politicalTension: { neighborId: TerritoryId; tensionLevel: number }[]
}

export interface WorldState {
  territories: Record<TerritoryId, TerritoryState>
  globalCorruption: number
  currentCycle: number
  activeFactionWar?: { factionA: string; factionB: string; territory: TerritoryId }
  activeEvent?: { id: string; name: string; affinity: string; endsAt: string }
}
