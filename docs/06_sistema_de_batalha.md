# ⚔️ Sistema de Batalha — Linha de Almas
*Fragmentos de Alma — Design Document v0.1*

---

## Visão Geral

Batalha por turnos, vertical, jogável com uma mão. Toda interação foi desenhada para o polegar — sem arrastar, sem gestos complexos, sem timers de pressão. O combate é sobre **decisão**, não reflexo.

O campo de batalha é dividido verticalmente:
- **Topo**: inimigos (até 3 visíveis simultaneamente)
- **Base**: seus heróis ativos + banco de reserva

---

## Estrutura do Time

O jogador entra em cada batalha com **6 heróis**: 3 ativos e 3 no banco.

```
┌─────────────────────────┐
│   [Inimigo 1] [Ini 2]   │  ← topo da tela
│      [Inimigo 3]        │
│                         │
│  ───── campo ─────      │
│                         │
│  [Herói 1][H2][H3]      │  ← linha ativa (frente/centro/fundo)
│  [Banco A][B][C ]       │  ← banco de reserva
└─────────────────────────┘
```

### Posições da Linha Ativa

| Posição | Papel | Efeito de posição |
|---|---|---|
| **Frente** | Tank / Atacante físico | Recebe dano prioritariamente; acesso a ataques físicos e corpo a corpo |
| **Centro** | Versátil | Ativa sinergias entre flancos; acesso a todos os tipos de habilidade |
| **Fundo** | Suporte / Invocador | Protegido por padrão; potencializa habilidades de suporte, aura e invocação |

> A posição influencia diretamente quais habilidades ficam disponíveis no turno. Um Destruidor no Fundo perde acesso a ataques físicos mas ganha bônus em habilidades de longa distância.

---

## Banco de Reserva

Os 3 heróis no banco ficam visíveis na parte inferior da tela, abaixo da linha ativa, em slots menores.

### Regras de troca:

- A troca pode ser feita **no turno de qualquer herói ativo**
- Realizar a troca **consome a ação daquele turno** — o herói não ataca nem usa habilidade
- O herói que entra **assume a posição** do herói que saiu
- O herói que sai vai ao banco com **HP preservado** (não recupera HP ao entrar no banco)
- Não há cooldown de troca — o mesmo herói pode entrar e sair em turnos consecutivos (mas cada troca ainda custa uma ação)
- Heróis no banco **não recebem dano** de ataques normais (algumas habilidades de inimigo podem afetar o banco — indicado claramente no tooltip do inimigo)

### Interação de troca:
1. Toque no herói ativo que deseja substituir
2. Roda de ações abre — uma das opções é "Trocar"
3. Banco expande levemente mostrando os 3 heróis disponíveis
4. Toque no herói do banco para confirmar
5. Animação breve de entrada → turno passa para o próximo herói

---

## Estrutura de Turno

A ordem de ação é determinada pelo gene **AGILIDADE** de cada entidade em campo (heróis e inimigos intercalados).

### Por turno de herói, o jogador:

```
1. Toca no herói ativo
      ↓
2. Roda de ações abre (arco acessível pelo polegar)
   ├── Habilidade Ativa 1
   ├── Habilidade Ativa 2
   ├── Habilidade Ativa 3
   ├── Trocar (abre banco)
   └── Defender (reduz dano recebido até o próximo turno)
      ↓
3. Se habilidade requer alvo: toque no alvo
      ↓
4. Ação executada → animação → próximo na ordem
```

**Ultimate:** não aparece na roda de ações. É ativada com **toque longo** no herói quando a barra de Ultimate estiver cheia. Isso evita ativação acidental e cria um gesto distinto e satisfatório.

**Sem timers.** O jogo espera o jogador decidir. Combate é sobre estratégia, não velocidade de toque.

---

## Habilidades em Combate

Cada herói possui:

| Tipo | Quantidade | Como funciona |
|---|---|---|
| **Ativas** | 3 | Aparecem na roda de ações; têm cooldown em turnos |
| **Ultimate** | 1 | Carrega por dano dado/recebido; toque longo para ativar |
| **Passivas** | 2 | Sempre ativas; sem interação direta; ícones visíveis abaixo do herói |

### Cooldowns de Ativas
- Habilidades usadas ficam acinzentadas com contador numérico visível
- Cooldown expresso em turnos **do próprio herói** (não turnos globais)
- Passivas nunca entram em cooldown

### Barra de Ultimate
- Barra visível abaixo do sprite do herói na linha ativa
- Carrega com: dano causado, dano recebido, morte de aliado, morte de inimigo
- Taxa de carga varia por gene RESSONÂNCIA
- Ao completar: barra pulsa e herói recebe contorno visual especial
- Heróis no banco **continuam carregando** a barra passivamente (50% da taxa normal)

### Passivas Visíveis
- Dois ícones pequenos permanentes abaixo do herói
- Toque longo no ícone exibe descrição completa
- Quando uma passiva é ativada em combate: ícone pisca brevemente com efeito visual

---

## Árvore de Evolução de Habilidades

As habilidades base são geradas proceduralmente (ver documento 03). A árvore não define *quais* habilidades o herói tem — define *como* elas evoluem.

### Estrutura da Árvore

Cada habilidade (ativa, ultimate ou passiva) tem **3 nós de evolução**, desbloqueados por nível:

```
Habilidade Base (gerada na fusão)
        │
   [Nível 10] → Nó A: modifica o efeito principal
        │
   [Nível 25] → Escolha entre dois caminhos:
                ├── Caminho 1: amplifica o efeito base
                └── Caminho 2: adiciona efeito secundário novo
        │
   [Nível 40] → Nó C: modifica o gatilho ou condição especial
```

### Exemplo de evolução:

**Habilidade base gerada:** "Pulso Ardente" — causa dano de fogo em área, cooldown 2 turnos

| Nível | Nó desbloqueado | Opções |
|---|---|---|
| 10 | Nó A (automático) | Dano aumentado em 15% |
| 25 | Nó B (escolha) | ① Área aumentada para todos os inimigos OU ② Adiciona queimadura por 2 turnos |
| 40 | Nó C (automático) | Cooldown reduzido para 1 turno se matar inimigo |

> A escolha no Nível 25 é a única decisão do jogador na árvore — o resto é progressão automática. Isso mantém a simplicidade sem tirar a agência.

### Evolução da Ultimate

Ultimas têm apenas **1 nó de escolha**, no nível 35:
- Opção 1: aumenta o poder do efeito principal
- Opção 2: adiciona efeito secundário de suporte (ex: cura aliados após usar)

### Evolução de Passivas

Passivas evoluem automaticamente nos níveis 20 e 45, sem escolha do jogador. Isso reflete a natureza "inata" das passivas — elas crescem sozinhas, como instinto.

---

## Ritmo de Batalha

| Elemento | Valor |
|---|---|
| Duração média de batalha | 3–7 minutos |
| Batalhas por andar de dungeon | 3 |
| Heróis inimigos por batalha | 1–4 (escala por bioma) |
| Recuperação de HP entre batalhas | 30% do HP máximo |
| Recuperação de Ultimate entre batalhas | mantida (não zera) |

> Entre batalhas de um mesmo andar, o jogador pode **reorganizar posições** e **trocar heróis ativos/banco** livremente.

---

## Sinergias de Time em Combate

As sinergias definidas nos genes (ver documento 01) se manifestam visivelmente em batalha:

- **Sinergia ativa**: ícone de conexão aparece entre os dois heróis na tela
- **Bônus de sinergia**: exibido brevemente quando ativado ("Sinergia Elemental: +20% dano de Fogo")
- **Sinergia de linhagem**: heróis da mesma árvore genealógica têm ícone dourado de conexão

---

## Morte e Continuidade

- Herói com HP zerado **cai em campo** — animação de dissolução em fragmentos de alma
- Se herói ativo cai: o jogador escolhe qual do banco entra (ação não consome turno — é emergencial)
- Se todos os 6 heróis caem: derrota — o jogador retorna ao início do andar (não perde progresso de fusão ou fragmentos já coletados)
- Heróis derrotados em batalha recuperam **50% do HP** ao fim da dungeon completa

---

## Interface — Princípios de UX

- **Tudo acessível pelo polegar direito** — nenhuma ação exige dois dedos
- **Roda de ações** posicionada no terço inferior da tela, próxima ao natural do polegar
- **Alvos tocáveis** com área de toque generosa (mínimo 48x48dp)
- **Feedback imediato** em cada ação: som + vibração leve + animação
- **Informação sempre visível**: HP, barra de Ultimate, ícones de passiva, cooldowns — nunca escondidos em menus
- **Leitura rápida de inimigos**: ícone de tipo (NÚCLEO) e AFINIDADE visíveis sem precisar tocar

---

## Notas de Design

- Testar extensivamente o alcance do polegar em telas de 5.5" a 6.7"
- A roda de ações não deve bloquear informações críticas do campo
- Animações de habilidade devem ser rápidas mas legíveis — máximo 1.5s por animação de ataque
- Modo de velocidade 2x para jogadores experientes (acelera animações)
- Considerar modo de acessibilidade: substituir roda por lista vertical de ações

---
*Próxima revisão: definir tipos de inimigos, comportamento de IA inimiga e estrutura de chefes de dungeon*
