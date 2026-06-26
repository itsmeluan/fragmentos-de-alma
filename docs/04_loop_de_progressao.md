# ⚙️ Loop de Progressão
*Fragmentos de Alma — Design Document v0.1*

---

## Visão Geral

A progressão acontece em **3 velocidades simultâneas** — curto, médio e longo prazo — de forma que o jogador sempre sinta movimento, independente de quanto tempo tem disponível por sessão. O design central é: **nenhuma ação é desperdiçada**. Toda fusão, toda batalha, toda decisão contribui para algo.

---

## As 3 Velocidades de Progressão

### ⚡ Curto Prazo — "O que faço hoje"
*Escala: minutos a horas por sessão*

O loop básico de uma sessão:

```
Explorar Dungeon
      ↓
Coletar Fragmentos de Alma
      ↓
Identificar Fragmentos (revelar genes)
      ↓
Decidir: fundir agora ou guardar para linhagem maior?
      ↓
Fazer fusão → revelar novo herói
      ↓
Testar em combate rápido
      ↓
Voltar ao dungeon (nível mais difícil ou novo bioma)
```

**Recompensas imediatas:**
- Fragmentos após cada batalha
- Animação de revelação a cada fusão
- XP de herói visível subindo
- Streak de vitórias com multiplicador de drops

**Ritmo de sessão:** o jogador deve sentir progresso concreto em sessões de 10–15 minutos. Nunca uma sessão "em branco".

---

### 📈 Médio Prazo — "O que construo essa semana"
*Escala: dias a semanas*

Objetivos com arco narrativo visível:

**Sistema de Projetos de Linhagem**
O jogador define uma meta de fusão (ex: "quero um Lendário de ORIGEM Abissal + NÚCLEO Destruidor") e o jogo traça um caminho:
- Quais fragmentos coletar
- Quais fusões intermediárias fazer
- Estimativa de sessões necessárias

Isso dá direção sem tirar a surpresa — os genes ainda variam, e o resultado final nunca é exatamente o planejado.

**Desbloqueio de Biomas**
- 13 biomas/territórios disponíveis (D61), cada um com fragmentos exclusivos
- Desbloqueio por marcos de poder da conta (não por paywall)
- Cada bioma tem narrativa própria que se revela conforme explorado

**Biomas base (6 originais):**

| Bioma | ORIGEM predominante | Desbloqueio |
|---|---|---|
| Cavernas do Abismo | Abissal | Inicial |
| Pináculo Celestial | Celestial | 10 fusões |
| Floresta Primordial | Primordial | 1 Raro criado |
| Forja Eterna | Forjada | 1 Épico criado |
| Mar do Éter | Éter/Vazio | 1 Lendário criado |
| Vazio Fragmentado | Mutações raras | Score de Legado ≥ 100 (T3) |

**Territórios de Solum (7 adicionados no Passo 22, D61):**

| Território | Facção | Desbloqueio |
|---|---|---|
| Axis | Arquitetos do Véu | progressão no mapa |
| Cinderfall | Chama Negra | progressão no mapa |
| Kethara | inicial / padrão | inicial |
| Limiar | — | progressão no mapa |
| Mnemos | — | progressão no mapa |
| Venula | — | progressão no mapa |
| Verdania | — | progressão no mapa |

**Eventos Semanais**
- Todo ciclo de 7 dias tem 1 evento temático (ex: "Semana do Eclipse" — fusões têm maior chance de mutação `CAOS`)
- Eventos alteram temporariamente as regras de fusão e drop
- Recompensas exclusivas de evento: fragmentos de genes raros, cosméticos de interface

---

### 🏛️ Longo Prazo — "O legado que deixo"
*Escala: meses*

A progressão de longo prazo é sobre **a conta, não os heróis**.

**Árvore de Legado da Conta**
Ao criar Ecos (via Círculo de Transmutação → Criar Eco), o jogador acumula um **Score de Legado** ponderado por raridade. A métrica é uma soma ponderada dos Ecos únicos por raridade — duplicatas da mesma assinatura não contam:

| Raridade do Eco | Peso |
|---|---|
| Comum | 1 pt |
| Incomum | 3 pts |
| Raro | 8 pts |
| Épico | 20 pts |
| Lendário | 50 pts |
| Único | 150 pts |

```
Score de Legado = Σ (peso × 1 por Eco único de cada raridade)
Exemplo: 10 Ecos Comuns + 5 Incomuns + 2 Raros = 10 + 15 + 16 = 41 pts
```

Os tiers de Legado desbloqueiam passivas permanentes de conta:

| Tier | Score necessário | Bônus |
|---|---|---|
| T1 | 10 pts | +5% de drop de fragmentos raros |
| T2 | 40 pts | +3% de chance de mutação positiva em fusões |
| T3 | 100 pts | Slot extra na equipe de combate |
| T4 | 250 pts | Acesso ao bioma "Vazio Fragmentado" |
| T5 | 600 pts | Injeção de gene ancestral 1× por semana |

> **Nota:** este sistema de Score ponderado (definido em `docs/13_transmutacao.md` e implementado em `src/systems/genes/eco.ts`) substitui a contagem simples de Ecos descrita originalmente aqui. O Score incentiva diversidade de raridades e biomas, não apenas volume de aposentadorias.

**Registro de Descobertas**
- Cada habilidade emergente descoberta pela primeira vez é registrada com o nome do jogador
- "Primeiro a descobrir: [nome]" aparece no tooltip da habilidade para todos
- Cria cultura de exploração e compartilhamento

**Colecionário de Linhagens**
- Galeria visual de toda a árvore genealógica de fusões
- Metas de coleção: "criar um herói de cada ORIGEM", "criar um herói com 5 mutações", etc.
- Conquistas que desbloqueiam cosméticos e títulos de conta

---

## Sistema de Energia / Stamina

Para controlar o ritmo de progressão sem frustrar:

**Não existe barra de energia** para ações básicas de fusão e coleta de fragmentos.

Existe **Foco de Dungeon**: cada dungeon tem 3 tentativas diárias com loot completo. Após isso, loot reduzido (fragmentos comuns apenas). Nunca bloqueado completamente.

Isso garante:
- Sessões curtas são sempre eficientes
- Jogadores hardcore têm o que fazer (fusões, testes, eventos)
- Não há sensação de "muro de energia" frustrante

---

## Curva de Poder

A curva de poder é **logarítmica**: progresso rápido no início, cada tier seguinte exige mais mas recompensa proporcionalmente.

```
Comum → Incomum   : ~5 fusões
Incomum → Raro    : ~15 fusões
Raro → Épico      : ~40 fusões
Épico → Lendário  : ~100 fusões
Lendário → Único  : condições especiais + ~300 fusões equivalentes
```

**Anti-frustração:** o sistema rastreia "azar acumulado". Se o jogador fez muitas fusões sem resultado acima do esperado, a próxima fusão tem probabilidade de mutação aumentada silenciosamente. O jogador não vê esse número — apenas sente que "a sorte virou".

---

## Progressão do Herói Individual

Além da raridade (determinada pelos genes), cada herói tem progressão própria:

**Nível de Experiência (1–50)**
- Ganha XP em batalhas
- A cada 10 níveis, um modificador de habilidade é desbloqueado (ex: uma habilidade ativa ganha +1 uso por batalha)
- Ao atingir nível 50: herói "desperta" — visual recebe efeito adicional e pode ser aposentado por Ecos maiores

**Vínculo**
- Quanto mais o jogador usa o herói, maior o vínculo (1–5 estrelas)
- Vínculo alto desbloqueia diálogos de lore exclusivos e pequenos bônus de stats
- Cria apego emocional genuíno — difícil de aposentar um herói de vínculo 5

---

## Progressão Social

- **Guildas de Linhagem**: grupos que compartilham fragmentos e trabalham em linhagens coletivas
- **Ranking de Descobertas**: placar de quem descobriu mais habilidades emergentes
- **Torneio de Criação Mensal**: comunidade vota nos heróis mais visualmente únicos
- **Mercado de Fragmentos**: troca entre jogadores cria economia social orgânica

---

## Endgame — Progressão Infinita

Após completar os 7 territórios e a narrativa principal, a progressão continua em 4 pilares independentes. Ver documento completo em `12_endgame.md`:

- **Torres de Ressonância**: conteúdo vertical de 100 andares, ranking semanal
- **Conflito de Facções**: PvP assíncrono com impacto no mapa de Solum
- **Fragmentos Ancestrais**: versões extremas dos chefes, drop de Herói Único
- **Ciclos de Solum**: temporadas de 3 meses que mudam as regras do jogo

---

## Notas de Design

- Todo sistema de progressão deve ter **feedback visual imediato**: barras que sobem, animações de milestone, sons de recompensa
- Evitar "sessions voids" — o jogador nunca deve fechar o app sem ter conseguido algo
- Tutoriais de progressão devem ser revelados contextualmente, nunca em blocos longos
- O mapa de dungeons deve mostrar o progresso visualmente (biomas que se transformam conforme o jogador avança)

---
*Próxima revisão: detalhar eventos semanais e sistema de guildas*
