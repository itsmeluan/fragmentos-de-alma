import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it, beforeAll, afterAll, jest } from '@jest/globals'
import { createClient, type User } from '@supabase/supabase-js'

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

interface PlayerSnapshot {
  id: string
  kael_name: string
  total_fusions: number
  soul_fragments: number
  essence_crystals: number
  echoes: number
}

interface HeroInsert {
  player_id: string
  name: string
  fusion_seed: string
  genome: Json
  rarity: 'comum' | 'incomum' | 'raro' | 'epico' | 'lendario' | 'unico'
  visual_params: Json
  skills: Json
  parent_a_id?: string
  parent_b_id?: string
  generation?: number
}

jest.setTimeout(60_000)

const repoRoot = path.resolve(__dirname, '../..')
const appRoot = path.join(repoRoot, 'app/fragmentos-de-alma')
const runId = `codex-it-${Date.now()}`

loadEnv([
  path.join(appRoot, '.env'),
  path.join(appRoot, '.env.local'),
  path.join(repoRoot, '.env'),
])

const supabaseUrl = requireEnv('EXPO_PUBLIC_SUPABASE_URL')
const supabaseAnonKey = requireEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY')

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
})

let testUser: User
let playerWasCreated = false
let usesEphemeralAuthUser = false
let initialPlayer: PlayerSnapshot | null = null
let heroAId = ''
let heroBId = ''
let fusedHeroId = ''

describe('Supabase integration API', () => {
  beforeAll(async () => {
    testUser = await signInOrCreateTestUser()
    await ensurePlayerRow(testUser.id)
  })

  afterAll(async () => {
    if (!testUser?.id) return

    await supabase
      .from('heroes')
      .delete()
      .eq('player_id', testUser.id)
      .like('fusion_seed', `${runId}%`)

    if (playerWasCreated && usesEphemeralAuthUser) {
      await supabase.from('players').delete().eq('id', testUser.id)
    } else if (initialPlayer) {
      await supabase
        .from('players')
        .update({
          kael_name: initialPlayer.kael_name,
          total_fusions: initialPlayer.total_fusions,
        })
        .eq('id', testUser.id)
    }

    await supabase.auth.signOut()
  })

  it('insere um heroi para o jogador autenticado', async () => {
    const hero = makeHeroInsert({
      playerId: testUser.id,
      name: 'Codex Aethun',
      fusionSeed: `${runId}-hero-a`,
      genome: genomeA,
      rarity: 'raro',
    })

    const { data, error } = await supabase
      .from('heroes')
      .insert(hero)
      .select('id, player_id, name, rarity, generation')
      .single()

    expect(error).toBeNull()
    expect(data?.player_id).toBe(testUser.id)
    expect(data?.name).toBe('Codex Aethun')
    expect(data?.rarity).toBe('raro')
    expect(data?.generation).toBe(1)

    heroAId = data?.id ?? ''
    expect(heroAId).not.toBe('')
  })

  it('persiste uma fusao como novo heroi com linhagem e incrementa total_fusions', async () => {
    expect(heroAId).not.toBe('')

    const parentB = makeHeroInsert({
      playerId: testUser.id,
      name: 'Codex Umbrak',
      fusionSeed: `${runId}-hero-b`,
      genome: genomeB,
      rarity: 'incomum',
    })

    const { data: insertedParentB, error: parentBError } = await supabase
      .from('heroes')
      .insert(parentB)
      .select('id')
      .single()

    expect(parentBError).toBeNull()
    heroBId = insertedParentB?.id ?? ''
    expect(heroBId).not.toBe('')

    const fusionResult = makeHeroInsert({
      playerId: testUser.id,
      name: 'Codex Fused Echo',
      fusionSeed: `${runId}-fusion-child`,
      genome: fusedGenome,
      rarity: 'epico',
      parentAId: heroAId,
      parentBId: heroBId,
      generation: 2,
    })

    const { data: fusedHero, error: fusionError } = await supabase
      .from('heroes')
      .insert(fusionResult)
      .select('id, parent_a_id, parent_b_id, generation, rarity')
      .single()

    expect(fusionError).toBeNull()
    expect(fusedHero?.parent_a_id).toBe(heroAId)
    expect(fusedHero?.parent_b_id).toBe(heroBId)
    expect(fusedHero?.generation).toBe(2)
    expect(fusedHero?.rarity).toBe('epico')

    fusedHeroId = fusedHero?.id ?? ''
    expect(fusedHeroId).not.toBe('')

    const currentTotal = initialPlayer?.total_fusions ?? 0
    const { data: updatedPlayer, error: updateError } = await supabase
      .from('players')
      .update({ total_fusions: currentTotal + 1 })
      .eq('id', testUser.id)
      .select('id, total_fusions')
      .single()

    expect(updateError).toBeNull()
    expect(updatedPlayer?.id).toBe(testUser.id)
    expect(updatedPlayer?.total_fusions).toBe(currentTotal + 1)
  })

  it('le o player autenticado com recursos e progresso basico', async () => {
    const { data, error } = await supabase
      .from('players')
      .select('id, kael_name, total_fusions, soul_fragments, essence_crystals, echoes')
      .eq('id', testUser.id)
      .single()

    expect(error).toBeNull()
    expect(data?.id).toBe(testUser.id)
    expect(typeof data?.kael_name).toBe('string')
    expect(typeof data?.soul_fragments).toBe('number')
    expect(typeof data?.essence_crystals).toBe('number')
    expect(typeof data?.echoes).toBe('number')
    expect(data?.total_fusions).toBeGreaterThanOrEqual((initialPlayer?.total_fusions ?? 0) + 1)
  })
})

function loadEnv(files: string[]): void {
  for (const file of files) {
    if (!existsSync(file)) continue

    const lines = readFileSync(file, 'utf8').split(/\r?\n/)
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const separator = trimmed.indexOf('=')
      if (separator === -1) continue

      const rawKey = trimmed.slice(0, separator).replace(/^export\s+/, '').trim()
      const rawValue = trimmed.slice(separator + 1).trim()
      if (!rawKey || process.env[rawKey]) continue

      process.env[rawKey] = unquote(rawValue)
    }
  }
}

function unquote(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }
  return value
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing ${name}. Expected it in app/fragmentos-de-alma/.env`)
  }
  return value
}

async function signInOrCreateTestUser(): Promise<User> {
  const configuredEmail = process.env.SUPABASE_TEST_EMAIL
  const configuredPassword = process.env.SUPABASE_TEST_PASSWORD
  const email = configuredEmail ?? `${runId}@example.com`
  const password = configuredPassword ?? `Codex-${Date.now()}-Fragmentos!`
  usesEphemeralAuthUser = !configuredEmail

  if (configuredEmail && configuredPassword) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (!data.user) throw new Error('Supabase test sign-in did not return a user')
    return data.user
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })
  if (signUpError) throw signUpError

  if (signUpData.session?.user) {
    return signUpData.session.user
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (signInError) {
    throw new Error(
      `Supabase Auth did not create an active session for ${email}. ` +
      'If email confirmation is enabled, set SUPABASE_TEST_EMAIL and SUPABASE_TEST_PASSWORD ' +
      'for an already confirmed test user before running this integration test.'
    )
  }
  if (!signInData.user) throw new Error('Supabase test sign-in did not return a user')
  return signInData.user
}

async function ensurePlayerRow(playerId: string): Promise<void> {
  const { data: existingPlayer, error: selectError } = await supabase
    .from('players')
    .select('id, kael_name, total_fusions, soul_fragments, essence_crystals, echoes')
    .eq('id', playerId)
    .maybeSingle()

  if (selectError) throw selectError

  if (existingPlayer) {
    initialPlayer = existingPlayer as PlayerSnapshot
    return
  }

  const { data: insertedPlayer, error: insertError } = await supabase
    .from('players')
    .insert({
      id: playerId,
      kael_name: 'Kael Integracao',
    })
    .select('id, kael_name, total_fusions, soul_fragments, essence_crystals, echoes')
    .single()

  if (insertError) throw insertError
  initialPlayer = insertedPlayer as PlayerSnapshot
  playerWasCreated = true
}

function makeHeroInsert(input: {
  playerId: string
  name: string
  fusionSeed: string
  genome: Json
  rarity: HeroInsert['rarity']
  parentAId?: string
  parentBId?: string
  generation?: number
}): HeroInsert {
  return {
    player_id: input.playerId,
    name: input.name,
    fusion_seed: input.fusionSeed,
    genome: input.genome,
    rarity: input.rarity,
    visual_params: makeVisualParams(input.fusionSeed),
    skills: sampleSkills,
    ...(input.parentAId ? { parent_a_id: input.parentAId } : {}),
    ...(input.parentBId ? { parent_b_id: input.parentBId } : {}),
    ...(input.generation ? { generation: input.generation } : {}),
  }
}

function makeVisualParams(seed: string): Json {
  return {
    background: { origin: 'Celestial' },
    silhouette: { coreShape: 'Guardião', weight: 'standard' },
    palette: {
      primary: '#1A3A6E',
      secondary: '#C8960C',
      glow: '#E8E0D0',
      resonanceLevel: 'vibrant',
    },
    pattern: { origin: 'Celestial', density: 'medium' },
    ornament: { coreBase: 'Guardião', mutationOrnaments: [] },
    aura: { level: 'particles', affinity: 'Éter' },
    uniqueVariations: {
      colorHueShifts: [0.01, -0.01, 0.02, -0.02, 0, 0.01],
      ornamentOffsets: [0.11, 0.22, 0.33, 0.44, 0.55, 0.66, 0.77, 0.88],
      animationSpeed: 1,
    },
    seed,
  }
}

const genomeA: Json = {
  essence: {
    origin: 'Celestial',
    affinity: 'Éter',
    core: 'Guardião',
  },
  attributes: {
    forca: 62,
    ressonancia: 81,
    resistencia: 74,
    agilidade: 43,
    vontade: 68,
    aura: 72,
  },
  mutations: [],
}

const genomeB: Json = {
  essence: {
    origin: 'Abissal',
    affinity: 'Sombra',
    core: 'Trickster',
  },
  attributes: {
    forca: 55,
    ressonancia: 59,
    resistencia: 78,
    agilidade: 66,
    vontade: 84,
    aura: 35,
  },
  mutations: ['ESPELHO'],
}

const fusedGenome: Json = {
  essence: {
    origin: 'Celestial',
    affinity: 'Éter',
    core: 'Trickster',
    hybridAffinity: 'Eclipse',
  },
  attributes: {
    forca: 69,
    ressonancia: 87,
    resistencia: 80,
    agilidade: 64,
    vontade: 88,
    aura: 76,
  },
  mutations: ['ESPELHO', 'ANCESTRAL'],
}

const sampleSkills: Json = {
  active: [
    {
      id: 'active_0',
      name: 'Astral Pulso',
      trigger: { id: 'T06', label: 'Ao usar habilidade ativa' },
      effect: { id: 'E02', label: 'causa dano elemental', power: 87 },
      modifier: { id: 'M06', label: 'com efeito elemental secundário' },
      condition: { id: 'C01', label: 'sempre' },
      isPassive: false,
      isUnique: false,
      isEmergent: false,
      sourceGenes: ['trigger:T06', 'effect:E02', 'modifier:M06'],
    },
  ],
  passive: [
    {
      id: 'passive_0',
      name: 'Ressonante Armadura',
      trigger: { id: 'T02', label: 'Ao receber dano' },
      effect: { id: 'E04', label: 'cria escudo', power: 80 },
      condition: { id: 'C10', label: 'passivo permanente' },
      isPassive: true,
      isUnique: false,
      isEmergent: false,
      sourceGenes: ['trigger:T02', 'effect:E04'],
    },
  ],
  unique: [],
  emergent: [
    {
      id: 'emergent_trickster_vontade',
      name: 'Roubo de Memória',
      trigger: { id: 'T06', label: 'Ao usar habilidade ativa' },
      effect: { id: 'E05', label: 'aplica debuff no inimigo', power: 88 },
      condition: { id: 'C05', label: 'se usou habilidade no turno anterior' },
      isPassive: false,
      isUnique: false,
      isEmergent: true,
      sourceGenes: ['core:Trickster', 'vontade'],
    },
  ],
}
