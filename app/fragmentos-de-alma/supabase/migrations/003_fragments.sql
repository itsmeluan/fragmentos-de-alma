-- Migration 003 — Fragmentos (pré-fusão)

CREATE TABLE public.fragments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,

  -- Genoma parcial (fragmentos têm genes incompletos — revelados progressivamente)
  partial_genome jsonb NOT NULL,

  -- Origem do fragmento
  source text NOT NULL CHECK (source IN ('dungeon_drop','event_reward','market_trade','fusion_byproduct')),
  biome_origin text,

  -- Visual provisório (antes da fusão)
  preview_visual jsonb NOT NULL,

  -- Raridade estimada (pode mudar após fusão revelar genes ocultos)
  estimated_rarity text CHECK (estimated_rarity IN ('comum','incomum','raro','epico','lendario','unico'))
);

CREATE INDEX fragments_player_id ON public.fragments(player_id);

ALTER TABLE public.fragments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fragments_own_data" ON public.fragments
  FOR ALL USING (auth.uid() = player_id);
