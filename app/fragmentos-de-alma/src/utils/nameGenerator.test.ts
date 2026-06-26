import { describe, it, expect } from '@jest/globals'
import { generateName } from './nameGenerator'
import { ORIGINS, AFFINITIES, CORES } from '@/lib/constants'
import type { Genome, Origin, Affinity, Core } from '../systems/genes/types'

function genome(opts: {
  origin?: Origin
  affinity?: Affinity
  core?: Core
} = {}): Genome {
  return {
    essence: {
      origin: opts.origin ?? 'Abissal',
      affinity: opts.affinity ?? 'Fogo',
      core: opts.core ?? 'Guardião',
    },
    attributes: { forca: 50, ressonancia: 50, resistencia: 50, agilidade: 50, vontade: 50, aura: 50 },
    mutations: [],
  }
}

describe('generateName', () => {
  describe('formato básico', () => {
    it('retorna uma única palavra sem espaços', () => {
      const name = generateName(genome(), 'seed-1')
      expect(name.includes(' ')).toBe(false)
    })

    it('começa com maiúscula', () => {
      const name = generateName(genome(), 'seed-1')
      expect(name.charAt(0)).toBe(name.charAt(0).toUpperCase())
    })

    it('comprimento razoável (6–20 chars)', () => {
      for (let i = 0; i < 50; i++) {
        const name = generateName(genome(), `seed-${i}`)
        expect(name.length).toBeGreaterThan(5)
        expect(name.length).toBeLessThan(21)
      }
    })
  })

  describe('determinismo', () => {
    it('mesma seed + genoma → mesmo nome', () => {
      const g = genome({ origin: 'Celestial', affinity: 'Luz', core: 'Arauto' })
      expect(generateName(g, 'fixed-seed')).toBe(generateName(g, 'fixed-seed'))
    })

    it('seeds diferentes → nomes diferentes (alta probabilidade)', () => {
      const g = genome()
      const names = new Set(Array.from({ length: 20 }, (_, i) => generateName(g, `seed-${i}`)))
      expect(names.size).toBeGreaterThan(1)
    })
  })

  describe('influência dos genes', () => {
    it('origens diferentes produzem nomes diferentes (alta probabilidade)', () => {
      const seed = 'same-seed'
      const names = ORIGINS.map((o) => generateName(genome({ origin: o as Origin }), seed))
      expect(new Set(names).size).toBeGreaterThan(1)
    })

    it('afinidades diferentes produzem nomes diferentes (alta probabilidade)', () => {
      const seed = 'same-seed'
      const names = AFFINITIES.map((a) => generateName(genome({ affinity: a as Affinity }), seed))
      expect(new Set(names).size).toBeGreaterThan(1)
    })

    it('núcleos diferentes produzem nomes diferentes (alta probabilidade)', () => {
      const seed = 'same-seed'
      const names = CORES.map((c) => generateName(genome({ core: c as Core }), seed))
      expect(new Set(names).size).toBeGreaterThan(1)
    })
  })

  describe('cobertura total das combinações válidas', () => {
    it('gera nome para todas as origens × núcleos × afinidades sem lançar erro', () => {
      for (const origin of ORIGINS) {
        for (const core of CORES) {
          for (const affinity of AFFINITIES) {
            expect(() =>
              generateName(
                genome({ origin: origin as Origin, core: core as Core, affinity: affinity as Affinity }),
                'stress',
              )
            ).not.toThrow()
          }
        }
      }
    })
  })
})
