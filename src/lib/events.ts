import data from './events.json';

export type EventCat = 'musica' | 'flamenco' | 'cultura' | 'gastronomia' | 'esporte' | 'festa' | 'arte';

export interface EventLink {
  label: string;
  url: string;
}
export interface FestivalItem {
  id: string;
  name: string;
  when: string;
  zone?: string;
  category: EventCat;
  blurb: string;
  venue?: string;
  mapQuery?: string;
  link?: EventLink;
  note?: string;
}
export interface WeeklyItem {
  id: string;
  name: string;
  cadence: string;
  zone?: string;
  category: EventCat;
  blurb: string;
  mapQuery?: string;
  link?: EventLink;
}
export interface ShowItem {
  id: string;
  date: string;
  artist: string;
  venue: string;
  zone?: string;
  category: EventCat;
  tag?: string;
  blurb?: string;
  price?: string;
  mapQuery?: string;
  link?: EventLink;
  note?: string;
}
export interface MatchItem {
  id: string;
  date: string;
  home: string;
  away: string;
  comp: string;
  venue: string;
  zone?: string;
  blurb?: string;
  mapQuery?: string;
  link?: EventLink;
  note?: string;
}
export interface AgendaSource {
  label: string;
  url: string;
  blurb: string;
}
export interface EventsData {
  festivais: FestivalItem[];
  semanais: WeeklyItem[];
  shows: ShowItem[];
  jogos: MatchItem[];
  agendas: AgendaSource[];
}

export const events: EventsData = data as EventsData;

export const EVENT_CAT: Record<EventCat, { label: string; emoji: string }> = {
  musica: { label: 'Música', emoji: '🎵' },
  flamenco: { label: 'Flamenco', emoji: '💃' },
  cultura: { label: 'Cultura', emoji: '🎭' },
  gastronomia: { label: 'Gastronomia', emoji: '🍽️' },
  esporte: { label: 'Esporte', emoji: '⚽' },
  festa: { label: 'Festa / Feria', emoji: '🎉' },
  arte: { label: 'Arte', emoji: '🎨' }
};
export const eventCat = (c: string) => EVENT_CAT[c as EventCat] ?? EVENT_CAT.cultura;
