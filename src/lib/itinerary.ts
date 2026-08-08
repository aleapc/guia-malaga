// Roteiro premium de 10 dias — Málaga & sul da Espanha, 1 a 10 de julho de 2027.
// Sugestão de ritmo (não impõe hotéis: a hospedagem é uma categoria e o Robert escolhe).
// `zone` liga ao filtro de zona; `cats` abrem as categorias temáticas já filtradas.

export interface DayBlock {
  when: string;
  text: string;
}
export interface ItineraryDay {
  n: number;
  date: string; // ISO
  zone: string; // id de zona (categoria-destino)
  zoneLabel: string;
  emoji: string;
  title: string;
  blocks: DayBlock[];
  tip?: string;
  cats?: string[]; // categorias temáticas a destacar no dia
}

export const itinerary: ItineraryDay[] = [
  {
    n: 1,
    date: '2027-07-01',
    zone: 'malaga',
    zoneLabel: 'Málaga',
    emoji: '🛬',
    title: 'Chegada & primeiro entardecer',
    blocks: [
      { when: 'Tarde', text: 'Check-in e um respiro. Volta pelo centro histórico: Calle Larios, Plaza de la Merced e a Catedral por fora.' },
      { when: 'Fim de tarde', text: 'Pôr do sol num rooftop (Alcazaba/porto ao fundo) e primeira taça de vinho de Málaga.' },
      { when: 'Noite', text: 'Jantar tranquilo no Muelle Uno, à beira-mar, pra pegar o fuso com calma.' }
    ],
    tip: 'Chegou de dia? Vá direto sentir o ritmo: em julho a cidade só ferve depois das 21h.',
    cats: ['malaga', 'tapas']
  },
  {
    n: 2,
    date: '2027-07-02',
    zone: 'malaga',
    zoneLabel: 'Málaga',
    emoji: '🏛️',
    title: 'Málaga capital, de Picasso ao mar',
    blocks: [
      { when: 'Manhã (cedo)', text: 'Alcazaba + Teatro Romano e subida a Gibralfaro antes do calor apertar. Depois a Catedral, a “Manquita”.' },
      { when: 'Almoço', text: 'Clássico andaluz no El Pimpi, com vista da Alcazaba.' },
      { when: 'Tarde', text: 'Hora do sol forte no ar-condicionado: Museu Picasso e/ou Carmen Thyssen. Depois, praia na Malagueta ou nos Baños del Carmen.' },
      { when: 'Noite', text: 'Alta gastronomia: José Carlos García (⭐) no porto.' }
    ],
    tip: 'Reserve o José Carlos García com semanas de antecedência — julho lota.',
    cats: ['cultura', 'praias', 'gastronomia']
  },
  {
    n: 3,
    date: '2027-07-03',
    zone: 'antequera',
    zoneLabel: 'Antequera & El Torcal',
    emoji: '🥾',
    title: 'Caminito del Rey & o coração da Andaluzia',
    blocks: [
      { when: 'Manhã', text: 'Caminito del Rey pendurado no desfiladeiro de El Chorro (ingresso com hora marcada, comprado semanas antes).' },
      { when: 'Almoço', text: 'À beira do reservatório ou na vila de Antequera.' },
      { when: 'Tarde', text: 'Antequera: Alcazaba, Colegiata e os Dólmens (UNESCO). Se sobrar fôlego, o mar de rochas de El Torcal ao entardecer.' }
    ],
    tip: 'Motorista privativo neste dia poupa calor e estacionamento — e você curte a paisagem.',
    cats: ['natureza', 'antequera']
  },
  {
    n: 4,
    date: '2027-07-04',
    zone: 'ronda',
    zoneLabel: 'Ronda',
    emoji: '⛰️',
    title: 'Ronda, a cidade sobre o abismo',
    blocks: [
      { when: 'Manhã', text: 'Estrada cênica até Ronda. Puente Nuevo sobre o Tajo, a Plaza de Toros mais antiga da Espanha e os Baños Árabes.' },
      { when: 'Tarde', text: 'Jardines de Cuenca, um vinho da Serranía de Ronda e o mirante do Tajo.' },
      { when: 'Noite', text: 'Jantar no Bardal (⭐⭐) — vale planejar o dia em torno dele. Dormir em Ronda é uma delícia.' }
    ],
    tip: 'Se puder, durma uma noite em Ronda: o vilarejo vazio ao anoitecer é outra viagem.',
    cats: ['ronda', 'gastronomia']
  },
  {
    n: 5,
    date: '2027-07-05',
    zone: 'marbella',
    zoneLabel: 'Marbella & Costa del Sol',
    emoji: '🍸',
    title: 'Pueblos brancos & glamour da costa',
    blocks: [
      { when: 'Manhã', text: 'Descida pelos pueblos blancos a caminho da costa oeste.' },
      { when: 'Tarde', text: 'Beach club em Marbella/Puerto Banús — espreguiçadeira reservada, mergulho e almoço com pé na areia.' },
      { when: 'Noite', text: 'Casco Antiguo de Marbella (Plaza de los Naranjos) ou jantar-assinatura (Skina ⭐⭐, Nobu, Leña).' }
    ],
    tip: 'Reserve a hamaca/rede do beach club — no verão as boas esgotam cedo.',
    cats: ['praias', 'marbella']
  },
  {
    n: 6,
    date: '2027-07-06',
    zone: 'axarquia',
    zoneLabel: 'Nerja & Axarquía',
    emoji: '🌅',
    title: 'Nerja, Frigiliana & as calas do leste',
    blocks: [
      { when: 'Manhã', text: 'Balcón de Europa em Nerja e as monumentais Cuevas de Nerja.' },
      { when: 'Meio-dia', text: 'Frigiliana, a vila branca mais bonita da região — ruelas mouriscas e mirantes.' },
      { when: 'Tarde', text: 'Praia de Burriana ou a cala de Maro, com almoço de espeto no chiringuito.' }
    ],
    tip: 'A luz da Axarquía ao fim da tarde é a melhor foto da viagem — deixe a câmera à mão.',
    cats: ['axarquia', 'praias']
  },
  {
    n: 7,
    date: '2027-07-07',
    zone: 'granada',
    zoneLabel: 'Granada',
    emoji: '🏯',
    title: 'Málaga leve & subida a Granada',
    blocks: [
      { when: 'Manhã', text: 'Última manhã malaguenha sem pressa: arte urbana no Soho, Mercado de Atarazanas e, se der, o Jardín de La Concepción.' },
      { when: 'Tarde', text: 'Viagem a Granada (AVE ou carro).' },
      { when: 'Fim de tarde', text: 'Albaicín e o Mirador de San Nicolás no pôr do sol, com a Alhambra dourada à frente.' },
      { when: 'Noite', text: 'Jantar com vista para a Alhambra.' }
    ],
    tip: 'Dormir em Granada é o que faz a Alhambra render — a manhã seguinte é sagrada.',
    cats: ['compras', 'granada']
  },
  {
    n: 8,
    date: '2027-07-08',
    zone: 'granada',
    zoneLabel: 'Granada',
    emoji: '🕌',
    title: 'Alhambra sem pressa',
    blocks: [
      { when: 'Manhã', text: 'Alhambra e Generalife com guia privado — Palácios Nazaríes no horário marcado (impreterível).' },
      { when: 'Tarde', text: 'Catedral e Capilla Real (túmulo dos Reis Católicos); tapas grátis pelo centro.' },
      { when: 'Noite', text: 'Sacromonte: um tablao de flamenco nas cuevas.' }
    ],
    tip: 'Ingresso da Alhambra com data/hora esgota meses antes. Compre assim que fechar as datas.',
    cats: ['granada', 'cultura']
  },
  {
    n: 9,
    date: '2027-07-09',
    zone: 'cordoba',
    zoneLabel: 'Córdoba',
    emoji: '🕌',
    title: 'Córdoba & volta a Málaga',
    blocks: [
      { when: 'Manhã', text: 'Bate-volta a Córdoba (AVE ~1h): a deslumbrante Mesquita-Catedral logo cedo, antes do calor e das filas.' },
      { when: 'Meio-dia', text: 'Judería, a Calleja de las Flores e os pátios floridos.' },
      { when: 'Fim de tarde', text: 'Volta a Málaga. Hammam/spa pra descansar as pernas.' },
      { when: 'Noite', text: 'Jantar de despedida de tapa em tapa, com o vinho doce de Málaga.' }
    ],
    tip: 'Sem pique pra Córdoba? Troque por uma tarde de praia e compras em Málaga — o app tem as duas.',
    cats: ['cordoba', 'tapas']
  },
  {
    n: 10,
    date: '2027-07-10',
    zone: 'malaga',
    zoneLabel: 'Málaga',
    emoji: '🛫',
    title: 'Última manhã & saída',
    blocks: [
      { when: 'Manhã', text: 'Café com churros, um último mergulho ou as compras de última hora na Calle Larios.' },
      { when: 'Saída', text: 'Transfer ao aeroporto de Málaga (AGP) — o trem C1 leva ~12 min do centro.' }
    ],
    tip: 'Voo à tarde? Guarde a mala no hotel e roube mais uma manhã de Mediterrâneo.',
    cats: ['cafe', 'compras']
  }
];
