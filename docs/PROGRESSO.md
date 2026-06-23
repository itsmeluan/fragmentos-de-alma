# PROGRESSO — Fragmentos de Alma
*Atualizado em: 2026-06-23*
*Lido por: Claude Code em sessões futuras*

---

## Estado Atual

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

## Próximo Passo: Passo 7 — Calculador de raridade

Ler `docs/01_sistema_de_genes.md` (seção "Raridade Dinâmica") antes de implementar.

Criar `src/systems/genes/rarity.ts` — função pura `calculateRarity(genome)` que
classifica a raridade a partir do genoma (soma de atributos, nº de mutações,
afinidade híbrida, TRANSCENDÊNCIA). Referência no doc 09 (seção 1.1 →
`rarity.ts`), incluindo `getRarityColor(rarity)`. Cobrir todos os tiers com
testes unitários.

> **Resolvido (Passo 6 — ver doc 01 e D11/D13):** INVERSO = 30% (afinidades
> opostas) e ESPELHO = 20% (mesma origem), já ativas e testadas. Par Vazio↔Éter
> adicionado. *Pity escalonado* fica como evolução futura possível (não implementado).

> **Nota técnica (Passo 4):** os tipos `VisualParams` e `HeroSkills` em
> `genes/types.ts` ainda são stubs `unknown`. Substituir pelos imports reais
> de `../visual/types` (Passo 8) e `../skills/types` (Passo 10).

**Critério de conclusão:** `calculateRarity` classifica corretamente cada tier;
testes unitários passam; `tsc --noEmit` limpo.

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
- [ ] Passo 7 — `src/systems/genes/rarity.ts` (ler doc 01 antes)
- [ ] Passo 8 — `src/systems/visual/generator.ts` (ler doc 02 antes)
- [ ] Passo 9 — `src/utils/nameGenerator.ts` (ler doc 02 antes)
- [ ] Passo 10 — `src/systems/skills/generator.ts` (ler doc 03 antes)
- [ ] Passo 11 — Telas: Login → Registro → Coleção → Detalhe → Fusão → Revelação

### Fase 2 — Núcleo de Batalha
- [ ] Passo 12 — `src/systems/battle/engine.ts` (ler doc 06 antes)
- [ ] Passo 13 — `src/systems/battle/ai.ts` (ler doc 07 antes)
- [ ] Passo 14 — `src/systems/battle/rewards.ts` (ler doc 07 antes)
- [ ] Passo 15 — Tela de batalha: roda de ações, banco de reserva, HUD

### Fase 3 — Núcleo de Progressão
- [ ] Passo 16 — Dungeons e andares (`app/(game)/dungeon/`) (ler doc 04 antes)
- [ ] Passo 17 — `src/systems/progression/kael.ts` (ler doc 08 antes)
- [ ] Passo 18 — Chefe com 3 fases (ler doc 07 antes)
- [ ] Passo 19 — `src/systems/progression/legacy.ts` (ler doc 04 antes)

### Fase 4 — MVP Publicável
- [ ] Passo 20 — Mapa de Solum com React Native Skia (ler doc 11 antes)
- [ ] Passo 21 — Estados do mapa: corrupção, progresso, fronteiras políticas
- [ ] Passo 22 — Segundo bioma + sistema de facções (ler docs 04 e 08 antes)
- [ ] Passo 23 — Narrativa Camada 1 + onboarding (ler doc 08 antes)
- [ ] Passo 24 — Polimento visual + checklist de publicação (ler doc 10 antes)

### Pós-MVP — Endgame (doc 12)
- [ ] Passo 25 — Torres de Ressonância
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
