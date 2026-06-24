import React, { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AlchemicalCircle } from '@/components/fusion/AlchemicalCircle'
import { HeroCard } from '@/components/hero/HeroCard'
import { HeroDetail } from '@/components/hero/HeroDetail'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { theme } from '@/lib/theme'
import { useGameStore } from '@/store/gameStore'
import type { FusionChildInput, FusionResult, Player } from '@/store/gameStore'
import type { Hero, Genome, Rarity } from '@/systems/genes/types'
import type { HeroSkills, Skill } from '@/systems/skills/types'
import type { Eco, EcoCreateResult, ExtractCrystalsResult } from '@/systems/genes/eco'
import {
  buildSignatureKey,
  calcEcoTransmutationCost,
  canUseCatalystForRarity,
  CRYSTAL_EXTRACTION_YIELD,
  ecoToGenome,
  flattenSkills,
  getTierUpChance,
  previewAbsorption,
  RARITY_ORDER,
} from '@/systems/genes/eco'
import { fuseGenomes } from '@/systems/genes/fusion'
import { calculateRarity } from '@/systems/genes/rarity'
import { generateSkills } from '@/systems/skills/generator'
import { generateVisualParams } from '@/systems/visual/generator'
import { isHeroAwakened } from '@/systems/progression/legacy'
import { makeSeededRng } from '@/utils/random'
import { generateName } from '@/utils/nameGenerator'

const RARITY_LABELS: Record<Rarity, string> = {
  comum: 'Comum',
  incomum: 'Incomum',
  raro: 'Raro',
  epico: 'Épico',
  lendario: 'Lendário',
  unico: 'Único',
}

type ActiveTab = 'eco' | 'crystals' | 'transmute'
type SkillBucket = keyof HeroSkills

const TABS: Array<{ key: ActiveTab; label: string }> = [
  { key: 'eco', label: 'Criar Eco' },
  { key: 'crystals', label: 'Extrair' },
  { key: 'transmute', label: 'Transmutar' },
]

function clampGenome(genome: Genome): Genome {
  return {
    ...genome,
    attributes: {
      forca: Math.min(genome.attributes.forca, 120),
      ressonancia: Math.min(genome.attributes.ressonancia, 120),
      resistencia: Math.min(genome.attributes.resistencia, 120),
      agilidade: Math.min(genome.attributes.agilidade, 120),
      vontade: Math.min(genome.attributes.vontade, 120),
      aura: Math.min(genome.attributes.aura, 120),
    },
  }
}

function nextRarity(rarity: Rarity): Rarity {
  const index = RARITY_ORDER.indexOf(rarity)
  return index >= 0 && index < RARITY_ORDER.length - 1 ? RARITY_ORDER[index + 1] : rarity
}

function adaptInheritedSkill(skill: Skill, template: Skill, bucket: SkillBucket): Skill {
  return {
    ...skill,
    id: template.id,
    isPassive: bucket === 'passive',
    isUnique: bucket === 'unique',
    isEmergent: bucket === 'emergent' || skill.isEmergent,
  }
}

function inheritSkillsForBucket(
  generated: Skill[],
  bucket: SkillBucket,
  pool: Skill[],
  rng: () => number,
): Skill[] {
  return generated.map((template) => {
    if (pool.length === 0 || rng() >= 0.7) return template
    const inherited = pool[Math.floor(rng() * pool.length)]
    return adaptInheritedSkill(inherited, template, bucket)
  })
}

function buildTransmutationSkills(
  genome: Genome,
  rarity: Rarity,
  seed: string,
  primaryEcoA: Eco,
  primaryEcoB: Eco,
  catalysts: Eco[],
): HeroSkills {
  const generated = generateSkills(genome, rarity, `${seed}:generated-skills`)
  const pool = [
    ...Object.values(primaryEcoA.best_skills),
    ...Object.values(primaryEcoB.best_skills),
    ...catalysts.flatMap((eco) => Object.values(eco.best_skills)),
  ].sort((a, b) => b.effect.power - a.effect.power)
  const rng = makeSeededRng(`${seed}:skill-inheritance`)

  return {
    active: inheritSkillsForBucket(generated.active, 'active', pool, rng),
    passive: inheritSkillsForBucket(generated.passive, 'passive', pool, rng),
    unique: inheritSkillsForBucket(generated.unique, 'unique', pool, rng),
    emergent: inheritSkillsForBucket(generated.emergent, 'emergent', pool, rng),
  }
}

function buildHeroSignature(hero: Hero): string {
  return buildSignatureKey(
    hero.genome.essence.origin,
    hero.genome.essence.affinity,
    hero.genome.essence.core,
    hero.genome.mutations,
  )
}

function getRetireBlockReason(
  hero: Hero,
  player: Player | null,
  activeCount: number,
): string | null {
  if (player?.teamHeroIds.includes(hero.id) || player?.benchHeroIds.includes(hero.id)) {
    return 'No roster'
  }
  if (activeCount <= 6) return 'Mínimo 6 heróis'
  return null
}

export default function TransmutationScreen() {
  const {
    player,
    heroes,
    ecos,
    isLoading,
    commitCreateEco,
    commitExtractCrystals,
    commitTransmutation,
  } = useGameStore()
  const [activeTab, setActiveTab] = useState<ActiveTab>('eco')

  const activeHeroes = useMemo(
    () => heroes.filter((hero) => !hero.isRetired),
    [heroes],
  )

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>CÍRCULO DE TRANSMUTAÇÃO</Text>
        <Text style={styles.subtitle}>Aposentar, cristalizar, recombinar</Text>
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'eco' && (
        <CreateEcoTab
          heroes={activeHeroes}
          activeCount={activeHeroes.length}
          player={player}
          ecos={ecos}
          isLoading={isLoading}
          onCommit={commitCreateEco}
        />
      )}
      {activeTab === 'crystals' && (
        <ExtractCrystalsTab
          heroes={activeHeroes}
          activeCount={activeHeroes.length}
          player={player}
          isLoading={isLoading}
          onCommit={commitExtractCrystals}
        />
      )}
      {activeTab === 'transmute' && (
        <TransmuteTab
          ecos={ecos}
          player={player}
          isLoading={isLoading}
          onCommit={commitTransmutation}
        />
      )}
    </SafeAreaView>
  )
}

function CreateEcoTab({
  heroes,
  activeCount,
  player,
  ecos,
  isLoading,
  onCommit,
}: {
  heroes: Hero[]
  activeCount: number
  player: Player | null
  ecos: Eco[]
  isLoading: boolean
  onCommit: (heroId: string) => Promise<EcoCreateResult>
}) {
  const [selected, setSelected] = useState<Hero | null>(null)
  const [confirming, setConfirming] = useState(false)

  const getExistingEco = useCallback(
    (hero: Hero) => ecos.find((eco) => eco.signature_key === buildHeroSignature(hero)) ?? null,
    [ecos],
  )

  const getDisabledLabel = useCallback(
    (hero: Hero): string | null => {
      const blockReason = getRetireBlockReason(hero, player, activeCount)
      if (blockReason) return blockReason
      if (!isHeroAwakened(hero)) return 'Requer nível 50'
      return null
    },
    [player, activeCount],
  )

  const selectedEco = selected ? getExistingEco(selected) : null
  const preview = selectedEco && selected
    ? previewAbsorption(selectedEco, { ...selected.genome.attributes }, flattenSkills(selected.skills))
    : null

  const handleConfirm = async () => {
    if (!selected) return

    setConfirming(true)
    const result = await onCommit(selected.id)
    setConfirming(false)
    setSelected(null)

    if (!result.ok) {
      Alert.alert('Erro', result.error)
      return
    }

    Alert.alert(
      result.absorbed ? 'Eco Absorvido' : 'Eco Criado',
      result.absorbed
        ? `${selected.name} foi absorvido por um Eco existente.`
        : `A assinatura genética de ${selected.name} foi cristalizada.`,
    )
  }

  return (
    <View style={styles.content}>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Criar Eco</Text>
        <Text style={styles.infoText}>
          Apenas heróis no nível máximo (50) podem virar Eco. Heróis do time ou banco continuam protegidos.
        </Text>
      </View>
      <HeroGrid
        heroes={heroes}
        isLoading={isLoading}
        emptyText="Nenhum herói na coleção ainda."
        renderOverlay={(hero) => (
          getExistingEco(hero) ? (
            <View style={styles.absorbBadge}>
              <Text style={styles.badgeTextDark}>ABSORÇÃO</Text>
            </View>
          ) : null
        )}
        getDisabledLabel={getDisabledLabel}
        onPress={setSelected}
      />

      <Modal
        visible={selected !== null}
        title={selectedEco ? 'Absorver Eco' : 'Criar Eco'}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <View style={styles.modalBody}>
            <Text style={styles.modalHero}>{selected.name}</Text>
            <Text style={styles.modalMeta}>
              {selected.genome.essence.origin} / {selected.genome.essence.affinity} / {selected.genome.essence.core}
            </Text>
            {preview ? (
              <View style={styles.previewBox}>
                <Text style={styles.previewTitle}>Preview de Absorção</Text>
                <Text style={styles.previewText}>
                  Genes melhorados: {Object.keys(preview.changes).length || 'nenhum'}
                </Text>
                <Text style={styles.previewText}>
                  Skills melhoradas: {Object.keys(preview.skillChanges).length || 'nenhuma'}
                </Text>
                <Text style={styles.previewText}>Absorções atuais: {selectedEco?.absorption_count ?? 1}</Text>
              </View>
            ) : (
              <Text style={styles.modalDesc}>
                Um novo Eco será criado com a assinatura genética deste herói.
              </Text>
            )}
            <Text style={styles.warningText}>O herói será aposentado permanentemente.</Text>
            <Button
              label={selectedEco ? 'Absorver Eco' : 'Criar Eco'}
              onPress={handleConfirm}
              loading={confirming}
            />
            <Button
              label="Cancelar"
              variant="secondary"
              onPress={() => setSelected(null)}
              style={styles.modalButtonGap}
            />
          </View>
        )}
      </Modal>
    </View>
  )
}

function ExtractCrystalsTab({
  heroes,
  activeCount,
  player,
  isLoading,
  onCommit,
}: {
  heroes: Hero[]
  activeCount: number
  player: Player | null
  isLoading: boolean
  onCommit: (heroId: string) => Promise<ExtractCrystalsResult>
}) {
  const [selected, setSelected] = useState<Hero | null>(null)
  const [confirming, setConfirming] = useState(false)
  const selectedYield = selected ? CRYSTAL_EXTRACTION_YIELD[selected.rarity] : 0

  const getDisabledLabel = useCallback(
    (hero: Hero): string | null => getRetireBlockReason(hero, player, activeCount),
    [player, activeCount],
  )

  const handleConfirm = async () => {
    if (!selected) return

    setConfirming(true)
    const result = await onCommit(selected.id)
    setConfirming(false)
    setSelected(null)

    if (!result.ok) {
      Alert.alert('Erro', result.error)
      return
    }

    Alert.alert('Cristais Extraídos', `+${result.crystals} Cristais de Essência obtidos.`)
  }

  return (
    <View style={styles.content}>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Extrair Cristais</Text>
        <Text style={styles.infoText}>
          Aposenta um herói fora do roster e converte sua raridade em Cristais de Essência.
        </Text>
      </View>
      <HeroGrid
        heroes={heroes}
        isLoading={isLoading}
        emptyText="Nenhum herói na coleção ainda."
        renderOverlay={(hero) => (
          <View style={styles.crystalBadge}>
            <Text style={styles.badgeTextLight}>+{CRYSTAL_EXTRACTION_YIELD[hero.rarity]} Cristais</Text>
          </View>
        )}
        getDisabledLabel={getDisabledLabel}
        onPress={setSelected}
      />

      <Modal
        visible={selected !== null}
        title="Extrair Cristais"
        onClose={() => setSelected(null)}
      >
        {selected && (
          <View style={styles.modalBody}>
            <Text style={styles.modalHero}>{selected.name}</Text>
            <Text style={styles.modalMeta}>{RARITY_LABELS[selected.rarity]}</Text>
            <Text style={styles.modalDesc}>
              Este herói será aposentado e convertido em {selectedYield} Cristais de Essência.
            </Text>
            <Button
              label={`Extrair +${selectedYield}`}
              onPress={handleConfirm}
              loading={confirming}
            />
            <Button
              label="Cancelar"
              variant="secondary"
              onPress={() => setSelected(null)}
              style={styles.modalButtonGap}
            />
          </View>
        )}
      </Modal>
    </View>
  )
}

function TransmuteTab({
  ecos,
  player,
  isLoading,
  onCommit,
}: {
  ecos: Eco[]
  player: Player | null
  isLoading: boolean
  onCommit: (
    primaryEcoAId: string,
    primaryEcoBId: string,
    catalystEcoIds: string[],
    child: FusionChildInput,
  ) => Promise<FusionResult>
}) {
  const [primaryEcoA, setPrimaryEcoA] = useState<Eco | null>(null)
  const [primaryEcoB, setPrimaryEcoB] = useState<Eco | null>(null)
  const [catalysts, setCatalysts] = useState<Eco[]>([])
  const [selecting, setSelecting] = useState<'A' | 'B' | 'CAT' | null>(null)
  const [transmuting, setTransmuting] = useState(false)
  const [resultHero, setResultHero] = useState<Hero | null>(null)

  const canTransmute = primaryEcoA !== null && primaryEcoB !== null && primaryEcoA.id !== primaryEcoB.id
  const cost = primaryEcoA && primaryEcoB ? calcEcoTransmutationCost(primaryEcoA, primaryEcoB) : null
  const canAffordFragments = (player?.soulFragments ?? 0) >= (cost?.fragments ?? 0)
  const canAffordCrystals = (player?.essenceCrystals ?? 0) >= (cost?.crystals ?? 0)
  const canAfford = canAffordFragments && canAffordCrystals
  const tierUpChance = cost
    ? getTierUpChance(catalysts.length, cost.rarity, player?.legacyScore ?? 0)
    : 0
  const blockedEcoIds = new Set([
    ...(primaryEcoA ? [primaryEcoA.id] : []),
    ...(primaryEcoB ? [primaryEcoB.id] : []),
    ...catalysts.map((eco) => eco.id),
  ])
  const availableCatalysts = cost
    ? ecos.filter((eco) => !blockedEcoIds.has(eco.id) && canUseCatalystForRarity(eco.rarity, cost.rarity))
    : ecos.filter((eco) => !blockedEcoIds.has(eco.id))

  const handleTransmute = async () => {
    if (!primaryEcoA || !primaryEcoB || !canAfford) return

    setTransmuting(true)
    const seed = `transmute-eco:${primaryEcoA.id}:${primaryEcoB.id}:${Date.now()}`
    const fusionResult = fuseGenomes({
      parentA: ecoToGenome(primaryEcoA),
      parentB: ecoToGenome(primaryEcoB),
      seed,
    })
    const genome = clampGenome(fusionResult.genome)
    const baseRarity = calculateRarity(genome)
    const rng = makeSeededRng(`${seed}:tier-up`)
    const rarity = tierUpChance > 0 && rng() < tierUpChance ? nextRarity(baseRarity) : baseRarity
    const visualParams = generateVisualParams(genome, seed)
    const skills = buildTransmutationSkills(genome, rarity, seed, primaryEcoA, primaryEcoB, catalysts)

    const result = await onCommit(primaryEcoA.id, primaryEcoB.id, catalysts.map((eco) => eco.id), {
      name: generateName(genome, seed),
      fusionSeed: seed,
      genome,
      rarity,
      visualParams,
      skills,
      generation: 1,
    })

    setTransmuting(false)

    if (!result.ok) {
      Alert.alert('Erro na Transmutação', result.error)
      return
    }

    setResultHero(result.hero)
    setPrimaryEcoA(null)
    setPrimaryEcoB(null)
    setCatalysts([])
  }

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.transmuteContent}>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Transmutar por Ecos</Text>
        <Text style={styles.infoText}>
          Escolha dois Ecos principais para formar o genoma do novo herói. Catalisadores aumentam a chance de +1 tier e são consumidos.
        </Text>
      </View>

      <View style={styles.parentRow}>
        <EcoSlot label="Eco A" eco={primaryEcoA} onPress={() => setSelecting('A')} />
        <AlchemicalCircle active={canTransmute} size={86} />
        <EcoSlot label="Eco B" eco={primaryEcoB} onPress={() => setSelecting('B')} />
      </View>

      <Text style={styles.sectionLabel}>Catalisadores</Text>
      <View style={styles.catalystRow}>
        {[0, 1, 2].map((index) => {
          const eco = catalysts[index]
          return (
            <Pressable
              key={index}
              onPress={() => {
                if (eco) {
                  setCatalysts(catalysts.filter((_, itemIndex) => itemIndex !== index))
                  return
                }
                if (catalysts.length < 3) setSelecting('CAT')
              }}
              style={[styles.catalystSlot, eco && styles.catalystSlotFilled]}
            >
              {eco ? (
                <>
                  <Text style={styles.catalystName} numberOfLines={1}>{eco.signature_affinity}</Text>
                  <Text style={styles.catalystMeta} numberOfLines={1}>{RARITY_LABELS[eco.rarity]}</Text>
                </>
              ) : (
                <Text style={styles.slotEmpty}>+ Eco</Text>
              )}
            </Pressable>
          )
        })}
      </View>

      <View style={styles.previewBox}>
        <Text style={styles.previewTitle}>Preview</Text>
        <Text style={styles.previewText}>
          Custo: {cost ? `${cost.fragments} Fragmentos + ${cost.crystals} Cristais` : 'selecione dois Ecos principais'}
        </Text>
        <Text style={styles.previewText}>
          Catalisadores: {catalysts.length}/3
          {tierUpChance > 0 ? ` · chance +1 tier: ${Math.round(tierUpChance * 100)}%` : ''}
        </Text>
        {cost && (
          <Text style={styles.previewText}>Raridade mínima do catalisador: {RARITY_LABELS[cost.rarity]}</Text>
        )}
        {cost && !canAffordFragments && (
          <Text style={styles.warningText}>
            Fragmentos insuficientes ({player?.soulFragments ?? 0}/{cost.fragments}).
          </Text>
        )}
        {cost && !canAffordCrystals && (
          <Text style={styles.warningText}>
            Cristais insuficientes ({player?.essenceCrystals ?? 0}/{cost.crystals}).
          </Text>
        )}
      </View>

      <Button
        label="Transmutar"
        onPress={handleTransmute}
        disabled={!canTransmute || !canAfford || transmuting}
        loading={transmuting}
      />

      {(selecting === 'A' || selecting === 'B') && (
        <EcoSelectionModal
          title={`Selecionar ${selecting === 'A' ? 'Eco A' : 'Eco B'}`}
          ecos={ecos.filter((eco) => selecting === 'A' ? eco.id !== primaryEcoB?.id : eco.id !== primaryEcoA?.id)}
          isLoading={isLoading}
          onClose={() => setSelecting(null)}
          onSelect={(eco) => {
            if (selecting === 'A') setPrimaryEcoA(eco)
            if (selecting === 'B') setPrimaryEcoB(eco)
            setSelecting(null)
          }}
        />
      )}

      {selecting === 'CAT' && (
        <Modal visible title="Selecionar Eco" onClose={() => setSelecting(null)}>
          <View style={styles.modalBody}>
            {availableCatalysts.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum Eco compatível disponível.</Text>
            ) : (
              availableCatalysts.map((eco) => (
                <Pressable
                  key={eco.id}
                  onPress={() => {
                    setCatalysts([...catalysts, eco].slice(0, 3))
                    setSelecting(null)
                  }}
                  style={styles.ecoRow}
                >
                  <Text style={styles.ecoName}>
                    {eco.signature_origin} / {eco.signature_affinity} / {eco.signature_core}
                  </Text>
                  <Text style={styles.ecoMeta}>
                    {RARITY_LABELS[eco.rarity]} · absorções {eco.absorption_count}
                  </Text>
                </Pressable>
              ))
            )}
            <Button label="Cancelar" variant="secondary" onPress={() => setSelecting(null)} />
          </View>
        </Modal>
      )}

      <Modal visible={resultHero !== null} title="Transmutação Concluída" onClose={() => setResultHero(null)} fill>
        {resultHero && (
          <View style={styles.resultBody}>
            <HeroDetail hero={resultHero} />
            <Button label="Fechar" onPress={() => setResultHero(null)} />
          </View>
        )}
      </Modal>
    </ScrollView>
  )
}

function HeroGrid({
  heroes,
  isLoading,
  emptyText,
  onPress,
  renderOverlay,
  getDisabledLabel,
}: {
  heroes: Hero[]
  isLoading: boolean
  emptyText: string
  onPress: (hero: Hero) => void
  renderOverlay: (hero: Hero) => React.ReactNode
  getDisabledLabel?: (hero: Hero) => string | null
}) {
  if (isLoading) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator color={theme.colors.gold.main} />
        <Text style={styles.emptyText}>Carregando...</Text>
      </View>
    )
  }

  if (heroes.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyText}</Text>
        <Text style={styles.emptyHint}>Defina o roster na coleção e mantenha ao menos 6 heróis ativos.</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={heroes}
      keyExtractor={(hero) => hero.id}
      numColumns={2}
      columnWrapperStyle={styles.gridRow}
      contentContainerStyle={styles.grid}
      renderItem={({ item }) => (
        <View style={styles.cardWrap}>
          {renderOverlay(item)}
          <HeroCard
            hero={item}
            onPress={onPress}
            disabled={Boolean(getDisabledLabel?.(item))}
            disabledLabel={getDisabledLabel?.(item) ?? undefined}
          />
        </View>
      )}
    />
  )
}

function EcoSlot({
  label,
  eco,
  onPress,
}: {
  label: string
  eco: Eco | null
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} style={[styles.parentSlot, eco && styles.parentSlotFilled]}>
      {eco ? (
        <>
          <Text style={styles.slotName} numberOfLines={2}>{eco.signature_affinity}</Text>
          <Text style={styles.slotMeta}>{RARITY_LABELS[eco.rarity]}</Text>
          <Text style={styles.slotMini} numberOfLines={1}>{eco.signature_core}</Text>
        </>
      ) : (
        <Text style={styles.slotEmpty}>+ {label}</Text>
      )}
    </Pressable>
  )
}

function EcoSelectionModal({
  title,
  ecos,
  isLoading,
  onSelect,
  onClose,
}: {
  title: string
  ecos: Eco[]
  isLoading: boolean
  onSelect: (eco: Eco) => void
  onClose: () => void
}) {
  return (
    <Modal visible title={title} onClose={onClose}>
      <View style={styles.selectionBody}>
        {isLoading ? (
          <View style={styles.empty}>
            <ActivityIndicator color={theme.colors.gold.main} />
            <Text style={styles.emptyText}>Carregando...</Text>
          </View>
        ) : ecos.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhum Eco disponível.</Text>
          </View>
        ) : (
          <FlatList
            data={ecos}
            keyExtractor={(eco) => eco.id}
            renderItem={({ item }) => (
              <Pressable style={styles.ecoRow} onPress={() => onSelect(item)}>
                <Text style={styles.ecoName}>
                  {item.signature_origin} / {item.signature_affinity} / {item.signature_core}
                </Text>
                <Text style={styles.ecoMeta}>
                  {RARITY_LABELS[item.rarity]} · absorções {item.absorption_count}
                </Text>
              </Pressable>
            )}
          />
        )}
        <Button label="Cancelar" variant="secondary" onPress={onClose} />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background.primary },
  header: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border.subtle,
  },
  title: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 19,
    color: theme.colors.gold.main,
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border.subtle,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.background.secondary,
  },
  tabActive: {
    borderColor: theme.colors.gold.main,
    backgroundColor: theme.colors.gold.dark + '26',
  },
  tabLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: theme.colors.text.secondary,
  },
  tabLabelActive: { color: theme.colors.gold.main },
  content: { flex: 1 },
  infoBox: {
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.gold.main,
    backgroundColor: theme.colors.background.secondary,
    gap: 4,
  },
  infoTitle: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 11,
    color: theme.colors.gold.main,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  infoText: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 12,
    lineHeight: 19,
    color: theme.colors.text.secondary,
  },
  grid: { padding: theme.spacing.sm, paddingBottom: theme.spacing.xxl, gap: theme.spacing.sm },
  gridRow: { gap: theme.spacing.sm },
  cardWrap: { flex: 1, position: 'relative' },
  absorbBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 3,
    backgroundColor: theme.colors.gold.main,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  crystalBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 3,
    backgroundColor: theme.colors.blue.main,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeTextDark: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    letterSpacing: 1,
    color: theme.colors.background.primary,
  },
  badgeTextLight: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    letterSpacing: 1,
    color: theme.colors.text.primary,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  emptyText: {
    fontFamily: theme.typography.heroName.fontFamily,
    fontSize: 15,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  emptyHint: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  modalBody: { gap: theme.spacing.md },
  modalHero: {
    fontFamily: theme.typography.heroName.fontFamily,
    fontSize: 18,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  modalMeta: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  modalDesc: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 21,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  modalButtonGap: { marginTop: theme.spacing.xs },
  warningText: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 11,
    color: theme.colors.red.vivid,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  transmuteContent: { paddingBottom: theme.spacing.xxl, gap: theme.spacing.md },
  parentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  parentSlot: {
    width: 104,
    minHeight: 104,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.sm,
  },
  parentSlotFilled: {
    borderStyle: 'solid',
    borderColor: theme.colors.gold.main,
    backgroundColor: theme.colors.gold.dark + '22',
  },
  slotName: {
    fontFamily: theme.typography.heroName.fontFamily,
    fontSize: 12,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  slotMeta: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.gold.light,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  slotMini: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  slotEmpty: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 12,
    color: theme.colors.text.secondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sectionLabel: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: theme.colors.text.secondary,
    marginHorizontal: theme.spacing.lg,
  },
  catalystRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  catalystSlot: {
    flex: 1,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.xs,
  },
  catalystSlotFilled: {
    borderStyle: 'solid',
    borderColor: theme.colors.blue.ice,
    backgroundColor: theme.colors.blue.cobalt + '55',
  },
  catalystName: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 11,
    color: theme.colors.text.primary,
    textTransform: 'uppercase',
  },
  catalystMeta: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 9,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
  },
  previewBox: {
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.gold.main,
    backgroundColor: theme.colors.background.secondary,
    gap: 4,
  },
  previewTitle: {
    fontFamily: theme.typography.title.fontFamily,
    fontSize: 13,
    color: theme.colors.gold.main,
    letterSpacing: 1,
  },
  previewText: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 12,
    lineHeight: 19,
    color: theme.colors.text.primary,
  },
  selectionBody: { height: 480, gap: theme.spacing.md },
  ecoRow: {
    minHeight: 64,
    justifyContent: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border.subtle,
  },
  ecoName: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 13,
    color: theme.colors.text.primary,
  },
  ecoMeta: {
    fontFamily: theme.typography.label.fontFamily,
    fontSize: 10,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  resultBody: { maxHeight: 620, gap: theme.spacing.md },
})
