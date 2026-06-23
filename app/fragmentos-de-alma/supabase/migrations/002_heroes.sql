-- Migration 002 — Heróis

CREATE TABLE public.heroes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,

  -- Identidade
  name text NOT NULL,           -- Nome gerado proceduralmente
  fusion_seed text NOT NULL,    -- Seed único desta fusão (timestamp + parent IDs)

  -- Genoma completo (ver doc 01_sistema_de_genes.md)
  genome jsonb NOT NULL,

  -- Raridade calculada (ver doc 01 — seção Raridade Dinâmica)
  rarity text NOT NULL CHECK (rarity IN ('comum','incomum','raro','epico','lendario','unico')),

  -- Parâmetros visuais gerados (ver doc 02_sistema_visual.md)
  visual_params jsonb NOT NULL,

  -- Habilidades geradas (ver doc 03_sistema_de_habilidades.md)
  skills jsonb NOT NULL,

  -- Progressão individual
  level integer NOT NULL DEFAULT 1,
  xp integer NOT NULL DEFAULT 0,
  bond integer NOT NULL DEFAULT 0 CHECK (bond BETWEEN 0 AND 5),

  -- Estado de combate (não persistente entre batalhas, mas salvo entre andares)
  current_hp integer,           -- NULL = hp máximo
  ultimate_charge integer NOT NULL DEFAULT 0 CHECK (ultimate_charge BETWEEN 0 AND 100),

  -- Linhagem
  parent_a_id uuid REFERENCES public.heroes(id) ON DELETE SET NULL,
  parent_b_id uuid REFERENCES public.heroes(id) ON DELETE SET NULL,
  generation integer NOT NULL DEFAULT 1,

  -- Status
  is_retired boolean NOT NULL DEFAULT false,
  retired_at timestamptz,
  echoes_generated integer,

  -- Posição na coleção (para ordenação)
  collection_position integer
);

-- Índices para queries frequentes
CREATE INDEX heroes_player_id ON public.heroes(player_id);
CREATE INDEX heroes_rarity ON public.heroes(rarity);
CREATE INDEX heroes_retired ON public.heroes(is_retired);

-- RLS
ALTER TABLE public.heroes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "heroes_own_data" ON public.heroes
  FOR ALL USING (auth.uid() = player_id);
