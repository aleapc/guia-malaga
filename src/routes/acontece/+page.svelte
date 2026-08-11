<script lang="ts">
  import TopBar from '$lib/components/TopBar.svelte';
  import { events, eventCat, type EventCat } from '$lib/events';
  import { cityById } from '$lib/content';

  function mapSearch(q?: string): string | undefined {
    return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : undefined;
  }
  const zoneLabel = (z?: string) => (z ? (cityById(z)?.label ?? '') : '');

  let filter = $state<EventCat | 'all'>('all');
  const cats = $derived(
    [...new Set([
      ...events.festivais, ...events.semanais,
      ...(events.shows ?? []),
    ].map((e) => e.category))] as EventCat[]
  );
  const fest = $derived(filter === 'all' ? events.festivais : events.festivais.filter((e) => e.category === filter));
  const week = $derived(filter === 'all' ? events.semanais : events.semanais.filter((e) => e.category === filter));
  const shows = $derived(
    (events.shows ?? []).filter((s) => filter === 'all' || s.category === filter)
  );
  const jogos = $derived(events.jogos ?? []);

  interface VenueGroup { venue: string; items: typeof shows }
  function groupByVenue(list: typeof shows): VenueGroup[] {
    const map = new Map<string, typeof shows>();
    for (const s of list) {
      if (!map.has(s.venue)) map.set(s.venue, []);
      map.get(s.venue)!.push(s);
    }
    return [...map.entries()].map(([venue, items]) => ({ venue, items }));
  }
  const showsByVenue = $derived(groupByVenue(shows));
</script>

<TopBar title="Acontece agora" />

<main class="space-y-5 p-4 pb-16">
  <section class="rounded-2xl bg-gradient-to-br from-ember to-deep p-4 text-white shadow">
    <p class="text-xs font-semibold uppercase tracking-wide text-white/70">Agenda · julho</p>
    <h2 class="mt-1 text-xl font-bold leading-tight">Shows, jogos e o que rola em cena</h2>
    <p class="mt-1 text-sm text-white/85">
      Concertos confirmados, amistosos de futebol, festivais de verão, o que acontece toda semana, e os links para
      conferir a <strong>programação ao vivo</strong> quando as datas de 2027 forem confirmadas.
    </p>
    <p class="mt-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs text-white/90">
      ⚠️ As datas abaixo são <strong>referência de 2026</strong>. Em 2027 podem variar ±1 semana — confirme nos links oficiais perto da viagem.
    </p>
  </section>

  {#if cats.length}
    <div class="flex flex-wrap gap-1.5">
      <button
        onclick={() => (filter = 'all')}
        class="rounded-full px-3 py-1.5 text-sm font-semibold {filter === 'all' ? 'bg-teal text-white' : 'border border-deep/15 bg-white text-deep/70'}"
      >Tudo</button>
      {#each cats as c (c)}
        <button
          onclick={() => (filter = c)}
          class="rounded-full px-3 py-1.5 text-sm font-semibold {filter === c ? 'bg-teal text-white' : 'border border-deep/15 bg-white text-deep/70'}"
        >{eventCat(c).emoji} {eventCat(c).label}</button>
      {/each}
    </div>
  {/if}

  <!-- ──── Shows / concertos com data ──── -->
  {#if shows.length}
    <section class="space-y-3">
      <p class="text-xs font-semibold uppercase tracking-wide text-deep/50">🎤 Shows confirmados (ref. 2026)</p>

      {#each showsByVenue as group (group.venue)}
        <div class="space-y-3">
          <p class="text-xs font-bold uppercase tracking-wide text-teal">{group.venue}</p>
          {#each group.items as s (s.id)}
            <article class="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div class="flex items-center gap-2 bg-gradient-to-r from-deep to-teal px-4 py-2">
                <span class="text-sm font-bold text-white">{s.date}</span>
                {#if s.tag}
                  <span class="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/90">{s.tag}</span>
                {/if}
              </div>
              <div class="p-4">
                <p class="text-lg font-bold leading-tight text-deep">{s.artist}</p>
                {#if s.blurb}<p class="mt-1.5 text-sm leading-relaxed text-deep/75">{s.blurb}</p>{/if}
                <div class="mt-3 flex flex-wrap items-center gap-2">
                  {#if s.price}<span class="rounded-full bg-ember/10 px-2.5 py-1 text-[11px] font-bold text-ember">{s.price}</span>{/if}
                  {#if s.link}
                    <a href={s.link.url} target="_blank" rel="noopener" class="inline-flex items-center gap-1 rounded-full bg-teal px-3 py-1.5 text-xs font-semibold text-white">🎟️ {s.link.label} ↗</a>
                  {/if}
                  {#if mapSearch(s.mapQuery)}
                    <a href={mapSearch(s.mapQuery)} target="_blank" rel="noopener" class="inline-flex items-center gap-1 rounded-full bg-deep/8 px-3 py-1.5 text-xs font-semibold text-deep">📍 Local</a>
                  {/if}
                </div>
              </div>
              {#if s.note}<p class="border-t border-deep/5 px-4 py-2 text-[11px] italic text-deep/45">{s.note}</p>{/if}
            </article>
          {/each}
        </div>
      {/each}
    </section>
  {/if}

  <!-- ──── Jogos de futebol ──── -->
  {#if jogos.length && (filter === 'all' || filter === 'esporte')}
    <section class="space-y-3">
      <p class="text-xs font-semibold uppercase tracking-wide text-deep/50">⚽ Futebol — pré-temporada (ref. 2026)</p>
      {#each jogos as g (g.id)}
        <article class="rounded-2xl bg-white p-4 shadow-sm">
          <div class="flex items-baseline justify-between gap-2">
            <p class="font-bold text-deep">{g.home} vs {g.away}</p>
            <span class="shrink-0 text-xs font-semibold text-ember">{g.date}</span>
          </div>
          <p class="text-xs text-deep/55">{g.comp} · {g.venue}</p>
          {#if g.blurb}<p class="mt-1 text-sm leading-relaxed text-deep/80">{g.blurb}</p>{/if}
          <div class="mt-2 flex flex-wrap items-center gap-2">
            {#if g.link}
              <a href={g.link.url} target="_blank" rel="noopener" class="inline-flex items-center gap-1 rounded-full bg-teal px-3 py-1.5 text-xs font-semibold text-white">🎟️ {g.link.label} ↗</a>
            {/if}
            {#if mapSearch(g.mapQuery)}
              <a href={mapSearch(g.mapQuery)} target="_blank" rel="noopener" class="inline-flex items-center gap-1 rounded-full bg-deep/8 px-3 py-1.5 text-xs font-semibold text-deep">📍 Estádio</a>
            {/if}
          </div>
          {#if g.note}<p class="mt-2 text-[11px] italic text-deep/45">{g.note}</p>{/if}
        </article>
      {/each}
    </section>
  {/if}

  <!-- ──── Festivais / temporadas ──── -->
  {#if fest.length}
    <section class="space-y-3">
      <p class="text-xs font-semibold uppercase tracking-wide text-deep/50">🎪 Festivais e temporadas</p>
      {#each fest as e (e.id)}
        <article class="rounded-2xl bg-white p-4 shadow-sm">
          <div class="flex items-baseline justify-between gap-2">
            <p class="font-bold text-deep">{eventCat(e.category).emoji} {e.name}</p>
            <span class="shrink-0 text-xs font-semibold text-ember">{e.when}</span>
          </div>
          {#if e.venue || e.zone}
            <p class="text-xs text-deep/55">{[e.venue, zoneLabel(e.zone)].filter(Boolean).join(' · ')}</p>
          {/if}
          <p class="mt-1 text-sm leading-relaxed text-deep/80">{e.blurb}</p>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            {#if e.link}
              <a href={e.link.url} target="_blank" rel="noopener" class="inline-flex items-center gap-1 rounded-full bg-teal px-3 py-1.5 text-xs font-semibold text-white">🎟️ {e.link.label} ↗</a>
            {/if}
            {#if mapSearch(e.mapQuery)}
              <a href={mapSearch(e.mapQuery)} target="_blank" rel="noopener" class="inline-flex items-center gap-1 rounded-full bg-deep/8 px-3 py-1.5 text-xs font-semibold text-deep">📍 Local</a>
            {/if}
          </div>
          {#if e.note}<p class="mt-2 text-[11px] italic text-deep/45">{e.note}</p>{/if}
        </article>
      {/each}
    </section>
  {/if}

  <!-- ──── Semanais / recorrentes ──── -->
  {#if week.length}
    <section class="space-y-3">
      <p class="text-xs font-semibold uppercase tracking-wide text-deep/50">🔁 Toda semana</p>
      {#each week as e (e.id)}
        <article class="rounded-2xl bg-white p-4 shadow-sm">
          <div class="flex items-baseline justify-between gap-2">
            <p class="font-bold text-deep">{eventCat(e.category).emoji} {e.name}</p>
            <span class="shrink-0 text-xs font-semibold text-teal">{e.cadence}</span>
          </div>
          {#if e.zone}<p class="text-xs text-deep/55">{zoneLabel(e.zone)}</p>{/if}
          <p class="mt-1 text-sm leading-relaxed text-deep/80">{e.blurb}</p>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            {#if e.link}
              <a href={e.link.url} target="_blank" rel="noopener" class="inline-flex items-center gap-1 rounded-full bg-teal px-3 py-1.5 text-xs font-semibold text-white">{e.link.label} ↗</a>
            {/if}
            {#if mapSearch(e.mapQuery)}
              <a href={mapSearch(e.mapQuery)} target="_blank" rel="noopener" class="inline-flex items-center gap-1 rounded-full bg-deep/8 px-3 py-1.5 text-xs font-semibold text-deep">📍 Local</a>
            {/if}
          </div>
        </article>
      {/each}
    </section>
  {/if}

  <!-- ──── Agenda ao vivo ──── -->
  {#if events.agendas.length}
    <section class="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
      <p class="font-bold text-deep">📡 Conferir a programação ao vivo</p>
      <p class="text-xs text-deep/60">Precisa de internet. Confirme as datas de 2027 perto da viagem.</p>
      <div class="mt-1 space-y-2">
        {#each events.agendas as a (a.url)}
          <a href={a.url} target="_blank" rel="noopener" class="flex items-start gap-2 rounded-xl bg-sand/60 p-2.5">
            <span class="text-base">🔗</span>
            <span class="min-w-0">
              <span class="block text-sm font-semibold text-teal">{a.label} ↗</span>
              <span class="block text-xs text-deep/65">{a.blurb}</span>
            </span>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <p class="text-center text-[11px] text-deep/40">
    Datas de referência de 2026. A agenda de 2027 confirma-se perto da viagem — use os links acima.
  </p>
</main>
