# 👹 Inimigos, Chefes e Recompensas
*Fragmentos de Alma — Design Document v0.1*

---

## Visão Geral

Inimigos e chefes são **almas corrompidas** — entidades geradas pelo mesmo sistema de genes dos heróis do jogador, mas distorcidas pela corrupção de cada bioma. Isso significa que o jogador nunca enfrenta o mesmo inimigo duas vezes, e que a aparência de cada inimigo já comunica seu perigo antes da batalha começar.

O sistema de dificuldade é calibrado por uma **IA Coletiva** que aprende com os padrões de batalha de todos os jogadores e gera regras periódicas para o motor local — sem custo de IA por usuário, sem latência em tempo real.

---

## Parte 1 — IA Coletiva e Motor de Regras

### Como Funciona

```
[Batalhas de todos os jogadores]
          ↓
  [Coleta agregada de dados]     ← anônima, sem dados pessoais
          ↓
  [IA analisa padrões — 1x por dia]
          ↓
  [Gera pacote de regras .json]
          ↓
  [Distribuído via update silencioso]
          ↓
  [Motor local de cada jogador aplica as regras]
```

A IA nunca roda durante a sessão do jogador. Ela é um **designer assíncrono** que ajusta o jogo globalmente a cada ciclo.

### O Que a IA Observa

| Métrica coletada | Para que serve |
|---|---|
| Taxa de vitória por composição de time | Identificar times muito fortes ou fracos |
| Turnos médios por batalha | Detectar batalhas longas demais (tédio) ou curtas demais (triviais) |
| Taxa de uso de Ultimate | Calibrar carga da barra |
| Ponto de desistência (qual batalha o jogador abandona) | Identificar picos de dificuldade injustos |
| Habilidades emergentes mais usadas | Balancear poder de combinações |
| Taxa de troca de banco por bioma | Detectar se algum bioma força sempre o mesmo estilo |
| Recompensas mais e menos valorizadas | Ajustar drop rates |

### O Que o Pacote de Regras Contém

O pacote gerado é um conjunto de parâmetros — não código executável. O motor local interpreta:

```json
{
  "dificuldade_bioma": {
    "cavernas_abismo": 1.0,
    "pináculo_celestial": 1.3,
    "floresta_primordial": 1.1
  },
  "chance_mutacao_inimigo": 0.08,
  "fator_escala_poder": 0.92,
  "cooldown_ajuste_habilidade": {
    "dano_area": "+1 turno",
    "cura_mass": "sem alteracao"
  },
  "drop_rate_ajuste": {
    "cristais": 1.1,
    "fragmentos_epicos": 0.95
  },
  "chefe_parametros": {
    "hp_fator": 1.0,
    "fase2_gatilho": 0.60,
    "fase3_gatilho": 0.30
  }
}
```

### Salvaguardas

- A IA nunca pode aumentar dificuldade acima de um teto fixo hardcoded
- Qualquer ajuste é gradual — máximo de ±15% por ciclo diário
- Se a IA detectar anomalia (ex: taxa de vitória < 20% em algum bioma), ela aciona redução automática de emergência
- Equipe de design revisa o pacote antes de distribuição — a IA propõe, humanos aprovam

---

## Parte 2 — Inimigos Procedurais: Almas Corrompidas

### Geração de Inimigos

Inimigos são gerados pelo mesmo pipeline de genes dos heróis, com três diferenças:

1. **Corrupção de bioma**: os genes são distorcidos pela essência do bioma onde habitam
2. **Sem linhagem**: inimigos não têm ancestrais — são manifestações espontâneas
3. **Sem Ultimate**: inimigos não acumulam barra de Ultimate (apenas chefes têm)

### Corrupção por Bioma

Cada bioma distorce os genes de formas específicas:

| Bioma | Corrupção | Efeito em batalha |
|---|---|---|
| Cavernas do Abismo | RESISTÊNCIA inflada, AGILIDADE reduzida | Inimigos lentos e duráveis |
| Pináculo Celestial | RESSONÂNCIA alta, RESISTÊNCIA baixa | Inimigos frágeis mas perigosos |
| Floresta Primordial | AURA alta, FORÇA moderada | Inimigos com muitas passivas e buffs |
| Forja Eterna | FORÇA máxima, sem passivas | Inimigos agressivos e previsíveis |
| Mar do Éter | Todos os genes variáveis | Inimigos imprevisíveis — o mais desafiador |
| Vazio Fragmentado | Genes de mutação garantidos | Todo inimigo tem pelo menos 1 mutação |

### Escala de Dificuldade Individual

O poder base de cada inimigo é calculado assim:

```
Poder do inimigo = (Média de poder do time do jogador × fator de bioma) + variação aleatória (±10%)
```

Isso garante que batalhas nunca sejam triviais nem impossíveis — mas a variação de ±10% cria momentos de surpresa em ambas as direções.

### Tipos de Inimigo por Papel

Assim como heróis, inimigos têm papéis definidos pelo gene NÚCLEO — com comportamento de IA distinto:

| NÚCLEO | Comportamento em batalha |
|---|---|
| Guardião | Prioriza atacar o herói na Frente; usa habilidades defensivas se aliado estiver em perigo |
| Destruidor | Sempre ataca o herói com menor HP; ignora heróis de suporte |
| Arauto | Aplica debuffs antes de atacar; troca de alvo a cada turno |
| Trickster | Ataca aleatoriamente; muda de comportamento ao atingir 50% HP |
| Invocador | Nunca ataca diretamente; invoca reforços e usa buffs nos aliados |

### Composições de Grupo

Inimigos aparecem em grupos de 1–4, com composições geradas para criar sinergia entre eles:

- **Grupo simples** (andares iniciais): 2–3 inimigos do mesmo NÚCLEO
- **Grupo tático** (andares médios): 1 Invocador + 2 Destruidores
- **Grupo elite** (andares avançados): composição espelha um time equilibrado de jogador — 1 tank, 1 dps, 1 suporte

### Legibilidade Visual

O jogador deve entender o perigo de um inimigo em 3 segundos, sem ler texto:

- **Tamanho da silhueta** → RESISTÊNCIA (maior = mais tanque)
- **Intensidade da aura** → RESSONÂNCIA (mais brilhante = mais perigoso magicamente)
- **Cor dominante** → AFINIDADE (sistema de cores já definido no doc 02)
- **Ornamentos visíveis** → NÚCLEO (espinhos = Destruidor, véus = Arauto, etc.)
- **Ícone de mutação** → se o inimigo tem gene de mutação, ícone especial aparece no canto do sprite

---

## Parte 3 — Chefes: Almas Antigas

### Identidade dos Chefes

Chefes não são "inimigos grandes". São **antagonistas com contexto** — cada um tem:
- Nome único gerado proceduralmente (mesmo sistema de nomes do doc 02)
- 2–3 linhas de lore exibidas na tela de entrada da batalha
- Visual distinto que combina elementos de múltiplos biomas
- Padrão de comportamento que pode ser aprendido e explorado

### Geração de Chefes

Chefes são gerados com genes mais poderosos que inimigos comuns, mas com uma estrutura adicional:

```
Gene especial de Chefe: DOMINÂNCIA
  ↓
Define qual fraqueza o chefe tem (sempre tem uma)
  ↓
Define qual afinidade amplifica o dano contra ele
  ↓
Visível para o jogador como dica antes da batalha
```

A fraqueza é sempre comunicada — o jogo não esconde. O desafio é **explorar** a fraqueza, não descobri-la.

### Estrutura de 3 Fases

Todo chefe tem 3 fases, gatilhadas por HP:

```
Fase 1 (100% → 60% HP)
  Comportamento base, padrão previsível
  Jogador aprende o ritmo do chefe

Fase 2 (60% → 30% HP)  ← gatilhado pelo parâmetro da IA
  Novo conjunto de habilidades ativas
  Velocidade aumentada
  Visual muda: corrupção fica mais intensa

Fase 3 (30% → 0% HP)  ← gatilhado pelo parâmetro da IA
  Comportamento agressivo e imprevisível
  Habilidade única de chefe ativada (não existe em inimigos comuns)
  Música intensifica
```

### Habilidades Únicas de Chefe

Cada chefe tem 1 habilidade que só ele possui, gerada proceduralmente mas sempre comunicada antes de usar:

- **Aviso visual**: 1 turno antes de usar, o chefe "carrega" a habilidade — animação de preparação
- **Tempo de reação**: o jogador tem 1 turno para se preparar (posicionar, trocar herói, usar escudo)
- Isso cria tensão sem injustiça

### Tipos de Habilidade Única de Chefe:

| Tipo | Efeito | Como preparar |
|---|---|---|
| **Devastação** | Dano massivo no herói da Frente | Trocar para herói com alta RESISTÊNCIA ou usar escudo |
| **Corrupção** | Inverte os buffs de todos os heróis ativos por 2 turnos | Remover buffs antes do turno do chefe |
| **Invocação Massiva** | Invoca 2 inimigos de suporte | Priorizar eliminar os invocados antes de voltar ao chefe |
| **Roubo de Alma** | Copia a habilidade ativa mais usada pelo jogador na batalha | Variar habilidades usadas para dificultar o roubo |
| **Colapso** | Reduz HP de todos os heróis para 1 (não mata) | Ter cura disponível no próximo turno |

### Calibração de Dificuldade de Chefe

A IA calibra chefes para:
- **~65% de vitória na primeira tentativa** — desafiador mas vencível
- **~90% de vitória na segunda tentativa** — o jogador aprendeu o padrão
- Se um chefe específico tiver taxa < 50% por 48h, a IA aciona redução automática de HP em 10%

### Chefes de Evento

Além dos chefes de bioma, existem **Chefes de Evento** — aparecem semanalmente, são mais poderosos, e têm lore conectado à narrativa global do jogo. Derrotá-los contribui para um placar coletivo da comunidade.

---

## Parte 4 — Sistema de Recompensas

### Princípios

1. **Nunca repetir as últimas 5 recompensas** — o sistema rastreia e evita duplicidade recente
2. **Recompensa proporcional ao desafio** — batalhas difíceis dão recompensas melhores
3. **Sempre algo novo em chefes** — chefes sempre dropam pelo menos 1 item que o jogador ainda não possui
4. **Dois tipos de recompensa**: evolutivas (progresso) e cosméticas (expressão)

---

### Recompensas Evolutivas

Ajudam o jogador a progredir no jogo:

| Recompensa | Fonte | Raridade |
|---|---|---|
| Fragmentos de Alma (comuns) | Qualquer batalha | Sempre |
| Fragmentos de Alma (raros) | Andares avançados, chefes | Frequente |
| Cristais de Essência | Chefes, eventos, milestones | Incomum |
| Fragmento de Gene Específico | Chefes de bioma | Raro |
| Fragmento de Habilidade | Chefes de evento | Muito raro |
| Eco Bônus | Batalhas com condição especial cumprida | Raro |

**Fragmento de Gene Específico**: permite injetar um gene exato em uma fusão futura, sem gastar Cristal. Drop exclusivo de chefes — cria motivação para enfrentar chefes além da narrativa.

**Fragmento de Habilidade**: fragmento de uma habilidade emergente rara, que pode ser parcialmente transferida para um herói via fusão especial. O item mais valioso do jogo — só existe via chefes de evento.

---

### Recompensas Cosméticas

Expressão e coleção — não afetam poder:

| Recompensa | O que é | Fonte |
|---|---|---|
| Tema de Fusão | Muda a animação e efeitos visuais da tela de fusão | Chefes de evento |
| Efeito de Aura Decorativo | Partículas especiais que não existem nos genes (ex: borboletas, cristais) | Chefes de bioma |
| Borda de Herói | Frame visual na galeria de coleção | Milestones de batalha |
| Título de Conta | Aparece no perfil público (ex: "Domador do Abismo") | Conquistas de chefe |
| Tema de Interface | Muda cores e fontes da UI do jogo | Eventos sazonais |
| Trilha Sonora de Batalha | Musica alternativa para combate | Chefes raros |

---

### Recompensas por Condição Especial

Além das recompensas padrão, batalhas têm **condições bônus** que multiplicam a recompensa:

| Condição | Bônus |
|---|---|
| Vencer sem perder nenhum herói | +50% de Fragmentos |
| Vencer sem usar Ultimate | +1 Cristal de Essência |
| Vencer em menos de 5 turnos | Fragmento de Gene Específico garantido |
| Vencer com time de mesma ORIGEM | Eco Bônus |
| Vencer chefe na primeira tentativa | Cosmético exclusivo de "primeira vitória" |

Condições são exibidas antes da batalha começar — o jogador decide se quer tentar cumpri-las.

---

### Tabela de Recompensa por Tipo de Batalha

| Tipo | Evolutiva | Cosmética | Condição Bônus |
|---|---|---|---|
| Batalha comum (andar 1–3) | Fragmentos comuns | — | Sim |
| Batalha elite (andar 4–6) | Fragmentos raros | Borda simples | Sim |
| Mini-chefe (a cada 5 andares) | Cristais + Fragmento raro | Efeito de Aura | Sim |
| Chefe de Bioma | Fragmento de Gene Específico | Tema de Fusão | Sim |
| Chefe de Evento | Fragmento de Habilidade | Título + Trilha | Sim (dobrado) |

---

### Anti-Repetição e Anti-Frustração

**Sistema de Memória de Recompensa:**
O jogo mantém um histórico das últimas 5 recompensas recebidas. O gerador de loot evita repetir qualquer item desse histórico — sempre que possível, oferece algo diferente.

**Sistema de Pity de Recompensa:**
Se o jogador completou 10 batalhas sem receber nenhuma recompensa rara, a próxima batalha garante pelo menos 1 item incomum ou superior.

**Recompensa de Sequência:**
Vitórias consecutivas sem derrota constroem um multiplicador de loot (1x → 1.2x → 1.5x → 2x, máximo). Perder uma batalha zera o multiplicador — mas não pune além disso.

**Rotação de Cosméticos:**
Cosméticos disponíveis como drop rotacionam semanalmente. Isso garante que jogadores que entram depois ainda possam obter itens antigos eventualmente, e cria antecipação do que vem na próxima rotação.

---

## Notas de Design

- A fraqueza do chefe deve ser **sempre visível** — o desafio é explorar, não descobrir
- Recompensas cosméticas devem ter o mesmo peso emocional que evolutivas para jogadores de longo prazo
- O sistema de condições bônus deve ser opcional e nunca punitivo — não cumprí-las não é fracasso
- Animação de recompensa deve ser satisfatória e rápida — sem telas longas de "spinning loot"
- Chefes de evento devem ter lore conectado à narrativa principal para dar significado além do gameplay

---
*Próxima revisão: definir comportamento de IA inimiga por NÚCLEO em detalhes, e estrutura de dungeons por bioma*
