# 🔮 Sistema de Transmutação
*Fragmentos de Alma — Design Document v1.0*
*Criado em: 2026-06-24 — produto de brainstorming completo; pronto para implementação*

---

## Visão Geral

O **Círculo de Transmutação** substitui a tela de Fusão simples por uma interface unificada de três operações sobre heróis. O conceito central muda de "fundir = criar + consumir pais" para uma operação mais rica com identidade genética persistente (Ecos), proteção de equipe e controle sobre o que acontece com cada herói aposentado.

> **Regra de ouro do sistema:** você nunca perde um herói que está no seu time ou banco. O Círculo de Transmutação só opera sobre heróis *fora do roster*.

---

## Os 3 Submenus

### 1. Criar Eco
**O que faz:** Aposenta um herói e cristaliza sua assinatura genética em um **Eco** — um item de blueprint que captura a identidade do herói para uso futuro.

**Mecânica:**
- O jogador seleciona um herói fora do roster
- O herói é retirado da coleção (consumido / aposentado)
- Um Eco com a assinatura genética do herói é criado ou **absorvido** em um Eco existente de mesma assinatura (ver § Absorção de Ecos abaixo)
- A operação não custa Fragmentos nem Cristais — é a forma "nobre" de aposentar

**Yield de Legado:** Ecos contribuem para a Árvore de Legado (ver § Progressão do Legado abaixo).

---

### 2. Extrair Cristais
**O que faz:** Aposenta um herói e o converte em **Cristais de Essência**.

**Mecânica:**
- O jogador seleciona um herói fora do roster
- O herói é retirado da coleção (consumido)
- O jogador recebe Cristais de Essência baseados na raridade do herói:

| Raridade do herói | Cristais obtidos |
|---|---|
| Comum | 1 Cristal |
| Incomum | 3 Cristais |
| Raro | 8 Cristais |
| Épico | 20 Cristais |
| Lendário | 50 Cristais |
| Único | 120 Cristais |

**Nota de design:** Cristais extraídos têm custo de oportunidade — você não cria um Eco com esse herói, então o Legado não cresce. Use quando Cristais são urgentemente necessários.

---

### 3. Transmutar Heróis
**O que faz:** Evolução do sistema de Fusão original. Combina dois heróis pais para gerar um filho com possibilidade de **avanço de tier de raridade** quando catalisadores (Ecos) são usados.

**Mecânica completa:**

#### Seleção de Pais
- O jogador escolhe 2 heróis pais, ambos obrigatoriamente **fora do roster**
- Ambos os pais são consumidos na transmutação
- Custo em Fragmentos de Alma (pelo maior tier dos pais):

| Maior raridade entre os pais | Custo em Fragmentos |
|---|---|
| Comum | 100 |
| Incomum | 300 |
| Raro | 800 |
| Épico | 2.000 |
| Lendário | 5.000 |

#### Catalisadores (opcional)
- O jogador pode adicionar **0, 1, 2 ou 3 Ecos como catalisadores**
- Cada Eco deve ter raridade **igual ou maior** que a do herói de maior raridade entre os pais (impede turbo barato)
- Os catalisadores são consumidos na transmutação
- Catalisadores concedem probabilidade de **+1 tier** no filho:

| Número de catalisadores | Comum→Incomum | Incomum→Raro | Raro→Épico | Épico→Lendário |
|---|---|---|---|---|
| 0 catalisadores | — | — | — | — |
| 1 catalisador | 70% | 50% | 30% | 15% |
| 2 catalisadores | 85% | 65% | 45% | 25% |
| 3 catalisadores | 95% | 80% | 60% | 40% |

- Kael (o Fragmentador) adiciona **+0% a +10%** a estas probabilidades dependendo do nível de Kael (bônus de Legado — ver § Progressão do Legado)
- Se a probabilidade de +1 tier **não se concretizar**, o filho nasce com o tier padrão (calculado pelo genoma fusionado)

#### Filho nascido
- O filho nasce sempre em **nível 1**
- O genoma é calculado pela lógica existente em `src/systems/genes/fusion.ts`
- Cap de atributo do genoma base: **120 por gene** (o genoma fusionado é clampado — impede explosão de stats)
- Habilidades: **70% herdadas do pool dos pais** (combinação de todas as skills dos dois pais, sorteio ponderado pela raridade) + **30% novas** geradas pelo genoma do filho
- Cada catalisador Eco adiciona as melhores skills do Eco ao pool disponível para herança (aumenta a diversidade das skills herdadas)

#### Cristalização pós-fusão
- Após a transmutação, **o gene mais forte de cada pai é cristalizado** como fragmento em `fragments` com `source = 'fusion_byproduct'` (comportamento existente, mantido)

---

## Assinatura Genética e Identidade do Eco

### O que é a Assinatura
Cada Eco é identificado por uma **assinatura genética**:
```
{ origin, affinity, core, mutations[] }
```

Exemplos:
- `Abissal / Fogo / Guardião / []` → Eco "Guardião do Fogo Abissal"
- `Celestial / Luz / Arauto / [INVERSO]` → Eco "Arauto da Luz Celestial Invertido"

A `signature_key` é computada concatenando os valores em ordem alfabética:
```
`${origin}:${affinity}:${core}:${sorted(mutations).join(',')}`
```

### Absorção de Ecos
Quando o jogador cria um Eco cuja assinatura **já existe** na sua coleção, o novo Eco é absorvido pelo existente:

**Regras de absorção:**
- Para cada atributo do genoma: `merged = Math.min(Math.max(existing, incoming), 120)` — sempre mantém o melhor, respeitando o cap 120
- Para cada slot de habilidade: mantém a habilidade de **maior poder** entre as duas (não há escolha A/B)
- O `absorption_count` do Eco existente é incrementado
- Uma **preview** mostrando o que vai mudar é exibida antes de confirmar

**Não há escolha para o jogador na absorção** — o sistema sempre escolhe o melhor automaticamente. A preview serve apenas para informar.

---

## Proteção do Roster

### Regra fundamental
O Círculo de Transmutação **nunca permite operar sobre heróis no roster** (3 do time principal + 3 do banco de reserva).

### Implementação
- O jogador designa seu roster fora do Círculo (via tela de Coleção ou tela dedicada)
- Os heróis do roster são marcados visualmente e filtrados das seleções do Círculo
- Regra de emergência: se o jogador tiver exatamente 6 heróis no total, nenhum pode ser selecionado para Criar Eco ou Extrair Cristais (o roster por definição contém todos)
- **Mínimo absoluto:** o jogo nunca permite que a coleção caia para menos de 6 heróis sem que o jogador esteja iniciando uma Transmutação (que gerará um novo filho)

### Implementação de Roster no Banco
O roster é persistido por jogador. As colunas `team_hero_ids` e `bench_hero_ids` são armazenadas na tabela `players` (via migration 007).

---

## Progressão do Legado via Ecos

A **Árvore de Legado** evolui com base na **coleção de Ecos únicos por raridade** do jogador. A métrica é uma soma ponderada:

| Raridade do Eco | Peso na soma ponderada |
|---|---|
| Comum | 1 |
| Incomum | 3 |
| Raro | 8 |
| Épico | 20 |
| Lendário | 50 |
| Único | 150 |

**Score de Legado = Σ (peso_da_raridade × 1 por Eco único dessa raridade)**

> Exemplo: 10 Ecos Comuns (×1) + 5 Incomuns (×3) + 2 Raros (×8) = 10 + 15 + 16 = **41 pontos**

Duplicatas da mesma assinatura NÃO contam — apenas o primeiro Eco de cada assinatura é contado. Maximizar o Legado exige explorar biomas variados e criar heróis de raridades altas.

### Tiers de Legado (Ecos)
Os tiers de Legado existentes (em `legacy.ts`) são **acumulados em Ecos** — mas o contador agora usa o Score de Legado acima em vez de contagem simples de Ecos.

| Tier | Score necessário | Bônus |
|---|---|---|
| T1 | 10 pts | +5% drop de fragmentos raros |
| T2 | 40 pts | +3% mutação positiva em fusões |
| T3 | 100 pts | Slot extra na equipe de combate |
| T4 | 250 pts | Acesso ao bioma Vazio Fragmentado |
| T5 | 600 pts | Injeção de gene ancestral 1× por semana |

### Bônus de Kael na Transmutação
Kael adiciona chance de +1 tier baseada no tier de Legado atual:

| Tier de Legado de Kael | Bônus adicional de tier |
|---|---|
| T0 (sem tier) | +0% |
| T1 | +2% |
| T2 | +4% |
| T3 | +6% |
| T4 | +8% |
| T5 | +10% |

---

## Catálogo de Habilidades por Tier

Cada herói possui slots de habilidades fixos por raridade:

| Raridade | Ativas | Passivas | Únicas | Emergentes |
|---|---|---|---|---|
| Comum | 1 | 0 | 0 | 0 |
| Incomum | 2 | 0 | 0 | 0 |
| Raro | 3 | 1 | 0 | 0 |
| Épico | 4 | 2 | 1 | 0 |
| Lendário | 5 | 3 | 2 | 0–1 |
| Único+ | 5 | 3 | 3 | 1+ |

Quando um filho nasce com tier acima do esperado (via catalisador), ele ganha os slots adicionais do tier superior — os 30% de skills novas preenchem os slots extras.

---

## Interface do Círculo de Transmutação

### Tela Principal (`app/(game)/transmutation.tsx`)
Substituirá `app/(game)/fusion.tsx`. Tab bar renomeada de "Fundir" para "Círculo".

Layout:
```
┌─────────────────────────────────┐
│  ◈ CÍRCULO DE TRANSMUTAÇÃO ◈   │
│                                 │
│  [Criar Eco]  [Extrair Cristais] │
│                                 │
│  ════════════════════════════   │
│                                 │
│         [Transmutar ▼]          │
│    (expande painel de fusão)    │
└─────────────────────────────────┘
```

### Submenu Criar Eco
- Lista de heróis FORA do roster
- Card de herói com assinatura genética visível
- Se assinatura já existe: mostra preview de absorção (o que muda)
- Confirmação com nome do Eco e raridade

### Submenu Extrair Cristais
- Lista de heróis FORA do roster
- Mostra yield de Cristais antes de confirmar
- Aviso visual se o herói está no banco (zona cinza de segurança)

### Submenu Transmutar Heróis
- Slot A (herói pai) + Slot B (herói pai)
- Painel de catalisadores (0–3 slots de Eco)
- Preview do filho estimado: tier mínimo garantido + probabilidade de tier superior
- Custo total visível (Fragmentos + Ecos consumidos)
- Botão confirmar com animação do Círculo Alquímico (componente `AlchemicalCircle` existente)

---

## Tabelas do Banco de Dados

### Migration 007 — Transmutação

```sql
-- Ecos: blueprints genéticos com absorção
CREATE TABLE public.ecos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,

  -- Assinatura genética (identidade do Eco)
  signature_origin text NOT NULL,
  signature_affinity text NOT NULL,
  signature_core text NOT NULL,
  signature_mutations text[] NOT NULL DEFAULT '{}',
  signature_key text NOT NULL, -- '{origin}:{affinity}:{core}:{sorted mutations}'

  -- Dados genéticos absorvidos (melhores valores)
  best_genes jsonb NOT NULL,   -- { forca: int, ressonancia: int, ... }
  best_skills jsonb NOT NULL,  -- { active_0: Skill, passive_0: Skill, ... }

  -- Raridade do herói de origem
  rarity text NOT NULL CHECK (rarity IN ('comum','incomum','raro','epico','lendario','unico')),

  -- Quantos heróis foram absorvidos neste Eco
  absorption_count integer NOT NULL DEFAULT 1,

  UNIQUE(player_id, signature_key)
);

CREATE INDEX ecos_player ON public.ecos(player_id);
ALTER TABLE public.ecos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ecos_own" ON public.ecos FOR ALL USING (auth.uid() = player_id);

-- Coluna de roster na tabela players
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS team_hero_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bench_hero_ids uuid[] NOT NULL DEFAULT '{}';

-- Pontuação de legado (cache calculado)
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS legacy_score integer NOT NULL DEFAULT 0;
```

---

## Fluxos de Dado no App

### `gameStore` — novos métodos

```typescript
// Criar Eco: retira herói, cria/absorve Eco no banco
commitCreateEco(heroId: string): Promise<{ ok: true; eco: Eco } | { ok: false; error: string }>

// Extrair Cristais: retira herói, credita Cristais
commitExtractCrystals(heroId: string): Promise<{ ok: true; crystals: number } | { ok: false; error: string }>

// Transmutar: fusão com catalisadores opcionais, retira pais e Ecos usados
commitTransmutation(
  parentAId: string,
  parentBId: string,
  catalystEcoIds: string[],  // 0–3 Ecos
  child: FusionChildInput
): Promise<FusionResult>

// Atualizar roster
setRoster(teamIds: string[], benchIds: string[]): Promise<void>

// Carregar Ecos do banco
loadEcos(): Promise<void>

// Estado adicional no store
ecos: Eco[]
```

### Tipo `Eco`
```typescript
export interface Eco {
  id: string
  player_id: string
  created_at: string
  signature_origin: string
  signature_affinity: string
  signature_core: string
  signature_mutations: string[]
  signature_key: string
  best_genes: Record<string, number>
  best_skills: Record<string, unknown>
  rarity: Rarity
  absorption_count: number
}
```

---

## Dados de Teste

Para testar sem preocupação com recursos, inserir diretamente no banco do usuário `m.luan.mobile@gmail.com`:

```sql
-- Ver seção "Dados de Teste" no PROMPT_CODEX abaixo
-- Creditar 50.000 Fragmentos, 500 Cristais e popular a coleção com heróis de todas as raridades
```

---

## Pendências de Calibração (pós-implementação)

Estas decisões serão ajustadas em playtesting — não bloqueiam a implementação:

1. **Curvas de XP por tier** — hoje lineares, podem precisar de ajuste fino
2. **Trickle de Cristais no early game** — se o jogador fica sem Cristais muito rápido, aumentar drops de dungeon early
3. **Thresholds exatos do Score de Legado** — os valores acima são estimativas razoáveis
4. **Thresholds de Kael para bônus de prestige** — os +2%/tier podem ser revisados
5. **Yield de Cristais por raridade** — se a extração gerar muitos Cristais, reduzir

---

## Referências

- `docs/01_sistema_de_genes.md` — genoma, herança, fusão
- `docs/04_loop_de_progressao.md` — biomas, legado, progressão
- `docs/05_economia.md` — recursos, custos
- `docs/09_roadmap_mvp.md` — migrations existentes (001–006)
- `src/systems/genes/fusion.ts` — lógica de fusão existente
- `src/systems/progression/legacy.ts` — sistema de legado existente
- `src/store/gameStore.ts` — store principal
