# Revisao Supabase — Fragmentos de Alma

Base analisada: `app/fragmentos-de-alma/supabase/migrations/001_players.sql` a `005_discoveries_achievements_world_rules.sql`, `src/lib/supabase.ts`, docs `00`, `03`, `07`, `09` e `PROGRESSO.md`.

## Estado das migrations

- `001_players.sql`: cria `players`, recursos, progresso de Kael, reputacao, biomas e estatisticas. RLS esta habilitado com policy `players_own_data`.
- `002_heroes.sql`: cria `heroes` com genoma, raridade, visual, skills, linhagem e status de aposentadoria. RLS esta habilitado com policy por `player_id`.
- `003_fragments.sql`: cria fragmentos pre-fusao. RLS esta habilitado com policy por `player_id`.
- `004_dungeon_sessions_battle_logs.sql`: cria sessoes de dungeon e logs de batalha. RLS esta habilitado para ambas.
- `005_discoveries_achievements_world_rules.sql`: cria descobertas globais, conquistas e regras mundiais. `world_rules` tem RLS; `emergent_discoveries` e `player_achievements` ainda precisam de RLS explicito.

## Achados importantes

- `emergent_discoveries` nao habilita RLS. Como tem `discovered_by`, o ideal e leitura publica controlada e escrita via RPC/Edge Function ou policy autenticada com validacao.
- `player_achievements` nao habilita RLS. Do jeito atual, se RLS ficar desabilitado, qualquer cliente anonimo com permissao de tabela pode ler/escrever conquistas. Deve seguir `auth.uid() = player_id`.
- Chaves de faccao estao inconsistentes: `players.faction_reputation` usa `ordem_pedra_viva`, enquanto o codigo (`mapData.ts`, `kael.ts`) usa `pedra_viva`. Isso pode quebrar reputacao da Pedra Viva.
- `players.unlocked_biomes` defaulta `{"cavernas_abismo"}`, mas o codigo de dungeons usa `abismo`, `celestial`, `genesis`, `forja`, `eter`, `vazio`. Recomendo migrar o default para `{"abismo"}` ou criar camada de compatibilidade.
- `heroes.fusion_seed` e `heroes.collection_position` nao tem restricao por jogador. Se a UI depender de ordenacao estavel, vale criar indice composto e talvez `UNIQUE(player_id, collection_position)` quando a ordenacao for persistida.
- `world_rules` permite leitura global, correto para pacote da IA coletiva. Falta indice parcial para buscar a regra ativa vigente rapidamente.
- Nao ha tabela dedicada de fusoes. O MVP persiste fusao como novo heroi com `parent_a_id`, `parent_b_id`, `generation` e incremento de `players.total_fusions`. Isso e suficiente por ora; se ranking semanal de fusoes precisar auditoria confiavel, uma tabela `fusion_events` sera necessaria.

## Indices recomendados

```sql
-- Heróis: coleção ativa do jogador, ordenação e filtros comuns.
CREATE INDEX IF NOT EXISTS heroes_player_active_position
  ON public.heroes(player_id, is_retired, collection_position NULLS LAST, created_at DESC);

CREATE INDEX IF NOT EXISTS heroes_player_rarity_created
  ON public.heroes(player_id, rarity, created_at DESC);

CREATE INDEX IF NOT EXISTS heroes_parent_a
  ON public.heroes(parent_a_id)
  WHERE parent_a_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS heroes_parent_b
  ON public.heroes(parent_b_id)
  WHERE parent_b_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS heroes_player_generation
  ON public.heroes(player_id, generation DESC, created_at DESC);

-- JSONB: buscas futuras por genoma, mutações e habilidades emergentes.
CREATE INDEX IF NOT EXISTS heroes_genome_gin
  ON public.heroes USING gin(genome);

CREATE INDEX IF NOT EXISTS heroes_skills_gin
  ON public.heroes USING gin(skills);

-- Fragmentos: drops por jogador, bioma e origem.
CREATE INDEX IF NOT EXISTS fragments_player_created
  ON public.fragments(player_id, created_at DESC);

CREATE INDEX IF NOT EXISTS fragments_player_source
  ON public.fragments(player_id, source, created_at DESC);

CREATE INDEX IF NOT EXISTS fragments_player_biome
  ON public.fragments(player_id, biome_origin, created_at DESC)
  WHERE biome_origin IS NOT NULL;

-- Dungeons: recuperar sessao ativa e historico.
CREATE INDEX IF NOT EXISTS dungeon_sessions_player_status_created
  ON public.dungeon_sessions(player_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS battle_logs_player_created
  ON public.battle_logs(player_id, created_at DESC);

CREATE INDEX IF NOT EXISTS battle_logs_analytics_gin
  ON public.battle_logs USING gin(analytics);

-- Conquistas e descobertas.
CREATE INDEX IF NOT EXISTS player_achievements_player_created
  ON public.player_achievements(player_id, created_at DESC);

CREATE INDEX IF NOT EXISTS emergent_discoveries_discovered_by
  ON public.emergent_discoveries(discovered_by, discovered_at DESC)
  WHERE discovered_by IS NOT NULL;

-- Regras mundiais: leitura do pacote ativo vigente.
CREATE INDEX IF NOT EXISTS world_rules_active_window
  ON public.world_rules(is_active, valid_from DESC, valid_until)
  WHERE is_active = true;
```

## RLS recomendado para migration 005

```sql
ALTER TABLE public.emergent_discoveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "discoveries_read_all"
  ON public.emergent_discoveries
  FOR SELECT
  USING (true);

-- Preferivel trocar INSERT direto por Edge Function/service role.
CREATE POLICY "discoveries_insert_authenticated"
  ON public.emergent_discoveries
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND discovered_by = auth.uid());

ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievements_own_data"
  ON public.player_achievements
  FOR ALL
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);
```

## Esboco Edge Function 01 — ranking semanal de fusoes

Objetivo: calcular ranking semanal sem depender do cliente. No schema atual, usar `heroes.created_at`, `parent_a_id`, `parent_b_id` e `generation > 1` como proxy de fusao. Melhor evolucao: criar `fusion_events`.

```ts
// supabase/functions/weekly-fusion-ranking/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface RankingRow {
  player_id: string
  fusion_count: number
  highest_generation: number
  rarest_score: number
}

const rarityScore: Record<string, number> = {
  comum: 1,
  incomum: 2,
  raro: 3,
  epico: 4,
  lendario: 5,
  unico: 6,
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response('Missing Supabase env', { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setUTCDate(now.getUTCDate() - 7)

  const { data, error } = await supabase
    .from('heroes')
    .select('player_id, generation, rarity')
    .gte('created_at', weekStart.toISOString())
    .not('parent_a_id', 'is', null)
    .not('parent_b_id', 'is', null)

  if (error) {
    console.error('ranking query failed', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const rows = new Map<string, RankingRow>()
  for (const hero of data ?? []) {
    const current = rows.get(hero.player_id) ?? {
      player_id: hero.player_id,
      fusion_count: 0,
      highest_generation: 1,
      rarest_score: 0,
    }

    current.fusion_count += 1
    current.highest_generation = Math.max(current.highest_generation, hero.generation ?? 1)
    current.rarest_score = Math.max(current.rarest_score, rarityScore[hero.rarity] ?? 0)
    rows.set(hero.player_id, current)
  }

  const ranking = [...rows.values()]
    .sort((a, b) =>
      b.fusion_count - a.fusion_count ||
      b.rarest_score - a.rarest_score ||
      b.highest_generation - a.highest_generation
    )
    .slice(0, 100)

  // Opcional: persistir em tabela futura weekly_rankings.
  return Response.json({ weekStart: weekStart.toISOString(), ranking })
})
```

## Esboco Edge Function 02 — webhook de inicio de evento

Objetivo: receber um webhook administrativo, criar um pacote de regra/evento em `world_rules` e devolver o estado publicado. A funcao deve exigir segredo de webhook, nao confiar em cliente mobile.

```ts
// supabase/functions/start-event-webhook/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface StartEventPayload {
  eventId: string
  title: string
  startsAt: string
  endsAt: string
  biomeModifiers: Record<string, number>
  dropRateAdjustments: Record<string, number>
  announcement?: string
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const expectedSecret = Deno.env.get('EVENT_WEBHOOK_SECRET')
  const receivedSecret = req.headers.get('x-event-secret')
  if (!expectedSecret || receivedSecret !== expectedSecret) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response('Missing Supabase env', { status: 500 })
  }

  const payload = await req.json() as StartEventPayload
  if (!payload.eventId || !payload.title || !payload.startsAt || !payload.endsAt) {
    return new Response('Invalid event payload', { status: 400 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const rules = {
    active_event: {
      id: payload.eventId,
      title: payload.title,
      announcement: payload.announcement ?? null,
    },
    dificuldade_bioma: payload.biomeModifiers,
    drop_rate_ajuste: payload.dropRateAdjustments,
  }

  const { data, error } = await supabase
    .from('world_rules')
    .insert({
      valid_from: payload.startsAt,
      valid_until: payload.endsAt,
      is_active: true,
      rules,
    })
    .select('id, valid_from, valid_until, rules')
    .single()

  if (error) {
    console.error('event publish failed', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return Response.json({ published: true, rule: data })
})
```
