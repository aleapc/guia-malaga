<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import TopBar from '$lib/components/TopBar.svelte';
  import {
    reservationsStore,
    loadReservations,
    saveReservation,
    deleteReservation,
    attachmentUrl,
    RES_TYPES,
    resType,
    type Reservation,
    type ResType
  } from '$lib/reservations.svelte';

  onMount(loadReservations);

  // ——— Formulário ———
  let showForm = $state(false);
  let editingId = $state<string | null>(null);
  let f = $state({
    type: 'voo' as ResType,
    title: '',
    provider: '',
    code: '',
    start: '',
    end: '',
    location: '',
    cost: '',
    notes: ''
  });
  let file = $state<File | null>(null);
  let saving = $state(false);

  function resetForm() {
    f = { type: 'voo', title: '', provider: '', code: '', start: '', end: '', location: '', cost: '', notes: '' };
    file = null;
    editingId = null;
  }
  function openNew() {
    resetForm();
    showForm = true;
  }
  function openEdit(r: Reservation) {
    f = {
      type: r.type,
      title: r.title,
      provider: r.provider ?? '',
      code: r.code ?? '',
      start: r.start ?? '',
      end: r.end ?? '',
      location: r.location ?? '',
      cost: r.cost ?? '',
      notes: r.notes ?? ''
    };
    file = null;
    editingId = r.id;
    showForm = true;
  }
  async function submit() {
    if (!f.title.trim()) return;
    saving = true;
    const existing = editingId ? reservationsStore.list.find((r) => r.id === editingId) : null;
    await saveReservation(
      {
        id: editingId ?? undefined,
        ts: existing?.ts,
        type: f.type,
        title: f.title.trim(),
        provider: f.provider.trim() || undefined,
        code: f.code.trim() || undefined,
        start: f.start || undefined,
        end: f.end || undefined,
        location: f.location.trim() || undefined,
        cost: f.cost.trim() || undefined,
        notes: f.notes.trim() || undefined,
        attachName: existing?.attachName,
        attachMime: existing?.attachMime
      },
      file
    );
    saving = false;
    showForm = false;
    resetForm();
  }
  async function remove(r: Reservation) {
    if (confirm(`Apagar a reserva "${r.title}"?`)) await deleteReservation(r.id);
  }
  async function openAttachment(r: Reservation) {
    const url = await attachmentUrl(r.id);
    if (url) window.open(url, '_blank');
  }

  const fmtDate = (s?: string) => {
    if (!s) return '';
    const d = new Date(s);
    if (isNaN(+d)) return s;
    const hasTime = s.includes('T') && !s.endsWith('T00:00');
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      ...(hasTime ? { hour: '2-digit', minute: '2-digit' } : {})
    });
  };

  const input =
    'w-full rounded-lg border border-deep/15 bg-white px-3 py-2 text-sm outline-none focus:border-teal';
</script>

<TopBar title="Minhas reservas" />

<main class="space-y-4 p-4 pb-24">
  <p class="rounded-xl bg-teal/10 px-3 py-2 text-[12px] leading-relaxed text-deep/75">
    🔒 Reserve por fora (nos links do guia) e registre aqui — voos, hotéis, AVE, ingressos.
    Fica <strong>só no seu aparelho</strong>; se você definir um PIN, tudo é guardado cifrado.
  </p>

  {#if reservationsStore.locked}
    <div class="rounded-2xl bg-white p-4 text-center text-sm text-deep/70 shadow-sm">
      🔐 Suas reservas estão protegidas por PIN. Desbloqueie o app para vê-las.
    </div>
  {/if}

  {#if reservationsStore.ready && !reservationsStore.list.length && !reservationsStore.locked}
    <div class="rounded-2xl border border-dashed border-deep/20 bg-white/60 p-6 text-center">
      <p class="text-4xl">🎫</p>
      <p class="mt-2 text-sm font-medium text-deep">Nenhuma reserva ainda.</p>
      <p class="mt-1 text-xs text-deep/60">Toque em “Nova reserva” para registrar seu primeiro voo ou hotel.</p>
    </div>
  {/if}

  <!-- Lista -->
  <div class="space-y-3">
    {#each reservationsStore.list as r (r.id)}
      <article class="rounded-2xl bg-white p-3 shadow-sm">
        <div class="flex items-start gap-3">
          <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal/12 text-xl">
            {resType(r.type).emoji}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold text-deep">{r.title}</p>
            <p class="text-xs text-deep/60">
              {resType(r.type).label}{r.provider ? ` · ${r.provider}` : ''}{r.location ? ` · ${r.location}` : ''}
            </p>
            {#if r.start || r.end}
              <p class="mt-0.5 text-xs text-deep/70">
                🗓️ {fmtDate(r.start)}{r.end ? ` → ${fmtDate(r.end)}` : ''}
              </p>
            {/if}
            <div class="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-deep/70">
              {#if r.code}<span>🔖 <span class="font-mono font-semibold">{r.code}</span></span>{/if}
              {#if r.cost}<span>💶 {r.cost}</span>{/if}
            </div>
            {#if r.notes}<p class="mt-1 text-xs italic text-deep/60">{r.notes}</p>{/if}
            <div class="mt-2 flex flex-wrap items-center gap-2">
              {#if r.attachName}
                <button
                  onclick={() => openAttachment(r)}
                  class="inline-flex items-center gap-1 rounded-full bg-forest/12 px-2.5 py-1 text-xs font-medium text-forest"
                >📎 {r.attachName}</button>
              {/if}
              <button onclick={() => openEdit(r)} class="text-xs font-medium text-teal">Editar</button>
              <button onclick={() => remove(r)} class="text-xs font-medium text-ember">Apagar</button>
            </div>
          </div>
        </div>
      </article>
    {/each}
  </div>
</main>

<!-- Botão flutuante -->
{#if !showForm}
  <button
    onclick={openNew}
    class="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full bg-teal px-5 py-3 text-sm font-bold text-white shadow-lg active:scale-95"
    style="margin-bottom: env(safe-area-inset-bottom)"
  >+ Nova reserva</button>
{/if}

<!-- Formulário (folha inferior) -->
{#if showForm}
  <div class="fixed inset-0 z-40" role="dialog" aria-modal="true">
    <button class="absolute inset-0 bg-black/40" aria-label="Fechar" onclick={() => (showForm = false)}></button>
    <div
      class="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-sand p-4 shadow-2xl"
      style="padding-bottom: calc(env(safe-area-inset-bottom) + 1rem)"
    >
      <div class="mx-auto mb-3 h-1.5 w-10 rounded-full bg-deep/15"></div>
      <h2 class="mb-3 text-lg font-bold text-deep">{editingId ? 'Editar reserva' : 'Nova reserva'}</h2>

      <div class="mb-3 flex flex-wrap gap-1.5">
        {#each RES_TYPES as t (t.id)}
          <button
            onclick={() => (f.type = t.id)}
            class="rounded-full px-3 py-1.5 text-xs font-semibold {f.type === t.id
              ? 'bg-teal text-white'
              : 'border border-deep/15 bg-white text-deep/70'}"
          >{t.emoji} {t.label}</button>
        {/each}
      </div>

      <div class="space-y-2">
        <input class={input} placeholder="Título (ex.: Iberia GRU→MAD, Gran Hotel Miramar)" bind:value={f.title} />
        <div class="grid grid-cols-2 gap-2">
          <input class={input} placeholder="Companhia / hotel / site" bind:value={f.provider} />
          <input class={input} placeholder="Localizador / código" bind:value={f.code} />
        </div>
        <label class="block text-[11px] font-semibold uppercase tracking-wide text-deep/50">Início (embarque / check-in)</label>
        <input class={input} type="datetime-local" bind:value={f.start} />
        <label class="block text-[11px] font-semibold uppercase tracking-wide text-deep/50">Fim (chegada / check-out)</label>
        <input class={input} type="datetime-local" bind:value={f.end} />
        <input class={input} placeholder="Local (cidade / aeroporto)" bind:value={f.location} />
        <input class={input} placeholder="Custo (ex.: € 1.240 · 2 pax)" bind:value={f.cost} />
        <textarea class={input} rows="2" placeholder="Observações (assento, café da manhã, política de cancelamento…)" bind:value={f.notes}></textarea>

        <label class="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-deep/25 bg-white px-3 py-2 text-sm text-deep/70">
          📎 <span class="flex-1 truncate">{file ? file.name : 'Anexar confirmação (PDF ou foto) — opcional'}</span>
          <input class="hidden" type="file" accept="application/pdf,image/*" onchange={(e) => (file = (e.target as HTMLInputElement).files?.[0] ?? null)} />
        </label>
        <p class="text-[11px] text-deep/45">O anexo fica no aparelho (cifrado com PIN). Não sobe para lugar nenhum.</p>
      </div>

      <div class="mt-4 flex gap-2">
        <button onclick={() => (showForm = false)} class="flex-1 rounded-xl border border-deep/20 py-2.5 text-sm font-semibold text-deep/70">Cancelar</button>
        <button
          onclick={submit}
          disabled={saving || !f.title.trim()}
          class="flex-1 rounded-xl bg-teal py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >{saving ? 'Salvando…' : 'Salvar'}</button>
      </div>
    </div>
  </div>
{/if}
