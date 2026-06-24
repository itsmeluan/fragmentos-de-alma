-- Migration 007 — Círculo de Transmutação
-- Ecos: blueprints genéticos por jogador, com absorção por assinatura.

CREATE TABLE IF NOT EXISTS public.ecos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,

  -- Assinatura genética (identidade)
  signature_origin text NOT NULL,
  signature_affinity text NOT NULL,
  signature_core text NOT NULL,
  signature_mutations text[] NOT NULL DEFAULT '{}',
  -- Chave computada: '{origin}:{affinity}:{core}:{sorted_mutations_joined_by_comma}'
  signature_key text NOT NULL,

  -- Dados genéticos absorvidos (melhores valores, cap 120)
  best_genes jsonb NOT NULL DEFAULT '{}',

  -- Melhores habilidades absorvidas por slot.
  best_skills jsonb NOT NULL DEFAULT '{}',

  -- Maior raridade já absorvida nesta assinatura.
  rarity text NOT NULL CHECK (rarity IN ('comum','incomum','raro','epico','lendario','unico')),

  -- Quantos heróis foram absorvidos neste Eco.
  absorption_count integer NOT NULL DEFAULT 1,

  UNIQUE(player_id, signature_key)
);

CREATE INDEX IF NOT EXISTS ecos_player ON public.ecos(player_id);

ALTER TABLE public.ecos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ecos_own" ON public.ecos;
CREATE POLICY "ecos_own" ON public.ecos
  FOR ALL USING (auth.uid() = player_id);

ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS team_hero_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bench_hero_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS legacy_score integer NOT NULL DEFAULT 0;
