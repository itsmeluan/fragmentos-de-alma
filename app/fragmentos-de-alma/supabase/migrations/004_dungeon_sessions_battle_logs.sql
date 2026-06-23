-- Migration 004 — Batalhas e Dungeons

-- Sessão de dungeon (uma dungeon = múltiplas batalhas)
CREATE TABLE public.dungeon_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,

  biome_id text NOT NULL,
  current_floor integer NOT NULL DEFAULT 1,
  max_floor integer NOT NULL DEFAULT 3,

  -- Time levado para a dungeon
  active_team jsonb NOT NULL,

  -- Estado atual dos heróis (HP, ultimate charge)
  hero_states jsonb NOT NULL DEFAULT '{}',

  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','abandoned')),
  completed_at timestamptz,

  -- Recompensas coletadas nesta sessão
  rewards_collected jsonb NOT NULL DEFAULT '[]'
);

-- Log de cada batalha individual
CREATE TABLE public.battle_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  session_id uuid NOT NULL REFERENCES public.dungeon_sessions(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,

  floor integer NOT NULL,
  is_boss boolean NOT NULL DEFAULT false,

  -- Snapshot dos participantes
  player_team jsonb NOT NULL,
  enemy_team jsonb NOT NULL,

  -- Resultado
  outcome text CHECK (outcome IN ('victory','defeat')),
  turns_taken integer,
  bonus_conditions_met jsonb DEFAULT '[]',

  -- Dados para a IA coletiva
  analytics jsonb NOT NULL DEFAULT '{}'
);

CREATE INDEX dungeon_sessions_player ON public.dungeon_sessions(player_id);
CREATE INDEX battle_logs_session ON public.battle_logs(session_id);
CREATE INDEX battle_logs_player ON public.battle_logs(player_id);

ALTER TABLE public.dungeon_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions_own" ON public.dungeon_sessions FOR ALL USING (auth.uid() = player_id);

ALTER TABLE public.battle_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs_own" ON public.battle_logs FOR ALL USING (auth.uid() = player_id);
