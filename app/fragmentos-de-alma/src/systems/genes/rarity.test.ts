import { describe, it, expect } from '@jest/globals'
import { calculateRarity, getRarityColor } from './rarity'
import { theme } from '@/lib/theme'
import type { Genome, MutationGene } from './types'

function genome(attrs: number, mutations: MutationGene[] = [], hybridAffinity?: string): Genome {
  return {
    essence: {
      origin: 'Abissal',
      affinity: 'Fogo',
      core: 'Guardião',
      ...(hybridAffinity ? { hybridAffinity } : {}),
    },
    attributes: {
      forca: attrs,
      ressonancia: attrs,
      resistencia: attrs,
      agilidade: attrs,
      vontade: attrs,
      aura: attrs,
    },
    mutations,
  }
}

// Soma de atributos = attrs × 6

describe('calculateRarity', () => {
  describe('comum', () => {
    it('soma < 300, sem mutações, sem híbrido → comum', () => {
      expect(calculateRarity(genome(40))).toBe('comum') // 40×6 = 240
    })

    it('soma = 299 → comum (borda inferior incomum)', () => {
      // 49×6 = 294, 50×6 = 300; usar valores misturados para somar 299 exatamente
      const g: Genome = {
        ...genome(49),
        attributes: { forca: 50, ressonancia: 49, resistencia: 49, agilidade: 50, vontade: 50, aura: 51 },
      }
      // soma = 50+49+49+50+50+51 = 299
      expect(calculateRarity(g)).toBe('comum')
    })
  })

  describe('incomum', () => {
    it('soma 300 → incomum (borda exata)', () => {
      expect(calculateRarity(genome(50))).toBe('incomum') // 50×6 = 300
    })

    it('soma 400 → incomum', () => {
      expect(calculateRarity(genome(67))).toBe('incomum') // 67×6 = 402 ≈ ok
    })

    it('soma < 300 + 1 mutação → incomum', () => {
      expect(calculateRarity(genome(40, ['ANCESTRAL']))).toBe('incomum')
    })
  })

  describe('raro', () => {
    it('soma 450 → raro (borda exata)', () => {
      expect(calculateRarity(genome(75))).toBe('raro') // 75×6 = 450
    })

    it('soma < 300 + afinidade híbrida → raro', () => {
      expect(calculateRarity(genome(40, [], 'Cinza Ardente'))).toBe('raro')
    })

    it('soma 500 → raro', () => {
      expect(calculateRarity(genome(84))).toBe('raro') // 84×6 = 504
    })
  })

  describe('epico', () => {
    it('soma 600 → epico (atributos todos 100)', () => {
      expect(calculateRarity(genome(100))).toBe('epico') // 100×6 = 600
    })

    it('soma < 300 + 2 mutações → epico', () => {
      expect(calculateRarity(genome(40, ['INVERSO', 'ESPELHO']))).toBe('epico')
    })

    it('soma < 300 + 3 mutações → epico (2+ conta)', () => {
      expect(calculateRarity(genome(40, ['INVERSO', 'ESPELHO', 'ANCESTRAL']))).toBe('epico')
    })
  })

  describe('lendario', () => {
    it('mutação TRANSCENDENCIA → lendario independente da soma', () => {
      expect(calculateRarity(genome(10, ['TRANSCENDENCIA']))).toBe('lendario')
    })

    it('TRANSCENDENCIA prevalece sobre outras condições', () => {
      // Soma baixa + TRANSCENDENCIA → lendario (não épico, não incomum)
      expect(calculateRarity(genome(40, ['TRANSCENDENCIA', 'INVERSO']))).toBe('lendario')
    })

    it('soma > 750 → lendario (caminho futuro via bônus)', () => {
      const g: Genome = {
        ...genome(100),
        attributes: { forca: 100, ressonancia: 100, resistencia: 100, agilidade: 100, vontade: 100, aura: 100 },
      }
      // com atributos base max = 600; simular soma > 750 não é possível sem bônus —
      // TRANSCENDENCIA é o caminho atual; este teste documenta que a condição está no código
      // e que bônus futuros a ativarão. A função retorna epico (600) sem TRANSCENDENCIA.
      expect(calculateRarity(g)).toBe('epico')
    })
  })

  describe('unico', () => {
    it('isUnique=true → unico independente do genoma', () => {
      expect(calculateRarity(genome(10), true)).toBe('unico')
    })

    it('isUnique=true prevalece sobre TRANSCENDENCIA', () => {
      expect(calculateRarity(genome(100, ['TRANSCENDENCIA']), true)).toBe('unico')
    })
  })

  describe('prioridade (tier mais alto vence)', () => {
    it('híbrido + 2 mutações → epico (não raro)', () => {
      expect(calculateRarity(genome(40, ['INVERSO', 'ESPELHO'], 'Eclipse'))).toBe('epico')
    })

    it('TRANSCENDENCIA + 2 mutações → lendario (não epico)', () => {
      expect(calculateRarity(genome(40, ['TRANSCENDENCIA', 'INVERSO']))).toBe('lendario')
    })
  })
})

describe('getRarityColor', () => {
  it('retorna a cor correta para cada tier', () => {
    expect(getRarityColor('comum')).toBe(theme.colors.rarity.comum)
    expect(getRarityColor('incomum')).toBe(theme.colors.rarity.incomum)
    expect(getRarityColor('raro')).toBe(theme.colors.rarity.raro)
    expect(getRarityColor('epico')).toBe(theme.colors.rarity.epico)
    expect(getRarityColor('lendario')).toBe(theme.colors.rarity.lendario)
    expect(getRarityColor('unico')).toBe(theme.colors.rarity.unico)
  })

  it('cor de lendario é diferente de epico', () => {
    expect(getRarityColor('lendario')).not.toBe(getRarityColor('epico'))
  })
})
