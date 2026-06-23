import { describe, it, expect, jest, afterEach } from '@jest/globals'
import { fuseGenomes, createHybridAffinity } from './fusion'
import { ORIGINS, AFFINITIES, CORES, MUTATION_GENES } from '@/lib/constants'
import type { Affinity, Core, Genome, MutationGene, Origin } from './types'

function genome(o: {
  origin?: Origin
  affinity?: Affinity
  core?: Core
  attrs?: number
  mutations?: MutationGene[]
} = {}): Genome {
  const attrs = o.attrs ?? 50
  return {
    essence: {
      origin: o.origin ?? 'Abissal',
      affinity: o.affinity ?? 'Fogo',
      core: o.core ?? 'Guardião',
    },
    attributes: {
      forca: attrs,
      ressonancia: attrs,
      resistencia: attrs,
      agilidade: attrs,
      vontade: attrs,
      aura: attrs,
    },
    mutations: o.mutations ?? [],
  }
}

afterEach(() => {
  jest.restoreAllMocks()
})

describe('fuseGenomes', () => {
  it('produz genoma estruturalmente válido em N fusões', () => {
    const a = genome({ origin: 'Celestial', affinity: 'Luz', core: 'Arauto', attrs: 70 })
    const b = genome({ origin: 'Abissal', affinity: 'Sombra', core: 'Destruidor', attrs: 30 })

    for (let i = 0; i < 300; i++) {
      const { genome: child, inheritanceLog } = fuseGenomes({ parentA: a, parentB: b, seed: `s${i}` })

      expect(ORIGINS).toContain(child.essence.origin)
      expect(AFFINITIES).toContain(child.essence.affinity)
      expect(CORES).toContain(child.essence.core)

      for (const value of Object.values(child.attributes)) {
        expect(Number.isInteger(value)).toBe(true)
        expect(value).toBeGreaterThanOrEqual(1)
        expect(value).toBeLessThanOrEqual(100)
      }

      for (const m of child.mutations) {
        expect(MUTATION_GENES).toContain(m)
      }
      expect(new Set(child.mutations).size).toBe(child.mutations.length) // sem duplicatas

      // 3 genes de essência + 6 de atributo, no mínimo
      expect(inheritanceLog.length).toBeGreaterThanOrEqual(9)
    }
  })

  it('blend determinístico sem drift nem mutação (Math.random = 0.5)', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5)
    const a = genome({ origin: 'Celestial', affinity: 'Luz', core: 'Arauto', attrs: 100 })
    const b = genome({ origin: 'Abissal', affinity: 'Luz', core: 'Destruidor', attrs: 50 })

    const { genome: child, inheritanceLog } = fuseGenomes({ parentA: a, parentB: b, seed: 's' })

    // dominante = a (0.5 < 0.6); cada gene vem do dominante (0.5 < 0.7)
    expect(child.essence).toEqual({ origin: 'Celestial', affinity: 'Luz', core: 'Arauto' })
    // blend = 100×0.7 + 50×0.3 = 85; drift = 0; sem mutação numérica
    for (const value of Object.values(child.attributes)) {
      expect(value).toBe(85)
    }
    expect(child.mutations).toEqual([])
    expect(inheritanceLog.every((e) => e.wasDrift === false)).toBe(true)
  })

  it('herda mutação dos pais quando o sorteio favorece (<0.5)', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.3)
    const a = genome({ affinity: 'Fogo', mutations: ['ANCESTRAL'] })
    const b = genome({ affinity: 'Fogo', mutations: ['ANCESTRAL'] })

    const { genome: child } = fuseGenomes({ parentA: a, parentB: b, seed: 's' })
    expect(child.mutations).toEqual(['ANCESTRAL'])
  })

  it('não herda mutação quando o sorteio desfavorece (>0.5)', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9)
    const a = genome({ affinity: 'Fogo', mutations: ['ANCESTRAL'] })
    const b = genome({ affinity: 'Fogo', mutations: ['ANCESTRAL'] })

    const { genome: child } = fuseGenomes({ parentA: a, parentB: b, seed: 's' })
    expect(child.mutations).toEqual([])
  })

  describe('injeção de gene (Cristal de Essência)', () => {
    it('injeta atributo sobrescrevendo o blend', () => {
      const { genome: child, inheritanceLog } = fuseGenomes({
        parentA: genome({ attrs: 40 }),
        parentB: genome({ attrs: 60 }),
        seed: 's',
        injectedGene: { type: 'attribute', key: 'forca', value: 99 },
      })
      expect(child.attributes.forca).toBe(99)
      expect(
        inheritanceLog.some(
          (e) => e.source === 'injected' && e.gene === 'forca' && e.finalValue === 99
        )
      ).toBe(true)
    })

    it('injeta gene de essência', () => {
      const { genome: child } = fuseGenomes({
        parentA: genome({ core: 'Arauto' }),
        parentB: genome({ core: 'Arauto' }),
        seed: 's',
        injectedGene: { type: 'essence', key: 'core', value: 'Invocador' },
      })
      expect(child.essence.core).toBe('Invocador')
    })

    it('injeta mutação', () => {
      const { genome: child } = fuseGenomes({
        parentA: genome(),
        parentB: genome(),
        seed: 's',
        injectedGene: { type: 'mutation', key: 'mutation', value: 'CAOS' },
      })
      expect(child.mutations).toContain('CAOS')
    })

    it('ignora injeção inválida sem crashar', () => {
      const { genome: child } = fuseGenomes({
        parentA: genome({ attrs: 50 }),
        parentB: genome({ attrs: 50 }),
        seed: 's',
        injectedGene: { type: 'attribute', key: 'inexistente', value: 10 },
      })
      expect(child.attributes).toHaveProperty('forca')
    })
  })
})

describe('createHybridAffinity', () => {
  it('mapeia pares conhecidos (ordem indiferente)', () => {
    expect(createHybridAffinity('Fogo', 'Sombra')).toBe('Cinza Ardente')
    expect(createHybridAffinity('Sombra', 'Fogo')).toBe('Cinza Ardente')
    expect(createHybridAffinity('Vento', 'Água')).toBe('Tempestade')
    expect(createHybridAffinity('Luz', 'Vazio')).toBe('Eclipse')
    expect(createHybridAffinity('Terra', 'Éter')).toBe('Fóssil Astral')
  })

  it('par desconhecido vira rótulo "A/B"', () => {
    expect(createHybridAffinity('Luz', 'Terra')).toBe('Luz/Terra')
  })
})
