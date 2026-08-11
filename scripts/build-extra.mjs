// Gera src/lib/contentExtra.ts a partir de scripts/data/*.json (saída dos pesquisadores).
// Dedup por id/nome; limpa &amp; → &; confia no campo `city` de cada item (as zonas da
// Andaluzia), com fallback para o categoryId quando o item é de uma categoria-destino.
// Uso: node scripts/build-extra.mjs
import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data');
const CONTENT = path.join(ROOT, 'src', 'lib', 'content.ts');
const OUT = path.join(ROOT, 'src', 'lib', 'contentExtra.ts');

const EXCLUDE_IDS = new Set();
const VALID_FIT = new Set(['CLEAR_SKY', 'RAIN_OK', 'INDOOR', 'ANY']);
// Zonas/bases da viagem (ids batem com as categorias-destino).
const CITIES = ['malaga', 'axarquia', 'antequera', 'ronda', 'marbella', 'granada', 'cordoba', 'sevilla', 'cadiz', 'gibraltar'];
const DEST_CATS = new Set(CITIES);
const VALID_CITY = new Set(CITIES);

const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const deamp = (s) => (typeof s === 'string' ? s.replace(/&amp;/g, '&') : s);
function deepDeamp(o) {
  if (Array.isArray(o)) return o.map(deepDeamp);
  if (o && typeof o === 'object') { const r = {}; for (const k in o) r[k] = deepDeamp(o[k]); return r; }
  return deamp(o);
}

// ─── Normalização de formato ────────────────────────────────────────────────
// Os pesquisadores às vezes entregam texto onde o tipo pede lista/número
// (whatToDo: "frase", openDays: "Ter–Dom", openHour: "08:00"). Sem isto o app
// itera a string caractere a caractere e marca o local como fechado todo dia.
const DAY_NUM = { seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6, dom: 7 };
const DAY_RE = /(segunda|terca|quarta|quinta|sexta|sabado|domingo|seg|ter|qua|qui|sex|sab|dom)/g;

function toList(v) {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === 'string' && v.trim()) {
    return v.split(';').map((s) => s.trim().replace(/[;.]$/, '')).filter(Boolean);
  }
  return undefined;
}

/** "Ter–Dom" → [2,3,4,5,6,7]. Devolve undefined para "todos os dias" ou texto indecifrável. */
function toDays(v) {
  if (Array.isArray(v)) {
    const n = v.map(Number).filter((d) => Number.isInteger(d) && d >= 1 && d <= 7);
    return n.length ? n : undefined;
  }
  if (typeof v !== 'string') return undefined;
  const t = norm(v);
  if (!t || /todos os dias|diariamente|todo dia|seg a dom|segunda a domingo/.test(t)) return undefined;
  const head = t.split(/[;(]/)[0];
  const days = new Set();
  let prev = null, lastEnd = 0, m;
  DAY_RE.lastIndex = 0;
  while ((m = DAY_RE.exec(head))) {
    const d = DAY_NUM[m[1].slice(0, 3)];
    const gap = head.slice(lastEnd, m.index);
    if (prev && /[-–—]|\ba\b|\bate\b/.test(gap)) {
      for (let i = prev; i !== d; i = (i % 7) + 1) days.add(i);
    }
    days.add(d);
    prev = d; lastEnd = m.index + m[1].length;
  }
  if (!days.size || days.size === 7) return undefined;
  return [...days].sort((a, b) => a - b);
}

/** "08:00" | "8h" | 8 → 8. */
function toHour(v) {
  if (typeof v === 'number') return Number.isInteger(v) && v >= 0 && v <= 24 ? v : undefined;
  if (typeof v !== 'string') return undefined;
  const m = v.match(/\d{1,2}/);
  if (!m) return undefined;
  const h = Number(m[0]);
  return h >= 0 && h <= 24 ? h : undefined;
}

const normalized = [];
function normalizeShape(it) {
  const fixes = [];
  for (const k of ['whatToDo', 'whatToBring', 'whatToWear']) {
    if (typeof it[k] === 'string') { it[k] = toList(it[k]); fixes.push(k); }
  }
  // Alguns itens trazem `hours` como frase solta em vez do objeto.
  if (typeof it.hours === 'string') {
    const txt = it.hours.trim();
    it.hours = txt ? { note: txt, ...(toDays(txt) ? { openDays: toDays(txt) } : {}) } : undefined;
    if (!it.hours) delete it.hours;
    fixes.push('hours(texto)');
  }
  if (it.hours) {
    const h = it.hours;
    if (h.openDays !== undefined && !Array.isArray(h.openDays)) {
      // O texto original é informação útil: preserva na nota antes de converter.
      if (typeof h.openDays === 'string' && !String(h.note || '').includes(h.openDays)) {
        h.note = [h.openDays, h.note].filter(Boolean).join(' · ');
      }
      h.openDays = toDays(h.openDays);
      if (h.openDays === undefined) delete h.openDays;
      fixes.push('openDays');
    }
    for (const k of ['openHour', 'closeHour']) {
      if (h[k] !== undefined && typeof h[k] !== 'number') {
        const n = toHour(h[k]);
        if (n === undefined) delete h[k]; else h[k] = n;
        fixes.push(k);
      }
    }
    if (!Object.keys(h).length) delete it.hours;
  }
  if (fixes.length) normalized.push(`${it.id}: ${fixes.join(', ')}`);
  return it;
}

const fellBackCity = [];
// Zona de um local: confia no campo `city` do item; se for categoria-destino, usa o categoryId;
// caso contrário deduz por palavra-chave do mapQuery/nome (fallback só de segurança).
function cityOf(it) {
  if (it.city && VALID_CITY.has(it.city)) return it.city;
  if (DEST_CATS.has(it.categoryId)) return it.categoryId;
  const q = `${it.mapQuery || ''} ${it.name || ''}`.toLowerCase();
  if (/granada|alhambra|albaic|sacromonte|generalife/.test(q)) return 'granada';
  if (/c[oó]rdoba|mezquita|juder|calahorra/.test(q)) return 'cordoba';
  if (/ronda|setenil|serran[ií]a|tajo/.test(q)) return 'ronda';
  if (/marbella|ban[uú]s|puerto ban|mijas|milla de oro|fuengirola|estepona/.test(q)) return 'marbella';
  if (/nerja|frigiliana|maro|axarqu[ií]a|torrox|c[oó]mpeta|burriana/.test(q)) return 'axarquia';
  if (/antequera|torcal|caminito|el chorro|d[oó]lmen/.test(q)) return 'antequera';
  if (/sevilla|giralda|triana|alc[aá]zar de sevilla|plaza de espa/.test(q)) return 'sevilla';
  if (/c[aá]diz|jerez|tarifa|vejer|bolonia|sanl[uú]car|el puerto/.test(q)) return 'cadiz';
  if (/gibraltar|the rock|pe[nñ][oó]n|europa point|main street/.test(q)) return 'gibraltar';
  fellBackCity.push(`${it.categoryId}/${it.name} → malaga (sem city; fallback)`);
  return 'malaga';
}

const content = await fs.readFile(CONTENT, 'utf8');
const anchorNames = new Set([...content.matchAll(/name: '((?:[^'\\]|\\')*)'/g)].map((m) => norm(m[1].replace(/\\'/g, "'"))));
const anchorIds = new Set([...content.matchAll(/\bid: '([^']+)'/g)].map((m) => m[1]));

let files = [];
try { files = (await fs.readdir(DATA_DIR)).filter((f) => f.endsWith('.json')).sort(); } catch {}
if (!files.length) { console.error('Nenhum arquivo em scripts/data/*.json'); process.exit(1); }

const all = [];
for (const f of files) {
  let arr;
  try { arr = JSON.parse(await fs.readFile(path.join(DATA_DIR, f), 'utf8')); }
  catch (e) { console.error(`ERRO ao ler ${f}: ${e.message}`); process.exit(1); }
  for (const it of (Array.isArray(arr) ? arr : [])) all.push(it);
}

const seenId = new Set(), seenName = new Set(), out = [], dropped = [];
for (let it of all) {
  it = deepDeamp(it);
  if (!it.id || !it.name) { dropped.push(`${it.name || '?'} (sem id/name)`); continue; }
  if (EXCLUDE_IDS.has(it.id)) { dropped.push(`${it.name} (excluído)`); continue; }
  if (anchorIds.has(it.id) || anchorNames.has(norm(it.name))) { dropped.push(`${it.name} (dup âncora)`); continue; }
  if (seenId.has(it.id) || seenName.has(norm(it.name))) { dropped.push(`${it.name} (dup)`); continue; }
  seenId.add(it.id); seenName.add(norm(it.name));
  if (!VALID_FIT.has(it.fit)) it.fit = 'ANY';
  it = normalizeShape(it);
  // Viagem multi-zona: não exibimos "km da base".
  delete it.distanceKm;
  delete it.driveMinutes;
  it.city = cityOf(it);
  // Foto própria por local: se existir static/photos/<id>.jpg, liga automaticamente.
  if (existsSync(path.join(ROOT, 'static', 'photos', `${it.id}.jpg`))) it.image = `${it.id}.jpg`;
  out.push(it);
}

const counts = {};
for (const a of out) counts[a.categoryId] = (counts[a.categoryId] || 0) + 1;
const header = `// AUTO-GERADO por scripts/build-extra.mjs — não editar à mão.\n// ${out.length} locais (pesquisa por zona). Fonte: scripts/data/*.json\nimport type { Attraction, LinkRef } from './content';\n\n`;
const body = `export const extraAttractions: Attraction[] = ${JSON.stringify(out, null, 2)};\n\nexport const linksByName: Record<string, LinkRef[]> = {};\n`;
await fs.writeFile(OUT, header + body, 'utf8');
console.log('Escrito', path.relative(ROOT, OUT), '—', out.length, 'locais');
console.log('Por categoria:', counts);
// Matriz categoria × zona.
const cityCounts = {};
for (const a of out) {
  cityCounts[a.categoryId] = cityCounts[a.categoryId] || Object.fromEntries(CITIES.map((c) => [c, 0]));
  cityCounts[a.categoryId][a.city] = (cityCounts[a.categoryId][a.city] || 0) + 1;
}
console.log('Por zona:');
for (const [cat, cc] of Object.entries(cityCounts)) {
  console.log(`  ${cat.padEnd(12)} ` + CITIES.map((c) => `${c[0].toUpperCase()}${c.slice(1, 3)} ${cc[c]}`).join('  '));
}
if (fellBackCity.length) console.log('Zona por FALLBACK (conferir):\n  ' + fellBackCity.join('\n  '));
else console.log('Zona: todos vieram com city explícito.');
if (dropped.length) console.log('Removidos:', dropped.join('; '));
console.log('Formato normalizado em', normalized.length, 'locais');
