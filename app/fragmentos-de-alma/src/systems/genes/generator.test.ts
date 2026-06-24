import { describe, it, expect } from '@jest/globals'
import { generateFragmentGenome } from './generator'
import { ORIGINS, AFFINITIES, CORES } from '@/lib/constants'

describe('generateFragmentGenome', () => {
  it('gera genoma com essência válida', () => {
    for (let i = 0; i < 200; i++) {
      const g = generateFragmentGenome()
      expect(ORIGINS).toContain(g.essence.origin)
      expect(AFFINITIES).toContain(g.essence.affinity)
      expect(CORES).toContain(g.essence.core)
    }
  })

  it('gera atributos inteiros no intervalo 10–60', () => {
    for (let i = 0; i < 200; i++) {
      const { attributes } = generateFragmentGenome()
      for (const value of Object.values(attributes)) {
        expect(Number.isInteger(value)).toBe(true)
        expect(value).toBeGreaterThanOrEqual(10)
        expect(value).toBeLessThanOrEqual(60)
      }
    }
  })

  it('fragmento pré-fusão não tem mutações', () => {
    expect(generateFragmentGenome().mutations).toEqual([])
  })

  it('bioma conhecido favorece a Origem dominante (~68%)', () => {
    // P(Abissal) = 0.6 (dominante) + 0.4 × 1/5 (aleatório) ≈ 0.68
    const N = 2000
    let dominant = 0
    for (let i = 0; i < N; i++) {
      if (generateFragmentGenome('abismo').essence.origin === 'Abissal') {
        dominant++
      }
    }
    const ratio = dominant / N
    expect(ratio).toBeGreaterThan(0.55)
    expect(ratio).toBeLessThan(0.8)
  })

  it('bioma desconhecido cai em Origem aleatória sem crashar', () => {
    const g = generateFragmentGenome('bioma_inexistente')
    expect(ORIGINS).toContain(g.essence.origin)
  })
})
