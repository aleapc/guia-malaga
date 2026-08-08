# Guia Uruguai 🇺🇾

PWA de viagem **offline** para Alê & Andréia — base em **Montevidéu** (Punta Carretas) com escapadas a Carmelo, Colonia, Punta del Este e José Ignacio. Réveillon 2026 → 2027.

Espelha o [Guia Puerto Varas](https://aleapc.github.io/guia-puerto-varas/): SvelteKit 2 + Svelte 5 + adapter-static + Tailwind + `@vite-pwa/sveltekit`.

## Rodar local
```bash
npm install
npm run dev      # http://localhost:5173
```

## Deploy (GitHub Pages)
```powershell
.\deploy.ps1     # build com BASE_PATH=/guia-uruguai e push para a branch gh-pages
```
Publica em `https://aleapc.github.io/guia-uruguai/`.

## Estrutura
- `src/lib/content.ts` — categorias e locais do guia (âncoras iniciais; catálogo completo entra na fase de pesquisa).
- `src/lib/contentExtra.ts` — locais extras auto-gerados (vazio por enquanto; `scripts/gen-extra.mjs` + `scripts/data/*.json`).
- `src/lib/plan.ts` / `alerts.ts` — motor clima↔passeio (“Sugestão de hoje” e alertas).
- `src/lib/usefulInfo.ts` — emergências e infos úteis (911).
- `src/routes/viagem/` — voos/hospedagem, lidos de um **pacote cifrado** (`static/trip-seed.txt`, AES-256-GCM). Dados reais nunca ficam em claro no repo.

## Privacidade
O repositório é **público**. Voos, endereços e reservas só entram cifrados no `trip-seed.txt`, decifrados no aparelho com a senha compartilhada (página *Nossa viagem*). Namespace de armazenamento próprio (`gur-*`) para não colidir com o guia de Puerto Varas no mesmo domínio.

## Status
Casca técnica pronta (identidade, datas, base Montevidéu, categorias do roteiro, /bolso em UYU, /úteis, ~20 locais-âncora). **A fazer:** catálogo completo por região com fotos e fontes; seed cifrado dos voos; ajuste fino de coordenadas/horários.
