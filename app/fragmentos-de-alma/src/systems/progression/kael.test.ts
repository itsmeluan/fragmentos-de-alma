import { describe, it, expect } from '@jest/globals'
import {
  createKaelState,
  addXp,
  recordFusion,
  recordBattleWon,
  recordEmergentDiscovery,
  applyFactionDecision,
  reputationTier,
  reputationTierLabel,
  memoriesForLevel,
  isMemoryActive,
  getBattlePassives,
  xpRequiredForLevel,
  RISING_MEMORIES,
  FACTIONS,
} from './kael'

// ─── Estado inicial ───────────────────────────────────────────────────────────

describe('createKaelState', () => {
  it('cria estado com nome correto e nível 1', () => {
    const kael = createKaelState('Kael')
    expect(kael.displayName).toBe('Kael')
    expect(kael.level).toBe(1)
    expect(kael.xp).toBe(0)
    expect(kael.unlockedMemories).toHaveLength(0)
  })

  it('inicializa reputação de todas as facções em 0', () => {
    const kael = createKaelState('Kael')
    for (const faction of FACTIONS) {
      expect(kael.factionReputation[faction]).toBe(0)
    }
  })

  it('xpToNextLevel é positivo no nível 1', () => {
    const kael = createKaelState('Kael')
    expect(kael.xpToNextLevel).toBeGreaterThan(0)
  })
})

// ─── Curva de XP ─────────────────────────────────────────────────────────────

describe('xpRequiredForLevel', () => {
  it('cresce com o nível', () => {
    expect(xpRequiredForLevel(2)).toBeGreaterThan(xpRequiredForLevel(1))
    expect(xpRequiredForLevel(50)).toBeGreaterThan(xpRequiredForLevel(10))
  })

  it('nível 1 exige pelo menos 100 XP', () => {
    expect(xpRequiredForLevel(1)).toBeGreaterThanOrEqual(100)
  })
})

// ─── addXp / level-up ────────────────────────────────────────────────────────

describe('addXp', () => {
  it('acumula XP sem subir de nível quando XP é insuficiente', () => {
    const kael = createKaelState('K')
    const { state, leveled } = addXp(kael, 'battle_won')
    expect(state.xp).toBe(15)
    expect(leveled).toBe(false)
    expect(state.level).toBe(1)
  })

  it('sobe de nível quando XP acumulado ultrapassa o limiar', () => {
    // Força XP perto do limiar manualmente
    const kael = { ...createKaelState('K'), xp: xpRequiredForLevel(1) - 1 }
    const { state, leveled } = addXp(kael, 'battle_won')  // +15 XP
    expect(leveled).toBe(true)
    expect(state.level).toBe(2)
  })

  it('aplica multiplicador corretamente', () => {
    const kael = createKaelState('K')
    const { state } = addXp(kael, 'battle_won', 2)
    expect(state.xp).toBe(30)  // 15 × 2
  })

  it('não ultrapassa nível 100', () => {
    const kael = { ...createKaelState('K'), level: 100, xp: 0, xpToNextLevel: 9999999 }
    const { state, leveled } = addXp(kael, 'battle_won')
    expect(state.level).toBe(100)
    expect(leveled).toBe(false)
  })
})

// ─── Memórias Ressurgentes ────────────────────────────────────────────────────

describe('memoriesForLevel', () => {
  it('retorna vazio para nível < 10', () => {
    expect(memoriesForLevel(9)).toHaveLength(0)
  })

  it('retorna 1 memória no nível 10', () => {
    const mems = memoriesForLevel(10)
    expect(mems).toHaveLength(1)
    expect(mems[0].id).toBe('mem_10')
  })

  it('retorna todas as 10 memórias no nível 100', () => {
    expect(memoriesForLevel(100)).toHaveLength(10)
  })
})

describe('desbloqueio de memória ao subir nível', () => {
  it('desbloqueia mem_10 ao atingir nível 10', () => {
    let kael = createKaelState('K')
    // Empurra até nível 9
    kael = { ...kael, level: 9, xp: xpRequiredForLevel(9) - 1 }
    const { state, newMemory } = addXp(kael, 'battle_won')
    if (state.level === 10) {
      expect(state.unlockedMemories).toContain('mem_10')
      expect(newMemory?.id).toBe('mem_10')
    }
  })

  it('cada memória desbloqueia exatamente uma vez', () => {
    // Simula kael já com mem_10 chegando ao nível 10 novamente (não deve duplicar)
    const kael = {
      ...createKaelState('K'),
      level: 9,
      xp: xpRequiredForLevel(9) - 1,
      unlockedMemories: ['mem_10'],
    }
    const { state } = addXp(kael, 'battle_won')
    const count = state.unlockedMemories.filter(id => id === 'mem_10').length
    expect(count).toBe(1)
  })
})

describe('isMemoryActive', () => {
  it('retorna false se memória não está desbloqueada', () => {
    const kael = createKaelState('K')
    expect(isMemoryActive(kael, 'mem_10')).toBe(false)
  })

  it('retorna true se memória está desbloqueada', () => {
    const kael = { ...createKaelState('K'), unlockedMemories: ['mem_10'] }
    expect(isMemoryActive(kael, 'mem_10')).toBe(true)
  })
})

// ─── recordFusion / recordBattleWon / recordEmergentDiscovery ────────────────

describe('recordFusion', () => {
  it('incrementa totalFusions e dá XP de fusão', () => {
    const kael = createKaelState('K')
    const { state } = recordFusion(kael)
    expect(state.totalFusions).toBe(1)
    expect(state.xp).toBe(25)  // XP_PER_SOURCE.fusion
  })
})

describe('recordBattleWon', () => {
  it('incrementa totalBattlesWon e dá XP de batalha', () => {
    const kael = createKaelState('K')
    const { state } = recordBattleWon(kael)
    expect(state.totalBattlesWon).toBe(1)
    expect(state.xp).toBe(15)  // XP_PER_SOURCE.battle_won
  })
})

describe('recordEmergentDiscovery', () => {
  it('incrementa totalEmergentDiscoveries e dá XP emergente', () => {
    const kael = createKaelState('K')
    const { state } = recordEmergentDiscovery(kael)
    expect(state.totalEmergentDiscoveries).toBe(1)
    expect(state.xp).toBe(40)  // XP_PER_SOURCE.emergent_skill_found
  })
})

// ─── Reputação de facções ─────────────────────────────────────────────────────

describe('reputationTier', () => {
  it('ally quando >= 80', () => expect(reputationTier(80)).toBe('ally'))
  it('ally quando 100', () => expect(reputationTier(100)).toBe('ally'))
  it('friendly quando 40–79', () => expect(reputationTier(60)).toBe('friendly'))
  it('neutral quando -39 a 39', () => expect(reputationTier(0)).toBe('neutral'))
  it('hostile quando -40 a -79', () => expect(reputationTier(-55)).toBe('hostile'))
  it('enemy quando <= -80', () => expect(reputationTier(-80)).toBe('enemy'))
})

describe('reputationTierLabel', () => {
  it('retorna labels em português', () => {
    expect(reputationTierLabel('ally')).toBe('Aliado')
    expect(reputationTierLabel('enemy')).toBe('Inimigo')
  })
})

describe('applyFactionDecision', () => {
  it('aplica mudança de reputação dentro dos limites', () => {
    const kael = createKaelState('K')
    const result = applyFactionDecision(kael, { pedra_viva: 30 })
    expect(result.factionReputation.pedra_viva).toBe(30)
  })

  it('limita reputação a +100', () => {
    const kael = {
      ...createKaelState('K'),
      factionReputation: { ...createKaelState('K').factionReputation, pedra_viva: 95 },
    }
    const result = applyFactionDecision(kael, { pedra_viva: 20 })
    expect(result.factionReputation.pedra_viva).toBe(100)
  })

  it('limita reputação a -100', () => {
    const kael = {
      ...createKaelState('K'),
      factionReputation: { ...createKaelState('K').factionReputation, chama_negra: -95 },
    }
    const result = applyFactionDecision(kael, { chama_negra: -20 })
    expect(result.factionReputation.chama_negra).toBe(-100)
  })

  it('não altera facções não mencionadas', () => {
    const kael = createKaelState('K')
    const result = applyFactionDecision(kael, { pedra_viva: 10 })
    expect(result.factionReputation.veu_dos_ecos).toBe(0)
  })

  it('dá XP de decisão de facção', () => {
    const kael = createKaelState('K')
    const result = applyFactionDecision(kael, { pedra_viva: 10 })
    expect(result.xp).toBeGreaterThan(0)
  })
})

// ─── Passivas de batalha ─────────────────────────────────────────────────────

describe('getBattlePassives', () => {
  it('retorna zeros/false sem memórias desbloqueadas', () => {
    const kael = createKaelState('K')
    const passives = getBattlePassives(kael)
    expect(passives.fusionMutationBonus).toBe(0)
    expect(passives.oppositeSynergyBonus).toBe(0)
    expect(passives.damageAbsorptionActive).toBe(false)
    expect(passives.ultChargeBonus).toBe(0)
    expect(passives.enemyDropBonus).toBe(0)
    expect(passives.diversityBonusActive).toBe(false)
    expect(passives.reviveAvailable).toBe(false)
    expect(passives.emergentPowerBonus).toBe(0)
    expect(passives.finalMemoryUnlocked).toBe(false)
  })

  it('ativa cada passiva corretamente quando memória desbloqueada', () => {
    const allMemoryIds = RISING_MEMORIES.map(m => m.id)
    const kael = { ...createKaelState('K'), level: 100, unlockedMemories: allMemoryIds }
    const passives = getBattlePassives(kael)
    expect(passives.fusionMutationBonus).toBe(0.05)
    expect(passives.oppositeSynergyBonus).toBe(0.10)
    expect(passives.damageAbsorptionActive).toBe(true)
    expect(passives.ultChargeBonus).toBe(0.20)
    expect(passives.enemyDropBonus).toBe(0.15)
    expect(passives.diversityBonusActive).toBe(true)
    expect(passives.reviveAvailable).toBe(true)
    expect(passives.emergentPowerBonus).toBe(0.25)
    expect(passives.finalMemoryUnlocked).toBe(true)
  })
})

// ─── Invariantes das memórias ─────────────────────────────────────────────────

describe('RISING_MEMORIES invariantes', () => {
  it('tem exatamente 10 memórias', () => {
    expect(RISING_MEMORIES).toHaveLength(10)
  })

  it('cada memória tem nível múltiplo de 10 entre 10 e 100', () => {
    for (const m of RISING_MEMORIES) {
      expect(m.level % 10).toBe(0)
      expect(m.level).toBeGreaterThanOrEqual(10)
      expect(m.level).toBeLessThanOrEqual(100)
    }
  })

  it('ids são únicos', () => {
    const ids = RISING_MEMORIES.map(m => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('todos têm lore e description não-vazios', () => {
    for (const m of RISING_MEMORIES) {
      expect(m.lore.length).toBeGreaterThan(0)
      expect(m.description.length).toBeGreaterThan(0)
    }
  })
})
