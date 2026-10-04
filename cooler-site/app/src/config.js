// Settings you may want to change.
// Where "Tell us what's missing" leads. A mailto: link, a Telegram link (https://t.me/yourname) or a form URL.
export const FEEDBACK_URL = 'mailto:hello@cooler-app.com?subject=Cooler%20feedback';
// Russian is switched off while the app is tested in the US. Set to true to bring the RU version and language switch back.
export const RU_ENABLED = false;
// Articles open on the site. Leave '' to use the same site the app is on.
export const SITE_URL = '';
export const articleUrl = (slug, lang) => `${SITE_URL}${lang === 'ru' ? '/ru' : ''}/blog/${slug}/`;
