# Integração Futura — Pixel Art sem Trocar a Direção Atual

Este documento descreve como testar pixel art no app depois, caso a direção seja aprovada. Nada aqui foi aplicado ao código.

## Princípio

Não substituir Skia e arte atual de imediato. A melhor validação é criar uma camada experimental que possa ser ligada/desligada por configuração.

## Estratégia Recomendada

### Fase 1 — Skin Experimental

Criar uma flag futura:

```ts
export const VISUAL_EXPERIMENT = {
  pixelArt: false,
} as const
```

Com isso, telas podem escolher entre renderer atual e renderer pixel.

### Fase 2 — Assets Isolados

Adicionar futuramente uma pasta de teste:

```text
app/fragmentos-de-alma/assets/pixel-art/
├── identity/
├── ui/
├── resources/
├── affinities/
├── heroes/
├── bosses/
├── territories/
├── battle/
└── vfx/
```

Não misturar com `assets/icons/` atual até a rota ser aprovada.

### Fase 3 — Testar 5 Pontos do App

| Tela/Sistema | Teste pixel art | Risco |
|---|---|---|
| Hub/Mapa | overlays pixel nos territórios | baixo |
| Coleção | frames e ícones pixel nos cards | baixo |
| Fusão | círculo/VFX pixel por cima do Skia | médio |
| Dungeon entry | splash pixel por território | baixo |
| Batalha | action icons + VFX pixel | médio |

## Pontos de Integração por Arquivo

| Arquivo atual | O que testar no futuro |
|---|---|
| `src/components/hero/HeroVisualSkia.tsx` | renderer alternativo com sprites por camada |
| `src/components/hero/HeroCard.tsx` | frames de raridade pixel |
| `src/components/fusion/AlchemicalCircle.tsx` | VFX pixel na revelação |
| `src/components/world/BiomeBackground.tsx` | backgrounds pixel por território |
| `src/components/world/FactionEmblem.tsx` | emblemas pixel como opção |
| `app/(game)/index.tsx` | mapa com overlays/markers pixel |
| `app/(game)/fusion.tsx` | slots e feedback pixel |

## Mapeamento Skia → Pixel

| Sistema atual | Tradução pixel art |
|---|---|
| `Canvas` com círculos/linhas | spritesheets de círculos rituais e partículas |
| Gradientes de aura | partículas discretas e rampas de 4-6 cores |
| Formas geométricas de herói | biblioteca de silhuetas por núcleo |
| Ornamentos proceduralmente desenhados | sprites de ornamento por mutação |
| BiomeBackground animado | parallax leve com sprites/tiles |
| Mapa vetorial | base cartográfica + overlays pixel |

## Formato Final de Assets

| Tipo | Formato |
|---|---|
| Ícones | PNG transparente, 4x |
| Sprites | PNG transparente em sheet + JSON/TS de frames |
| Backgrounds | PNG/JPG, sem texto |
| Frames 9-slice | PNG transparente |
| VFX | spritesheet PNG transparente |
| Paletas | TS ou JSON com ramps |

## Cuidados Técnicos

- React Native pode exibir pixel art borrada se a escala não for inteira. Validar `resizeMode`, dimensões fixas e densidade.
- Evitar JPG em sprites finais; JPG só serve para concept/splash.
- Usar texto nativo do app, não texto desenhado na imagem.
- Não depender só da cor para raridade, mutação ou afinidade.
- Validar contraste em modo escuro e telas pequenas.

## Recomendação de Protótipo

Antes de qualquer migração maior, criar um protótipo visual de uma única jornada:

1. Entrar no mapa.
2. Tocar em Kethara.
3. Ver painel de território com boss/bioma pixel.
4. Entrar em uma batalha mockada.
5. Usar ataque e habilidade.
6. Ver recompensa com Fragmentos de Alma.

Se esse fluxo parecer mais forte que a direção atual, aí sim vale discutir migração.
