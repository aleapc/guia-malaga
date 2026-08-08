import { attractionById, attractions, cities, type Attraction } from './content';
import { daySky, forDate, isRainy, sunshineFraction, type SkyKind, type WeatherData } from './weather';
import { isoWeekday, todayISO } from './dates';

export interface PlanItem {
  when: string;
  id: string;
  name: string;
  why: string;
}

export interface DayPlan {
  title: string;
  reason: string;
  items: PlanItem[];
  emptyMsg?: string;
}

const DESTINO = cities.map((c) => c.id); // zonas (monumentos das cidades)

function openToday(a: Attraction, today: string): boolean {
  const days = a.hours?.openDays;
  if (!days || days.length === 0) return true;
  return days.includes(isoWeekday(today));
}

function fitsMode(a: Attraction, mode: 'clear' | 'rainy' | 'mixed'): boolean {
  if (mode === 'clear') return a.fit === 'CLEAR_SKY' || a.fit === 'ANY';
  if (mode === 'rainy') return a.fit === 'RAIN_OK' || a.fit === 'INDOOR';
  return true;
}

/** Primeiro candidato (favorito antes) numa lista ordenada de categorias, respeitando o clima. */
function pickByCats(
  cats: string[],
  candidates: Set<string>,
  fav: Set<string>,
  mode: 'clear' | 'rainy' | 'mixed'
): string | undefined {
  const ok = (id: string, cat: string) => {
    const a = attractionById(id);
    return !!a && a.categoryId === cat && candidates.has(id) && fitsMode(a, mode);
  };
  for (const pass of [true, false]) {
    for (const cat of cats) {
      const hit = [...candidates].find((id) => (pass ? fav.has(id) : true) && ok(id, cat));
      if (hit) return hit;
    }
  }
  return undefined;
}

export function buildPlan(
  weather: WeatherData | null,
  doneIds: string[] = [],
  favIds: string[] = [],
  today = todayISO()
): DayPlan {
  const done = new Set(doneIds);
  const fav = new Set(favIds);
  const candidates = new Set(
    attractions.filter((a) => !done.has(a.id) && openToday(a, today)).map((a) => a.id)
  );

  const todayFc = weather ? (forDate(weather, today) ?? weather.days[0]) : undefined;
  const sky = todayFc ? daySky(todayFc) : null;
  const rainy = todayFc ? isRainy(todayFc) : false;
  const sunPct = todayFc ? Math.round(sunshineFraction(todayFc) * 100) : 0;
  const rainPct = todayFc ? todayFc.precipProbMax : 0;

  const wet: SkyKind[] = ['rain', 'storm', 'snow', 'drizzle'];
  const sunny: SkyKind[] = ['sun', 'part'];
  let mode: 'clear' | 'rainy' | 'mixed';
  if (rainy || (sky && wet.includes(sky.kind))) mode = 'rainy';
  else if (sky && sunny.includes(sky.kind)) mode = 'clear';
  else mode = 'mixed';

  // Andaluzia em julho: dia de sol (o normal) → praia, natureza e monumentos ao ar livre;
  // dia de chuva (raro) → museus e monumentos cobertos.
  const mainCats: Record<typeof mode, string[]> = {
    clear: ['natureza', 'praias', ...DESTINO],
    rainy: ['cultura', ...DESTINO],
    mixed: [...DESTINO, 'compras', 'natureza']
  };

  const items: PlanItem[] = [];

  const mainId = pickByCats(mainCats[mode], candidates, fav, mode);
  if (mainId) {
    candidates.delete(mainId);
    const a = attractionById(mainId)!;
    const isFav = fav.has(mainId);
    const baseWhy =
      mode === 'clear'
        ? 'aproveita o sol do verão andaluz'
        : mode === 'rainy'
          ? 'coberto — funciona bem na chuva'
          : 'flexível pro tempo variável';
    items.push({ when: 'Manhã / tarde', id: a.id, name: a.name, why: isFav ? `⭐ seu favorito — ${baseWhy}` : baseWhy });
  }

  // Uma refeição — prefere um favorito da gastronomia; senão uma taberna de tapas.
  const mealId = pickByCats(['gastronomia', 'tapas'], candidates, fav, 'mixed');
  if (mealId) {
    candidates.delete(mealId);
    const meal = attractionById(mealId)!;
    items.push({
      when: mode === 'clear' ? 'Almoço' : 'Refeição com calma',
      id: meal.id,
      name: meal.name,
      why: meal.tagline.toLowerCase()
    });
  }

  // Fim de tarde: com sol, uma praia/chiringuito ou mirante; senão, café ou compras cobertas.
  if (mode === 'clear') {
    const sunset = pickByCats(['praias', 'cafe', 'tapas'], candidates, fav, 'clear');
    if (sunset) {
      const s = attractionById(sunset)!;
      items.push({ when: 'Fim de tarde', id: s.id, name: s.name, why: 'pôr do sol à beira-mar, sem pressa' });
    }
  } else {
    const cozy = pickByCats(['cafe', 'compras', 'cultura'], candidates, fav, 'mixed');
    if (cozy) {
      const c = attractionById(cozy)!;
      items.push({ when: 'A caminho de casa', id: c.id, name: c.name, why: 'uma pausa boa pra fechar o dia' });
    }
  }

  const SKY_TITLE: Record<SkyKind, string> = {
    sun: 'Dia de céu limpo',
    part: 'Sol entre nuvens',
    cloud: 'Dia nublado',
    fog: 'Dia de neblina',
    drizzle: 'Garoa pelo dia',
    rain: 'Dia de chuva',
    snow: 'Dia de neve',
    storm: 'Dia de tempestade'
  };
  const title = sky ? `${SKY_TITLE[sky.kind]} ${sky.emoji}` : 'Sugestão de hoje';
  const reason = !todayFc
    ? 'Sem previsão agora — sugestões gerais. Conecte ao wi-fi pra afinar pelo tempo.'
    : mode === 'rainy'
      ? `${rainPct}% de chance de chuva. Melhor dia pra museus e monumentos cobertos.`
      : mode === 'clear'
        ? `${sunPct}% de sol e chuva ${rainPct}%. Dia de praia, natureza e monumentos — leve protetor (o sol de julho é forte).`
        : `${sunPct}% de sol, ${rainPct}% de chuva. Tempo variável — vá de algo flexível.`;

  const empty = items.length === 0 ? 'Vocês já fizeram quase tudo da lista! 🎉 Repita um favorito ou curta uma tarde de praia.' : undefined;

  return { title, reason, items, emptyMsg: empty };
}
