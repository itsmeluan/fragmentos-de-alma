import { describe, it, expect } from '@jest/globals'
import { randomFrom, randomInt } from './random'

describe('randomFrom', () => {
  it('retorna um elemento do array', () => {
    const arr = ['a', 'b', 'c'] as const
    for (let i = 0; i < 100; i++) {
      expect(arr).toContain(randomFrom(arr))
    }
  })

  it('com um único elemento, sempre retorna ele', () => {
    expect(randomFrom(['x'])).toBe('x')
  })
})

describe('randomInt', () => {
  it('retorna inteiro dentro de [min, max]', () => {
    for (let i = 0; i < 1000; i++) {
      const n = randomInt(10, 60)
      expect(Number.isInteger(n)).toBe(true)
      expect(n).toBeGreaterThanOrEqual(10)
      expect(n).toBeLessThanOrEqual(60)
    }
  })

  it('com min === max retorna o próprio valor', () => {
    expect(randomInt(5, 5)).toBe(5)
  })
})
