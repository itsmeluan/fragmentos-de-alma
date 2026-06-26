import { describe, it, expect } from '@jest/globals'
import { affinityMultiplier, affinityEffectiveness } from './affinityChart'

describe('affinityMultiplier — ciclo clássico (unidirecional)', () => {
  it('água vence fogo (×2)', () => {
    expect(affinityMultiplier('Água', 'Fogo')).toBe(2.0)
  })

  it('fogo perde para água (×0.5)', () => {
    expect(affinityMultiplier('Fogo', 'Água')).toBe(0.5)
  })

  it('fogo vence vento (×2)', () => {
    expect(affinityMultiplier('Fogo', 'Vento')).toBe(2.0)
  })

  it('vento vence terra (×2)', () => {
    expect(affinityMultiplier('Vento', 'Terra')).toBe(2.0)
  })

  it('terra vence água (×2)', () => {
    expect(affinityMultiplier('Terra', 'Água')).toBe(2.0)
  })

  it('terra perde para vento (×0.5)', () => {
    expect(affinityMultiplier('Terra', 'Vento')).toBe(0.5)
  })
})

describe('affinityMultiplier — pares caos (↑↑↓↓, simétrico ×2)', () => {
  it('luz→sombra: ×2', () => {
    expect(affinityMultiplier('Luz', 'Sombra')).toBe(2.0)
  })

  it('sombra→luz: ×2 (simétrico)', () => {
    expect(affinityMultiplier('Sombra', 'Luz')).toBe(2.0)
  })

  it('éter→vazio: ×2', () => {
    expect(affinityMultiplier('Éter', 'Vazio')).toBe(2.0)
  })

  it('vazio→éter: ×2 (simétrico)', () => {
    expect(affinityMultiplier('Vazio', 'Éter')).toBe(2.0)
  })
})

describe('affinityMultiplier — pares voláteis (↑↓, simétrico ×1.5)', () => {
  it('água→sombra: ×1.5', () => {
    expect(affinityMultiplier('Água', 'Sombra')).toBe(1.5)
  })

  it('sombra→água: ×1.5 (simétrico)', () => {
    expect(affinityMultiplier('Sombra', 'Água')).toBe(1.5)
  })

  it('éter→sombra: ×1.5', () => {
    expect(affinityMultiplier('Éter', 'Sombra')).toBe(1.5)
  })

  it('sombra→éter: ×1.5 (simétrico)', () => {
    expect(affinityMultiplier('Sombra', 'Éter')).toBe(1.5)
  })

  it('luz→vazio: ×1.5', () => {
    expect(affinityMultiplier('Luz', 'Vazio')).toBe(1.5)
  })

  it('vazio→luz: ×1.5 (simétrico)', () => {
    expect(affinityMultiplier('Vazio', 'Luz')).toBe(1.5)
  })

  it('sombra→vazio: ×1.5', () => {
    expect(affinityMultiplier('Sombra', 'Vazio')).toBe(1.5)
  })

  it('vazio→sombra: ×1.5 (simétrico)', () => {
    expect(affinityMultiplier('Vazio', 'Sombra')).toBe(1.5)
  })
})

describe('affinityMultiplier — matchups neutros (×1)', () => {
  it('água→água: ×1', () => {
    expect(affinityMultiplier('Água', 'Água')).toBe(1.0)
  })

  it('fogo→terra: ×1 (sem relação direta)', () => {
    expect(affinityMultiplier('Fogo', 'Terra')).toBe(1.0)
  })

  it('luz→água: ×1', () => {
    expect(affinityMultiplier('Luz', 'Água')).toBe(1.0)
  })

  it('vento→fogo: ×1 (ciclo só beneficia fogo, não pune vento)', () => {
    expect(affinityMultiplier('Vento', 'Fogo')).toBe(1.0)
  })
})

describe('affinityEffectiveness', () => {
  it('×2.0 → super_efetivo', () => {
    expect(affinityEffectiveness(2.0)).toBe('super_efetivo')
  })

  it('×1.5 → efetivo', () => {
    expect(affinityEffectiveness(1.5)).toBe('efetivo')
  })

  it('×1.0 → neutro', () => {
    expect(affinityEffectiveness(1.0)).toBe('neutro')
  })

  it('×0.5 → muito_fraco', () => {
    expect(affinityEffectiveness(0.5)).toBe('muito_fraco')
  })
})
