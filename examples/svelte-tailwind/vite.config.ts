import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import sveltePreprocess from 'svelte-preprocess';

export default defineConfig({
  plugins: [svelte({ preprocess: sveltePreprocess() }), tailwindcss()],
  server: { port: 3000, open: true },
  build: { outDir: 'dist', sourcemap: true },
  optimizeDeps: {
    exclude: ['@embedpdf/engines'],
  },
});
