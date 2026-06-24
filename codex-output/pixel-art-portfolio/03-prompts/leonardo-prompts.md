# Prompts Leonardo.ai — Pixel Art Portfolio

Base: `STYLE_BIBLE_LEONARDO.md`, `docs/02_sistema_visual.md`, `docs/08_narrativa_lore_mundo.md`, `docs/10_direcao_de_arte.md` e `mapData.ts`.

## Prompt Base Recomendado

Use este bloco para próximas gerações pixel art:

```text
Plain unlabeled pixel art asset atlas for Fragmentos de Alma, a dark alchemical fantasy mobile RPG. Clean deep black-blue background, isolated sprites only, no frames unless requested, no title, no logo, no captions, no letters, no numbers, no watermark. Crisp blocky premium pixel art, angular silhouettes, Alquimia Noire, burned gold accents, parchment warm highlights, subtle elemental glow, readable at mobile size, no pure white. Avoid cute, chibi, generic anime, photorealism, pastel palette, rounded sticker style, typography, messy unreadable details, existing franchise symbols.
```

## Regra Aprendida nesta Rodada

Evitar pedir “design sheet”, “portfolio board”, “presentation sheet” ou “labels”. Mesmo com `no text`, o Leonardo tende a inventar tipografia falsa nesses formatos. A formulação que funcionou melhor foi:

```text
Only isolated sprites floating on a clean deep black-blue background. No frames, no panels, no poster layout, no title, no logo, no captions, no letters, no numbers, no symbols that look like writing, no watermark.
```

## Prompts para Produção Posterior

### 1. Ícones de UI

```text
A plain unlabeled pixel art sprite atlas for Fragmentos de Alma. Only isolated object sprites floating on a clean deep black-blue background. No frames, no panels, no poster layout, no title, no logo, no captions, no letters, no numbers, no symbols that look like writing, no watermark. Include separated small sprites: elemental fire flame, water drop, earth stone, wind swirl, void shard, light sigil, shadow mask, aether star; attack sword, defend shield, swap arrows, skill rune circle, ultimate crystal, retreat gate; soul fragment crystal, essence crystal, echo memory shard. Crisp blocky pixel art, angular silhouettes, black outline, burned gold accents, parchment warm highlights, muted high contrast, readable at 32px.
```

Parâmetros sugeridos:

- Tool: `high_definition_generalist`
- Style: `None`
- Size: `1024x1024`
- Pós-processo recomendado: recortar manualmente cada ícone e exportar PNG transparente.

### 2. Heróis Procedurais

```text
A plain unlabeled pixel art character lineup for Fragmentos de Alma. Only six isolated character sprites and bust silhouettes standing on a clean deep black-blue background, no frames, no panels, no title, no logo, no captions, no letters, no numbers, no watermark. Include Kael as a young adult Fragmenter in practical travel-ritual clothes with faint soul runes, then five soul hero archetypes: Guardian broad heavy shield fragments, Destroyer tall asymmetric blade body, Herald elongated veil-like nonhuman shape, Trickster fragmented body with orbiting mirror eyes, Summoner small central figure with floating runic circles. Crisp blocky premium pixel art, angular silhouettes, burned gold accents, parchment warm highlights, elemental color accents, readable mobile silhouettes.
```

Parâmetros sugeridos:

- Tool: `high_definition_generalist`
- Style: `None`
- Size: `1024x1024`

### 3. Sete Fragmentos Antigos

```text
Wide plain unlabeled pixel art boss lineup for Fragmentos de Alma. Exactly seven isolated Ancient Fragment boss bust sprites in one horizontal row on a clean deep black-blue background. No frames, no title, no logo, no captions, no letters, no numbers, no watermark. From left to right: Reality impossible angular crystal with amber core; Matter living stone amber guardian; Mind faceless veil entity with echo masks; Soul ash priest with ember bones; Life overgrown root monarch with seed heart; Death bone crystal threshold figure; Blood regal vascular construct with sealed golden vein. Crisp blocky premium pixel art, severe readable silhouettes, Alquimia Noire, burned gold accents, parchment warm highlights, dark palette, no gore, no cute, no chibi, no photorealism, no typography.
```

Parâmetros sugeridos:

- Tool: `high_definition_generalist`
- Style: `None`
- Size: `1536x1024`

### 4. Sete Biomas/Territórios

```text
Wide plain unlabeled pixel art biome atlas for Fragmentos de Alma. Exactly seven small vertical environment thumbnails in one horizontal row on a clean deep black-blue background. No frames, no title, no logo, no captions, no letters, no numbers, no watermark. From left to right: Kethara amber living crystal mountains; Mnemos blue memory fog city; Cinderfall black ash forge volcano; Verdania giant green-gold sacred tree city; Limiar bone-white preserved desert ruins; Axis impossible cobalt geometric reality city; Venula ruby vascular wetland canals. Environments only, no characters. Crisp blocky premium pixel art, dark UI-safe lower areas, angular Alquimia Noire shapes, burned gold accents, parchment warm highlights, readable depth, no photorealism, no cute, no pure white, no typography, no sci-fi plastic.
```

Parâmetros sugeridos:

- Tool: `high_definition_generalist`
- Style: `None`
- Size: `1536x1024`

### 5. VFX e Props

```text
A plain unlabeled pixel art VFX and dungeon prop atlas for Fragmentos de Alma. Only isolated small sprites on a clean deep black-blue background, no frames, no panels, no title, no logo, no captions, no letters, no numbers, no watermark. Include VFX sprites: soul fusion burst, alchemical reveal pulse, slash impact, shield guard, healing root glow, corruption smoke, boss telegraph charge, defeat fragmentation. Include props: living crystal node, memory fog lantern, ash brazier, root altar, bone threshold gate, reality prism, blood-channel vessel. Crisp blocky premium pixel art, angular silhouettes, limited dark palette, burned gold transmutation lines, parchment warm highlights, subtle elemental colors.
```

Parâmetros sugeridos:

- Tool: `high_definition_generalist`
- Style: `None`
- Size: `1024x1024`

## Prompts Usados na Primeira Leva

Os prompts usados nos arquivos `01` a `06` produziram boa direção visual, mas também geraram tipografia falsa. Foram mantidos como rascunho e substituídos por retries limpos.

Os prompts usados nos arquivos `07` a `14` são os prompts recomendados acima ou variações diretas deles.

## Prompts para Assets Individuais Futuros

### App Icon Pixel

```text
Single pixel art app icon object for Fragmentos de Alma, no text. A fragmented soul crystal suspended inside an angular alchemical circle, burned gold transmutation lines, parchment warm inner glow, deep black-blue background, strong silhouette readable at 48dp, premium dark alchemical fantasy mobile RPG, Alquimia Noire, no logo letters, no watermark, no pure white, no cute, no chibi.
```

### Splash Pixel

```text
Vertical pixel art mobile splash background for Fragmentos de Alma, no text. Ritual chamber seen from above and slightly tilted, two broken soul crystals orbiting a larger unborn crystal, angular transmutation circle carved in burned gold, deep black-blue stone, subtle cobalt and ember glows, Prima particles, broad negative space in the upper third for app title overlay, central ritual focus, no typography, no watermark, no pure white.
```

### Dungeon Splash Individual

```text
Vertical pixel art dungeon entrance background for [TERRITORY], no text. [TERRITORY VISUAL DETAILS]. Deep black-blue shadows, burned gold accents, parchment warm highlights, UI-safe lower third, no characters, angular Alquimia Noire composition, premium mobile RPG asset, no watermark, no typography, no pure white.
```

### Boss Individual

```text
Pixel art boss bust sprite for [BOSS], Ancient Fragment of [FREQUENCY], no text. [BOSS VISUAL DETAILS]. Visible weak point as [WEAK POINT], severe readable silhouette, deep black-blue shadow, burned gold ritual accents, parchment warm highlights, premium dark alchemical fantasy mobile RPG, no gore, no watermark, no typography, no pure white.
```
