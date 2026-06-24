# PROGRESSO — Fragmentos de Alma
*Atualizado em: 2026-06-24*
*Lido por: Claude Code em sessões futuras*

---

## Estado Atual

### Círculo de Transmutação (2026-06-24)
Implementados os 8 passos do prompt de transmutação (ver D39–D44 em `docs/09_roadmap_mvp.md`): migration `007_transmutation.sql` com tabela `ecos` e roster/legacy em `players`; migration `008_test_data_luan.sql` para recursos de desenvolvimento; tipos e funções puras em `src/systems/genes/eco.ts`; `gameStore` expandido com Ecos, roster, criação/absorção, extração de Cristais e transmutação; nova tela `app/(game)/transmutation.tsx` com abas **Criar Eco**, **Extrair** e **Transmutar**; tab antiga `fusion` escondida/redirecionada para **Círculo**; `RosterManager` integrado à Coleção; `docs/00_documento_mestre.md` atualizado com o doc 13.

Validação executada: `npx tsc --noEmit` limpo; `npm test -- --runInBand` com **15 suites / 318 testes passando**.

Pontos de atenção: aplicar migrations via `supabase db push`; a migration 008 é apenas para ambiente local/desenvolvimento; `fuseGenomes` ainda recebe `seed`, mas usa `Math.random()` internamente (limitação herdada do motor atual).

### Ajustes pós-teste rápido da Transmutação (2026-06-24)
Corrigidos os pontos do teste rápido (ver D45–D48 em `docs/09_roadmap_mvp.md`): migrations 006–009 aplicadas no Supabase remoto linkado; `m.luan.mobile@gmail.com` recebeu 50.000 Fragmentos, 500 Cristais, todos os biomas e dois heróis ativos em nível 50 para validação. Criar Eco agora exige herói lvl 50, mostra heróis low-level desabilitados e explica a regra na UI. Transmutação agora usa **Eco A + Eco B** como fontes principais, consome Fragmentos + Cristais e opcionalmente consome até 3 Ecos catalisadores. Almas ganhou abas internas **Heróis/Ecos**, Ecos têm sheet de detalhe, heróis em time/banco têm badge/frame, e sheets longas usam `Modal fill` para caber na tela.

Validação executada após ajustes: `npx tsc --noEmit` limpo; `npm test -- --runInBand` com **15 suites / 320 testes passando**.

### Correção da jornada inicial (2026-06-24)
Testado o fluxo completo no Simulador iOS. O novo jogador estava em soft-lock: 0 heróis, sem forma de criar o primeiro (Fusão exige 2, dungeon exige 6), e o registro `players` nem era criado no signup (recursos 0/0/0). Corrigido (ver D31–D34 em `docs/09_roadmap_mvp.md`): `initialize` cria o `players` se faltar; jogador novo recebe **6 fragmentos iniciais**; dungeon/torre ganharam Stack próprio e a tab bar some na batalha (não dá mais pra sair sem querer); hint inicial aponta para Kethara. **Verificado ponta a ponta**: login → mapa (500/5/0) → coleção (6 heróis) → Kethara → batalha jogável (turnos, roda de ações, skills, alvo) → Fusão cria herói de Geração 2.
As 3 pendências menores foram resolvidas (ver D35–D38 em `docs/09_roadmap_mvp.md`):
1. **Economia da fusão**: agora cobra Fragmentos por tier (100/300/800/2000/5000 pela maior raridade), sem Cristais; consome ambos os pais e **cristaliza** o gene mais forte de cada um (tabela `fragments`, `fusion_byproduct`); um **fragmento dropa ao limpar cada andar** de dungeon, fechando o loop. Verificado no simulador: custo 500→400, coleção 10→9, filho Gen-2.
2. **Log de batalha** mostra o nome da habilidade (não mais "active_0").
3. **IDs de bioma unificados** (canônicos de `dungeon.ts`); profile exibe rótulo legível; migration 006 corrige o default `unlocked_biomes` → `kethara` (**aplicar via `supabase db push`**).

Follow-ups (não bloqueiam): UI de injeção de gene usando fragmentos cristalizados; persistência das recompensas de batalha (soul_fragments) no banco — hoje a tela de recompensas é só visual.

### Correção de boot (2026-06-24)
O app abria e ficava preso numa tela escura com "Fragmentos de Alma" — diagnosticado no **Simulador iOS** (não no dispositivo, que exige desbloqueio a cada launch). Causa raiz: `package.json` `main` apontava para `index.ts`/`App.tsx` (template do `create-expo-app`) em vez de `expo-router/entry`, então o expo-router nunca era carregado e nenhuma rota da pasta `app/` rodava. Corrigido (ver D27–D30 em `docs/09_roadmap_mvp.md`): `main` → `expo-router/entry`, `App.tsx`/`index.ts` removidos, `expo-splash-screen` adicionado como dependência, `app/(auth)/_layout.tsx` criado. **Verificado**: login e registro renderizam e navegam corretamente no simulador.

### Passos concluídos

**Passo 0 — Leitura dos docs de design**
Todos os 13 documentos da pasta `docs/` foram lidos antes de qualquer implementação. A ordem de leitura recomendada está em `docs/00_documento_mestre.md`.

**Passo 1 — Inicializar projeto Expo**
Executado dentro de `/Volumes/SSDLuan/Projetos/Fragmentos_de_Alma/app/`:
```bash
npx create-expo-app fragmentos-de-alma --template blank-typescript
```
Projeto criado com Expo SDK 56 (o doc 09 mencionava SDK 51+; a versão corrente instalada foi a 56, sem impacto funcional).

**Passo 2 — Instalar dependências e criar estrutura**
Dependências instaladas (todas com versões compatíveis com SDK 56):

| Pacote | Versão instalada |
|---|---|
| expo-router | ~56.2.11 |
| react-native-safe-area-context | ~5.7.0 |
| react-native-screens | 4.25.2 |
| react-native-reanimated | 4.3.1 |
| react-native-gesture-handler | ~2.31.1 |
| @shopify/react-native-skia | 2.6.2 |
| @supabase/supabase-js | ^2.108.2 |
| @react-native-async-storage/async-storage | 2.2.0 |
| zustand | ^5.0.14 |
| @tanstack/react-query | ^5.101.1 |

> **Observação:** `react-native-reanimated` e `react-native-gesture-handler` foram instalados com `--legacy-peer-deps`. O conflito era transitivo: `expo-router` puxa `@radix-ui` que puxa `react-dom@19.2.7`, mas `react@19.2.3` estava instalado (patch version mismatch). Isso não afeta React Native — apenas dependências de web que não são usadas no app mobile.

Estrutura de pastas criada conforme `docs/09_roadmap_mvp.md` (seção "Estrutura de Pastas"), com todos os arquivos placeholder vazios. Ver seção abaixo.

`src/lib/theme.ts` preenchido com conteúdo **exato** da seção "Tema Global" do `docs/10_direcao_de_arte.md`.

`src/lib/constants.ts` preenchido com conteúdo **exato** da seção "Configurar Constantes do Jogo" do `docs/09_roadmap_mvp.md`.

---

## Localização do Projeto

```
/Volumes/SSDLuan/Projetos/Fragmentos_de_Alma/
├── app/
│   └── fragmentos-de-alma/    ← projeto Expo (trabalhar aqui)
└── docs/                      ← documentos de design (não modificar)
```

O projeto Expo fica em **`app/fragmentos-de-alma/`** — é aqui que todos os comandos `npx expo`, `npm install`, etc. devem ser executados.

---

## Estrutura de Pastas Criada

```
fragmentos-de-alma/
├── app/                          # Telas (Expo Router)
│   ├── (auth)/
│   │   ├── login.tsx             # placeholder
│   │   └── register.tsx          # placeholder
│   ├── (game)/
│   │   ├── _layout.tsx           # placeholder
│   │   ├── index.tsx             # placeholder
│   │   ├── collection.tsx        # placeholder
│   │   ├── fusion.tsx            # placeholder
│   │   ├── dungeon/
│   │   │   ├── [biomeId].tsx     # placeholder
│   │   │   └── battle.tsx        # placeholder
│   │   └── profile.tsx           # placeholder
│   └── _layout.tsx               # placeholder
├── src/
│   ├── systems/
│   │   ├── genes/                # types.ts, generator.ts, fusion.ts, rarity.ts
│   │   ├── skills/               # types.ts, generator.ts, resolver.ts
│   │   ├── visual/               # types.ts, generator.ts
│   │   ├── battle/               # types.ts, engine.ts, ai.ts, rewards.ts
│   │   ├── progression/          # types.ts, kael.ts, legacy.ts
│   │   └── world/                # types.ts, rules.ts
│   ├── components/
│   │   ├── hero/                 # HeroCard.tsx, HeroVisual.tsx, HeroDetail.tsx
│   │   ├── battle/               # BattleField.tsx, ActionWheel.tsx, HeroSlot.tsx, EnemySlot.tsx
│   │   ├── fusion/               # FusionTable.tsx, FusionPreview.tsx
│   │   └── ui/                   # Button.tsx, Modal.tsx, ProgressBar.tsx
│   ├── store/                    # gameStore.ts, battleStore.ts, uiStore.ts
│   ├── hooks/                    # useHero.ts, useFusion.ts, useBattle.ts, useProgression.ts
│   ├── lib/
│   │   ├── supabase.ts           # placeholder (preencher no Passo 3)
│   │   ├── constants.ts          # ✅ preenchido (doc 09)
│   │   └── theme.ts              # ✅ preenchido (doc 10)
│   └── utils/                    # random.ts, math.ts, nameGenerator.ts
├── supabase/
│   ├── migrations/               # vazio (preencher no Passo 3)
│   └── functions/                # vazio
└── assets/
    ├── fonts/                    # vazio (fontes a adicionar no Passo visual)
    └── sounds/                   # vazio
```

Todos os arquivos `placeholder` estão vazios — prontos para implementação nas fases correspondentes.

---

## Infraestrutura de Testes (configurada no Passo 5)

Stack de testes documentada (Jest) foi configurada:
- `jest-expo` (~56.0.5) + `jest` (29) + `@types/jest` + `@react-native/jest-preset`
  (peer extraído para pacote próprio nas versões novas do RN) + `babel-preset-expo`
- `babel.config.js` — preset `babel-preset-expo`
- `jest.config.js` — preset `jest-expo`, `moduleNameMapper` para o alias `@/`
- `tsconfig.json` — adicionado `paths: { "@/*": ["./src/*"] }` (alias `@` = `src`,
  conforme os imports do doc 09)
- Testes usam `import { describe, it, expect } from '@jest/globals'` (evita mexer
  na config global de `types` do tsconfig e não afeta os tipos do app)
- Rodar com `npm test` (na pasta `app/fragmentos-de-alma/`)

`src/utils/random.ts` foi criado com `randomFrom` e `randomInt` (funções puras),
para não duplicar esses helpers entre `generator.ts` (Passo 5) e `fusion.ts`
(Passo 6) — a referência do doc 09 os in-lina em ambos.

---

**Passo 7 — Calculador de raridade** ✅ concluído em 2026-06-23

`src/systems/genes/rarity.ts` implementado:
- `calculateRarity(genome, isUnique?)` — cobre todos os 6 tiers (ver D14 no doc 09)
- `getRarityColor(rarity)` — lê de `theme.colors.rarity`
- 20 testes unitários passando; `tsc` limpo; sem regressão nas 4 suites (44 testes)

> **D14:** `calculateRarity` aceita `isUnique = false` opcional — 'único' requer
> contexto de evento externo, não derivável só do genoma. Soma máxima base = 600;
> faixa lendário (>750) fica para bônus futuros; TRANSCENDENCIA é o caminho atual.
> Ver `docs/09_roadmap_mvp.md` § Decisões de Implementação (D14).

> **Nota técnica (Passo 4):** os tipos `VisualParams` e `HeroSkills` em
> `genes/types.ts` ainda são stubs `unknown`. Substituir pelos imports reais
> de `../visual/types` (Passo 8) e `../skills/types` (Passo 10).

---

**Passo 8 — Gerador visual procedural** ✅ concluído em 2026-06-23

Arquivos criados/modificados:
- `src/systems/visual/types.ts` — `VisualParams` e 6 sub-interfaces (uma por camada)
- `src/systems/visual/generator.ts` — `generateVisualParams(genome, seed): VisualParams`
- `src/systems/genes/types.ts` — stub `VisualParams = unknown` substituído por `import/re-export` real
- `src/utils/random.ts` — `makeSeededRng` adicionado (D15)
- 38 novos testes (generator.test.ts + 3 novos em random.test.ts) → 82 total; `tsc` limpo

> **D15/D16:** `makeSeededRng` em `utils/random.ts` (reutilizável pelo nameGenerator no Passo 9).
> Paleta híbrida tem prioridade sobre a base; híbrido desconhecido cai para cor da afinidade base.
> Ver `docs/09_roadmap_mvp.md` § Decisões de Implementação (D15–D16).

---

**Passo 9 — Gerador de nomes** ✅ concluído em 2026-06-23

`src/utils/nameGenerator.ts` implementado:
- `generateName(genome, seed, ancestorName?)` → `"{Prefixo} {RaizSufixo}[, Epíteto]"`
- Tabelas: 8 prefixos por Origem × 6 raízes por Núcleo × 6 sufixos por Afinidade
- Epítetos: TRANSCENDENCIA > CAOS > ANCESTRAL (prioridade); INVERSO/ESPELHO silenciosos
- 16 testes; 98 totais (6 suites); `tsc` limpo

> **D17:** Epíteto de ANCESTRAL usa genéricos determinísticos (`ancestorName` opcional).
> O nome do ancestral exige linhagem do banco — pertence ao orquestrador. Ver D17 em doc 09.

---

**Passo 10 — Sistema de habilidades** ✅ concluído em 2026-06-23

Arquivos criados/modificados:
- `src/systems/skills/types.ts` — `HeroSkills`, `Skill`, 4 sub-interfaces (Trigger/Effect/Modifier/Condition)
- `src/systems/skills/generator.ts` — `generateSkills(genome, rarity, seed): HeroSkills`; contagem por raridade; pools ponderados por gene; 7 condições emergentes; nomes procedurais
- `src/systems/genes/types.ts` — stub `HeroSkills = unknown` substituído por import/re-export real (D18)
- 24 testes (generator.test.ts) → 122 total (7 suites); `tsc` limpo

> **D19:** Modificador M06 usa placeholder de afinidade até `resolver.ts` (Passo 12).
> Ver `docs/09_roadmap_mvp.md` § Decisões de Implementação (D18–D19).

---

**Passo 11 — Telas: Login → Registro → Coleção → Detalhe → Fusão → Revelação** ✅ concluído em 2026-06-23

Arquivos criados/modificados:

**Fontes:**
- `@expo-google-fonts/cinzel`, `@expo-google-fonts/rajdhani`, `@expo-google-fonts/libre-baskerville` instalados
- `src/lib/theme.ts` — nomes de fontes atualizados para o padrão expo-google-fonts
  (ex: `'Cinzel-Bold'` → `'Cinzel_700Bold'`) (D20)

**Stores:**
- `src/store/gameStore.ts` — player, heroes[], initialize(), loadHeroes(), addHero(); integração Supabase real
- `src/store/uiStore.ts` — selectedHero, fusionSlotA/B, revelationHero; ações de seleção/limpeza

**Componentes UI:**
- `src/components/ui/Button.tsx` — variantes primary/secondary/danger; loading state; toque ≥48dp
- `src/components/ui/Modal.tsx` — bottom sheet com accent line dourada
- `src/components/ui/ProgressBar.tsx` — tipos hp/xp/ultimate

**Componentes Hero:**
- `src/components/hero/HeroVisual.tsx` — placeholder geométrico usando `visualParams.palette`; tamanhos card/detail/slot; borda da raridade
- `src/components/hero/HeroCard.tsx` — card de grade 2 colunas com visual, nome, raridade, afinidade, nível
- `src/components/hero/HeroDetail.tsx` — ScrollView completo: visual, atributos com ProgressBar, todas as habilidades (badges passiva/única/emergente)

**Telas:**
- `app/_layout.tsx` — carrega fontes (useFonts), redirect auth via `supabase.auth.onAuthStateChange`; usa `SplashScreen` do expo-router (D21)
- `app/(auth)/login.tsx` — formulário com logo "FRAGMENTOS / de Alma"; inputs estilizados Alquimia Noire
- `app/(auth)/register.tsx` — formulário com validação de senha; navega para login após criar conta
- `app/(game)/_layout.tsx` — Tabs com 4 abas (Mapa/Almas/Fundir/Kael); indicador dourado ativo
- `app/(game)/index.tsx` — Hub: barra de recursos, banner Solum, card de bioma ativo, estatísticas
- `app/(game)/collection.tsx` — Grid 2 colunas com filtros por raridade; modal de HeroDetail ao tocar
- `app/(game)/fusion.tsx` — 2 slots + círculo alquímico animado (Animated.loop 30s); SelectorModal para escolher heróis; cria herói real no Supabase; RevelationModal ao concluir
- `app/(game)/profile.tsx` — avatar Kael, recursos, histórico, biomas, botão Sair com `supabase.auth.signOut`

**Correções de TypeScript:**
- `fuseGenomes` recebe `FusionInput` (objeto único) → corrigido em fusion.tsx (D22)
- `StyleSheet.absoluteFillObject` → `StyleSheet.absoluteFill` (D23)
- `StatusBar.backgroundColor` não existe em expo-status-bar → removido (D21)

> **D20:** `expo-google-fonts` carrega fontes no bundle JS (sem arquivos .ttf em assets/fonts/).
> Nomes de família ficam como `Cinzel_700Bold` etc. em vez de `Cinzel-Bold`.
> Ver `docs/09_roadmap_mvp.md` § Decisões de Implementação (D20).

> **D21:** `expo-splash-screen` não é uma dependência direta do projeto. `SplashScreen`
> foi importado do `expo-router` (disponível nessa versão do SDK 56). `StatusBar`
> do `expo-status-bar` não aceita `backgroundColor` como prop — removido.

> **D22:** `fuseGenomes(input: FusionInput)` — a função recebe um objeto único, não 3
> argumentos separados. O resultado é `FusionResult { genome, inheritanceLog }` — usar `.genome`.

> **D23:** `StyleSheet.absoluteFillObject` não existe nos tipos do RN aqui — correto é
> `StyleSheet.absoluteFill` (um ViewStyle direto, sem spread necessário).

---

**Pacote Visual — Assets, Skia e ornamentos UI** ✅ concluído em 2026-06-23

Solicitação avulsa de polimento visual executada sem avançar o checklist principal para o Passo 12.

- Bloco 1 — Ícones SVG da tab bar criados (`assets/icons/tab-*.svg`) e `src/components/ui/TabIcon.tsx` integrado em `app/(game)/_layout.tsx`.
- Bloco 2 — `src/components/hero/HeroVisualSkia.tsx` criado com renderer Skia em 6 camadas; `HeroVisual.tsx` virou re-export compatível.
- Bloco 3 — `src/components/fusion/AlchemicalCircle.tsx` criado com Skia + Reanimated; componente inline antigo removido de `app/(game)/fusion.tsx`.
- Bloco 4 — `src/components/ui/Ornaments.tsx` criado; `RarityFrame` aplicado em `HeroCard.tsx`; `CornerBracket` aplicado aos modais principais.
- Bloco 5 — 7 emblemas SVG de facção criados em `assets/icons/faction-*.svg`; `src/components/world/FactionEmblem.tsx` criado.
- Bloco 6 — `assets/icon.svg`, `assets/splash.svg`, `assets/icon.png` e `assets/splash.png` criados; `app.json` atualizado para tema escuro e splash novo.
- Bloco 7 — `src/components/world/BiomeBackground.tsx` criado com backgrounds Skia para `genesis`, `abismo` e `celestial`.
- Bloco 8 — Integração final feita em tabs, hub, fusão e cards; `react-native-svg` instalado para SVGs inline.

Validação:
- `npx tsc --noEmit` ✅
- `npm test -- --runInBand` ✅ 122 testes passando
- `rg "#FFFFFF|#fff|white"` ✅ nenhum uso visual de branco puro restante

> **D24:** `react-native-svg` instalado com `--legacy-peer-deps` para renderizar ícones, ornamentos e emblemas SVG via `SvgXml`/componentes SVG.
> **D25:** Ícone e splash foram autorados em SVG e convertidos para PNG via `npx sharp-cli ... resize ...`; `app.json` referencia PNGs por compatibilidade com Expo.
> **D26:** Glows brancos puros do gerador visual foram trocados por equivalentes do briefing (`#B0BEC5`, `#FFF176`, `#E8E0D0`) para cumprir a regra "nunca usar branco puro".

---

**Passo 12 — Motor de Batalha** ✅ concluído em 2026-06-24

Arquivos criados:
- `src/systems/battle/types.ts` — todos os tipos: CombatSlot, Combatant, EnemySpec, BattleAction, BattleEvent, BattleState; helpers isActiveSlot/isBenchSlot/isEnemySlot
- `src/systems/skills/resolver.ts` — resolução pura de habilidades: checkCondition (C01–C10), resolveTargets (M01 área, M09 ricochete), scalePower (M02, M04), critMultiplier (M03), resolveEffect (E01–E10), positionMultiplier (frente/centro/fundo)
- `src/systems/battle/engine.ts` — máquina de estados pura: createBattle, computeTurnOrder (agilidade ↓), applyAction (skill/ultimate/defend/swap), startTurn (DoT, status ticks), endTurn (cooldowns, carga passiva do banco), checkPhase (vitória/derrota); RNG determinístico por step sem closure
- `src/systems/battle/engine.test.ts` — 24 testes cobrindo: HP max, createBattle (slots corretos, erros de aridade), ordem de turnos, skill action (dano, cooldown, determinismo), defend (isDefending), swap (slots trocados, turnOrder recalculado), vitória/derrota, startTurn/endTurn

> **D24:** Fórmula de dano: `power × (ataqueStat/50) × (50/defStat) × posMultiplier × defendMultiplier`.
> Sem suporte a doc 06 para fórmula exata — estimativa equilibrada derivada das faixas de atributo (1–100).
> Revisar quando o balanceamento de dungeons (Passo 16) for validado.

> **D25:** `resolver.ts` usa RNG funcional injetado por closure do engine (`stepRngFn`) — o seed avança
> no `BattleState.rngSeed` via `stepRng(seed)` puro (sem closure global). Mantém pureza das funções do engine.

146 testes passando (122 + 24 novos); `tsc --noEmit` limpo.

---

**Passo 13 — IA de Inimigos** ✅ concluído em 2026-06-24

Arquivos criados/modificados:
- `src/systems/battle/types.ts` — adicionado `aiPattern?` ao `Combatant` (preservado de EnemySpec via createBattle)
- `src/systems/battle/engine.ts` — `enemyCombatant()` agora copia `aiPattern` do EnemySpec
- `src/systems/battle/ai.ts` — 4 padrões de IA implementados como funções puras:
  - `aggressive` (Destruidor): ataca herói com menor HP
  - `defensive` (Guardião): ataca a Frente; suporta aliado em perigo (<40% HP)
  - `support` (Invocador): buffa aliados, aplica debuffs, ataca só como último recurso
  - `random` (Trickster): aleatório; vira `aggressive` ao ≤50% HP
  - `chooseEnemyAction(state, enemyId, rng)` — entrada pública sem estado mutable
- `src/systems/battle/ai.test.ts` — 13 testes

159 testes passando; `tsc --noEmit` limpo.

---

**Passo 14 — Sistema de Recompensas** ✅ concluído em 2026-06-24

Arquivos criados:
- `src/systems/battle/rewards.ts` — geração pura de recompensas pós-batalha:
  - Tipos: `BattleType`, `RewardType`, `BonusConditionId`, `Reward`, `BattleConditions`, `RewardContext`, `RewardResult`
  - Recompensas base por `BattleType` (common → elite → mini_boss → biome_boss → event_boss)
  - 5 condições bônus (doc 07): `no_heroes_lost` (+50% frags), `no_ultimates` (+1 Cristal), `under_5_turns` (gene fragment), `same_origin_team` (eco bônus), `boss_first_try` (cosmético exclusivo)
  - Multiplicador de sequência de vitórias: 1× → 1.2× → 1.5× → 2× (máximo)
  - Anti-repetição de cosméticos (últimas 5 recompensas filtradas)
  - Sistema de pity: 10 batalhas sem raro → próxima garante fragmentos raros
  - `generateRewards(conditions, ctx, rng)` → `RewardResult` (puro, sem estado)
- `src/systems/battle/rewards.test.ts` — 25 testes

184 testes passando; `tsc --noEmit` limpo.

---

**Passo 15 — Tela de Batalha** ✅ concluído em 2026-06-24

Arquivos criados:
- `src/store/battleStore.ts` — Zustand store: `BattleState` + fase de UI (`player_selecting` / `action_wheel` / `targeting_enemy` / `targeting_ally` / `swapping` / `enemy_turn`); `processAction()` interno encadeia `applyAction + endTurn + startTurn` para o próximo ator; clearBattle para limpar ao sair
- `app/(game)/dungeon/battle.tsx` — Tela completa de batalha:
  - `EnemySlotView` — HP bar + cor por afinidade + destaque em modo de mira
  - `HeroSlotView` — HP bar + Ultimate bar + badge ULT + borda por raridade + indicador de turno atual
  - `BenchSlotView` — slot menor com HP bar; destaque em modo de troca
  - `ActionWheel` — painel de ações: 3 habilidades ativas + Defender + Trocar
  - `BattleLog` — últimas 12 entradas do log com auto-scroll
  - `useEffect` para auto-processar turnos de inimigo (delay 600ms) e detectar vitória/derrota
  - Toque em herói → roda de ações; toque longo quando Ultimate cheio → dispara Ultimate; após ação humana → aguarda turno de inimigo automaticamente
- `app/(game)/dungeon/[biomeId].tsx` — Tela de entrada por bioma:
  - Corrupção de bioma aplicada ao gerar inimigos (doc 07): abismo = resistência ↑ / agilidade ↓; celestial = ressonância ↑ / resistência ↓; genesis = aura ↑
  - Escala de poder por andar; padrões de IA pré-definidos por bioma
  - Exibe condições bônus antes de entrar; bloqueia entrada com <6 heróis

> **D26:** `absoluteFillObject` → `absoluteFill` em battle.tsx (mesmo fix do D23). Adicionado ao registro de decisões.

184 testes passando; `tsc --noEmit` limpo.

---

**Passo 16 — Dungeons e Andares** ✅ concluído em 2026-06-24

Arquivos criados/modificados:
- `src/systems/progression/dungeon.ts` — lógica pura de dungeons:
  - `BIOMES` — configuração completa dos 6 biomas (label, andares, padrões de IA, corrupção de atributos, condição de desbloqueio)
  - `DungeonSession` — estado de sessão: bioma, andar atual, batalha no andar, HP snapshot por herói, tentativas diárias, flag de loot completo
  - `createDungeonSession`, `advanceAfterVictory`, `isBiomeComplete`, `calcHpRecovery` (+30% HP)
  - `generateFloorEnemies` — gera inimigos com corrupção de bioma + escala por andar
  - `isBiomeUnlocked` — verifica condição de desbloqueio (fusões, raridade, Ecos)
  - 3 batalhas por andar, 3 tentativas diárias com loot completo
- `src/store/dungeonStore.ts` — Zustand para sessão de dungeon: `startDungeon`, `recordVictory` (persiste HP pós-batalha), `recordDefeat`, `applyHpRecovery`, `nextEnemies`, `exitDungeon`; seletor `useDungeonProgress`
- `app/(game)/dungeon/between.tsx` — tela entre batalhas: mostra HP recuperado (+30%), progresso do bioma, próxima batalha, botão Continuar ou Sair; aviso quando loot completo esgotado
- `app/(game)/dungeon/[biomeId].tsx` — refatorado para usar `dungeonStore`; exibe corrupção de bioma, padrões de IA, condição de desbloqueio, verifica heróis disponíveis
- `app/(game)/dungeon/battle.tsx` — vitória agora registra HPs no `dungeonStore` e rota para `between`; derrota registra tentativa e volta ao hub

184 testes passando; `tsc --noEmit` limpo.

---

**Passo 17 — Kael (Progressão do Jogador)** ✅ concluído em 2026-06-24

Arquivos criados:
- `src/systems/progression/kael.ts` — sistema completo de progressão do Fragmentador:
  - `FactionId` + `FACTIONS` + `FACTION_LABELS` — 7 facções de Solum
  - `RisingMemory` + `RISING_MEMORIES` — 10 passivas desbloqueáveis a cada 10 níveis (com lore do doc 08)
  - `KaelState` — estado do jogador: nível, XP, memórias, reputação por facção, contadores
  - `xpRequiredForLevel(n)` — curva logarítmica (100 × n^1.5)
  - `addXp(kael, source, multiplier?)` — processa level-up(s) em cascata; desbloqueia memória no nível exato
  - `recordFusion`, `recordBattleWon`, `recordEmergentDiscovery` — atalhos que incrementam contadores + dão XP
  - `applyFactionDecision(kael, changes)` — aplica delta por facção (clamp -100..+100) + XP de decisão
  - `reputationTier`, `reputationTierLabel` — tiers: ally/friendly/neutral/hostile/enemy
  - `getBattlePassives(kael)` — retorna objeto com todos os bônus passivos ativos para o engine
- `src/systems/progression/kael.test.ts` — 37 testes cobrindo todos os casos

221 testes passando; `tsc --noEmit` limpo.

---

**Passo 18 — Chefes com 3 Fases** ✅ concluído em 2026-06-24

Arquivos criados/modificados:
- `src/systems/battle/types.ts` — novos tipos adicionados:
  - `BossUniqueAbilityType` — 5 habilidades únicas (devastacao, corrupcao, invocacao_massiva, roubo_de_alma, colapso)
  - `BossSpec extends EnemySpec` — isBoss, weakness, uniqueAbilityType, loreLines
  - `Combatant` — campos opcionais de chefe: isBoss, bossPhase (1|2|3), uniqueAbilityCharging, uniqueAbilityType, bossAttackCount
  - `ActionType` — novos tipos 'boss_charge' e 'boss_unique'
  - `EventType` — novos tipos 'boss_phase_change', 'boss_unique_charging', 'boss_unique_fire'
- `src/systems/battle/boss.ts` — sistema completo de chefes:
  - `PHASE2_TRIGGER = 0.60`, `PHASE3_TRIGGER = 0.30` — limites de fase (compatíveis com parâmetros da IA Coletiva)
  - `BOSS_ABILITY_INFO` — nomes e textos de aviso por tipo de habilidade
  - `generateBoss(biome, floor, seed)` — gera BossSpec com atributos escalados pelo andar, corrupção de bioma, 4 skills ativas (2→3→4 por fase), weakness (oposta à afinidade), lore procedural
  - `getBossPhase(hpRatio)` — retorna 1|2|3 baseado em % de HP
  - `detectPhaseTransition(prevHp, currHp, maxHp)` — detecta cruzamento dos limiares
  - `processBossPhaseTransition(state, bossId)` — atualiza bossPhase e emite evento
  - `chooseBossAction(state, bossId, rng)` — AI fase-consciente: fase 1 usa 2 skills/alvo semi-aleatório; fase 2 usa 3 skills/herói mais fraco; fase 3 cicla entre skills e habilidade única (a cada 3 ataques: boss_charge → boss_unique)
  - `applyBossSpecialAction(state, action, rng)` — processa boss_charge (warning) e boss_unique (5 efeitos):
    - Devastação: dano massivo (3.5× força) no herói da Frente, ignora 50% da defesa
    - Corrupção: inverte todos os buffs↔debuffs dos heróis ativos por 2 turnos
    - Invocação Massiva: spawna 2 combatentes inimigos em slots livres
    - Roubo de Alma: analisa log para encontrar skill mais usada pelo jogador, usa contra o herói mais fraco
    - Colapso: reduz HP de todos os heróis ativos para 1 (não mata)
  - `initBossCombatant(state, bossSpec)` — inicializa campos de chefe em Combatant após createBattle
- `src/systems/battle/boss.test.ts` — 30 testes cobrindo geração, fases, transições e todas as 5 habilidades únicas

251 testes passando; `tsc --noEmit` limpo.

---

**Passo 19 — Sistema de Legado** ✅ concluído em 2026-06-24

Arquivos criados:
- `src/systems/progression/legacy.ts` — sistema completo de progressão de longo prazo:
  - `LEGACY_TIERS` — 5 tiers permanentes desbloqueados por Ecos acumulados:
    - T1 (10 Ecos): +5% drop de fragmentos raros
    - T2 (25 Ecos): +3% mutação positiva em fusões
    - T3 (50 Ecos): slot extra na equipe de combate
    - T4 (100 Ecos): acesso ao bioma Vazio Fragmentado
    - T5 (200 Ecos): injeção de gene ancestral 1× por semana
  - `LegacyState` — estado da conta: Ecos, heróis aposentados, habilidades emergentes descobertas, pity counter, injeção semanal
  - `calcRetirementEcos(hero)` — Ecos por raridade (1–15) + bônus de nível + +5 para heróis despertos (nível 50)
  - `retireHero(legacy, hero)` — aposenta herói, acumula Ecos, guarda registro (idempotente)
  - `getActiveTiers`, `isTierUnlocked`, `getLegacyBonuses` — consulta de estado de legado
  - `recordEmergentDiscovery`, `isFirstDiscovery` — registro de primeiras descobertas emergentes
  - **Sistema de pity (anti-frustração)**: `fusionBadLuckCounter` incrementa a cada fusão sem mutação; ativa bônus silencioso após 10 fusões (+5% por fusão extra, cap 50%); `getTotalMutationBonus` combina tier 2 + pity
  - `addHeroBattleXp` — XP de herói (nível 1–50, linear `n×100`), detecta milestones (10/20/30/40/50)
  - `HERO_MILESTONES` — 5 marcos: +uso de habilidade, +HP, passivas mais fortes, -cooldown, despertar
  - `isHeroAwakened` — herói no nível 50 gera Ecos maiores e recebe visual especial
  - `heroBondStars(bond)` — 0-5 estrelas baseado em pontos de vínculo (10/25/50/100/200)
  - `addHeroBond` — incrementa vínculo (BOND_PER_BATTLE=3, BOND_PER_BOSS_KILL=8)
  - `checkWeeklyReset` — reseta injeção de ancestral toda segunda-feira
  - `useAncestorInjection`, `canUseAncestorInjection` — controle semanal da injeção
- `src/systems/progression/legacy.test.ts` — 54 testes cobrindo todos os sistemas

305 testes passando; `tsc --noEmit` limpo.

---

**Passo 20 — Mapa de Solum** ✅ concluído em 2026-06-24

Arquivos criados/modificados:
- `src/systems/world/types.ts` — tipos: `TerritoryId` (7 territórios), `TerritoryState` (corrupção, progresso, reputação, tensão política), `WorldState` (mapa global: ciclo, corrupção global, evento ativo, guerra de facção ativa)
- `src/systems/world/mapData.ts` — dados estáticos do mapa: `TerritoryDef` (7 territórios com SVG paths 390×640, centros, cores por afinidade, facção, lore, vizinhos), `PRIMA_FLOW_PAIRS` (8 conexões com pontos de controle para curvas quadráticas)
- `src/store/worldStore.ts` — Zustand store: estado inicial com corrupções variadas por território, `setCorruption`, `recordFloorCompleted`, `setBossDefeated`, `setReputation`, `addReputation`; recalculo automático de `globalCorruption`
- `app/(game)/index.tsx` — Reescrito como tela do mapa de Solum:
  - `SolumMapCanvas` — Canvas Skia com: fundo #0D0D18, 8 linhas de Prima (bezier quadrático, dourado 14% opacidade), 7 territórios (fill colorido 28%/cinza não visitado, overlays de corrupção por nível, borda destacada para selecionado), bússola alquímica decorativa (canto inferior direito)
  - `TerritoryLabels` — Views sobrepostos com nome (Cinzel, cor da afinidade/cinza não visitado) + label de afinidade
  - `TerritoryTapTargets` — Pressable 80×80dp por território para detecção de toque
  - `MapHUD` — barra de corrupção global (gradiente verde→amarelo→vermelho), info do jogador (avatar + nome + nível), recursos (fragmentos/cristais/ecos) com fundos semi-transparentes, safe area insets
  - `TerritoryPanel` — painel deslizante da direita (75% largura, Reanimated `withTiming` 300ms): cabeçalho com cor da facção, status (barra de corrupção inline, reputação), progresso (superfície/profundezas/núcleo), lore em itálico, botão "Entrar na Dungeon" → navega para `/dungeon/[territoryId]`
  - Backdrop semi-transparente 25% esquerda fecha o painel ao tocar

> **D27:** `Skia.Path.MakeFromSVGString` usada para territórios (M+L+Z) em `useMemo`. `Group transform={[{ scale: SCALE }]}` para escalar mapa 390×640 ao tamanho real da tela. Canvas `StyleSheet.absoluteFill` cobre a tela toda; HUD/labels/tapTargets são Views absolutas sobrepostas.

305 testes passando (sem regressão); `tsc --noEmit` limpo.

---

**Passo 21 — Estados do Mapa (Animações)** ✅ concluído em 2026-06-24

Modificações em `app/(game)/index.tsx`:
- **Prima flow lines animadas** — efeito de cometa por linha: `useDerivedValue` calcula `start`/`end` escalonados por índice (stagger = i/8) com `flowProgress` (0→1 em 20s, `Easing.linear`). Path estático dim (10% opacidade) + Path de cometa brilhante (55%)
- **Pulso de territórios** — `fillPulse` anima opacidade do fill entre 0.22 e 0.32 em ciclo de 4s via `withSequence`; usado como `opacity` em `<Group>` do Skia
- **Névoa de corrupção severa** (>60%) — `fogPulse` anima overlay vermelho-escuro entre 0.28 e 0.55 em ciclo de 2.8s; aplicado como segundo `<Group opacity={fogPulse}>` sobre territórios com `corruptionLevel > 60`
- **Bússola alquímica rotativa** — movida do Canvas Skia para `AlchemicCompassView` (Animated.View + SvgXml); `compassRotation` com `withRepeat(withTiming(360, 120000, Easing.linear))`; posicionada no canto inferior direito com `useSafeAreaInsets`
- **Indicador de chefe disponível** — `BossIndicators`: Animated.View pulsante (opacity 0.5→1.0, 700ms) com `!` na cor da facção; aparece sobre territórios onde `depthsFloors >= 10 && !bossDefeated`

> **D28:** `SharedValue` deve ser importado diretamente de `react-native-reanimated`, não via `Animated.SharedValue` — o namespace `Animated` desta versão não exporta esse tipo.

305 testes passando; `tsc --noEmit` limpo.

---

**Passo 22 — Segundo Bioma + Sistema de Facções** ✅ concluído em 2026-06-24

Arquivos criados/modificados:

- **`src/systems/progression/dungeon.ts`** — `BiomeId` expandido para incluir os 7 territórios de Solum (`axis`, `kethara`, `mnemos`, `verdania`, `cinderfall`, `limiar`, `venula`); configs completas por território (faction AI patterns, attrBoost/Penalty, unlockCondition); helper `isTerritoryBiome(id)`

- **`src/systems/world/factionEvents.ts`** (novo) — 14 eventos de facção (2 por território), cada um com 2 escolhas que afetam reputação de 1-3 territórios; `pickFactionEvent(territory, seed): FactionEventDef | null` (determinístico por seed)

- **`src/components/world/FactionEventModal.tsx`** (novo) — Modal com cor da facção, título do evento, descrição (itálico), 2 botões de escolha mostrando o impacto de reputação, botão "Ignorar"

- **`app/(game)/dungeon/between.tsx`** — Integração do sistema de facções: após completar andares pares (2, 4, 6...) em biomas de território, rola evento de facção e exibe FactionEventModal; escolha aplica `addReputation` no worldStore; também chama `recordFloorCompleted(territory, 'surface')` conectando progresso do mapa

- **`app/(game)/dungeon/[biomeId].tsx`** — Quando bioma é um território: exibe cor e label da facção no header, barra de reputação atual com tier label (Aliado/Amigável/Neutro/Hostil/Inimigo), lore do território no infoCard

- **`app/(game)/profile.tsx`** — Adicionada seção "Reputação de Facções" com barra para cada um dos 7 territórios (cor da facção, valor numérico, tier label); tela agora usa ScrollView

> **D29:** `BiomeId` inclui os 7 TerritoryIds — o `dungeonStore` e `generateFloorEnemies` funcionam diretamente com territory IDs sem mapeamento adicional, pois `BIOMES[territoryId]` agora retorna uma config válida.

305 testes passando; `tsc --noEmit` limpo.

---

**Passo 23 — Narrativa Camada 1 + Onboarding** ✅ concluído em 2026-06-24

Arquivos criados/modificados:

- **`src/store/narrativeStore.ts`** (novo) — Zustand store com AsyncStorage: persiste `onboardingDone`, `prologueDone`, `seenHints[]`; expose `load()`, `completeOnboarding()`, `completePrologue()`, `markHintSeen(id)`, `hasSeenHint(id)`

- **`src/components/narrative/OnboardingModal.tsx`** (novo) — 3 páginas (Solum, Kael, A Jornada); dots de paginação; botões "Próximo" / "Começar" + skip; modal full-screen

- **`src/components/narrative/PrologueModal.tsx`** (novo) — 7 beats narrativos do prólogo de Kael (origem em Crena, ataque dos Corrompidos, descoberta da fusão, morte do mentor pelos Arquitetos do Véu, partida); barra de progresso linear no topo; citação de Kael no beat 7

- **`src/components/narrative/LoreHint.tsx`** (novo) — hint não-bloqueante com Animated (fade in/out), auto-dismiss em 5s, toque para dispensar; borda esquerda dourada; flutua acima da tab bar

- **`app/(game)/index.tsx`** (atualizado) — detecta state do narrativeStore após `loadNarrative()`; mostra onboarding → prólogo → hint do mapa em sequência

- **`app/(game)/collection.tsx`** (atualizado) — hint `collection-first` na primeira visita

- **`app/(game)/fusion.tsx`** (atualizado) — hint `fusion-first` na primeira visita

> **D30:** `narrativeStore.load()` deve ser chamado explicitamente (não no construtor) para evitar corrida com hidratação do AuthContext. A tela de mapa chama `loadNarrative()` dentro do `useEffect` de inicialização.

305 testes passando; `tsc --noEmit` limpo.

---

**Passo 24 — Polimento Visual + Checklist de Publicação** ✅ concluído em 2026-06-24

Implementado conforme `docs/10_direcao_de_arte.md`:

- **`app/_layout.tsx`** — Carrega `LibreBaskerville_400Regular_Italic` (fonte italic real, não síntese)
- **`src/lib/theme.ts`** — Adicionado `typography.bodyItalic` com `LibreBaskerville_400Regular_Italic`
- **`src/components/ui/Button.tsx`** — Haptic feedback via `expo-haptics` (Light em primary/secondary, Heavy em danger)
- **`src/components/hero/HeroCard.tsx`** — `borderRadius: 0` (conforme doc 10: "cantos angulares, não arredondados"); `AlchemyGlyph` no canto superior direito (24×24, badge semitransparente); haptic `selectionAsync` ao toque
- **`src/components/world/FactionEventModal.tsx`** — Haptic `notificationAsync(Success)` ao confirmar escolha de facção; fonte italic real na descrição
- **`src/components/narrative/*.tsx`** — Fonte italic real substituindo `fontStyle: 'italic'` + síntese
- **`app.json`** — Metadata completo: `bundleIdentifier: com.fragmentosde.alma`, `package: com.fragmentosde.alma`, `versionCode: 1`, `scheme: fragmentos-de-alma`, `supportsTablet: false`, `userInterfaceStyle: dark`
- **`eas.json`** (novo) — Perfis EAS: development (devClient), preview (APK/internal), production (AAB/IPA + autoIncrement)

> **D31:** `expo-haptics` estava no `package.json` mas não instalado — necessário `npm install expo-haptics --legacy-peer-deps` por conflito de peerDeps com `react-dom@19` no Expo SDK 56.

> **D32:** Substituir `fontStyle: 'italic'` por `fontFamily: 'LibreBaskerville_400Regular_Italic'` — `fontStyle` com uma fonte Regular gera síntese pelo sistema operacional, não usa a fonte italic real. No iOS especialmente isso é perceptível.

### Checklist de publicação (passos manuais restantes)

- [ ] Criar conta no EAS: `npx eas login`
- [ ] Iniciar projeto EAS: `npx eas init` (preenche `projectId` no `app.json`)
- [ ] Criar ícone app (1024×1024px PNG): espiral dupla que se fragmenta nas extremidades (ver doc 10 seção 8)
- [ ] Criar splash screen (1284×2778px): `#0A0A0F` com glifo `◈` centralizado em dourado
- [ ] Criar conta App Store Connect e Google Play Console
- [ ] Preencher `ascAppId` e `appleTeamId` em `eas.json`
- [ ] Criar `google-service-account.json` para deploy Android
- [ ] Build de produção: `npx eas build --platform all --profile production`
- [ ] Submit: `npx eas submit --platform all --profile production`

305 testes passando; `tsc --noEmit` limpo.

---

## Passo 25 — Torres de Ressonância ✅

**Concluído em:** 2026-06-24  
**Doc de referência:** `docs/12_endgame.md` (Pilar 1 — Torres de Ressonância)

### O que foi implementado

**`src/systems/endgame/towers.ts`** (novo — lógica pura):
- `TOWER_ZONES`: 4 zonas (andares 1–25, 26–50, 51–75, 76–100) com mecânicas progressivas
- `TOWER_BOSS_FLOORS`: chefes nos andares 25, 50, 75, 100
- `TOWER_MINI_BOSS_FLOORS`: mini-chefes nos andares 10, 35, 60, 90
- `generateTowerFloorEnemies(floor, seed)`: inimigos escalados por zona com multiplicadores de stat (×1,3 zona 1 → ×2,5 zona 4)
- `getAmplifiedAffinity(floor)`: afinidade amplificada rotacional na zona 2
- `createTowerSession`, `advanceTowerFloor`, `getRetreatFloor`, `isTowerComplete`
- `HP_RECOVERY_TOWER = 0.15` (15%, metade do 30% das dungeons)
- `TOWER_UNLOCK_TERRITORIES = 4` (condição de desbloqueio)

**`src/store/towerStore.ts`** (novo — estado Zustand):
- `session: TowerSession | null` — progresso ativo da sessão
- `weeklyBestFloor` e `allTimeBestFloor` — recordes
- `startTower(heroes)`, `recordFloorVictory(combatants)`, `applyHpRecovery()`, `handleDefeat()`, `exitTower()`
- `handleDefeat()`: retrocede para o início da zona atual + reseta HP para máximo

**`app/(game)/dungeon/tower.tsx`** (novo — tela de entrada):
- Exibe recordes (semanal + all-time), progresso da sessão atual
- Mostra as 4 zonas com mecânicas e cores distintivas
- Mostra recompensas por marco (andares 25/50/75/100)
- Bloqueia entrada se < 4 territórios com progresso ou < 6 heróis
- Se sessão ativa: botão "CONTINUAR — ANDAR X"

**`app/(game)/dungeon/tower-battle.tsx`** (novo — wrapper de batalha):
- Reutiliza `BattleScreen` (battle.tsx)
- Intercepta `battleState.phase === 'victory'` → `recordFloorVictory()` + navega para `tower-between`
- Intercepta `battleState.phase === 'defeat'` → `handleDefeat()` + Alert + retorna para `tower`

**`app/(game)/dungeon/tower-between.tsx`** (novo — entre andares):
- Aplica recuperação de 15% HP automaticamente ao montar
- Mostra: andar concluído, barra de progresso geral (0–100), zona ativa + mecânica
- Mostra afinidade amplificada (zona 2) quando ativa
- Lista HP de todos os 6 heróis após recuperação
- Info do próximo andar (chefe / mini-chefe / normal)
- Marcador de marco atingido quando alcança andar 25/50/75/100
- Botões: "PRÓXIMO ANDAR" e "Salvar e sair"

**`app/(game)/index.tsx`** (modificado — integração no mapa):
- `TowerButton`: botão flutuante `bottom: safeAreaBottom + 72` (acima da tab bar)
- Visível apenas quando ≥ 4 territórios com progresso (condição de desbloqueio)
- Mostra andar atual se sessão ativa; recorde all-time se não
- Navega para `/(game)/dungeon/tower`

### Decisões de implementação

**D33 — tower-battle.tsx como wrapper:** Em vez de modificar `battle.tsx` com parâmetros de rota ou condicionais de towerStore, criou-se `tower-battle.tsx` que importa `BattleScreen` e intercepta o phase via `useEffect`. Isso isola completamente a lógica da torre da lógica das dungeons.

**D34 — Mecânicas de zona como display-only no MVP:** As mecânicas específicas (Ressonância Elemental zona 2, Memória de Batalha zona 3, Prima Invertido zona 4) estão descritas na UI mas não implementadas no motor de batalha — implementá-las exigiria mudanças significativas no `engine.ts`. Os valores de stat dos inimigos já as simulam parcialmente (multiplicadores de zona). As mecânicas reais são escopo do Passo 26+.

**D35 — heroHpSnapshot usa -1 para HP máximo:** `-1` no snapshot indica "usar HP máximo do herói" para evitar serializar valores de HP antes da primeira batalha.

---

## Sistema de Transmutação (design completo — 2026-06-24)

Brainstorming completo do **Círculo de Transmutação** concluído. Design documentado em `docs/13_transmutacao.md`. Pronto para implementação pelo Codex (ver prompt em `codex-output/PROMPT_TRANSMUTACAO_COMPLETO.md`).

Resumo do que foi projetado:
- **3 submenus:** Criar Eco (aposentar → blueprint genético), Extrair Cristais (aposentar → Cristais), Transmutar Heróis (fusão + catalisadores opcionais)
- **Ecos como itens blueprint** indexados por assinatura genética, com absorção automática (melhores valores, cap 120)
- **Proteção de roster:** 3 time + 3 banco sempre protegidos; nunca menos de 6 heróis na coleção
- **Catalisadores graduados:** 1-3 Ecos concedem +1 tier com probabilidade 70%→95% (Comum) a 15%→40% (Épico→Lendário)
- **Legado via Score:** soma ponderada de Ecos únicos por raridade (não contagem simples)
- **Migration 007:** tabela `ecos` + colunas `team_hero_ids`, `bench_hero_ids`, `legacy_score` em `players`
- **Calibração:** curvas de XP, trickle de Cristais e thresholds exatos são pendência de playtesting

---

## Próximo Passo

**Implementação do Círculo de Transmutação**
Ver `docs/13_transmutacao.md` e prompt Codex em `codex-output/PROMPT_TRANSMUTACAO_COMPLETO.md`.
⚠️ Confirme antes de iniciar (ou usar o prompt Codex diretamente).

---

## Checklist da Ordem de Implementação (doc 09)

### Fase 0 — Fundação Técnica
- [x] Passo 1 — Inicializar projeto Expo + instalar dependências
- [x] Passo 2 — Criar estrutura de pastas + theme.ts + constants.ts
- [x] Passo 3 — Configurar Supabase (migrations + supabase.ts)

### Fase 1 — Núcleo Colecionável
- [x] Passo 4 — `src/systems/genes/types.ts` (ler doc 01 antes)
- [x] Passo 5 — `src/systems/genes/generator.ts` (ler doc 01 antes)
- [x] Passo 6 — `src/systems/genes/fusion.ts` (ler doc 01 antes)
- [x] Passo 7 — `src/systems/genes/rarity.ts` (ler doc 01 antes)
- [x] Passo 8 — `src/systems/visual/generator.ts` (ler doc 02 antes)
- [x] Passo 9 — `src/utils/nameGenerator.ts` (ler doc 02 antes)
- [x] Passo 10 — `src/systems/skills/generator.ts` (ler doc 03 antes)
- [x] Passo 11 — Telas: Login → Registro → Coleção → Detalhe → Fusão → Revelação

### Fase 2 — Núcleo de Batalha
- [x] Passo 12 — `src/systems/battle/engine.ts` (ler doc 06 antes)
- [x] Passo 13 — `src/systems/battle/ai.ts` (ler doc 07 antes)
- [x] Passo 14 — `src/systems/battle/rewards.ts` (ler doc 07 antes)
- [x] Passo 15 — Tela de batalha: roda de ações, banco de reserva, HUD

### Fase 3 — Núcleo de Progressão
- [x] Passo 16 — Dungeons e andares (`app/(game)/dungeon/`) (ler doc 04 antes)
- [x] Passo 17 — `src/systems/progression/kael.ts` (ler doc 08 antes)
- [x] Passo 18 — Chefe com 3 fases (ler doc 07 antes)
- [x] Passo 19 — `src/systems/progression/legacy.ts` (ler doc 04 antes)

### Fase 4 — MVP Publicável
- [x] Passo 20 — Mapa de Solum com React Native Skia (ler doc 11 antes)
- [x] Passo 21 — Estados do mapa: corrupção, progresso, fronteiras políticas
- [x] Passo 22 — Segundo bioma + sistema de facções (ler docs 04 e 08 antes)
- [x] Passo 23 — Narrativa Camada 1 + onboarding (ler doc 08 antes)
- [x] Passo 24 — Polimento visual + checklist de publicação (ler doc 10 antes)

### Pós-MVP — Endgame (doc 12)
- [x] Passo 25 — Torres de Ressonância
- [ ] Passo 26 — Conflito de Facções (PvP assíncrono)
- [ ] Passo 27 — Fragmentos Ancestrais
- [ ] Passo 28 — Ciclos de Solum (temporadas)
- [ ] Passo 29 — Batalha Coletiva (evento de fim de Ciclo)

---

## Como Retomar em Sessão Futura

1. Leia `docs/00_documento_mestre.md` primeiro — ele tem o índice e a ordem de leitura de todos os docs
2. Leia este arquivo (`docs/PROGRESSO.md`) para saber o estado atual
3. Leia o doc correspondente ao passo que vai implementar (ver tabela no doc 00)
4. **Nunca implementar mais de um passo por sessão sem confirmação do usuário**
5. Atualizar este arquivo ao concluir cada passo
