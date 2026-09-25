import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    lang: z.enum(['ru', 'en']),
    // Same key in the RU and EN file = translations of each other (used for hreflang and the language switch)
    translationKey: z.string(),
    slug: z.string(),
    title: z.string(),
    // SEO: up to ~60 characters, shown in the browser tab and in Google
    seoTitle: z.string(),
    // SEO: 120–160 characters, the snippet under the title in Google
    description: z.string(),
    // SEO: the main search phrase this article targets (for the editor, not printed on the page)
    focusKeyword: z.string().optional(),
    topic: z.string(),
    readingTime: z.string(),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    reviewer: z.string().optional(),
    lead: z.string(),
    summary: z.array(z.string()),
    terms: z.array(z.object({ term: z.string(), translation: z.string() })).default([]),
    today: z.string(),
    flag: z.string().optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    sources: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
  }),
});

export const collections = { articles };
