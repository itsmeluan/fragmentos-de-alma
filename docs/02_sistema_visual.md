# 🎨 Sistema de Geração Visual Procedural
*Fragmentos de Alma — Design Document v0.1*

---

## Visão Geral

O visual de cada entidade é **gerado diretamente a partir do seu genoma** — não existe arte pré-definida por personagem. O mesmo conjunto de fragmentos base pode gerar visuais radicalmente diferentes dependendo dos genes resultantes da fusão.

O objetivo é que o jogador olhe para um herói e consiga *ler* sua natureza apenas pela aparência.

---

## Arquitetura Visual

O visual é composto por **6 camadas independentes**, cada uma controlada por genes específicos:

```
[ 6 ] Efeitos de Aura        ← controlado por AURA + AFINIDADE
[ 5 ] Detalhes e Ornamentos   ← controlado por NÚCLEO + mutações
[ 4 ] Padrões e Marcações     ← controlado por ORIGEM + VONTADE
[ 3 ] Paleta de Cores         ← controlado por AFINIDADE + RESSONÂNCIA
[ 2 ] Forma Base / Silhueta   ← controlado por NÚCLEO + RESISTÊNCIA
[ 1 ] Fundo / Ambiente        ← controlado por ORIGEM
```

Cada camada é gerada proceduralmente e composta em tempo real.

---

## Camada 1 — Fundo / Ambiente

Define o cenário que envolve o herói na tela de coleção/detalhe.

| ORIGEM | Ambiente gerado |
|---|---|
| Abissal | Profundezas escuras, partículas que caem como cinzas |
| Celestial | Nuvens luminosas, luz que emana de cima |
| Primordial | Terra rachada, raízes antigas, neblina verde |
| Forjada | Forja industrial, faíscas, metal fundido |
| Errante | Céu vazio em movimento, estrelas em deriva |

> Híbridos de ORIGEM geram ambientes mesclados — ex: Abissal+Celestial cria um abismo com luz fraca vindo do fundo.

---

## Camada 2 — Silhueta Base

A forma geral da entidade é determinada por **NÚCLEO** (arquétipo) e **RESISTÊNCIA** (massa/bulk).

### Formas por NÚCLEO:
- **Guardião** → silhueta larga, baixa, estável (centro de gravidade baixo)
- **Destruidor** → silhueta alta, assimétrica, com extremidades afiadas
- **Arauto** → silhueta fina, alongada, com proporções não-humanas
- **Trickster** → silhueta fragmentada, múltiplos volumes menores ao redor do centro
- **Invocador** → silhueta central pequena rodeada de formas orbitando

### Modificador de RESISTÊNCIA:
```
RESISTÊNCIA 1–30   → silhueta leve, translúcida, com vazios
RESISTÊNCIA 31–60  → silhueta sólida padrão
RESISTÊNCIA 61–100 → silhueta densa, com volumes extras, bordas grossas
```

---

## Camada 3 — Paleta de Cores

Gerada a partir de **AFINIDADE** (cor dominante) e **RESSONÂNCIA** (intensidade/saturação).

### Cores base por AFINIDADE:
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

### Modificador de RESSONÂNCIA:
```
RESSONÂNCIA 1–30   → paleta dessaturada, quase monocromática
RESSONÂNCIA 31–60  → paleta padrão
RESSONÂNCIA 61–100 → paleta vibrante, alto contraste, brilho em camadas
```

### Afinidades Híbridas (geram paletas únicas):
- Fogo + Sombra = **Cinza Ardente** → preto profundo com brasas internas
- Água + Vento = **Tempestade** → azul turvo com relâmpagos brancos
- Luz + Vazio = **Eclipse** → dourado com núcleo negro absorvente
- Terra + Éter = **Fóssil Astral** → marrom terroso com veios luminescentes

---

## Camada 4 — Padrões e Marcações

Padrões que cobrem a silhueta — runas, escamas, veios, fissuras, tatuagens de alma.

Determinados por **ORIGEM** (tipo de padrão) e **VONTADE** (densidade/complexidade).

### Tipos de padrão por ORIGEM:
- **Abissal** → espirais que se afunilam para dentro, geometria hipnótica
- **Celestial** → constelações conectadas, linhas retas e angulares
- **Primordial** → padrões orgânicos, veios como raízes ou veias
- **Forjada** → marcas de solda, runas geométricas, linhas retas interrompidas
- **Errante** → padrões incompletos, fragmentados, como algo apagado

### Modificador de VONTADE:
```
VONTADE 1–30   → poucos padrões, simples, quase ausentes
VONTADE 31–60  → cobertura média, padrão legível
VONTADE 61–100 → cobertura densa, padrões em múltiplas camadas, detalhes micros
```

---

## Camada 5 — Detalhes e Ornamentos

Elementos adicionais: armaduras, asas, chifres, cristais, correntes, chamas, folhas, etc.

Determinados por **NÚCLEO** (categoria de ornamento) e genes de **MUTAÇÃO**.

### Ornamentos base por NÚCLEO:
- **Guardião** → escudos fragmentados ao redor do corpo, escamas, paredes de pedra
- **Destruidor** → lâminas emergindo da silhueta, garras, espinhos
- **Arauto** → véus, tecidos em movimento, tentáculos de energia
- **Trickster** → múltiplos olhos, espelhos em órbita, cópias fantasma
- **Invocador** → runas flutuantes, círculos mágicos, entidades menores orbitando

### Ornamentos de Mutação:
| Mutação | Ornamento adicionado |
|---|---|
| `INVERSO` | Uma fissura no centro do corpo revelando o interior oposto |
| `ESPELHO` | Uma sombra ligeiramente deslocada que age independente |
| `ANCESTRAL` | Marcas de um ancestral que brilham em frequências diferentes |
| `CAOS` | Fragmentos do corpo que flutuam separados e se reúnem |
| `TRANSCENDÊNCIA` | Halo estrutural ao redor de toda a silhueta |

---

## Camada 6 — Efeitos de Aura

Partículas, brilhos e animações ambientes que emanam da entidade.

Determinados por **AURA** (intensidade) e **AFINIDADE** (tipo de partícula).

```
AURA 1–20    → sem efeito visível
AURA 21–40   → leve halo estático na borda da silhueta
AURA 41–60   → partículas lentas emanando do corpo
AURA 61–80   → distorção ambiental ao redor (calor, ondas, névoa)
AURA 81–100  → efeito de campo completo: o ambiente reage ao personagem
```

---

## Geração de Nome

O nome também é proceduralmente gerado a partir dos genes:

```
Formato: [Prefixo de ORIGEM] + [Raiz de NÚCLEO] + [Sufixo de AFINIDADE]
```

### Exemplos:
- Abissal + Destruidor + Vazio = **"Neth'kara Vex"**
- Celestial + Arauto + Luz = **"Lyra Sol'aen"**
- Primordial + Guardião + Terra = **"Korum Durath"**
- Forjada + Invocador + Éter = **"Vel'sira Aethun"**

Mutações adicionam epítetos:
- `TRANSCENDÊNCIA` → "O Eterno", "A Sem-Fim"
- `CAOS` → "O Partido", "A Fraturada"
- `ANCESTRAL` → "Portador(a) de [nome do ancestral]"

---

## Identidade Visual Única: o Protocolo de Unicidade

Para garantir que dois jogadores nunca tenham o mesmo herói visual:

1. **Seed única por fusão**: cada fusão gera uma seed baseada em timestamp + IDs dos pais
2. **Micro-variações de cor**: ±3% de variação em matiz para cada gene de atributo
3. **Posicionamento de ornamentos**: coordenadas geradas pela seed, não fixas
4. **Velocidade de animação**: variação sutil nas partículas de aura

> Um herói com genes idênticos a outro ainda terá diferenças visíveis ao olho — como gêmeos, não como cópias.

---

## Notas de Design

- Priorizar **legibilidade** sobre complexidade: o visual deve comunicar o papel do herói em 3 segundos
- A tela de fusão deve **pré-visualizar** o resultado com animação de "revelação"
- Heróis raros devem ter visuais que se destaquem imediatamente na galeria
- Considerar acessibilidade: não depender só de cor para comunicar informação

---
*Próxima revisão: definir pipeline técnico de composição de camadas + especificações de animação*
