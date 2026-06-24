import { describe, it, expect } from '@jest/globals'
import {
  createDungeonSession,
  advanceAfterVictory,
  BATTLES_PER_FLOOR,
} from './dungeon'

// O drop de fragmento (gameStore.grantDungeonDrop, chamado em battle.tsx) dispara
// quando, após recordVictory, session.battleIndexInFloor === 0 — ou seja, quando
// um andar acabou de ser concluído. Estes testes travam essa aritmética.
describe('advanceAfterVictory — gatilho de andar concluído (drop)', () => {
  it('avança dentro do andar e zera battleIndexInFloor ao concluir o andar', () => {
    let s = createDungeonSession('kethara', ['h1', 'h2'])
    expect(s.currentFloor).toBe(1)
    expect(s.battleIndexInFloor).toBe(0)

    // Batalha 1 (0 → 1): andar não concluído, sem drop
    s = advanceAfterVictory(s)
    expect(s.battleIndexInFloor).toBe(1)
    expect(s.currentFloor).toBe(1)

    // Batalha 2 (1 → 2): andar não concluído, sem drop
    s = advanceAfterVictory(s)
    expect(s.battleIndexInFloor).toBe(2)
    expect(s.currentFloor).toBe(1)

    // Batalha 3 (2 → wrap): andar concluído → battleIndexInFloor === 0 → drop dispara
    s = advanceAfterVictory(s)
    expect(s.battleIndexInFloor).toBe(0)
    expect(s.currentFloor).toBe(2)
    expect(s.totalBattlesWon).toBe(3)
  })

  it('um andar tem 3 batalhas', () => {
    expect(BATTLES_PER_FLOOR).toBe(3)
  })
})
