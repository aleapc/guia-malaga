import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: false,
      strict: true
    }),
    paths: {
      relative: false,
      base: process.env.BASE_PATH ?? ''
    },
    prerender: {
      // As fotos chegam em ondas (geradas no Mac). Enquanto o arquivo não existe, o app cai
      // no gradiente+emoji (Photo.svelte trata o onerror). Não derrubar o build por isso.
      handleHttpError: ({ path, message }) => {
        if (path.includes('/photos/')) return;
        throw new Error(message);
      }
    }
  }
};

export default config;
