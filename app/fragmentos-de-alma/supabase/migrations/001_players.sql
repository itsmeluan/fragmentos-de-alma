-- Migration 001 — Usuários e Jogador
-- Extensão do perfil de usuário do Supabase Auth

CREATE TABLE public.players (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Identidade do jogador
  kael_name text NOT NULL DEFAULT 'Kael',
  kael_level integer NOT NULL DEFAULT 1,
  kael_xp integer NOT NULL DEFAULT 0,

  -- Recursos
  soul_fragments integer NOT NULL DEFAULT 500,   -- Fragmentos de Alma (moeda principal)
  essence_crystals integer NOT NULL DEFAULT 5,   -- Cristais de Essência (premium/raro)
  echoes integer NOT NULL DEFAULT 0,             -- Ecos (legado)

  -- Passivas de Kael desbloqueadas (array de IDs de nível)
  unlocked_memories integer[] NOT NULL DEFAULT '{}',

  -- Reputação com facções (-100 a 100)
  faction_reputation jsonb NOT NULL DEFAULT '{
    "ordem_pedra_viva": 0,
    "veu_dos_ecos": 0,
    "chama_negra": 0,
    "jardim_perpetuo": 0,
    "confraria_limiar": 0,
    "arquitetos_veu": 0,
    "ordem_carmesim": 0
  }',

  -- Progresso de biomas desbloqueados
  unlocked_biomes text[] NOT NULL DEFAULT '{"cavernas_abismo"}',

  -- Estatísticas gerais
  total_fusions integer NOT NULL DEFAULT 0,
  total_battles integer NOT NULL DEFAULT 0,
  total_wins integer NOT NULL DEFAULT 0,
  heroes_retired integer NOT NULL DEFAULT 0,

  -- Anti-frustração: rastreia "azar acumulado"
  bad_luck_counter integer NOT NULL DEFAULT 0,

  -- Histórico de recompensas recentes (últimas 5)
  recent_rewards jsonb NOT NULL DEFAULT '[]'
);

-- RLS: jogador só vê seus próprios dados
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "players_own_data" ON public.players
  FOR ALL USING (auth.uid() = id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
