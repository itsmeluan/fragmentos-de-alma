# Style Bible para Leonardo.ai — Fragmentos de Alma

Este guia existe para gerar assets raster no Leonardo.ai mantendo consistencia com o app. Use como base para prompts, image guidance e revisoes.

## Identidade

**Nome visual:** Alquimia Noire

**Sensacao:** pesado, estiloso, vivo. Um RPG mobile vertical sobre alquimia, almas fragmentadas, politica de faccoes e herois procedurais. A arte deve parecer mistica, fisica e preciosa, nao generica.

**Direcao visual:** fantasia alquimica sombria, semi-plana, com geometria forte, composicao assimetrica, luzes neon sutis sobre fundos escuros, metais queimados, pedra, cristal, pergaminho envelhecido e particulas de energia.

## Paleta

- Fundo principal: `#0A0A0F`
- Fundo secundario: `#111118`
- Fundo terciario: `#1A1A24`
- Ouro queimado: `#C8960C`
- Ouro escuro: `#8A6508`
- Ouro claro: `#E8B84B`
- Branco pergaminho: `#E8E0D0`
- Texto secundario/cinza: `#8A8A9A`
- Borda sutil: `#3A3A4A`
- Vermelho sangue: `#8B1A1A`
- Vermelho vivo: `#C0392B`
- Azul cobalto: `#1A3A6E`
- Azul principal: `#2E5FA3`

Regra: nunca usar branco puro. Qualquer luz clara deve tender a pergaminho, dourado pálido, azul gelo ou brilho elemental.

## Elementos Visuais Recorrentes

- Circulos alquimicos com triangulos inscritos.
- Hexagonos, losangos, escudos angulares e cristais fragmentados.
- Linhas de transmutacao como circuitos finos.
- Runas abstratas e marcas de selos, sem copiar alfabetos reais de modo dominante.
- Particulas pequenas de Prima, cinzas, faiscas, poeira mineral e luz elemental.
- Cantos de UI em bracket angular, bordas cortadas, quase sem arredondamento.

## Regras de Composicao

- Mobile portrait first.
- Fundos escuros com foco claro no objeto.
- Bordas angulares; evitar formas fofas, infladas ou cartunescas.
- Evitar simetria perfeita demais; usar diagonais leves.
- Legibilidade em tamanho pequeno e medio.
- Se for icone: silhueta forte, fundo transparente, margem segura de 12%.
- Se for background: deixar area central/baixa com contraste controlado para UI por cima.
- Se for splash/key art: espaco negativo amplo e centro ritualistico.

## O Que Evitar

- Cartoon infantil.
- Chibi.
- Realismo fotografico.
- Anime generico.
- Paletas claras ou pastel.
- Dourado amarelo demais.
- Vermelho decorativo dominante.
- Gradientes roxos/azuis como tema unico.
- Cantos arredondados grandes.
- Texto gerado dentro da imagem, exceto se o pedido for especificamente logo.
- Logos, personagens, simbolos ou estilos reconheciveis de franquias existentes.

## Categorias de Asset

### Portraits

Retratos semi-ilustrados, busto ou meio-corpo, fundo escuro ritualistico. Kael deve parecer um Fragmentador: jovem adulto, marcado por runas, roupa funcional de viagem e ritual, olhar cansado mas determinado.

### Biomas

Backgrounds verticais 9:19.5 ou 9:16, sem personagens, com area de UI respiravel. Devem comunicar materia e ambiente: ruinas, abismo, cupula celestial, forja, terras ancestrais, nevoa espectral.

### Icones

Preferir icones pintados/line-art premium em PNG transparente. Devem funcionar em 48dp e 64dp. Usar contorno escuro, brilho controlado e geometria angular.

### Recursos

Fragmentos de Alma: cristal azul-pergaminho partido, energia interna.

Cristais de Essencia: cristal mais limpo, prismático, com nucleo dourado.

Ecos: memoria cristalizada, fantasma dourado antigo, sem parecer moeda premium comum.

### VFX

Folhas de sprites ou frames separados com fundo transparente: impacto, corte, pulso, cura, corrupcao, revelacao, fusao, morte por fragmentacao.

## Primeiro Pacote de Teste

Gerar uma folha de direcao visual com:

1. Portrait de Kael.
2. Background de Ruinas da Genese.
3. Oito icones de afinidade: fogo, agua, terra, vento, eter, luz, sombra, vazio.
4. Seis icones de batalha: ataque, defender, trocar, habilidade, ultimate, fugir/retornar.
5. Tres icones de recursos: Fragmentos de Alma, Cristais de Essencia, Ecos.
6. Mini key art/splash alternativo com circulo alquimico e cristal fragmentado.

Para teste, uma unica imagem em formato asset sheet e suficiente. Depois de aprovar a direcao, gerar cada asset separadamente em PNG.

## Prompt Base

Use sempre:

`dark alchemical fantasy mobile RPG, Alquimia Noire, angular geometry, burned gold accents, parchment white highlights, deep black-blue background, fragmented soul crystals, transmutation lines, subtle neon glow, premium game asset, high contrast, readable small silhouette, elegant severe mystical design, semi-flat illustration, painterly texture, no pure white, no cartoon, no chibi, no generic anime, no rounded UI, no existing franchise symbols`

## Negative Prompt Base

`pure white, cute, chibi, cartoon, soft rounded shapes, pastel palette, generic anime, photorealistic, sci-fi plastic, cyberpunk city, excessive purple gradient, low contrast, messy details, unreadable icon, text, watermark, logo of existing franchise, blurry, noisy, oversaturated, childish, smiling mascot`

