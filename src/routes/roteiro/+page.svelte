<script lang="ts">
  import { base } from '$app/paths';
  import TopBar from '$lib/components/TopBar.svelte';
  import { itinerary } from '$lib/itinerary';
  import { categoryById } from '$lib/content';

  const fmtDate = (iso: string) => {
    const d = new Date(iso + 'T12:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  };
</script>

<TopBar title="Roteiro · 10 dias" />

<main class="space-y-4 p-4 pb-16">
  <section class="rounded-2xl bg-gradient-to-br from-teal to-deep p-4 text-white shadow">
    <p class="text-xs font-semibold uppercase tracking-wide text-white/70">Málaga & sul da Espanha</p>
    <h2 class="mt-1 text-xl font-bold leading-tight">10 dias premium · 1 a 10 de julho de 2027</h2>
    <p class="mt-1 text-sm text-white/85">
      Uma sugestão de ritmo com base em Málaga e incursões por Antequera, Ronda, Costa del Sol,
      Nerja, Granada e Córdoba. Toque nas categorias de cada dia pra ver os lugares.
    </p>
  </section>

  <div class="space-y-3">
    {#each itinerary as day (day.n)}
      <article class="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div class="flex items-center gap-3 border-b border-deep/8 bg-deep/[0.03] px-4 py-2.5">
          <div class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal text-sm font-bold text-white">
            D{day.n}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-bold leading-tight text-deep">{day.emoji} {day.title}</p>
            <p class="text-xs text-deep/55">{fmtDate(day.date)} · {day.zoneLabel}</p>
          </div>
        </div>

        <div class="space-y-2 px-4 py-3">
          {#each day.blocks as b (b.when)}
            <div class="flex gap-3">
              <span class="w-24 shrink-0 pt-0.5 text-[11px] font-semibold uppercase tracking-wide text-teal">{b.when}</span>
              <p class="flex-1 text-sm leading-relaxed text-deep/85">{b.text}</p>
            </div>
          {/each}

          {#if day.tip}
            <p class="mt-1 rounded-lg bg-ember/10 px-3 py-2 text-xs leading-relaxed text-deep/80">
              👑 {day.tip}
            </p>
          {/if}

          {#if day.cats?.length}
            <div class="flex flex-wrap gap-1.5 pt-1">
              {#each day.cats as c (c)}
                {@const cat = categoryById(c)}
                {#if cat}
                  <a
                    href="{base}/categoria/{cat.id}"
                    class="inline-flex items-center gap-1 rounded-full bg-teal/10 px-2.5 py-1 text-xs font-medium text-teal active:scale-95"
                  >{cat.emoji} {cat.title}</a>
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      </article>
    {/each}
  </div>

  <div class="space-y-2 rounded-2xl bg-white p-4 text-sm text-deep/80 shadow-sm">
    <p class="font-bold text-deep">🛏️ Hospedagem & ✈️ voos</p>
    <p>
      A hospedagem entra como <a href="{base}/categoria/hospedagem" class="font-semibold text-teal">uma categoria</a> —
      hotéis 5★, boutique e flats por zona. Escolha onde ficar, feche por fora e depois
      <a href="{base}/reservas" class="font-semibold text-teal">registre em “Minhas reservas”</a>.
      Para as passagens, veja as <a href="{base}/voos" class="font-semibold text-teal">opções de voo</a>.
    </p>
  </div>

  <p class="text-center text-[11px] text-deep/40">
    Roteiro é uma sugestão flexível — o app ajusta o dia ao clima na tela inicial.
  </p>
</main>
