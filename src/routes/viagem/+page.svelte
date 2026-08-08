<script lang="ts">
  import { onMount } from 'svelte';
  import TopBar from '$lib/components/TopBar.svelte';
  import {
    tripPlan,
    tripState,
    seedExistsInRepo,
    loadSeedFromRepo,
    loadTripCache,
    cacheTrip,
    clearTripCache,
    seedChangedSinceCache
  } from '$lib/tripData.svelte';

  let checked = $state(false);
  let seedExists = $state(false);
  let pw = $state('');
  let busy = $state(false);
  let err = $state('');
  let remember = $state(true);
  let showPw = $state(false);
  let staleSeed = $state(false);

  onMount(async () => {
    try {
      if (loadTripCache()) {
        checked = true;
        // Background: did the published reservations change since we cached them?
        seedChangedSinceCache()
          .then((changed) => (staleSeed = changed))
          .catch(() => {});
        return;
      }
    } catch (e) {
      console.warn('[viagem] loadTripCache failed', e);
    }
    try {
      seedExists = await seedExistsInRepo();
    } catch (e) {
      console.warn('[viagem] seedExistsInRepo failed', e);
      seedExists = false;
    }
    checked = true;
  });

  /** Reservations changed on the server → drop the cache and ask for the password to re-sync. */
  function resync() {
    staleSeed = false;
    clearTripCache();
    seedExists = true; // we know a seed exists (we just fetched it)
  }

  async function unlock() {
    if (busy) return;
    err = '';
    busy = true;
    const res = await loadSeedFromRepo(pw);
    if (res === 'ok') {
      if (remember) cacheTrip();
      pw = '';
    } else if (res === 'wrong-password') {
      err = 'Senha incorreta. Confira maiúsculas, hífens e espaços.';
      pw = '';
    } else {
      err = 'Não consegui carregar os dados da viagem. Conecte à internet uma vez para baixá-los — depois funciona offline.';
    }
    busy = false;
  }

  async function lockDevice() {
    clearTripCache();
    seedExists = await seedExistsInRepo();
  }

  const maps = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  const tel = (p: string) => `tel:${p.replace(/[^+0-9]/g, '')}`;
</script>

<TopBar title="Nossa viagem" />

<main class="space-y-5 p-4 pb-16">
  {#if tripState.unlocked}
    {#if staleSeed}
      <button
        onclick={resync}
        class="flex w-full items-center gap-3 rounded-2xl bg-ember p-3 text-left text-white shadow-sm"
      >
        <span class="text-2xl">🔄</span>
        <span class="flex-1 text-sm font-semibold">Há uma atualização nas suas reservas. Toque para recarregar (vai pedir a senha).</span>
      </button>
    {/if}
    <section>
      <h2 class="mb-2 text-lg font-bold">✈️ Voos</h2>
      <div class="space-y-2">
        {#each tripPlan.flights as f (f.flightNo + f.date)}
          <div class="rounded-2xl bg-white p-3 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wide text-teal">{f.journey}</span>
              <span class="text-xs text-deep/55">{f.airline} {f.flightNo} · {f.date}</span>
            </div>
            <div class="mt-1 flex items-center justify-between">
              <div><p class="font-bold">{f.depart}</p><p class="text-xs text-deep/60">{f.from}</p></div>
              <span class="text-deep/40">✈</span>
              <div class="text-right"><p class="font-bold">{f.arrive}</p><p class="text-xs text-deep/60">{f.to}</p></div>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <section>
      <h2 class="mb-2 text-lg font-bold">🏨 Hospedagem</h2>
      <div class="space-y-2">
        {#each tripPlan.lodgings as l, i (l.name + '|' + l.checkin + '|' + i)}
          <div class="rounded-2xl bg-white p-4 shadow-sm">
            <p class="font-bold leading-tight">{l.name}</p>
            {#if l.kind}<p class="text-xs text-deep/55">{l.kind}</p>{/if}
            <p class="mt-2 text-sm text-deep/80">📅 {l.checkin} → {l.checkout}</p>
            <p class="mt-1 text-sm text-deep/80">📍 {l.address}</p>
            {#if l.code}<p class="mt-1 text-sm">🔑 Código: <strong>{l.code}</strong></p>{/if}
            {#if l.note}<p class="mt-1 text-xs text-deep/60">{l.note}</p>{/if}
            <div class="mt-2 flex flex-wrap gap-2">
              <a href={maps(l.mapQuery ?? l.address)} target="_blank" rel="noopener" class="rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-white">🗺️ Mapa</a>
              {#if l.phone}<a href={tel(l.phone)} class="rounded-lg border border-deep/20 px-3 py-1.5 text-xs font-semibold text-deep">📞 {l.host ?? 'Ligar'}</a>{/if}
            </div>
          </div>
        {/each}
      </div>
    </section>

    <section>
      <h2 class="mb-2 text-lg font-bold">🚗 Aluguel de carro</h2>
      <div class="space-y-2">
        {#each tripPlan.cars as c (c.code ?? c.company)}
          <div class="rounded-2xl bg-white p-4 shadow-sm">
            <p class="font-bold leading-tight">{c.company}</p>
            <div class="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div><p class="text-[11px] font-semibold uppercase text-deep/50">Retirada</p><p>{c.pickupAt}</p><p class="text-xs text-deep/60">{c.pickup}</p></div>
              <div><p class="text-[11px] font-semibold uppercase text-deep/50">Devolução</p><p>{c.dropoffAt}</p><p class="text-xs text-deep/60">{c.dropoff}</p></div>
            </div>
            {#if c.code}<p class="mt-2 text-sm">🔑 Reserva: <strong>{c.code}</strong>{#if c.confirmation} · Conf.: <strong>{c.confirmation}</strong>{/if}</p>{/if}
            {#if c.note}<p class="mt-1 text-xs text-deep/60">{c.note}</p>{/if}
            <div class="mt-2 flex flex-wrap gap-2">
              <a href={maps(c.pickup)} target="_blank" rel="noopener" class="rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-white">🗺️ Mapa</a>
              {#if c.phone}<a href={tel(c.phone)} class="rounded-lg border border-deep/20 px-3 py-1.5 text-xs font-semibold text-deep">📞 Locadora</a>{/if}
            </div>
          </div>
        {/each}
      </div>
    </section>

    <section>
      <h2 class="mb-2 text-lg font-bold">🛟 Seguro viagem</h2>
      <div class="space-y-2">
        {#if tripPlan.insurances.length}
          {#each tripPlan.insurances as ins (ins.policy)}
            <div class="rounded-2xl bg-white p-4 text-sm shadow-sm">
              <div class="flex items-baseline justify-between gap-2">
                <p class="font-bold">{ins.insured ?? ins.company}</p>
                {#if ins.insured}<span class="text-xs text-deep/55">{ins.company}</span>{/if}
              </div>
              {#if ins.plan}<p class="mt-0.5 text-xs text-deep/60">{ins.plan}</p>{/if}
              <p class="mt-1">Bilhete: <strong>{ins.policy}</strong></p>
              {#if ins.validity}<p class="text-xs text-deep/70">📅 {ins.validity}</p>{/if}

              {#if ins.coverage?.length}
                <ul class="mt-2 space-y-0.5">
                  {#each ins.coverage as c (c)}
                    <li class="flex gap-1.5 text-xs text-deep/80"><span class="text-teal">•</span><span>{c}</span></li>
                  {/each}
                </ul>
              {/if}

              <div class="mt-2 flex flex-wrap gap-2">
                {#each (ins.phones ?? [{ label: 'Assistência', number: ins.phone }]) as p (p.number)}
                  <a href={tel(p.number)} class="rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-white">📞 {p.label}</a>
                {/each}
                {#if ins.claimUrl}<a href={ins.claimUrl} target="_blank" rel="noopener" class="rounded-lg border border-deep/20 px-3 py-1.5 text-xs font-semibold text-deep">Abrir sinistro ↗</a>{/if}
              </div>
              {#if ins.email}<p class="mt-2 text-xs text-deep/55">✉️ {ins.email}</p>{/if}
              {#if ins.note}<p class="mt-1 text-[11px] text-deep/45">{ins.note}</p>{/if}
            </div>
          {/each}
        {:else}
          <div class="rounded-2xl bg-white p-4 text-sm text-deep/60 shadow-sm">A adicionar.</div>
        {/if}
      </div>
    </section>

    {#if tripPlan.docsNote}
      <section>
        <h2 class="mb-2 text-lg font-bold">📄 Reserva & documentos</h2>
        <div class="rounded-2xl bg-white p-4 text-sm leading-relaxed text-deep/80 shadow-sm">{tripPlan.docsNote}</div>
      </section>
    {/if}

    <button onclick={lockDevice} class="w-full rounded-xl border border-deep/20 py-2.5 text-sm font-semibold text-deep/70">
      🔒 Bloquear neste aparelho (pedir a senha de novo)
    </button>
    <p class="text-center text-[11px] text-deep/40">As reservas ficam guardadas neste aparelho (fora da internet). Toque em “Bloquear” pra exigir a senha de novo.</p>
  {:else if checked && seedExists}
    <div class="space-y-3 rounded-2xl bg-white p-5 text-center shadow-sm">
      <span class="text-4xl">🔒</span>
      <p class="font-bold">Reservas protegidas</p>
      <p class="text-sm text-deep/70">Digite a senha da viagem pra ver voos, hospedagem e carro.</p>
      <div class="relative">
        <input
          bind:value={pw}
          type={showPw ? 'text' : 'password'}
          autocomplete="current-password"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
          placeholder="Senha da viagem"
          onkeydown={(e) => e.key === 'Enter' && unlock()}
          class="w-full rounded-lg border border-deep/15 px-3 py-2.5 pr-11 text-center outline-none focus:border-teal"
        />
        <button
          type="button"
          onclick={() => (showPw = !showPw)}
          class="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-lg text-deep/55"
          aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {showPw ? '🙈' : '👁️'}
        </button>
      </div>
      <label class="flex items-center justify-center gap-2 text-sm text-deep/70">
        <input type="checkbox" bind:checked={remember} class="h-4 w-4 accent-teal" />
        Manter desbloqueado neste aparelho
      </label>
      {#if err}<p class="text-sm text-red-600">{err}</p>{/if}
      <button onclick={unlock} disabled={busy} class="w-full rounded-lg bg-teal py-2.5 font-semibold text-white disabled:opacity-60">
        {busy ? 'Verificando…' : 'Mostrar reservas'}
      </button>
    </div>
  {:else if checked}
    <p class="py-8 text-center text-sm text-deep/60">As reservas ainda não foram publicadas no app.</p>
  {/if}
</main>
