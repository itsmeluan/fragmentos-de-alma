# 🎨 Sistema Visual de Heróis
*Fragmentos de Alma — Design Document v1.1*
*Atualizado em: 2026-06-26 — migração para sprites pixel art (D49–D54)*

---

## Visão Geral

O visual de cada herói é determinado pelo seu genoma, mas **não gerado em tempo de execução**. A identidade visual é composta por sprites pixel art pré-renderizados, selecionados deterministicamente a partir de três variáveis do genoma: **NÚCLEO** (classe de combate), **Build** (sub-variante por atributo dominante) e **Raridade** (tier visual). Cada combinação produz um sprite distinto.

O objetivo permanece o mesmo: o jogador olha para um herói e lê sua natureza pela aparência em segundos.

---

## Arquitetura Visual

### Sprites de Herói

Cada herói tem um sprite pixel art (128×128px base, 8 direções) selecionado por:

```
NÚCLEO (5 classes) × BUILD (2 por classe) × RARIDADE (6 tiers) × DIREÇÃO (8)
= 480 sprites de herói
```

**Resolução:** sprites de heróis Únicos são 136×136px para acomodar detalhes extras; normalizados com `UNIQUE_SPRITE_INSET_RATIO = 0.10` na renderização para equalizar o tamanho visual entre tiers.

### Registro de sprites

O arquivo `src/systems/visual/spriteRegistry.ts` é um mapa estático auto-gerado de `require()` com literais estáticas, obrigatório pelo Metro bundler do React Native:

```
SPRITE_REGISTRY[nucleoId][buildId][raridade][direction] → require(path)
```

Resolução com fallback: se o sprite do tier exato não existir, `getHeroSpritePath()` busca o tier imediatamente inferior.

---

## Builds por NÚCLEO

Cada NÚCLEO tem **2 builds** (sub-variantes visuais), determinadas pelo atributo dominante do herói:

| NÚCLEO | Build A | Build B | Critério de seleção |
|---|---|---|---|
| Guardião | `guardiao` | `sentinela` | força > resistência → `guardiao`; resistência ≥ força → `sentinela` |
| Destruidor | `reaver` | `fragmentador` | força > ressonância → `reaver`; ressonância ≥ força → `fragmentador` |
| Arauto | `arauto` | `corneiro` | vontade > aura → `arauto`; aura ≥ vontade → `corneiro` |
| Trickster | `cacador` | `vidente` | agilidade > ressonância → `cacador`; ressonância ≥ agilidade → `vidente` |
| Invocador | `invocador` | `anciao` | ressonância > aura → `invocador`; aura ≥ ressonância → `anciao` |

Isso garante que heróis com o mesmo NÚCLEO mas diferentes distribuições de atributos tenham visuais distintos, comunicando o papel dentro da classe.

---

## Backgrounds

### Backgrounds de Batalha
42 imagens em `assets/sprites/backgrounds/[raridade]/[territorio].png`:
- 6 raridades × 7 territórios (axis, cinderfall, kethara, limiar, mnemos, venula, verdania)
- Selecionados pela raridade do herói ativo + território do bioma atual
- Registro: `BACKGROUND_REGISTRY[raridade][origem]` em `backgroundRegistry.ts`

### Backgrounds de Origem
Imagens por origem de herói em `assets/sprites/backgrounds/origens/[raridade]/[origem]/`:
- 5 origens (Abissal, Celestial, Primordial, Forjada, Errante) × 6 raridades × variantes
- Registro: `ORIGIN_BACKGROUND_REGISTRY` em `originBackgroundRegistry.ts`

### Ícones de Elemento (Afinidade)
8 ícones SVG/PNG em `assets/sprites/elements/[afinidade].png`, usados no strip inferior do HeroCard:

| Afinidade | Símbolo alquímico |
|---|---|
| Fogo | triângulo ▲ com linha horizontal no terço inferior |
| Água | triângulo ▽ com linha horizontal no terço superior |
| Terra | triângulo ▽ sem linha |
| Vento | triângulo △ sem linha |
| Vazio | círculo com ponto central e raios curtos |
| Luz | sol geométrico de 8 pontas |
| Sombra | lua crescente com estrela interna |
| Éter | estrela de 6 pontas (dois triângulos sobrepostos) com círculo |

---

## Paleta de Cores por Afinidade

Mantida para uso em auras, barras de Ultimate, bordas de raridade e efeitos de UI:

| Afinidade | Cor Primária | Cor Secundária | Cor de Brilho |
|---|---|---|---|
| Fogo | #C0392B | #E67E22 | #FFEB3B |
| Água | #1A6E8E | #2980B9 | #AEE6FF |
| Terra | #5D4037 | #8D6E63 | #A5D6A7 |
| Vento | #80CBC4 | #B2EBF2 | #FFFFFF |
| Vazio | #1A1A2E | #6A0572 | #E040FB |
| Luz | #FFF9C4 | #FDD835 | #FFFFFF |
| Sombra | #212121 | #4A148C | #9C27B0 |
| Éter | #E8EAF6 | #5C6BC0 | #82B1FF |

---

## Geração de Nome

O nome é gerado deterministicamente a partir do genoma via `generateName(genome, seed)` em `src/utils/nameGenerator.ts`.

**Formato:** uma única palavra composta — `[Prefixo de ORIGEM][Raiz de NÚCLEO][Sufixo de AFINIDADE]`

- Sem espaços, sem apóstrofo, sem epítetos de mutação
- Determinístico: a mesma seed + genoma produz sempre o mesmo nome
- Implementado com `makeSeededRng(seed)` para reprodutibilidade

### Exemplos:
- Abissal + Destruidor + Vazio = **"Nethdurakvar"**
- Celestial + Arauto + Luz = **"Lyrasolven"**
- Primordial + Guardião + Terra = **"Korumdurath"**
- Forjada + Invocador + Éter = **"Velsiraethun"**

> **Nota (D54):** epítetos de mutação ("O Partido", "A Sem-Fim") e o parâmetro `ancestorName` foram removidos no redesenho de nomes. Nomes curtos ficam mais legíveis no strip de 26px do HeroCard e são mais memoráveis. Mutações são comunicadas visualmente pelo sprite e pelo detalhe do herói, não pelo nome.

---

## VisualParams Procedurais (uso interno)

O sistema `src/systems/visual/generator.ts` ainda gera `VisualParams` proceduralmente a partir do genoma — usado em contextos onde um sprite completo não está disponível (preview de fusão, fallback em biomas futuros). Não é a fonte primária de identidade visual do MVP.

---

## Identidade Visual Única

Dois heróis nunca terão a mesma combinação de:
- Nome (seed baseada em timestamp + IDs dos pais)
- Genoma (herança com drift aleatório — ver doc 01)
- Build visual (atributo dominante pode diferir mesmo no mesmo NÚCLEO)
- Raridade (calculada pelo genoma — ver doc 01)

> Um herói Guardião Lendário nunca é igual a outro Guardião Lendário: builds diferentes, stats distintos, habilidades procedurais próprias.

---

## Notas de Design

- Sprites pixel art mantêm a regra de legibilidade: o NÚCLEO e a raridade são identificáveis em miniatura (card 3 colunas, ~110px de largura)
- A tela de transmutação pré-visualiza os genes e a probabilidade de raridade antes de confirmar — o sprite final só é revelado após a operação
- Heróis de tier Único têm sprites com detalhes extras (136×136px) que os destacam imediatamente na grade

---
*Versão 1.1 — atualizado em 2026-06-26. Decisões de implementação relevantes: D49, D50, D51, D52, D53, D54 em docs/09_roadmap_mvp.md*
