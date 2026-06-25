-- Migration 011 — corrige a essência dos heróis de teste (migration 010) para
-- valores canônicos. Os dados originais usavam afinidades/origens/núcleos
-- não-canônicos (Gelo, Trovão, Gnésico, Fragmentador, etc.).
-- APENAS PARA DESENVOLVIMENTO.

UPDATE public.heroes h
SET genome = jsonb_set(jsonb_set(jsonb_set(
    genome,
    '{essence,affinity}', to_jsonb(CASE genome->'essence'->>'affinity'
      WHEN 'Gelo' THEN 'Água' WHEN 'Trovão' THEN 'Éter'
      ELSE genome->'essence'->>'affinity' END)),
    '{essence,origin}', to_jsonb(CASE genome->'essence'->>'origin'
      WHEN 'Gnésico' THEN 'Primordial' WHEN 'Forjado' THEN 'Forjada'
      WHEN 'Étreo' THEN 'Errante' WHEN 'Sombrio' THEN 'Abissal'
      WHEN 'Verdante' THEN 'Errante'
      ELSE genome->'essence'->>'origin' END)),
    '{essence,core}', to_jsonb(CASE genome->'essence'->>'core'
      WHEN 'Fragmentador' THEN 'Destruidor' WHEN 'Ancião' THEN 'Invocador'
      WHEN 'Vidente' THEN 'Trickster' WHEN 'Caçador' THEN 'Trickster'
      WHEN 'Sentinela' THEN 'Guardião'
      ELSE genome->'essence'->>'core' END))
WHERE h.fusion_seed LIKE 'test010:%';
