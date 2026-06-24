// Torres de Ressonância — ver doc 12 (endgame, Pilar 1)
// Conteúdo vertical infinito: 100 andares em 4 zonas com mecânicas progressivas.

import { generateFragmentGenome } from '../genes/generator'
import { calculateRarity } from '../genes/rarity'
import { generateSkills } from '../skills/generator'
import { generateName } from '../../utils/nameGenerator'
import type { EnemySpec } from '../battle/types'
import type { Affinity, AttributeGenes } from '../genes/types'

// ─── Zonas e mecânicas ────────────────────────────────────────────────────────

export type TowerZone = 1 | 2 | 3 | 4

export interface TowerZoneInfo {
  zone: TowerZone
  floorStart: number
  floorEnd: number
  name: string
  mechanic: string
  mechanicDescription: string
}

export const TOWER_ZONES: Record<TowerZone, TowerZoneInfo> = {
  1: {
    zone: 1,
    floorStart: 1,
    floorEnd: 25,
    name: 'Ressonância Fraca',
    mechanic: 'Padrões Básicos',
    mechanicDescription:
      'Inimigos com stats 20–40% acima da média. Sem modificador especial. Aprenda os padrões antes de subir.',
  },
  2: {
    zone: 2,
    floorStart: 26,
    floorEnd: 50,
    name: 'Ressonância Média',
    mechanic: 'Ressonância Elemental',
    mechanicDescription:
      'A cada 5 andares, uma afinidade é amplificada: inimigos com aquela afinidade ganham +50% de dano e resistência.',
  },
  3: {
    zone: 3,
    floorStart: 51,
    floorEnd: 75,
    name: 'Ressonância Alta',
    mechanic: 'Memória de Batalha',
    mechanicDescription:
      'Inimigos observam as 3 últimas ações do jogador e aplicam a contra-estratégia no turno seguinte.',
  },
  4: {
    zone: 4,
    floorStart: 76,
    floorEnd: 100,
    name: 'Ressonância Pura',
    mechanic: 'Prima Invertido',
    mechanicDescription:
      'As regras de posição são invertidas: o herói na Frente é protegido; o herói no Fundo recebe dano prioritário.',
  },
}

// Andares com chefe ou mini-chefe
export const TOWER_BOSS_FLOORS = new Set([25, 50, 75, 100])
export const TOWER_MINI_BOSS_FLOORS = new Set([10, 35, 60, 90])
export const TOWER_CHALLENGE_FLOORS = new Set([10, 25, 35, 50, 60, 75, 90, 100])

// Recompensas por marco
export const TOWER_MILESTONE_REWARDS: Record<number, string> = {
  25:  '500 Fragmentos + 1 Cristal',
  50:  '1500 Fragmentos + 3 Cristais + fragmento raro',
  75:  '3000 Fragmentos + 5 Cristais + fragmento épico',
  100: '10000 Fragmentos + 10 Cristais + fragmento lendário + cosmético exclusivo',
}

// ─── Sessão ───────────────────────────────────────────────────────────────────

export const HP_RECOVERY_TOWER = 0.15   // 15% (vs 30% nas dungeons)

export interface TowerSession {
  currentFloor: number                             // 1–100
  heroHpSnapshot: Record<string, number>           // heroId → HP atual (−1 = usar máximo)
  totalFloorsCleared: number
  startedAt: number                                // Date.now()
}

export function createTowerSession(heroIds: string[]): TowerSession {
  return {
    currentFloor: 1,
    heroHpSnapshot: Object.fromEntries(heroIds.map(id => [id, -1])),
    totalFloorsCleared: 0,
    startedAt: Date.now(),
  }
}

export function getTowerZone(floor: number): TowerZone {
  if (floor <= 25) return 1
  if (floor <= 50) return 2
  if (floor <= 75) return 3
  return 4
}

export function getZoneStartFloor(floor: number): number {
  return TOWER_ZONES[getTowerZone(floor)].floorStart
}

export function isBossFloor(floor: number): boolean {
  return TOWER_BOSS_FLOORS.has(floor)
}

export function isTowerComplete(floor: number): boolean {
  return floor > 100
}

// Após derrota: volta ao início do bloco de 25 onde ocorreu
export function getRetreatFloor(floor: number): number {
  return getZoneStartFloor(floor)
}

// Avança para o próximo andar após vitória
export function advanceTowerFloor(session: TowerSession): TowerSession {
  return {
    ...session,
    currentFloor: session.currentFloor + 1,
    totalFloorsCleared: session.totalFloorsCleared + 1,
  }
}

// Zona 2 — afinidade amplificada: rotaciona a cada 5 andares
const AFFINITIES: Affinity[] = ['Fogo', 'Água', 'Terra', 'Vento', 'Éter', 'Luz', 'Sombra', 'Vazio']
export function getAmplifiedAffinity(floor: number): Affinity | null {
  if (floor < 26) return null
  const index = Math.floor((floor - 26) / 5) % AFFINITIES.length
  return AFFINITIES[index]
}

// ─── Geração de inimigos ──────────────────────────────────────────────────────

export function generateTowerFloorEnemies(
  floor: number,
  seed: string
): EnemySpec[] {
  const zone = getTowerZone(floor)
  const isBoss = TOWER_BOSS_FLOORS.has(floor)
  const isMiniBoss = TOWER_MINI_BOSS_FLOORS.has(floor)

  // Chefes e mini-chefes: 1 inimigo mais forte; andares normais: 1–3
  const count = isBoss ? 1 : isMiniBoss ? 2 : Math.min(3, 1 + Math.floor(floor / 20))

  return Array.from({ length: count }, (_, i) => {
    const enemySeed = `tower-f${floor}-e${i}-${seed}`
    const genome = generateFragmentGenome()

    // Escala de stats base por zona
    const zoneMultiplier = { 1: 1.3, 2: 1.6, 3: 2.0, 4: 2.5 }[zone]
    const floorBonus = floor * 6

    genome.attributes.forca = Math.min(100, Math.round(genome.attributes.forca * zoneMultiplier) + floorBonus)
    genome.attributes.resistencia = Math.min(100, Math.round(genome.attributes.resistencia * zoneMultiplier) + Math.floor(floorBonus * 0.8))
    genome.attributes.agilidade = Math.min(100, Math.round(genome.attributes.agilidade * zoneMultiplier))
    genome.attributes.ressonancia = Math.min(100, Math.round(genome.attributes.ressonancia * zoneMultiplier))

    // Zona 2+: mutações garantidas nos atributos
    if (zone >= 2) {
      const mutationCount = zone >= 4 ? 3 : zone >= 3 ? 2 : 1
      const attrKeys = Object.keys(genome.attributes) as (keyof AttributeGenes)[]
      for (let m = 0; m < mutationCount; m++) {
        const key = attrKeys[Math.abs(seed.charCodeAt(m % seed.length) + i + m) % attrKeys.length]
        genome.attributes[key] = Math.min(100, genome.attributes[key] + 20)
      }
    }

    // Zona 4: todos os atributos ao máximo
    if (zone === 4) {
      const attrKeys = Object.keys(genome.attributes) as (keyof AttributeGenes)[]
      for (const key of attrKeys) {
        genome.attributes[key] = 100
      }
    }

    // Chefes: boost adicional de HP indireto (via resistencia maxed)
    if (isBoss) {
      genome.attributes.resistencia = 100
      genome.attributes.vontade = Math.min(100, genome.attributes.vontade + 30)
    }

    const rarity = calculateRarity(genome)

    return {
      id: `tower-f${floor}-e${i}`,
      name: generateName(genome, enemySeed),
      genome,
      rarity,
      skills: generateSkills(genome, rarity, enemySeed),
      level: Math.max(1, floor),
      aiPattern: isBoss ? 'random' : i === 0 ? 'aggressive' : 'defensive',
    } satisfies EnemySpec
  })
}

// Quantos territórios precisam estar com progresso para desbloquear a torre
export const TOWER_UNLOCK_TERRITORIES = 4
