import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { fileURLToPath } from 'node:url';

// The app lives at https://<site>/app/ and is built into the site's public/ folder,
// so one Netlify deploy ships both the site and the app.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/app/',
  envDir: fileURLToPath(new URL('..', import.meta.url)),
  envPrefix: ['VITE_', 'PUBLIC_'],
  plugins: [preact({ prerender: { enabled: false } })],
  build: {
    outDir: fileURLToPath(new URL('../public/app', import.meta.url)),
    emptyOutDir: true,
  },
});
