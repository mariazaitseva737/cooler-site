import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site ? site.href.replace(/\/$/, '') : '';
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /thanks/\nDisallow: /en/thanks/\n\nSitemap: ${base}/sitemap-index.xml\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
