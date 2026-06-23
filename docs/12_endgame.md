# ♾️ Endgame — A Fratura Perpétua
*Fragmentos de Alma — Design Document v0.1*

---

## Visão Geral

O endgame de Fragmentos de Alma é construído sobre uma premissa narrativa que justifica a repetição infinita:

> *Quando Kael completa sua jornada e faz a escolha final, o Prima se reorganiza — e Solum entra em um novo ciclo. A corrupção ressurge de formas diferentes. As almas antigas se reconstituem com novos genes. O mundo é o mesmo, mas diferente.*

Isso não é New Game+ genérico. É o lore justificando mecanicamente por que o mundo continua mudando. O jogador não "reseta" — ele **transcende** para o próximo ciclo com todo o seu poder acumulado, mas o mundo ao redor muda suas regras.

O endgame tem 4 pilares independentes que se complementam. O jogador pode focar em um ou todos — cada um oferece recompensas distintas e experiência diferente.

---

## Gatilho do Endgame

O endgame se desbloqueia progressivamente:

```
DESBLOQUEIO PARCIAL (após completar 4 territórios):
  → Torres de Ressonância desbloqueadas

DESBLOQUEIO COMPLETO (após derrotar todos os 7 Fragmentos Antigos):
  → Escolha Final de Kael (ver doc 08, Camada 3)
  → Entrada no Ciclo 1 de Solum
  → Conflito de Facções desbloqueado
  → Fragmentos Ancestrais desbloqueados

A CADA 3 MESES:
  → Novo Ciclo de Solum inicia
  → Conteúdo sazonal disponível para todos os jogadores
```

---

## Pilar 1 — Torres de Ressonância

### Conceito
Conteúdo vertical infinito. Uma torre de 100 andares onde os inimigos são gerados com genes cada vez mais extremos — versões hiperbolizadas do sistema de corrupção normal. Não é "mais difícil" de forma linear: é **fundamentalmente diferente** a cada 25 andares.

### Estrutura da Torre

```
ANDARES 1-25: RESSONÂNCIA FRACA
  Inimigos com genes normais mas stats 20-40% acima do jogador médio
  Mecânica especial: nenhuma
  Mini-chefe no andar 10
  Chefe no andar 25: "Eco da Superfície" (versão corrompida de um inimigo comum)

ANDARES 26-50: RESSONÂNCIA MÉDIA
  Inimigos com 1-2 mutações garantidas
  Mecânica especial: "Ressonância Elemental" — a cada 5 andares, uma afinidade
    é "amplificada" (+50% dano e resistência a essa afinidade para todos os inimigos)
  Mini-chefe no andar 35
  Chefe no andar 50: "Eco das Profundezas" (versão com 4 fases, não 3)

ANDARES 51-75: RESSONÂNCIA ALTA
  Inimigos com genes híbridos (duas afinidades simultâneas)
  Mecânica especial: "Memória de Batalha" — inimigos aprendem com as 3 últimas
    ações do jogador e aplicam contra-estratégia no próximo turno
  Mini-chefe no andar 60
  Chefe no andar 75: "Eco do Núcleo" (um dos 7 Fragmentos Antigos, remixado)

ANDARES 76-100: RESSONÂNCIA PURA
  Inimigos com todos os genes no máximo, múltiplas mutações
  Mecânica especial: "Prima Invertido" — as regras de posição são invertidas
    (herói no Fundo recebe dano prioritariamente, herói na Frente é protegido)
  Mini-chefe no andar 90
  Chefe no andar 100: "O Eco do Primeiro" (versão do primeiro Fragmentador,
    a batalha mais difícil do jogo — só para o ranking mais alto)
```

### Sistema de Ranking

```
RANKING SEMANAL:
  - Reset toda segunda-feira às 00h UTC
  - Ranking: andar mais alto alcançado (empate resolvido por menor número de turnos)
  - Top 100 exibidos no perfil público com título especial
  - Top 10: título único de temporada ("Ressonante da Semana")
  - Top 1: título lendário permanente no perfil ("Eco do Pináculo — Semana X")

RANKING HISTÓRICO:
  - Andar mais alto alcançado em qualquer semana fica registrado no perfil
  - Serve como métrica de progressão pessoal

RECOMPENSAS SEMANAIS POR MARCO:
  Andar 25: 500 Fragmentos de Alma + 1 Cristal
  Andar 50: 1500 Fragmentos + 3 Cristais + fragmento raro garantido
  Andar 75: 3000 Fragmentos + 5 Cristais + fragmento épico garantido
  Andar 100: 10000 Fragmentos + 10 Cristais + fragmento lendário garantido
             + cosmético exclusivo da semana
```

### Regras Especiais das Torres

```
- O jogador leva o mesmo time de 6 heróis que usa nas dungeons normais
- Heróis derrotados dentro da torre não recuperam HP entre andares
  (recuperam 15% ao invés dos 30% normais das dungeons)
- Fragmentos coletados dentro da torre são mantidos mesmo em derrota
- Se o jogador fechar o app durante a torre, o progresso da sessão é mantido por 24h
- Não existe "tentar de novo" no mesmo andar — derrota volta ao início do bloco de 25
  (ex: derrotar no andar 47 volta para o andar 26)
```

---

## Pilar 2 — Conflito de Facções (PvP Assíncrono)

### Conceito
Jogadores escolhem uma facção por semana e contribuem para um esforço de guerra coletivo. Batalhas PvP são disputadas de forma assíncrona — o adversário não está online, mas seu time foi construído por ele. Vencer contribui pontos para a facção. A facção vencedora ganha controle de um território no mapa com bônus de drop para seus membros.

### Estrutura Semanal

```
SEGUNDA-FEIRA — Declaração de Guerra:
  O sistema (IA coletiva) analisa o equilíbrio de poder das 7 facções
  e declara 2-3 conflitos territoriais para a semana
  Ex: "Kethara reivindica território fronteiriço de Verdania"

TERÇA A SÁBADO — Período de Combate:
  Jogadores de cada facção disputam batalhas PvP assincrono
  Cada vitória = pontos para a facção
  Cada jogador pode disputar até 10 batalhas por dia (sem limite hard — apenas 10 com loot completo)

DOMINGO — Resolução:
  Facção com mais pontos vence o território disputado
  Animação especial no mapa: território muda de controle visualmente
  Recompensas distribuídas

SEGUNDA-FEIRA SEGUINTE — Reset:
  Novos conflitos declarados baseados no novo equilíbrio de poder
```

### Mecânica de PvP Assíncrono

```
DEFESA:
  - Cada jogador define um "time de defesa" de 3 heróis (não o mesmo time de ataque)
  - Time de defesa fica disponível para outros jogadores atacarem
  - Jogador não é notificado em tempo real de cada ataque — recebe resumo diário

ATAQUE:
  - Jogador escolhe um adversário da facção inimiga para atacar
  - Adversários são sugeridos pelo sistema com poder similar ao do jogador
  - Batalha é disputada normalmente com o time de ataque do jogador
  - IA controla o time de defesa do adversário (usando o comportamento de NÚCLEO — ver doc 07)

BALANCEAMENTO:
  - Poder do time de defesa é ajustado pela IA coletiva para garantir
    taxa de vitória ~50% entre jogadores de poder similar
  - Jogadores muito mais fracos não são emparelhados com muito mais fortes
```

### Recompensas de Conflito

```
POR VITÓRIA INDIVIDUAL:
  - 100 Pontos de Facção (contribuem para o esforço de guerra)
  - 200 Fragmentos de Alma
  - 20% chance de fragmento incomum

POR DERROTA INDIVIDUAL:
  - 20 Pontos de Facção (participação conta)
  - 50 Fragmentos de Alma

AO FINAL DA SEMANA — FACÇÃO VENCEDORA:
  Todos os membros recebem baseado em contribuição:
  Top 10% contribuidores: fragmento épico + 5 Cristais + cosmético de facção
  Top 25% contribuidores: fragmento raro + 3 Cristais
  Demais membros: 2 fragmentos raros + 1 Cristal

AO FINAL DA SEMANA — FACÇÃO PERDEDORA:
  Consolação: 500 Fragmentos + 1 fragmento incomum
  (Perder não deve ser punitivo — apenas menos recompensador)

CONTROLE DE TERRITÓRIO:
  - Território controlado pela facção: jogadores membros recebem +20% de drop naquele território
  - Dura até o próximo conflito territorial envolvendo aquele território
```

### Política do Conflito

```
- Um jogador só pode ser membro de UMA facção por vez
- Trocar de facção tem cooldown de 7 dias
- Trocar de facção perde 30% da reputação acumulada com a facção anterior
- A facção que o jogador escolhe deve ser coerente com sua reputação no jogo principal
  (não é obrigatório, mas há bônus de coesão se reputação > +50 com a facção escolhida)
- Jogadores sem facção podem disputar batalhas como "Errantes" mas recebem 50% das recompensas
```

---

## Pilar 3 — Fragmentos Ancestrais

### Conceito
Após completar todos os 7 territórios, surgem os **Fragmentos Ancestrais** — versões corrompidas e muito mais poderosas dos 7 Fragmentos Antigos (chefes narrativos). Cada Fragmento Antigo, após ser derrotado por Kael, "ressurge" corrompido pela Prima fragmentada — agora sem a consciência original, apenas o poder bruto. São o conteúdo mais difícil do jogo, e dropar um Herói Único é o prêmio mais raro existente.

### Como Diferem dos Chefes Originais

```
FRAGMENTO ANTIGO (chefe narrativo, primeira derrota):
  - 3 fases
  - Habilidade única telegrafada 1 turno antes
  - Dificuldade calibrada para ~65% de vitória na primeira tentativa
  - Tem narrativa, diálogo, humanização
  - Derrotado uma vez — libera o lore

FRAGMENTO ANCESTRAL (endgame, infinitamente repetível):
  - 4 fases (fase extra: "Corrupção Total" abaixo de 15% de HP)
  - Habilidades NÃO telegrafadas — o jogador precisa aprender os padrões
  - Dificuldade calibrada para ~20% de vitória na primeira tentativa
  - Sem diálogo — é força pura e caótica
  - Repetível infinitamente — cada derrota é aprendizado, cada vitória é conquista
  - Genes mudam levemente a cada semana (IA coletiva ajusta)
```

### A Fase 4 — Corrupção Total

```
Gatilho: HP abaixo de 15%
Duração máxima: 5 turnos (após isso, Fragmento Ancestral recupera 30% HP e reseta)

Na Fase 4:
  - Fragmento Ancestral usa habilidade especial a cada turno (sem espera)
  - Todas as habilidades do jogador têm cooldown +1 turno
  - Inimigos invocados na Fase 3 permanecem em campo
  - Visual: o sprite do Fragmento Ancestral "quebra" em múltiplos fragmentos
    que se reúnem no início de cada turno (representando a corrupção)

Para vencer: derrotar dentro de 5 turnos OU acumular dano suficiente para
matar antes que o timer expire
```

### Rotação Semanal

```
- Cada semana, 2 dos 7 Fragmentos Ancestrais estão disponíveis
- Rotação definida pela IA coletiva baseada em quais foram menos derrotados
  (garante que todos os 7 sejam relevantes ao longo do tempo)
- O jogador pode ver a rotação da próxima semana com 48h de antecedência
```

### Recompensas de Fragmentos Ancestrais

```
PRIMEIRA DERROTA DA SEMANA (de cada Fragmento Ancestral):
  Garantido:
  - 1 fragmento épico
  - 5 Cristais de Essência
  - 30 Ecos

  Chance adicional (não garantido):
  - 15%: fragmento lendário
  - 3%: fragmento de gene específico raro
  - 0.5%: fragmento de Herói Único (o drop mais raro do jogo)

DERROTAS SUBSEQUENTES (mesma semana):
  - 1 fragmento raro garantido
  - 2 Cristais de Essência
  - 5% chance de fragmento épico
  (sem chance de Único em derrotas repetidas — apenas na primeira da semana)

COSMÉTICO EXCLUSIVO:
  Cada Fragmento Ancestral tem um cosmético temático único
  Dropável apenas nele, taxa 5% por primeira derrota semanal
  Uma vez obtido, não dropa novamente
```

---

## Pilar 4 — Ciclos de Solum (Temporadas)

### Conceito

A cada 3 meses, Solum entra em um novo Ciclo. O lore justifica: após a Escolha Final de Kael, o Prima se reorganiza — não volta ao estado anterior, mas forma uma nova configuração. O mundo é o mesmo, mas as leis alquímicas operam de formas diferentes.

Mecanicamente: um modificador global muda uma regra fundamental do jogo por 3 meses.

### Estrutura de um Ciclo

```
SEMANAS 1-2: Prólogo do Ciclo
  - Evento de lore introdutório: cutscene curta explicando o que mudou no mundo
  - Tutorial contextual da mecânica nova do Ciclo
  - Território temporário desbloqueado (acessível durante o Ciclo inteiro)

SEMANAS 3-10: Ciclo Principal
  - Modificador global ativo
  - Conteúdo do território temporário disponível
  - Alma Antiga inédita como chefe de evento (semanas 4 e 8)
  - Conflito de Facções com peso extra (pontos em dobro para o território do Ciclo)

SEMANA 11-12: Epílogo do Ciclo
  - Evento final: batalha coletiva da comunidade (ver abaixo)
  - Distribuição de recompensas finais de Ciclo
  - Preview do próximo Ciclo (nome + modificador revelado)
```

### Modificadores de Ciclo (exemplos)

Cada Ciclo tem UM modificador global que muda como o jogo funciona:

```
CICLO DA INVERSÃO:
  "A Prima inverteu sua polaridade — genes recessivos se tornaram dominantes."
  Mecânica: na fusão, o gene de menor valor é o que é herdado (invertido da regra normal)
  Estratégia: jogadores buscam fragmentos com genes "ruins" propositalmente
  Impacto visual: paleta do mapa invertida sutilmente (azuis e laranjas trocam intensidade)

CICLO DO ESQUECIMENTO:
  "A Prima de Mente está em colapso — memórias se fragmentam."
  Mecânica: heróis perdem 1 habilidade aleatória no início de cada batalha
    (habilidade volta ao fim da batalha — não é permanente)
  Estratégia: builds com redundância de habilidades se tornam valiosas
  Impacto visual: névoa de Mnemos se espalha pelo mapa

CICLO DO SANGUE:
  "A Ordem Carmesim abriu os selos — o sangue flui entre todas as almas."
  Mecânica: heróis com vínculo 3+ estrelas compartilham 10% do HP recebido/perdido
  Estratégia: times de heróis com alto vínculo se tornam poderosos mas arriscados
  Impacto visual: veias vermelhas percorrem as linhas de Prima no mapa

CICLO DO CAOS:
  "Os Fragmentos Antigos ressurgiram simultaneamente — a Prima é puro caos."
  Mecânica: a cada turno, um gene aleatório de cada herói em campo é temporariamente
    substituído por um gene aleatório (reverte no próximo turno)
  Estratégia: menos planejamento, mais adaptação — o Ciclo mais imprevisível
  Impacto visual: o mapa pisca entre as cores de todas as afinidades

CICLO DO SILÊNCIO:
  "A Prima de Vazio absorveu as vozes — habilidades custam mais para usar."
  Mecânica: cooldowns de todas as habilidades ativas +1 turno
  Estratégia: passivas e ultimates ganham valor relativo enorme
  Impacto visual: o mapa fica mais escuro, partículas de Prima somem

CICLO DA VIDA ETERNA:
  "O Jardim Perpétuo corrompeu o Prima de Vida — heróis não morrem facilmente."
  Mecânica: quando um herói chega a 0 HP, fica com 1 HP e imune por 1 turno
    (só pode acontecer uma vez por herói por batalha)
  Estratégia: times agressivos ficam mais poderosos; foco em burst damage
  Impacto visual: Verdania domina o mapa com verde intenso

CICLO DA FORJA:
  "Os Mestres da Pedra Viva descobriram como reforjar almas."
  Mecânica: fusões custam 50% menos Fragmentos de Alma, mas
    a chance de mutação positiva é reduzida à metade
  Estratégia: ideal para jogadores que querem acumular heróis rapidamente
  Impacto visual: faíscas douradas percorrem as linhas de Prima
```

### Território Temporário do Ciclo

```
Cada Ciclo adiciona um território temporário ao mapa:
  - Aparece na borda do mapa, como se emergisse do Véu
  - Tem afinidade elemental única para aquele Ciclo
  - 15 andares de dungeon (mais que os territórios normais)
  - Chefe único: a Alma Antiga do Ciclo (não um dos 7 Fragmentos Antigos — novo)
  - Fragmentos exclusivos do Ciclo dropáveis aqui
  - Desaparece quando o Ciclo termina (o conteúdo vai, os itens ficam)

Visual no mapa:
  - Território emerge do Véu com animação de "surgimento" (névoa se dissipa revelando terra)
  - Borda do território: linha dourada pulsante (indicando temporariedade)
  - Ícone de relógio dourado no canto (indicando que vai expirar)
  - Contador de dias restantes no painel lateral do território
```

### Evento Final do Ciclo — A Batalha Coletiva

```
Na semana 12 de cada Ciclo, todos os jogadores enfrentam coletivamente
a Alma Antiga do Ciclo em uma batalha coletiva assíncrona:

- Cada jogador contribui com uma batalha contra a Alma Antiga
- O dano total acumulado de todos os jogadores é somado
- Barra de HP da Alma Antiga é global (ex: 1.000.000.000 de HP)
- Quando a barra global chega a zero, a batalha é vencida coletivamente

RECOMPENSAS COLETIVAS (distribuídas a todos que participaram):
  - Cosmético exclusivo do Ciclo (não volta em nenhum Ciclo futuro)
  - 50 Ecos
  - 5 Cristais de Essência
  - Fragmento lendário

RECOMPENSAS POR CONTRIBUIÇÃO:
  Top 10% de dano causado: fragmento de Herói Único + título de Ciclo
  Top 25%: fragmento lendário extra + cosmético de perfil
  Participantes: recompensas base acima
```

### Progressão entre Ciclos

```
O QUE O JOGADOR MANTÉM ENTRE CICLOS:
  ✅ Todos os heróis
  ✅ Todos os fragmentos
  ✅ Todos os recursos (Fragmentos, Cristais, Ecos)
  ✅ Toda a progressão de Kael
  ✅ Todo o progresso de biomas permanentes
  ✅ Todas as reputações de facção
  ✅ Todos os cosméticos
  ✅ Todos os títulos e conquistas

O QUE MUDA A CADA CICLO:
  🔄 Modificador global de mecânica
  🔄 Território temporário (novo)
  🔄 Alma Antiga inédita como chefe
  🔄 Cosméticos exclusivos disponíveis
  🔄 Estado político do mundo (conflitos de facção resetam)
  🔄 Rankings das Torres de Ressonância
  🔄 Rotação de Fragmentos Ancestrais

O QUE NUNCA VOLTA:
  ❌ Cosméticos exclusivos de Ciclos passados
  ❌ Títulos de "Top contribuidor" de Ciclos passados
  ❌ A Alma Antiga específica de cada Ciclo como chefe de evento
     (pode aparecer como Fragmento Ancestral no futuro, mas nunca como evento)
```

---

## Loop de Endgame — Sessão Típica

```
SESSÃO DE 15-20 MIN (jogador casual de endgame):
  → Verificar Torres de Ressonância: tentar avançar 2-3 andares
  → 1-2 batalhas de Conflito de Facções
  → Verificar se há Fragmento Ancestral disponível esta semana — tentar uma vez

SESSÃO DE 45-60 MIN (jogador dedicado de endgame):
  → Bloco de Torres: tentar quebrar recorde pessoal
  → 5-10 batalhas de Conflito de Facções (contribuição significativa)
  → Tentativas repetidas de Fragmento Ancestral para drop de Único
  → Fusões com fragmentos acumulados para otimizar o time

SESSÃO ESPECIAL (evento de Ciclo):
  → Participar da Batalha Coletiva
  → Explorar território temporário completamente
  → Derrotar Alma Antiga do Ciclo pela primeira vez
```

---

## Integração com os Outros Sistemas

| Sistema | Como endgame o usa |
|---|---|
| Fusão procedural | Torres exigem heróis otimizados — a fusão nunca para de ter propósito |
| Habilidades emergentes | Descobrir habilidades emergentes ainda relevantes no endgame — torres expõem combinações novas |
| Sistema de batalha | Torres e Fragmentos Ancestrais exigem domínio total da roda de ações e do banco |
| Progressão de Kael | Passivas de Kael de níveis altos (60-100) são essenciais para Torres avançadas |
| Economia | Recompensas de endgame são a principal fonte de Cristais e Fragmentos lendários |
| Narrativa | Ciclos de Solum estendem o lore — cada Ciclo tem contexto narrativo próprio |
| IA coletiva | Calibra dificuldade das Torres e dos Fragmentos Ancestrais semanalmente |
| Mapa de Solum | Territórios temporários e conflitos de facção se refletem no mapa em tempo real |

---

## Métricas de Saúde do Endgame

A IA coletiva monitora continuamente:

```
TORRES DE RESSONÂNCIA:
  Meta: 30% dos jogadores de endgame chegam ao andar 50+ por semana
  Se < 20%: reduzir stats dos inimigos em 5%
  Se > 50%: aumentar stats em 5% ou adicionar mecânica especial

CONFLITO DE FACÇÕES:
  Meta: distribuição de jogadores entre facções com no máximo 30% de diferença
  Se uma facção tem > 40% dos jogadores: bônus de recompensa para facções menores

FRAGMENTOS ANCESTRAIS:
  Meta: 10-15% de taxa de vitória na primeira tentativa
  Se < 5%: reduzir HP da fase 4 em 10%
  Se > 25%: adicionar novo comportamento à fase 3

RETENÇÃO DE ENDGAME:
  Meta: 70% dos jogadores de endgame voltam na semana seguinte
  Se < 60%: acionar evento especial não planejado (Ciclo Rápido de 2 semanas)
```

---

## Notas de Design

- O endgame não deve ter "fim" — um jogador de 2 anos ainda deve ter algo para fazer e conquistar
- Ciclos de Solum são a âncora de longo prazo — o jogador sabe que em 3 meses o mundo muda, e isso cria expectativa
- Torres de Ressonância satisfazem o jogador que quer progressão mensurável (ranking claro)
- Conflito de Facções satisfaz o jogador social (contribuir para algo maior que si mesmo)
- Fragmentos Ancestrais satisfazem o jogador de conquista (o drop de Único é o Santo Graal)
- Nenhum pilar deve ser obrigatório — jogador que odeia PvP pode ignorar Conflito de Facções completamente e ainda ter endgame rico
- Cosméticos exclusivos de Ciclo são o principal driver de FOMO saudável — não poder é frustrante, mas é sempre substituído por algo novo em 3 meses

---
*Próxima revisão: detalhar Almas Antigas de cada Ciclo e estrutura de narrativa de Ciclo*
