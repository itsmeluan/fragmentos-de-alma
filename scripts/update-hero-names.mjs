// Atualiza nomes dos heróis no Supabase para o novo formato de palavra única.
// Uso:
//   SUPA_EMAIL=seu@email SUPA_PASSWORD=suasenha node scripts/update-hero-names.mjs
// Executar a partir de /Volumes/SSDLuan/Projetos/Fragmentos_de_Alma/

import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { createClient } = require('../app/fragmentos-de-alma/node_modules/@supabase/supabase-js/dist/index.cjs')

const SUPABASE_URL = 'https://yyagzstiqxgqyeazprlx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5YWd6c3RpcXhncXllYXpwcmx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNDQ1NDgsImV4cCI6MjA5NzgyMDU0OH0.640O_RtL8fjJSOqR3ZQ9zrinyGPR2aKDlateeZByNNE'

const email    = process.env.SUPA_EMAIL
const password = process.env.SUPA_PASSWORD

if (!email || !password) {
  console.error('Uso: SUPA_EMAIL=email SUPA_PASSWORD=senha node scripts/update-hero-names.mjs')
  process.exit(1)
}

// ---- RNG determinístico (mesmo algoritmo de random.ts) ----
function makeSeededRng(seed) {
  let h = 0
  for (const ch of seed) h = (Math.imul(31, h) + ch.charCodeAt(0)) | 0
  return () => {
    h = (Math.imul(1664525, h) + 1013904223) | 0
    return (h >>> 0) / 0x100000000
  }
}
function pick(arr, rng) { return arr[Math.floor(rng() * arr.length)] }

const ORIGIN_PREFIXES = {
  Abissal:    ['Neth', 'Vor', 'Xal', 'Myr', 'Drex', 'Keth', 'Zul', 'Umbr'],
  Celestial:  ['Lyra', 'Aer', 'Sol', 'Ael', 'Syl', 'Vel', 'Aur', 'Cael'],
  Primordial: ['Korum', 'Thar', 'Grev', 'Mund', 'Brak', 'Keld', 'Rhor', 'Gor'],
  Forjada:    ['Velk', 'Mek', 'Drav', 'Tor', 'Kor', 'Drum', 'Fer', 'Strak'],
  Errante:    ['Dal', 'Mir', 'Wyn', 'Sel', 'Fal', 'Tir', 'Ash', 'Wan'],
}
const CORE_ROOTS = {
  Guardião:   ['dur', 'gar', 'sten', 'mur', 'dun', 'beld'],
  Destruidor: ['kara', 'zar', 'gore', 'maw', 'rak', 'vex'],
  Arauto:     ['sol', 'rael', 'lyth', 'vel', 'sael', 'aen'],
  Trickster:  ['sha', 'mir', 'xis', 'dal', 'wyl', 'ren'],
  Invocador:  ['sira', 'mael', 'ryn', 'thas', 'oir', 'vel'],
}
const AFFINITY_SUFFIXES = {
  Fogo:   ['ignar', 'brax', 'pyreth', 'kareth', 'ashvel', 'solmor'],
  Água:   ['marev', 'tidhel', 'corvel', 'aequen', 'navar', 'selmar'],
  Terra:  ['rath', 'stonem', 'gravik', 'muldar', 'theron', 'kaldir'],
  Vento:  ['ventyr', 'brehal', 'galeth', 'wyval', 'kiral', 'sylmar'],
  Vazio:  ['vex', 'nulmar', 'vacor', 'zereth', 'voidar', 'nulvel'],
  Luz:    ['aen', 'lumvar', 'auren', 'lirath', 'cael', 'soldan'],
  Sombra: ['umbra', 'shavel', 'noctis', 'darvel', 'obsir', 'kethum'],
  Éter:   ['aethun', 'ethrael', 'vyrel', 'aelvar', 'ephren', 'tymel'],
}

function generateName(essence, seed) {
  const rng = makeSeededRng(seed)
  return pick(ORIGIN_PREFIXES[essence.origin], rng)
       + pick(CORE_ROOTS[essence.core], rng)
       + pick(AFFINITY_SUFFIXES[essence.affinity], rng)
}

// ---- Main ----
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
})

console.log(`Autenticando como ${email}...`)
const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
if (authErr) { console.error('Falha no login:', authErr.message); process.exit(1) }
console.log('Login OK.\n')

const { data: heroes, error } = await supabase
  .from('heroes')
  .select('id, name, fusion_seed, genome')

if (error) { console.error('Erro ao buscar heróis:', error.message); process.exit(1) }
console.log(`${heroes.length} heróis encontrados. Atualizando nomes...\n`)

let ok = 0, fail = 0
for (const hero of heroes) {
  const essence = hero.genome?.essence
  if (!essence) { console.warn(`  [SKIP] ${hero.id} — sem essence`); fail++; continue }
  const newName = generateName(essence, hero.fusion_seed || hero.id)
  const { error: upErr } = await supabase.from('heroes').update({ name: newName }).eq('id', hero.id)
  if (upErr) { console.error(`  [FAIL] "${hero.name}" → ${upErr.message}`); fail++ }
  else       { console.log(`  [OK] "${hero.name}" → "${newName}"`); ok++ }
}
console.log(`\nConcluído: ${ok} atualizados, ${fail} falhas.`)
