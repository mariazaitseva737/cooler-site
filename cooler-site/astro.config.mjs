// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Replace with your real domain once it is connected in Netlify.
const SITE = process.env.SITE_URL || 'https://cooler-app.netlify.app';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'ru', locales: { ru: 'ru', en: 'en' } },
      filter: (page) => !page.includes('/thanks/'),
    }),
  ],
});
