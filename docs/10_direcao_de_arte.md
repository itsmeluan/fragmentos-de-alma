# 🎨 Direção de Arte — Alquimia Noire
*Fragmentos de Alma — Briefing para Claude*
*Versão 0.1*

---

## Como Usar Este Documento

Este briefing deve ser lido pelo Claude antes de criar qualquer elemento visual do jogo — componentes React Native, SVGs, sistemas de cor, tipografia, animações, ícones ou layouts. Ele define a linguagem visual de Fragmentos de Alma de forma que qualquer elemento criado isoladamente seja coerente com o todo.

**Referências de inspiração:**
- **Fullmetal Alchemist (manga e Brotherhood):** peso visual, matéria, transmutação, custo físico, anatomia expressiva, mundo com consequências
- **Persona 5 (UI/UX):** composições inclinadas, tipografia agressiva, elementos que quebram a tela, feedback visual marcante, velocidade e estilo em cada interação

**O que NÃO copiar diretamente:**
- Não usar o vermelho+preto exato de Persona 5 (aqui a paleta tem identidade própria)
- Não usar o visual de anime de FMA para os personagens (aqui é semi-plano com influência de ilustração ocidental)
- Não referenciar nenhum personagem, símbolo ou elemento específico de nenhuma das obras

**O objetivo:** alguém que conhece as duas obras deve sentir a influência sem conseguir apontar o que foi copiado. A mistura deve criar algo novo.

---

## 1. Identidade Visual Central

### Nome da Direção
**Alquimia Noire** — a palavra "noire" captura o peso, a escuridão e o mistério. Não é dark fantasy genérico. É um mundo com regras, consequências e beleza severa.

### Três Palavras que Definem Tudo
Toda decisão visual deve responder "isso é **Pesado, Estiloso, Vivo**?"

- **Pesado:** o mundo de Solum tem peso físico. Matéria importa. Nada é leve ou etéreo sem razão alquímica. Sombras são densas. Linhas têm espessura. Elementos têm massa.
- **Estiloso:** cada tela, cada transição, cada ícone deve parecer que foi composto por um designer obcecado. Nada é padrão. Nada é genérico. A UI é parte da experiência artística.
- **Vivo:** o jogo respira. Elementos pulsam sutilmente. Partículas existem. Transições têm personalidade. O mundo reage ao toque.

---

## 2. Paleta de Cores

### Cores Fundamentais

```
FUNDO PRIMÁRIO      #0A0A0F   (preto profundo com toque azul — não preto puro)
FUNDO SECUNDÁRIO    #111118   (para cards, modais, superfícies elevadas)
FUNDO TERCIÁRIO     #1A1A24   (para elementos interativos em repouso)

DOURADO QUEIMADO    #C8960C   (cor de destaque primária — ouro alquímico, não amarelo)
DOURADO CLARO       #E8B84B   (hover, selecionado, brilho)
DOURADO ESCURO      #8A6508   (bordas, detalhes sutis)

VERMELHO SANGUE     #8B1A1A   (perigo, dano, corrupção, alquimia de sangue)
VERMELHO VIVO       #C0392B   (ações críticas, alertas, afinidade Fogo)
VERMELHO ESCURO     #5C0F0F   (backgrounds de estado crítico)

AZUL COBALTO        #1A3A6E   (magia, éter, alquimia da mente)
AZUL CLARO          #2E5FA3   (elementos de informação, links)
AZUL GELO           #7BA7D4   (texto secundário em contextos escuros)

BRANCO PERGAMINHO   #E8E0D0   (texto principal — não branco puro, tem calor)
CINZA MÉDIO         #8A8A9A   (texto secundário, desabilitado)
CINZA ESCURO        #3A3A4A   (divisores, bordas sutis)
```

### Cores de Raridade (ver doc 01)
```
COMUM               #9E9E9E   (cinza neutro)
INCOMUM             #2E7D32   (verde escuro, não vibrante)
RARO                #1565C0   (azul profundo)
ÉPICO               #6A1B9A   (roxo escuro)
LENDÁRIO            #E65100   (laranja queimado — não amarelo genérico)
ÚNICO               #B71C1C   (vermelho escuro intenso)
```

### Cores de Afinidade Elemental (ver doc 02)
```
FOGO                #C0392B / #E67E22 / #FFEB3B
ÁGUA                #1A6E8E / #2980B9 / #AEE6FF
TERRA               #5D4037 / #8D6E63 / #A5D6A7
VENTO               #80CBC4 / #B2EBF2 / #FFFFFF
VAZIO               #1A1A2E / #6A0572 / #E040FB
LUZ                 #FFF9C4 / #FDD835 / #FFFFFF
SOMBRA              #212121 / #4A148C / #9C27B0
ÉTER                #E8EAF6 / #5C6BC0 / #82B1FF
```

### Regras de Uso de Cor
- Fundos sempre escuros — a UI vive no escuro, elementos de cor emergem do preto
- Dourado é reservado para elementos de alto valor: nomes de heróis lendários, CTAs primários, bordas de raridade alta
- Nunca usar branco puro (#FFFFFF) — sempre Branco Pergaminho ou variação
- Vermelho Sangue apenas para estados negativos (dano, morte, perigo) — nunca decorativo
- Gradientes são permitidos mas devem ser sutis — de uma cor para uma variação mais escura dela, não arco-íris

---

## 3. Tipografia

> **Nota (D59):** em 2026-06-26 todas as fontes foram consolidadas em **Rajdhani** para uniformidade visual com o estilo pixel art dos sprites. Cinzel e Libre Baskerville foram removidas do tema ativo. A razão: o estilo pixel art cria uma linguagem visual coesa que funciona melhor com uma fonte geométrica e condensada em todos os contextos.

### Fonte Única — "Rajdhani"
*(disponível no Google Fonts, gratuita — pacote `@expo-google-fonts/rajdhani`)*

```
Pesos usados: 500Medium / 600SemiBold / 700Bold
Características: geométrica, condensada, técnica, boa legibilidade em telas pequenas
Sensação: dados em tempo real, urgência, clareza
```

### Hierarquia Tipográfica Atual

| Uso | Peso | Tamanho | letterSpacing | Cor |
|---|---|---|---|---|
| Títulos de tela | `Rajdhani_700Bold` | 22–28px | 3 | DOURADO_QUEIMADO |
| Nome de herói (card) | `Rajdhani_600SemiBold` | 18px | 1 | BRANCO_PERGAMINHO |
| Stats e números | `Rajdhani_600SemiBold` | 16px | 0.5 | BRANCO_PERGAMINHO |
| Labels de UI | `Rajdhani_500Medium` | 12px | 1.5, uppercase | CINZA_MÉDIO |
| Corpo de texto / lore | `Rajdhani_500Medium` | 14px, lh 22 | — | BRANCO_PERGAMINHO |
| Botões de ação | `Rajdhani_700Bold` | 13px | 2, uppercase | fundo escuro |
| Texto de raridade | `Rajdhani_600SemiBold` | 11px | 2, uppercase | cor da raridade |

### Regras de Tipografia
- `fontWeight: '700'` **não funciona** com fontes customizadas no React Native — especificar sempre `fontFamily: 'Rajdhani_700Bold'` explicitamente
- Títulos de tela sempre em UPPER CASE com `letterSpacing: 3`
- Números de dano/cura em `Rajdhani_700Bold`, tamanho grande — lidos instantaneamente
- Nunca misturar famílias de fonte — toda a UI usa Rajdhani
- Não existe variante itálica em Rajdhani; para contextos narrativos, usar `Rajdhani_500Medium` com cor ligeiramente mais clara

```typescript
// theme.ts — valores atuais (fonte de verdade)
typography: {
  title:     { fontFamily: 'Rajdhani_700Bold',    fontSize: 28, letterSpacing: 3   },
  heroName:  { fontFamily: 'Rajdhani_600SemiBold', fontSize: 18, letterSpacing: 1  },
  stat:      { fontFamily: 'Rajdhani_600SemiBold', fontSize: 16, letterSpacing: 0.5 },
  label:     { fontFamily: 'Rajdhani_500Medium',   fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  body:      { fontFamily: 'Rajdhani_500Medium',   fontSize: 14, lineHeight: 22    },
  bodyItalic:{ fontFamily: 'Rajdhani_500Medium',   fontSize: 14, lineHeight: 22    }, // sem itálico real
}
```

---

## 4. Linguagem Visual de UI

### O Princípio Persona 5 Adaptado

Persona 5 usa recortes de jornal, ângulos agudos e elementos que "invadem" o espaço. Em Fragmentos de Alma, a mesma energia é traduzida para vocabulário alquímico:

- **Em vez de recortes de jornal** → páginas de grimório rasgadas, bordas irregulares como papel queimado
- **Em vez de manchetes** → inscrições em runas, selos de transmutação
- **Em vez de vermelho/preto de Persona** → dourado/preto com acentos de cor elemental
- **Em vez de Morgana** → fragmentos de Prima flutuantes como elemento de UI

### Elementos de Interface

**Cards de Herói (D49–D51)**
```
Layout: formato retrato, 3 colunas na grade
Largura: Math.floor((screenWidth - 32) / 3) — fixo por prop, sem stretch

Estrutura de camadas (de baixo para cima):
  1. Wrapper externo: sombra roxa (#2a0d60), sem overflow:hidden (compatibilidade iOS)
  2. Pressable interno: overflow:hidden, fundo preto (#09080f)
  3. HeroSprite (Canvas Skia): arte pixel art, largura total, inset horizontal 5px
     - Sprite Único com UNIQUE_SPRITE_INSET_RATIO = 0.10 (80% da área)
  4. Strip superior (26px, absolute top:0): nome + nível em Rajdhani_700Bold/500Medium
  5. Strip inferior (42px, absolute bottom:0): ícone afinidade + Classe·Origem + estrelas

Fundo: preto profundo (#09080f) — sem borda de raridade colorida
A raridade é comunicada pelo sprite (detalhes extras nos tiers altos) e pelas estrelas
BorderRadius: 2 nos cantos — mínimo para não parecer recortado pixelado
```

> **Nota:** o design original especificava 2 colunas com cantos diagonais (clip path). O redesenho para 3 colunas portrait foi adotado para acomodar sprites pixel art e melhorar a densidade da grade em telas móveis (D49–D51).

**Botões**
```
Primário (CTA):
  background: DOURADO_QUEIMADO
  color: #0A0A0F (texto escuro no fundo dourado)
  fontFamily: Rajdhani-SemiBold
  letterSpacing: 2
  textTransform: uppercase
  borderRadius: 2 (quase sem arredondamento)
  paddingVertical: 14, paddingHorizontal: 24
  sombra: 0 0 12px rgba(200, 150, 12, 0.4)  (glow dourado)

Secundário:
  background: transparent
  borderWidth: 1, borderColor: DOURADO_ESCURO
  color: BRANCO_PERGAMINHO
  (mesmos outros atributos)

Destrutivo / Perigo:
  background: VERMELHO_SANGUE
  color: BRANCO_PERGAMINHO
  borderWidth: 1, borderColor: VERMELHO_VIVO
```

**Modais e Overlays**
```
- Fundo: rgba(0, 0, 0, 0.85) com blur leve
- Container: FUNDO_SECUNDÁRIO, borda superior de 2px em DOURADO_QUEIMADO
- Entrada: slide de baixo para cima com fade, duração 250ms
- Canto superior: elemento decorativo de selo alquímico (SVG simples)
- Título do modal: Cinzel, centralizado, com linhas decorativas horizontais dos dois lados
```

**Barras de Progresso (HP, XP, Ultimate)**
```
HP:
  background: #1A0A0A
  fill: gradiente de VERMELHO_VIVO para VERMELHO_SANGUE
  borderRadius: 1
  height: 6px
  borda: 0.5px #5C0F0F

Ultimate:
  background: #0A0A1A
  fill: gradiente da cor elemental do herói
  animação: pulso leve quando cheia (scale 1.0 → 1.02 → 1.0, loop)
  height: 4px

XP:
  background: FUNDO_TERCIARIO
  fill: DOURADO_ESCURO → DOURADO_QUEIMADO
  height: 3px
```

**Separadores e Divisores**
```
- Linha simples: 0.5px, CINZA_ESCURO, opacidade 60%
- Linha decorativa (títulos): linha central com ornamento alquímico no meio
  ─────── ✦ ───────
  implementar como SVG inline ou texto com caracteres especiais
- Nunca usar bordas grossas como separador — peso visual reservado para bordas de raridade
```

**Ícones**
```
- Estilo: line icons com peso de 1.5px — não preenchidos, não muito finos
- Cantos: angulares, não arredondados
- Tamanhos: 16px (inline), 24px (navegação), 32px (destaque), 48px (herói)
- Cor: CINZA_MEDIO em repouso, BRANCO_PERGAMINHO em ativo, DOURADO_QUEIMADO em destaque
- Ícones de afinidade elemental: únicos por elemento, baseados em símbolos alquímicos reais
  (mas estilizados, não copiados de fontes existentes)
```

### Composição e Layout

**Grid**
```
- Margem horizontal: 16px em telas até 390px, 20px acima
- Espaçamento interno de cards: 12px
- Gutter entre cards: 8px
- Nunca centralizar tudo — composições levemente assimétricas têm mais energia
```

**Inclinações (influência Persona 5)**
```
- Elementos de destaque podem ter rotação leve: -2deg a +2deg
- Nunca mais que 3deg — sutil, não caótico
- Usar em: badges de raridade, banners de evento, elementos decorativos
- Nunca em: texto de lore, stats, informação crítica
```

**Espaço Negativo**
```
- Usar espaço negativo generosamente — o preto profundo do fundo é parte do design
- Não encher telas com informação — respiração é intencional
- Elementos importantes ganham espaço ao redor deles
```

---

## 5. Linguagem Visual de Heróis

### Estilo de Renderização

Os heróis são gerados proceduralmente (ver `02_sistema_visual.md`). A arte não é desenhada manualmente — é composta por camadas de elementos SVG/código. O estilo deve funcionar com esse sistema.

**Abordagem:** ilustração semi-plana com influência de FMA
```
- Silhuetas fortes e expressivas — reconhecíveis em miniatura
- Linha de contorno presente mas não uniforme (mais grossa nas bordas externas,
  mais fina nos detalhes internos)
- Sombras em flat shapes, não gradientes fotorrealistas
- Máximo 3 tons por área de cor (base, sombra, destaque)
- Textura sutil nos materiais (pedra tem granulação, metal tem reflexo linear)
```

**O que evitar:**
- Estilo chibi ou super deformado
- Realismo 3D
- Anime genérico sem personalidade
- Personagens sem peso — tudo em Solum tem massa

### Linhas de Transmutação

Elemento visual único de Fragmentos de Alma: todos os heróis têm **linhas de transmutação** visíveis no corpo — padrões geométricos luminosos que percorrem a silhueta como circuitos alquímicos. Elas comunicam que a alma está em estado de formação constante.

```
Implementação em código:
- SVG paths sobre a silhueta do herói
- Cor: variação clara da cor de afinidade, opacidade 60-80%
- Espessura: 0.5px a 1px
- Animação: dash-offset animation lenta (30-60 segundos por ciclo)
  dá sensação de Prima fluindo pelo corpo
- Nos heróis lendários: linhas mais complexas, ramificadas, mais luminosas
```

### Estados Visuais do Herói

```
REPOUSO (galeria):
  silhueta completa, aura em idle, linhas de transmutação animadas lentamente

EM BATALHA:
  postura ligeiramente diferente por posição (Frente = mais agressivo, Fundo = recuado)
  aura mais intensa

DANO RECEBIDO:
  flash branco rápido (100ms) + shake sutil (3px, 150ms)
  partículas vermelhas breves

USANDO HABILIDADE:
  pausa de 150ms com brilho na área de efeito antes da animação
  linhas de transmutação ficam mais intensas durante o cast

HP CRÍTICO (< 20%):
  bordas do sprite pulsam em VERMELHO_SANGUE
  linhas de transmutação ficam irregulares, como interferência

MORTO:
  dissolução em fragmentos de Prima — partículas da cor da afinidade
  não "cai" — se fragmenta. Dura 800ms.

APOSENTADO (legado):
  versão monocromática em dourado queimado
  linhas de transmutação congeladas, como fóssil
```

---

## 6. Telas Principais — Direção Visual

### Hub Principal (Mapa de Solum)

```
CONCEITO: mapa top-down estilizado de Solum, não realista
- Cada território tem cor dominante de sua afinidade
- Regiões corrompidas: dessaturadas, com efeito de "ruído" visual
- Regiões desbloqueadas: brilho sutil na borda do território
- Navegação: toque no território abre painel lateral (slide da direita)
- Painel: fundo FUNDO_SECUNDÁRIO, borda esquerda na cor da facção, info do bioma

ELEMENTOS FIXOS:
- Canto superior esquerdo: avatar de Kael (pequeno) + nível + barra de XP
- Canto superior direito: recursos (Fragmentos 🔷, Cristais 💎, Ecos ✨)
- Barra inferior: navegação principal (5 ícones)

NAVEGAÇÃO INFERIOR (D57):
  Mapa | Heróis | Ecos | Círculo | Kael
  ícones: mapa / almas / diamante-facetado / fundir / kael
  (substituiu: Mapa | Coleção | Fusão | Kael | Mais)

ATMOSFERA:
- Névoa nos cantos do mapa que se dissipa conforme o jogador explora
- Partículas de Prima flutuando no fundo, muito sutis
- Animação idle: regiões pulsam levemente em seu ritmo próprio
```

### Tela de Heróis e Tela de Ecos (D55–D57)

> **Nota:** a "Tela de Coleção" original foi dividida em duas tabs separadas.

```
TELA DE HERÓIS (heroes.tsx):
CONCEITO: grimório vivo — grade densa de almas vinculadas

GRID:
- 3 colunas fixas em todas as telas
- Cards retrato com largura = Math.floor((screenWidth - 32) / 3)
- Fundo de card: preto profundo (#09080f) com sombra roxa sutil
- Sem bordas de raridade coloridas — raridade comunicada pelo sprite

ORDENAÇÃO (dropdown sem container):
- Texto "ordenar por [critério]" no header — toque abre dropdown
- Overlay rgba(0,0,0,0.84) cobre tela abaixo do header
- Header nunca escurecido — posicionamento por onLayout
- Opções: Raridade / Nível / Afinidade / Classe
- Opção ativa: Rajdhani_700Bold + dourado; inativas: Rajdhani_500Medium + secundária

HEADER:
- Título "HERÓIS" em Rajdhani_700Bold + DOURADO_QUEIMADO, letterSpacing: 3
- Contador: "N almas" em Rajdhani_500Medium

BOTÃO FLUTUANTE "TIME":
- Pílula dourada, position: absolute, right: 20, bottom: 20
- Abre RosterManager (seleção de time + banco)

TELA DE ECOS (ecos.tsx):
- Lista de EcoRow com borda esquerda colorida por raridade
- Toque abre EcoDetail em modal (campo "Classe" — não "Núcleo")
```

### Tela de Fusão

```
CONCEITO: ritual alquímico — a tela mais importante emocionalmente do jogo

LAYOUT:
- Dois slots de fragmento, posicionados em diagonal (não lado a lado)
  Fragmento A: canto superior esquerdo (levemente inclinado -3deg)
  Fragmento B: canto inferior direito (levemente inclinado +3deg)
- Seta/símbolo de transmutação no centro: círculo alquímico animado
- Botão "FUNDIR" centralizado na parte inferior

CÍRCULO ALQUÍMICO:
- SVG animado, rotação lenta contínua (30s por rotação completa)
- Quando dois fragmentos são selecionados: círculo acelera levemente, brilha
- Design: baseado em círculos de transmutação — geométrico, com runas no anel externo
- Cor: DOURADO_ESCURO em idle, DOURADO_QUEIMADO quando ativo

PRÉ-VISUALIZAÇÃO:
- Abaixo do círculo: preview gerado dos genes prováveis (com incerteza visual —
  genes incertos aparecem com "?" e opacidade reduzida)
- Custo em Fragmentos de Alma visível antes de confirmar

ANIMAÇÃO DE FUSÃO (ao confirmar):
  Fase 1 (0-300ms): fragmentos se movem para o centro
  Fase 2 (300-800ms): círculo alquímico pulsa intensamente, cor da fusão
  Fase 3 (800-1500ms): flash de luz branca que cobre a tela
  Fase 4 (1500-2500ms): novo herói emerge do branco com dissolução de partículas
  Fase 5 (2500ms+): tela de revelação com nome, raridade e genes

TELA DE REVELAÇÃO:
- Fundo preto completo
- Herói centralizado, maior que qualquer outra tela
- Nome surge letra por letra em Cinzel (typewriter effect, 40ms por letra)
- Raridade surge abaixo com animação de cor (fade in + glow)
- Genes surgem em cards menores, um por um, com leve delay entre cada
- Se houver mutação: efeito especial — tela treme levemente, som distinto,
  ícone de mutação surge com flash
- Botão "CONTEMPLAR" (em vez de "OK") para ir ao detalhe do herói
```

### Tela de Batalha

```
CONCEITO: arena que respira — não é um menu com sprites, é um campo vivo

DIVISÃO VERTICAL:
- 40% superior: inimigos (fundo levemente mais escuro, névoa no topo)
- 20% central: linha de separação — círculo alquímico estilizado como "campo de batalha"
- 40% inferior: heróis do jogador + banco

INFORMAÇÕES EM BATALHA:
- HP de cada combatente: barra fina abaixo do sprite, sempre visível
- Ultimate: linha ainda mais fina, cor da afinidade, abaixo do HP
- Cooldowns: números pequenos em Rajdhani sobre o ícone de habilidade
- Status effects: ícones 16px empilhados acima do sprite

RODA DE AÇÕES:
- Surge do ponto de toque (não de posição fixa)
- 5 opções em arco (3 habilidades ativas + Trocar + Defender)
- Cada opção: círculo de 56x56dp, ícone centralizado
- Fundo: FUNDO_TERCIARIO com borda da cor de raridade do herói
- Habilidade em cooldown: ícone em CINZA_ESCURO, número de cooldown centralizado
- Selecionado: glow na cor de afinidade da habilidade

FEEDBACK DE DANO:
- Números de dano surgem do ponto de impacto, flutuam para cima e somem
- Dano normal: BRANCO_PERGAMINHO, Rajdhani-Bold, 20px
- Crítico: DOURADO_QUEIMADO, Rajdhani-Bold, 28px, com efeito de escala
- Cura: VERDE (cor de vida), mesmo estilo
- Miss: CINZA_MEDIO, menor, com "ESQUIVOU" em Rajdhani uppercase

BANCO DE RESERVA:
- 3 slots menores (60% do tamanho dos ativos) na barra mais inferior
- Heróis no banco: opacidade 80%, escala reduzida
- Ao selecionar troca: heróis do banco ganham borda dourada pulsante
- Animação de troca: herói ativo desliza para baixo, reserva sobe — 200ms
```

### Tela de Detalhe do Herói

```
CONCEITO: página de grimório dedicada a uma alma específica

LAYOUT:
- Herói ocupa metade superior da tela, com fundo do seu ORIGEM
- Scroll vertical para informações abaixo

SEÇÕES (em ordem, com scroll):
  1. IDENTIDADE: nome (Cinzel grande), raridade, geração, facção de origem
  2. LINHAGEM: mini árvore genealógica (pais e avós se existirem)
  3. ATRIBUTOS: hexágono de stats animado (radar chart em SVG)
  4. HABILIDADES: cards de habilidade com ícone, nome, descrição
     - Ativas: mostrar cooldown e nível de evolução
     - Ultimate: destaque especial com borda dourada
     - Passivas: ícone menor, sempre visível
     - Emergentes (se descobertas): borda especial, ícone de descoberta
  5. GENES: visualização dos 12 genes com valores
     - Genes de mutação em destaque especial
  6. VÍNCULO: 5 estrelas, texto de diálogo desbloqueado no nível atual
  7. LINHAGEM DETALHADA: árvore completa com scroll horizontal

BOTÕES DE AÇÃO (fixos no bottom):
  [EQUIPAR AO TIME]  [APOSENTAR]  (aposentar requer confirmação dupla)
```

---

## 7. Animações e Transições

### Princípios de Animação

```
RÁPIDO MAS LEGÍVEL:
- Transições de tela: 200-300ms (não 500ms — o jogo é ágil)
- Feedback de toque: < 100ms (imperceptível mas sentido)
- Animações de habilidade: 400-800ms (satisfatórias, não lentas)
- Revelação de fusão: 2500ms (o único momento que pode ser longo — é especial)

EASING:
- Entradas de UI: ease-out (rápido no início, suave no final)
- Saídas de UI: ease-in (suave no início, rápido no final)
- Elementos que "emergem": spring animation (overshoot leve — vida)
- Números de dano: ease-out com float para cima

NEVER:
- Linear em animações visíveis (parece robótico)
- Animações de loop infinito chamativas (cansam rapidamente)
- Mais de 3 coisas animando simultaneamente na mesma tela
```

### Transições de Tela

```
HUB → COLEÇÃO:        slide da direita, 250ms ease-out
HUB → DUNGEON:        fade com escala (0.95 → 1.0), 300ms
COLEÇÃO → DETALHE:    herói "cresce" do card para a tela, 350ms spring
DETALHE → FUSÃO:      fragmento "voa" do detalhe para o slot de fusão
BATALHA ENTRADA:      fade in com névoa se dissipando, 500ms
BATALHA SAÍDA:        fade out rápido, 200ms (não prolongar derrota)
```

### Partículas e Efeitos Ambientes

```
FUNDO DO HUB:
  - Partículas de Prima: pontos de 1-2px, cor DOURADO_ESCURO, opacidade 20-40%
  - Movimento: drift aleatório muito lento (velocidade: 10-20px por segundo)
  - Quantidade: 30-50 partículas
  - Performance: usar canvas ou Skia, nunca Views animadas para partículas

AURAS DE HERÓI:
  - Implementar com React Native Skia (melhor performance)
  - Partículas geradas pelos parâmetros de aura do herói (ver doc 02)
  - Rate: 1-3 partículas por segundo (discreto)

CÍRCULO ALQUÍMICO DE FUSÃO:
  - SVG animado com rotação via Reanimated
  - Dois anéis em direções opostas
  - Runas no anel externo (caracteres unicode de símbolos antigos, ou SVG path)
```

---

## 8. Símbolos Alquímicos no Design

Fragmentos de Alma deve ter um vocabulário de símbolos próprio que apareça de forma consistente em toda a UI como elemento decorativo e funcional.

### Símbolos por Afinidade

Cada afinidade tem um símbolo de 32x32px usado em ícones, badges e decorações:

```
FOGO    → triângulo apontando para cima com linha horizontal cortando o terço inferior
ÁGUA    → triângulo apontando para baixo com linha horizontal cortando o terço superior
TERRA   → triângulo para baixo sem linha
VENTO   → triângulo para cima sem linha
VAZIO   → círculo com ponto central e raios que não alcançam a borda
LUZ     → sol estilizado de 8 pontas, geométrico
SOMBRA  → lua crescente com estrela interna
ÉTER    → dois triângulos sobrepostos formando estrela de 6 pontas, com círculo

(Baseados em símbolos alquímicos históricos dos 4 elementos, expandidos para 8)
```

### Símbolos por NÚCLEO

```
GUARDIÃO    → escudo com linha vertical no centro
DESTRUIDOR  → seta dupla apontando para fora (explosão contida)
ARAUTO      → espiral que se abre para fora
TRICKSTER   → dois círculos sobrepostos (intersecção visível)
INVOCADOR   → círculo com 3 pontos em órbita
```

### Ornamento Central do Jogo

O símbolo principal de Fragmentos de Alma — aparece no ícone do app, nas telas de loading, no centro do círculo de fusão:

```
CONCEITO: espiral dupla que se fragmenta nas extremidades
- Duas espirais saindo do mesmo centro em direções opostas
- As extremidades de cada espiral se quebram em 3-4 fragmentos menores
- Representa: o Prima se fragmentando em duas almas, e cada alma ainda se fragmentando

Implementar como SVG path com animação de dash-offset no loading.
```

---

## 9. Sons e Háptica (Direção Geral)

*(A ser implementado com bibliotecas de áudio do Expo)*

```
TOQUE EM BOTÃO:         vibração leve (10ms), som de "click" metálico curto
SELEÇÃO DE FRAGMENTO:   vibração média (20ms), som cristalino
INÍCIO DE FUSÃO:        vibração crescente (300ms), som de transmutação iniciando
REVELAÇÃO DE HERÓI:     vibração forte única (100ms) no momento do flash branco
MUTAÇÃO DESCOBERTA:     padrão de vibração especial (3 pulsos rápidos), som distinto
DANO EM BATALHA:        vibração proporcional ao dano (10-50ms)
MORTE DE HERÓI:         vibração longa decrescente (400ms), som de dissolução
VITÓRIA:                padrão ascendente (3 pulsos crescentes), tom de resolução
DERROTA:                vibração única suave (100ms), sem chamar atenção
```

---

## 10. Componentes React Native — Padrões de Implementação

### Tema Global

Criar `src/lib/theme.ts` com todas as constantes visuais:

```typescript
export const theme = {
  colors: {
    background: {
      primary: '#0A0A0F',
      secondary: '#111118',
      tertiary: '#1A1A24',
    },
    gold: {
      dark: '#8A6508',
      main: '#C8960C',
      light: '#E8B84B',
    },
    red: {
      dark: '#5C0F0F',
      blood: '#8B1A1A',
      vivid: '#C0392B',
    },
    blue: {
      cobalt: '#1A3A6E',
      main: '#2E5FA3',
      ice: '#7BA7D4',
    },
    text: {
      primary: '#E8E0D0',
      secondary: '#8A8A9A',
    },
    border: {
      subtle: '#3A3A4A',
    },
    rarity: {
      comum: '#9E9E9E',
      incomum: '#2E7D32',
      raro: '#1565C0',
      epico: '#6A1B9A',
      lendario: '#E65100',
      unico: '#B71C1C',
    },
  },

  typography: {
    title: {
      fontFamily: 'Rajdhani_700Bold',   // ← era 'Cinzel-Bold' (D59)
      fontSize: 28,
      letterSpacing: 3,
      color: '#C8960C',
    },
    heroName: {
      fontFamily: 'Rajdhani_600SemiBold', // ← era 'Cinzel-Regular'
      fontSize: 18,
      letterSpacing: 1,
      color: '#E8E0D0',
    },
    stat: {
      fontFamily: 'Rajdhani_600SemiBold',
      fontSize: 16,
      letterSpacing: 0.5,
      color: '#E8E0D0',
    },
    label: {
      fontFamily: 'Rajdhani_500Medium',
      fontSize: 12,
      letterSpacing: 1.5,
      textTransform: 'uppercase' as const,
      color: '#8A8A9A',
    },
    body: {
      fontFamily: 'Rajdhani_500Medium',  // ← era 'LibreBaskerville-Regular'
      fontSize: 14,
      lineHeight: 22,
      color: '#E8E0D0',
    },
    bodyItalic: {
      fontFamily: 'Rajdhani_500Medium',  // sem variante itálica no Rajdhani
      fontSize: 14,
      lineHeight: 22,
      color: '#E8E0D0',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 32,
  },

  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
    fusion: 2500,
  },

  border: {
    radius: {
      none: 0,
      sm: 2,
      md: 4,
      lg: 8,
    },
  },
} as const

export type Theme = typeof theme
```

### Componente Base de Card de Herói

```typescript
// src/components/hero/HeroCard.tsx
// Sempre usar este componente para exibir heróis — nunca criar cards ad hoc
// Props recebem o Hero completo e derivam tudo visualmente do genoma

import { theme } from '@/lib/theme'
// Ver implementação completa na Fase 1 do roadmap
```

---

## 11. Checklist Visual para o Claude

Antes de entregar qualquer componente visual, verificar:

- [ ] Fundo é escuro? (nunca branco ou cinza claro como fundo principal)
- [ ] Texto usa Branco Pergaminho (#E8E0D0), não branco puro (#FFFFFF)?
- [ ] **Toda fonte usa Rajdhani** (`_700Bold` / `_600SemiBold` / `_500Medium`)? Cinzel e Libre Baskerville foram removidas do tema.
- [ ] `fontWeight: '700'` foi evitado? Usar `fontFamily: 'Rajdhani_700Bold'` explicitamente.
- [ ] Elementos interativos têm área de toque mínima de 48x48dp?
- [ ] Cores de raridade são as definidas neste documento?
- [ ] Animações usam easing (não linear)?
- [ ] Cards de herói usam HeroCard (3 colunas, portrait, Skia)? Nunca criar cards ad hoc.
- [ ] Shadow em card de herói está no wrapper externo (sem overflow:hidden), clip no Pressable interno?
- [ ] Bordas com cantos angulares (borderRadius 0-2)?
- [ ] Há espaço negativo suficiente? A tela respira?
- [ ] O elemento mais importante da tela é visualmente o mais proeminente?
- [ ] Testou com uma mão, com o polegar direito?

---
*Versão 0.1 — atualizar conforme componentes são implementados e decisões visuais evoluem*
