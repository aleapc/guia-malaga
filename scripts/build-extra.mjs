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
