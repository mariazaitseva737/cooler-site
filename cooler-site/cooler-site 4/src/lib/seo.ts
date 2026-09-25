import { APP_NAME, ui, type Lang } from '../i18n/ui';
import { articlePath, realReviewer, type Article } from './articles';

export function articleJsonLd(entry: Article, site: URL) {
  const d = entry.data;
  const lang = d.lang as Lang;
  const url = new URL(articlePath(lang, d.slug), site).href;
  const org = { '@type': 'Organization', name: APP_NAME[lang], url: new URL(ui[lang].home, site).href };
  const reviewer = realReviewer(d.reviewer);
  const page: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': url,
    url,
    name: d.seoTitle,
    headline: d.title,
    description: d.description,
    inLanguage: lang,
    datePublished: d.published.toISOString().slice(0, 10),
    dateModified: (d.updated ?? d.published).toISOString().slice(0, 10),
    author: org,
    publisher: org,
    about: { '@type': 'Thing', name: d.topic },
    audience: { '@type': 'PeopleAudience', suggestedGender: 'female', suggestedMinAge: 45 },
    citation: d.sources.map((s) => s.url),
  };
  if (reviewer) {
    page.reviewedBy = { '@type': 'Person', name: reviewer };
    page.lastReviewed = (d.updated ?? d.published).toISOString().slice(0, 10);
  }
  const crumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: ui[lang].breadcrumbHome, item: new URL(ui[lang].home, site).href },
      { '@type': 'ListItem', position: 2, name: ui[lang].blogTitle, item: new URL(ui[lang].blog, site).href },
      { '@type': 'ListItem', position: 3, name: d.title, item: url },
    ],
  };
  const out: object[] = [page, crumbs];
  if (d.faq.length) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: lang,
      mainEntity: d.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  return out;
}
