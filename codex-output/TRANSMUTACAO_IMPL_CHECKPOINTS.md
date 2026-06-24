# Checkpoints — Implantação do Círculo de Transmutação

Data: 2026-06-24

## Escopo

- [x] Migration 007: tabela `ecos` + roster/legacy em `players`
- [x] Migration 008: dados de teste para `m.luan.mobile@gmail.com`
- [x] Tipos e funções puras em `src/systems/genes/eco.ts`
- [x] Testes unitários de Eco/Legado/absorção
- [x] `gameStore.ts`: Ecos, roster, criação/absorção, extração e transmutação
- [x] Tela `app/(game)/transmutation.tsx`
- [x] Tab bar: `fusion` escondida e `transmutation` como "Círculo"
- [x] `RosterManager.tsx` integrado na coleção
- [x] Docs sincronizadas (`00`, `09`, `PROGRESSO`)
- [x] Validação final (`tsc`, testes)

## Pontos De Atenção

- O prompt fornece snippets orientativos, mas o app atual usa APIs diferentes para `theme`, `Modal`, `Button`, `TabIcon` e `fragments`.
- O insert de `fragments` deve preservar o schema real de `003_fragments.sql`.
- `fuseGenomes` recebe `seed`, mas ainda usa `Math.random()` internamente; a transmutação herda essa limitação existente.
- Catalisadores precisam respeitar raridade igual ou maior que a maior raridade dos pais, conforme `docs/13_transmutacao.md`.

## Log

- Criado checkpoint antes de qualquer alteração funcional.
- Criadas migrations 007/008.
- Criado `eco.ts` com funções puras e `eco.test.ts`.
- Expandido `gameStore.ts` com Ecos, roster e transmutação.
- Criada tela `transmutation.tsx`, tab "Círculo" e redirect da rota antiga `fusion`.
- Criado `RosterManager.tsx` e integrado em `collection.tsx`.
- Docs sincronizadas (`00`, `09`, `PROGRESSO`).
- Validação: `npx tsc --noEmit` limpo; `npm test -- --runInBand` com 15 suites / 318 testes passando.
- Rodada pós-teste rápido: Criar Eco exige lvl 50, transmutação usa Eco A/B + custos em Fragmentos/Cristais, Almas ganhou abas Heróis/Ecos, sheets longas usam `Modal fill`, recursos de teste aplicados com migrations 006–009.
- Validação pós-ajustes: `npx tsc --noEmit` limpo; `npm test -- --runInBand` com 15 suites / 320 testes passando.
