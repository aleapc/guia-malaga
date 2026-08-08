// Conteúdo do Guia Málaga (type-safe, 100% offline). Viagem premium ao sul da Espanha,
// base em Málaga (1–10 de julho de 2027). Zonas: Málaga capital, Nerja/Axarquía, Antequera,
// Ronda, Marbella/Costa del Sol, Granada e Córdoba (bate-volta).
// Os locais vêm da pesquisa (src/lib/contentExtra.ts, gerado por scripts/build-extra.mjs a
// partir de scripts/data/*.json). Para adicionar um local, edite os JSON e rode o build-extra.
import { extraAttractions, linksByName } from './contentExtra';

export type WeatherFit = 'CLEAR_SKY' | 'RAIN_OK' | 'INDOOR' | 'ANY';

export interface OpeningHours {
  openDays?: number[]; // ISO weekday Mon=1..Sun=7; empty/undefined = todos os dias
  openHour?: number;
  closeHour?: number;
  note?: string;
}

export interface LinkRef {
  label: string;
  url: string;
}

export interface Attraction {
  id: string;
  categoryId: string;
  name: string;
  tagline: string;
  description: string;
  whatToDo?: string[];
  whatToBring?: string[];
  whatToWear?: string[];
  kingTip?: string;
  whereToEat?: string;
  /** Faixa de preço estimada (ex.: "€€€", "~€180/noite (est.)"). SEMPRE tratada como estimativa. */
  priceLevel?: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  driveMinutes?: number;
  durationLabel: string;
  fit: WeatherFit;
  windSensitive?: boolean;
  hours?: OpeningHours;
  mapQuery?: string;
  image?: string;
  /** Zona/base da viagem (malaga | axarquia | antequera | ronda | marbella | granada | cordoba). */
  city?: string;
  /** História/contexto opcional numa seção expansível. */
  history?: string;
  links?: LinkRef[];
}

export interface Category {
  id: string;
  title: string;
  emoji: string;
  summary: string;
  gradient: [string, string];
  image?: string;
}

// Viagem com base fixa em MÁLAGA e incursões pela Andaluzia. O clima do app é centrado em
// Málaga (Costa del Sol): julho é quente e seco, sol quase garantido — a decisão diária é
// mais sobre calor/praia à tarde e passeios cedo/à noite do que sobre chuva.
export const trip = {
  homeName: 'Málaga',
  homeLat: 36.7213,
  homeLng: -4.4214, // Centro de Málaga (Catedral)
  weatherLat: 36.7213,
  weatherLng: -4.4214,
  timezone: 'Europe/Madrid',
  startDate: '2027-07-01', // chegada
  endDate: '2027-07-10' // saída
};

export const categories: Category[] = [
  // ——— Zonas / destinos (também servem de base para os filtros das categorias temáticas) ———
  { id: 'malaga', title: 'Málaga capital', emoji: '🏛️', summary: 'A cidade natal de Picasso à beira do Mediterrâneo: Alcazaba, Gibralfaro, a catedral "Manquita", o porto e o boêmio Soho. É a base da viagem.', gradient: ['#B5651D', '#E0A458'], image: 'malaga.jpg' },
  { id: 'axarquia', title: 'Nerja & Axarquía', emoji: '🌅', summary: 'A costa a leste: Nerja e o Balcón de Europa, a vila branca de Frigiliana, as grutas e as praias de Maro. Luz de cartão-postal.', gradient: ['#1B6E8E', '#5FB0C0'], image: 'axarquia.jpg' },
  { id: 'antequera', title: 'Antequera & El Torcal', emoji: '🪨', summary: 'O coração geográfico da Andaluzia: dólmens milenares, o mar de rochas de El Torcal e o vertiginoso Caminito del Rey em El Chorro.', gradient: ['#7A5C3B', '#C0A06A'], image: 'antequera.jpg' },
  { id: 'ronda', title: 'Ronda & Serranía', emoji: '⛰️', summary: 'A cidade rasgada por um abismo: o Puente Nuevo sobre o Tajo, a praça de touros mais antiga e o vinho da Serranía. Dá vontade de dormir lá.', gradient: ['#6B3A2B', '#B57A5A'], image: 'ronda.jpg' },
  { id: 'marbella', title: 'Marbella & Costa del Sol', emoji: '🏖️', summary: 'O oeste glamouroso: casco antiguo florido, a Milla de Oro, Puerto Banús e os beach clubs. Onde a Costa del Sol veste gala.', gradient: ['#1E6E5A', '#6FB89A'], image: 'marbella.jpg' },
  { id: 'granada', title: 'Granada & Alhambra', emoji: '🏯', summary: 'A joia nazari: a Alhambra e o Generalife, o Albaicín, o pôr do sol do Mirador San Nicolás e as cuevas do Sacromonte. Vale dormir.', gradient: ['#8A2E4E', '#C77A9A'], image: 'granada.jpg' },
  { id: 'cordoba', title: 'Córdoba', emoji: '🕌', summary: 'A grande alternativa de bate-volta: a Mesquita-Catedral, a Judería e os pátios floridos. Chega-se de AVE em ~1h de Málaga.', gradient: ['#6A4C93', '#A084C7'], image: 'cordoba.jpg' },

  // ——— Categorias temáticas (cruzam as zonas; filtráveis por chip de zona) ———
  { id: 'gastronomia', title: 'Restaurantes & Michelin', emoji: '🍽️', summary: 'Da estrela de José Carlos García aos dois sóis de Bardal, passando por tabernas históricas e chiringuitos de espeto. Reserve os premiados cedo.', gradient: ['#9A2617', '#D96C4A'], image: 'gastronomia.jpg' },
  { id: 'praias', title: 'Praias & chiringuitos', emoji: '🏝️', summary: 'La Malagueta na cidade, os espetos de Pedregalejo, as calas de Maro e os beach clubs de Marbella. O Mediterrâneo em julho.', gradient: ['#0E7CA0', '#5FC5D6'], image: 'praias.jpg' },
  { id: 'tapas', title: 'Tapas, vinhos & bares', emoji: '🍷', summary: 'El Pimpi, o vinho doce de Málaga direto do tonel, o vermut e a coquetelaria. A vida acontece de tapa em tapa, ao entardecer.', gradient: ['#7A2A4A', '#B56A8A'], image: 'tapas.jpg' },
  { id: 'cultura', title: 'Museus & monumentos', emoji: '🎨', summary: 'Picasso onde ele nasceu, o Thyssen, o Pompidou, o Museo Ruso e a Alhambra. Ótimo para as horas de mais calor (tudo com ar).', gradient: ['#5B4C93', '#9A84C7'], image: 'cultura.jpg' },
  { id: 'natureza', title: 'Natureza & aventura', emoji: '🌿', summary: 'O Caminito del Rey pendurado no desfiladeiro, o mar de rochas de El Torcal, as grutas de Nerja e os jardins de La Concepción.', gradient: ['#2A7E4E', '#6FB88A'], image: 'natureza.jpg' },
  { id: 'cafe', title: 'Cafés & doces', emoji: '☕', summary: 'Churros com chocolate na Casa Aranda, o café de especialidade do Soho e o gelato para o calor. A pausa doce entre passeios.', gradient: ['#6B4A2B', '#B98E5E'], image: 'cafe.jpg' },
  { id: 'compras', title: 'Compras & mercados', emoji: '🛍️', summary: 'O Mercado de Atarazanas, a Calle Larios, artesanato andaluz e cerâmica. Do peixe fresco às marcas na Milla de Oro.', gradient: ['#B5651D', '#E0A458'], image: 'compras.jpg' },
  { id: 'hospedagem', title: 'Onde ficar — hotéis & flats', emoji: '🛏️', summary: 'Hotéis-boutique, 5 estrelas à beira-mar e flats/Airbnb selecionados por zona. Compare, reserve por fora e registre em "Minhas reservas".', gradient: ['#37607A', '#7FA8C0'], image: 'hospedagem.jpg' }
];

// As 7 zonas/bases da viagem. Os ids batem com os das categorias-destino,
// então a "zona" de um local em categoria-destino é o próprio categoryId.
export interface City {
  id: string;
  label: string;
  emoji: string;
}
export const cities: City[] = [
  { id: 'malaga', label: 'Málaga', emoji: '🏛️' },
  { id: 'axarquia', label: 'Nerja & Axarquía', emoji: '🌅' },
  { id: 'antequera', label: 'Antequera', emoji: '🪨' },
  { id: 'ronda', label: 'Ronda', emoji: '⛰️' },
  { id: 'marbella', label: 'Marbella', emoji: '🏖️' },
  { id: 'granada', label: 'Granada', emoji: '🏯' },
  { id: 'cordoba', label: 'Córdoba', emoji: '🕌' }
];
export const isDestinationCategory = (id: string) => cities.some((c) => c.id === id);
export const cityById = (id?: string) => cities.find((c) => c.id === id);

// Todo o catálogo vem da pesquisa (contentExtra). Sem âncoras fixas.
const baseAttractions: Attraction[] = [];

export const attractions: Attraction[] = [...baseAttractions, ...extraAttractions].map((a) =>
  // Local usa imagem PRÓPRIA quando tem; senão fica com gradiente+emoji da categoria.
  a.links || !linksByName[a.name] ? a : { ...a, links: linksByName[a.name] }
);

export const categoryById = (id: string) => categories.find((c) => c.id === id);
export const attractionsOf = (categoryId: string) => attractions.filter((a) => a.categoryId === categoryId);
export const attractionById = (id: string) => attractions.find((a) => a.id === id);
/** Locais de uma categoria numa zona específica. */
export const attractionsInCity = (categoryId: string, city: string) =>
  attractions.filter((a) => a.categoryId === categoryId && a.city === city);
/** Zonas (na ordem canônica) que têm ao menos 1 local nesta categoria. */
export const citiesInCategory = (categoryId: string) =>
  cities.filter((c) => attractions.some((a) => a.categoryId === categoryId && a.city === c.id));
