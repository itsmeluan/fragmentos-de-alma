-- Migration 006 — Corrige o default de unlocked_biomes
-- O valor antigo ('cavernas_abismo') não correspondia a nenhum BiomeId canônico
-- (ver src/systems/progression/dungeon.ts). O bioma inicial acessível no mapa é
-- um território sempre desbloqueado; usamos 'kethara' (Pedra Viva), o ponto de
-- partida para o qual o onboarding direciona o jogador.
-- Afeta apenas novos registros; linhas existentes mantêm seu valor.

ALTER TABLE public.players
  ALTER COLUMN unlocked_biomes SET DEFAULT '{"kethara"}';
