# 📖 FRAGMENTOS DE ALMA — Documento Mestre
*Ponto de entrada para o Claude Code*
*Versão 0.1*

---

## O Que É Este Projeto

**Fragmentos de Alma** é um jogo mobile RPG colecionável para iOS e Android. O conceito central é um sistema de fusão procedural de heróis: cada herói é gerado a partir de um genoma único, e fundir dois heróis produz um terceiro que nunca existiu antes e nunca existirá da mesma forma em nenhum outro dispositivo do mundo.

O jogo é jogável com uma mão, na vertical, com batalha por turnos. Tem mundo próprio (Solum), narrativa em camadas, sistema de facções com impacto político, e uma economia desenhada para ser justa com jogadores gratuitos.

---

## Como Ler Este Projeto

Este projeto tem **13 documentos de design** e **1 documento técnico** (este). Cada documento cobre um sistema. Eles foram escritos em ordem de criação e se referem uns aos outros.

**Regra fundamental:** antes de implementar qualquer sistema, leia o documento correspondente. Os documentos contêm decisões de design que não são óbvias e que afetam a implementação.

---

## Índice de Documentos

### Documentos de Design de Sistemas

| # | Arquivo | Sistema | Ler antes de... |
|---|---|---|---|
| 01 | `01_sistema_de_genes.md` | Genoma, herança, raridade dinâmica | Qualquer coisa |
| 02 | `02_sistema_visual.md` | Geração visual procedural em 6 camadas | Renderizar heróis |
| 03 | `03_sistema_de_habilidades.md` | Anatomia de habilidades, banco de componentes, emergência | Sistema de batalha |
| 04 | `04_loop_de_progressao.md` | Velocidades de progressão, biomas, legado, economia de energia | Sistema de dungeons |
| 05 | `05_economia.md` | Três recursos, monetização, mercado entre jogadores | Qualquer moeda ou loja |
| 06 | `06_sistema_de_batalha.md` | Turnos, posições, roda de ações, banco de reserva | Tela de batalha |
| 07 | `07_inimigos_chefes_recompensas.md` | IA coletiva, inimigos procedurais, chefes com 3 fases, drops | Sistema de inimigos |
| 08 | `08_narrativa_lore_mundo.md` | Mundo de Solum, 7 facções, narrativa em camadas, plot twist | Qualquer texto do jogo |
| 09 | `09_roadmap_mvp.md` | Stack técnica, schema de banco, código de referência, fases | Implementar qualquer coisa |
| 10 | `10_direcao_de_arte.md` | Paleta, tipografia, linguagem visual, componentes, animações | Qualquer elemento visual |
| 11 | `11_mapa_de_solum.md` | Mapa vivo, navegação, estados, territórios, implementação | Tela principal / Hub |
| 12 | `12_endgame.md` | Torres de Ressonância, PvP, Fragmentos Ancestrais, Ciclos | Sistemas de endgame |
| 13 | `13_transmutacao.md` | Círculo de Transmutação: Criar Eco, Extrair Cristais, Transmutar Heróis | Antes de implementar transmutação |
| 14 | `14_assets_pixellab.md` | Mapa de produção de arte: PixelLab (raster) vs Skia (procedural), contagem e pipeline | Antes de gerar/integrar qualquer arte |

### Ordem de Leitura Recomendada

Se estiver começando do zero, leia nessa ordem:
```
09 → 01 → 02 → 03 → 06 → 07 → 04 → 05 → 08 → 10 → 11 → 12 → 13
```
*(técnico primeiro, depois sistemas de jogo, depois narrativa, arte e endgame)*

Se estiver implementando um sistema específico, use a tabela acima para saber quais documentos ler.

---

## Visão Geral Técnica

### Stack
```
Frontend:  React Native + Expo SDK 51+
Navegação: Expo Router
Animações: React Native Reanimated 3
Estado:    Zustand + TanStack Query
Backend:   Supabase (PostgreSQL + Auth + Storage + Edge Functions)
Linguagem: TypeScript em tudo, sem exceções
```

### Estrutura de Pastas (resumo)
```
fragmentos-de-alma/
├── app/              # Telas (Expo Router — baseado em arquivos)
├── src/
│   ├── systems/      # Lógica de jogo pura (sem React)
│   │   ├── genes/    # Genoma, fusão, raridade
│   │   ├── skills/   # Habilidades procedurais
│   │   ├── visual/   # Geração visual
│   │   ├── battle/   # Motor de batalha, IA, recompensas
│   │   ├── progression/ # Kael, legado
│   │   └── world/    # Motor de regras da IA coletiva
│   ├── components/   # Componentes React Native
│   ├── store/        # Estado global (Zustand)
│   ├── hooks/        # React hooks customizados
│   ├── lib/          # Supabase client, constantes
│   └── utils/        # Funções utilitárias
├── supabase/
│   ├── migrations/   # Schema do banco em ordem
│   └── functions/    # Edge Functions (Deno/TypeScript)
└── docs/             # Os 9 documentos de design
```

A estrutura completa está no documento `09_roadmap_mvp.md`.

---

## Os Três Recursos do Jogo

Entender a economia antes de implementar qualquer tela que envolva recursos:

| Recurso | Símbolo | Obtido | Usado para | Pode comprar? |
|---|---|---|---|---|
| **Fragmentos de Alma** | 🔷 | Batalhas, eventos, drops | Fusões, mercado | Sim |
| **Cristais de Essência** | 💎 | Eventos, milestones, compra | Injetar genes, reroll | Sim |
| **Ecos** | ✨ | Aposentar heróis (nunca vender) | Árvore de Legado, cosméticos | **Nunca** |

**Regra de ouro da economia:** dinheiro compra conveniência e velocidade, nunca exclusividade de poder. Detalhe completo em `05_economia.md`.

---

## Os Sistemas Centrais (Resumo Executivo)

### Sistema de Genes
Cada herói tem 12 genes em 3 camadas: Essência (Origin, Affinity, Core), Atributos (6 valores 1–100) e Mutações (raras, emergentes). Na fusão, genes se combinam com dominância, blend, drift e chance de mutação. A raridade é calculada dinamicamente pelo genoma — não atribuída no drop. Ver `01_sistema_de_genes.md`.

### Sistema Visual
6 camadas independentes geradas do genoma: fundo, silhueta, paleta, padrões, ornamentos, aura. Cada camada é controlada por genes específicos. Um "Protocolo de Unicidade" garante que dois heróis com genes idênticos ainda tenham diferenças visuais sutis. Ver `02_sistema_visual.md`.

### Sistema de Habilidades
Habilidades têm 4 componentes: `[Gatilho] + [Efeito] + [Modificador] + [Condição]`. Cada herói tem 3 ativas + 1 ultimate + 2 passivas. Habilidades "emergentes" surgem de combinações raras de genes e são descobertas pelo jogador em jogo. Árvore de evolução tem 3 nós por habilidade, com 1 escolha do jogador no nível 25. Ver `03_sistema_de_habilidades.md`.

### Sistema de Batalha
Turnos sem timer, vertical, uma mão. 3 heróis ativos + 3 no banco. Trocar herói consome a ação do turno. Ordem de ação por AGILIDADE. Roda de ações no terço inferior da tela. Ultimate por toque longo. Motor puramente funcional (sem estado interno) — recebe estado atual, retorna próximo estado. Ver `06_sistema_de_batalha.md`.

### Inimigos e Chefes
Inimigos são gerados pelo mesmo pipeline de genes dos heróis, corrompidos pelo bioma. IA comportamental por NÚCLEO. Chefes têm 3 fases, fraqueza sempre visível, habilidade única telegrafada 1 turno antes. IA Coletiva roda 1x/dia no servidor, distribui pacote de regras `.json` para o motor local — zero custo de IA por sessão de jogo. Ver `07_inimigos_chefes_recompensas.md`.

### Progressão
3 velocidades: curto prazo (sessão), médio prazo (semanas), longo prazo (meses/legado). Kael tem nível próprio (1–100) com Memórias Ressurgentes como passivas — cada uma revela um fragmento do plot twist. Decisões de facção afetam reputação (-100 a +100) e mudam o estado do mundo. Ver `04_loop_de_progressao.md`.

### Mundo e Narrativa
Solum é um mundo onde a física, biologia e espiritualidade emergem da mesma substância (Prima) fragmentada há 1.200 anos. 7 facções controlam 7 alquimias. Narrativa em 3 camadas: missão clara (casual), conflito político (atento), cosmologia e plot twist (obcecado). O jogador é Kael, um Fragmentador que descobre ser a reencarnação do ser que causou a Fratura — de propósito. Ver `08_narrativa_lore_mundo.md`.

---

## As 4 Fases do MVP

### Fase 0 — Fundação Técnica
**Meta:** projeto configurado, banco criado, auth funcionando.
**Critério:** usuário cria conta e vê tela inicial.
**Documentos:** `09_roadmap_mvp.md` seção Fase 0.

### Fase 1 — O Núcleo Colecionável
**Meta:** fragmentos, genes visíveis, fusão funcionando com animação de revelação.
**Critério:** pessoa faz 10 fusões seguidas sem se entediar.
**Documentos:** `01`, `02`, `03` (parcial), `09` seção Fase 1.

### Fase 2 — O Núcleo de Batalha
**Meta:** batalha por turnos com banco de reserva, inimigos procedurais, recompensas básicas.
**Critério:** sessão de 15 minutos se sente completa e satisfatória.
**Documentos:** `06`, `07` (parcial), `03`, `09` seção Fase 2.

### Fase 3 — O Núcleo de Progressão
**Meta:** loop completo. Dungeon → fragmentos → fusão → batalha → recompensa → loop. Primeiro bioma. Primeiro chefe. Kael até nível 30.
**Critério:** jogador volta no dia seguinte sem ser notificado.
**Documentos:** `04`, `07`, `08` (Camada 1), `09` seção Fase 3.

### Fase 4 — MVP Publicável
**Meta:** segundo bioma, facções básicas, narrativa Camada 1, onboarding, polimento.
**Critério:** grupo fechado de teste no TestFlight/Play Console.
**Documentos:** todos, `09` seção Fase 4 e checklist.

---

## Ordem de Implementação

```
Passo 1  → Fase 0: inicializar projeto Expo + configurar Supabase
Passo 2  → Fase 0: executar migrations do banco (doc 09, todas as migrations)
Passo 3  → Fase 0: configurar constantes do jogo (src/lib/constants.ts)
Passo 4  → Fase 1: implementar types de genes (src/systems/genes/types.ts)
Passo 5  → Fase 1: implementar gerador de genoma (src/systems/genes/generator.ts)
Passo 6  → Fase 1: implementar motor de fusão (src/systems/genes/fusion.ts)
Passo 7  → Fase 1: implementar calculador de raridade (src/systems/genes/rarity.ts)
Passo 8  → Fase 1: implementar gerador visual (src/systems/visual/generator.ts)
Passo 9  → Fase 1: implementar gerador de nomes (src/utils/nameGenerator.ts)
Passo 10 → Fase 1: implementar gerador de habilidades (src/systems/skills/generator.ts)
Passo 11 → Fase 1: telas Login → Registro → Hub → Coleção → Detalhe → Fusão → Revelação
Passo 12 → Fase 2: implementar motor de batalha (src/systems/battle/engine.ts)
Passo 13 → Fase 2: implementar IA de inimigos (src/systems/battle/ai.ts)
Passo 14 → Fase 2: implementar sistema de recompensas (src/systems/battle/rewards.ts)
Passo 15 → Fase 2: tela de batalha com roda de ações e banco de reserva
Passo 16 → Fase 3: implementar dungeons e andares (app/game/dungeon/)
Passo 17 → Fase 3: implementar progressão de Kael (src/systems/progression/kael.ts)
Passo 18 → Fase 3: implementar chefe com 3 fases (src/systems/battle/boss.ts)
Passo 19 → Fase 3: implementar sistema de legado e Ecos (src/systems/progression/legacy.ts)
Passo 20 → Fase 4: segundo bioma + sistema de facções básico
Passo 21 → Fase 4: narrativa Camada 1 + onboarding
Passo 22 → Fase 4: polimento, testes, checklist de publicação
```

---

## Decisões de Design Não-Óbvias

Estas são decisões que parecem estranhas sem contexto mas têm razões sólidas:

**Raridade calculada, não atribuída**
A raridade de um herói não é definida quando ele dropa — é calculada a partir do genoma após a fusão. Um fragmento comum pode virar lendário com a fusão certa. Isso é central para a sensação de progressão. Ver `01_sistema_de_genes.md`, seção Raridade Dinâmica.

**Motor de batalha funcional (sem estado)**
O motor de batalha não tem estado interno. Ele recebe o estado atual e retorna o próximo. Isso parece verboso mas elimina toda uma categoria de bugs de sincronização e facilita testes. Ver `09_roadmap_mvp.md`, seção engine.ts.

**Sem barra de energia**
O jogo não tem barra de energia que bloqueia o jogador. Tem "Foco de Dungeon" — 3 tentativas diárias com loot completo, depois loot reduzido (nunca zero). O jogador nunca é bloqueado, apenas incentivado a voltar amanhã. Ver `04_loop_de_progressao.md`.

**Ecos nunca são vendidos**
Ecos são a única moeda que nunca entra na loja premium. Eles são prova de jogo, não de pagamento. Isso é uma decisão filosófica sobre confiança do jogador e deve ser respeitada em qualquer implementação de loja. Ver `05_economia.md`.

**IA coletiva assíncrona**
A IA que calibra dificuldade roda uma vez por dia no servidor e distribui um pacote de regras `.json`. O motor local interpreta as regras — zero chamadas de IA em tempo real durante o jogo. Isso é intencional para controlar custos e latência. Ver `07_inimigos_chefes_recompensas.md`, Parte 1.

**Chefes telegrafam habilidades únicas**
Um turno antes de usar a habilidade especial, o chefe "carrega" com animação visível. O jogador tem tempo de reagir. Isso é tensão sem injustiça — uma distinção importante no design de batalha. Ver `07_inimigos_chefes_recompensas.md`.

**Plot twist integrado mecanicamente**
As Memórias Ressurgentes de Kael (passivas desbloqueadas por nível) são simultaneamente mecânicas de gameplay e peças do plot twist narrativo. Cada passiva tem um fragmento de lore do primeiro Fragmentador. Não são enfeites — são a narrativa da Camada 3 sendo contada através de mecânicas. Ver `08_narrativa_lore_mundo.md`.

---

## Regras de Código

```
- TypeScript em tudo, sem `any` exceto documentado
- Funções puras para sistemas de jogo (genes, fusão, batalha)
- try/catch em toda chamada ao Supabase
- Testes unitários para sistemas de jogo antes de qualquer commit
- Feedback visual ao usuário em qualquer erro de rede
- Nunca silenciar erros
- Toda UI acessível com polegar direito, área de toque mínima 48x48dp
- Animações de habilidade: máximo 1.5 segundos
- Animação de revelação de fusão: máximo 2 segundos
```

---

## Glossário

| Termo | Definição |
|---|---|
| **Prima** | Substância original do universo de Solum, fragmentada em 7 frequências |
| **Genoma** | Conjunto de 12 genes que define um herói |
| **Fusão** | Processo de combinar dois fragmentos/heróis para criar um terceiro |
| **Fragmento** | Alma parcialmente formada, pré-fusão, com genes parcialmente revelados |
| **Mutação** | Gene raro que emerge durante fusão, altera dramaticamente o herói |
| **Kael** | O personagem do jogador — um Fragmentador |
| **Fragmentador** | Ser capaz de capturar, fundir e reconfigurar almas |
| **Alma Corrompida** | Inimigo — alma com genes distorcidos pela corrupção do bioma |
| **Alma Antiga** | Chefe — fragmento da consciência do primeiro Fragmentador |
| **Eco** | Memória cristalizada de herói aposentado, usada na Árvore de Legado |
| **Foco de Dungeon** | 3 tentativas diárias com loot completo por bioma |
| **Memória Ressurgente** | Passiva de Kael desbloqueada por nível, que revela fragmento de lore |
| **IA Coletiva** | Sistema que analisa dados de todos os jogadores e calibra dificuldade |
| **Pacote de Regras** | Arquivo `.json` gerado pela IA Coletiva e distribuído para motores locais |
| **Camada 1/2/3** | Níveis de profundidade da narrativa (casual / atento / obcecado) |
| **Alquimia** | Sistema de manipulação do Prima de uma frequência específica |
| **Bioma** | Território de Solum com Prima dominante de uma frequência |
| **NÚCLEO** | Gene de arquétipo que define o papel de combate (Guardião, Destruidor, etc.) |
| **AFINIDADE** | Gene elemental (Fogo, Água, Terra, etc.) |
| **ORIGEM** | Gene de procedência da alma (Abissal, Celestial, etc.) |
| **Mapa Vivo** | Tela principal do jogo — cartografia alquímica que reflete o estado do mundo |
| **Ciclo de Solum** | Temporada de 3 meses com modificador global de mecânica e conteúdo exclusivo |
| **Torres de Ressonância** | Conteúdo vertical infinito de endgame, 100 andares, ranking semanal |
| **Fragmento Ancestral** | Versão corrompida e extremamente poderosa de um Fragmento Antigo — endgame difícil |
| **Conflito de Facções** | PvP assíncrono semanal onde facções competem por territórios no mapa |
| **Batalha Coletiva** | Evento de fim de Ciclo onde toda a comunidade derrota uma Alma Antiga juntos |
| **Herói Único** | Tier acima de Lendário — o drop mais raro do jogo, apenas em Fragmentos Ancestrais |
| **Cartografia Alquímica** | Estilo visual do mapa: cruzamento entre mapa medieval e diagrama de Prima |

---

## Contato com o Design

Este documento e os 12 documentos de design foram criados iterativamente com o dono do projeto. Qualquer decisão de design não documentada aqui deve ser escalada antes de implementar — não assumir.

Quando encontrar ambiguidade:
1. Verificar se outro documento de design cobre o caso
2. Implementar a solução mais conservadora (menos features, mais robusta)
3. Documentar a ambiguidade como comentário no código com `// TODO: design decision needed`

---
*Versão 0.1 — documento vivo, atualizar conforme o projeto evolui*
