# Portfolio Pixel Art — Fragmentos de Alma

Este pacote é uma visão experimental para testar **Fragmentos de Alma** em linguagem pixel art, sem alterar a direção artística atual do app e sem modificar arquivos dentro de `app/fragmentos-de-alma/`.

Base consultada:

- `docs/00_documento_mestre.md`
- `docs/PROGRESSO.md`
- `docs/02_sistema_visual.md`
- `docs/07_inimigos_chefes_recompensas.md`
- `docs/08_narrativa_lore_mundo.md`
- `docs/10_direcao_de_arte.md`
- `docs/11_mapa_de_solum.md`
- `app/fragmentos-de-alma/STYLE_BIBLE_LEONARDO.md`
- `app/fragmentos-de-alma/src/systems/world/mapData.ts`

## Estrutura

- `01-direcao/pixel-art-bible.md`: regras de estilo, resolução, paleta, animação e leitura visual.
- `02-inventario/asset-manifest.md`: inventário completo de assets que o app pode precisar se essa direção avançar.
- `02-inventario/pixelAssetManifest.ts`: versão estruturada do inventário para planejamento técnico.
- `03-prompts/leonardo-prompts.md`: prompts base e prompts usados/derivados para Leonardo.ai.
- `04-primeira-leva-economica/manifest.md`: imagens geradas, custos, URLs, qualidade e limitações.
- `04-primeira-leva-economica/images/leonardo/`: primeira leva econômica gerada pelo Leonardo.ai.
- `05-integracao/integracao-app.md`: como essa direção poderia ser testada no app depois, sem substituir Skia de imediato.
- `06-backlog/backlog-producao.md`: plano de produção por prioridade.

## Galeria Rápida

As imagens abaixo são **conceitos exploratórios**, não assets finais recortados.

### Ícones limpos

![Atlas de ícones pixel art](04-primeira-leva-economica/images/leonardo/07-ui-icons-unlabeled-retry.jpg)

### Personagens e arquétipos

![Kael e arquétipos de heróis](04-primeira-leva-economica/images/leonardo/09-kael-hero-lineup-unlabeled-retry.jpg)

### Fragmentos Antigos

![Lineup dos Fragmentos Antigos](04-primeira-leva-economica/images/leonardo/13-boss-lineup-wide-clean.jpg)

### Biomas

![Atlas de biomas](04-primeira-leva-economica/images/leonardo/14-biome-atlas-wide-clean.jpg)

### VFX e props

![Atlas de VFX e props](04-primeira-leva-economica/images/leonardo/12-vfx-props-unlabeled-retry.jpg)

## Decisão de Escopo

Este pacote não propõe migrar o jogo inteiro para pixel art agora. A recomendação é testar pixel art como uma das três rotas:

1. **Rota A — Pixel total:** personagens, UI, mapa, batalha e dungeons em pixel art.
2. **Rota B — Pixel gameplay:** sprites, ícones e VFX em pixel; splash/marketing continuam pintados.
3. **Rota C — Pixel como camada alternativa:** skins/eventos em pixel, mantendo Skia e arte pintada como direção principal.

Para uma validação rápida, a Rota B é a mais segura: dá personalidade ao gameplay sem descartar a direção Alquimia Noire já implementada.
