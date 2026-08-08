import { attractions, cities, trip } from './content';
import {
  ageHours,
  clearScore,
  daySky,
  forDate,
  isRainy,
  isStale,
  sunshineFraction,
  type WeatherData
} from './weather';
import { parseLocal, ptDate, ptDateShort, ptWeekday, todayISO } from './dates';

export type AlertLevel = 'GREAT' | 'GOOD' | 'WARN' | 'INFO';

export interface Alert {
  level: AlertLevel;
  emoji: string;
  title: string;
  body: string;
  attractionId?: string;
}

const LEVEL_ORDER: Record<AlertLevel, number> = { GREAT: 0, GOOD: 1, WARN: 2, INFO: 3 };
const DESTINO = cities.map((c) => c.id);

/** Primeiro local ainda não visitado numa lista ordenada de categorias, opcionalmente ao ar livre. */
function firstByCats(cats: string[], done: Set<string>, outdoorOnly = false): string | undefined {
  for (const cat of cats) {
    const hit = attractions.find(
      (a) => a.categoryId === cat && !done.has(a.id) && (!outdoorOnly || a.fit === 'CLEAR_SKY' || a.fit === 'ANY')
    );
    if (hit) return hit.id;
  }
  return undefined;
}

export function buildAlerts(
  weather: WeatherData | null,
  doneIds: string[] = [],
  today = todayISO()
): Alert[] {
  const done = new Set(doneIds);
  const out: Alert[] = [];
  const start = trip.startDate;
  const end = trip.endDate;

  if (parseLocal(today) < parseLocal(start)) {
    const d = Math.round((parseLocal(start).getTime() - parseLocal(today).getTime()) / 86_400_000);
    out.push({
      level: 'INFO',
      emoji: '✈️',
      title: `Faltam ${d} dia(s) para Málaga`,
      body: `A viagem começa em ${ptDate(start)}. Os alertas de clima ficam afiados quando você chegar à Costa del Sol.`
    });
  }

  if (!weather || weather.days.length === 0) {
    out.push({
      level: 'WARN',
      emoji: '📡',
      title: 'Sem previsão no momento',
      body: 'Conecte ao wi-fi e atualize. Depois disso o guia funciona offline. (O clima mostrado é o de Málaga; no interior — Ronda, Antequera, Granada — costuma fazer ainda mais calor de dia.)'
    });
    return out;
  }

  const todayFc = forDate(weather, today) ?? weather.days[0];

  // 1) Fixo: clima de hoje em Málaga.
  const todaySky = daySky(todayFc);
  out.push({
    level: 'INFO',
    emoji: todaySky.emoji,
    title: `Hoje em Málaga: ${todaySky.label}`,
    body:
      `${Math.round(todayFc.tempMin)}–${Math.round(todayFc.tempMax)}°C · ${Math.round(sunshineFraction(todayFc) * 100)}% de sol · chuva ${todayFc.precipProbMax}% · UV até ${Math.round(todayFc.uvIndexMax)} · vento até ${Math.round(todayFc.windMax)} km/h` +
      (isStale(weather) ? ` · (previsão de ${ageHours(weather)}h atrás)` : '')
  });

  // 2) CALOR — o tema da viagem em julho (mostrado durante toda a janela).
  if (parseLocal(today) <= parseLocal(end)) {
    out.push({
      level: 'GOOD',
      emoji: '🥵',
      title: 'Verão andaluz: jogue com o calor',
      body: 'Passeios ao ar livre cedinho ou no fim da tarde; o auge do sol (13h–17h) pede praia, piscina, museu com ar ou uma sesta. Água sempre, protetor e chapéu. Reserve os restaurantes premium com antecedência.'
    });
  }

  // Horizonte: próximos dias, de preferência dentro da janela da viagem.
  const horizon = weather.days
    .filter((d) => d.date >= today)
    .filter((d) => (d.date >= start && d.date <= end) || today < start || today > end)
    .slice(0, 8);
  const horizonOrAll = horizon.length ? horizon : weather.days.filter((d) => d.date >= today).slice(0, 8);

  // 3) Melhor dia de céu limpo → grande passeio ao ar livre (Caminito, El Torcal, Alhambra, praia).
  const bestClear = horizonOrAll.reduce(
    (best, d) => (best && clearScore(best) >= clearScore(d) ? best : d),
    horizonOrAll[0]
  );
  if (bestClear && clearScore(bestClear) >= 0.4) {
    const target = firstByCats(['natureza', 'antequera', 'granada', 'ronda', 'axarquia', 'cordoba', 'marbella', 'malaga', 'praias'], done, true);
    if (target) {
      const isToday = bestClear.date === today;
      const level: AlertLevel = clearScore(bestClear) >= 0.55 ? 'GREAT' : 'GOOD';
      const whenTxt = isToday ? 'Hoje' : `${ptWeekday(bestClear.date)} (${ptDateShort(bestClear.date)})`;
      const name = attractions.find((a) => a.id === target)?.name ?? 'um grande passeio';
      out.push({
        level,
        emoji: '🌞',
        title: `${whenTxt}: melhor céu`,
        body: `Sol previsto (${Math.round(sunshineFraction(bestClear) * 100)}% do dia) e chuva só ${bestClear.precipProbMax}%. Dia ideal pra ${name} — comece cedo pra fugir do calor e leve protetor forte.`,
        attractionId: target
      });
    }
  }

  // 4) Dia de chuva → plano coberto (museus, monumentos). Raro no verão, mas acontece.
  if (isRainy(todayFc)) {
    const indoor = firstByCats(['cultura', 'granada', 'cordoba', 'compras'], done);
    out.push({
      level: 'GOOD',
      emoji: '🌧️',
      title: 'Chuva hoje — vá pro plano coberto',
      body: 'Ótimo dia pra museus (Picasso, Thyssen, Pompidou) e monumentos. Guarde a praia e o Caminito del Rey pra quando o céu abrir.',
      attractionId: indoor
    });
  }

  // 5) Calor forte — o risco real do verão andaluz.
  if (todayFc.tempMax >= 34) {
    out.push({
      level: 'WARN',
      emoji: '🌡️',
      title: `Calor forte hoje (máx. ${Math.round(todayFc.tempMax)} °C)`,
      body: 'Evite o sol entre 13h e 17h — hidrate-se sem parar, busque sombra e ar-condicionado. É tarde perfeita de praia, piscina ou museu. Cuidado com idosos e crianças.'
    });
  }

  // 6) UV alto — o sol do Mediterrâneo queima rápido.
  if (todayFc.uvIndexMax >= 8) {
    const uv = Math.round(todayFc.uvIndexMax);
    const extremo = uv >= 11;
    out.push({
      level: 'WARN',
      emoji: extremo ? '☢️' : '☀️',
      title: `Índice UV ${extremo ? 'extremo' : 'muito alto'} hoje (UV ${uv})`,
      body: extremo
        ? 'UV extremo: protetor FPS 50+ a cada 2 h, chapéu, óculos e camisa UV. Na praia, guarda-sol e evite o meio-dia — a queimadura vem em minutos.'
        : 'UV muito alto: protetor FPS 30+, chapéu e óculos; reaplique após o mar. A pele queima rápido no verão andaluz.'
    });
  }

  const pinned = out[0];
  const rest = out.slice(1).sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]).slice(0, 5);
  return [pinned, ...rest];
}
