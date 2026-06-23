# ⚔️ Sistema de Habilidades Procedurais
*Fragmentos de Alma — Design Document v0.1*

---

## Visão Geral

As habilidades de uma entidade **não são escolhidas de um catálogo** — elas emergem do genoma. Cada herói tem habilidades que são combinações únicas de efeitos, gatilhos e modificadores, geradas proceduralmente a partir dos seus genes.

Dois heróis com NÚCLEO Destruidor e AFINIDADE Fogo podem ter habilidades com o mesmo tema, mas com mecânicas completamente distintas.

---

## Anatomia de uma Habilidade

Toda habilidade é construída por 4 componentes:

```
[GATILHO] + [EFEITO BASE] + [MODIFICADOR] + [CONDIÇÃO ESPECIAL]
```

### Exemplos:
- `Ao atacar` + `causa dano de fogo` + `em área` + `se o alvo estiver abaixo de 50% de HP` → **"Chama do Fim"**
- `Ao receber dano` + `cria escudo` + `proporcional à VONTADE` + `se aliado morreu no turno anterior` → **"Vontade Inquebrada"**
- `A cada 3 turnos` + `invoca entidade menor` + `com atributos do inimigo mais forte` + `(passivo permanente)` → **"Eco do Adversário"**

---

## Banco de Componentes

### Gatilhos
| ID | Gatilho | Gene que influencia |
|---|---|---|
| T01 | Ao atacar | FORÇA |
| T02 | Ao receber dano | RESISTÊNCIA |
| T03 | A cada N turnos | AGILIDADE |
| T04 | Ao matar um inimigo | FORÇA + RESSONÂNCIA |
| T05 | Quando aliado morre | VONTADE |
| T06 | Ao usar habilidade ativa | RESSONÂNCIA |
| T07 | No início do combate | AURA |
| T08 | Ao atingir HP crítico | VONTADE + RESISTÊNCIA |
| T09 | Ao curar | AURA |
| T10 | Aleatoriamente (% por turno) | AGILIDADE |

### Efeitos Base
| ID | Efeito | Gene que influencia |
|---|---|---|
| E01 | Dano físico | FORÇA |
| E02 | Dano elemental | RESSONÂNCIA + AFINIDADE |
| E03 | Cura | AURA |
| E04 | Escudo | RESISTÊNCIA |
| E05 | Debuff no inimigo | VONTADE |
| E06 | Buff em aliado | AURA |
| E07 | Invoca entidade | RESSONÂNCIA |
| E08 | Drena recurso do inimigo | RESSONÂNCIA + VONTADE |
| E09 | Reposiciona combatentes | AGILIDADE |
| E10 | Revive aliado com HP parcial | AURA + VONTADE |

### Modificadores
| ID | Modificador | Condição de aparição |
|---|---|---|
| M01 | Em área | RESSONÂNCIA > 50 |
| M02 | Proporcional a um atributo | qualquer gene > 70 |
| M03 | Com chance de crítico aumentada | AGILIDADE > 60 |
| M04 | Que escala com inimigos derrotados | FORÇA > 65 |
| M05 | Que ignora defesa | VONTADE > 70 |
| M06 | Com efeito secundário elemental | AFINIDADE híbrida |
| M07 | Que afeta aliados também (positivo) | AURA > 55 |
| M08 | Que persiste por N turnos | RESISTÊNCIA > 50 |
| M09 | Com ricochete em inimigos | AGILIDADE > 55 |
| M10 | Que cresce a cada uso | mutação `ESPELHO` |

### Condições Especiais
| ID | Condição | Frequência |
|---|---|---|
| C01 | Nenhuma (habilidade simples) | comum |
| C02 | Se alvo tem HP abaixo de X% | comum |
| C03 | Se aliado específico está vivo | incomum |
| C04 | Se é o primeiro turno | incomum |
| C05 | Se entidade usou habilidade no turno anterior | incomum |
| C06 | Se há 3+ inimigos em campo | raro |
| C07 | Se entidade tem gene de mutação ativo | raro |
| C08 | Se linhagem tem 3+ gerações | raro |
| C09 | Durante evento global (eclipse, etc.) | muito raro |
| C10 | Sempre ativa (passivo) | variável |

---

## Número de Habilidades por Entidade

| Raridade | Ativas | Passivas | Habilidade Única |
|---|---|---|---|
| ⚪ Comum | 1 | 1 | — |
| 🟢 Incomum | 1 | 1 | — |
| 🔵 Raro | 2 | 1 | — |
| 🟣 Épico | 2 | 2 | — |
| 🟠 Lendário | 2 | 2 | ✅ |
| 🔴 Único | 3 | 2 | ✅ (2 únicas) |

---

## Habilidades Emergentes

Além das habilidades geradas pelos componentes base, existem **habilidades emergentes** — criadas quando combinações específicas de genes aparecem juntas. Elas não podem ser previstas pelo jogador e são reveladas apenas após a fusão.

### Tabela de Emergência (exemplos):

| Combinação de genes | Habilidade emergente | Nome gerado |
|---|---|---|
| AFINIDADE Fogo + AURA > 70 | Cura aliados com chamas (paradoxal) | "Chama Purificadora" |
| NÚCLEO Trickster + VONTADE > 80 | Imita a última habilidade usada pelo inimigo | "Roubo de Memória" |
| ORIGEM Abissal + RESISTÊNCIA > 75 | Converte dano recebido em HP temporário | "Devorar Dor" |
| AFINIDADE Éter + FORÇA > 80 | Ataque que viaja no tempo (age antes do inimigo) | "Passo Eterno" |
| 3+ genes de mutação | Habilidade completamente aleatória a cada combate | "Caos Encarnado" |
| ORIGEM Celestial + NÚCLEO Invocador | Invoca versão ancestral do próprio herói | "Eco do Que Fui" |
| Gene `TRANSCENDÊNCIA` presente | Habilidade que ignora todas as regras de combate uma vez por batalha | "Além das Leis" |

> A descoberta de habilidades emergentes é tratada como conquista: o jogo registra quem descobriu cada combinação primeiro.

---

## Geração de Nome de Habilidade

Nomes de habilidades também são proceduralmente gerados:

```
Formato: [Adjetivo de AFINIDADE] + [Substantivo de EFEITO] + [Sufixo de GATILHO]
```

### Banco de palavras por AFINIDADE:
- **Fogo**: Ardente, Incandescente, Purgador, Chama, Brasas, Cinzas
- **Água**: Tidal, Profundo, Corrente, Névoa, Abissal, Marés
- **Vento**: Veloz, Cortante, Sussurro, Rajada, Eco, Deriva
- **Vazio**: Silente, Devorador, Inexistente, Fratura, Colapso, Nulo
- **Luz**: Radiante, Eterno, Sagrado, Clarão, Revelação, Puro
- **Sombra**: Sombrio, Oculto, Sussurrado, Trevas, Eclipse, Velado

### Banco por EFEITO:
- Dano → Golpe, Lâmina, Impacto, Punho, Toque
- Cura → Graça, Renovo, Alento, Pulso, Bênção
- Escudo → Veste, Muralha, Casca, Véu, Armadura
- Invocação → Chamado, Eco, Manifestação, Convocação, Fragmento

---

## Sinergias entre Habilidades

O sistema rastreia **sinergias** entre habilidades de diferentes membros do time:

### Tipos de Sinergia:
- **Elemental**: Dois heróis com mesma AFINIDADE amplificam efeitos um do outro
- **Arquétipo**: Guardião + Destruidor no mesmo time ativa "Quebra de Defesas"
- **Genética**: Dois heróis da mesma linhagem compartilham 1 passiva extra
- **Oposta**: Heróis com afinidades opostas criam efeitos de ressonância caótica (bônus de risco/recompensa)

---

## Loop de Descoberta

A descoberta de habilidades é parte central do engajamento:

1. **Fusão** → habilidades são reveladas com animação de "despertar"
2. **Primeira batalha** → habilidades emergentes são ativadas e reveladas em combate
3. **Evolução** → ao atingir marcos de nível, modificadores adicionais são desbloqueados
4. **Legado** → ao aposentar o herói, sua habilidade mais poderosa é cristalizada como fragmento de habilidade, podendo ser injetada parcialmente em descendentes

---

## Interface de Habilidades

- Cada habilidade tem visualização clara de: Gatilho → Efeito → Modificador
- Tooltip expandido mostra de quais genes a habilidade emergiu
- Habilidades emergentes têm marcação especial (ícone de descoberta)
- Simulador de combate permite testar habilidades antes de confirmar a fusão

---

## Notas de Design

- O sistema deve gerar habilidades **legíveis**: o jogador entende o que a habilidade faz sem ler um manual
- Habilidades muito complexas (3+ componentes) devem ter tutorial contextual na primeira vez
- Evitar habilidades que se anulem ou sejam completamente inúteis — filtros de qualidade mínima no gerador
- A raridade de uma habilidade deve ser visualmente comunicada (cor, animação, partículas)

---
*Próxima revisão: definir sistema de balanceamento automático + algoritmo de filtragem de habilidades inválidas*
