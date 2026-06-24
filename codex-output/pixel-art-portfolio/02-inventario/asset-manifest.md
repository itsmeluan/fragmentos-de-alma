# Asset Manifest Pixel Art — Fragmentos de Alma

Este manifesto lista os assets visuais que o app precisaria se a rota pixel art avançar. A classificação usa:

- **P0:** necessário para um protótipo jogável de validação.
- **P1:** necessário para MVP visual consistente.
- **P2:** expansão, polimento, eventos e live ops.

## 1. Identidade e Store

| ID | Asset | Uso | Tamanho fonte | Prioridade | Observação |
|---|---|---|---:|---|---|
| identity.app_icon | Ícone do app | iOS/Android | 1024x1024 | P0 | Cristal de alma + círculo alquímico |
| identity.splash | Splash vertical | abertura | 360x640 | P0 | Ritual de fusão, sem texto embutido |
| identity.adaptive_foreground | Foreground Android | Android adaptive icon | 432x432 | P1 | Versão recortável do cristal |
| identity.adaptive_background | Background Android | Android adaptive icon | 432x432 | P1 | Fundo escuro com linhas de Prima |
| identity.store_feature | Feature graphic | Play Store | 1024x500 | P2 | Apenas se a rota for aprovada |
| identity.store_screens | Screenshots mockados | lojas | 1080x1920 | P2 | Devem refletir gameplay real |

## 2. UI Global

| ID | Asset | Uso | Tamanho fonte | Prioridade | Observação |
|---|---|---|---:|---|---|
| ui.tab_map | Ícone aba Mapa | tab bar | 24x24 | P0 | Rosa dos ventos alquímica |
| ui.tab_collection | Ícone aba Almas | tab bar | 24x24 | P0 | Cristal/silhueta |
| ui.tab_fusion | Ícone aba Fundir | tab bar | 24x24 | P0 | Dois cristais convergindo |
| ui.tab_profile | Ícone aba Kael | tab bar | 24x24 | P0 | Marca do Fragmentador |
| ui.button_primary_frame | Frame botão primário | CTAs | 160x48 | P0 | Ouro queimado, cantos cortados |
| ui.button_secondary_frame | Frame botão secundário | CTAs | 160x48 | P0 | Linha fina dourada |
| ui.modal_frame | Frame modal | bottom sheets | 320x420 | P0 | Brackets e borda superior |
| ui.panel_frame | Frame painel lateral | território | 280x640 | P0 | Borda colorida por território |
| ui.corner_brackets | Brackets de canto | cards/modais | 16x16 | P0 | Pode virar 9-slice |
| ui.divider_alchemy | Divisor ornamental | títulos | 160x8 | P1 | Linha + selo central |
| ui.empty_state_sigil | Sigilo vazio | estados vazios | 96x96 | P1 | Coleção sem heróis, histórico vazio |
| ui.loading_prima | Loader de Prima | loading | 64x64, 12 frames | P1 | Cristal girando sem parecer spinner padrão |
| ui.error_corruption | Ícone erro | feedback | 48x48 | P1 | Fissura/corrupção |
| ui.success_restoration | Ícone sucesso | feedback | 48x48 | P1 | Ouro espalhando |

## 3. Recursos, Loot e Economia

| ID | Asset | Uso | Tamanho fonte | Prioridade | Observação |
|---|---|---|---:|---|---|
| resource.soul_fragments | Fragmentos de Alma | moeda | 32x32 | P0 | Cristal partido azul-pergaminho |
| resource.essence_crystals | Cristais de Essência | moeda | 32x32 | P0 | Cristal limpo com núcleo dourado |
| resource.echoes | Ecos | moeda | 32x32 | P0 | Memória cristalizada antiga |
| item.gene_fragment | Fragmento de gene | loot chefe | 48x48 | P1 | Varia por origem/afinidade |
| item.skill_fragment | Fragmento de habilidade | loot evento | 48x48 | P1 | Pedaço de círculo rúnico |
| item.cosmetic_aura | Aura cosmética | inventário | 48x48 | P2 | Não afeta poder |
| item.fusion_theme | Tema de fusão | inventário | 48x48 | P2 | Mini círculo alquímico |
| item.hero_border | Borda de herói | cosmético | 96x128 | P2 | Frames por raridade/evento |
| item.account_title | Título de conta | perfil | UI-text driven | P2 | Não gerar texto como imagem |

## 4. Afinidades, Mutações e Raridade

| ID | Asset | Uso | Tamanho fonte | Prioridade | Observação |
|---|---|---|---:|---|---|
| affinity.fire | Fogo | ícone gene | 24x24 | P0 | Brasa angular |
| affinity.water | Água | ícone gene | 24x24 | P0 | Gota/cristal líquido |
| affinity.earth | Terra | ícone gene | 24x24 | P0 | Pedra viva |
| affinity.wind | Vento | ícone gene | 24x24 | P0 | Vórtice cortante |
| affinity.void | Vazio | ícone gene | 24x24 | P0 | Cristal negativo |
| affinity.light | Luz | ícone gene | 24x24 | P0 | Halo pergaminho |
| affinity.shadow | Sombra | ícone gene | 24x24 | P0 | Máscara/fenda |
| affinity.aether | Éter | ícone gene | 24x24 | P0 | Estrela cobalto |
| mutation.inverse | Inverso | ícone mutação | 24x24 | P1 | Fissura oposta |
| mutation.mirror | Espelho | ícone mutação | 24x24 | P1 | Reflexo deslocado |
| mutation.ancestral | Ancestral | ícone mutação | 24x24 | P1 | Marca antiga |
| mutation.chaos | Caos | ícone mutação | 24x24 | P1 | Fragmentos soltos |
| mutation.transcendence | Transcendência | ícone mutação | 24x24 | P1 | Halo estrutural |
| rarity.common | Frame comum | cards | 96x128 | P0 | Cinza, simples |
| rarity.uncommon | Frame incomum | cards | 96x128 | P0 | Verde escuro |
| rarity.rare | Frame raro | cards | 96x128 | P0 | Azul profundo |
| rarity.epic | Frame épico | cards | 96x128 | P0 | Roxo controlado |
| rarity.legendary | Frame lendário | cards | 96x128 | P0 | Laranja queimado |
| rarity.unique | Frame único | cards | 96x128 | P1 | Vermelho escuro intenso |

## 5. Heróis Procedurais

O sistema visual atual usa 6 camadas procedurais. Em pixel art, cada camada vira biblioteca combinável.

| Família | Quantidade mínima | Prioridade | Observação |
|---|---:|---|---|
| Backgrounds por origem | 5 | P0 | Abissal, Celestial, Primordial, Forjada, Errante |
| Silhuetas por núcleo | 5 | P0 | Guardião, Destruidor, Arauto, Trickster, Invocador |
| Pesos de silhueta | 3 por núcleo | P1 | leve, padrão, denso |
| Paletas por afinidade | 8 rampas | P0 | + 4 híbridas do doc 02 |
| Padrões por origem | 5 famílias | P1 | espirais, constelações, veios, solda, apagado |
| Densidade de padrão | 3 níveis | P1 | sparse, medium, dense |
| Ornamentos por núcleo | 5 famílias | P1 | escudos, lâminas, véus, olhos, runas |
| Ornamentos por mutação | 5 | P1 | Inverso, Espelho, Ancestral, Caos, Transcendência |
| Auras por afinidade | 8 | P1 | partículas, halo, distorção, campo |
| Idle de herói | 5 bases | P1 | 4-6 frames |
| Ataque comum | 5 bases | P1 | 4-6 frames |
| Hit/defeat | 2 estados | P1 | comum a todos |

## 6. Kael e Narrativa

| ID | Asset | Uso | Tamanho fonte | Prioridade | Observação |
|---|---|---|---:|---|---|
| kael.avatar | Avatar de Kael | HUD/mapa | 48x48 | P0 | Leitura forte no canto |
| kael.portrait_neutral | Retrato neutro | diálogos | 96x96 | P1 | Cansado, determinado |
| kael.portrait_hurt | Retrato ferido | prólogo/batalha | 96x96 | P1 | Sem gore |
| kael.portrait_resonant | Retrato ressonante | memórias | 96x96 | P1 | Runas ativadas |
| kael.memory_cards | Cartas de Memória Ressurgente | progressão | 160x220 | P2 | 10 cards, texto pelo app |
| codex.entry_frame | Frame do Codex | lore | 320x520 | P1 | Pergaminho escuro, não claro |
| codex.fragment_icon | Ícone de fragmento de lore | codex | 32x32 | P1 | Memória partida |

## 7. Fragmentos Antigos e Chefes

| ID | Território | Frequência | Asset | Prioridade | Observação |
|---|---|---|---|---|---|
| boss.axis_axiom_null | Axis | Realidade | Retrato + sprite + telegraph | P1 | Núcleo âmbar visível |
| boss.keth_memory | Kethara | Matéria | Retrato + sprite + telegraph | P1 | Cristal/rocha viva |
| boss.unremembered_choir | Mnemos | Mente | Retrato + sprite + telegraph | P1 | Véus e máscaras |
| boss.cinder_saint | Cinderfall | Alma | Retrato + sprite + telegraph | P1 | Brasa interna |
| boss.root_that_refuses | Verdânia | Vida | Retrato + sprite + telegraph | P1 | Semente-coração |
| boss.ossuary_gatekeeper | Limiar | Morte | Retrato + sprite + telegraph | P1 | Osso cristalino |
| boss.crimson_vessel | Vênula | Sangue | Retrato + sprite + telegraph | P1 | Veia dourada selada |
| boss.phase_overlay | Overlay de fase | batalha | P1 | Fase 2/3 intensifica corrupção |
| boss.weakness_badge | Badge de fraqueza | entrada batalha | P0 | Sempre visível |
| boss.event_frame | Frame chefe evento | live ops | P2 | Reuso semanal |

## 8. Territórios, Mapa e Dungeons

| ID | Asset | Uso | Tamanho fonte | Prioridade | Observação |
|---|---|---|---:|---|---|
| map.solum_base | Mapa alquímico de Solum | hub | 390x640 | P0 | Pode ficar em Skia + pixel overlays |
| map.prima_flow | Linhas de Prima | hub | vetorial/pixel | P0 | Animável |
| map.compass | Rosa dos ventos alquímica | hub | 80x80 | P1 | 8 pontas |
| map.territory_shape.axis | Forma Axis | mapa | 120x120 | P0 | Realidade |
| map.territory_shape.kethara | Forma Kethara | mapa | 160x180 | P0 | Matéria |
| map.territory_shape.mnemos | Forma Mnemos | mapa | 160x180 | P0 | Mente |
| map.territory_shape.verdania | Forma Verdânia | mapa | 180x180 | P0 | Vida |
| map.territory_shape.cinderfall | Forma Cinderfall | mapa | 150x180 | P0 | Alma |
| map.territory_shape.limiar | Forma Limiar | mapa | 150x180 | P0 | Morte |
| map.territory_shape.venula | Forma Vênula | mapa | 240x100 | P0 | Sangue |
| map.corruption_overlays | Estados de corrupção | mapa | 7 x 5 estados | P1 | saudável até colapso |
| dungeon.kethara_splash | Splash Kethara | entrada dungeon | 180x320 | P0 | Cristal vivo |
| dungeon.mnemos_splash | Splash Mnemos | entrada dungeon | 180x320 | P0 | Névoa de memória |
| dungeon.cinderfall_splash | Splash Cinderfall | entrada dungeon | 180x320 | P0 | Forja/brasas |
| dungeon.verdania_splash | Splash Verdânia | entrada dungeon | 180x320 | P0 | Árvore Raiz |
| dungeon.limiar_splash | Splash Limiar | entrada dungeon | 180x320 | P0 | Deserto ósseo |
| dungeon.axis_splash | Splash Axis | entrada dungeon | 180x320 | P0 | Geometria impossível |
| dungeon.venula_splash | Splash Vênula | entrada dungeon | 180x320 | P0 | Canais rubi |
| dungeon.tilesets_surface | Tiles Superfície | dungeon | 16x16 | P2 | 7 tilesets |
| dungeon.tilesets_depths | Tiles Profundezas | dungeon | 16x16 | P2 | 7 tilesets |
| dungeon.core_gate | Porta Núcleo | dungeon chefe | 96x128 | P1 | Varia por território |

## 9. Batalha

| ID | Asset | Uso | Tamanho fonte | Prioridade | Observação |
|---|---|---|---:|---|---|
| battle.action_attack | Ataque | roda de ações | 32x32 | P0 | Lâmina angular |
| battle.action_defend | Defender | roda de ações | 32x32 | P0 | Escudo fragmentado |
| battle.action_swap | Trocar | roda de ações | 32x32 | P0 | Setas/almas |
| battle.action_skill | Habilidade | roda de ações | 32x32 | P0 | Selo ativo |
| battle.action_ultimate | Ultimate | roda de ações | 32x32 | P0 | Cristal carregado |
| battle.action_retreat | Retornar/fugir | roda de ações | 32x32 | P1 | Portal |
| battle.hp_bar | Barra HP | batalha | 120x8 | P0 | Pixel 9-slice |
| battle.ultimate_bar | Barra ultimate | batalha | 120x6 | P0 | Cor por afinidade |
| battle.turn_marker | Marcador de turno | batalha | 48x48 | P1 | Dourado sutil |
| battle.target_marker | Alvo selecionado | batalha | 64x64 | P1 | Sem poluir tela |
| battle.telegraph | Boss telegraph | batalha | 8 frames | P1 | Sempre legível |
| battle.damage_numbers | Estilo dano | batalha | fonte/app | P1 | Texto pelo app, não sprite |
| battle.status_icons | Status effects | batalha | 24x24 | P1 | Queimando, bloqueado, vulnerável, corrompido, regenerando |

## 10. VFX

| ID | Asset | Uso | Frames | Prioridade | Observação |
|---|---|---|---:|---|---|
| vfx.fusion_burst | Pulso de fusão | fusão | 16 | P0 | Círculo + cristal |
| vfx.reveal | Revelação de herói | fusão | 24 | P0 | Cristalização |
| vfx.slash | Ataque físico | batalha | 6 | P1 | Angular, seco |
| vfx.guard | Defesa | batalha | 6 | P1 | Escudo fragmentado |
| vfx.heal | Cura | batalha | 8 | P1 | Raiz/luz verde-ouro |
| vfx.corruption | Corrupção | batalha/mapa | 8 | P1 | Fumaça escura |
| vfx.death_fragment | Fragmentação | derrota | 12 | P1 | Alma quebrando |
| vfx.prima_particle | Partículas de Prima | global | 4 | P0 | Pequenas, reutilizáveis |
| vfx.map_restore | Restauração território | mapa | 16 | P2 | Ouro se espalhando |
| vfx.reward_pop | Recompensa | loot | 8 | P1 | Satisfatório e curto |

## 11. Inimigos Procedurais

| Família | Quantidade mínima | Prioridade | Observação |
|---|---:|---|---|
| Inimigo Guardião | 3 variações | P1 | comum, elite, corrompido |
| Inimigo Destruidor | 3 variações | P1 | comum, elite, corrompido |
| Inimigo Arauto | 3 variações | P1 | comum, elite, corrompido |
| Inimigo Trickster | 3 variações | P1 | comum, elite, corrompido |
| Inimigo Invocador | 3 variações | P1 | comum, elite, corrompido |
| Corruptions por bioma | 7 overlays | P1 | distorcem o mesmo sprite base |
| Mini-chefe | 7 bases | P2 | um por território |

## 12. Facções e Lore

| ID | Asset | Uso | Tamanho fonte | Prioridade | Observação |
|---|---|---|---:|---|---|
| faction.pedra_viva | Emblema Pedra Viva | território/facção | 48x48 | P0 | Matéria |
| faction.veu_dos_ecos | Emblema Véu dos Ecos | território/facção | 48x48 | P0 | Mente |
| faction.chama_negra | Emblema Chama Negra | território/facção | 48x48 | P0 | Alma |
| faction.jardim_perpetuo | Emblema Jardim Perpétuo | território/facção | 48x48 | P0 | Vida |
| faction.confraria_limiar | Emblema Limiar | território/facção | 48x48 | P0 | Morte |
| faction.arquitetos_veu | Emblema Arquitetos | território/facção | 48x48 | P0 | Realidade |
| faction.ordem_carmesim | Emblema Carmesim | território/facção | 48x48 | P0 | Sangue |
| faction.reputation_badges | Badges reputação | perfil/facção | 32x32 | P1 | hostil, neutro, aliado |
| lore.memory_shards | Fragmentos de memória | Codex | 32x32 | P1 | 10 níveis de Kael |

## Estimativa de Produção

Para um protótipo pixel art convincente:

- P0 mínimo: cerca de **75 assets** entre ícones, frames, splashes e bases.
- P1 MVP visual: cerca de **180-230 assets**, contando animações e variações.
- P2 completo/live ops: pode passar de **350 assets**, principalmente por chefes, eventos, cosméticos, tilesets e VFX.

Recomendação: não produzir tudo individualmente antes de aprovar a direção. Validar primeiro com:

1. Um fluxo de mapa.
2. Um fluxo de fusão.
3. Uma batalha curta.
4. Uma entrada de dungeon.
5. Uma tela de coleção.
