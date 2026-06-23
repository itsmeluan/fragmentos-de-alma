# 🧬 Sistema de Genes de Alma
*Fragmentos de Alma — Design Document v0.1*

---

## Visão Geral

Cada entidade no jogo carrega um **genoma de alma** — um conjunto de genes que define quem ela é, o que ela pode fazer e como ela se parece. Na fusão, esses genes se combinam de forma procedural, produzindo descendentes únicos que nunca existiram antes e nunca existirão da mesma forma novamente.

---

## Estrutura do Genoma

Cada entidade possui **12 genes**, organizados em 3 camadas:

### Camada 1 — Genes de Essência (imutáveis após fusão)
Definem a natureza fundamental da alma.

| Gene | Descrição | Valores possíveis |
|---|---|---|
| `ORIGEM` | De onde a alma veio | Abissal, Celestial, Primordial, Forjada, Errante |
| `AFINIDADE` | Elemento dominante | Fogo, Água, Terra, Vento, Vazio, Luz, Sombra, Éter |
| `NÚCLEO` | Arquétipo de combate | Guardião, Destruidor, Arauto, Trickster, Invocador |

> Esses genes determinam o "tema" da entidade e influenciam fortemente quais habilidades emergentes são possíveis.

---

### Camada 2 — Genes de Atributo (numéricos, herdáveis)
Determinam os stats base. Cada gene tem um valor entre **1–100**.

| Gene | Stat afetado |
|---|---|
| `FORÇA` | Dano físico base |
| `RESSONÂNCIA` | Dano elemental e habilidades ativas |
| `RESISTÊNCIA` | HP e defesa |
| `AGILIDADE` | Velocidade de ação e chance de esquiva |
| `VONTADE` | Resistência a debuffs e controle mental |
| `AURA` | Poder de habilidades passivas e suporte |

---

### Camada 3 — Genes de Mutação (raros, emergentes)
Surgem espontaneamente durante fusões, com probabilidade baseada em condições.

| Gene de Mutação | Condição de surgimento | Efeito |
|---|---|---|
| `INVERSO` | Fusão de opostos (ex: Fogo + Água) | Stats invertidos: fraqueza vira força situacional |
| `ESPELHO` | Fusão de gêmeos (mesma origem) | Copia 1 habilidade ativa do parceiro de fusão |
| `ANCESTRAL` | Linhagem com 4+ gerações | Ressurge um gene perdido de um ancestral |
| `CAOS` | Fusão em momento de eclipse (evento global) | Todos os genes rerolam parcialmente |
| `TRANSCENDÊNCIA` | Fusão de dois lendários | Desbloqueia tier acima do lendário |

---

## Mecânica de Herança

Na fusão de duas entidades (Pai A + Pai B), cada gene do filho é determinado assim:

```
Para cada gene numérico:
  1. Sorteia dominância: 60% chance do gene mais alto vencer
  2. Aplica blend: valor filho = (dominante × 0.7) + (recessivo × 0.3)
  3. Aplica drift: ± variação aleatória de até 15%
  4. Checa mutação: 5% de chance de mutação positiva (+10–25)
                    2% de chance de mutação negativa (−10–20)
                    0.5% de chance de mutação rara (gene de mutação surge)

Para genes de essência (ORIGEM, AFINIDADE, NÚCLEO):
  1. Herda do pai dominante (o de maior nível/raridade)
  2. 30% chance de herdar do pai recessivo
  3. 5% chance de criar variante híbrida (ex: Fogo + Sombra = Cinza Ardente)
```

---

## Raridade Dinâmica

A raridade **não é atribuída no drop** — ela é **calculada** a partir do genoma.

| Tier | Condição de classificação |
|---|---|
| ⚪ Comum | Soma de genes < 300, sem mutações, sem híbridos |
| 🟢 Incomum | Soma 300–450 ou 1 gene de mutação |
| 🔵 Raro | Soma 450–600 ou afinidade híbrida |
| 🟣 Épico | Soma 600–750 ou 2+ mutações |
| 🟠 Lendário | Soma > 750 ou gene `TRANSCENDÊNCIA` |
| 🔴 Único | Condições especiais de evento + genoma excepcional |

> Isso significa que um fragmento comum pode se tornar a base de um lendário se fundido com sabedoria.

---

## Sistema de Linhagem

Cada entidade mantém um **registro genealógico** completo:
- Árvore de fusões visível no perfil do herói
- Genes herdados de cada ancestral são rastreados
- Conquistas de linhagem desbloqueiam passivas permanentes para a conta
- Heróis com linhagem pura (mesma ORIGEM por 3+ gerações) ganham bônus de coesão

---

## Morte e Legado

Quando um herói é "aposentado" (sacrificado para fusão ou legado):
- Seus genes mais fortes são **cristalizados** em um fragmento especial
- Esse fragmento pode ser usado em fusões futuras, injetando genes específicos
- Heróis lendários aposentados deixam um **eco passivo** permanente na conta (ex: +2% de AURA global)

---

## Notas de Design

- O sistema deve ser **legível para o jogador**: mostrar claramente quais genes vieram de onde
- A variação entre fusões deve ser **surpreendente mas não arbitrária** — o jogador deve sentir que suas escolhas importam
- Introduzir conceito de genes aos poucos, não sobrecarregar o jogador no início
- Interface de fusão deve visualizar a combinação em tempo real antes de confirmar

---
*Próxima revisão: adicionar tabela de compatibilidade entre ORIGENS e AFINIDADES*
