# Pixel Art Bible — Fragmentos de Alma

## Objetivo

Criar uma leitura pixel art para **Alquimia Noire**: pesado, estiloso e vivo, preservando a identidade do app atual. A estética deve parecer ritualística, material e preciosa, não retrô genérica.

Esta bible existe para teste de conceito. Ela não substitui `docs/10_direcao_de_arte.md` nem `STYLE_BIBLE_LEONARDO.md`; traduz os dois para uma linguagem pixel art.

## Nome da Direção

**Alquimia Noire Pixel**

Resumo visual:

- Pixel art premium, escura, angular e legível.
- Fundo preto-azulado, ouro queimado e brilho de Prima.
- Silhuetas fortes em baixa resolução.
- Sem chibi, sem mascote fofo, sem nostalgia arcade colorida.
- Geometria alquímica e peso de matéria acima de efeitos fofos.

## Resoluções Base

| Tipo | Fonte de trabalho | Uso no app | Export sugerido |
|---|---:|---:|---:|
| Ícone pequeno | 16x16 | badge/status | 64x64 PNG |
| Ícone padrão | 24x24 | UI inline | 96x96 PNG |
| Ícone grande | 32x32 | botões/ações | 128x128 PNG |
| Ícone premium | 48x48 | recurso/loot | 192x192 PNG |
| Sprite de herói | 64x96 | batalha | 256x384 PNG |
| Sprite de chefe | 128x160 | batalha/entrada | 512x640 PNG |
| Retrato painel | 96x96 | território/coleção | 384x384 PNG |
| Splash bioma | 180x320 | dungeon entry | 720x1280 PNG |
| Background vertical | 360x640 | telas full mobile | 1080x1920 PNG |
| Mapa Solum | 390x640 | tela principal | 1170x1920 PNG |

Regra: trabalhar em baixa resolução e exportar em escala inteira (`2x`, `3x`, `4x`). Evitar blur, antialias agressivo e redimensionamento fracionado.

## Paleta Central

Manter as cores fundamentais do app:

| Função | Cor |
|---|---|
| Fundo profundo | `#0A0A0F` |
| Fundo mapa | `#0D0D18` |
| Superfície | `#111118` |
| Superfície elevada | `#1A1A24` |
| Ouro queimado | `#C8960C` |
| Ouro escuro | `#8A6508` |
| Ouro claro | `#E8B84B` |
| Pergaminho | `#E8E0D0` |
| Cinza médio | `#8A8A9A` |
| Borda sutil | `#3A3A4A` |
| Vermelho sangue | `#8B1A1A` |
| Cobalto | `#1A3A6E` |

Regras:

- Nunca usar branco puro em asset final.
- Luz máxima deve puxar para pergaminho, ouro pálido, azul gelo ou brilho elemental.
- Vermelho é perigo, corrupção, sangue ou alma em combustão; não é decoração genérica.
- Roxo/violeta deve ser controlado para Vazio, Sombra e Realidade, sem dominar a UI inteira.

## Cores por Frequência e Território

| Território | Frequência | Cor guia | Linguagem pixel |
|---|---|---|---|
| Kethara | Matéria | `#C8960C` | cristais vivos, rocha pesada, metal antigo |
| Mnemos | Mente | `#5B9BD5` | névoa azul, formas translúcidas, memória em camadas |
| Cinderfall | Alma | `#E05C35` | cinza preta, brasa interna, fogo ritual |
| Verdânia | Vida | `#27AE60` | raízes grossas, brilho verde-ouro, crescimento excessivo |
| Limiar | Morte | `#9E9E9E` | osso preservado, deserto claro, precisão angular |
| Axis | Realidade | `#7C4DFF` | geometria impossível, cobalto, diagramas fractais |
| Vênula | Sangue | `#C62828` | canais rubi, pulso lento, ornamentos vasculares |

## Linguagem de Forma

### Heróis Procedurais

Baseados no doc 02:

- **Guardião:** baixo, largo, placas de escudo, peso visual no chão.
- **Destruidor:** alto, assimétrico, lâminas e pontas.
- **Arauto:** fino, alongado, véus ou apêndices de energia.
- **Trickster:** corpo fragmentado, olhos/espelhos orbitais.
- **Invocador:** corpo pequeno com círculos, entidades ou runas ao redor.

### Camadas Visuais

Para pixel art, as 6 camadas do sistema visual viram famílias de sprites:

1. **Fundo:** placas/ambientes por origem.
2. **Silhueta:** base por núcleo e resistência.
3. **Paleta:** rampas de cor por afinidade e ressonância.
4. **Padrões:** runas, veios, fissuras, constelações.
5. **Ornamentos:** escudos, lâminas, véus, espelhos, círculos.
6. **Aura:** partículas, halo, distorção, campo.

## UI Pixel

- Bordas retas, cortes angulares e brackets.
- Botões quase sem arredondamento.
- Ícones sempre legíveis em 48dp.
- Frames de raridade devem comunicar categoria por cor e forma, não só por cor.
- Evitar texto pixelado em imagens geradas; tipografia deve continuar controlada pelo app.

## Animação

| Asset | Frames | Duração | Observação |
|---|---:|---:|---|
| Idle de herói | 4-6 | 800-1200ms | respiração mínima, sem bobbing fofo |
| Aura | 6-8 | 1000-1600ms | partículas lentas e assimétricas |
| Ataque comum | 4-6 | 250-400ms | leitura rápida no mobile |
| Habilidade | 8-12 | 600-900ms | enfatizar afinidade |
| Ultimate | 12-16 | 1000-1400ms | ritual, não explosão genérica |
| Boss telegraph | 8 | 800-1200ms | ameaça claramente antecipada |
| Fusão/revelação | 16-24 | 1600-2400ms | círculo, fragmentação e cristalização |

## Regras de Produção

- Exportar PNG com transparência para sprites, ícones e VFX finais.
- Guardar sheet fonte e slices individuais.
- Nomear por sistema e uso, não por aparência genérica.
- Produzir primeiro em grayscale/silhueta quando o asset precisar funcionar em tamanho pequeno.
- Validar em 390x844 e 430x932 antes de aprovar para app.

## Anti-Referências

Evitar:

- Chibi, cabeças gigantes, mascotes sorridentes.
- Pixel art colorida estilo arcade genérico.
- UI medieval clara/pergaminho dominante.
- Fantasia mobile genérica com excesso de brilho roxo.
- Texto embutido em imagens de IA.
- Sprites com detalhes impossíveis de ler em 48dp.
