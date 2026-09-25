// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Replace with your real domain once it is connected in Netlify.
const SITE = process.env.SITE_URL || 'https://cooler-site.netlify.app';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', ru: 'ru' } },
      // skip thank-you pages and the old /en/ addresses, which now only redirect
      filter: (page) => !page.includes('/thanks/') && !new URL(page).pathname.startsWith('/en/'),
    }),
  ],
});
