# Backlog de Produção — Pixel Art Portfolio

Backlog para transformar a visão em assets reais, caso a direção seja aprovada.

## Sprint 0 — Aprovação Visual

Objetivo: decidir se pixel art combina com Fragmentos de Alma.

- Revisar as imagens `07`, `09`, `12`, `13` e `14` da primeira leva.
- Escolher uma das rotas: Pixel Total, Pixel Gameplay ou Pixel Alternativo.
- Definir se Kael deve parecer mais adulto/ocidental ou mais estilizado.
- Definir quão “pixel puro” a estética precisa ser: manual rígida ou pixel-painterly.
- Escolher 1 território piloto: recomendação inicial, **Kethara**.

## Sprint 1 — Kit P0 de UI e Recursos

Entregáveis:

- Ícone do app em pixel art.
- Splash vertical de fusão em pixel art.
- 4 ícones de tab.
- 6 ícones de ação de batalha.
- 3 ícones de recurso.
- 8 ícones de afinidade.
- 6 frames de raridade.
- Frames de botão/modal/card.

Critério de aceite:

- Tudo legível em 48dp.
- Sem texto embutido.
- Export PNG transparente quando aplicável.
- Funciona sobre `#0A0A0F` e `#111118`.

## Sprint 2 — Kethara Vertical Slice

Entregáveis:

- Splash de Kethara.
- Mini mapa/território de Kethara.
- Emblema pixel da Pedra Viva.
- Boss Keth-Memory: busto, sprite e telegraph.
- 3 props de dungeon: cristal vivo, ponte de pedra, geodo rachado.
- 2 inimigos corrompidos de Matéria.
- 3 VFX: ataque, defesa, fragmentação.

Critério de aceite:

- A entrada de dungeon parece diferente da direção atual, mas ainda é Fragmentos de Alma.
- Keth-Memory comunica peso, matéria e fraqueza visível.
- Ícones e VFX cabem na tela vertical sem poluição.

## Sprint 3 — Heróis Procedurais

Entregáveis:

- 5 silhuetas por núcleo.
- 3 pesos por silhueta.
- 8 paletas de afinidade.
- 5 famílias de padrão por origem.
- 5 famílias de ornamento por núcleo.
- 5 ornamentos de mutação.
- 8 auras por afinidade.

Critério de aceite:

- Heróis continuam “procedurais” em vez de virarem personagens fixos.
- O jogador lê núcleo/afinidade/raridade em até 3 segundos.
- A variedade visual não quebra legibilidade.

## Sprint 4 — Mapa Vivo

Entregáveis:

- Base pixel de Solum.
- 7 territórios.
- Linhas de Prima.
- Rosa dos ventos.
- 5 estados de corrupção.
- 3 estados políticos de fronteira.
- 3 estados de progresso do jogador.

Critério de aceite:

- O mapa ainda parece cartografia alquímica, não mapa comum de RPG.
- Estados de corrupção são visíveis mesmo com daltonismo parcial.
- As labels continuam texto nativo no app.

## Sprint 5 — Batalha MVP

Entregáveis:

- Sprites de 3 heróis piloto.
- 5 inimigos base.
- 1 boss piloto.
- Action wheel pixel.
- Barras HP/Ultimate.
- VFX de ataque, defesa, cura, corrupção e ultimate.
- Telegraph de boss.

Critério de aceite:

- Turno, alvo e perigo são claros.
- VFX são satisfatórios mas curtos.
- A tela não fica “barulhenta” com 3 heróis + inimigos.

## Sprint 6 — Sete Territórios

Entregáveis:

- 7 splashes de dungeon.
- 7 bosses completos.
- 7 emblemas de facção.
- 7 props principais.
- 7 overlays de corrupção.

Critério de aceite:

- Cada território é reconhecível por forma e matéria, não só por cor.
- Chefes têm silhueta distinta.
- Vênula e Cinderfall não viram apenas “tudo vermelho”.

## Sprint 7 — Polimento e Live Ops

Entregáveis:

- Temas de fusão cosméticos.
- Bordas de herói cosméticas.
- VFX sazonais.
- Chefes de evento.
- Títulos/frames de conta.
- Store screenshots.

Critério de aceite:

- Cosméticos não confundem poder.
- Eventos preservam Alquimia Noire.
- Assets continuam sustentáveis em produção.

## Pendências Técnicas

- Definir pipeline de recorte: Leonardo → limpeza → PNG alpha → sprite sheet.
- Definir padrão de metadados de frame.
- Validar escalonamento pixel-perfect em React Native.
- Testar memória/performance de spritesheets no Expo.
- Decidir se backgrounds finais podem ser JPG ou precisam de PNG.

## Próxima Melhor Ação

Escolher uma rota:

- **Aprovar para protótipo:** produzir Sprint 1 + Kethara Vertical Slice.
- **Ajustar direção:** pedir nova leva com mais/menos pixel, mais escura, menos UI ornamentada, ou mais próxima do Skia atual.
- **Descartar por enquanto:** arquivar o pacote como estudo visual sem custo técnico adicional.
