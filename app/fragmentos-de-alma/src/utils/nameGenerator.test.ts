import { describe, it, expect } from '@jest/globals'
import { generateName } from './nameGenerator'
import { ORIGINS, AFFINITIES, CORES } from '@/lib/constants'
import type { Genome, MutationGene, Origin, Affinity, Core } from '../systems/genes/types'

function genome(opts: {
  origin?: Origin
  affinity?: Affinity
  core?: Core
  mutations?: MutationGene[]
} = {}): Genome {
  return {
    essence: {
      origin: opts.origin ?? 'Abissal',
      affinity: opts.affinity ?? 'Fogo',
      core: opts.core ?? 'Guardião',
    },
    attributes: { forca: 50, ressonancia: 50, resistencia: 50, agilidade: 50, vontade: 50, aura: 50 },
    mutations: opts.mutations ?? [],
  }
}

describe('generateName', () => {
  describe('formato básico', () => {
    it('retorna duas palavras separadas por espaço (sem epíteto)', () => {
      const name = generateName(genome(), 'seed-1')
      const parts = name.split(' ')
      expect(parts.length).toBe(2)
    })

    it('segunda palavra começa com maiúscula', () => {
      const name = generateName(genome(), 'seed-1')
      const lastName = name.split(' ')[1]
      expect(lastName.charAt(0)).toEqual(lastName.charAt(0).toUpperCase())
    })

    it('nome não é vazio e tem comprimento razoável (5–40 chars)', () => {
      for (let i = 0; i < 50; i++) {
        const name = generateName(genome(), `seed-${i}`)
        expect(name.length).toBeGreaterThan(5)
        expect(name.length).toBeLessThan(40)
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
    it('origens diferentes produzem prefixos diferentes (alta probabilidade)', () => {
      const seed = 'same-seed'
      const names = ORIGINS.map((o) => generateName(genome({ origin: o as Origin }), seed))
      const firstWords = names.map((n) => n.split(' ')[0])
      const unique = new Set(firstWords)
      expect(unique.size).toBeGreaterThan(1)
    })

    it('afinidades diferentes produzem últimas palavras diferentes (alta probabilidade)', () => {
      const seed = 'same-seed'
      const names = AFFINITIES.map((a) => generateName(genome({ affinity: a as Affinity }), seed))
      const lastWords = names.map((n) => n.split(' ')[1])
      const unique = new Set(lastWords)
      expect(unique.size).toBeGreaterThan(1)
    })

    it('núcleos diferentes produzem últimas palavras diferentes (alta probabilidade)', () => {
      const seed = 'same-seed'
      const names = CORES.map((c) => generateName(genome({ core: c as Core }), seed))
      const lastWords = names.map((n) => n.split(' ')[1])
      const unique = new Set(lastWords)
      expect(unique.size).toBeGreaterThan(1)
    })
  })

  describe('epítetos de mutação', () => {
    it('TRANSCENDENCIA adiciona epíteto após vírgula', () => {
      const name = generateName(genome({ mutations: ['TRANSCENDENCIA'] }), 'seed-t')
      expect(name).toContain(', ')
      const epithet = name.split(', ')[1]
      expect(['o Eterno', 'a Sem-Fim', 'o Além', 'a Transcendente']).toContain(epithet)
    })

    it('CAOS adiciona epíteto após vírgula', () => {
      const name = generateName(genome({ mutations: ['CAOS'] }), 'seed-c')
      expect(name).toContain(', ')
      const epithet = name.split(', ')[1]
      expect(['o Partido', 'a Fraturada', 'o Caótico', 'a Fragmentada']).toContain(epithet)
    })

    it('ANCESTRAL adiciona epíteto genérico quando ancestorName ausente', () => {
      const name = generateName(genome({ mutations: ['ANCESTRAL'] }), 'seed-a')
      expect(name).toContain(', ')
      const epithet = name.split(', ')[1]
      expect(['Portador do Passado', 'Guardiã da Linhagem', 'Eco das Eras', 'Herdeiro das Almas']).toContain(epithet)
    })

    it('ANCESTRAL usa ancestorName quando fornecido', () => {
      const name = generateName(genome({ mutations: ['ANCESTRAL'] }), 'seed-a', 'Kael')
      expect(name).toContain(', Portador(a) de Kael')
    })

    it('sem mutações com epíteto → nome sem vírgula', () => {
      const name = generateName(genome({ mutations: ['INVERSO', 'ESPELHO'] }), 'seed-x')
      expect(name).not.toContain(',')
    })

    it('TRANSCENDENCIA tem prioridade sobre CAOS quando ambos presentes', () => {
      const name = generateName(genome({ mutations: ['CAOS', 'TRANSCENDENCIA'] }), 'seed-tc')
      const epithet = name.split(', ')[1]
      expect(['o Eterno', 'a Sem-Fim', 'o Além', 'a Transcendente']).toContain(epithet)
    })

    it('CAOS tem prioridade sobre ANCESTRAL quando ambos presentes', () => {
      const name = generateName(genome({ mutations: ['ANCESTRAL', 'CAOS'] }), 'seed-ca')
      const epithet = name.split(', ')[1]
      expect(['o Partido', 'a Fraturada', 'o Caótico', 'a Fragmentada']).toContain(epithet)
    })
  })

  describe('cobertura total das combinações válidas', () => {
    it('gera nome para todas as origens × núcleos × afinidades sem lançar erro', () => {
      for (const origin of ORIGINS) {
        for (const core of CORES) {
          for (const affinity of AFFINITIES) {
            expect(() =>
              generateName(genome({ origin: origin as Origin, core: core as Core, affinity: affinity as Affinity }), 'stress')
            ).not.toThrow()
          }
        }
      }
    })
  })
})
