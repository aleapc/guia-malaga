<script lang="ts">
  import TopBar from '$lib/components/TopBar.svelte';
  import { events, eventCat, type EventCat } from '$lib/events';
  import { cityById } from '$lib/content';

  function mapSearch(q?: string): string | undefined {
    return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : undefined;
  }
  const zoneLabel = (z?: string) => (z ? (cityById(z)?.label ?? '') : '');

  // Filtro por tipo de evento.
  let filter = $state<EventCat | 'all'>('all');
  const cats = $derived(
    [...new Set([...events.festivais, ...events.semanais].map((e) => e.category))] as EventCat[]
  );
  const fest = $derived(filter === 'all' ? events.festivais : events.festivais.filter((e) => e.category === filter));
  const week = $derived(filter === 'all' ? events.semanais : events.semanais.filter((e) => e.category === filter));
</script>

<TopBar title="Acontece agora" />

<main class="space-y-5 p-4 pb-16">
  <section class="rounded-2xl bg-gradient-to-br from-ember to-deep p-4 text-white shadow">
    <p class="text-xs font-semibold uppercase tracking-wide text-white/70">Agenda · início de julho</p>
    <h2 class="mt-1 text-xl font-bold leading-tight">O que rola em cena enquanto vocês estão aí</h2>
    <p class="mt-1 text-sm text-white/85">
      Festivais e temporadas que pegam o começo de julho, o que acontece toda semana, e os links pra
      conferir a <strong>programação ao vivo</strong> quando as datas de 2027 forem confirmadas.
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

  {#if !events.festivais.length && !events.semanais.length}
    <p class="rounded-2xl border border-dashed border-deep/20 bg-white/60 p-6 text-center text-sm text-deep/60">
      Agenda sendo montada…
    </p>
  {/if}

  <!-- Festivais / temporadas -->
  {#if fest.length}
    <section class="space-y-3">
      <p class="text-xs font-semibold uppercase tracking-wide text-deep/50">No início de julho</p>
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

  <!-- Semanais / recorrentes -->
  {#if week.length}
    <section class="space-y-3">
      <p class="text-xs font-semibold uppercase tracking-wide text-deep/50">Toda semana</p>
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

  <!-- Agenda ao vivo -->
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
    A agenda fina (line-ups, jogos, datas exatas) só sai perto de 2027 — use os links acima para confirmar.
  </p>
</main>
