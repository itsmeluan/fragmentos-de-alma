# RESUMO — codex-output

## O que foi feito

- `01-leonardo-prompts/prompts.md`: 15 prompts prontos para Leonardo.ai: ícone, splash principal, 7 chefes territoriais e 6 splashes de bioma, todos baseados em `STYLE_BIBLE_LEONARDO.md`.
- `02-lore-textos/conteudo.md`: 5 falas de onboarding do Kael, 20 habilidades com nomes/descrições baseadas no gerador procedural e 1 parágrafo expandido para cada um dos 7 territórios de `mapData.ts`.
- `03-supabase/supabase.md`: revisão das 5 migrations, achados de schema/RLS, índices recomendados e esboço de 2 Edge Functions: ranking semanal de fusões e webhook de início de evento.
- `04-testes/integration.test.ts`: teste de integração sem mocks para Supabase usando `@supabase/supabase-js`, URL/key do `.env`, Auth real, insert de herói, persistência de fusão e leitura de player.
- `05-leonardo-assets/`: 16 assets reais gerados pelo Leonardo.ai e baixados localmente: ícone, splash principal, 7 retratos dos Fragmentos Antigos e 7 artes verticais de território/bioma.
- `05-leonardo-assets/manifest.md`: manifesto com arquivos locais, dimensões, URLs Leonardo, custos e controle de orçamento.
- `06-lore-jogo/textos-in-game.md`: pacote de textos faltantes segundo o doc 08: prólogo, entradas de Codex, painéis de facção, decisões, diálogos dos 7 Fragmentos Antigos, Memórias Ressurgentes, notificações do Mapa Vivo e dicas de carregamento.
- `pixel-art-portfolio/`: portfólio experimental completo para testar Fragmentos de Alma em direção pixel art, sem alterar o app atual.
- `pixel-art-portfolio/01-direcao/pixel-art-bible.md`: bible de Pixel Art Alquimia Noire com resolução, paleta, formas, UI, animação e regras de produção.
- `pixel-art-portfolio/02-inventario/asset-manifest.md`: inventário completo dos assets visuais que o app precisaria em uma rota pixel art.
- `pixel-art-portfolio/02-inventario/pixelAssetManifest.ts`: manifesto estruturado em TypeScript para rastrear categorias, prioridade e uso.
- `pixel-art-portfolio/03-prompts/leonardo-prompts.md`: prompts Leonardo.ai recomendados para próximas rodadas, incluindo a formulação sem pseudo-texto.
- `pixel-art-portfolio/04-primeira-leva-economica/`: 14 imagens JPG geradas pelo Leonardo.ai como primeira leva econômica de validação pixel art.
- `pixel-art-portfolio/04-primeira-leva-economica/manifest.md`: caminhos locais, URLs, custos, status visual e limitações da leva pixel art.
- `pixel-art-portfolio/05-integracao/integracao-app.md`: plano de integração futura via flag/skin experimental, sem substituir Skia de imediato.
- `pixel-art-portfolio/06-backlog/backlog-producao.md`: backlog por sprints para aprovar, prototipar e produzir a rota pixel art.

## Uso do Leonardo.ai

- Saldo inicial medido: `6689` API tokens.
- Teto solicitado: até 30%, aproximadamente `2006` tokens.
- Saldo final medido: `6575` API tokens.
- Consumo real: `114` API tokens, cerca de `1,7%` do saldo inicial.
- Custo somado informado pelo Leonardo nas respostas MCP: `$0.165 USD`.
- Estratégia: uma geração por asset, sem variações, sem upscale e sem pós-processamento local.

### Rodada pixel art

- Ferramenta usada: `mcp__leonardo_ai.high_definition_generalist`.
- Total de gerações: `14`.
- Custo somado informado pelo Leonardo nas respostas MCP: `$0.1828 USD`.
- Estratégia: sheets/atlases econômicos para validar várias categorias por chamada; sem variações, sem upscale.
- Observação: o MCP desta sessão não expôs consulta de saldo/token balance, então o controle foi feito pelo número baixo de chamadas e custo retornado por geração.

## Incompleto ou dependente de ambiente

- Não executei o teste de integração contra o Supabase para evitar criar usuários/dados reais sem confirmação explícita. O teste limpa os heróis que cria e remove o player apenas quando ele criou um usuário efêmero.
- Se o Supabase Auth exigir confirmação de e-mail, o teste precisa de `SUPABASE_TEST_EMAIL` e `SUPABASE_TEST_PASSWORD` apontando para um usuário já confirmado.
- Os assets do Leonardo foram salvos como `.jpg`, porque foi o formato retornado pelo CDN. Não converti para PNG.
- No portfólio pixel art, as primeiras 6 gerações do Leonardo criaram pseudo-texto em pranchas visuais. Mantive como rascunho documentado e gerei retries limpos (`07` a `14`) usando prompts de atlas sem tipografia.
- As imagens pixel art são conceitos exploratórios em JPG, não sprites finais recortados, limpos em alpha ou validados em 48dp.

## Decisões tomadas

- Mantive todos os novos artefatos dentro de `codex-output/`.
- Para "fusão" no teste, usei a estrutura atual do banco: novo registro em `heroes` com `parent_a_id`, `parent_b_id`, `generation = 2` e incremento de `players.total_fusions`, já que não existe tabela `fusion_events`.
- Nos prompts e assets de bosses, alinhei os 7 chefes aos 7 territórios/frequências de Solum.
- Para o pedido novo de splash por bioma, usei os 7 territórios do doc 08 e `mapData.ts`: Kethara, Mnemos, Cinderfall, Verdania, Limiar, Axis e Vênula.
- Na revisão Supabase, destaquei inconsistências entre docs/schema/código: `ordem_pedra_viva` versus `pedra_viva` e `cavernas_abismo` versus `abismo`.
- Para o portfólio pixel art, recomendei tratar a direção como experimento isolado e testar primeiro uma rota "Pixel Gameplay" antes de qualquer migração total.
- Para evitar desperdício no Leonardo, usei atlases/contact sheets em vez de gerar cada asset individualmente.
- Para futuras gerações pixel art, a formulação mais confiável foi "plain unlabeled pixel art sprite atlas" com proibição explícita de letras, números, títulos e captions.
