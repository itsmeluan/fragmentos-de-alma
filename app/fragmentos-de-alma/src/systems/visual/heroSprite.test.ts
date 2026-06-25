import { describe, it, expect } from '@jest/globals'
import { pickBuild, resolveHeroSprite } from './heroSprite'
import type { AttributeGenes } from '@/systems/genes/types'

const baseAttrs: AttributeGenes = {
  forca: 50, ressonancia: 50, resistencia: 50, agilidade: 50, vontade: 50, aura: 50,
}

describe('pickBuild', () => {
  it('escolhe o build padrão quando o atributo-chave está na média', () => {
    expect(pickBuild('Guardião', baseAttrs)).toBe('guardiao')
  })

  it('escolhe o highBuild quando o atributo-chave está acima da média', () => {
    expect(pickBuild('Guardião', { ...baseAttrs, resistencia: 90 })).toBe('sentinela')
    expect(pickBuild('Destruidor', { ...baseAttrs, agilidade: 90 })).toBe('reaver')
    expect(pickBuild('Trickster', { ...baseAttrs, agilidade: 90 })).toBe('cacador')
  })
})

describe('resolveHeroSprite', () => {
  it('resolve um sprite comum existente', () => {
    const r = resolveHeroSprite('Guardião', 'comum', baseAttrs, 'south')
    expect(r.folder).toBe('guardiao')
    expect(r.tier).toBe('comum')
    expect(r.source).not.toBeNull()
  })

  it('faz fallback de tier ausente para comum', () => {
    // incomum ainda não foi gerado → cai para comum
    const r = resolveHeroSprite('Guardião', 'incomum', baseAttrs, 'south')
    expect(r.tier).toBe('comum')
    expect(r.source).not.toBeNull()
  })

  it('usa o lendário quando existe', () => {
    const r = resolveHeroSprite('Guardião', 'lendario', baseAttrs, 'south')
    expect(r.tier).toBe('lendario')
    expect(r.source).not.toBeNull()
  })

  it('build sem lendário (reaver) faz fallback para comum', () => {
    const r = resolveHeroSprite('Destruidor', 'lendario', { ...baseAttrs, agilidade: 95 }, 'south')
    expect(r.build).toBe('reaver')
    expect(r.tier).toBe('comum') // reaver só tem comum por enquanto
    expect(r.source).not.toBeNull()
  })

  it('normaliza cores legados/de teste para o núcleo canônico', () => {
    const r = resolveHeroSprite('Sentinela', 'comum', baseAttrs, 'south')
    expect(r.folder).toBe('guardiao') // Sentinela → Guardião
    expect(r.source).not.toBeNull()
  })
})
