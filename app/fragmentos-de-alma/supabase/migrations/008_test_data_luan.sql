-- Migration 008 — Dados de teste locais para m.luan.mobile@gmail.com
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
    legacy_score = 300
  WHERE id = v_user_id;

  UPDATE public.players
  SET unlocked_biomes = ARRAY[
    'kethara', 'abismo', 'celestial', 'genesis', 'forja',
    'axis', 'mnemos', 'verdania', 'cinderfall', 'limiar', 'venula'
  ]
  WHERE id = v_user_id;

  RAISE NOTICE 'Recursos creditados para % (id: %)', 'm.luan.mobile@gmail.com', v_user_id;
END $$;
