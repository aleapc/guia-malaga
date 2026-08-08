<script lang="ts">
  import { browser } from '$app/environment';
  import TopBar from '$lib/components/TopBar.svelte';

  function loadNum(key: string, def: number): number {
    if (!browser) return def;
    const v = Number(localStorage.getItem(key));
    return v > 0 ? v : def;
  }
  // Taxas aproximadas (edite à vontade — ficam salvas).
  let brlPerEur = $state(loadNum('gpe-rate-eur', 6.3));
  let brlPerUsd = $state(loadNum('gpe-rate-brl', 5.4));
  $effect(() => {
    if (browser) {
      localStorage.setItem('gpe-rate-eur', String(brlPerEur));
      localStorage.setItem('gpe-rate-brl', String(brlPerUsd));
    }
  });

  const fmt = (v: number, loc: string) => v.toLocaleString(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Aceita "1.000,00" (pt-BR), "1,000.00" (en-US), "1000", "10,5" etc.
  function parse(v: string): number {
    let s = String(v).trim().replace(/[^\d.,]/g, '');
    if (!s) return 0;
    const hasComma = s.includes(',');
    const hasDot = s.includes('.');
    if (hasComma && hasDot) {
      s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
    } else if (hasComma) {
      s = s.replace(',', '.');
    } else if (hasDot) {
      const parts = s.split('.');
      const thousands = parts.length > 2 || (parts.length === 2 && parts[1].length === 3 && parts[0].length <= 3);
      if (thousands) s = parts.join('');
    }
    const n = Number(s);
    return isFinite(n) ? n : 0;
  }

  let eur = $state(10); // fonte da verdade (em €)
  let eurText = $state('');
  let brlText = $state('');
  let usdText = $state('');
  let editing = $state<'eur' | 'brl' | 'usd' | null>(null);

  $effect(() => {
    const e = fmt(eur, 'de-DE');
    const b = fmt(eur * brlPerEur, 'pt-BR');
    const u = fmt((eur * brlPerEur) / brlPerUsd, 'en-US');
    if (editing !== 'eur') eurText = e;
    if (editing !== 'brl') brlText = b;
    if (editing !== 'usd') usdText = u;
  });

  function onInput(field: 'eur' | 'brl' | 'usd', raw: string) {
    editing = field;
    const v = parse(raw);
    if (field === 'eur') eur = v;
    else if (field === 'brl') eur = v / brlPerEur;
    else eur = (v * brlPerUsd) / brlPerEur;
    if (field === 'eur') eurText = raw;
    else if (field === 'brl') brlText = raw;
    else usdText = raw;
  }

  const field = 'w-full rounded-lg border border-deep/15 bg-white px-3 py-2 text-right text-lg font-semibold outline-none focus:border-teal';

  const phrases: { group: string; items: [string, string][] }[] = [
    {
      group: 'Básico',
      items: [
        ['Olá / Bom dia', 'Hola / Buenos días'],
        ['Obrigado(a)', 'Gracias'],
        ['Por favor', 'Por favor'],
        ['Desculpe / Com licença', 'Perdona / Disculpe'],
        ['Você fala inglês?', '¿Hablas inglés?'],
        ['Não entendi', 'No he entendido']
      ]
    },
    {
      group: 'No restaurante / bar',
      items: [
        ['A conta, por favor', 'La cuenta, por favor'],
        ['Estava delicioso!', '¡Estaba buenísimo!'],
        ['Um chope, por favor', 'Una caña, por favor'],
        ['Água com/sem gás', 'Agua con/sin gas'],
        ['A especialidade da casa', 'La especialidad de la casa'],
        ['Tenho reserva em nome de…', 'Tengo reserva a nombre de…']
      ]
    },
    {
      group: 'Compras & dinheiro',
      items: [
        ['Quanto custa?', '¿Cuánto cuesta?'],
        ['Aceita cartão?', '¿Se puede pagar con tarjeta?'],
        ['Em euros, por favor', 'En euros, por favor'],
        ['Só estou olhando', 'Solo estoy mirando'],
        ['Onde fica o caixa?', '¿Dónde está el cajero?']
      ]
    },
    {
      group: 'Na rua / transporte',
      items: [
        ['Onde fica…?', '¿Dónde está…?'],
        ['Quanto custa até…?', '¿Cuánto cuesta hasta…?'],
        ['À direita / à esquerda', 'A la derecha / a la izquierda'],
        ['Um táxi, por favor', 'Un taxi, por favor'],
        ['A que horas fecha?', '¿A qué hora cierra?']
      ]
    },
    {
      group: 'Emergência',
      items: [
        ['Preciso de ajuda', 'Necesito ayuda'],
        ['Chame uma ambulância', 'Llamen a una ambulancia'],
        ['Estou perdido(a)', 'Estoy perdido(a)'],
        ['Onde há uma farmácia?', '¿Dónde hay una farmacia?']
      ]
    }
  ];
</script>

<TopBar title="Bolso do viajante" />

<main class="space-y-6 p-4 pb-14">
  <!-- Conversor -->
  <section>
    <h2 class="mb-2 text-lg font-bold">💱 Conversor</h2>
    <div class="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
      <label class="flex items-center gap-2">
        <span class="w-16 text-sm font-semibold text-deep/70">🇪🇺 EUR</span>
        <input class={field} inputmode="decimal" value={eurText} oninput={(e) => onInput('eur', (e.target as HTMLInputElement).value)} onfocus={() => (editing = 'eur')} onblur={() => (editing = null)} />
      </label>
      <label class="flex items-center gap-2">
        <span class="w-16 text-sm font-semibold text-deep/70">🇧🇷 BRL</span>
        <input class={field} inputmode="decimal" value={brlText} oninput={(e) => onInput('brl', (e.target as HTMLInputElement).value)} onfocus={() => (editing = 'brl')} onblur={() => (editing = null)} />
      </label>
      <label class="flex items-center gap-2">
        <span class="w-16 text-sm font-semibold text-deep/70">🇺🇸 USD</span>
        <input class={field} inputmode="decimal" value={usdText} oninput={(e) => onInput('usd', (e.target as HTMLInputElement).value)} onfocus={() => (editing = 'usd')} onblur={() => (editing = null)} />
      </label>
      <div class="mt-2 grid grid-cols-2 gap-2 border-t border-deep/10 pt-2 text-xs text-deep/60">
        <label class="flex items-center gap-1">€1 = R$<input class="w-16 rounded border border-deep/15 px-2 py-1 text-right" inputmode="decimal" value={brlPerEur} oninput={(e) => (brlPerEur = parse((e.target as HTMLInputElement).value) || brlPerEur)} /></label>
        <label class="flex items-center gap-1">US$1 = R$<input class="w-16 rounded border border-deep/15 px-2 py-1 text-right" inputmode="decimal" value={brlPerUsd} oninput={(e) => (brlPerUsd = parse((e.target as HTMLInputElement).value) || brlPerUsd)} /></label>
      </div>
      <p class="text-[11px] text-deep/45">Taxas aproximadas e editáveis — confira a do dia antes de gastar.</p>
    </div>
  </section>

  <!-- Dicas -->
  <section>
    <h2 class="mb-2 text-lg font-bold">💡 Dinheiro & dicas</h2>
    <ul class="divide-y divide-deep/5 rounded-2xl bg-white px-4 shadow-sm">
      <li class="flex items-start gap-3 py-3">
        <span class="mt-0.5 text-lg leading-none">💶</span>
        <p class="text-sm leading-relaxed text-deep/85">A moeda é o <strong>Euro (€)</strong>. <strong>Cartão</strong> é aceito em quase tudo — bares, táxis e até bancas. Leve pouco dinheiro vivo.</p>
      </li>
      <li class="flex items-start gap-3 py-3">
        <span class="mt-0.5 text-lg leading-none">🏧</span>
        <p class="text-sm leading-relaxed text-deep/85">No cartão e no caixa, pague <strong>sempre em euros</strong> — recuse a “conversão para real” (DCC), que embute taxa. Evite caixas <strong>Euronet</strong> (laranja).</p>
      </li>
      <li class="flex items-start gap-3 py-3">
        <span class="mt-0.5 text-lg leading-none">🍽️</span>
        <p class="text-sm leading-relaxed text-deep/85"><strong>Propina</strong> (gorjeta) não é obrigatória: arredondar a conta ou ~5–10% num jantar especial já basta. Almoço 14h–16h, jantar após 21h.</p>
      </li>
      <li class="flex items-start gap-3 py-3">
        <span class="mt-0.5 text-lg leading-none">☀️</span>
        <p class="text-sm leading-relaxed text-deep/85">Julho é quente: hidrate-se, use protetor e deixe os passeios de sol para cedo ou fim de tarde. Água da torneira é <strong>potável</strong>.</p>
      </li>
    </ul>
  </section>

  <!-- Frases -->
  <section>
    <h2 class="mb-2 text-lg font-bold">🗣️ Frases úteis (espanhol)</h2>
    <div class="space-y-3">
      {#each phrases as g (g.group)}
        <div class="rounded-2xl bg-white p-3 shadow-sm">
          <p class="mb-1 text-xs font-bold uppercase tracking-wide text-teal">{g.group}</p>
          <ul class="divide-y divide-deep/5">
            {#each g.items as [pt, es] (es)}
              <li class="flex items-baseline justify-between gap-3 py-1.5">
                <span class="text-sm text-deep/60">{pt}</span>
                <span class="text-right text-sm font-semibold">{es}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  </section>
</main>
