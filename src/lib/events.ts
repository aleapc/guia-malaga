import data from './events.json';

// "Acontece agora" — agenda cultural/musical/esportiva. Como a viagem é no futuro (jul/2027),
// NÃO listamos line-ups datados (não existem ainda): curamos os festivais/temporadas ANUAIS
// que pegam o início de julho + o que rola toda semana + botões de AGENDA AO VIVO para
// confirmar a programação perto da data (precisa de internet; o resto do guia é offline).

export type EventCat = 'musica' | 'flamenco' | 'cultura' | 'gastronomia' | 'esporte' | 'festa' | 'arte';

export interface EventLink {
  label: string;
  url: string;
}
export interface FestivalItem {
  id: string;
  name: string;
  when: string; // ex.: "início de julho", "todo o verão (jun–ago)"
  zone?: string;
  category: EventCat;
  blurb: string;
  venue?: string;
  mapQuery?: string;
  link?: EventLink;
  note?: string; // ex.: "programação de 2027 confirma-se perto da data"
}
export interface WeeklyItem {
  id: string;
  name: string;
  cadence: string; // ex.: "toda noite", "domingos de manhã"
  zone?: string;
  category: EventCat;
  blurb: string;
  mapQuery?: string;
  link?: EventLink;
}
export interface AgendaSource {
  label: string;
  url: string;
  blurb: string;
}
export interface EventsData {
  festivais: FestivalItem[];
  semanais: WeeklyItem[];
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
