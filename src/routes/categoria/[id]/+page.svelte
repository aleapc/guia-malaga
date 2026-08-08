<script lang="ts">
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import {
    attractionsOf,
    attractionsInCity,
    categoryById,
    categories,
    citiesInCategory,
    cityById,
    isDestinationCategory
  } from '$lib/content';
  import Photo from '$lib/components/Photo.svelte';
  import PlaceCard from '$lib/components/PlaceCard.svelte';
  import Menu from '$lib/components/Menu.svelte';

  let { data } = $props();
  const category = $derived(categoryById(data.id)!);
  const places = $derived(attractionsOf(data.id));
  const destination = $derived(isDestinationCategory(data.id));

  // ---- Filtro por cidade (categorias temáticas que cruzam cidades) ----
  const present = $derived(citiesInCategory(data.id)); // cidades com conteúdo, ordem canônica
  let selected = $state<string | null>(null);
  // A rota /categoria/[id] é reusada entre categorias, então sincronizamos o filtro
  // com o ?city= a cada navegação (e ignoramos cidade que não exista nesta categoria).
  $effect(() => {
    const c = $page.url.searchParams.get('city');
    selected = c && present.some((p) => p.id === c) ? c : null;
  });
  const shown = $derived(selected ? places.filter((a) => a.city === selected) : places);

  // ---- Atalhos por tema (páginas de DESTINO: Lima, Cusco, Vale, Machu Picchu) ----
  const cityLabel = $derived(cityById(data.id)?.label ?? category.title);
  const themeLinks = $derived(
    destination
      ? categories
          .filter((c) => !isDestinationCategory(c.id))
          .map((c) => ({ cat: c, n: attractionsInCity(c.id, data.id).length }))
          .filter((x) => x.n > 0)
          .sort((a, b) => b.n - a.n)
      : []
  );
</script>

<div class="relative">
  <Photo
    image={category.image}
    gradient={category.gradient}
    emoji={category.emoji}
    heightClass="h-52"
    alt={category.title}
  >
    <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10"></div>
    <div
      class="absolute inset-0 flex flex-col"
      style="padding-top: calc(env(safe-area-inset-top) + 0.5rem)"
    >
      <div class="flex items-center justify-between px-3">
        <a
          href="{base}/"
          class="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-xl text-white"
          aria-label="Voltar">←</a
        >
        <Menu tone="light" />
      </div>
      <div class="mt-auto px-4 pb-3 text-white">
        <p class="text-2xl font-bold leading-tight drop-shadow">{category.emoji} {category.title}</p>
        <p class="mt-0.5 text-sm opacity-90">{category.summary}</p>
      </div>
    </div>
  </Photo>
</div>

<!-- DESTINO: atalhos para os temas (comer, beber, museus…) já filtrados nesta cidade -->
{#if destination && themeLinks.length}
  <section class="px-4 pt-4">
    <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-deep/50">
      Também em {cityLabel}
    </p>
    <div class="flex flex-wrap gap-2">
      {#each themeLinks as t (t.cat.id)}
        <a
          href="{base}/categoria/{t.cat.id}?city={data.id}"
          class="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-deep shadow-sm active:scale-[0.98]"
        >
          <span>{t.cat.emoji}</span>
          <span>{t.cat.title}</span>
          <span class="rounded-full bg-teal/15 px-1.5 text-xs font-semibold text-teal">{t.n}</span>
        </a>
      {/each}
    </div>
  </section>
{/if}

<!-- TEMÁTICA: chips para filtrar por cidade -->
{#if !destination && present.length > 1}
  <div class="flex gap-2 overflow-x-auto px-4 pb-1 pt-4">
    <button
      onclick={() => (selected = null)}
      class="shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold {selected === null
        ? 'bg-teal text-white'
        : 'border border-deep/15 bg-white text-deep/70'}"
    >
      Todas
    </button>
    {#each present as c (c.id)}
      <button
        onclick={() => (selected = c.id)}
        class="shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold {selected === c.id
          ? 'bg-teal text-white'
          : 'border border-deep/15 bg-white text-deep/70'}"
      >
        {c.emoji} {c.label}
      </button>
    {/each}
  </div>
{/if}

<main class="space-y-3 p-4 pb-12 pt-3">
  {#each shown as a (a.id)}
    <PlaceCard {a} showCity={!destination && selected === null} />
  {/each}
  {#if !shown.length}
    <p class="py-6 text-center text-sm text-deep/60">Nada nesta cidade nesta categoria.</p>
  {/if}
  <a
    href="{base}/perto?cat={category.id}"
    class="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-teal/50 py-3 text-sm font-semibold text-teal"
  >
    📍 Outros lugares dessa categoria ao meu redor
  </a>
</main>
