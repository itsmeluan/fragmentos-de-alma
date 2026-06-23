import { describe, it, expect } from '@jest/globals'
import { generateSkills } from './generator'
import type { Affinity, Core, Genome, MutationGene, Origin, Rarity } from '../genes/types'

function genome(opts: {
  origin?: Origin
  affinity?: Affinity
  core?: Core
  mutations?: MutationGene[]
  forca?: number
  ressonancia?: number
  resistencia?: number
  agilidade?: number
  vontade?: number
  aura?: number
} = {}): Genome {
  return {
    essence: {
      origin: opts.origin ?? 'Errante',
      affinity: opts.affinity ?? 'Vento',
      core: opts.core ?? 'Arauto',
    },
    attributes: {
      forca:      opts.forca      ?? 50,
      ressonancia:opts.ressonancia ?? 50,
      resistencia:opts.resistencia ?? 50,
      agilidade:  opts.agilidade  ?? 50,
      vontade:    opts.vontade    ?? 50,
      aura:       opts.aura       ?? 50,
    },
    mutations: opts.mutations ?? [],
  }
}

const RARITIES: Rarity[] = ['comum', 'incomum', 'raro', 'epico', 'lendario', 'unico']

describe('generateSkills', () => {
  describe('contagem por raridade (doc 03)', () => {
    it('comum: 1 ativa, 1 passiva, 0 únicas', () => {
      const s = generateSkills(genome(), 'comum', 's')
      expect(s.active).toHaveLength(1)
      expect(s.passive).toHaveLength(1)
      expect(s.unique).toHaveLength(0)
    })

    it('incomum: 1 ativa, 1 passiva, 0 únicas', () => {
      const s = generateSkills(genome(), 'incomum', 's')
      expect(s.active).toHaveLength(1)
      expect(s.passive).toHaveLength(1)
      expect(s.unique).toHaveLength(0)
    })

    it('raro: 2 ativas, 1 passiva, 0 únicas', () => {
      const s = generateSkills(genome(), 'raro', 's')
      expect(s.active).toHaveLength(2)
      expect(s.passive).toHaveLength(1)
      expect(s.unique).toHaveLength(0)
    })

    it('epico: 2 ativas, 2 passivas, 0 únicas', () => {
      const s = generateSkills(genome(), 'epico', 's')
      expect(s.active).toHaveLength(2)
      expect(s.passive).toHaveLength(2)
      expect(s.unique).toHaveLength(0)
    })

    it('lendario: 2 ativas, 2 passivas, 1 única', () => {
      const s = generateSkills(genome(), 'lendario', 's')
      expect(s.active).toHaveLength(2)
      expect(s.passive).toHaveLength(2)
      expect(s.unique).toHaveLength(1)
    })

    it('unico: 3 ativas, 2 passivas, 2 únicas', () => {
      const s = generateSkills(genome(), 'unico', 's')
      expect(s.active).toHaveLength(3)
      expect(s.passive).toHaveLength(2)
      expect(s.unique).toHaveLength(2)
    })
  })

  describe('estrutura das habilidades', () => {
    it('toda habilidade tem trigger, effect e condition com id e label', () => {
      const s = generateSkills(genome(), 'epico', 's')
      for (const skill of [...s.active, ...s.passive]) {
        expect(skill.trigger).toHaveProperty('id')
        expect(skill.trigger).toHaveProperty('label')
        expect(skill.effect).toHaveProperty('id')
        expect(skill.effect).toHaveProperty('label')
        expect(skill.effect.power).toBeGreaterThanOrEqual(1)
        expect(skill.effect.power).toBeLessThanOrEqual(100)
        expect(skill.condition).toHaveProperty('id')
        expect(skill.condition).toHaveProperty('label')
        expect(typeof skill.name).toBe('string')
        expect(skill.name.length).toBeGreaterThan(0)
      }
    })

    it('passivas têm isPassive=true, ativas têm isPassive=false', () => {
      const s = generateSkills(genome(), 'epico', 's')
      for (const sk of s.active) expect(sk.isPassive).toBe(false)
      for (const sk of s.passive) expect(sk.isPassive).toBe(true)
    })

    it('habilidades únicas têm isUnique=true', () => {
      const s = generateSkills(genome(), 'lendario', 's')
      for (const sk of s.unique) expect(sk.isUnique).toBe(true)
    })

    it('IDs são únicos dentro do HeroSkills', () => {
      const s = generateSkills(genome(), 'unico', 's')
      const allSkills = [...s.active, ...s.passive, ...s.unique]
      const ids = allSkills.map(sk => sk.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('sourceGenes não é vazio', () => {
      const s = generateSkills(genome(), 'raro', 's')
      for (const sk of [...s.active, ...s.passive]) {
        expect(sk.sourceGenes.length).toBeGreaterThan(0)
      }
    })
  })

  describe('determinismo', () => {
    it('mesma seed + genoma → mesmo resultado', () => {
      const g = genome({ affinity: 'Fogo', forca: 80 })
      const a = generateSkills(g, 'epico', 'seed-x')
      const b = generateSkills(g, 'epico', 'seed-x')
      expect(a).toEqual(b)
    })

    it('seeds diferentes → nomes potencialmente diferentes', () => {
      const g = genome()
      const a = generateSkills(g, 'raro', 'seed-1')
      const b = generateSkills(g, 'raro', 'seed-2')
      // é possível (mas improvável) que coincidam — verificamos que pelo menos um difere
      const sameActive = a.active.every((sk, i) => sk.name === b.active[i]?.name)
      const samePassive = a.passive.every((sk, i) => sk.name === b.passive[i]?.name)
      expect(sameActive && samePassive).toBe(false)
    })
  })

  describe('habilidades emergentes', () => {
    it('Fogo + aura > 70 → Chama Purificadora', () => {
      const s = generateSkills(genome({ affinity: 'Fogo', aura: 80 }), 'comum', 's')
      expect(s.emergent.some(e => e.id === 'emergent_fire_aura')).toBe(true)
    })

    it('Trickster + vontade > 80 → Roubo de Memória', () => {
      const s = generateSkills(genome({ core: 'Trickster', vontade: 90 }), 'comum', 's')
      expect(s.emergent.some(e => e.id === 'emergent_trickster_vontade')).toBe(true)
    })

    it('Abissal + resistencia > 75 → Devorar Dor', () => {
      const s = generateSkills(genome({ origin: 'Abissal', resistencia: 80 }), 'comum', 's')
      expect(s.emergent.some(e => e.id === 'emergent_abissal_resistencia')).toBe(true)
    })

    it('Éter + forca > 80 → Passo Eterno', () => {
      const s = generateSkills(genome({ affinity: 'Éter', forca: 90 }), 'comum', 's')
      expect(s.emergent.some(e => e.id === 'emergent_eter_forca')).toBe(true)
    })

    it('3+ mutações → Caos Encarnado', () => {
      const s = generateSkills(genome({ mutations: ['INVERSO', 'ESPELHO', 'ANCESTRAL'] }), 'epico', 's')
      expect(s.emergent.some(e => e.id === 'emergent_chaos_mutations')).toBe(true)
    })

    it('Celestial + Invocador → Eco do Que Fui', () => {
      const s = generateSkills(genome({ origin: 'Celestial', core: 'Invocador' }), 'comum', 's')
      expect(s.emergent.some(e => e.id === 'emergent_celestial_invocador')).toBe(true)
    })

    it('TRANSCENDENCIA → Além das Leis', () => {
      const s = generateSkills(genome({ mutations: ['TRANSCENDENCIA'] }), 'lendario', 's')
      expect(s.emergent.some(e => e.id === 'emergent_transcendencia')).toBe(true)
    })

    it('emergentes têm isEmergent=true', () => {
      const s = generateSkills(genome({ affinity: 'Fogo', aura: 90 }), 'comum', 's')
      for (const e of s.emergent) expect(e.isEmergent).toBe(true)
    })

    it('genoma sem condições especiais → lista emergente vazia', () => {
      const s = generateSkills(genome({ affinity: 'Vento', aura: 30, forca: 30 }), 'comum', 's')
      expect(s.emergent).toHaveLength(0)
    })

    it('múltiplas condições no mesmo genoma acumulam emergentes', () => {
      const s = generateSkills(genome({
        origin: 'Celestial', core: 'Invocador',
        mutations: ['TRANSCENDENCIA', 'INVERSO', 'ESPELHO', 'ANCESTRAL'],
      }), 'unico', 's')
      // Celestial+Invocador + TRANSCENDENCIA + 3+ mutações (INVERSO+ESPELHO+ANCESTRAL+TRANSCENDENCIA=4)
      expect(s.emergent.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('não lança erro para nenhuma combinação válida', () => {
    it('todas as raridades sem erros', () => {
      for (const rarity of RARITIES) {
        expect(() => generateSkills(genome(), rarity, `s-${rarity}`)).not.toThrow()
      }
    })
  })
})
