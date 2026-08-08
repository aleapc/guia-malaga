// Gera um prompt de imagem (estilo pôster de viagem) para cada local e salva em
// scripts/img-prompts.json { id, city, categoryId, name, prompt }. É o pedido que vai ao Mac.
// Uso: node scripts/gen-img-prompts.mjs
import { promises as fs } from 'node:fs';

const SRC = new URL('../src/lib/contentExtra.ts', import.meta.url);
const OUT = new URL('./img-prompts.json', import.meta.url);

const cityLabel = {
  malaga: 'Málaga',
  axarquia: 'Nerja / Axarquía',
  antequera: 'Antequera',
  ronda: 'Ronda',
  marbella: 'Marbella / Costa del Sol',
  granada: 'Granada',
  cordoba: 'Córdoba'
};

// Dica de CENA por categoria temática (as de destino já são visuais pelo nome).
const hint = (cat) =>
  ({
    gastronomia: ' Mostre um prato andaluz/espanhol lindamente servido, apetitoso, num restaurante elegante.',
    praias: ' Mostre a praia mediterrânea com areia dourada, um chiringuito e o mar azul-turquesa.',
    tapas: ' Mostre tapas e uma taça de vinho sobre o balcão de azulejos, clima de taberna andaluza ao entardecer.',
    cafe: ' Mostre uma xícara de café (ou churros com chocolate) e o ambiente aconchegante do café.',
    cultura: ' Mostre a arquitetura ou o interior do museu/monumento, com luz elegante.',
    compras: ' Mostre bancas coloridas do mercado ou a rua comercial andaluza, viva e ensolarada.',
    hospedagem: ' Mostre a fachada ou o pátio elegante de um hotel-boutique andaluz, sem pessoas, luxuoso e sereno.',
    natureza: ' Cena natural marcante da Andaluzia (desfiladeiro, mar de rochas, gruta ou jardim mediterrâneo).'
  })[cat] || '';

const src = await fs.readFile(SRC, 'utf8');
const arr = JSON.parse(src.match(/export const extraAttractions[^=]*=\s*(\[[\s\S]*?\]);/)[1]);

const prompts = arr.map((a) => {
  const tag = a.tagline ? ` — ${a.tagline}` : '';
  const prompt =
    `Gere uma imagem no formato horizontal 16:9 (paisagem), estilo pôster de viagem, ` +
    `pintura digital cinematográfica, sem pessoas, sem texto e sem marca d'água: ` +
    `${a.name}, em ${cityLabel[a.city] || 'Andaluzia'}, Espanha${tag}.${hint(a.categoryId)} ` +
    `Luz mediterrânea dourada, paleta elegante e vibrante, composição limpa.`;
  return { id: a.id, city: a.city, categoryId: a.categoryId, name: a.name, prompt };
});

await fs.writeFile(OUT, JSON.stringify(prompts, null, 2) + '\n', 'utf8');
const byCat = {};
for (const p of prompts) byCat[p.categoryId] = (byCat[p.categoryId] || 0) + 1;
console.log(`OK: ${prompts.length} prompts → scripts/img-prompts.json`);
console.log('Por categoria:', JSON.stringify(byCat));
