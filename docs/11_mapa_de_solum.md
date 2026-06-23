# 🗺️ O Mapa Vivo de Solum
*Fragmentos de Alma — Design Document v0.1*

---

## Visão Geral

O mapa de Solum é a tela principal do jogo — a "casa" do jogador. É a primeira tela vista após o login e o ponto de retorno após cada dungeon, fusão ou decisão de facção.

Não é um mapa convencional visto de cima. É uma **cartografia alquímica** — como se os Arquitetos do Véu tivessem mapeado Solum usando Prima de Realidade: linhas de fluxo de Prima no lugar de latitude/longitude, territórios com texturas que refletem sua afinidade elemental, fronteiras que se movem com o equilíbrio político.

O mapa é um organismo vivo. Ele respira, pulsa e muda conforme o jogador age no mundo.

---

## Estilo Visual

### Referência de Estilo
Cruzamento entre:
- **Cartografia medieval europeia** (ornamentos nas bordas, rosa dos ventos alquímica, texto em latim/rúnico)
- **Diagrama de Prima** (linhas de fluxo energético conectando territórios, nós de convergência)
- **Direção de arte Alquimia Noire** (ver `10_direcao_de_arte.md` — escuro, dourado, peso visual)

### Fundo do Mapa
```
- Cor base: #0D0D18 (mais azul que o fundo padrão — o mapa tem profundidade espacial)
- Textura: grade hexagonal muito sutil (opacidade 5%) representando o fluxo de Prima
- Oceano (O Véu): bordas do mapa em #050510, com névoa animada nas extremidades
- Linhas de Prima: paths SVG curvos conectando os 7 territórios, cor #C8960C opacidade 15%
  animação: fluxo de luz percorre as linhas lentamente (dash-offset, 20s por ciclo)
```

### Territórios — Representação Visual
Cada território é uma região irregular (não quadrado/hexágono perfeito) com:

```
CAMADAS DE UM TERRITÓRIO:

1. Silhueta base: forma geográfica do território
   - Preenchimento: cor da afinidade dominante, opacidade 30%
   - Borda: 1.5px na cor da afinidade, opacidade 60%

2. Textura interna: padrão sutil que reflete o bioma
   Kethara (Matéria):    padrão de cristais geométricos
   Mnemos (Mente):       padrão de névoa ondulada
   Cinderfall (Alma):    padrão de cinzas em queda
   Verdania (Vida):      padrão de veios orgânicos
   Limiar (Morte):       padrão de fissuras em osso
   Axis (Realidade):     padrão de grade fractal
   Vênula (Sangue):      padrão de rede vascular

3. Ícone da facção: símbolo da facção centralizado no território
   - 32x32px, cor da afinidade, opacidade 80%

4. Nome do território: Cinzel-Regular, 12px, cor da afinidade
   - Posicionado fora da silhueta, com linha conectora fina

5. Estado de saúde: overlay de corrupção (ver seção Estados do Mapa)
```

### Fronteiras entre Territórios
```
- Não são linhas fixas — são zonas de gradiente de 20-40px de largura
- Onde dois territórios se encontram: as cores se mesclam
- Zonas de tensão alta (reputação conflitante): a borda pulsa levemente
- Zonas de aliança (reputação positiva com ambas as facções): borda dourada sutil
```

### Elementos Decorativos do Mapa
```
ROSA DOS VENTOS ALQUÍMICA:
  - Canto inferior direito do mapa
  - 8 pontas, cada uma apontando para uma afinidade elemental
  - SVG animado, rotação muito lenta (120s por rotação completa)
  - Tamanho: 80x80px

BORDAS CARTOGRÁFICAS:
  - Ornamentos nos 4 cantos do mapa: selos alquímicos decorativos
  - Borda do mapa: linha dupla com runas entre elas
  - Texto decorativo nas margens: nomes de regiões em "alquimiano" (língua fictícia)

O VÉU (oceano):
  - Borda do mapa em azul-preto profundo
  - Névoa animada nas extremidades (partículas brancas muito sutis, drift lento)
  - Texto "O VÉU" em Cinzel-Regular, letras espaçadas, opacidade 30%
  - Pequenas representações de anomalias: redemoinhos de Prima nos cantos do oceano
```

---

## Estrutura de Navegação

### Profundidade por Território
Cada território tem 3 camadas de conteúdo:

```
CAMADA 1 — SUPERFÍCIE (dungeons normais)
  Andares 1-10
  Inimigos comuns e incomuns
  Drops: fragmentos comuns e incomuns
  Desbloqueio: território desbloqueado

CAMADA 2 — PROFUNDEZAS (dungeons de elite)
  Andares 11-20
  Inimigos raros e épicos
  Drops: fragmentos raros e épicos, cristais de essência
  Desbloqueio: completar todos os 10 andares da Superfície

CAMADA 3 — NÚCLEO (dungeon do chefe)
  1 andar único: o chefe do território
  O Fragmento Antigo correspondente
  Drops: fragmento de gene específico, cosmético exclusivo, fragmento de habilidade
  Desbloqueio: completar as Profundezas
```

### Interação com o Mapa
```
TOQUE SIMPLES em território:
  → Painel lateral desliza da direita (ver spec abaixo)

TOQUE LONGO em território:
  → Tooltip com informações rápidas: facção, afinidade, andares completados

PINÇA (zoom):
  → Mapa suporta zoom 0.8x a 2.0x
  → Zoom in revela detalhes adicionais (nomes de cidades, pontos de interesse)
  → Zoom out mostra o mapa completo com overview de corrupção global

ARRASTE:
  → Pan pelo mapa quando em zoom > 1.0x
```

### Painel Lateral de Território
```
Slide da direita, ocupa 75% da largura da tela
Fundo: FUNDO_SECUNDÁRIO (#111118)
Borda esquerda: 2px na cor da afinidade do território

CONTEÚDO DO PAINEL:
  Header:
    - Nome do território (Cinzel-Bold, 20px)
    - Nome da facção dominante (Rajdhani-Medium, 12px, uppercase, cor da facção)
    - Ícone da afinidade elemental

  Status:
    - Barra de corrupção do território (vermelho/verde)
    - Reputação do jogador com a facção (barra -100 a +100)
    - Andares completados: "7/10 Superfície | 0/10 Profundezas | Núcleo: Bloqueado"

  Ações:
    - [ENTRAR NA DUNGEON] → abre seleção de camada
    - [VER FACÇÃO] → abre tela de detalhe da facção
    - [HISTÓRICO] → últimas recompensas obtidas aqui

  Fragmentos Disponíveis:
    - Preview dos tipos de fragmento dropáveis (ícones de afinidade)
    - "Fragmentos exclusivos daqui:" + ícones

  Lore:
    - 2-3 linhas do lore do território (Libre Baskerville, italic)
    - Botão [LER MAIS] para lore completo
```

---

## Estados do Mapa

O mapa muda visualmente em tempo real conforme o estado do mundo.

### Estado de Corrupção por Território

```
SAUDÁVEL (corrupção 0-20%):
  - Território na cor plena da afinidade
  - Textura interna animada normalmente
  - Borda brilhante e definida

LEVEMENTE CORROMPIDO (20-40%):
  - Overlay cinza-esverdeado, opacidade 20%
  - Textura interna mais lenta
  - Algumas partículas escuras flutuando

MODERADAMENTE CORROMPIDO (40-60%):
  - Overlay cinza-roxo, opacidade 40%
  - Borda irregular, com "sangramento" visual para territórios vizinhos
  - Ícone da facção levemente distorcido

SEVERAMENTE CORROMPIDO (60-80%):
  - Overlay quase monocromático
  - Névoa de corrupção animada sobre o território
  - Nome do território em vermelho sangue
  - Texto "EM CRISE" pulsando em Rajdhani

COLAPSO (80-100%):
  - Território em preto e branco com veias vermelhas
  - Animação de fissuras se espalhando
  - Partículas de Prima corrompido saindo do território
  - Alerta visual pulsante — o jogador deve agir

RESTAURADO (após intervenção do jogador):
  - Animação de "cura" — o dourado se espalha pelo território
  - Textura volta gradualmente à cor original (3-5 segundos de transição)
  - Partículas douradas breves
```

### Estado Político (Fronteiras)

```
TENSÃO ALTA entre dois territórios:
  - Zona de fronteira pulsa entre as cores das duas facções
  - Ícones de alerta (pequenos, 8px) na linha de fronteira
  - Tooltip: "[Facção A] e [Facção B] estão em conflito"

ALIANÇA entre dois territórios:
  - Zona de fronteira em dourado suave
  - Linha de Prima conectando os dois territórios fica mais intensa

TERRITÓRIO SOB INFLUÊNCIA DO JOGADOR:
  - Borda do território tem linha adicional interna em dourado queimado
  - Ícone sutil de Kael (fragmento de alma) no canto do território
```

### Estado de Progresso do Jogador

```
NÃO VISITADO:
  - Território coberto por névoa de corrupção densa (não a corrupção do mundo —
    é o "desconhecido" do mapa)
  - Apenas a silhueta visível, sem textura nem ícone
  - Nome em cinza médio com "?" antes

VISITADO MAS NÃO COMPLETADO:
  - Névoa dissipada
  - Indicador de progresso: "7/10" em Rajdhani no canto do território

SUPERFÍCIE COMPLETA:
  - Ícone de check dourado sutil no canto superior do território
  - Profundezas desbloqueadas — indicador visual de nova camada disponível

PROFUNDEZAS COMPLETAS:
  - Segundo check dourado
  - Núcleo desbloqueado — ícone de chefe pulsante no centro do território

NÚCLEO COMPLETO (chefe derrotado):
  - Território tem brilho permanente sutil
  - Ícone do Fragmento Antigo derrotado no território (miniatura)
  - O lore do Fragmento Antigo fica acessível via toque longo
```

---

## Animações do Mapa

### Idle (mapa em repouso)
```
- Linhas de Prima: fluxo de luz percorre os paths (dash-offset, 20s ciclo)
- Partículas de Prima: 20-30 pontos flutuantes muito sutis (#C8960C, opacidade 15%)
- Rosa dos ventos: rotação contínua muito lenta (120s por ciclo)
- Territórios: pulso muito sutil de opacidade (0.95 → 1.0 → 0.95, 4s ciclo)
- Névoas de corrupção: drift orgânico lento
```

### Eventos Visuais
```
AO COMPLETAR UM ANDAR:
  - Linha de Prima do território pulsa dourado por 2 segundos
  - Indicador de progresso atualiza com animação de flip (número vira)

AO DERROTAR UM CHEFE:
  - Animação de "restauração" se espalha do núcleo para as bordas do território
  - Ondas concêntricas douradas (3 ondas, 1.5s cada)
  - Névoa de desconhecido se dissipa em partículas

AO MUDAR REPUTAÇÃO DE FACÇÃO:
  - Fronteiras do território se redesenham gradualmente (500ms)
  - Se aliança criada: flash dourado na fronteira
  - Se conflito criado: flash vermelho na fronteira

CICLO DE SOLUM (novo ciclo):
  - Animação especial: o mapa inteiro "respira" (escala 1.0 → 0.98 → 1.02 → 1.0)
  - Névoas se redesenham com novas posições
  - Linhas de Prima mudam de trajetória suavemente (2s de transição)
```

---

## HUD do Mapa (Interface Sobre o Mapa)

### Elementos Fixos
```
CANTO SUPERIOR ESQUERDO:
  Avatar de Kael (40x40px, circular com borda dourada) + Nome + Nível
  Barra de XP de Kael: linha fina dourada abaixo do nome

CANTO SUPERIOR DIREITO:
  Recursos empilhados verticalmente:
  🔷 [número] Fragmentos de Alma   (Rajdhani-SemiBold, 14px)
  💎 [número] Cristais de Essência
  ✨ [número] Ecos

BARRA INFERIOR (navegação):
  5 ícones centralizados:
  [🗺️ MAPA]  [⚔️ COLEÇÃO]  [🔮 FUSÃO]  [👤 KAEL]  [⚙️ MAIS]
  Ícone ativo: cor dourada + linha dourada abaixo
  Ícones inativos: cinza médio

NOTIFICAÇÕES DE EVENTO:
  Banner superior (slide de cima): aparece quando evento semanal começa
  Fundo: cor do evento, texto Rajdhani-Bold uppercase
  Duração: 4 segundos, depois recolhe
  Toque no banner: abre tela do evento
```

### Indicadores de Estado do Mundo
```
ÍNDICE DE CORRUPÇÃO GLOBAL:
  Barra horizontal fina no topo da tela (abaixo do status bar do celular)
  Cor: gradiente verde → amarelo → vermelho conforme corrupção global aumenta
  Toque: abre modal com breakdown por território

EVENTO ATIVO:
  Ícone pulsante no canto inferior esquerdo quando evento semanal está ativo
  Cor da afinidade do evento
```

---

## Implementação React Native

### Abordagem Técnica
```
O mapa é implementado com React Native Skia para performance:
- Territórios: paths SVG desenhados com Skia
- Animações: Reanimated + Skia para 60fps constante
- Partículas: canvas Skia, nunca Views animadas
- Interações: Gesture Handler para pan, pinch e tap

Não usar WebView com Leaflet/Mapbox — o mapa de Solum não é um mapa geográfico real,
é um elemento de jogo com comportamento específico.
```

### Estrutura de Componentes
```
<MapScreen>
  <SkiaMap>                           ← canvas principal do mapa
    <MapBackground />                 ← fundo, oceano, grade de Prima
    <PrimaFlowLines />                ← linhas de fluxo animadas
    <Territory id="kethara" />        ← um por território (7 total)
      - silhueta, textura, ícone, nome, estado de corrupção
    <FactionBorders />                ← zonas de fronteira dinâmicas
    <AlchemicCompass />               ← rosa dos ventos
    <MapDecorations />                ← ornamentos cartográficos
    <CorruptionOverlays />            ← névoas e overlays de estado
    <PrimaParticles />                ← partículas ambientes
  </SkiaMap>
  <MapHUD>                            ← interface sobre o mapa (React Native Views)
    <PlayerStatus />                  ← avatar, nível, XP
    <ResourcesDisplay />              ← fragmentos, cristais, ecos
    <CorruptionIndex />               ← barra de corrupção global
    <EventIndicator />                ← evento ativo
    <BottomNavigation />              ← navegação principal
  </MapHUD>
  <TerritoryPanel />                  ← painel lateral (animated, slide da direita)
</MapScreen>
```

### Dados do Mapa
```typescript
// src/systems/world/types.ts

export interface TerritoryState {
  id: string
  corruptionLevel: number        // 0-100
  playerProgress: {
    surfaceFloors: number        // 0-10
    depthsFloors: number         // 0-10
    bossDefeated: boolean
  }
  factionReputation: number      // -100 a 100 (reputação do jogador com a facção)
  politicalTension: {
    neighborId: string
    tensionLevel: number         // 0-100
  }[]
}

export interface WorldState {
  territories: Record<string, TerritoryState>
  globalCorruption: number       // média ponderada de todos os territórios
  currentCycle: number           // número do Ciclo de Solum atual
  activeFactionWar?: {
    factionA: string
    factionB: string
    territory: string
  }
  activeEvent?: {
    id: string
    name: string
    affinity: string
    endsAt: string              // ISO timestamp
  }
}
```

---

## Notas de Design

- O mapa deve comunicar o estado do mundo em 3 segundos — sem ler nada, o jogador entende onde está a crise
- A névoa de "desconhecido" não é punitiva — é convidativa. O jogador quer dissipar a névoa
- Nunca mostrar todos os 7 territórios em estado crítico simultaneamente — calibrar a IA coletiva para manter pelo menos 3-4 territórios saudáveis
- O mapa em endgame (após completar todos os territórios) tem visual diferente — mais detalhado, mais ornamentado, como prêmio visual por ter explorado tudo
- Performance é crítica: o mapa é a tela mais vista. Manter 60fps constante em dispositivos de 3 anos atrás

---
*Próxima revisão: definir coordenadas exatas dos territórios e assets SVG de silhuetas*
