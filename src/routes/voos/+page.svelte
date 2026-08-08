<script lang="ts">
  import { base } from '$app/paths';
  import TopBar from '$lib/components/TopBar.svelte';

  // Viagem: São Paulo → Málaga (AGP), 1 a 10 de julho de 2027. NÃO há voo direto do Brasil;
  // as boas conexões são por um hub europeu. Preços variam muito — aqui só CURADORIA + busca AO VIVO.
  const DEP = '2027-07-01';
  const RET = '2027-07-10';
  const yymmdd = (iso: string) => iso.slice(2).replace(/-/g, ''); // 2027-07-01 → 270701

  // Motores de busca (abrem já com a rota e as datas preenchidas).
  const google = (o: string, d: string) =>
    `https://www.google.com/travel/flights?q=${encodeURIComponent(`voos ${o} para ${d} ${DEP} volta ${RET}`)}`;
  const sky = (o: string, d: string) =>
    `https://www.skyscanner.com.br/transporte/voos/${o.toLowerCase()}/${d.toLowerCase()}/${yymmdd(DEP)}/${yymmdd(RET)}/`;
  const kayak = (o: string, d: string) =>
    `https://www.kayak.com.br/flights/${o}-${d}/${DEP}/${RET}`;

  const origins = [
    { code: 'GRU', label: 'São Paulo (GRU)' },
    { code: 'GIG', label: 'Rio (GIG)' }
  ];
  let origin = $state('GRU');

  const hubs = [
    {
      code: 'MAD',
      hub: 'Madri',
      airline: 'Iberia / LATAM',
      emoji: '🇪🇸',
      note: 'A conexão mais natural: voo noturno ao hub e ponte-aérea curtinha (~1h) até Málaga. Menos tempo total.'
    },
    {
      code: 'LIS',
      hub: 'Lisboa',
      airline: 'TAP Portugal',
      emoji: '🇵🇹',
      note: 'Cômoda para brasileiro (tudo em português) e boa malha para AGP. Ótima opção de executiva com bom preço.'
    },
    {
      code: 'CDG',
      hub: 'Paris',
      airline: 'Air France',
      emoji: '🇫🇷',
      note: 'Alternativa premium; bons horários e a chance de um stopover charmoso na volta.'
    },
    {
      code: 'FRA',
      hub: 'Frankfurt / Munique',
      airline: 'Lufthansa',
      emoji: '🇩🇪',
      note: 'Rede densa e pontual; executiva confortável no longo curso e conexão eficiente até Málaga.'
    }
  ];

  const btn = 'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold active:scale-95';
</script>

<TopBar title="Voos" />

<main class="space-y-5 p-4 pb-16">
  <section class="rounded-2xl bg-gradient-to-br from-teal to-deep p-4 text-white shadow">
    <p class="text-xs font-semibold uppercase tracking-wide text-white/70">Brasil → Málaga · 1–10 jul 2027</p>
    <h2 class="mt-1 text-xl font-bold leading-tight">Não há voo direto — a graça está no hub certo</h2>
    <p class="mt-1 text-sm text-white/85">
      O destino é o aeroporto de <strong>Málaga (AGP)</strong>, a ~15 min do centro. Do Brasil, você conecta
      num hub europeu. Escolha a origem e abra a busca ao vivo — os preços são estimativas e mudam a cada hora.
    </p>
  </section>

  <!-- Origem -->
  <div class="flex items-center gap-2">
    <span class="text-sm font-semibold text-deep/70">Saindo de:</span>
    {#each origins as o (o.code)}
      <button
        onclick={() => (origin = o.code)}
        class="rounded-full px-3 py-1.5 text-sm font-semibold {origin === o.code
          ? 'bg-teal text-white'
          : 'border border-deep/15 bg-white text-deep/70'}"
      >{o.label}</button>
    {/each}
  </div>

  <!-- Opções por hub -->
  <section class="space-y-3">
    <p class="text-xs font-semibold uppercase tracking-wide text-deep/50">Conexões recomendadas</p>
    {#each hubs as h (h.code)}
      <article class="rounded-2xl bg-white p-4 shadow-sm">
        <div class="flex items-baseline justify-between">
          <p class="font-bold text-deep">{h.emoji} via {h.hub} <span class="text-xs font-normal text-deep/50">({h.code})</span></p>
          <span class="text-xs font-semibold text-teal">{h.airline}</span>
        </div>
        <p class="mt-1 text-sm text-deep/75">{h.note}</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <a href={google(origin, 'AGP')} target="_blank" rel="noopener" class="{btn} bg-teal text-white">🔎 Google Flights</a>
          <a href={sky(origin, 'AGP')} target="_blank" rel="noopener" class="{btn} bg-deep/8 text-deep">Skyscanner</a>
          <a href={kayak(origin, 'AGP')} target="_blank" rel="noopener" class="{btn} bg-deep/8 text-deep">Kayak</a>
        </div>
      </article>
    {/each}
    <p class="px-1 text-[11px] text-deep/45">
      As buscas abrem para {origin}→AGP nas datas 01→10 jul. Para comparar o hub isolado, troque o destino para MAD/LIS na
      própria busca. Filtre por <strong>Executiva</strong> se quiser a experiência premium.
    </p>
  </section>

  <!-- Dicas premium -->
  <section class="rounded-2xl bg-white p-4 shadow-sm">
    <h3 class="mb-2 font-bold text-deep">✨ Dicas premium</h3>
    <ul class="space-y-2 text-sm text-deep/80">
      <li>💺 <strong>Executiva no longo curso</strong> (o trecho ao hub) rende mais que na perna curta — durma no oceano e chegue inteiro.</li>
      <li>🕑 Prefira <strong>chegar a Málaga de dia</strong>: o check-in premium e a primeira tarde de praia valem o horário.</li>
      <li>🧳 Conexão em <strong>Madri/Lisboa</strong> costuma ter bagagem passada até AGP — confirme no balcão.</li>
      <li>🚗 De AGP ao hotel: <strong>transfer privativo</strong> ou o trem C1 até o centro em ~12 min.</li>
      <li>💶 Reservar com <strong>3–5 meses</strong> de antecedência (é alta temporada) tende a pegar as melhores tarifas.</li>
    </ul>
  </section>

  <!-- CTA registrar -->
  <a
    href="{base}/reservas"
    class="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-teal/50 py-3 text-sm font-semibold text-teal"
  >🎫 Fechou o voo? Registre em “Minhas reservas”</a>

  <p class="text-center text-[11px] text-deep/40">
    Preços e disponibilidade não são cotados aqui — os botões abrem a busca ao vivo. Confira sempre a tarifa do momento.
  </p>
</main>
