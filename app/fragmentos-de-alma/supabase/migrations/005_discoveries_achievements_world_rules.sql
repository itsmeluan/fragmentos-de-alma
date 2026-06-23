-- Migration 005 — Descobertas e Conquistas

-- Registro de habilidades emergentes descobertas (globais)
CREATE TABLE public.emergent_discoveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),

  combination_key text NOT NULL UNIQUE,
  discovered_by uuid REFERENCES public.players(id) ON DELETE SET NULL,
  discovered_at timestamptz DEFAULT now(),

  skill_data jsonb NOT NULL,
  display_name text NOT NULL
);

-- Conquistas do jogador
CREATE TABLE public.player_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,

  achievement_id text NOT NULL,
  achievement_data jsonb DEFAULT '{}',

  UNIQUE(player_id, achievement_id)
);

-- Regras globais da IA coletiva (lidas pelo motor local)
CREATE TABLE public.world_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  is_active boolean NOT NULL DEFAULT true,

  rules jsonb NOT NULL
);

-- Apenas admins podem escrever regras mundiais
ALTER TABLE public.world_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rules_read_all" ON public.world_rules FOR SELECT USING (true);
CREATE POLICY "rules_admin_write" ON public.world_rules FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
