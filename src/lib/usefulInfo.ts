// Informações úteis / emergência — Espanha (Andaluzia: Málaga, Granada, Córdoba).
// Emergência geral europeia: 112 (atende em vários idiomas).

export interface EmergencyNumber {
  label: string;
  number: string;
  emoji: string;
}

export interface UsefulPlace {
  name: string;
  detail?: string;
  phone?: string;
  address?: string;
  mapQuery?: string;
  note?: string;
}

export interface UsefulGroup {
  title: string;
  emoji: string;
  places: UsefulPlace[];
}

export const emergencyNumbers: EmergencyNumber[] = [
  { label: 'Emergências (geral)', number: '112', emoji: '🆘' },
  { label: 'Polícia Nacional', number: '091', emoji: '🚓' },
  { label: 'Emergência médica', number: '061', emoji: '🚑' },
  { label: 'Bombeiros', number: '080', emoji: '🚒' }
];

export const emergencyNote =
  'Na Espanha, o número único de emergências é o 112 (atende em espanhol, inglês e outros idiomas). Água da torneira é potável. Com o seguro-viagem, clínicas privadas costumam atender estrangeiros mais rápido; guarde os dados da apólice no app (Bolso / Minhas reservas).';

export const usefulGroups: UsefulGroup[] = [
  {
    title: 'Saúde',
    emoji: '🏥',
    places: [
      {
        name: 'Hospital Regional Universitario de Málaga',
        detail: 'Público, urgências 24h',
        address: 'Av. de Carlos Haya, s/n, Málaga',
        mapQuery: 'Hospital Regional Universitario de Málaga'
      },
      {
        name: 'Quirónsalud / Vithas (Málaga)',
        detail: 'Clínicas privadas 24h — atendem estrangeiros com seguro',
        mapQuery: 'Hospital Quironsalud Málaga',
        note: 'Leve a apólice do seguro-viagem. Muitas cobrem atendimento direto; guarde o telefone de assistência.'
      },
      {
        name: 'Farmácia (Farmacia)',
        detail: 'Cruz verde. Há farmácias de plantão 24h (farmacia de guardia) em toda cidade.',
        mapQuery: 'farmacia de guardia Málaga',
        note: 'Muita coisa sem receita; para o calor: protetor, soro e reidratante oral.'
      }
    ]
  },
  {
    title: 'Polícia & turismo',
    emoji: '🚓',
    places: [
      {
        name: 'Policía Nacional — denúncia (boletim)',
        detail: 'Roubo/perda: peça a "denuncia" (necessária para o seguro)',
        note: 'Emergência: 112 ou 091. Dá para adiantar a denúncia por telefone/online e ir assinar depois.',
        mapQuery: 'Comisaría Policía Nacional Málaga centro'
      },
      {
        name: 'Oficina de Turismo de Málaga',
        detail: 'Mapas, informações e ajuda ao visitante',
        address: 'Plaza de la Marina, Málaga',
        mapQuery: 'Oficina de Turismo Plaza de la Marina Málaga'
      }
    ]
  },
  {
    title: 'Dinheiro & telefone',
    emoji: '💶',
    places: [
      { name: 'Moeda: Euro (€)', detail: 'Cartão é aceito em quase tudo (inclusive táxi e bares). Leve pouco dinheiro vivo.', note: 'Ao pagar no cartão, escolha cobrar em EUROS (recuse a "conversão para real" da maquininha — sai mais caro).' },
      { name: 'Caixa eletrônico (cajero)', detail: 'Prefira ATMs de bancos (CaixaBank, BBVA, Santander).', note: 'Evite os caixas "Euronet" (laranja) — taxas altas. Recuse sempre a conversão em reais.' },
      { name: 'Internet / eSIM', detail: 'Um eSIM (Holafly, Airalo) resolve os 10 dias; ou chip local (Orange/Vodafone).', note: 'Roaming da operadora brasileira costuma ser caro — confira antes.' }
    ]
  },
  {
    title: 'Apoio ao brasileiro',
    emoji: '🇧🇷',
    places: [
      {
        name: 'Consulado-Geral do Brasil em Madri',
        detail: 'Perda/roubo de passaporte e emergências consulares',
        address: 'C. de Fernando el Santo, 6, Madri',
        mapQuery: 'Consulado Geral do Brasil Madri',
        note: 'Não há consulado do Brasil em Málaga (o mais próximo é Madri). Plantão consular de emergência; anote o telefone antes de viajar.'
      }
    ]
  }
];

export const safetyTips = [
  '☀️ Julho é quente (30–35 °C) e o sol é forte: protetor, chapéu, água sempre. Passeios ao ar livre cedo ou no fim da tarde; museus e sesta no auge do calor.',
  '💧 A água da torneira é potável em toda a Andaluzia — leve uma garrafa reutilizável.',
  '👜 Cuidado com carteiristas em pontos lotados (Calle Larios, mercados, Alhambra, transporte). Nada de celular no bolso de trás.',
  '🕐 Horários espanhóis: almoço 14h–16h, jantar a partir das 21h. Muitos comércios fecham no início da tarde (sesta). Reserve os restaurantes premium com antecedência.',
  '🚗 No Caminito del Rey e em El Torcal, leve água, tênis e chapéu — há pouca sombra. Ingressos do Caminito e da Alhambra esgotam: compre online semanas antes.',
  '💶 Gorjeta (propina) não é obrigatória: arredondar ou ~5–10% num jantar especial já é simpático.'
];
