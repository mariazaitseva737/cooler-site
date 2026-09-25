import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

export type Article = CollectionEntry<'articles'>;

export async function getArticles(lang: Lang): Promise<Article[]> {
  const all = await getCollection('articles', ({ data }) => data.lang === lang && !data.draft);
  return all.sort((a, b) => Number(b.data.featured) - Number(a.data.featured) || +b.data.published - +a.data.published);
}

export async function getTranslation(entry: Article): Promise<Article | undefined> {
  const other: Lang = entry.data.lang === 'ru' ? 'en' : 'ru';
  const list = await getCollection('articles', ({ data }) => data.lang === other && !data.draft);
  return list.find((e) => e.data.translationKey === entry.data.translationKey);
}

export const articlePath = (lang: Lang, slug: string) => (lang === 'ru' ? `/ru/blog/${slug}/` : `/blog/${slug}/`);

// Reviewer placeholders like "[ИМЯ ВРАЧА]" are hidden on the live site until a real name is filled in.
export const realReviewer = (r?: string) => (r && !r.trim().startsWith('[') ? r : undefined);
