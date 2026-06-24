import React from 'react'
import {
  View, Text, Pressable, StyleSheet, Modal,
} from 'react-native'
import { theme } from '@/lib/theme'
import type { FactionEventDef, FactionChoice } from '@/systems/world/factionEvents'
import type { TerritoryId } from '@/systems/world/types'
import { getTerritoryDef } from '@/systems/world/mapData'

interface FactionEventModalProps {
  visible: boolean
  event: FactionEventDef
  onChoice: (choice: FactionChoice) => void
  onSkip: () => void
}

export function FactionEventModal({ visible, event, onChoice, onSkip }: FactionEventModalProps) {
  const def = getTerritoryDef(event.territory)
  const factionColor = def?.color ?? theme.colors.gold.main

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { borderTopColor: factionColor }]}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={[styles.territoryLabel, { color: factionColor }]}>
              {def?.factionLabel.toUpperCase() ?? 'FACÇÃO'}
            </Text>
            <Text style={styles.title}>{event.title}</Text>
          </View>

          {/* Descrição */}
          <Text style={styles.description}>{event.description}</Text>

          {/* Separador */}
          <View style={[styles.divider, { backgroundColor: factionColor + '44' }]} />

          {/* Escolhas */}
          <View style={styles.choices}>
            {event.choices.map((choice, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [
                  styles.choiceBtn,
                  { borderColor: factionColor },
                  pressed && styles.choiceBtnPressed,
                ]}
                onPress={() => onChoice(choice)}
                accessibilityRole="button"
                accessibilityLabel={choice.label}
              >
                <Text style={[styles.choiceLabel, { color: factionColor }]}>
                  {choice.label}
                </Text>
                <Text style={styles.choiceDesc}>{choice.description}</Text>
              </Pressable>
            ))}
          </View>

          {/* Ignorar */}
          <Pressable
            style={styles.skipBtn}
            onPress={onSkip}
            accessibilityRole="button"
            accessibilityLabel="Ignorar evento"
            hitSlop={8}
          >
            <Text style={styles.skipText}>Ignorar este evento</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: theme.colors.background.secondary,
    borderTopWidth: 3,
    borderWidth: 0.5,
    borderColor: theme.colors.border.subtle,
    padding: 20,
    gap: 16,
  },
  header: { gap: 6 },
  territoryLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    letterSpacing: 2.5,
  },
  title: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 17,
    color: theme.colors.text.primary,
    letterSpacing: 1.5,
  },
  description: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 13,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  divider: { height: 0.5 },
  choices: { gap: 10 },
  choiceBtn: {
    borderWidth: 1,
    padding: 14,
    gap: 4,
    minHeight: 64,
    justifyContent: 'center',
  },
  choiceBtnPressed: { opacity: 0.72 },
  choiceLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 12,
    letterSpacing: 1.5,
  },
  choiceDesc: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 11,
    color: theme.colors.text.secondary,
    lineHeight: 16,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  skipText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    letterSpacing: 1.5,
  },
})
