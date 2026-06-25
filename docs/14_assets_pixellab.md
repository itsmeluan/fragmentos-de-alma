# 🎨 Mapa de Assets — PixelLab × Skia
*Fragmentos de Alma — Documento de produção de arte v0.1*

---

## Como Usar Este Documento

Este documento lista **TODAS** as artes que o jogo precisa, separando o que é **gerado uma vez no PixelLab** (sprites rasterizados, portadores de identidade) do que é **composto em runtime com React Native Skia** (variação procedural infinita: cor, glow, partículas, estados).

A filosofia central: **gerar o mínimo de sprites fixos e multiplicar visualmente no código.** Cada sprite do PixelLab é multiplicado por dezenas de variações de cor/efeito via Skia, criando a sensação de variedade infinita sem produzir milhares de imagens.

> **Leia antes:** `10_direcao_de_arte.md` (linguagem visual), `02_sistema_visual.md` (geração visual de heróis), `11_mapa_de_solum.md` (mapa).

---

## 0. Princípio de Divisão: PixelLab vs Skia

| Vai para **PixelLab** (raster fixo) | Fica em **Skia** (procedural, runtime) |
|---|---|
| Tudo que carrega **identidade de forma**: silhueta de personagem, anatomia, equipamento, rosto, pose | Tudo que é **variação contínua**: cor, matiz, glow, opacidade, escala |
| Sprites de herói por núcleo e tier de raridade | Auras elementais (partículas por afinidade) |
| Inimigos e chefes | Backgrounds de origem (shaders) |
| Ícones ilustrados complexos (facção, chefe) | Estados de herói (dano, morte, crítico, aposentado) |
| Backgrounds pintados de bioma/tela | Linhas de transmutação animadas |
| Tiles de mapa, ornamentos cartográficos | Glow de raridade, palette swap |
| App icon, splash | Mapa de Solum inteiro (já é Skia por design — doc 11) |
| | Barras, divisores, círculo alquímico, HUD |

**Regra de ouro:** se a variação pode ser feita mudando um número (cor, opacidade, posição), é Skia. Se exige redesenhar a forma, é PixelLab.

---

## 1. ✅ RESOLVIDO: Mapeamento Núcleo → Build

O sistema de genes define **5 NÚCLEOS** (`src/lib/constants.ts` → `CORES`), e a identidade visual do herói é dirigida pelo NÚCLEO (doc 07, "Legibilidade Visual"):

```
CORES = ['Guardião', 'Destruidor', 'Arauto', 'Trickster', 'Invocador']
```

**Decisão tomada:** cada núcleo tem **2 builds visuais** (10 sprites no total), escolhidos em runtime pelo **atributo dominante** do herói. Isso dá variedade de silhueta dentro do mesmo papel sem quebrar a lógica de jogo.

| Núcleo | Build A (sprite) | Build B (sprite) | Critério de seleção |
|---|---|---|---|
| Guardião | Guardião `e474e4f5` (leve, escudo redondo) | Sentinela `4840473e` (placa pesada, escudo torre) | RESISTÊNCIA alta → Build B |
| Destruidor | Fragmentador `073350a1` (machado pesado) | Reaver `4ec2f53c` (lâminas duplas ágil) | FORÇA alta → A; AGILIDADE alta → B |
| Arauto | Arauto `0a009c7e` (estandarte) | Corneiro `ebb178b3` (corneta de guerra) | VONTADE alta → A; AURA alta → B |
| Invocador | Invocador `4b34b445` (energia nas mãos) | Ancião `972401a0` (cajado, mago velho) | RESSONÂNCIA alta → A; idade/legado → B |
| Trickster | Vidente `25728967` (encapuzado, orbe) | Caçador `6176572c` (arco, ágil) | AURA alta → A; AGILIDADE alta → B |

**Regra de seleção de build** (a implementar em `getHeroSprite`):
```ts
function pickBuild(core: Core, attrs: Attributes): 'A' | 'B' {
  // compara os dois atributos-chave do núcleo; empate → A (default)
}
```

> Status: 8 sprites já gerados + 2 em geração (Reaver `4ec2f53c`, Corneiro `ebb178b3`) = **10 builds**, fechando 2 por núcleo. ✅

---

## 2. HERÓIS — Sprites de Jogador (PixelLab)

### 2.1 Bases por Núcleo
Já gerados: **8 sprites base** (8 direções cada, side view, 64px, contorno preto, heroic).
✅ **Concluído** — ver tabela de IDs em §1.

### 2.2 Estados de Raridade (`create_character_state`)
Cada base ganha variantes de equipamento progressivamente mais elaboradas. Como `create_character_state` herda identidade e esqueleto, mantém coerência.

| Tier | Tratamento visual | Status |
|---|---|---|
| Comum | sprite base, sem alteração | ✅ (é a própria base) |
| Incomum | acessório simples, leve melhoria de armadura | ⬜ a gerar |
| Raro | armadura definida, arma melhor | ⬜ a gerar |
| Épico | armadura ornada, capa, detalhes | ⬜ a gerar |
| Lendário | armadura divina/rúnica brilhante, arma épica | 🔄 gerando (8 em fila) |
| Único | tratamento exclusivo, 1-off | ⬜ decidir (gerar sob demanda?) |

**Contagem:** 8 bases × 5 tiers visuais (Incomum→Único) = **40 estados** + 8 bases = **48 sprites de herói**.

> Único pode ser tratado como Lendário + glow/efeito Skia especial, evitando geração dedicada. Recomendado para o MVP.

### 2.3 Animações (PixelLab `animate_character`)
PixelLab oferege +49 templates (breathing-idle, fight-stance, fireball, death, etc.). Para o MVP de batalha:

| Animação | Uso | Prioridade |
|---|---|---|
| `breathing-idle` | repouso na galeria e batalha | Alta |
| `fight-stance-idle-8-frames` | postura de combate | Alta |
| ataque (cross-punch / fireball) | usar habilidade | Média |
| `falling-back-death` | morte | Média |
| `getting-up` | revive | Baixa |

> **Decisão:** animar só as **bases** (8) e reaproveitar nos tiers, OU animar por tier. Recomendado: animar apenas bases no MVP; o glow Skia diferencia os tiers em movimento.

---

## 3. INIMIGOS — Almas Corrompidas (PixelLab)

Doc 07: inimigos são procedurais, identidade pelo NÚCLEO, legibilidade por tamanho/aura/cor/ornamento. Reaproveitam a mesma estrutura de núcleos.

### 3.1 Estratégia
**Não gerar inimigos do zero.** Criar variantes "corrompidas" das 5 bases de núcleo via `create_character_state` com descrição de corrupção (cinzas, fissuras, Prima corrompido). A cor por afinidade e a intensidade de corrupção entram via Skia.

| Asset | Qtd | Origem |
|---|---|---|
| Base corrompida por núcleo | 5 | state das bases |
| Variante "elite" corrompida | 5 | state mais ornado |

**Contagem:** ~**10 sprites de inimigo**. Variação de afinidade (8), tamanho (resistência) e aura (ressonância) = Skia. Isso cobre milhares de inimigos visualmente distintos.

---

## 4. CHEFES — Almas Antigas (PixelLab)

Doc 07: 7 chefes (um por território/Fragmento Antigo), cada um com **3 fases visuais** e habilidades únicas. São os assets mais importantes e singulares — valem geração dedicada de alta qualidade (modo `pro` ou `v3`, tamanho maior 96-128px).

| Território | Facção | Chefe (Fragmento Antigo) | Fases |
|---|---|---|---|
| Axis | Arquitetos do Véu | ⬜ definir nome | 3 |
| Kethara | Pedra Viva | ⬜ | 3 |
| Mnemos | Véu dos Ecos | ⬜ | 3 |
| Verdânia | Jardim Perpétuo | ⬜ | 3 |
| Cinderfall | Chama Negra | ⬜ | 3 |
| Limiar | Confraria do Limiar | ⬜ | 3 |
| Vênula | Ordem Carmesim | ⬜ | 3 |

**Contagem:** 7 chefes × 3 fases = **21 sprites de chefe** (+ chefes de evento sob demanda).
Fases podem ser `create_character_state` do mesmo chefe (mais danificado/transformado a cada fase) para manter identidade.

---

## 5. BACKGROUNDS (PixelLab — pintados; Skia — efeitos por cima)

### 5.1 Backgrounds de Origem (fundo do herói no detalhe/revelação)
Doc 10: a tela de detalhe usa "fundo do seu ORIGEM". **5 origens:**

| Origem | Conceito de fundo |
|---|---|
| Abissal | profundezas escuras, pressão, bioluminescência fria |
| Celestial | céu noturno, constelações douradas |
| Primordial | caos primevo, magma e rocha bruta |
| Forjada | forja alquímica, metal e brasa |
| Errante | terras nômades, horizonte e poeira |

**Contagem:** **5 backgrounds de origem.** Variação de tom/atmosfera por afinidade = Skia overlay.

### 5.2 Backgrounds de Batalha por Bioma (7 territórios)
Doc 10 (tela de batalha): arena dividida; o fundo reflete o bioma. **7 biomas:**
Axis, Kethara, Mnemos, Verdânia, Cinderfall, Limiar, Vênula.

**Variação progressiva (como heróis):** cada bioma tem **2 estados visuais** — saudável e corrompido — espelhando a lógica de evolução do mapa.

**Contagem:** 7 biomas × 2 estados = **14 backgrounds de batalha.** Estados intermediários de corrupção = overlay Skia (doc 11).

### 5.3 Backgrounds de Tela (telas estáticas)
| Tela | Asset |
|---|---|
| Login / Registro | 1 background atmosférico |
| Coleção (grimório) | textura de fundo sutil (pode ser Skia) |
| Fusão / Transmutação | já usa círculo (Skia) — fundo opcional |

**Contagem:** **1-2 backgrounds de tela.**

---

## 6. MAPA DE SOLUM (majoritariamente Skia — doc 11)

O doc 11 define o mapa como **Skia puro** (paths, partículas, animações). PixelLab entra apenas em **elementos ilustrados pontuais** que ficam melhores pintados:

| Elemento | Ferramenta | Qtd |
|---|---|---|
| Silhuetas/texturas de território | Skia (paths) | — |
| Estados de corrupção | Skia (overlay) | — |
| Linhas de Prima, partículas | Skia | — |
| **Rosa dos ventos alquímica** | PixelLab (ornamento pintado) | 1 |
| **Ornamentos de canto cartográficos** | PixelLab | 4 (ou 1 reaproveitado) |
| **Ícone de facção (no território)** | PixelLab | 7 |

**Contagem PixelLab para o mapa:** ~**8-12 ornamentos/ícones.** O resto é Skia.

---

## 7. ÍCONES (PixelLab para ilustrados; Skia/SVG para geométricos)

### 7.1 Símbolos Geométricos → **Skia/SVG** (NÃO PixelLab)
Doc 10 já define como símbolos alquímicos vetoriais. Ficam em código:

| Conjunto | Qtd | Ferramenta |
|---|---|---|
| Afinidades (Fogo, Água, Terra, Vento, Vazio, Luz, Sombra, Éter) | 8 | Skia/SVG |
| Núcleos (Guardião, Destruidor, Arauto, Trickster, Invocador) | 5 | Skia/SVG |
| Mutações (INVERSO, ESPELHO, ANCESTRAL, CAOS, TRANSCENDENCIA) | 5 | Skia/SVG |
| Recursos (Fragmentos 🔷, Cristais 💎, Ecos ✨) | 3 | Skia/SVG ou PixelLab |
| Navegação inferior (Mapa, Coleção, Fusão, Kael, Mais) | 5 | SVG line icons |
| Ações UI (equipar, aposentar, filtrar, fechar, etc.) | ~10 | SVG line icons |

### 7.2 Ícones Ilustrados → **PixelLab** (opcional, se quiser pixel art)
| Conjunto | Qtd | Nota |
|---|---|---|
| Emblemas de facção (ilustrados) | 7 | versão rica vs símbolo simples |
| Ícone de raridade (selo) | 6 | pode ser Skia |

**Decisão:** para coesão pixel art, recursos e emblemas de facção podem ser pixelados no PixelLab. Símbolos de afinidade/núcleo/mutação ficam melhor vetoriais (nitidez em qualquer tamanho). **Recomendado:** símbolos = SVG; recursos + facções = PixelLab.

**Contagem PixelLab (ícones):** ~**13-16** (3 recursos + 7 facções + 6 raridade opcional).

---

## 8. AVATAR DE KAEL — Jogador (PixelLab)

Doc 11: Kael aparece no HUD (avatar 40px) e tem nível/XP. Doc 04 (progressão/legado) sugere evolução.

**Variação progressiva (como heróis):** Kael evolui visualmente conforme o nível/legado.

| Estágio | Conceito |
|---|---|
| Inicial | aprendiz, vestes simples |
| Intermediário | alquimista estabelecido |
| Avançado | mestre, marcas de transmutação |
| Endgame | forma transcendida |

**Contagem:** **4 sprites de Kael** (retrato/busto, frontal). Glow de progresso = Skia.

---

## 9. APP ICON & SPLASH (PixelLab / já existente)

| Asset | Status |
|---|---|
| App icon (sigilo central) | ✅ já feito (`assets/icon.png`) |
| Splash (vídeo do sigilo) | ✅ já feito (`sigil_loop_segment_4s.mp4`) |
| Android adaptive (foreground/background/monochrome) | ⬜ revisar/regerar com identidade pixel |
| Favicon web | ⬜ derivar do icon |

**Contagem:** ~**3 variações de ícone** a revisar (Android adaptive + favicon).

---

## 10. ITENS / COSMÉTICOS / RECOMPENSAS (PixelLab — futuro)

Doc 07 (recompensas cosméticas) e doc 05 (economia) mencionam cosméticos. **Fora do MVP**, mas mapeado:

| Conjunto | Qtd estimada | Nota |
|---|---|---|
| Molduras de card cosméticas | ~5 | pode ser Skia |
| Efeitos de aura especiais (drop de chefe) | ~7 | Skia |
| Ícones de consumível/material | ~10 | PixelLab pixel art |

**Contagem:** diferida para pós-MVP.

---

## 11. HABILIDADES — Ícones (majoritariamente Skia/SVG)

Habilidades são **procedurais** (doc 03): combinam GATILHO + EFEITO + CONDIÇÃO. É impossível ter um ícone único por habilidade. A identidade visual vem do **EFEITO** (família) tingido pela **afinidade** (Skia).

### 11.1 Ícones por Família de Efeito → SVG (9 efeitos, do `generator.ts`)
| ID | Efeito | Ícone conceito |
|---|---|---|
| E01 | causa dano físico | lâmina/impacto |
| E02 | causa dano elemental | estilhaço elemental |
| E03 | cura aliado | cruz/folha vital |
| E04 | cria escudo | escudo |
| E05 | aplica debuff no inimigo | caveira/seta para baixo |
| E06 | aplica buff em aliado | seta para cima/asas |
| E07 | invoca entidade menor | silhueta menor |
| E08 | drena recurso do inimigo | espiral de sucção |
| E09 | reposiciona combatentes | setas cruzadas |

**9 ícones base de efeito (SVG)** + tint de afinidade via Skia + moldura por categoria (ativa/passiva/ultimate/emergente).

### 11.2 Molduras de Categoria de Habilidade → SVG/Skia
| Categoria | Tratamento |
|---|---|
| Ativa | moldura padrão |
| Passiva | moldura menor, sem cooldown |
| Ultimate | moldura dourada com glow |
| Emergente | moldura especial com ícone de descoberta |

**Contagem:** 9 SVG de efeito + 4 molduras = Skia/SVG. **Zero PixelLab** (a menos que se queira ilustração pixel art dos efeitos — opcional, ~9 sprites).

---

## 12. ATRIBUTOS & GENOMA — Visualização (Skia/SVG)

### 12.1 Ícones de Atributo → SVG (6, do `ATTRIBUTE_GENES`)
Força, Ressonância, Resistência, Agilidade, Vontade, Aura. **6 ícones SVG line.**

### 12.2 Visualização de Genoma → Skia
| Elemento | Ferramenta |
|---|---|
| Hexágono de atributos (radar chart) | Skia |
| Cards dos 12 genes | Skia/SVG |
| Badges de mutação (5: INVERSO, ESPELHO, ANCESTRAL, CAOS, TRANSCENDENCIA) | SVG |
| Linhas de transmutação no corpo do herói | Skia (dash-offset) |

### 12.3 Vínculo / Bond → SVG
5 estrelas + diálogos desbloqueados. **1 ícone de estrela (cheia/vazia).**

**Contagem:** 6 atributos + 5 mutações + 1 estrela = SVG. Genoma/radar = Skia. **Zero PixelLab.**

---

## 13. ÁRVORE DE LEGADO & PROGRESSÃO (Skia/SVG + PixelLab pontual)

Doc 04 "Longo Prazo — o legado que deixo". A árvore em si (nós, conexões, layout) é **Skia/SVG**. Ícones de nó podem ser pixel art.

| Elemento | Ferramenta | Qtd |
|---|---|---|
| Estrutura da árvore (nós, ramos, linhas) | Skia/SVG | — |
| Ícones de nó de legado (tipos de bônus) | PixelLab ou SVG | ~8-12 |
| Avatar de Kael por estágio | PixelLab | 4 (ver §8) |
| Moldura de herói aposentado (monocromático dourado) | Skia (filtro) | — |

**Contagem PixelLab:** ~8-12 ícones de nó (opcional; podem ser SVG).

---

## 14. DUNGEONS — Elementos de Navegação (PixelLab + Skia)

Telas: `dungeon/[biomeId]`, `between`, `battle`, `tower`, `tower-between`, `tower-battle`.

### 14.1 Backgrounds
- Background de batalha por bioma: **já contado em §5.2** (7×2 = 14).
- Background da **Torre de Ressonância** (endgame, doc 12): **1-2** (progressão de altura).
- Background da tela "between" (entre-andares / acampamento): **1** (pode reusar bioma).

### 14.2 Ícones de Nó de Andar → SVG ou PixelLab
| Tipo de nó | Ícone |
|---|---|
| Combate normal | espadas cruzadas |
| Elite | espadas + coroa |
| Chefe | crânio/selo |
| Tesouro | baú |
| Descanso/forja | fogueira/bigorna |
| Evento de facção | estandarte |

**6 ícones de nó.** SVG recomendado; pixel art opcional.

**Contagem PixelLab dungeon:** ~1-2 (torre) + 6 nós opcionais.

---

## 15. STATUS EFFECTS — Batalha (SVG)

Doc 06. O motor usa `StatusEffect` com tipos `buff`/`debuff`/`shield`. Ícones 16px empilhados sobre o sprite.

| Família | Exemplos |
|---|---|
| Buff | ataque+, defesa+, regeneração, escudo |
| Debuff | veneno, queimadura, atordoamento, lentidão, fraqueza, sangramento |
| Especial | drenagem, marca, invocação |

**~12-16 ícones de status (SVG).** Tint por tipo (verde buff / vermelho debuff). **Zero PixelLab.**

---

## 16. BACKGROUNDS POR TELA / SUBMENU (PixelLab + Skia)

Inventário **completo** de telas e seu fundo. Muitos compartilham o fundo base escuro (`#0A0A0F`) com partículas Skia; só os marcados precisam de arte dedicada.

| Tela / Submenu | Background dedicado? | Fonte |
|---|---|---|
| Login | ✅ atmosférico | PixelLab |
| Registro | reusa login | — |
| Mapa de Solum (Hub) | — (é o próprio mapa) | Skia |
| Coleção (grimório) | textura sutil de papel | Skia/PixelLab (1) |
| Detalhe de herói | ✅ fundo da ORIGEM (5) | §5.1 PixelLab |
| Fusão | círculo + fundo opcional | Skia |
| Transmutação — Criar Eco | base + tint | Skia |
| Transmutação — Extrair Cristais | base + tint | Skia |
| Transmutação — Transmutar | círculo (já existe) | Skia |
| Perfil / Kael | ✅ fundo de legado | PixelLab (1) |
| Dungeon (seleção de andar) | fundo do bioma | §5.2 |
| Batalha | fundo do bioma | §5.2 |
| Between (entre-andares) | reusa bioma ou 1 dedicado | §14.1 |
| Torre | ✅ dedicado | §14.1 |
| Facção (detalhe) | ✅ emblema + cor da facção | PixelLab (7 emblemas, §7.2) |
| Loja / Economia (futuro) | ✅ dedicado | PixelLab (1) |
| Evento semanal (futuro) | ✅ por afinidade | Skia (tint) |

**Princípio:** não criar 1 background por submenu indiscriminadamente — a direção de arte (doc 10) prega fundo escuro com espaço negativo. Backgrounds dedicados só onde agregam (login, origem, perfil, torre, loja). Submenus de transmutação compartilham base com tint Skia.

**Contagem PixelLab adicional (telas):** ~**4-5** (login, coleção, perfil, torre, loja).

---

## 17. RESUMO QUANTITATIVO

### PixelLab (geração rasterizada)

| Categoria | Qtd MVP | Status |
|---|---|---|
| Heróis — bases por núcleo/build (2 por núcleo) | 10 | 🔄 8 feitos + 2 em fila |
| Heróis — estados de raridade (10 builds × 4 tiers) | 40 | 🔄 lendário em fila |
| Heróis — animações (bases) | ~5 × 10 | ⬜ |
| Inimigos corrompidos | ~10 | ⬜ |
| Chefes (7 × 3 fases) | 21 | ⬜ |
| Backgrounds de origem | 5 | ⬜ |
| Backgrounds de batalha (7 × 2) | 14 | ⬜ |
| Background da Torre (§14) | 1-2 | ⬜ |
| Backgrounds de tela (login, coleção, perfil, loja) | 4-5 | ⬜ |
| Ornamentos/ícones de mapa | 8-12 | ⬜ |
| Ícones ilustrados (recursos + facções) | 13-16 | ⬜ |
| Avatar de Kael (4 estágios) | 4 | ⬜ |
| Ícones de nó de legado/dungeon (opcional pixel) | ~14-18 | ⬜ |
| Ícones de app (revisão) | 3 | parcial |
| **TOTAL aproximado** | **~160-185 sprites** | |

> Itens "opcionais pixel" (ícones de efeito, nó, status) podem ser SVG — nesse caso o total PixelLab cai para ~130-150.

### Skia (composição procedural — variação infinita)

- Auras elementais por afinidade (8 perfis de partícula)
- Backgrounds de origem: shader/overlay de atmosfera
- Glow de raridade (6 intensidades)
- Palette swap / hue shift (matiz por afinidade)
- Linhas de transmutação animadas (dash-offset)
- Estados de herói: dano (flash+shake), morte (dissolução), crítico (pulso vermelho), aposentado (monocromático dourado)
- Estados de corrupção do mapa (overlays graduais)
- Mapa de Solum inteiro (paths, partículas, fronteiras, rosa dos ventos animada)
- Círculo alquímico de fusão (rotação dupla)
- Símbolos de afinidade/núcleo/mutação (SVG)
- Ícones de habilidade por família de efeito (9 SVG) + molduras de categoria
- Ícones de atributo (6 SVG) + hexágono/radar de genoma + badges de mutação
- Ícones de status effect em batalha (~12-16 SVG, tint buff/debuff)
- Árvore de legado (estrutura, nós, conexões) + moldura de herói aposentado
- Ícones de nó de dungeon (combate/elite/chefe/tesouro/descanso/evento)
- HUD: barras (HP/XP/Ultimate), divisores, badges, números de dano, vínculo (estrelas)

### A Multiplicação (por que parece infinito)

```
8 builds de herói
× 5 tiers de raridade
× 8 afinidades (cor de aura/palette Skia)
× 5 origens (background Skia)
× variação contínua de atributos (intensidade de glow/partículas)
= dezenas de milhares de heróis visualmente distintos
  a partir de ~48 sprites fixos
```

---

## 18. PIPELINE DE PRODUÇÃO (ordem sugerida)

1. ✅ **Heróis base** (8) — feito
2. 🔄 **Heróis lendário** (8) — em geração
3. ⬜ **Heróis demais tiers** (incomum, raro, épico) — 24 estados
4. ⬜ **Integração no código** — `HeroSprite` Skia (bases + camadas) + upload Supabase Storage
5. ⬜ **Inimigos corrompidos** (10)
6. ⬜ **Backgrounds de batalha** (14) — necessários para a tela de batalha
7. ⬜ **Chefes** (21) — maior esforço artístico
8. ⬜ **Backgrounds de origem** (5) — tela de detalhe/revelação
9. ⬜ **Avatar de Kael** (4) + ícones de mapa/facção
10. ⬜ **Cosméticos** — pós-MVP

### Armazenamento
Sprites PixelLab → baixados e versionados em **Supabase Storage** (`heroes/sprites/<núcleo>/<tier>/<direção>.png`), não dependendo do CDN do PixelLab. URLs públicas usadas no app.

---

## 19. DECISÕES PENDENTES DO USUÁRIO

1. ✅ **Builds por núcleo** (§1) — RESOLVIDO: 2 builds por núcleo (10 sprites).
2. **Tier Único:** gerar dedicado ou Lendário + efeito Skia? — recomendado: Skia.
3. **Animações:** só bases ou por tier? — recomendado: só bases.
4. **Símbolos/ícones (afinidade, núcleo, efeito, atributo, status, nó):** SVG vetorial ou pixel art? — recomendado: SVG (nitidez em qualquer escala).
5. **Recursos/facções:** pixel art (coesão) ou vetorial? — recomendado: pixel art.

---
*v0.1 — mapeamento inicial. Atualizar conforme assets são gerados e decisões são tomadas. Registrar geração concluída marcando ✅ nas tabelas.*
