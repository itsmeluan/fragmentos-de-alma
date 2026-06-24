// Tela de batalha dentro da torre — usa o motor de batalha padrão.
// A única diferença em relação a dungeon/battle.tsx é o destino pós-vitória/derrota.
import React, { useEffect } from 'react'
import { Alert } from 'react-native'
import { router } from 'expo-router'
import { useBattleStore } from '@/store/battleStore'
import { useTowerStore } from '@/store/towerStore'
import BattleScreen from './battle'

export default function TowerBattleScreen() {
  const { battleState, clearBattle } = useBattleStore()
  const { recordFloorVictory, handleDefeat } = useTowerStore()

  useEffect(() => {
    if (!battleState) return

    if (battleState.phase === 'victory') {
      setTimeout(() => {
        const snapshot: Record<string, { currentHp: number; maxHp: number; isAlive: boolean }> = {}
        for (const [id, c] of Object.entries(battleState.combatants)) {
          if (!c.isEnemy) snapshot[id] = { currentHp: c.currentHp, maxHp: c.maxHp, isAlive: c.isAlive }
        }
        recordFloorVictory(snapshot)
        clearBattle()
        router.replace('/(game)/dungeon/tower-between' as `/${string}`)
      }, 400)
    }

    if (battleState.phase === 'defeat') {
      setTimeout(() => {
        handleDefeat()
        Alert.alert(
          'Derrota na Torre',
          'Seus heróis foram derrotados. Você retorna ao início da zona.',
          [
            {
              text: 'Entendido',
              onPress: () => {
                clearBattle()
                router.replace('/(game)/dungeon/tower' as `/${string}`)
              },
            },
          ]
        )
      }, 400)
    }
  }, [battleState?.phase])

  // Reutiliza o visual e a lógica da tela de batalha normal;
  // o intercept acima sobrescreve a navegação pós-batalha.
  return <BattleScreen />
}
