// Ressonância Crítica — ultimate em dupla ativado por pares de afinidade sinérgicos.
// Ver doc 06_sistema_de_batalha.md (seção D64).
// Função pura: sem estado interno, sem efeitos colaterais.

import type { Affinity, Rarity } from '../genes/types'
import { heroBondStars } from '../progression/legacy'
import type { Combatant, BattleEvent, BattleState } from './types'
import { isActiveSlot } from './types'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ResonanceType = 'dano' | 'suporte' | 'cura'
export type ResonanceVariant = 'bruta' | 'elemental' | 'agil'

export interface ResonanceDef {
  name: string
  type: ResonanceType
  affinityA: Affinity
  affinityB: Affinity
  description: string
}

export interface ResonancePair {
  heroA: Combatant
  heroB: Combatant
  def: ResonanceDef
  variant: ResonanceVariant
  exaltada: boolean
}

// ─── Tabela de sinergia (D64) — simétrica, 12 pares sem repetição ─────────────
// DANO: água+terra, éter+vazio, fogo+vento, luz+sombra
// SUPORTE: água+vazio, éter+fogo, luz+terra, sombra+vento
// CURA: água+vento, éter+luz, fogo+sombra, terra+vazio

const RESONANCE_TABLE: ResonanceDef[] = [
  // ─── DANO ──────────────────────────────────────────────────────────────────
  {
    name: 'Dilúvio Pétreo',
    type: 'dano',
    affinityA: 'Água',
    affinityB: 'Terra',
    description: 'Água e terra colapsam em torrente de lama e pedras — dano elemental em área + redução de agilidade em todos os inimigos por 2 turnos.',
  },
  {
    name: 'Colapso Dimensional',
    type: 'dano',
    affinityA: 'Éter',
    affinityB: 'Vazio',
    description: 'Éter e vazio se aniquilam em implosão singular — dano massivo em alvo único + drena 20 de ultimate do alvo.',
    },
  {
    name: 'Tempestade Ardente',
    type: 'dano',
    affinityA: 'Fogo',
    affinityB: 'Vento',
    description: 'Fogo e vento formam redemoinho de chamas — dano elemental em área + queimadura (DoT) por 2 turnos em todos os inimigos.',
  },
  {
    name: 'Colisão Primordial',
    type: 'dano',
    affinityA: 'Luz',
    affinityB: 'Sombra',
    description: 'Luz e sombra colidem em explosão de energia bruta — dano em área que ignora escudos e defesa.',
  },

  // ─── SUPORTE ───────────────────────────────────────────────────────────────
  {
    name: 'Fluxo Primordial',
    type: 'suporte',
    affinityA: 'Água',
    affinityB: 'Vazio',
    description: 'Água e vazio fluem em equilíbrio ancestral — aumenta força e resistência de todos os aliados em 30% por 3 turnos.',
  },
  {
    name: 'Chama Alquímica',
    type: 'suporte',
    affinityA: 'Éter',
    affinityB: 'Fogo',
    description: 'Éter e fogo catalisam a essência dos aliados — carrega o ultimate de todos os aliados em 25 pontos.',
  },
  {
    name: 'Raízes de Luz',
    type: 'suporte',
    affinityA: 'Luz',
    affinityB: 'Terra',
    description: 'Luz e terra enraízam o time — concede escudo equivalente a 25% do HP máximo a todos os aliados ativos.',
  },
  {
    name: 'Véu Sombrio',
    type: 'suporte',
    affinityA: 'Sombra',
    affinityB: 'Vento',
    description: 'Sombra e vento envolvem o campo — reduz agilidade e ressonância de todos os inimigos em 25% por 2 turnos.',
  },

  // ─── CURA ──────────────────────────────────────────────────────────────────
  {
    name: 'Chuva Sagrada',
    type: 'cura',
    affinityA: 'Água',
    affinityB: 'Vento',
    description: 'Água e vento trazem chuva restauradora — cura todos os aliados em 35% do HP máximo de cada um.',
  },
  {
    name: 'Toque Etéreo',
    type: 'cura',
    affinityA: 'Éter',
    affinityB: 'Luz',
    description: 'Éter e luz purificam o campo — remove todos os status negativos de aliados e cura 20% do HP máximo de cada um.',
  },
  {
    name: 'Chama da Redenção',
    type: 'cura',
    affinityA: 'Fogo',
    affinityB: 'Sombra',
    description: 'Fogo e sombra transformam sofrimento em vida — cura todos os aliados em 25% do HP máximo + concede 1 turno de regeneração.',
  },
  {
    name: 'Ancoragem Vital',
    type: 'cura',
    affinityA: 'Terra',
    affinityB: 'Vazio',
    description: 'Terra e vazio ancoram a força vital — cura todos os aliados em 30% do HP máximo + concede escudo de 15% do HP máximo.',
  },
]

// ─── Lookup ───────────────────────────────────────────────────────────────────

export function getResonanceDef(a: Affinity, b: Affinity): ResonanceDef | undefined {
  return RESONANCE_TABLE.find(
    r => (r.affinityA === a && r.affinityB === b) || (r.affinityA === b && r.affinityB === a)
  )
}

// ─── Pré-requisitos ───────────────────────────────────────────────────────────

const RARITY_ORDER: Rarity[] = ['comum', 'incomum', 'raro', 'epico', 'lendario', 'unico']

function rarityIndex(r: Rarity): number {
  return RARITY_ORDER.indexOf(r)
}

export function isResonanceEligible(heroA: Combatant, heroB: Combatant): boolean {
  // ambos ativos
  if (!isActiveSlot(heroA.slot) || !isActiveSlot(heroB.slot)) return false
  // ambos vivos
  if (!heroA.isAlive || !heroB.isAlive) return false
  // ambos ≥ Raro
  if (rarityIndex(heroA.rarity) < 2 || rarityIndex(heroB.rarity) < 2) return false
  // ambos com vínculo ≥ 3★
  if (heroBondStars(heroA.bond) < 3 || heroBondStars(heroB.bond) < 3) return false
  // ambos com ultimate 100%
  if (heroA.ultimateCharge < 100 || heroB.ultimateCharge < 100) return false
  // nenhum em estado Exausta
  if (heroA.resonanceExaustaRemaining > 0 || heroB.resonanceExaustaRemaining > 0) return false
  // par sinérgico existe
  const affA = heroA.genome.essence.affinity
  const affB = heroB.genome.essence.affinity
  return getResonanceDef(affA, affB) !== undefined
}

// ─── Variante ─────────────────────────────────────────────────────────────────

export function getResonanceVariant(heroA: Combatant, heroB: Combatant): ResonanceVariant {
  const attrs = heroA.genome.attributes
  const attrsB = heroB.genome.attributes
  // média dos dois heróis
  const forca = (attrs.forca + attrsB.forca) / 2
  const resistencia = (attrs.resistencia + attrsB.resistencia) / 2
  const agilidade = (attrs.agilidade + attrsB.agilidade) / 2
  const ressonancia = (attrs.ressonancia + attrsB.ressonancia) / 2
  const aura = (attrs.aura + attrsB.aura) / 2
  const vontade = (attrs.vontade + attrsB.vontade) / 2

  const bruta = Math.max(forca, resistencia)
  const elemental = Math.max(ressonancia, aura)
  const agil = Math.max(agilidade, vontade)

  if (bruta >= elemental && bruta >= agil) return 'bruta'
  if (elemental >= agil) return 'elemental'
  return 'agil'
}

export function hasExaltedForm(heroA: Combatant, heroB: Combatant): boolean {
  return heroA.genome.mutations.length > 0 || heroB.genome.mutations.length > 0
}

// ─── Descoberta de pares no campo ────────────────────────────────────────────

export function findResonancePairs(state: BattleState): ResonancePair[] {
  const active = Object.values(state.combatants).filter(
    c => !c.isEnemy && c.isAlive && isActiveSlot(c.slot)
  )
  const pairs: ResonancePair[] = []
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i]
      const b = active[j]
      if (!isResonanceEligible(a, b)) continue
      const def = getResonanceDef(a.genome.essence.affinity, b.genome.essence.affinity)!
      pairs.push({
        heroA: a,
        heroB: b,
        def,
        variant: getResonanceVariant(a, b),
        exaltada: hasExaltedForm(a, b),
      })
    }
  }
  return pairs
}

// ─── Resolução de efeitos ─────────────────────────────────────────────────────

function allAllies(state: BattleState): Combatant[] {
  return Object.values(state.combatants).filter(c => !c.isEnemy && c.isAlive)
}

function activeEnemies(state: BattleState): Combatant[] {
  return Object.values(state.combatants).filter(c => c.isEnemy && c.isAlive)
}

// Fator de poder base: média das ressonâncias dos dois heróis / 50
function powerFactor(heroA: Combatant, heroB: Combatant): number {
  const avgRes = (heroA.genome.attributes.ressonancia + heroB.genome.attributes.ressonancia) / 2
  return Math.max(0.5, avgRes / 50)
}

export function resolveResonance(
  pair: ResonancePair,
  state: BattleState,
): BattleEvent[] {
  const { heroA, heroB, def, variant, exaltada } = pair
  const events: BattleEvent[] = []
  const pf = powerFactor(heroA, heroB)
  const exaltMult = exaltada ? 1.5 : 1.0
  const actorId = heroA.id

  const label0 = `${heroA.name} e ${heroB.name} ativam Ressonância Crítica: ${def.name}${exaltada ? ' (Forma Exaltada)' : ''}!`
  events.push({ type: 'resonance_used', actorId, targetId: heroB.id, label: label0 })

  switch (def.type) {
    case 'dano':
      events.push(...resolveDano(def, heroA, heroB, state, pf, exaltMult, variant))
      break
    case 'suporte':
      events.push(...resolveSuporteEvents(def, heroA, heroB, state, pf, exaltMult, variant))
      break
    case 'cura':
      events.push(...resolveCura(def, heroA, heroB, state, pf, exaltMult, variant))
      break
  }

  // Estado Exausta: ambos os heróis perdem ação neste turno (processado pelo engine)
  const exaustaLabel = `${heroA.name} e ${heroB.name} entram em Ressonância Exausta por 1 turno (ult bloqueada por 2 turnos).`
  events.push({ type: 'resonance_exausta', actorId, targetId: heroB.id, label: exaustaLabel })

  return events
}

// ─── Efeitos por tipo ─────────────────────────────────────────────────────────

function resolveDano(
  def: ResonanceDef,
  heroA: Combatant,
  heroB: Combatant,
  state: BattleState,
  pf: number,
  exaltMult: number,
  variant: ResonanceVariant,
): BattleEvent[] {
  const events: BattleEvent[] = []
  const enemies = activeEnemies(state)
  const avgAtk = (heroA.genome.attributes.forca + heroA.genome.attributes.ressonancia +
                  heroB.genome.attributes.forca + heroB.genome.attributes.ressonancia) / 4

  const variantMult = variant === 'bruta' ? 1.3 : variant === 'elemental' ? 1.1 : 1.0
  const baseDmg = Math.round(avgAtk * pf * 2.0 * variantMult * exaltMult)

  switch (def.name) {
    case 'Dilúvio Pétreo': {
      for (const e of enemies) {
        events.push({ type: 'damage', actorId: heroA.id, targetId: e.id, value: baseDmg, label: `Dilúvio Pétreo: ${baseDmg} de dano em ${e.name}` })
        events.push({ type: 'debuff_apply', actorId: heroA.id, targetId: e.id, value: 1, skillId: 'resonance_diluviolpuerto', label: `${e.name} tem agilidade reduzida por 2 turnos` })
      }
      break
    }
    case 'Colapso Dimensional': {
      // Alvo único com dano massivo (×2) + não drena pq BattleEvent não tem "drain ultimate" — usamos debuff como placeholder
      const bigDmg = Math.round(baseDmg * 2.0)
      const primary = enemies[0]
      if (primary) {
        events.push({ type: 'damage', actorId: heroA.id, targetId: primary.id, value: bigDmg, label: `Colapso Dimensional: ${bigDmg} de dano em ${primary.name}` })
        events.push({ type: 'debuff_apply', actorId: heroA.id, targetId: primary.id, value: 20, skillId: 'resonance_colapsodimensional', label: `${primary.name} perde 20 de carga de ultimate` })
      }
      break
    }
    case 'Tempestade Ardente': {
      for (const e of enemies) {
        events.push({ type: 'damage', actorId: heroA.id, targetId: e.id, value: baseDmg, label: `Tempestade Ardente: ${baseDmg} de dano em ${e.name}` })
        events.push({ type: 'debuff_apply', actorId: heroA.id, targetId: e.id, value: Math.round(baseDmg * 0.3), skillId: 'resonance_tempestadeardente', label: `${e.name} sofre queimadura por 2 turnos` })
      }
      break
    }
    case 'Colisão Primordial': {
      // Ignora escudos: dano direto
      for (const e of enemies) {
        events.push({ type: 'damage', actorId: heroA.id, targetId: e.id, value: baseDmg, label: `Colisão Primordial: ${baseDmg} de dano em ${e.name} (ignora escudos)` })
      }
      break
    }
  }
  return events
}

function resolveSuporteEvents(
  def: ResonanceDef,
  heroA: Combatant,
  heroB: Combatant,
  state: BattleState,
  pf: number,
  exaltMult: number,
  variant: ResonanceVariant,
): BattleEvent[] {
  const events: BattleEvent[] = []
  const allies = allAllies(state)
  const variantMult = variant === 'elemental' ? 1.3 : variant === 'agil' ? 1.2 : 1.0
  const baseVal = Math.round(30 * variantMult * exaltMult)

  switch (def.name) {
    case 'Fluxo Primordial': {
      for (const ally of allies) {
        events.push({ type: 'buff_apply', actorId: heroA.id, targetId: ally.id, value: baseVal, skillId: 'resonance_fluxoprimordial', label: `Fluxo Primordial: ${ally.name} ganha força e resistência +${baseVal}% por 3 turnos` })
      }
      break
    }
    case 'Chama Alquímica': {
      const chargeGain = Math.round(25 * exaltMult)
      for (const ally of allies) {
        events.push({ type: 'ultimate_charged', actorId: heroA.id, targetId: ally.id, value: chargeGain, skillId: 'resonance_chamaalquimica', label: `Chama Alquímica: ${ally.name} ganha ${chargeGain} de carga de ultimate` })
      }
      break
    }
    case 'Raízes de Luz': {
      const avgRes = (heroA.genome.attributes.resistencia + heroB.genome.attributes.resistencia) / 2
      for (const ally of allies) {
        const shield = Math.round(ally.maxHp * 0.25 * (avgRes / 50) * exaltMult)
        events.push({ type: 'shield_apply', actorId: heroA.id, targetId: ally.id, value: shield, skillId: 'resonance_raizesdeluz', label: `Raízes de Luz: ${ally.name} recebe escudo de ${shield}` })
      }
      break
    }
    case 'Véu Sombrio': {
      const enemies = activeEnemies(state)
      for (const e of enemies) {
        events.push({ type: 'debuff_apply', actorId: heroA.id, targetId: e.id, value: baseVal, skillId: 'resonance_veusombrio', label: `Véu Sombrio: ${e.name} tem agilidade e ressonância reduzidas por 2 turnos` })
      }
      break
    }
  }
  return events
}

function resolveCura(
  def: ResonanceDef,
  heroA: Combatant,
  heroB: Combatant,
  state: BattleState,
  pf: number,
  exaltMult: number,
  variant: ResonanceVariant,
): BattleEvent[] {
  const events: BattleEvent[] = []
  const allies = allAllies(state)
  const variantMult = variant === 'elemental' ? 1.3 : variant === 'agil' ? 1.1 : 1.0
  const avgAura = (heroA.genome.attributes.aura + heroB.genome.attributes.aura) / 2

  switch (def.name) {
    case 'Chuva Sagrada': {
      for (const ally of allies) {
        const heal = Math.round(ally.maxHp * 0.35 * (avgAura / 50) * variantMult * exaltMult)
        events.push({ type: 'heal', actorId: heroA.id, targetId: ally.id, value: heal, label: `Chuva Sagrada: ${ally.name} recupera ${heal} HP` })
      }
      break
    }
    case 'Toque Etéreo': {
      for (const ally of allies) {
        // Cura + marcamos cleanse via buff_apply especial
        const heal = Math.round(ally.maxHp * 0.20 * (avgAura / 50) * exaltMult)
        events.push({ type: 'heal', actorId: heroA.id, targetId: ally.id, value: heal, label: `Toque Etéreo: ${ally.name} recupera ${heal} HP e é purificado` })
        events.push({ type: 'buff_apply', actorId: heroA.id, targetId: ally.id, value: 0, skillId: 'resonance_toquetereo_cleanse', label: `${ally.name} tem todos os efeitos negativos removidos` })
      }
      break
    }
    case 'Chama da Redenção': {
      for (const ally of allies) {
        const heal = Math.round(ally.maxHp * 0.25 * (avgAura / 50) * variantMult * exaltMult)
        events.push({ type: 'heal', actorId: heroA.id, targetId: ally.id, value: heal, label: `Chama da Redenção: ${ally.name} recupera ${heal} HP` })
        events.push({ type: 'buff_apply', actorId: heroA.id, targetId: ally.id, value: 1, skillId: 'resonance_chamaredencao_regen', label: `${ally.name} ganha regeneração por 1 turno` })
      }
      break
    }
    case 'Ancoragem Vital': {
      for (const ally of allies) {
        const heal = Math.round(ally.maxHp * 0.30 * (avgAura / 50) * variantMult * exaltMult)
        const shield = Math.round(ally.maxHp * 0.15 * exaltMult)
        events.push({ type: 'heal', actorId: heroA.id, targetId: ally.id, value: heal, label: `Ancoragem Vital: ${ally.name} recupera ${heal} HP` })
        events.push({ type: 'shield_apply', actorId: heroA.id, targetId: ally.id, value: shield, skillId: 'resonance_ancoragem', label: `${ally.name} recebe escudo de ${shield}` })
      }
      break
    }
  }
  return events
}

export { RESONANCE_TABLE }
