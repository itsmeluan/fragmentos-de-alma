# AGENTS.md — Fragmentos de Alma
*Guia de contexto para o Codex*

---

## O Projeto

**Fragmentos de Alma** é um jogo mobile RPG colecionável para iOS e Android (React Native + Expo). O conceito central é fusão procedural de heróis: cada herói é gerado a partir de um genoma único — fundir dois heróis produz um terceiro que nunca existiu antes. O jogo tem batalha por turnos, mundo próprio (Solum), 7 facções com impacto político, e economia desenhada para ser justa com jogadores gratuitos. Jogável com uma mão, na vertical.

---

## Antes de Qualquer Implementação

Leia `docs/00_documento_mestre.md` primeiro. Ele tem o índice completo e a ordem de leitura recomendada de todos os 13 documentos de design.

Veja `docs/PROGRESSO.md` para o estado atual do projeto: o que já foi implementado, o próximo passo e o checklist completo.

**Regra fundamental:** leia o documento relevante antes de implementar qualquer sistema. Os docs contêm decisões de design não-óbvias que afetam a implementação diretamente.

```
Ordem de leitura recomendada (começando do zero):
09 → 01 → 02 → 03 → 06 → 07 → 04 → 05 → 08 → 10 → 11 → 12
```

---

## Localização do Projeto

```
/Volumes/SSDLuan/Projetos/Fragmentos_de_Alma/
├── app/
│   └── fragmentos-de-alma/    ← projeto Expo (SDK 56) — trabalhar aqui
├── docs/                      ← documentos de design (fonte de verdade viva)
│   ├── 00_documento_mestre.md
│   ├── 01_sistema_de_genes.md … 12_endgame.md
│   └── PROGRESSO.md           ← estado atual do projeto
└── AGENTS.md                  ← este arquivo
```

Comandos `npx expo`, `npm install`, etc. devem ser executados dentro de `app/fragmentos-de-alma/`.

---

## Estrutura de Pastas (resumo)

```
app/fragmentos-de-alma/
├── app/               # Telas — Expo Router (baseado em arquivos)
│   ├── (auth)/        # login.tsx, register.tsx
│   ├── (game)/        # index, collection, fusion, profile + dungeon/
│   └── _layout.tsx
├── src/
│   ├── systems/       # Lógica pura de jogo — sem React, sem estado global
│   │   ├── genes/     # genoma, fusão, raridade
│   │   ├── skills/    # habilidades procedurais
│   │   ├── visual/    # geração visual por camadas
│   │   ├── battle/    # motor, IA, recompensas
│   │   ├── progression/  # Kael, legado
│   │   └── world/     # motor de regras da IA coletiva
│   ├── components/    # Componentes React Native
│   ├── store/         # Estado global — Zustand
│   ├── hooks/         # React hooks customizados
│   ├── lib/           # supabase.ts, constants.ts, theme.ts
│   └── utils/         # random.ts, math.ts, nameGenerator.ts
├── supabase/
│   ├── migrations/    # SQL em ordem (001–005)
│   └── functions/     # Edge Functions (Deno/TypeScript)
└── assets/
    ├── fonts/         # Cinzel, Rajdhani, Libre Baskerville
    └── sounds/
```

A estrutura completa (com todos os arquivos) está em `docs/09_roadmap_mvp.md`.

---

## Regras de Código

### TypeScript
- TypeScript em **tudo**, sem exceções
- Nunca usar `any` sem um comentário explicando por quê é necessário
- Interfaces para objetos de dados; `type` para unions
- Exportar tipos junto com as implementações

### Arquitetura
- Sistemas de jogo (`src/systems/`) devem ser **funções puras** — recebem entrada, retornam saída, sem estado interno, sem efeitos colaterais
- Estado local de componente: `useState` / `useReducer`
- Estado global do jogo: Zustand (`gameStore`)
- Cache de servidor: TanStack Query
- Estado de batalha: Zustand (`battleStore`) — limpar ao sair da batalha

### Supabase
- **Toda** chamada ao Supabase deve ter `try/catch`
- Erros de rede devem mostrar feedback visual — nunca silenciar
- Erros de sistemas de jogo (fusão, batalha) devem ser logados mas não crashar o app

### Nomenclatura
- Arquivos de utilitário: `camelCase.ts`
- Componentes React: `PascalCase.tsx`
- Constantes globais: `UPPER_SNAKE_CASE`
- Tipos e interfaces: `PascalCase`
- IDs de banco: sempre `uuid`, nunca inteiros

### Testes
- Sistemas de jogo (`src/systems/`) devem ter testes unitários
- Rodar testes antes de considerar qualquer sistema de jogo concluído

---

## Regras Gerais

- **Nunca implementar mais de um passo do checklist sem confirmação do usuário.** Ver `docs/PROGRESSO.md` para o próximo passo.
- Leia o documento de design relevante antes de implementar cada sistema (ver tabela em `docs/00_documento_mestre.md`).
- Em caso de ambiguidade não coberta pelos docs, **pergunte antes de assumir** — não invente comportamento de jogo.
- **Manter as docs de design sincronizadas com a implementação.** Toda decisão técnica ou desvio da referência (versões, libs, correções de bugs na referência, ambiguidades resolvidas) deve ser registrada no log **"Decisões de Implementação"** em `docs/09_roadmap_mvp.md`, além do `docs/PROGRESSO.md`. Quando a referência de código de um doc estiver desatualizada, corrigir o doc.
- Atualizar `docs/PROGRESSO.md` ao concluir cada passo.
- UI acessível com polegar: área de toque mínima de **48×48dp** em todo elemento interativo.
- Não usar `#FFFFFF` puro em nenhum elemento visual — sempre usar `#E8E0D0` (Branco Pergaminho) ou variação. Ver `docs/10_direcao_de_arte.md`.
- Nunca avançar para o Passo seguinte sem confirmação — mesmo que pareça simples.
