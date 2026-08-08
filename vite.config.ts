import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

const base = process.env.BASE_PATH ?? '';

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      strategies: 'generateSW',
      manifest: {
        name: 'Guia Málaga',
        short_name: 'Málaga',
        description: 'Guia de viagem offline · Málaga & sul da Espanha',
        lang: 'pt-BR',
        theme_color: '#0E7CA0',
        background_color: '#0E7CA0',
        display: 'standalone',
        orientation: 'portrait',
        start_url: `${base}/`,
        scope: `${base}/`,
        id: `${base}/`,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Precache the app shell, prerendered pages AND the bundled photos → full offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,jpg,jpeg,woff2,json,txt}'],
        navigateFallback: `${base}/`,
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // New SW takes over immediately so updates land without a second tap.
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Open-Meteo: network-first so the forecast refreshes online, last copy kept offline.
            urlPattern: ({ url }) => url.origin === 'https://api.open-meteo.com',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'open-meteo',
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: { enabled: false }
    })
  ]
});
