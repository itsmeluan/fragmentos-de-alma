-- Migration 010 — 50 heróis de teste para m.luan.mobile@gmail.com
-- ATENÇÃO: APENAS PARA DESENVOLVIMENTO — não incluir em produção.

DO $$
DECLARE
  v_user_id uuid;
  -- Valores canônicos (ver src/lib/constants.ts: ORIGINS, AFFINITIES, CORES)
  origins    text[] := ARRAY['Abissal','Celestial','Primordial','Forjada','Errante'];
  affinities text[] := ARRAY['Fogo','Água','Terra','Vento','Vazio','Luz','Sombra','Éter'];
  cores      text[] := ARRAY['Guardião','Destruidor','Arauto','Trickster','Invocador'];
  glows      text[] := ARRAY['#E040FB','#00E5FF','#FF6D00','#69F0AE','#FFD600','#F06292','#00BCD4'];
  primaries  text[] := ARRAY['#1A1A2E','#0D1B2A','#1A0A00','#0A1F00','#1A1A00','#1A0A1A','#00121A'];
  secondaries text[] := ARRAY['#6A0572','#1B4F72','#7B2C00','#1B5E20','#4A3F00','#4A0E4E','#003D4A'];
  rarities_50 text[] := ARRAY['comum','incomum','incomum','raro','raro','raro','epico','epico','lendario','comum'];
  hero_names  text[] := ARRAY[
    'Aeryn Valdrek','Sorna Drethiel','Kalos Umbraen','Thiel Vasarion','Nyra Cinderfel',
    'Oren Halvast','Drael Sonivex','Asha Quenthyr','Beron Calindris','Fayla Noctavar',
    'Zael Morthund','Ilya Starven','Kael Umbrioth','Vera Pyrethis','Dalin Soulrest',
    'Eris Coldmarch','Torvak Windael','Siren Duskwhyr','Orin Flamecore','Lysa Voidborn',
    'Caden Thornael','Nyla Ghostrift','Peron Ashfeld','Zora Lightcrest','Braen Dawnvex',
    'Kira Shadowmeld','Vael Ironbryn','Sael Starholm','Dren Emberthorn','Fael Crystalvex',
    'Ryth Voidmarch','Olem Stoneheart','Ithe Shadowcast','Nael Duskborn','Vaen Lightwhyr',
    'Sora Windhaven','Kaer Deepforge','Thyn Starweave','Drex Ashwright','Lyth Voidcrest',
    'Aemon Blackthorn','Selye Glimvael','Oryn Nightcast','Kaela Dawnrift','Vron Ironwhyr',
    'Sael Embermeld','Naer Crystalborn','Thael Starholm','Dryth Voidstone','Faer Shadowvex'
  ];
  trigger_ids   text[] := ARRAY['T01','T02','T03','T04','T07'];
  trigger_labels text[] := ARRAY['Ao receber dano','Ao atacar','Ao usar habilidade','Ao matar um inimigo','No início do combate'];
  effect_ids    text[] := ARRAY['E01','E02','E04','E06','E08','E03'];
  effect_labels text[] := ARRAY['causa dano direto','cura aliado','aplica debuff no inimigo','aplica buff em aliado','drena recurso do inimigo','escuda aliado'];
  effect_powers integer[] := ARRAY[30, 28, 22, 35, 40, 25];

  i             integer;
  v_origin      text;
  v_affinity    text;
  v_core        text;
  v_rarity      text;
  v_level       integer;
  v_name        text;
  v_seed        text;
  v_forca       integer;
  v_ressonancia integer;
  v_resistencia integer;
  v_agilidade   integer;
  v_vontade     integer;
  v_aura        integer;
  v_primary     text;
  v_secondary   text;
  v_glow        text;
  v_genome      jsonb;
  v_skills      jsonb;
  v_visual      jsonb;
  v_trig_idx    integer;
  v_eff_idx     integer;
  v_pal_idx     integer;
  v_rarity_idx  integer;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'm.luan.mobile@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Usuário m.luan.mobile@gmail.com não encontrado.';
    RETURN;
  END IF;

  -- Remove heróis de teste anteriores gerados por esta migration (idempotente)
  DELETE FROM public.heroes
  WHERE player_id = v_user_id
    AND fusion_seed LIKE 'test010:%';

  FOR i IN 1..50 LOOP
    -- Atributos com variação baseada no índice
    v_forca       := 20 + ((i * 7)  % 61);
    v_ressonancia := 20 + ((i * 11) % 61);
    v_resistencia := 20 + ((i * 13) % 61);
    v_agilidade   := 20 + ((i * 17) % 61);
    v_vontade     := 20 + ((i * 19) % 61);
    v_aura        := 20 + ((i * 23) % 61);

    -- Essência (cicla pelos arrays)
    v_origin   := origins   [1 + ((i - 1) % array_length(origins,    1))];
    v_affinity := affinities[1 + ((i - 1) % array_length(affinities, 1))];
    v_core     := cores     [1 + ((i - 1) % array_length(cores,      1))];

    -- Nível e raridade
    IF i <= 10 THEN
      v_level  := 50;
      v_rarity := rarities_50[i];
    ELSE
      v_rarity_idx := ((i - 11) % 7) + 1;
      v_level  := 1;
      v_rarity := CASE v_rarity_idx
        WHEN 1 THEN 'comum'
        WHEN 2 THEN 'comum'
        WHEN 3 THEN 'incomum'
        WHEN 4 THEN 'comum'
        WHEN 5 THEN 'incomum'
        WHEN 6 THEN 'raro'
        ELSE 'comum'
      END;
    END IF;

    v_name := hero_names[i];
    v_seed := format('test010:%s:%s', v_user_id, i);

    -- Paleta (cicla entre 7 opções)
    v_pal_idx   := 1 + ((i - 1) % 7);
    v_primary   := primaries  [v_pal_idx];
    v_secondary := secondaries[v_pal_idx];
    v_glow      := glows      [v_pal_idx];

    -- Skill (cicla entre pools)
    v_trig_idx := 1 + ((i - 1) % array_length(trigger_ids, 1));
    v_eff_idx  := 1 + ((i - 1) % array_length(effect_ids,  1));

    v_genome := jsonb_build_object(
      'essence', jsonb_build_object('origin', v_origin, 'affinity', v_affinity, 'core', v_core),
      'attributes', jsonb_build_object(
        'forca', v_forca, 'ressonancia', v_ressonancia, 'resistencia', v_resistencia,
        'agilidade', v_agilidade, 'vontade', v_vontade, 'aura', v_aura
      ),
      'mutations', '[]'::jsonb
    );

    v_skills := jsonb_build_object(
      'active', jsonb_build_array(
        jsonb_build_object(
          'id', 'active_0',
          'name', v_core || ' ' || v_affinity,
          'trigger', jsonb_build_object('id', trigger_ids[v_trig_idx], 'label', trigger_labels[v_trig_idx]),
          'effect',  jsonb_build_object('id', effect_ids[v_eff_idx],   'label', effect_labels[v_eff_idx],   'power', effect_powers[v_eff_idx]),
          'condition', jsonb_build_object('id', 'C01', 'label', 'sempre'),
          'isPassive', false, 'isUnique', false, 'isEmergent', false,
          'sourceGenes', '[]'::jsonb
        )
      ),
      'passive',  '[]'::jsonb,
      'unique',   '[]'::jsonb,
      'emergent', '[]'::jsonb
    );

    v_visual := jsonb_build_object(
      'seed', v_seed,
      'palette', jsonb_build_object(
        'primary', v_primary, 'secondary', v_secondary, 'glow', v_glow, 'resonanceLevel', 'standard'
      ),
      'silhouette', jsonb_build_object('coreShape', v_core, 'weight', 'standard'),
      'background', jsonb_build_object('origin', v_origin),
      'pattern',    jsonb_build_object('origin', v_origin, 'density', 'medium'),
      'ornament',   jsonb_build_object('coreBase', v_core, 'mutationOrnaments', '[]'::jsonb),
      'aura',       jsonb_build_object('affinity', v_affinity, 'level', 'particles'),
      'uniqueVariations', jsonb_build_object(
        'animationSpeed', 1.0,
        'colorHueShifts', '[0,0,0,0,0,0]'::jsonb,
        'ornamentOffsets', '[0,0,0,0,0,0,0,0]'::jsonb
      )
    );

    INSERT INTO public.heroes (
      player_id, name, fusion_seed, genome, rarity, visual_params, skills,
      level, xp, bond, current_hp, ultimate_charge, generation, is_retired, echoes_generated
    ) VALUES (
      v_user_id, v_name, v_seed, v_genome, v_rarity, v_visual, v_skills,
      v_level, 0, 0, 100, 0, 1, false, 0
    );
  END LOOP;

  RAISE NOTICE '50 heróis inseridos para % (id: %)', 'm.luan.mobile@gmail.com', v_user_id;
END $$;
