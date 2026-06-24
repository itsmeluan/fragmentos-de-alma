# Conteúdo de Lore e Textos — Fragmentos de Alma

## Diálogos de Onboarding — Kael

1. "Eu não sei por que as almas respondem à minha mão. Sei apenas que, quando eu hesitei, elas gritaram mais alto."
2. "Se este fragmento aceitar a fusão, algo novo nasce. Não uma cópia. Não uma cura. Uma terceira vontade."
3. "As facções vão chamar isso de mil nomes: milagre, crime, heresia, arma. Ouça todas. Obedeça a nenhuma."
4. "Cada herói carrega uma memória que não pediu para ter. Trate-os como aliados, não como ferramentas."
5. "Se Solum foi quebrado de propósito, talvez nossa missão não seja consertar o mundo. Talvez seja decidir o que ele deve se tornar."

## 20 Habilidades Procedurais — Nomes e Descrições

Estas entradas usam a anatomia real de `src/systems/skills/generator.ts`: gatilho, efeito, modificador opcional e condição. As sete últimas são habilidades emergentes implementadas explicitamente no gerador.

| # | Nome | Componentes | Descrição de jogo |
|---|---|---|---|
| 1 | Ardente Lâmina | T01 + E01 + M03 + C02 | Ao atacar, causa dano físico com chance crítica aumentada se o alvo estiver abaixo de metade do HP. |
| 2 | Incandescente Pulso | T06 + E02 + M01 + C06 | Ao usar uma habilidade ativa, libera dano elemental em área quando houver três ou mais inimigos em campo. |
| 3 | Profunda Graça | T09 + E03 + M08 + C01 | Ao curar, aplica uma cura adicional que persiste por alguns turnos. |
| 4 | Corrente Muralha | T02 + E04 + M07 + C03 | Ao receber dano, cria escudo que também protege aliados enquanto o aliado marcado estiver vivo. |
| 5 | Sólida Marca | T07 + E05 + M05 + C04 | No início do combate, aplica debuff que ignora defesa no primeiro alvo ameaçado. |
| 6 | Antiga Forja | T05 + E06 + M02 + C01 | Quando um aliado morre, concede buff proporcional ao atributo mais alto do herói. |
| 7 | Veloz Passo | T03 + E09 + M09 + C05 | A cada ciclo de turnos, reposiciona combatentes e ricocheteia o efeito se o herói usou habilidade no turno anterior. |
| 8 | Cortante Colheita | T04 + E08 + M04 + C02 | Ao matar um inimigo, drena recurso e aumenta a escala do efeito contra alvos feridos. |
| 9 | Silente Armadura | T08 + E04 + M08 + C07 | Ao atingir HP crítico, cria uma armadura persistente se houver mutação ativa no genoma. |
| 10 | Fratura Descarga | T10 + E02 + M06 + C09 | Pode disparar por turno durante evento global, causando dano elemental com efeito secundário. |
| 11 | Radiante Bênção | T07 + E06 + M07 + C10 | Passiva permanente: no início do combate, fortalece aliados próximos com uma bênção de Luz. |
| 12 | Sussurrada Corrente | T06 + E05 + M08 + C05 | Ao usar habilidade ativa, prende o inimigo em um debuff que persiste se houve habilidade no turno anterior. |
| 13 | Astral Chamado | T03 + E07 + M02 + C08 | A cada ciclo de turnos, invoca entidade menor com potência proporcional a linhagens de três ou mais gerações. |
| 14 | Ressonante Sifão | T01 + E08 + M05 + C02 | Ao atacar, drena recurso do inimigo e ignora defesa contra alvos enfraquecidos. |
| 15 | Chama Purificadora | Emergente: Fogo + Aura > 70 | Ao atacar, converte fogo em cura paradoxal para um aliado; descoberta rara de suporte ofensivo. |
| 16 | Roubo de Memória | Emergente: Trickster + Vontade > 80 | Ao usar habilidade ativa, imita o eco da última técnica inimiga como debuff mental. |
| 17 | Devorar Dor | Emergente: Abissal + Resistência > 75 | Ao receber dano, transforma parte da dor em recuperação temporária de HP. |
| 18 | Passo Eterno | Emergente: Éter + Força > 80 | No início do combate, desfere um ataque que age antes de o inimigo conseguir responder. |
| 19 | Caos Encarnado | Emergente: 3+ mutações | A cada turno pode manifestar uma habilidade elemental imprevisível, revelando o excesso de mutação. |
| 20 | Além das Leis | Emergente: TRANSCENDÊNCIA | Ao atingir HP crítico, ignora as regras de combate uma vez e revive aliado com HP parcial. |

## Lore por Território

### Axis — Arquitetos do Véu

Axis é o ponto onde Solum tenta fingir que ainda obedece a uma única regra. Suas ruas não seguem o chão: seguem teoremas, linhas de Prima e acordos feitos entre gravidade e vontade. Os Arquitetos do Véu tratam cada fissura de Realidade como erro corrigível, mas o mapa vivo mostra outra coisa: quanto mais Axis sela as possibilidades, mais pressão se acumula sob seus círculos perfeitos. Para Kael, entrar em Axis é ser observado por uma equação que talvez já tenha previsto sua culpa.

### Kethara — Pedra Viva

Kethara cresce devagar, mas nunca para. Montanhas de cristal lembram golpes antigos, muralhas se recompõem depois de rachadas e ferramentas herdadas retornam à forma que tinham na mão de seus primeiros donos. A Ordem da Pedra Viva chama isso de permanência; os artesãos das camadas baixas chamam de teimosia do mundo. Sob a beleza de âmbar e cinza, Kethara pergunta a Kael se algo criado pela fusão merece durar, mesmo tendo nascido da quebra de duas almas anteriores.

### Mnemos — Véu dos Ecos

Mnemos não guarda ruínas: guarda instantes. A névoa carrega vozes, as casas sussurram versões contraditórias de seus moradores e cada ponte parece lembrar passos que ainda não aconteceram. O Véu dos Ecos preserva memória como quem protege um templo, mas sua política prova que lembrar também pode ser uma arma. Para Kael, Mnemos é perigoso porque reconhece nele memórias que não pertencem apenas à sua vida.

### Verdania — Jardim Perpétuo

Verdania é vida em excesso, vida sem pedido, vida que invade a pedra, fecha feridas e cobre túmulos antes que o luto termine. O Jardim Perpétuo vê cura como sacramento e crescimento como lei, mas mesmo ali existe medo do que não sabe morrer. Quando a corrupção toca suas raízes, a floresta não apodrece: ela cresce errado. Kael encontra em Verdania a pergunta mais gentil e mais cruel de Solum: salvar uma alma é preservá-la, ou permitir que ela mude?

### Cinderfall — Chama Negra

Cinderfall arde sem pressa. Suas florestas carbonizadas não viram cinza por completo; permanecem em combustão lenta, como se a própria paisagem estivesse em um rito de purificação. A Chama Negra acredita que sobreviver ao fogo prova valor, e que corrupção pode ser uma forja em vez de uma doença. Para Kael, o território é tentador porque oferece uma resposta simples demais: se tudo dói, talvez a dor seja o caminho. O perigo é esquecer quem foi queimado para que algo novo surgisse.

### Limiar — Confraria do Limiar

Limiar é branco, silencioso e preciso. Nada apodrece ali; corpos, juramentos e cidades são preservados até parecerem argumentos contra o tempo. A Confraria do Limiar não teme a morte, mas teme profundamente a fusão, porque fundir almas cria uma terceira voz onde antes havia duas histórias inteiras. Kael caminha por Ossatura como alguém atravessando uma biblioteca feita de despedidas, sabendo que cada herói criado por ele talvez seja também um epitáfio.

### Vênula — Ordem Carmesim

Vênula pulsa. Seus rios rubros mudam de curso com a saúde coletiva, suas plantas sangram seiva carmesim e suas famílias governantes tratam linhagem como liturgia. A Ordem Carmesim entende conexão melhor que qualquer facção, mas confunde intimidade com posse quando o poder aperta. Para Kael, Vênula é o território mais pessoal: seu sangue de Fragmentador carrega sinais das sete frequências, e cada veia da cidade parece saber disso antes mesmo que ele fale.
