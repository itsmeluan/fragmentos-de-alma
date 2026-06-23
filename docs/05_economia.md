# 💰 Economia do Jogo
*Fragmentos de Alma — Design Document v0.1*

---

## Visão Geral

A economia de Fragmentos de Alma é construída sobre um princípio inegociável:

> **Dinheiro compra conveniência e velocidade. Nunca exclusividade de poder.**

Qualquer herói lendário, qualquer habilidade emergente, qualquer conteúdo de jogo é alcançável por jogadores free-to-play. Jogadores pagantes chegam mais rápido, com mais conforto — mas não chegam a um destino diferente.

Esse modelo gera confiança com a comunidade, reduz toxicidade de "pay-to-win" e, paradoxalmente, aumenta a disposição dos jogadores de pagar — porque não sentem que estão comprando vantagem injusta.

---

## Os 3 Recursos Principais

### 🔷 Fragmentos de Alma
*Moeda principal de gameplay*

**O que é:** a matéria-prima de tudo. Obtidos em dungeons, eventos, recompensas diárias e trocas entre jogadores.

**Para que serve:**
- Realizar fusões (custo varia por raridade dos pais)
- Comprar fragmentos específicos no Mercado de Almas
- Acelerar identificação de genes (revelar genes antes do combate)

**Como se obtém (free):**
- Drop em batalhas de dungeon (sempre)
- Recompensas diárias de login
- Eventos semanais
- Vendendo heróis duplicados
- Trocas no Mercado de Almas

**Como se obtém (pago):**
- Pacotes de fragmentos por dinheiro real
- Passes de evento que aumentam o drop rate temporariamente

**Custo de fusão por tier:**

| Fusão | Custo em Fragmentos |
|---|---|
| Comum + Comum | 100 |
| Incomum + qualquer | 300 |
| Raro + qualquer | 800 |
| Épico + qualquer | 2.000 |
| Lendário + qualquer | 5.000 |

---

### 💎 Cristais de Essência
*Recurso premium — obtível sem pagar, mas escasso*

**O que é:** recurso refinado que permite intervenção direta no sistema de genes — sem garantias, mas com influência.

**Para que serve:**
- **Injeção de Gene**: adicionar um gene específico a uma fusão (ex: forçar AFINIDADE Fogo no filho)
- **Reroll de Mutação**: reolar a mutação que surgiu em uma fusão (mantém o herói, troca a mutação)
- **Identificação Imediata**: revelar todos os genes de um fragmento sem precisar de combate
- **Slot de Fusão Extra**: fazer uma segunda fusão paralela (normalmente limitado a 1 por vez)

**Como se obtém (free):**
- 2 por semana via recompensas de evento
- 1 por milestone de Legado
- 3 ao criar primeiro herói Épico / Lendário
- Ocasionalmente em dungeons de biomas avançados

**Como se obtém (pago):**
- Compra direta com dinheiro real
- Incluídos em passes mensais

**Notas de design:**
- Cristais nunca garantem resultado — apenas influenciam. Isso mantém a aleatoriedade central do jogo
- O jogador free acumula Cristais lentamente mas constantemente: a experiência nunca é bloqueada, apenas mais lenta

---

### ✨ Ecos
*Recurso de legado — nunca vendido, nunca comprado*

**O que é:** a memória cristalizada de heróis aposentados. Representa o peso da jornada do jogador.

**Para que serve:**
- Desbloquear nós da Árvore de Legado da Conta (passivas permanentes)
- Comprar cosméticos de interface exclusivos (temas de fusão, efeitos de tela, bordas de herói)
- Desbloquear biomas avançados

**Como se obtém:**
- Ao aposentar um herói (quantidade baseada na raridade e nível do herói aposentado)

| Herói aposentado | Ecos gerados |
|---|---|
| Comum nível 1–25 | 1 Eco |
| Comum nível 26–50 | 2 Ecos |
| Incomum qualquer nível | 3–5 Ecos |
| Raro qualquer nível | 8–12 Ecos |
| Épico qualquer nível | 20–30 Ecos |
| Lendário qualquer nível | 60–80 Ecos |
| Único | 150+ Ecos |

**Regra de ouro:** Ecos **nunca** entram na loja premium. São a prova de que o jogador jogou — não pagou.

---

## Monetização: O Que Pode Ser Vendido

### ✅ Pode vender:
- Pacotes de Fragmentos de Alma
- Cristais de Essência
- **Passe de Temporada** (mensal): aumenta drop rate, dá Cristais diários, desbloqueia skin de interface exclusiva
- **Cosméticos**: temas de tela de fusão, bordas de perfil, efeitos de aura decorativos (não alteram stats)
- **Slots de herói adicionais** (galeria de coleção): começa com 50 slots, pode expandir
- **Aceleração de Identificação**: revelar genes sem precisar combater

### ❌ Nunca vender:
- Heróis prontos com genes superiores
- Garantia de mutação específica
- Vantagem direta em PvP (stats maiores por pagamento)
- Ecos
- Conteúdo de bioma exclusivo para pagantes
- Habilidades emergentes exclusivas

---

## Passes e Assinaturas

### Passe Mensal — "Guardião de Almas"
*Preço sugerido: R$ 19,90/mês*

Benefícios:
- +30% de drop de fragmentos em dungeons
- 3 Cristais de Essência por dia (ao invés de 0)
- 1 slot extra de fusão paralela
- Tema exclusivo de interface mensal
- Acesso antecipado a novos eventos (24h antes)

**O que NÃO inclui:** nenhum hero, nenhum gene garantido, nenhum poder de combate exclusivo.

### Passe de Evento — "Fragmento do Eclipse"
*Vinculado a eventos temáticos, ~R$ 14,90 por evento*

Benefícios:
- Track premium do evento com recompensas cosméticas extras
- Fragmentos temáticos em maior quantidade
- Cristais de Essência ao completar desafios do evento

---

## Mercado de Almas (Economia entre Jogadores)

Jogadores podem trocar fragmentos entre si. Isso cria uma economia orgânica e social.

**Regras do mercado:**
- Apenas Fragmentos de Alma circulam (não Cristais nem Ecos)
- Heróis completos não podem ser vendidos — apenas fragmentos
- Taxa de transação de 5% em Fragmentos (vai para pool de recompensas de eventos)
- Limite de transações diárias para evitar exploração (10 trocas/dia para free, 25 para assinantes)

**Por que isso funciona:**
- Jogadores que focam em um bioma/origem têm excedente de outros
- Cria interdependência social saudável
- Estimula formação de guildas especializadas

---

## Modelo de Receita Projetado

| Fonte de receita | % estimada |
|---|---|
| Passe Mensal | 45% |
| Pacotes de Cristais | 25% |
| Passes de Evento / Ciclo | 20% |
| Cosméticos avulsos | 10% |

A meta é que **a maioria da receita venha de assinatura recorrente** — isso alinha o incentivo da empresa com a retenção de longo prazo do jogador, não com picos de venda agressiva.

### Ciclos de Solum e Monetização

Cada Ciclo de 3 meses tem um **Passe de Ciclo** opcional:
- Acesso ao track premium de recompensas do Ciclo
- Cosméticos exclusivos do Ciclo em maior quantidade
- Bônus de contribuição na Batalha Coletiva final
- **Nunca**: poder de combate exclusivo ou vantagem em Torres/PvP

---

## Proteções Anti-Abuso

- **Teto de gasto diário**: alertas ao jogador ao atingir limites de gasto (transparência)
- **Sem loot boxes**: todas as compras têm resultado claro e previsível
- **Pity system visível**: ao comprar pacotes de fragmentos, o jogador vê o contador de "fusões sem resultado acima do esperado" — quando chega ao limite, a próxima fusão garante resultado mínimo de Raro
- **Sem urgência artificial**: timers de oferta-relâmpago são proibidos no design — criam ansiedade desnecessária e corroem a confiança

---

## Filosofia de Longo Prazo

Um jogo de colecionável saudável precisa que os jogadores **queiram ficar**, não que se sintam **presos**. A economia foi desenhada para:

1. Recompensar lealdade (Ecos, Legado, Vínculo com heróis)
2. Nunca punir ausência (sem "perda" de progresso por não jogar)
3. Fazer o pagamento parecer um presente que o jogador dá ao jogo, não uma taxa que o jogo cobra

Jogadores que confiam na economia de um jogo gastam mais, por mais tempo, e trazem mais pessoas.

---
*Próxima revisão: definir preços regionais, modelo de lançamento e estratégia de monetização no primeiro mês*
