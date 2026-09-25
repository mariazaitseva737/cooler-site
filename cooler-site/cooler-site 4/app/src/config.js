// Settings you may want to change.
// Where "Tell us what's missing" leads. A mailto: link, a Telegram link (https://t.me/yourname) or a form URL.
export const FEEDBACK_URL = 'mailto:hello@example.com?subject=Cooler%20feedback';
// Articles open on the site. Leave '' to use the same site the app is on.
export const SITE_URL = '';
export const articleUrl = (slug, lang) => `${SITE_URL}${lang === 'ru' ? '/ru' : ''}/blog/${slug}/`;
