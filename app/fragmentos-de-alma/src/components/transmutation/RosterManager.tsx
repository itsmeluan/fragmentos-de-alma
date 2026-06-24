import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { HeroCard } from '@/components/hero/HeroCard'
import { theme } from '@/lib/theme'
import { useGameStore } from '@/store/gameStore'
import type { Hero } from '@/systems/genes/types'

interface RosterManagerProps {
  onClose?: () => void
}

function heroById(heroes: Hero[], id: string): Hero | null {
  return heroes.find((hero) => hero.id === id) ?? null
}

function rosterKey(teamIds: readonly string[], benchIds: readonly string[]): string {
  return `${teamIds.join(',')}|${benchIds.join(',')}`
}

function sameIds(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

function isRosterComplete(teamIds: readonly string[], benchIds: readonly string[]): boolean {
  return teamIds.length === 3 && benchIds.length === 3
}

export function RosterManager({ onClose }: RosterManagerProps) {
  const { heroes, player, setRoster } = useGameStore()
  const [teamIds, setTeamIds] = useState<string[]>(player?.teamHeroIds ?? [])
  const [benchIds, setBenchIds] = useState<string[]>(player?.benchHeroIds ?? [])
  const [isSaving, setIsSaving] = useState(false)
  const lastSavedKey = useRef(rosterKey(player?.teamHeroIds ?? [], player?.benchHeroIds ?? []))

  const activeHeroes = useMemo(() => heroes.filter((hero) => !hero.isRetired), [heroes])
  const usedIds = useMemo(() => new Set([...teamIds, ...benchIds]), [teamIds, benchIds])
  const availableHeroes = useMemo(
    () => activeHeroes.filter((hero) => !usedIds.has(hero.id)),
    [activeHeroes, usedIds],
  )
  const rosterComplete = isRosterComplete(teamIds, benchIds)

  useEffect(() => {
    const nextTeamIds = player?.teamHeroIds ?? []
    const nextBenchIds = player?.benchHeroIds ?? []
    lastSavedKey.current = rosterKey(nextTeamIds, nextBenchIds)

    setTeamIds((current) => sameIds(current, nextTeamIds) ? current : nextTeamIds)
    setBenchIds((current) => sameIds(current, nextBenchIds) ? current : nextBenchIds)
  }, [player?.teamHeroIds, player?.benchHeroIds])

  useEffect(() => {
    const draftKey = rosterKey(teamIds, benchIds)
    if (draftKey === lastSavedKey.current || !rosterComplete) {
      return
    }

    const timeout = setTimeout(() => {
      setIsSaving(true)
      setRoster(teamIds, benchIds)
        .then(() => {
          lastSavedKey.current = draftKey
        })
        .finally(() => setIsSaving(false))
    }, 500)

    return () => clearTimeout(timeout)
  }, [benchIds, rosterComplete, setRoster, teamIds])

  const addHero = (hero: Hero) => {
    if (usedIds.has(hero.id)) return

    if (teamIds.length < 3) {
      setTeamIds([...teamIds, hero.id])
      return
    }

    if (benchIds.length < 3) {
      setBenchIds([...benchIds, hero.id])
    }
  }

  const removeHero = (heroId: string) => {
    setTeamIds(teamIds.filter((id) => id !== heroId))
    setBenchIds(benchIds.filter((id) => id !== heroId))
  }

  const saveNow = async () => {
    if (!rosterComplete) {
      Alert.alert(
        'Roster incompleto',
        'Escolha 3 heróis para o time e 3 heróis para o banco antes de concluir.',
      )
      return false
    }

    const draftKey = rosterKey(teamIds, benchIds)
    if (draftKey === lastSavedKey.current) return true

    setIsSaving(true)
    try {
      await setRoster(teamIds, benchIds)
      lastSavedKey.current = draftKey
      return true
    } finally {
      setIsSaving(false)
    }
  }

  const close = async () => {
    const saved = await saveNow()
    if (saved) onClose?.()
  }

  return (
    <View style={styles.root}>
      <Text style={styles.helpText}>
        Time e banco ficam protegidos contra Eco, Cristais e Transmutação.
      </Text>

      <Text style={styles.sectionTitle}>TIME</Text>
      <View style={styles.slotRow}>
        {[0, 1, 2].map((index) => (
          <RosterSlot
            key={`team-${index}`}
            label={`Time ${index + 1}`}
            hero={teamIds[index] ? heroById(activeHeroes, teamIds[index]) : null}
            onPress={() => teamIds[index] && removeHero(teamIds[index])}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>BANCO</Text>
      <View style={styles.slotRow}>
        {[0, 1, 2].map((index) => (
          <RosterSlot
            key={`bench-${index}`}
            label={`Banco ${index + 1}`}
            hero={benchIds[index] ? heroById(activeHeroes, benchIds[index]) : null}
            onPress={() => benchIds[index] && removeHero(benchIds[index])}
          />
        ))}
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusText}>
          {teamIds.length + benchIds.length}/6 protegidos
        </Text>
        <Text style={[styles.statusText, !rosterComplete && styles.statusWarn]}>
          {isSaving
            ? 'Salvando...'
            : rosterComplete
              ? 'Salvo automaticamente'
              : 'Complete o roster'}
        </Text>
      </View>
      {!rosterComplete && (
        <Text style={styles.warningText}>
          O roster precisa ter 3 heróis no time e 3 no banco.
        </Text>
      )}

      <Text style={styles.sectionTitle}>DISPONÍVEIS</Text>
      {availableHeroes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhum herói livre para adicionar.</Text>
        </View>
      ) : (
        <FlatList
          data={availableHeroes}
          keyExtractor={(hero) => hero.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <HeroCard hero={item} onPress={addHero} />
            </View>
          )}
        />
      )}

      {onClose && (
        <Button
          label={isSaving ? 'Salvando...' : 'Concluir'}
          onPress={close}
          loading={isSaving}
          style={styles.closeButton}
        />
      )}
    </View>
  )
}

function RosterSlot({
  label,
  hero,
  onPress,
}: {
  label: string
  hero: Hero | null
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.slot, hero && styles.slotFilled]}
      disabled={!hero}
    >
      {hero ? (
        <>
          <Text style={styles.slotName} numberOfLines={2}>{hero.name}</Text>
          <Text style={styles.slotMeta}>{hero.rarity}</Text>
        </>
      ) : (
        <Text style={styles.slotEmpty}>{label}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: { gap: theme.spacing.md },
  helpText: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: theme.colors.gold.main,
  },
  slotRow: { flexDirection: 'row', gap: theme.spacing.sm },
  slot: {
    flex: 1,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.xs,
  },
  slotFilled: {
    borderStyle: 'solid',
    borderColor: theme.colors.gold.main,
    backgroundColor: theme.colors.gold.dark + '22',
  },
  slotName: {
    fontFamily: theme.typography.heroName.fontFamily,
    fontSize: 11,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  slotMeta: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  slotEmpty: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.sm },
  statusText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusWarn: { color: theme.colors.gold.light },
  warningText: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.gold.light,
    textAlign: 'center',
  },
  grid: { gap: theme.spacing.sm, paddingBottom: theme.spacing.md },
  gridRow: { gap: theme.spacing.sm },
  cardWrap: { flex: 1 },
  empty: {
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.background.primary,
  },
  emptyText: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  closeButton: { marginTop: theme.spacing.sm },
})
