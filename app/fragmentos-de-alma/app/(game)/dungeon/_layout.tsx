import React from 'react'
import { Stack } from 'expo-router'

// Agrupa todas as telas de dungeon/torre num Stack próprio.
// Isso permite que o Tabs pai trate "dungeon" como uma única rota e esconda
// a tab bar enquanto o jogador está em batalha (evita sair sem querer).
export default function DungeonLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A0F' },
        gestureEnabled: false,
      }}
    />
  )
}
