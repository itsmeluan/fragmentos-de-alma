import { describe, it, expect } from '@jest/globals'
import { generateVisualParams } from './generator'
import type { Affinity, Core, Genome, MutationGene, Origin } from '../genes/types'

function genome(opts: {
  origin?: Origin
  affinity?: Affinity
  core?: Core
  hybridAffinity?: string
  ressonancia?: number
  resistencia?: number
  vontade?: number
  aura?: number
  mutations?: MutationGene[]
} = {}): Genome {
  return {
    essence: {
      origin: opts.origin ?? 'Abissal',
      affinity: opts.affinity ?? 'Fogo',
      core: opts.core ?? 'Guardião',
      ...(opts.hybridAffinity ? { hybridAffinity: opts.hybridAffinity } : {}),
    },
    attributes: {
      forca: 50,
      ressonancia: opts.ressonancia ?? 50,
      resistencia: opts.resistencia ?? 50,
      agilidade: 50,
      vontade: opts.vontade ?? 50,
      aura: opts.aura ?? 50,
    },
    mutations: opts.mutations ?? [],
  }
}

describe('generateVisualParams', () => {
  describe('estrutura completa', () => {
    it('retorna todas as 6 camadas + seed + uniqueVariations', () => {
      const vp = generateVisualParams(genome(), 'seed-test')
      expect(vp).toHaveProperty('background')
      expect(vp).toHaveProperty('silhouette')
      expect(vp).toHaveProperty('palette')
      expect(vp).toHaveProperty('pattern')
      expect(vp).toHaveProperty('ornament')
      expect(vp).toHaveProperty('aura')
      expect(vp).toHaveProperty('uniqueVariations')
      expect(vp.seed).toBe('seed-test')
    })
  })

  describe('determinismo', () => {
    it('mesma seed + genoma → resultado idêntico', () => {
      const g = genome({ affinity: 'Água', resistencia: 80 })
      const a = generateVisualParams(g, 'seed-abc')
      const b = generateVisualParams(g, 'seed-abc')
      expect(a).toEqual(b)
    })

    it('seeds diferentes → uniqueVariations diferentes', () => {
      const g = genome()
      const a = generateVisualParams(g, 'seed-1')
      const b = generateVisualParams(g, 'seed-2')
      expect(a.uniqueVariations.colorHueShifts).not.toEqual(b.uniqueVariations.colorHueShifts)
    })
  })

  describe('Camada 1 — background', () => {
    it('origin do background espelha a origin do genoma', () => {
      const vp = generateVisualParams(genome({ origin: 'Celestial' }), 's')
      expect(vp.background.origin).toBe('Celestial')
    })
  })

  describe('Camada 2 — silhueta', () => {
    it('coreShape reflete o núcleo do genoma', () => {
      const vp = generateVisualParams(genome({ core: 'Destruidor' }), 's')
      expect(vp.silhouette.coreShape).toBe('Destruidor')
    })

    it('resistencia 1–30 → light', () => {
      expect(generateVisualParams(genome({ resistencia: 15 }), 's').silhouette.weight).toBe('light')
    })

    it('resistencia 31–60 → standard', () => {
      expect(generateVisualParams(genome({ resistencia: 50 }), 's').silhouette.weight).toBe('standard')
    })

    it('resistencia 61–100 → dense', () => {
      expect(generateVisualParams(genome({ resistencia: 80 }), 's').silhouette.weight).toBe('dense')
    })

    it('bordas: resistencia 30 → light, 31 → standard, 60 → standard, 61 → dense', () => {
      expect(generateVisualParams(genome({ resistencia: 30 }), 's').silhouette.weight).toBe('light')
      expect(generateVisualParams(genome({ resistencia: 31 }), 's').silhouette.weight).toBe('standard')
      expect(generateVisualParams(genome({ resistencia: 60 }), 's').silhouette.weight).toBe('standard')
      expect(generateVisualParams(genome({ resistencia: 61 }), 's').silhouette.weight).toBe('dense')
    })
  })

  describe('Camada 3 — paleta', () => {
    it('Fogo → cores corretas do doc 02', () => {
      const { palette } = generateVisualParams(genome({ affinity: 'Fogo' }), 's')
      expect(palette.primary).toBe('#C0392B')
      expect(palette.secondary).toBe('#E67E22')
      expect(palette.glow).toBe('#FFEB3B')
    })

    it('Éter → cores corretas do doc 02', () => {
      const { palette } = generateVisualParams(genome({ affinity: 'Éter' }), 's')
      expect(palette.primary).toBe('#E8EAF6')
      expect(palette.secondary).toBe('#5C6BC0')
      expect(palette.glow).toBe('#82B1FF')
    })

    it('ressonancia 1–30 → desaturated', () => {
      expect(generateVisualParams(genome({ ressonancia: 20 }), 's').palette.resonanceLevel).toBe('desaturated')
    })

    it('ressonancia 31–60 → standard', () => {
      expect(generateVisualParams(genome({ ressonancia: 50 }), 's').palette.resonanceLevel).toBe('standard')
    })

    it('ressonancia 61–100 → vibrant', () => {
      expect(generateVisualParams(genome({ ressonancia: 80 }), 's').palette.resonanceLevel).toBe('vibrant')
    })

    it('afinidade híbrida conhecida usa paleta especial', () => {
      const { palette } = generateVisualParams(
        genome({ affinity: 'Fogo', hybridAffinity: 'Cinza Ardente' }),
        's'
      )
      expect(palette.primary).toBe('#1C1C1C')
      expect(palette.hybridName).toBe('Cinza Ardente')
    })

    it('híbrido desconhecido cai para paleta da afinidade base', () => {
      const { palette } = generateVisualParams(
        genome({ affinity: 'Água', hybridAffinity: 'Híbrido Inexistente' }),
        's'
      )
      expect(palette.primary).toBe('#1A6E8E') // Água
    })

    it('sem híbrido: hybridName ausente da paleta', () => {
      const { palette } = generateVisualParams(genome({ affinity: 'Luz' }), 's')
      expect(palette.hybridName).toBeUndefined()
    })
  })

  describe('Camada 4 — padrões', () => {
    it('origin do padrão espelha a origin do genoma', () => {
      const vp = generateVisualParams(genome({ origin: 'Forjada' }), 's')
      expect(vp.pattern.origin).toBe('Forjada')
    })

    it('vontade 1–30 → sparse', () => {
      expect(generateVisualParams(genome({ vontade: 15 }), 's').pattern.density).toBe('sparse')
    })

    it('vontade 31–60 → medium', () => {
      expect(generateVisualParams(genome({ vontade: 50 }), 's').pattern.density).toBe('medium')
    })

    it('vontade 61–100 → dense', () => {
      expect(generateVisualParams(genome({ vontade: 90 }), 's').pattern.density).toBe('dense')
    })
  })

  describe('Camada 5 — ornamentos', () => {
    it('coreBase reflete o núcleo do genoma', () => {
      const vp = generateVisualParams(genome({ core: 'Invocador' }), 's')
      expect(vp.ornament.coreBase).toBe('Invocador')
    })

    it('mutações são propagadas para mutationOrnaments', () => {
      const vp = generateVisualParams(genome({ mutations: ['INVERSO', 'ESPELHO'] }), 's')
      expect(vp.ornament.mutationOrnaments).toEqual(['INVERSO', 'ESPELHO'])
    })

    it('sem mutações → mutationOrnaments vazio', () => {
      const vp = generateVisualParams(genome(), 's')
      expect(vp.ornament.mutationOrnaments).toEqual([])
    })
  })

  describe('Camada 6 — aura', () => {
    it('affinity da aura espelha afinidade do genoma', () => {
      const vp = generateVisualParams(genome({ affinity: 'Vazio' }), 's')
      expect(vp.aura.affinity).toBe('Vazio')
    })

    it('aura 1–20 → none', () => {
      expect(generateVisualParams(genome({ aura: 10 }), 's').aura.level).toBe('none')
    })

    it('aura 21–40 → halo', () => {
      expect(generateVisualParams(genome({ aura: 30 }), 's').aura.level).toBe('halo')
    })

    it('aura 41–60 → particles', () => {
      expect(generateVisualParams(genome({ aura: 50 }), 's').aura.level).toBe('particles')
    })

    it('aura 61–80 → distortion', () => {
      expect(generateVisualParams(genome({ aura: 70 }), 's').aura.level).toBe('distortion')
    })

    it('aura 81–100 → field', () => {
      expect(generateVisualParams(genome({ aura: 95 }), 's').aura.level).toBe('field')
    })

    it('bordas: aura 20 → none, 21 → halo, 80 → distortion, 81 → field', () => {
      expect(generateVisualParams(genome({ aura: 20 }), 's').aura.level).toBe('none')
      expect(generateVisualParams(genome({ aura: 21 }), 's').aura.level).toBe('halo')
      expect(generateVisualParams(genome({ aura: 80 }), 's').aura.level).toBe('distortion')
      expect(generateVisualParams(genome({ aura: 81 }), 's').aura.level).toBe('field')
    })
  })

  describe('Protocolo de Unicidade — uniqueVariations', () => {
    it('colorHueShifts tem 6 valores', () => {
      const { uniqueVariations } = generateVisualParams(genome(), 's')
      expect(uniqueVariations.colorHueShifts).toHaveLength(6)
    })

    it('colorHueShifts dentro de ±3%', () => {
      const { uniqueVariations } = generateVisualParams(genome(), 's')
      for (const shift of uniqueVariations.colorHueShifts) {
        expect(shift).toBeGreaterThanOrEqual(-0.03)
        expect(shift).toBeLessThanOrEqual(0.03)
      }
    })

    it('ornamentOffsets tem 8 valores em [0, 1]', () => {
      const { uniqueVariations } = generateVisualParams(genome(), 's')
      expect(uniqueVariations.ornamentOffsets).toHaveLength(8)
      for (const offset of uniqueVariations.ornamentOffsets) {
        expect(offset).toBeGreaterThanOrEqual(0)
        expect(offset).toBeLessThanOrEqual(1)
      }
    })

    it('animationSpeed dentro de [0.8, 1.2]', () => {
      for (let i = 0; i < 100; i++) {
        const { uniqueVariations } = generateVisualParams(genome(), `seed-${i}`)
        expect(uniqueVariations.animationSpeed).toBeGreaterThanOrEqual(0.8)
        expect(uniqueVariations.animationSpeed).toBeLessThanOrEqual(1.2)
      }
    })
  })
})
