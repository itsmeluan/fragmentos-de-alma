-- Migration 009 — Refresh de dados de teste locais para validação do Círculo
-- ATENÇÃO: APENAS PARA DESENVOLVIMENTO LOCAL — não incluir em produção.

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'm.luan.mobile@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Usuário m.luan.mobile@gmail.com não encontrado. Crie a conta primeiro.';
    RETURN;
  END IF;

  INSERT INTO public.players (id, kael_name)
  VALUES (v_user_id, 'Kael')
  ON CONFLICT (id) DO NOTHING;

  UPDATE public.players
  SET
    soul_fragments = 50000,
    essence_crystals = 500,
    echoes = 999,
    kael_level = 10,
    kael_xp = 5000,
    legacy_score = 300,
    unlocked_biomes = ARRAY[
      'kethara', 'abismo', 'celestial', 'genesis', 'forja',
      'axis', 'mnemos', 'verdania', 'cinderfall', 'limiar', 'venula'
    ]
  WHERE id = v_user_id;

  -- Mantém heróis level 1 para validar o estado desabilitado, mas promove
  -- dois heróis ativos para nível máximo para testar Criar Eco.
  WITH ranked AS (
    SELECT id, row_number() OVER (ORDER BY created_at ASC) AS rn
    FROM public.heroes
    WHERE player_id = v_user_id
      AND is_retired = false
  )
  UPDATE public.heroes h
  SET level = 50, xp = 0
  FROM ranked r
  WHERE h.id = r.id
    AND r.rn <= 2;

  RAISE NOTICE 'Refresh de teste aplicado para % (id: %)', 'm.luan.mobile@gmail.com', v_user_id;
END $$;
