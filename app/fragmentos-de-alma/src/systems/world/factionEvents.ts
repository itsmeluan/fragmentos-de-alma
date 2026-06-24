// Sistema de eventos de facção — disparados ao completar andares em territórios
// Decisões afetam reputação com até 2 facções (doc 08, seção Decisões de Facção)
import type { TerritoryId } from './types'

export interface FactionChoice {
  label: string
  description: string
  repChanges: Partial<Record<TerritoryId, number>>
}

export interface FactionEventDef {
  id: string
  title: string
  description: string
  territory: TerritoryId
  choices: [FactionChoice, FactionChoice]
}

const FACTION_EVENTS: FactionEventDef[] = [
  // ─── Axis — Arquitetos do Véu ────────────────────────────────────────────────
  {
    id: 'axis_01',
    territory: 'axis',
    title: 'A Equação Proibida',
    description:
      'Os Arquitetos descobriram que fragmentos de Prima de Mnemos contradizem seus modelos. Querem apagar esses dados antes que se tornem públicos.',
    choices: [
      {
        label: 'Ajudar os Arquitetos',
        description: 'Os dados desaparecem. A equação permanece intacta.',
        repChanges: { axis: 20, mnemos: -15 },
      },
      {
        label: 'Proteger os registros',
        description: 'Você entrega cópias ao Véu dos Ecos. A verdade persiste.',
        repChanges: { mnemos: 20, axis: -15 },
      },
    ],
  },
  {
    id: 'axis_02',
    territory: 'axis',
    title: 'O Coeficiente do Equilíbrio',
    description:
      'Os Arquitetos propõem alterar sutilmente as leis da física local para favorecer suas alianças. Ninguém mais sabe que isso é possível.',
    choices: [
      {
        label: 'Permanecer em silêncio',
        description: 'A manipulação acontece. Kethara prospera sem saber por quê.',
        repChanges: { axis: 15, kethara: 10 },
      },
      {
        label: 'Revelar a manipulação',
        description: 'Verdânia e Limiar souberam. Os Arquitetos não esquecem traições.',
        repChanges: { verdania: 20, limiar: 10, axis: -20 },
      },
    ],
  },
  // ─── Kethara — Pedra Viva ────────────────────────────────────────────────────
  {
    id: 'kethara_01',
    territory: 'kethara',
    title: 'A Veia de Cristal',
    description:
      'Mestres Alquimistas da Pedra Viva querem minerar uma veia de cristal em área que o Jardim Perpétuo considera sagrada.',
    choices: [
      {
        label: 'Apoiar a mineração',
        description: 'Os cristais alimentam novos avanços. Verdânia lembra da traição.',
        repChanges: { kethara: 20, verdania: -10 },
      },
      {
        label: 'Defender o território sagrado',
        description: 'A veia permanece intocada. A Pedra Viva busca outra fonte.',
        repChanges: { verdania: 20, kethara: -15 },
      },
    ],
  },
  {
    id: 'kethara_02',
    territory: 'kethara',
    title: 'A Greve dos Artesãos',
    description:
      'Artesãos tradicionais de Keth pararam de trabalhar. Dizem que a alquimia está destruindo séculos de relação manual com a matéria.',
    choices: [
      {
        label: 'Apoiar os alquimistas',
        description: 'A produção retoma. Os artesãos se dispersam pelo continente.',
        repChanges: { kethara: 15 },
      },
      {
        label: 'Defender os artesãos',
        description: 'Um acordo é firmado. A Pedra Viva cede levemente.',
        repChanges: { kethara: -5, verdania: 15 },
      },
    ],
  },
  // ─── Mnemos — Véu dos Ecos ───────────────────────────────────────────────────
  {
    id: 'mnemos_01',
    territory: 'mnemos',
    title: 'O Arquivo Proibido',
    description:
      'Os Revisores do Véu pretendem alterar memórias históricas sobre a Fratura. A versão oficial será a única que sobreviverá.',
    choices: [
      {
        label: 'Ajudar a reescrever',
        description: 'O passado se torna maleável. A Confraria perde registros valiosos.',
        repChanges: { mnemos: 20, limiar: -15 },
      },
      {
        label: 'Proteger a memória verdadeira',
        description: 'Você entrega cópias à Confraria. O Véu descobre depois.',
        repChanges: { limiar: 20, mnemos: -15 },
      },
    ],
  },
  {
    id: 'mnemos_02',
    territory: 'mnemos',
    title: 'Memórias de Sangue',
    description:
      'Uma memória preservada no éter de Mnemos revela segredos que incriminam a Ordem Carmesim. O Véu quer usar isso como barganha.',
    choices: [
      {
        label: 'Entregar à Carmesim',
        description: 'Os segredos desaparecem. A Carmesim deve um favor.',
        repChanges: { venula: 15, mnemos: -10 },
      },
      {
        label: 'Manter oculto com o Véu',
        description: 'O Véu agradece. A Carmesim vai procurar o que sumiu.',
        repChanges: { mnemos: 20, venula: -10 },
      },
    ],
  },
  // ─── Verdania — Jardim Perpétuo ──────────────────────────────────────────────
  {
    id: 'verdania_01',
    territory: 'verdania',
    title: 'A Cura Negada',
    description:
      'Refugiados das regiões corruptas de Cinderfall chegam a Verdânia em busca de cura. O Jardim exige pagamento em Prima que eles não têm.',
    choices: [
      {
        label: 'Pagar pelos refugiados',
        description: 'Os feridos são curados. Você arca com o custo.',
        repChanges: { verdania: 20 },
      },
      {
        label: 'Denunciar publicamente',
        description: 'O Véu dos Ecos amplifica o escândalo. O Jardim se defende mal.',
        repChanges: { mnemos: 15, verdania: -15 },
      },
    ],
  },
  {
    id: 'verdania_02',
    territory: 'verdania',
    title: 'A Raiz Invasora',
    description:
      'A floresta de Verdânia está avançando sobre os campos de cristal de Kethara. Os Curadores dizem que a vida não pede permissão.',
    choices: [
      {
        label: 'Apoiar a expansão',
        description: 'A floresta cresce. Kethara começa a erguer muros.',
        repChanges: { verdania: 20, kethara: -10 },
      },
      {
        label: 'Alertar Kethara',
        description: 'A expansão é contida. O Jardim considera você uma ameaça.',
        repChanges: { kethara: 20, verdania: -10 },
      },
    ],
  },
  // ─── Cinderfall — Chama Negra ────────────────────────────────────────────────
  {
    id: 'cinderfall_01',
    territory: 'cinderfall',
    title: 'O Ritual de Purificação',
    description:
      'A Chama Negra quer usar fragmentos de almas corrompidas que você coletou para um ritual de "purificação pela destruição".',
    choices: [
      {
        label: 'Fornecer os fragmentos',
        description: 'O ritual acontece. Os Arquitetos registram o evento com alarme.',
        repChanges: { cinderfall: 20, axis: -15 },
      },
      {
        label: 'Recusar e denunciar',
        description: 'Os Arquitetos agradecem. A Chama Negra não perdoa.',
        repChanges: { axis: 15, cinderfall: -15 },
      },
    ],
  },
  {
    id: 'cinderfall_02',
    territory: 'cinderfall',
    title: 'Cinzas de Memória',
    description:
      'A Chama Negra propõe queimar os registros históricos que Mnemos mantém sobre suas práticas passadas. "O fogo purifica o que o tempo não consegue."',
    choices: [
      {
        label: 'Ajudar a queimar',
        description: 'As chamas consomem décadas de registros. A Chama agradece.',
        repChanges: { cinderfall: 20, mnemos: -15 },
      },
      {
        label: 'Proteger os registros',
        description: 'Você envia cópias ao Véu. A Chama saberá que foi você.',
        repChanges: { mnemos: 20, cinderfall: -15 },
      },
    ],
  },
  // ─── Limiar — Confraria do Limiar ────────────────────────────────────────────
  {
    id: 'limiar_01',
    territory: 'limiar',
    title: 'O Direito do Ressuscitado',
    description:
      'Um ser ressuscitado pela Confraria reivindica direitos civis em Ossatura. Os Emancipadores o apoiam. A liderança quer suprimi-lo.',
    choices: [
      {
        label: 'Apoiar a emancipação',
        description: 'O ressuscitado ganha voz. A Carmesim observa com interesse.',
        repChanges: { limiar: 15, venula: 10 },
      },
      {
        label: 'Apoiar o controle',
        description: 'A ordem é mantida. Os Emancipadores perdem esperança.',
        repChanges: { limiar: 20 },
      },
    ],
  },
  {
    id: 'limiar_02',
    territory: 'limiar',
    title: 'Os Campos de Ossatura',
    description:
      'A Confraria quer exumar corpos de uma área que o Jardim Perpétuo usa como viveiro. Para a Confraria, preservação é sagrada. Para o Jardim, é profanação.',
    choices: [
      {
        label: 'Apoiar a Confraria',
        description: 'Os mortos são preservados. O Jardim retalia com silêncio.',
        repChanges: { limiar: 20, verdania: -15 },
      },
      {
        label: 'Defender o Jardim Perpétuo',
        description: 'Os corpos permanecem no chão. A Confraria busca outro lugar.',
        repChanges: { verdania: 20, limiar: -15 },
      },
    ],
  },
  // ─── Vênula — Ordem Carmesim ─────────────────────────────────────────────────
  {
    id: 'venula_01',
    territory: 'venula',
    title: 'O Tributo de Sangue',
    description:
      'A Ordem Carmesim cobra tributo de Prima de Sangue de todos que atravessam Vênula. Recusar significa ser marcado como inimigo da Ordem.',
    choices: [
      {
        label: 'Pagar o tributo',
        description: 'A passagem é livre. A Ordem registra sua submissão.',
        repChanges: { venula: 20 },
      },
      {
        label: 'Resistir publicamente',
        description: 'A Chama Negra admira sua coragem. A Carmesim não esquece.',
        repChanges: { venula: -15, cinderfall: 15 },
      },
    ],
  },
  {
    id: 'venula_02',
    territory: 'venula',
    title: 'A Linhagem Oculta',
    description:
      'Você descobriu uma família com Prima de Sangue de pureza excepcional — a Carmesim os procura há décadas para incorporá-los à linhagem governante.',
    choices: [
      {
        label: 'Revelar à Ordem',
        description: 'A família é "convidada" a Veia. A Carmesim lhe deve um favor.',
        repChanges: { venula: 20 },
      },
      {
        label: 'Esconder a família',
        description: 'Os Arquitetos os protegem discretamente. A Carmesim suspeita.',
        repChanges: { axis: 20, venula: -10 },
      },
    ],
  },
]

/**
 * Retorna um evento de facção para o território e seed dados.
 * Mesmo territory+seed sempre retorna o mesmo evento (determinístico).
 * Retorna null se não houver eventos para o território.
 */
export function pickFactionEvent(
  territory: TerritoryId,
  seed: string
): FactionEventDef | null {
  const pool = FACTION_EVENTS.filter(e => e.territory === territory)
  if (pool.length === 0) return null
  let hash = 0
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return pool[hash % pool.length]
}

/** IDs dos territórios que têm eventos de facção */
export const TERRITORY_IDS_WITH_EVENTS: TerritoryId[] = [
  'axis', 'kethara', 'mnemos', 'verdania', 'cinderfall', 'limiar', 'venula',
]
