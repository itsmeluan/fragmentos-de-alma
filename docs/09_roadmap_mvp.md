# 🗺️ Roadmap de MVP — Fragmentos de Alma
*Para uso do Claude Code — Documento técnico completo*
*Última atualização: v0.1*

---

## Leitura Obrigatória Antes de Qualquer Implementação

Este documento é parte de um conjunto de 13 documentos de design. Antes de implementar qualquer sistema, o Claude Code deve ler os documentos relevantes:

| Documento | Conteúdo | Quando ler |
|---|---|---|
| `01_sistema_de_genes.md` | Estrutura de genoma, herança, raridade | Antes de qualquer sistema de dados |
| `02_sistema_visual.md` | Geração visual procedural por camadas | Antes de renderizar heróis |
| `03_sistema_de_habilidades.md` | Anatomia de habilidades, banco de componentes | Antes do sistema de batalha |
| `04_loop_de_progressao.md` | Velocidades de progressão, biomas, legado | Antes do sistema de dungeons |
| `05_economia.md` | Recursos, monetização, mercado | Antes de qualquer sistema de moeda |
| `06_sistema_de_batalha.md` | Turnos, posições, roda de ações | Antes da tela de batalha |
| `07_inimigos_chefes_recompensas.md` | Geração de inimigos, chefes, drops | Antes do sistema de inimigos |
| `08_narrativa_lore_mundo.md` | Mundo, facções, narrativa em camadas | Antes de qualquer texto do jogo |
| `10_direcao_de_arte.md` | Paleta, tipografia, componentes visuais | Antes de qualquer elemento visual |
| `11_mapa_de_solum.md` | Mapa vivo, navegação, estados, implementação | Antes da tela principal |
| `12_endgame.md` | Torres, PvP, Fragmentos Ancestrais, Ciclos | Antes de sistemas de endgame |
| `13_transmutacao.md` | Círculo de Transmutação, Ecos blueprint, roster protegido | Antes de implementar transmutação |

---

## Stack Tecnológica

### Frontend (Mobile)
```
React Native 0.85   (mínimo de design: 0.74+ — ver § Decisões de Implementação)
Expo SDK 56         (mínimo de design: 51+  — ver § Decisões de Implementação)
Expo Router (navegação baseada em arquivos)
React Native Reanimated (animações)
React Native Gesture Handler (gestos e toque)
React Native Skia (mapa de Solum e partículas — ver doc 11)
Zustand (gerenciamento de estado global)
TanStack Query (cache e sincronização de dados)
```
> Ambiente real: Expo SDK 56, React Native 0.85, TypeScript 6, Node 25.

### Backend
```
Supabase (banco de dados PostgreSQL, autenticação, storage)
Supabase Edge Functions (lógica de servidor em Deno/TypeScript)
Supabase Realtime (eventos em tempo real quando necessário)
```

### Ferramentas de Desenvolvimento
```
TypeScript (obrigatório em todo o projeto)
ESLint + Prettier (formatação e linting)
Jest + React Native Testing Library (testes)
```

### Por que essa stack
- React Native + Expo: um único codebase para iOS e Android, sem necessidade de Mac para desenvolver inicialmente, comunidade grande, deploy simplificado
- Supabase: banco de dados relacional robusto, autenticação pronta, sem gerenciar servidores, plano gratuito generoso para MVP
- TypeScript: obrigatório para um projeto com sistemas complexos como genes e habilidades procedurais — evita erros de tipo que seriam difíceis de debugar

---

## Decisões de Implementação

> Log vivo de decisões técnicas e desvios da referência deste documento.
> Mantido em sincronia com `docs/PROGRESSO.md`. Cada entrada cita o passo.

| # | Passo | Decisão | Motivo |
|---|---|---|---|
| D1 | 1 | Projeto inicializado com **Expo SDK 56** (RN 0.85, TS 6, Node 25), não 51+ | Versão corrente do `create-expo-app`; sem impacto no design |
| D2 | 2 | `react-native-reanimated`, `react-native-gesture-handler` e `@shopify/react-native-skia` instalados com `--legacy-peer-deps` | Conflito transitivo de `react-dom` (Radix via `expo-router`); não afeta o runtime RN |
| D3 | 2 | `@shopify/react-native-skia` e `@react-native-async-storage/async-storage` adicionados às dependências | Skia é exigido pelo mapa (doc 11); AsyncStorage é o storage de sessão do Supabase (seção 0.2) |
| D4 | 3 | Migrations aplicadas via **Supabase CLI** (`supabase db push`); arquivos SQL versionados em `supabase/migrations/001–005` | CLI foi o caminho viável; chaves em `.env` (fora do git) |
| D5 | 4 | `Hero.visualParams` e `Hero.skills` (em `genes/types.ts`) tipados como stubs `unknown` | Os sistemas visual (Passo 8) e de habilidades (Passo 10) ainda não existem; substituir pelos imports reais nesses passos |
| D6 | 5 | Alias **`@/` = `src/`** configurado (`tsconfig.json` `paths` + `jest.config.js` `moduleNameMapper`) | Os imports da referência deste doc usam `@/lib/...`; `@` mapeia para `src` |
| D7 | 5 | Infra de testes: **`jest-expo`** + `@react-native/jest-preset` + `babel-preset-expo` (`babel.config.js`, `jest.config.js`). Testes importam de `@jest/globals` | Stack documentada (Jest); `@jest/globals` evita mexer em `types` global e não afeta os tipos do app |
| D8 | 5 | `randomFrom`/`randomInt` extraídos para **`src/utils/random.ts`** (a referência os in-lina em `generator.ts` e `fusion.ts`) | Evita duplicação entre os sistemas; é o arquivo já reservado para "aleatoriedade controlada" |
| D9 | 5 | `weightedOriginForBiome` (em `generator.ts`) recebe **guarda para bioma desconhecido** → fallback p/ Origem aleatória | Correção de bug latente da referência (retornava `undefined`) |
| D10 | 6 | `fusion.ts`: corrigido o log de herança da **afinidade** (a referência re-sorteava a fonte em vez de registrar o pai realmente escolhido) e **`applyInjectedGene`** foi implementada (citada mas indefinida na referência) | Fidelidade e consistência do log de herança ("legível ao jogador" — doc 01) |
| D11 | 6 | Mutações condicionais **INVERSO** = 30% (afinidades opostas) e **ESPELHO** = 20% (mesma origem), implementadas (`mutationInversoChance`/`mutationEspelhoChance`) | Decisão do usuário: são gatilhadas por escolha do jogador, então recompensam a intenção (descobríveis, não garantidas) sem inflar raridade. Substitui a pendência original |
| D12 | 6 | **ANCESTRAL/CAOS/TRANSCENDÊNCIA** ficam fora do motor de fusão de genoma | Dependem de contexto fora do genoma (gerações, evento global de eclipse, raridade dos pais) — pertencem ao orquestrador de fusão de nível superior |
| D13 | 6 | Adicionado par de afinidades opostas **Vazio↔Éter** (doc 01 e `OPPOSITE_AFFINITIES`) | Decisão do usuário: antes só 6 das 8 afinidades tinham oposto; Vazio/Éter ficavam sem poder gerar INVERSO. Agora as 8 afinidades formam 4 pares |
| D14 | 7 | `calculateRarity` recebe param opcional `isUnique = false`; sem ele, 'unico' nunca é retornado | 'Único' exige condições externas de evento (não deriváveis só do genoma). O orquestrador de nível superior passará `true` quando aplicável. Soma máxima com atributos base é 600 (6 × 100), então a faixa lendário (>750) só via bônus futuros; TRANSCENDENCIA é o caminho primário atual |
| D15 | 8 | `makeSeededRng` extraído para `src/utils/random.ts` (RNG determinístico via hash de string) | Protocolo de Unicidade (doc 02) exige que o mesmo seed produza sempre o mesmo visual. O utilitário será compartilhado com `nameGenerator.ts` (Passo 9) — o doc 02 especifica que nomes também derivam do genoma + seed |
| D16 | 8 | `VisualParams` em `genes/types.ts` substituiu o stub `unknown` por `import/re-export` de `../visual/types` | Remove a dependência circular (visual não importa genes; genes re-exportam visual) e mantém o contrato de `Hero.visualParams` sem quebrar imports existentes |
| D17 | 9 | Epíteto de `ANCESTRAL` usa genéricos determinísticos; `ancestorName` é parâmetro opcional | O nome exato do ancestral exige contexto de linhagem (banco de dados) que pertence ao orquestrador de nível superior. A função pura aceita a injeção quando disponível |
| D18 | 10 | `HeroSkills` em `genes/types.ts` substituiu stub `unknown` por `import/re-export` de `../skills/types` | Mesmo padrão de D16 (VisualParams); evita dependência circular |
| D19 | 10 | Modificador M06 (efeito elemental secundário) usa `affinity === 'Éter' \|\| 'Vazio'` como placeholder | O doc 03 diz "AFINIDADE híbrida" mas `EssenceGenes.hybridAffinity` não é acessível sem refatoração do signature. Resolver quando o resolver.ts de batalha precisar do modificador real (Passo 12) |
| D20 | 11 | Fontes carregadas via `@expo-google-fonts/*` (bundle JS) em vez de arquivos `.ttf` em `assets/fonts/` | Elimina necessidade de baixar/hospedar assets de fonte; nomes de família ficam como `Cinzel_700Bold` (não `Cinzel-Bold`). `theme.ts` atualizado para refletir os nomes exatos |
| D21 | 11 | `SplashScreen` importado de `expo-router`; `StatusBar` sem prop `backgroundColor` | `expo-splash-screen` não é dependência direta do projeto; o expo-router 56 re-exporta `SplashScreen`. `expo-status-bar` não aceita `backgroundColor` como prop nessa versão |
| D22 | 11 | `fuseGenomes` recebe `FusionInput` (objeto único), retorna `FusionResult { genome, inheritanceLog }` | A assinatura do Passo 6 usa objeto único, não 3 args separados. `fusion.tsx` usa `fuseGenomes({ parentA, parentB, seed }).genome` |
| D23 | 11 | `StyleSheet.absoluteFill` (não `absoluteFillObject`) — é um `ViewStyle` direto, sem spread | Os tipos do RN nessa versão expõem `absoluteFill` como ViewStyle e `absoluteFillObject` como objeto plano, mas somente `absoluteFill` é aceito como valor de propriedade de estilo no StyleSheet |
| D24 | Visual | `react-native-svg` instalado com `--legacy-peer-deps` | Necessário para `SvgXml` e componentes SVG usados na tab bar, ornamentos UI e emblemas de facção |
| D25 | Visual | Ícone e splash autorados como SVG e convertidos para PNG com `npx sharp-cli ... resize ...`; `app.json` usa PNGs | Mantém assets editáveis em SVG e usa o formato mais compatível com Expo para ícone/splash |
| D26 | Visual | Glows brancos puros do gerador visual foram substituídos por `#B0BEC5`, `#FFF176` e `#E8E0D0` | Cumpre a regra da direção de arte de nunca usar branco puro sem refatorar toda a paleta procedural do doc 02 |
| D24 | 12 | Fórmula de dano: `power × (ataqueStat/50) × (50/defStat) × posMult × defendMult` (defending = ×0.5) | Doc 06 não especifica fórmula numérica. Estimativa calibrada pelas faixas de atributo (1–100); revisar no balanceamento de dungeons (Passo 16) |
| D25 | 12 | RNG do engine é step puro `stepRng(seed): { value, seed }` (LCG sem closure); seed avança no BattleState | Mantém pureza de todas as funções do engine (sem estado mutable oculto) e garante determinismo reproduzível dado o mesmo BattleState inicial |
| D27 | Build | **`package.json` `main` corrigido de `index.ts` para `expo-router/entry`** | Bug crítico: o `main` apontava para o entry do template `create-expo-app` (`index.ts` → `App.tsx`), que registrava uma tela estática placeholder ("Fragmentos de Alma") em vez de inicializar o expo-router. Resultado: o app abria, renderizava o template e nunca carregava nenhuma rota da pasta `app/` — parecia "travado na splash". Em projeto expo-router o entry **tem que ser** `expo-router/entry`. Arquivos mortos `App.tsx` e `index.ts` removidos |
| D28 | Build | **`expo-splash-screen` adicionado como dependência direta** (corrige/substitui parte de D21) | O expo-router chama internamente `requireOptionalNativeModule('ExpoSplashScreen')` para controlar a splash nativa via `_internal_preventAutoHideAsync`/`_internal_maybeHideAsync`. Sem o pacote (e o pod iOS), o controle da splash era no-op silencioso. `npx expo install expo-splash-screen` + plugin em `app.json` |
| D29 | Build | Adicionado **`app/(auth)/_layout.tsx`** (Stack) | O grupo `(auth)` não tinha layout próprio (diferente de `(game)`), então `<Stack.Screen name="(auth)" />` no `_layout.tsx` raiz emitia warning `No route named "(auth)"` e as rotas eram achatadas. O layout torna `(auth)` um grupo addressável e remove o warning |
| D30 | Build | Fluxo de dev/teste passa a usar o **Simulador iOS** (`xcrun simctl` + `expo start`), com logs via `simctl spawn booted log stream` e verificação por `simctl io ... screenshot` | Build no dispositivo físico exige desbloqueio manual a cada launch (`devicectl ... error 10002 / Locked`), inviável para iteração autônoma. Caches (`DerivedData`, `CocoaPods`) e `TMPDIR` redirecionados para o SSD externo (`/Volumes/SSDLuan/`) por falta de espaço no disco interno |
| D31 | UX inicial | **`gameStore.initialize` cria o registro `players` se não existir** (PGRST116 → insert com defaults da migration 001) | Não há trigger no banco (`handle_new_user`) nem insert no fluxo de registro. Sem isso, um usuário recém-criado caía em erro no `.single()`, `player` ficava `null` e os recursos apareciam como 0/0/0. Correção app-side destrava contas já existentes sem migration |
| D32 | UX inicial | **Concessão de 6 fragmentos iniciais** a jogador novo (`heroes.length === 0 && totalFusions === 0`) via `grantStarterFragments` | Soft-lock de design: a Fusão exige 2 heróis e a dungeon exige 6 (3 ativos + 3 banco, doc 06), mas não havia forma de obter o primeiro herói. Doc 09 Fase 1 prevê "ganha fragmentos iniciais". 6 = time completo, destrava Fusão e a 1ª dungeon. Constante `STARTER_FRAGMENT_COUNT` |
| D33 | UX inicial | **Dungeon/torre movidas para um Stack próprio** (`app/(game)/dungeon/_layout.tsx`) e tab bar escondida nessas rotas (`Tabs.Screen name="dungeon"` com `href:null` + `tabBarStyle:{display:'none'}`) | As telas de dungeon estavam achatadas no Tabs do grupo `(game)`, deixando a tab bar visível e tocável durante a batalha — o jogador saía sem querer e perdia o progresso |
| D34 | UX inicial | Hint `map-first` aponta explicitamente para **Kethara** (Pedra Viva, sempre desbloqueado) como dungeon inicial | Doc/UX exige direcionar o jogador novo a um mapa específico para começar; antes o hint era genérico |
| D35 | Economia | **Fusão agora cobra custo em Fragmentos por tier** (`fusionCost`/`FUSION_TIER_COST` no gameStore): 100/300/800/2000/5000 pela maior raridade dos pais. **Sem custo em Cristais** | Doc 05: custo de fusão é só em Fragmentos; Cristais são para intervenções (injeção de gene/reroll). A UI antiga mostrava "100 Fragmentos + 1 Cristal" e não debitava nada |
| D36 | Economia | **Fusão consome (aposenta) ambos os pais e cristaliza o gene mais forte de cada um** num registro `fragments` (`source='fusion_byproduct'`) — `commitFusion` no gameStore | Decisão do usuário (doc 01, "Morte e Legado": herói sacrificado para fusão tem genes cristalizados em fragmento reutilizável). Pais ficam `is_retired=true`. A UI de **injeção de gene** usando esses fragmentos é follow-up |
| D37 | Economia | **Drop de fragmento ao concluir um andar de dungeon** (`grantDungeonDrop`, chamado em `battle.tsx` quando `battleIndexInFloor === 0` pós-vitória) | Necessário para fechar o loop: como a fusão agora consome os pais (D36), sem reabastecimento a coleção só encolheria. Doc 04 (`fragments.source='dungeon_drop'`). Coberto por `dungeon.test.ts` |
| D38 | Polish/IDs | **IDs de bioma unificados** no `generator.ts` (chaves = BiomeId canônico de `dungeon.ts`); `generateFloorEnemies` passa o bioma; `players.unlocked_biomes` default → `kethara` (migration 006); profile exibe rótulo legível (`biomeLabel`). **Log de batalha** resolve o nome da habilidade (`skillNameById`) em vez do id cru ("active_0") | Três vocabulários de id divergiam (DB `cavernas_abismo` vs `abismo` vs `pináculo_celestial`); `unlocked_biomes` não era usado para gate. Migration 006 precisa ser aplicada via `supabase db push` |
| D39 | Transmutação | **Migration 007** cria `ecos` como blueprints genéticos por assinatura (`UNIQUE(player_id, signature_key)`) e adiciona `team_hero_ids`, `bench_hero_ids`, `legacy_score` em `players`; **migration 008** credita recursos de teste para `m.luan.mobile@gmail.com` | Implementa `docs/13_transmutacao.md`; 008 é apenas desenvolvimento local e deve ser revisada antes de qualquer ambiente de produção |
| D40 | Transmutação | `src/systems/genes/eco.ts` concentra tipos e funções puras de Eco: assinatura, score/tier de legado, merge de genes/skills, preview de absorção, validação de catalisador e chance de tier-up; coberto por `eco.test.ts` | Mantém regra de negócio fora da UI/store e preserva o padrão de sistemas puros em `src/systems/` |
| D41 | Transmutação | `gameStore` ganhou `ecos`, `loadEcos`, `commitCreateEco`, `commitExtractCrystals`, `commitTransmutation`, `setRoster`, `isInRoster`, `canRetireHero` e campos de roster/legado em `Player` | O Círculo precisa persistir Ecos, proteger roster, consumir pais/catalisadores, recalcular `legacy_score` e manter a cristalização pós-fusão no schema real de `fragments` |
| D42 | Transmutação | `app/(game)/transmutation.tsx` substitui a fusão simples com 3 abas; `fusion.tsx` virou redirect e a tab nova usa o ícone de fusão como **Círculo** | A tela antiga não cobria Eco/extração/catalisadores. A rota antiga continua funcional por redirecionamento |
| D43 | Transmutação | Transmutação herda habilidades por slot com 70% de chance a partir do pool dos pais + skills dos Ecos catalisadores; 30% permanecem procedurais pelo genoma do filho | Cumpre `docs/13_transmutacao.md` sem refatorar o gerador procedural existente |
| D44 | Transmutação | `RosterManager` foi criado e integrado à Coleção com autosave para 3 heróis de time + 3 de banco | O roster precisa ser gerenciado fora do Círculo e visível antes das operações destrutivas; a Coleção é a superfície natural para essa escolha |
| D45 | Transmutação | **Criar Eco exige herói no nível máximo (50 / Despertar)**. Heróis abaixo do cap aparecem desabilitados na aba Criar Eco e o store retorna erro específico se chamado diretamente | Evita aposentadoria prematura e substitui o erro genérico visto no teste rápido por regra clara de UI e domínio |
| D46 | Transmutação | **Transmutação agora usa Eco principal A + Eco principal B**, não heróis pais. Ecos principais não são consumidos; até 3 catalisadores são consumidos. Custo = Fragmentos + Cristais pela maior raridade dos Ecos principais (100/300/800/2000/5000 Fragmentos e 1/3/8/20/50/120 Cristais) | Correção de mecânica definida no teste rápido: a transmutação deve nascer de blueprints genéticos, não de heróis vivos |
| D47 | Transmutação/UI | Tela **Almas** ganhou abas internas **Heróis** e **Ecos**; heróis em time/banco recebem frame/badge; tocar Eco abre sheet própria de detalhes; `Modal` ganhou modo `fill` para sheets longas | Corrige legibilidade da coleção, torna Ecos inspecionáveis e resolve sheet de detalhes aparecendo cortada/fora da tela |
| D48 | Dados de teste | **Migration 009** reaplica créditos para `m.luan.mobile@gmail.com` e promove dois heróis ativos para nível 50 | Garante validação imediata de recursos e do fluxo Criar Eco com heróis capados, mantendo heróis nível 1 para verificar estado desabilitado |
| D49 | Visual/HeroCard | **HeroCard totalmente refeito em formato retrato** com Canvas Skia: strip superior (nome+nível), arte quadrada com inset horizontal 5px (sem inset vertical — strips tocam as bordas da arte), strip inferior (ícone afinidade + Classe·Origem + estrelas). Sombra purple `#2a0d60` em wrapper externo sem `overflow:hidden`; clipping apenas no Pressable interno. Resolve conflito iOS onde `overflow:hidden` cancela `shadow*` | Redesenho solicitado pelo usuário: o HeroVisual baseado em VisualParams procedurais foi substituído por sprites pixel art reais vindos do PixelLab. O HeroCard agora é o ponto de entrada visual principal do jogo |
| D50 | Visual/Sprites | **`UNIQUE_SPRITE_INSET_RATIO = 0.10`** em `HeroCard.tsx` e `HeroSprite.tsx` — sprite único renderizado em 80% da área de arte para normalizar tamanho visual entre tiers | Sprites Únicos (136×136px) têm personagem mais denso que os outros tiers (~124px de conteúdo real); sem o inset parecem maiores. O ratio foi calibrado visualmente no dispositivo |
| D51 | Visual/Grade | **Largura fixa de card via `useWindowDimensions`**: `cardWidth = Math.floor((screenWidth - 32) / 3)` passado como prop `width` ao HeroCard, que aplica `{ flex: 0, width }` no wrapper | `FlatList numColumns={3}` com `flex: 1` esticava o último item quando a linha ficava incompleta (1 ou 2 heróis). Largura fixa elimina o stretch sem precisar de padding artificial |
| D52 | Visual/Sprites | **Sistema de sprite registry auto-gerado**: `spriteRegistry.ts`, `backgroundRegistry.ts`, `originBackgroundRegistry.ts`, `bossRegistry.ts`, `enemyRegistry.ts` usam `require()` com literais estáticas | Metro bundler do RN exige strings literais em `require()` para incluir assets no bundle; não é possível usar paths dinâmicos. Os registries são mapas estáticos regenerados por script quando novos assets são adicionados |
| D53 | Visual/HeroCard | **Cards sem bordas coloridas por raridade** — preenchimento preto `#09080f` com sombra roxa pequena; fundo da lista permanece `background.primary` (`#0A0A0F`) | Bordas coloridas criavam ruído visual excessivo na grade densa de 3 colunas. A raridade fica comunicada pelas estrelas e pelo background do sprite. Sombra roxa cria separação sutil sem iluminar o card |
| D54 | Passo 9 | **`generateName(genome, seed)` reescrita para nomes de uma palavra** — `prefixo + raiz + sufixo` sem espaços, sem epítetos, sem parâmetro `ancestorName`. Determinístico via `makeSeededRng` | Nomes compostos ("Vex'kara Nox, o Partido") pareciam excessivamente sérios e difíceis de ler em card pequeno. Uma palavra compacta cabe melhor no strip de 26px do HeroCard e fica mais memorável |
| D55 | UI/Coleção | **`collection.tsx` dividida em `heroes.tsx` + `ecos.tsx`** como tabs separadas na barra inferior. `collection.tsx` agora é só um redirect para `/heroes`. Abas internas de Heróis/Ecos (que existiam dentro de `collection.tsx`) foram promovidas a rotas de nível de tab | Heróis e Ecos são contextos suficientemente distintos para merecerem navegação de primeiro nível. A separação simplifica cada tela e permite futuras evoluções independentes |
| D56 | UI/Ordenação | **Dropdown de ordenação sem container visual**: texto puro alinhado à direita sobre overlay `rgba(0,0,0,0.84)` que cobre a tela abaixo do header. Header nunca escurecido. Posicionamento via `onLayout` capturando `layout.y + layout.height` (não só `height`) para incluir o safe area inset no cálculo | `layout.y + layout.height` = posição do fundo do header no sistema de coordenadas da SafeAreaView (que inclui o paddingTop da safe area). Usar só `layout.height` posicionava as opções sobre o texto "ordenar por" porque ignorava o offset do safe area |
| D57 | UI/Tabs | **Nova estrutura de tabs**: Mapa → Heróis (ícone almas) → Ecos (ícone diamante/cristal) → Círculo → Kael. Ícone `ecos` adicionado ao `TabIcon.tsx` como SVG inline (diamante com facetas). `collection` e `fusion` permanecem como rotas ocultas (`href: null`) para não quebrar navegação programática existente | A Transmutação (D42) já havia renomeado "Fundir" para "Círculo". Com a separação Heróis/Ecos, a tab bar agora tem 5 destinos que cobrem todos os fluxos principais do jogo |
| D58 | Terminologia | **"Núcleo" → "Classe" na UI** em `EcoDetail.tsx`. O campo `genome.essence.core` representa a classe de combate do herói (Guardião, Destruidor, etc.) e foi renomeado para "Classe" na UI para evitar confusão com o "núcleo" do chefe de dungeon. A referência em `index.tsx` (hub) ao "Núcleo" do chefe (`boss_nucleus`) foi mantida — contexto diferente | "Core" do genoma = classe de combate; "núcleo" do chefe = fase final da dungeon. São conceitos distintos que coincidentemente compartilhavam o mesmo rótulo |
| D59 | Visual/Fontes | **Todas as fontes do app migradas para Rajdhani**: `title` → `Rajdhani_700Bold`, `heroName` → `Rajdhani_600SemiBold`, `body`/`bodyItalic` → `Rajdhani_500Medium`. Cinzel e LibreBaskerville continuam carregadas mas não são mais usadas no `theme.ts`. `Rajdhani_700Bold` adicionado ao `useFonts` em `app/_layout.tsx` | Uniformidade tipográfica: o usuário pediu que toda a UI use a mesma fonte dos nomes dos heróis (que já era Rajdhani). `fontWeight: '700'` com fonte customizada no React Native não usa o arquivo bold — é necessário carregar `Rajdhani_700Bold` explicitamente e referenciar pelo nome |
| D60 | Genes/Raridade | **Boundary de Incomum é `>= 300` (inclusivo)** — `rarity.ts` é a fonte de verdade do comportamento. `constants.ts::RARITY_THRESHOLDS.comum.maxSum = 300` significa que o máximo de Comum é 299 (exclusivo). Um herói com soma exatamente 300 é classificado como Incomum. Doc 01 atualizado para refletir isso. | `constants.ts` e o comentário do doc 01 usavam `< 300` para Comum implicitamente, mas o código de `rarity.ts` faz `sum >= 300 → incomum`. Revisão de design consolidou o comportamento do código como canônico. |
| D61 | Progressão/Biomas | **13 BiomeIds no código** (6 biomas originais + 7 territórios de Solum adicionados no Passo 22): axis, cinderfall, kethara, limiar, mnemos, venula, verdania. Doc 04 atualizado com a lista completa e critérios de desbloqueio. | Doc 04 original listava apenas 6 biomas. Os 7 territórios foram adicionados durante a implementação do mapa de Solum (Passo 20–22) sem atualização retroativa do doc 04. |
| D62 | Batalha | **`ultimateChargeOnBench: 0.5`** — heróis no banco de reserva carregam a barra de Ultimate a 50% da taxa normal, mesmo sem estar em campo. Implementado em `constants.ts::BATTLE` e `engine.ts`. Doc 06 atualizado com esta mecânica e com a fórmula de HP máximo (`resistencia × 10 + level × 20 + 100`). | Decisão de design não documentada no doc 06 original — apenas implementada. A carga de 50% cria profundidade estratégica: quando trocar um herói com barra parcialmente carregada vs. manter um que está carregando no banco. |

---

## Arquitetura do Projeto

### Estrutura de Pastas
```
fragmentos-de-alma/
├── app/                          # Telas (Expo Router)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (game)/
│   │   ├── _layout.tsx           # Tabs: Mapa / Heróis / Ecos / Círculo / Kael
│   │   ├── index.tsx             # Hub principal / Mapa de Solum
│   │   ├── heroes.tsx            # Galeria de heróis com dropdown de ordenação
│   │   ├── ecos.tsx              # Galeria de Ecos
│   │   ├── collection.tsx        # Redirect para /heroes (rota legada)
│   │   ├── fusion.tsx            # Redirect para /transmutation (rota legada)
│   │   ├── transmutation.tsx     # Círculo de Transmutação (3 abas)
│   │   ├── profile.tsx           # Perfil de Kael
│   │   └── dungeon/              # Stack próprio (tab bar oculta aqui)
│   │       ├── _layout.tsx
│   │       ├── [biomeId].tsx     # Seleção de andar por bioma
│   │       ├── battle.tsx        # Tela de batalha
│   │       ├── between.tsx       # Entre batalhas (HP, progresso, evento)
│   │       ├── tower.tsx         # Torres de Ressonância (entrada)
│   │       ├── tower-battle.tsx  # Batalha na torre (wrapper)
│   │       └── tower-between.tsx # Entre andares da torre
│   └── _layout.tsx               # Layout raiz (fontes, auth redirect)
├── src/
│   ├── systems/
│   │   ├── genes/
│   │   │   ├── types.ts
│   │   │   ├── generator.ts
│   │   │   ├── fusion.ts
│   │   │   ├── rarity.ts
│   │   │   └── eco.ts            # Tipos e funções puras de Eco
│   │   ├── skills/
│   │   │   ├── types.ts
│   │   │   ├── generator.ts
│   │   │   └── resolver.ts
│   │   ├── visual/
│   │   │   ├── types.ts
│   │   │   ├── generator.ts      # Gerador de VisualParams procedurais
│   │   │   ├── heroSprite.ts     # Resolução de sprite pixel art por core/build/rarity
│   │   │   ├── spriteRegistry.ts # AUTO-GERADO: mapa require() de sprites de herói
│   │   │   ├── backgroundRegistry.ts   # AUTO-GERADO: backgrounds de batalha (raridade × bioma)
│   │   │   ├── originBackgroundRegistry.ts  # Backgrounds por origem de herói
│   │   │   ├── bossRegistry.ts   # Sprites de chefes por bioma × fase
│   │   │   ├── enemyRegistry.ts  # Sprites de inimigos comuns
│   │   │   ├── elementRegistry.ts  # Ícones de elementos (afinidade)
│   │   │   └── affinityColors.ts # Mapa de cores por afinidade
│   │   ├── battle/
│   │   │   ├── types.ts
│   │   │   ├── engine.ts
│   │   │   ├── ai.ts
│   │   │   ├── boss.ts           # Chefes com 3 fases
│   │   │   └── rewards.ts
│   │   ├── progression/
│   │   │   ├── dungeon.ts        # Lógica pura de dungeons e biomas
│   │   │   ├── kael.ts
│   │   │   ├── legacy.ts
│   │   │   └── towers.ts         # Torres de Ressonância
│   │   └── world/
│   │       ├── types.ts
│   │       ├── mapData.ts        # Dados estáticos do mapa de Solum
│   │       ├── factionEvents.ts  # 14 eventos de facção
│   │       └── rules.ts
│   ├── components/
│   │   ├── hero/
│   │   │   ├── HeroCard.tsx      # Card retrato (portrait) com Skia + strips sobrepostos
│   │   │   ├── HeroSprite.tsx    # Canvas Skia de sprite pixel art com FilterMode.Nearest
│   │   │   ├── HeroVisual.tsx    # Compatibilidade (re-export para HeroVisualSkia)
│   │   │   ├── HeroVisualSkia.tsx  # Renderer Skia em 6 camadas (VisualParams procedurais)
│   │   │   └── HeroDetail.tsx
│   │   ├── battle/
│   │   │   ├── BattleField.tsx
│   │   │   ├── ActionWheel.tsx
│   │   │   ├── HeroSlot.tsx
│   │   │   └── EnemySlot.tsx
│   │   ├── fusion/
│   │   │   ├── AlchemicalCircle.tsx  # Círculo alquímico animado (Skia + Reanimated)
│   │   │   ├── FusionTable.tsx
│   │   │   └── FusionPreview.tsx
│   │   ├── transmutation/
│   │   │   ├── EcoDetail.tsx     # Sheet de detalhe de Eco
│   │   │   └── RosterManager.tsx # Seleção de time/banco
│   │   ├── world/
│   │   │   ├── BiomeBackground.tsx
│   │   │   ├── FactionEmblem.tsx
│   │   │   └── FactionEventModal.tsx
│   │   ├── narrative/
│   │   │   ├── OnboardingModal.tsx
│   │   │   ├── PrologueModal.tsx
│   │   │   └── LoreHint.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── ProgressBar.tsx
│   │       ├── TabIcon.tsx       # Ícones SVG da tab bar (mapa/almas/ecos/fundir/kael)
│   │       └── Ornaments.tsx
│   ├── store/
│   │   ├── gameStore.ts          # Player, heroes, ecos, roster, fusão, transmutação
│   │   ├── battleStore.ts
│   │   ├── dungeonStore.ts
│   │   ├── towerStore.ts
│   │   ├── worldStore.ts
│   │   ├── narrativeStore.ts
│   │   └── uiStore.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── constants.ts
│   │   └── theme.ts              # Tipografia: Rajdhani_700Bold/600SemiBold/500Medium
│   └── utils/
│       ├── random.ts
│       ├── math.ts
│       └── nameGenerator.ts      # generateName(genome, seed) → 1 palavra (prefix+root+suffix)
├── scripts/
│   └── update-hero-names.mjs    # Atualiza nomes no Supabase para formato de 1 palavra
├── supabase/
│   ├── migrations/               # 001–009 aplicadas
│   └── functions/
└── assets/
    ├── sprites/
    │   ├── heroes/               # [classe]/[build]/[tier]/[direction].png
    │   ├── backgrounds/          # [raridade]/[bioma].png (42 imagens)
    │   │   └── origens/          # [raridade]/[origem]/[variante].png
    │   ├── circles/              # Assets do Círculo de Transmutação
    │   └── elements/             # Ícones de afinidade
    ├── fonts/
    └── sounds/
```

---

## Banco de Dados — Schema Completo

### Convenções
- Todas as tabelas têm `id uuid DEFAULT gen_random_uuid()` como PK
- Todas as tabelas têm `created_at timestamptz DEFAULT now()`
- Dados de jogo que mudam frequentemente ficam em JSONB para flexibilidade
- Row Level Security (RLS) habilitado em todas as tabelas

### Migrations (executar nessa ordem)

#### Migration 001 — Usuários e Jogador
```sql
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
```

#### Migration 002 — Heróis
```sql
CREATE TABLE public.heroes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,

  -- Identidade
  name text NOT NULL,                    -- Nome gerado proceduralmente
  fusion_seed text NOT NULL,             -- Seed único desta fusão (timestamp + parent IDs)

  -- Genoma completo (ver doc 01_sistema_de_genes.md)
  genome jsonb NOT NULL,
  -- Estrutura esperada:
  -- {
  --   "essence": { "origin": "Abissal", "affinity": "Fogo", "core": "Destruidor" },
  --   "attributes": { "forca": 72, "ressonancia": 45, "resistencia": 60,
  --                   "agilidade": 55, "vontade": 38, "aura": 29 },
  --   "mutations": ["INVERSO"]   -- array vazio se sem mutações
  -- }

  -- Raridade calculada (ver doc 01 — seção Raridade Dinâmica)
  rarity text NOT NULL CHECK (rarity IN ('comum','incomum','raro','epico','lendario','unico')),

  -- Parâmetros visuais gerados (ver doc 02_sistema_visual.md)
  visual_params jsonb NOT NULL,
  -- Estrutura esperada:
  -- {
  --   "background": { "type": "abissal", "variant": 3 },
  --   "silhouette": { "core": "destruidor", "resistance_mod": 0.8 },
  --   "palette": { "primary": "#C0392B", "secondary": "#E67E22", "glow": "#FFEB3B", "saturation": 0.9 },
  --   "patterns": { "origin": "abissal", "density": 0.7 },
  --   "ornaments": ["blades", "spikes"],
  --   "aura": { "intensity": 0.6, "particle_type": "ember" },
  --   "micro_seed": "a3f9"   -- para micro-variações únicas
  -- }

  -- Habilidades geradas (ver doc 03_sistema_de_habilidades.md)
  skills jsonb NOT NULL,
  -- Estrutura esperada:
  -- {
  --   "actives": [
  --     { "id": "sk_01", "name": "Pulso Ardente", "trigger": "T01", "effect": "E02",
  --       "modifier": "M01", "condition": "C01", "cooldown_turns": 2,
  --       "evolution_nodes": { "10": "applied", "25": null, "40": null } },
  --     ...
  --   ],
  --   "ultimate": { "id": "sk_ult", "name": "...", ... },
  --   "passives": [ ... ],
  --   "emergent": [ ... ]   -- habilidades emergentes descobertas
  -- }

  -- Progressão individual
  level integer NOT NULL DEFAULT 1,
  xp integer NOT NULL DEFAULT 0,
  bond integer NOT NULL DEFAULT 0 CHECK (bond BETWEEN 0 AND 5),  -- 0-5 estrelas

  -- Estado de combate (não persistente entre batalhas, mas salvo entre andares)
  current_hp integer,                    -- NULL = hp máximo
  ultimate_charge integer NOT NULL DEFAULT 0 CHECK (ultimate_charge BETWEEN 0 AND 100),

  -- Linhagem
  parent_a_id uuid REFERENCES public.heroes(id) ON DELETE SET NULL,
  parent_b_id uuid REFERENCES public.heroes(id) ON DELETE SET NULL,
  generation integer NOT NULL DEFAULT 1,  -- quantas gerações desde fragmento original

  -- Status
  is_retired boolean NOT NULL DEFAULT false,
  retired_at timestamptz,
  echoes_generated integer,  -- Ecos gerados ao aposentar

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
```

#### Migration 003 — Fragmentos (pré-fusão)
```sql
CREATE TABLE public.fragments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,

  -- Genoma parcial (fragmentos têm genes incompletos — revelados progressivamente)
  partial_genome jsonb NOT NULL,
  -- Estrutura:
  -- {
  --   "revealed_genes": ["origin", "affinity"],   -- genes já identificados
  --   "hidden_genes": ["core", "forca", ...],     -- genes ainda ocultos
  --   "known_values": { "origin": "Celestial", "affinity": "Luz" }
  -- }

  -- Origem do fragmento
  source text NOT NULL CHECK (source IN ('dungeon_drop','event_reward','market_trade','fusion_byproduct')),
  biome_origin text,    -- qual bioma dropou este fragmento

  -- Visual provisório (antes da fusão)
  preview_visual jsonb NOT NULL,   -- versão simplificada do visual_params

  -- Raridade estimada (pode mudar após fusão revelar genes ocultos)
  estimated_rarity text CHECK (estimated_rarity IN ('comum','incomum','raro','epico','lendario','unico'))
);

CREATE INDEX fragments_player_id ON public.fragments(player_id);

ALTER TABLE public.fragments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fragments_own_data" ON public.fragments
  FOR ALL USING (auth.uid() = player_id);
```

#### Migration 004 — Batalhas e Dungeons
```sql
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
  -- Estrutura:
  -- {
  --   "active": ["hero_id_1", "hero_id_2", "hero_id_3"],
  --   "bench":  ["hero_id_4", "hero_id_5", "hero_id_6"]
  -- }

  -- Estado atual dos heróis (HP, ultimate charge)
  hero_states jsonb NOT NULL DEFAULT '{}',
  -- Estrutura: { "hero_id": { "hp": 450, "ultimate_charge": 30 }, ... }

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
  player_team jsonb NOT NULL,     -- estado dos heróis no início da batalha
  enemy_team jsonb NOT NULL,      -- inimigos gerados

  -- Resultado
  outcome text CHECK (outcome IN ('victory','defeat')),
  turns_taken integer,
  bonus_conditions_met jsonb DEFAULT '[]',  -- condições bônus cumpridas

  -- Dados para a IA coletiva
  analytics jsonb NOT NULL DEFAULT '{}',
  -- Estrutura:
  -- {
  --   "skills_used": { "skill_id": count },
  --   "swaps_performed": 2,
  --   "ultimates_used": 1,
  --   "abandon_point": null
  -- }
);

CREATE INDEX dungeon_sessions_player ON public.dungeon_sessions(player_id);
CREATE INDEX battle_logs_session ON public.battle_logs(session_id);
CREATE INDEX battle_logs_player ON public.battle_logs(player_id);

ALTER TABLE public.dungeon_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions_own" ON public.dungeon_sessions FOR ALL USING (auth.uid() = player_id);

ALTER TABLE public.battle_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs_own" ON public.battle_logs FOR ALL USING (auth.uid() = player_id);
```

#### Migration 005 — Descobertas e Conquistas
```sql
-- Registro de habilidades emergentes descobertas (globais)
CREATE TABLE public.emergent_discoveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),

  -- Identificador único da combinação emergente
  combination_key text NOT NULL UNIQUE,
  -- Gerado por: sorted([gene_a, gene_b, ...]).join('_')

  -- Primeiro a descobrir
  discovered_by uuid REFERENCES public.players(id) ON DELETE SET NULL,
  discovered_at timestamptz DEFAULT now(),

  -- Dados da habilidade emergente
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
  -- Estrutura: ver seção IA Coletiva no doc 07
);

-- Apenas admins podem escrever regras mundiais
ALTER TABLE public.world_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rules_read_all" ON public.world_rules FOR SELECT USING (true);
CREATE POLICY "rules_admin_write" ON public.world_rules FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

---

## Fase 0 — Fundação Técnica

**Objetivo:** projeto configurado, banco criado, autenticação funcionando, estrutura de pastas no lugar.

**Critério de conclusão:** um usuário consegue criar conta, fazer login, e ver uma tela inicial vazia mas funcional.

### Tarefas

#### 0.1 — Inicializar Projeto
```bash
npx create-expo-app fragmentos-de-alma --template blank-typescript
cd fragmentos-de-alma
npx expo install expo-router react-native-safe-area-context react-native-screens
# reanimated + gesture-handler exigiram --legacy-peer-deps (ver § Decisões D2)
npx expo install react-native-reanimated react-native-gesture-handler -- --legacy-peer-deps
npx expo install @shopify/react-native-skia -- --legacy-peer-deps
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
npx expo install zustand @tanstack/react-query
```

#### 0.2 — Configurar Supabase
1. Criar projeto em supabase.com
2. Executar todas as migrations acima em ordem
3. Criar arquivo `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

#### 0.3 — Configurar Constantes do Jogo
Criar `src/lib/constants.ts` com todas as constantes dos sistemas de design:

```typescript
// GENES — ver doc 01_sistema_de_genes.md
export const ORIGINS = ['Abissal', 'Celestial', 'Primordial', 'Forjada', 'Errante'] as const
export const AFFINITIES = ['Fogo', 'Água', 'Terra', 'Vento', 'Vazio', 'Luz', 'Sombra', 'Éter'] as const
export const CORES = ['Guardião', 'Destruidor', 'Arauto', 'Trickster', 'Invocador'] as const
export const ATTRIBUTE_GENES = ['forca', 'ressonancia', 'resistencia', 'agilidade', 'vontade', 'aura'] as const
export const MUTATION_GENES = ['INVERSO', 'ESPELHO', 'ANCESTRAL', 'CAOS', 'TRANSCENDENCIA'] as const

// RARIDADE — ver doc 01, seção Raridade Dinâmica
export const RARITY_THRESHOLDS = {
  comum: { maxSum: 300, maxMutations: 0 },
  incomum: { maxSum: 450, maxMutations: 1 },
  raro: { maxSum: 600 },
  epico: { maxSum: 750, minMutations: 2 },
  lendario: { minSum: 750 },
  unico: { special: true },
} as const

// FUSÃO — ver doc 01, seção Mecânica de Herança
export const FUSION_COSTS = {
  comum: 100,
  incomum: 300,
  raro: 800,
  epico: 2000,
  lendario: 5000,
} as const

export const FUSION_INHERITANCE = {
  dominanceChance: 0.6,
  dominantWeight: 0.7,
  recessiveWeight: 0.3,
  driftMax: 0.15,
  mutationPositiveChance: 0.05,
  mutationNegativeChance: 0.02,
  mutationRareChance: 0.005,
  // Mutações condicionais — gatilhadas por escolha do jogador (ver doc 01, D13)
  mutationInversoChance: 0.3, // afinidades opostas
  mutationEspelhoChance: 0.2, // mesma origem
} as const

// BATALHA — ver doc 06_sistema_de_batalha.md
export const BATTLE = {
  activeSlots: 3,
  benchSlots: 3,
  positions: ['frente', 'centro', 'fundo'] as const,
  maxSkillAnimationMs: 1500,
  hpRecoveryBetweenBattles: 0.3,
  ultimateChargeOnBench: 0.5,
} as const

// PROGRESSÃO — ver doc 04_loop_de_progressao.md
export const PROGRESSION = {
  heroMaxLevel: 50,
  kaelMaxLevel: 100,
  dailyDungeonAttempts: 3,
  badLuckPityThreshold: 10,
  streakMultiplierMax: 2.0,
} as const

// BIOMAS — ver doc 04, seção Médio Prazo
export const BIOMES = {
  cavernas_abismo: {
    id: 'cavernas_abismo',
    name: 'Cavernas do Abismo',
    faction: 'chama_negra',
    dominantOrigin: 'Abissal',
    unlockCondition: 'initial',
    floors: 10,
    corruption: { resistencia: 1.3, agilidade: 0.7 },
  },
  pináculo_celestial: {
    id: 'pináculo_celestial',
    name: 'Pináculo Celestial',
    faction: 'arquitetos_veu',
    dominantOrigin: 'Celestial',
    unlockCondition: '10_fusions',
    floors: 12,
    corruption: { ressonancia: 1.4, resistencia: 0.6 },
  },
  // ... demais biomas
} as const

// RECURSOS DE JOGADOR — ver doc 05_economia.md
export const STARTING_RESOURCES = {
  soul_fragments: 500,
  essence_crystals: 5,
  echoes: 0,
} as const

export const ECHO_REWARDS = {
  comum: { min: 1, max: 2 },
  incomum: { min: 3, max: 5 },
  raro: { min: 8, max: 12 },
  epico: { min: 20, max: 30 },
  lendario: { min: 60, max: 80 },
  unico: { min: 150, max: 200 },
} as const
```

---

## Fase 1 — O Núcleo Colecionável

**Objetivo:** jogador cria conta, ganha fragmentos iniciais, vê seus genes, e funde dois fragmentos para criar um herói. O resultado é visualmente único e comunicado com animação satisfatória.

**Critério de conclusão:** uma pessoa faz 10 fusões seguidas sem se entediar.

**Telas:** Login/Registro → Hub → Coleção → Detalhe de Fragmento → Fusão → Revelação de Herói → Detalhe de Herói

### 1.1 — Sistema de Genes (`src/systems/genes/`)

#### `types.ts`
```typescript
export type Origin = 'Abissal' | 'Celestial' | 'Primordial' | 'Forjada' | 'Errante'
export type Affinity = 'Fogo' | 'Água' | 'Terra' | 'Vento' | 'Vazio' | 'Luz' | 'Sombra' | 'Éter'
export type Core = 'Guardião' | 'Destruidor' | 'Arauto' | 'Trickster' | 'Invocador'
export type MutationGene = 'INVERSO' | 'ESPELHO' | 'ANCESTRAL' | 'CAOS' | 'TRANSCENDENCIA'
export type Rarity = 'comum' | 'incomum' | 'raro' | 'epico' | 'lendario' | 'unico'

export interface EssenceGenes {
  origin: Origin
  affinity: Affinity
  core: Core
  hybridAffinity?: string   // ex: "Cinza Ardente" quando Fogo + Sombra
}

export interface AttributeGenes {
  forca: number        // 1-100
  ressonancia: number  // 1-100
  resistencia: number  // 1-100
  agilidade: number    // 1-100
  vontade: number      // 1-100
  aura: number         // 1-100
}

export interface Genome {
  essence: EssenceGenes
  attributes: AttributeGenes
  mutations: MutationGene[]
}

export interface Hero {
  id: string
  playerId: string
  name: string
  fusionSeed: string
  genome: Genome
  rarity: Rarity
  visualParams: VisualParams    // ver types em sistema visual
  skills: HeroSkills            // ver types em sistema de habilidades
  level: number
  xp: number
  bond: number
  currentHp?: number
  ultimateCharge: number
  parentAId?: string
  parentBId?: string
  generation: number
  isRetired: boolean
}
```

#### `generator.ts`
```typescript
import { ORIGINS, AFFINITIES, CORES, ATTRIBUTE_GENES } from '@/lib/constants'
import type { Genome, Origin, Affinity, Core } from './types'

// Gera um genoma inicial para um fragmento (pré-fusão)
// Usado quando fragmentos são dropados em dungeons
export function generateFragmentGenome(biomeOrigin?: string): Genome {
  const origin = biomeOrigin
    ? weightedOriginForBiome(biomeOrigin)
    : randomFrom(ORIGINS)

  return {
    essence: {
      origin: origin as Origin,
      affinity: randomFrom(AFFINITIES) as Affinity,
      core: randomFrom(CORES) as Core,
    },
    attributes: {
      forca: randomInt(10, 60),
      ressonancia: randomInt(10, 60),
      resistencia: randomInt(10, 60),
      agilidade: randomInt(10, 60),
      vontade: randomInt(10, 60),
      aura: randomInt(10, 60),
    },
    mutations: [],
  }
}

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function weightedOriginForBiome(biomeId: string): Origin {
  // Biomas têm maior chance de dropar a Origin dominante
  // ver doc 04, tabela de biomas
  const biomeOriginMap: Record<string, Origin> = {
    cavernas_abismo: 'Abissal',
    pináculo_celestial: 'Celestial',
    floresta_primordial: 'Primordial',
    forja_eterna: 'Forjada',
  }
  const dominant = biomeOriginMap[biomeId]
  // 60% chance da origem dominante, 40% aleatório
  return Math.random() < 0.6 ? dominant : randomFrom(ORIGINS) as Origin
}
```

#### `fusion.ts`
```typescript
// Motor de fusão — ver doc 01, seção Mecânica de Herança
import { FUSION_INHERITANCE } from '@/lib/constants'
import type { Genome, EssenceGenes, AttributeGenes, MutationGene } from './types'

export interface FusionInput {
  parentA: Genome
  parentB: Genome
  seed: string              // timestamp + parentA.id + parentB.id
  injectedGene?: {          // gene injetado via Cristal de Essência
    type: 'essence' | 'attribute' | 'mutation'
    key: string
    value: string | number
  }
}

export interface FusionResult {
  genome: Genome
  inheritanceLog: InheritanceLog[]   // para mostrar ao jogador de onde cada gene veio
}

export interface InheritanceLog {
  gene: string
  source: 'parentA' | 'parentB' | 'mutation' | 'injected' | 'hybrid'
  originalValue: string | number
  finalValue: string | number
  wasDrift: boolean
}

export function fuseGenomes(input: FusionInput): FusionResult {
  const { parentA, parentB } = input
  const log: InheritanceLog[] = []

  // 1. Herdar genes de essência
  const essence = inheritEssenceGenes(parentA.essence, parentB.essence, log)

  // 2. Herdar genes de atributo
  const attributes = inheritAttributeGenes(parentA.attributes, parentB.attributes, log)

  // 3. Calcular mutações
  const mutations = calculateMutations(parentA.mutations, parentB.mutations, essence, attributes, log)

  // 4. Aplicar gene injetado se existir
  if (input.injectedGene) {
    applyInjectedGene(input.injectedGene, essence, attributes, mutations, log)
  }

  return {
    genome: { essence, attributes, mutations },
    inheritanceLog: log,
  }
}

function inheritEssenceGenes(
  a: EssenceGenes,
  b: EssenceGenes,
  log: InheritanceLog[]
): EssenceGenes {
  const { dominanceChance } = FUSION_INHERITANCE

  // Determina pai dominante (o que tem maior soma de atributos)
  // Para essência, dominância é sobre qual pai "lidera"
  const dominant = Math.random() < dominanceChance ? a : b
  const recessive = dominant === a ? b : a

  // 70% chance de herdar do dominante, 30% do recessivo
  const origin = Math.random() < 0.7 ? dominant.origin : recessive.origin
  const core = Math.random() < 0.7 ? dominant.core : recessive.core

  // Afinidade pode criar híbrido (5% de chance)
  let affinity = Math.random() < 0.7 ? dominant.affinity : recessive.affinity
  let hybridAffinity: string | undefined

  if (Math.random() < 0.05 && dominant.affinity !== recessive.affinity) {
    hybridAffinity = createHybridAffinity(dominant.affinity, recessive.affinity)
    log.push({ gene: 'affinity', source: 'hybrid',
      originalValue: `${dominant.affinity}+${recessive.affinity}`,
      finalValue: hybridAffinity, wasDrift: false })
  } else {
    log.push({ gene: 'affinity', source: Math.random() < 0.7 ? 'parentA' : 'parentB',
      originalValue: affinity, finalValue: affinity, wasDrift: false })
  }

  return { origin, affinity, core, hybridAffinity }
}

function inheritAttributeGenes(
  a: AttributeGenes,
  b: AttributeGenes,
  log: InheritanceLog[]
): AttributeGenes {
  const { dominantWeight, recessiveWeight, driftMax,
          mutationPositiveChance, mutationNegativeChance } = FUSION_INHERITANCE

  const result = {} as AttributeGenes

  for (const gene of ['forca','ressonancia','resistencia','agilidade','vontade','aura'] as const) {
    const valA = a[gene]
    const valB = b[gene]

    // Pai dominante tem o gene mais alto
    const dominant = valA >= valB ? valA : valB
    const recessive = dominant === valA ? valB : valA

    // Blend
    let value = dominant * dominantWeight + recessive * recessiveWeight

    // Drift ±15%
    const drift = (Math.random() * 2 - 1) * driftMax
    const wasDrift = Math.abs(drift) > 0.05
    value = Math.round(value * (1 + drift))
    value = Math.max(1, Math.min(100, value))  // clamp 1-100

    // Mutação de atributo
    const rand = Math.random()
    if (rand < mutationPositiveChance) {
      const bonus = randomInt(10, 25)
      value = Math.min(100, value + bonus)
    } else if (rand < mutationPositiveChance + mutationNegativeChance) {
      const penalty = randomInt(10, 20)
      value = Math.max(1, value - penalty)
    }

    result[gene] = value
    log.push({ gene, source: valA >= valB ? 'parentA' : 'parentB',
      originalValue: dominant, finalValue: value, wasDrift })
  }

  return result
}

function calculateMutations(
  mutationsA: MutationGene[],
  mutationsB: MutationGene[],
  essence: EssenceGenes,
  attributes: AttributeGenes,
  log: InheritanceLog[]
): MutationGene[] {
  const mutations: MutationGene[] = []
  const { mutationRareChance } = FUSION_INHERITANCE

  // Herda mutações existentes dos pais (50% de chance cada)
  for (const m of [...new Set([...mutationsA, ...mutationsB])]) {
    if (Math.random() < 0.5) mutations.push(m)
  }

  // Verifica condições para novas mutações
  // INVERSO: fusão de afinidades opostas
  const opposites: Record<string, string> = {
    'Fogo': 'Água', 'Água': 'Fogo',
    'Luz': 'Sombra', 'Sombra': 'Luz',
    'Terra': 'Vento', 'Vento': 'Terra',
  }
  // (verificar se pais tinham afinidades opostas — simplificado aqui)

  // Mutação completamente nova (0.5% de chance)
  if (Math.random() < mutationRareChance) {
    const allMutations: MutationGene[] = ['INVERSO','ESPELHO','ANCESTRAL','CAOS','TRANSCENDENCIA']
    const available = allMutations.filter(m => !mutations.includes(m))
    if (available.length > 0) {
      const newMutation = randomFrom(available)
      mutations.push(newMutation)
      log.push({ gene: 'mutation', source: 'mutation',
        originalValue: 'none', finalValue: newMutation, wasDrift: false })
    }
  }

  return mutations
}

function createHybridAffinity(a: string, b: string): string {
  const hybrids: Record<string, string> = {
    'Fogo_Sombra': 'Cinza Ardente',
    'Sombra_Fogo': 'Cinza Ardente',
    'Água_Vento': 'Tempestade',
    'Vento_Água': 'Tempestade',
    'Luz_Vazio': 'Eclipse',
    'Vazio_Luz': 'Eclipse',
    'Terra_Éter': 'Fóssil Astral',
    'Éter_Terra': 'Fóssil Astral',
  }
  return hybrids[`${a}_${b}`] || `${a}/${b}`
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
```

#### `rarity.ts`
```typescript
// Calcula raridade dinamicamente a partir do genoma
// ver doc 01, seção Raridade Dinâmica
import type { Genome, Rarity } from './types'

export function calculateRarity(genome: Genome): Rarity {
  const { attributes, mutations, essence } = genome
  const sum = Object.values(attributes).reduce((a, b) => a + b, 0)
  const mutationCount = mutations.length
  const hasHybrid = !!essence.hybridAffinity
  const hasTranscendence = mutations.includes('TRANSCENDENCIA')

  if (hasTranscendence) return 'lendario'
  if (sum > 750 || mutationCount >= 3) return 'lendario'
  if (sum > 600 || (mutationCount >= 2 && hasHybrid)) return 'epico'
  if (sum > 450 || hasHybrid || mutationCount >= 2) return 'raro'
  if (sum > 300 || mutationCount >= 1) return 'incomum'
  return 'comum'
}

export function getRarityColor(rarity: Rarity): string {
  const colors: Record<Rarity, string> = {
    comum: '#9E9E9E',
    incomum: '#4CAF50',
    raro: '#2196F3',
    epico: '#9C27B0',
    lendario: '#FF9800',
    unico: '#F44336',
  }
  return colors[rarity]
}
```

### 1.2 — Sistema Visual (`src/systems/visual/`)

#### `generator.ts`
```typescript
// Gera parâmetros visuais a partir do genoma
// ver doc 02_sistema_visual.md — todas as 6 camadas
import type { Genome } from '../genes/types'

export interface VisualParams {
  background: BackgroundParams
  silhouette: SilhouetteParams
  palette: PaletteParams
  patterns: PatternParams
  ornaments: string[]
  aura: AuraParams
  microSeed: string    // para micro-variações únicas — gerado da fusionSeed
}

export function generateVisualParams(genome: Genome, fusionSeed: string): VisualParams {
  const { essence, attributes, mutations } = genome

  return {
    background: generateBackground(essence.origin),
    silhouette: generateSilhouette(essence.core, attributes.resistencia),
    palette: generatePalette(essence.affinity, attributes.ressonancia),
    patterns: generatePatterns(essence.origin, attributes.vontade),
    ornaments: generateOrnaments(essence.core, mutations),
    aura: generateAura(attributes.aura, essence.affinity),
    microSeed: fusionSeed.slice(-4),  // últimos 4 chars da seed como micro-variação
  }
}

// Camada 1 — Fundo
function generateBackground(origin: string): BackgroundParams {
  const backgrounds: Record<string, BackgroundParams> = {
    'Abissal': { type: 'abissal', primaryColor: '#0A0A1A', particleColor: '#2D1B69', particleDirection: 'down' },
    'Celestial': { type: 'celestial', primaryColor: '#E8F4FD', particleColor: '#FFF9C4', particleDirection: 'up' },
    'Primordial': { type: 'primordial', primaryColor: '#1B2A1B', particleColor: '#4CAF50', particleDirection: 'radial' },
    'Forjada': { type: 'forjada', primaryColor: '#1A1A1A', particleColor: '#FF5722', particleDirection: 'up' },
    'Errante': { type: 'errante', primaryColor: '#0D0D2B', particleColor: '#FFFFFF', particleDirection: 'drift' },
  }
  return backgrounds[origin] || backgrounds['Errante']
}

// Camada 3 — Paleta de cores
function generatePalette(affinity: string, ressonancia: number): PaletteParams {
  const basePalettes: Record<string, { primary: string; secondary: string; glow: string }> = {
    'Fogo': { primary: '#C0392B', secondary: '#E67E22', glow: '#FFEB3B' },
    'Água': { primary: '#1A6E8E', secondary: '#2980B9', glow: '#AEE6FF' },
    'Terra': { primary: '#5D4037', secondary: '#8D6E63', glow: '#A5D6A7' },
    'Vento': { primary: '#80CBC4', secondary: '#B2EBF2', glow: '#FFFFFF' },
    'Vazio': { primary: '#1A1A2E', secondary: '#6A0572', glow: '#E040FB' },
    'Luz': { primary: '#FFF9C4', secondary: '#FDD835', glow: '#FFFFFF' },
    'Sombra': { primary: '#212121', secondary: '#4A148C', glow: '#9C27B0' },
    'Éter': { primary: '#E8EAF6', secondary: '#5C6BC0', glow: '#82B1FF' },
    // Híbridos
    'Cinza Ardente': { primary: '#1A0A0A', secondary: '#8B0000', glow: '#FF4500' },
    'Tempestade': { primary: '#1A2A4A', secondary: '#00BCD4', glow: '#E0F7FA' },
    'Eclipse': { primary: '#FFD700', secondary: '#000000', glow: '#FFD700' },
    'Fóssil Astral': { primary: '#4E342E', secondary: '#7986CB', glow: '#C5CAE9' },
  }

  const base = basePalettes[affinity] || basePalettes['Éter']

  // Saturação baseada em RESSONÂNCIA
  const saturation = ressonancia <= 30 ? 0.4 : ressonancia <= 60 ? 0.7 : 1.0

  return { ...base, saturation }
}

// Camada 2 — Silhueta
function generateSilhouette(core: string, resistencia: number): SilhouetteParams {
  const bulkMod = resistencia <= 30 ? 'light' : resistencia <= 60 ? 'normal' : 'heavy'
  return { coreType: core.toLowerCase(), bulkModifier: bulkMod }
}

// Camada 4 — Padrões
function generatePatterns(origin: string, vontade: number): PatternParams {
  const density = vontade <= 30 ? 'sparse' : vontade <= 60 ? 'medium' : 'dense'
  return { originType: origin.toLowerCase(), density }
}

// Camada 5 — Ornamentos
function generateOrnaments(core: string, mutations: string[]): string[] {
  const baseOrnaments: Record<string, string[]> = {
    'Guardião': ['shield_fragments', 'stone_wall'],
    'Destruidor': ['blades', 'spikes', 'claws'],
    'Arauto': ['veils', 'tentacles'],
    'Trickster': ['multiple_eyes', 'mirror_orbit'],
    'Invocador': ['floating_runes', 'magic_circles'],
  }

  const ornaments = [...(baseOrnaments[core] || [])]

  // Ornamentos de mutação — ver doc 02, seção Camada 5
  const mutationOrnaments: Record<string, string> = {
    'INVERSO': 'inner_fissure',
    'ESPELHO': 'displaced_shadow',
    'ANCESTRAL': 'ancestral_marks',
    'CAOS': 'floating_fragments',
    'TRANSCENDENCIA': 'structural_halo',
  }

  for (const mutation of mutations) {
    if (mutationOrnaments[mutation]) {
      ornaments.push(mutationOrnaments[mutation])
    }
  }

  return ornaments
}

// Camada 6 — Aura
function generateAura(aura: number, affinity: string): AuraParams {
  if (aura <= 20) return { intensity: 'none', particleType: 'none' }
  if (aura <= 40) return { intensity: 'static_halo', particleType: affinity.toLowerCase() }
  if (aura <= 60) return { intensity: 'slow_particles', particleType: affinity.toLowerCase() }
  if (aura <= 80) return { intensity: 'ambient_distortion', particleType: affinity.toLowerCase() }
  return { intensity: 'full_field', particleType: affinity.toLowerCase() }
}

// Tipos de suporte
interface BackgroundParams { type: string; primaryColor: string; particleColor: string; particleDirection: string }
interface SilhouetteParams { coreType: string; bulkModifier: string }
interface PaletteParams { primary: string; secondary: string; glow: string; saturation: number }
interface PatternParams { originType: string; density: string }
interface AuraParams { intensity: string; particleType: string }
```

### 1.3 — Gerador de Nomes (`src/utils/nameGenerator.ts`)
```typescript
// ver doc 02, seção Geração de Nome
const prefixes: Record<string, string[]> = {
  'Abissal': ['Neth', 'Vex', 'Kor', 'Zal', 'Drak'],
  'Celestial': ['Lyra', 'Sol', 'Aen', 'Vel', 'Ith'],
  'Primordial': ['Korum', 'Dur', 'Gath', 'Morn', 'Brul'],
  'Forjada': ['Vel', 'Sira', 'Aeth', 'Keld', 'Vorn'],
  'Errante': ['Shan', 'Mir', 'Tal', 'Wen', 'Fael'],
}

const roots: Record<string, string[]> = {
  'Guardião': ['kara', 'dur', 'eth', 'orn', 'ast'],
  'Destruidor': ['vex', 'rak', 'torn', 'brak', 'grel'],
  'Arauto': ['aen', 'iel', 'sera', 'anth', 'wen'],
  'Trickster': ['ix', 'zara', 'mith', 'kel', 'fyn'],
  'Invocador': ['um', 'ara', 'shen', 'vor', 'eld'],
}

const suffixes: Record<string, string[]> = {
  'Fogo': ['nar', 'bra', 'sol', 'ign', 'vur'],
  'Água': ['sel', 'mar', 'wen', 'thal', 'iss'],
  'Terra': ['ath', 'dur', 'gond', 'mur', 'eth'],
  'Vento': ['ael', 'wyn', 'sir', 'ver', 'ith'],
  'Vazio': ['nul', 'vex', 'kor', 'void', 'eks'],
  'Luz': ['aen', 'sol', 'iel', 'lith', 'ven'],
  'Sombra': ['vel', 'umbr', 'nox', 'shad', 'grim'],
  'Éter': ['aun', 'eth', 'ium', 'sel', 'aen'],
}

const mutationEpithets: Record<string, string[]> = {
  'TRANSCENDENCIA': ['o Eterno', 'a Sem-Fim', 'o Além', 'a Infinita'],
  'CAOS': ['o Partido', 'a Fraturada', 'o Rompido', 'a Dispersa'],
  'ANCESTRAL': ['Portador do Legado', 'Guardiã da Memória'],
  'INVERSO': ['o Invertido', 'a Oposta'],
  'ESPELHO': ['o Duplo', 'a Reflexa'],
}

export function generateHeroName(genome: { essence: { origin: string; core: string; affinity: string }; mutations: string[] }): string {
  const { origin, core, affinity } = genome.essence

  const prefix = randomFrom(prefixes[origin] || prefixes['Errante'])
  const root = randomFrom(roots[core] || roots['Arauto'])
  const suffix = randomFrom(suffixes[affinity] || suffixes['Éter'])

  let name = `${prefix}'${root} ${capitalize(suffix)}`

  // Adiciona epíteto de mutação se existir
  if (genome.mutations.length > 0) {
    const mutation = genome.mutations[0]
    const epithets = mutationEpithets[mutation]
    if (epithets) {
      name += `, ${randomFrom(epithets)}`
    }
  }

  return name
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
```

---

## Fase 2 — O Núcleo de Batalha

**Objetivo:** batalha por turnos funcionando com 3 heróis ativos + banco de 3. Inimigos gerados proceduralmente. Recompensas básicas após vitória.

**Critério de conclusão:** sessão de 15 minutos se sente completa e satisfatória.

### 2.1 — Motor de Batalha (`src/systems/battle/engine.ts`)

O motor de batalha é **puramente funcional** — não tem estado interno, recebe o estado atual e retorna o próximo estado. Isso facilita testes e evita bugs de estado.

```typescript
// ver doc 06_sistema_de_batalha.md — estrutura completa
import type { Hero } from '../genes/types'

export type BattlePosition = 'frente' | 'centro' | 'fundo'
export type ActionType = 'skill' | 'ultimate' | 'swap' | 'defend'

export interface BattleHero extends Hero {
  position: BattlePosition
  currentHp: number
  maxHp: number
  ultimateCharge: number   // 0-100
  activeSkillCooldowns: Record<string, number>  // skillId -> turnos restantes
  statusEffects: StatusEffect[]
}

export interface StatusEffect {
  id: string
  type: 'buff' | 'debuff'
  stat: string
  modifier: number
  turnsRemaining: number
}

export interface BattleState {
  id: string
  turn: number
  phase: 'player_turn' | 'enemy_turn' | 'victory' | 'defeat'

  // Times
  playerActive: [BattleHero, BattleHero, BattleHero]
  playerBench: [BattleHero | null, BattleHero | null, BattleHero | null]
  enemies: BattleHero[]

  // Ordem de ação (calculada por AGILIDADE)
  actionOrder: string[]      // array de IDs na ordem de ação
  currentActorId: string

  // Log de batalha para animações
  actionLog: BattleAction[]
}

export interface BattleAction {
  actorId: string
  type: ActionType
  targetIds: string[]
  skillId?: string
  swapWithId?: string
  results: ActionResult[]
}

export interface ActionResult {
  targetId: string
  hpChange: number        // negativo = dano, positivo = cura
  ultimateCharge?: number
  statusEffect?: StatusEffect
  isKill?: boolean
  isCritical?: boolean
}

// Processa uma ação e retorna o novo estado
export function processAction(state: BattleState, action: BattleAction): BattleState {
  const newState = deepClone(state)

  switch (action.type) {
    case 'skill':
      return processSkillAction(newState, action)
    case 'ultimate':
      return processUltimateAction(newState, action)
    case 'swap':
      return processSwapAction(newState, action)
    case 'defend':
      return processDefendAction(newState, action)
  }
}

function processSwapAction(state: BattleState, action: BattleAction): BattleState {
  // ver doc 06 — Banco de Reserva, Regras de troca
  // A troca consume a ação do turno
  // O herói que entra assume a posição do que saiu
  // HP é preservado em ambos os lados
  const activeIdx = state.playerActive.findIndex(h => h?.id === action.actorId)
  const benchIdx = state.playerBench.findIndex(h => h?.id === action.swapWithId)

  if (activeIdx === -1 || benchIdx === -1) return state

  const temp = state.playerActive[activeIdx]
  state.playerActive[activeIdx] = state.playerBench[benchIdx]!
  state.playerBench[benchIdx] = temp

  // Herói no banco carrega ultimate a 50% — ver doc 06
  // Já foi aplicado no turno anterior, não precisa fazer nada aqui

  return advanceTurn(state)
}

function calculateActionOrder(state: BattleState): string[] {
  const allCombatants = [
    ...state.playerActive.filter(Boolean),
    ...state.enemies,
  ]
  return allCombatants
    .sort((a, b) => b.genome.attributes.agilidade - a.genome.attributes.agilidade)
    .map(c => c.id)
}

function advanceTurn(state: BattleState): BattleState {
  // Encontra o próximo ator na ordem
  const currentIdx = state.actionOrder.indexOf(state.currentActorId)
  const nextIdx = (currentIdx + 1) % state.actionOrder.length

  if (nextIdx === 0) state.turn++
  state.currentActorId = state.actionOrder[nextIdx]

  // Reduz cooldowns de habilidades do ator que acabou de agir
  // Carrega ultimate dos heróis no banco (50% da taxa)
  for (const benchHero of state.playerBench) {
    if (benchHero) {
      benchHero.ultimateCharge = Math.min(100,
        benchHero.ultimateCharge + calculateUltimateChargeRate(benchHero) * 0.5)
    }
  }

  // Verifica condições de vitória/derrota
  const allEnemiesDead = state.enemies.every(e => e.currentHp <= 0)
  const allPlayersDead = state.playerActive.every(h => !h || h.currentHp <= 0)
    && state.playerBench.every(h => !h || h.currentHp <= 0)

  if (allEnemiesDead) state.phase = 'victory'
  if (allPlayersDead) state.phase = 'defeat'

  return state
}

function calculateUltimateChargeRate(hero: BattleHero): number {
  // Baseado em RESSONÂNCIA — ver doc 06
  return hero.genome.attributes.ressonancia * 0.1
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// Funções a implementar na Fase 2:
// processSkillAction — resolver efeito de habilidade ativa
// processUltimateAction — resolver ultimate
// processDefendAction — aplicar buff de defesa
// generateEnemyAction — IA inimiga básica (ver ai.ts)
```

### 2.2 — IA de Inimigos (`src/systems/battle/ai.ts`)
```typescript
// Comportamento de IA por NÚCLEO — ver doc 07, seção Tipos de Inimigo por Papel
import type { BattleState, BattleAction, BattleHero } from './engine'

export function generateEnemyAction(state: BattleState, enemy: BattleHero): BattleAction {
  const core = enemy.genome.essence.core

  switch (core) {
    case 'Guardião':
      return guardianAI(state, enemy)
    case 'Destruidor':
      return destroyerAI(state, enemy)
    case 'Arauto':
      return heraldAI(state, enemy)
    case 'Trickster':
      return tricksterAI(state, enemy)
    case 'Invocador':
      return invokerAI(state, enemy)
    default:
      return basicAttackAI(state, enemy)
  }
}

function destroyerAI(state: BattleState, enemy: BattleHero): BattleAction {
  // Sempre ataca o herói com menor HP
  // ver doc 07: "Sempre ataca o herói com menor HP; ignora heróis de suporte"
  const target = state.playerActive
    .filter(Boolean)
    .sort((a, b) => a.currentHp - b.currentHp)[0]

  return {
    actorId: enemy.id,
    type: 'skill',
    targetIds: [target.id],
    skillId: enemy.skills.actives[0]?.id,
    results: [],   // calculado pelo engine ao processar
  }
}

function guardianAI(state: BattleState, enemy: BattleHero): BattleAction {
  // Prioriza atacar herói na Frente
  const frontHero = state.playerActive[0]  // índice 0 = frente
  return {
    actorId: enemy.id,
    type: 'skill',
    targetIds: [frontHero.id],
    skillId: enemy.skills.actives[0]?.id,
    results: [],
  }
}

// Implementar: heraldAI, tricksterAI, invokerAI, basicAttackAI
```

---

## Fase 3 — O Núcleo de Progressão

**Objetivo:** loop completo funcionando. Dungeon → fragmentos → fusão → batalha → recompensa → dungeon mais difícil. Primeiro bioma completo. Primeiro chefe com 3 fases. Passivas de Kael até nível 30.

**Critério de conclusão:** jogador volta no dia seguinte sem ser notificado.

### 3.1 — Sistema de Recompensas (`src/systems/battle/rewards.ts`)
```typescript
// ver doc 07, Parte 4 — Sistema de Recompensas
import type { BattleState } from './engine'
import { ECHO_REWARDS } from '@/lib/constants'

export interface RewardPackage {
  soulFragments: number
  essenceCrystals: number
  newFragments: GeneratedFragment[]
  cosmetics: string[]
  bonusConditionsMet: string[]
}

export function calculateRewards(
  state: BattleState,
  floor: number,
  isBoss: boolean,
  recentRewards: string[],     // últimas 5 recompensas — anti-repetição
  badLuckCounter: number       // contador de azar acumulado
): RewardPackage {

  const base = calculateBaseRewards(floor, isBoss)
  const bonuses = calculateBonusConditions(state)
  const antiRepeat = applyAntiRepetition(base, recentRewards)
  const pity = applyPitySystem(antiRepeat, badLuckCounter)

  return {
    ...pity,
    bonusConditionsMet: bonuses.conditionsMet,
  }
}

function calculateBaseRewards(floor: number, isBoss: boolean) {
  // ver doc 07, Tabela de Recompensa por Tipo de Batalha
  const fragmentMultiplier = isBoss ? 3 : 1
  const baseFragments = 50 + (floor * 25)

  return {
    soulFragments: baseFragments * fragmentMultiplier,
    essenceCrystals: isBoss ? 1 : 0,
    newFragments: isBoss ? [generateRareFragment()] : [],
    cosmetics: [],
  }
}

function calculateBonusConditions(state: BattleState) {
  // ver doc 07, Recompensas por Condição Especial
  const conditionsMet: string[] = []
  const bonuses = { soulFragments: 0, essenceCrystals: 0 }

  // Vencer sem perder nenhum herói: +50% fragmentos
  const noHeroLost = state.playerActive.every(h => h && h.currentHp > 0)
    && state.playerBench.every(h => !h || h.currentHp > 0)
  if (noHeroLost) {
    conditionsMet.push('no_hero_lost')
    bonuses.soulFragments += 0.5
  }

  // Vencer sem usar Ultimate: +1 Cristal
  const noUltimateUsed = !state.actionLog.some(a => a.type === 'ultimate' && a.actorId.startsWith('player_'))
  if (noUltimateUsed) {
    conditionsMet.push('no_ultimate_used')
    bonuses.essenceCrystals += 1
  }

  return { conditionsMet, bonuses }
}

function applyPitySystem(rewards: any, badLuckCounter: number) {
  // ver doc 04 — Anti-frustração
  // Após 10 batalhas sem recompensa rara, garante pelo menos 1 incomum
  if (badLuckCounter >= 10 && rewards.newFragments.length === 0) {
    rewards.newFragments.push(generateFragmentWithMinRarity('incomum'))
  }
  return rewards
}

function applyAntiRepetition(rewards: any, recentRewards: string[]) {
  // ver doc 07 — Anti-Repetição
  // Evita repetir cosméticos das últimas 5 recompensas
  if (rewards.cosmetics) {
    rewards.cosmetics = rewards.cosmetics.filter((c: string) => !recentRewards.includes(c))
  }
  return rewards
}

function generateRareFragment(): GeneratedFragment {
  // placeholder — implementar na Fase 3
  return { estimatedRarity: 'raro', biomeOrigin: 'cavernas_abismo' }
}

function generateFragmentWithMinRarity(minRarity: string): GeneratedFragment {
  return { estimatedRarity: minRarity, biomeOrigin: 'cavernas_abismo' }
}

interface GeneratedFragment {
  estimatedRarity: string
  biomeOrigin: string
}
```

### 3.2 — Progressão de Kael (`src/systems/progression/kael.ts`)
```typescript
// ver doc 08, seção Progressão do Jogador — Passivas de Kael
export interface KaelMemory {
  level: number
  name: string
  description: string
  loreFragment: string      // fragmento de lore do primeiro Fragmentador
  effect: KaelPassiveEffect
}

export interface KaelPassiveEffect {
  type: 'fusion_mutation_bonus' | 'opposite_affinity_bonus' | 'damage_absorption'
       | 'ancestral_gene_chance' | 'ultimate_charge_bonus' | 'enemy_fragment_chance'
       | 'mixed_faction_bonus' | 'revive_once_per_dungeon' | 'emergent_skill_bonus'
       | 'final_memory'
  value: number
}

export const KAEL_MEMORIES: KaelMemory[] = [
  {
    level: 10,
    name: 'Imperfeição como Caminho',
    description: '+5% de chance de mutação positiva em fusões',
    loreFragment: '"Aprendi que a imperfeição é o único caminho para algo novo."',
    effect: { type: 'fusion_mutation_bonus', value: 0.05 }
  },
  {
    level: 20,
    name: 'Os Opostos se Definem',
    description: 'Heróis com afinidades opostas no time ganham +10% de dano',
    loreFragment: '"Os opostos não se anulam. Eles se definem."',
    effect: { type: 'opposite_affinity_bonus', value: 0.10 }
  },
  {
    level: 30,
    name: 'Fragmentação Voluntária',
    description: 'Uma vez por batalha, absorve 50% do dano destinado a um aliado',
    loreFragment: '"Fragmentar-me foi o único ato que fez sentido quando não havia mais nada a perder."',
    effect: { type: 'damage_absorption', value: 0.50 }
  },
  // ... continuar até nível 100 conforme doc 08
]

export function getUnlockedMemories(kaelLevel: number): KaelMemory[] {
  return KAEL_MEMORIES.filter(m => m.level <= kaelLevel)
}

export function calculateKaelXpForLevel(level: number): number {
  // Curva logarítmica — progressão mais rápida no início
  return Math.floor(100 * Math.pow(level, 1.5))
}
```

---

## Fase 4 — MVP Publicável

**Objetivo:** segundo bioma, sistema de facções básico, narrativa de Camada 1, onboarding, polimento de UX, pronto para grupo fechado de teste.

### 4.1 — Checklist de MVP Publicável

#### Funcionalidades obrigatórias
- [ ] Autenticação completa (login, registro, recuperação de senha)
- [ ] Onboarding de 3 telas explicando fusão, batalha e progressão
- [ ] 2 biomas completos com chefe
- [ ] Sistema de facções com reputação básica
- [ ] Narrativa de Camada 1 completa (prólogo + arco do primeiro bioma)
- [ ] Progressão de Kael até nível 30
- [ ] Sistema de recompensas completo
- [ ] Coleção de heróis com galeria e detalhe
- [ ] Mercado básico (troca de fragmentos entre jogadores)
- [ ] Configurações (som, notificações, nome de Kael)
- [ ] Mapa de Solum com React Native Skia (ver doc 11)
- [ ] Estados de corrupção e progresso por território no mapa

#### Performance obrigatória
- [ ] Tempo de carregamento inicial < 3 segundos
- [ ] Batalha sem lag em dispositivos de 3 anos atrás
- [ ] Fusão com animação de revelação < 2 segundos
- [ ] Sem crashes em sessão de 30 minutos

#### UX obrigatória
- [ ] Todo fluxo principal navegável com uma mão
- [ ] Roda de ações testada em telas de 5.5" a 6.7"
- [ ] Feedback tátil (vibração) em ações de batalha
- [ ] Animação satisfatória de revelação pós-fusão
- [ ] Tutorial contextual (não bloqueante) para cada sistema novo

#### Antes de publicar
- [ ] Teste em iOS (TestFlight) e Android (Play Console beta)
- [ ] Revisão de acessibilidade (tamanhos de fonte, contraste)
- [ ] Política de privacidade (obrigatório para lojas)
- [ ] Ícone e screenshots para loja

---

## Convenções de Código para o Claude Code

### TypeScript
- Sempre usar tipos explícitos — nunca `any` exceto em casos documentados
- Interfaces para objetos de dados, types para unions
- Funções puras sempre que possível (facilita testes)
- Exportar tipos junto com as implementações

### Nomenclatura
- Arquivos: `camelCase.ts` para utilitários, `PascalCase.tsx` para componentes
- Variáveis e funções: `camelCase`
- Constantes globais: `UPPER_SNAKE_CASE`
- Tipos e interfaces: `PascalCase`
- IDs de banco: sempre `uuid`, nunca inteiros

### Estado
- Estado local de componente: `useState` / `useReducer`
- Estado global do jogo: Zustand (`gameStore`)
- Estado de servidor: TanStack Query (cache automático)
- Estado de batalha: Zustand (`battleStore`) — limpo ao sair da batalha

### Tratamento de Erros
- Toda chamada ao Supabase deve ter try/catch
- Erros de rede devem mostrar feedback visual ao usuário (nunca silenciar)
- Erros de sistema de jogo (fusão, batalha) devem ser logados mas não crashar o app

### Testes
- Sistemas de jogo (genes, fusão, batalha) devem ter testes unitários
- Componentes críticos (roda de ações, fusão) devem ter testes de integração
- Rodar `jest` antes de qualquer commit em sistemas de jogo

---

## Ordem de Implementação Recomendada

```
— FASE 0: FUNDAÇÃO —
Passo 1  → Inicializar projeto Expo + configurar Supabase
Passo 2  → Executar migrations do banco (todas as migrations deste doc)
Passo 3  → Configurar theme.ts (doc 10) e constants.ts

— FASE 1: NÚCLEO COLECIONÁVEL —
Passo 4  → Implementar types de genes (src/systems/genes/types.ts)
Passo 5  → Implementar gerador de genoma (src/systems/genes/generator.ts)
Passo 6  → Implementar motor de fusão (src/systems/genes/fusion.ts)
Passo 7  → Implementar calculador de raridade (src/systems/genes/rarity.ts)
Passo 8  → Implementar gerador visual por camadas (src/systems/visual/generator.ts) — doc 02
Passo 9  → Implementar gerador de nomes (src/utils/nameGenerator.ts)
Passo 10 → Implementar gerador de habilidades (src/systems/skills/generator.ts) — doc 03
Passo 11 → Telas: Login → Registro → Coleção → Detalhe → Fusão → Revelação

— FASE 2: NÚCLEO DE BATALHA —
Passo 12 → Implementar motor de batalha funcional (src/systems/battle/engine.ts) — doc 06
Passo 13 → Implementar IA de inimigos por NÚCLEO (src/systems/battle/ai.ts) — doc 07
Passo 14 → Implementar sistema de recompensas (src/systems/battle/rewards.ts) — doc 07
Passo 15 → Tela de batalha: roda de ações, banco de reserva, HUD

— FASE 3: NÚCLEO DE PROGRESSÃO —
Passo 16 → Implementar dungeons e andares com 3 camadas (app/game/dungeon/)
Passo 17 → Implementar progressão de Kael e Memórias (src/systems/progression/kael.ts)
Passo 18 → Implementar chefe com 3 fases (src/systems/battle/boss.ts)
Passo 19 → Implementar legado e Ecos (src/systems/progression/legacy.ts)

— FASE 4: MVP PUBLICÁVEL —
Passo 20 → Mapa de Solum com React Native Skia (src/components/map/) — doc 11
Passo 21 → Estados do mapa: corrupção, progresso, fronteiras políticas
Passo 22 → Segundo bioma + sistema de facções com reputação
Passo 23 → Narrativa Camada 1 + onboarding contextual
Passo 24 → Polimento visual (doc 10), testes, checklist de publicação

— PÓS-MVP: ENDGAME (doc 12) —
Passo 25 → Torres de Ressonância (src/systems/endgame/towers.ts)
Passo 26 → Conflito de Facções — PvP assíncrono (src/systems/endgame/factionwar.ts)
Passo 27 → Fragmentos Ancestrais (src/systems/endgame/ancestral.ts)
Passo 28 → Ciclos de Solum — sistema de temporadas (src/systems/endgame/cycles.ts)
Passo 29 → Batalha Coletiva — evento de fim de Ciclo (src/systems/endgame/collective.ts)
```

---
*Próxima revisão: adicionar specs de Edge Functions para IA coletiva, mercado entre jogadores e sistema de Ciclos*
