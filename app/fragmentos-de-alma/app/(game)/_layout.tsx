import React from 'react'
import { Tabs } from 'expo-router'
import { theme } from '@/lib/theme'
import { TabIcon } from '@/components/ui/TabIcon'

export default function GameLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background.secondary,
          borderTopColor: theme.colors.border.subtle,
          borderTopWidth: 0.5,
          height: 64,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="mapa" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="almas" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="fusion"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="fundir" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="kael" active={focused} />,
        }}
      />
      {/* Dungeon/torre: fora da tab bar e esconde a barra durante a batalha */}
      <Tabs.Screen
        name="dungeon"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  )
}
