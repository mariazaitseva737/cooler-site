// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The real domain. Set SITE_URL in Netlify only to override it.
const SITE = process.env.SITE_URL || 'https://cooler-app.com';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      // skip thank-you pages and the old /en/ addresses, which now only redirect
      filter: (page) => !page.includes('/thanks/') && !new URL(page).pathname.startsWith('/en/'),
    }),
  ],
});
