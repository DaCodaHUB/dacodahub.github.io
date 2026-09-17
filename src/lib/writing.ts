import { getCollection, type CollectionEntry } from 'astro:content';

export async function getPublishedArticles(): Promise<CollectionEntry<'writing'>[]> {
  const articles = await getCollection('writing', ({ data }) => !data.draft);
  return articles.sort((a, b) => {
    if (!a.data.publishedAt || !b.data.publishedAt) {
      throw new Error('Published articles require publishedAt');
    }
    return b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf();
  });
}

export function formatArticleDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export function readingMinutes(body: string | undefined): number | undefined {
  if (!body?.trim()) return undefined;
  const prose = body.replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]*>/g, ' ');
  const words = prose.match(/\b[\w’-]+\b/g)?.length ?? 0;
  return Math.max(1, Math.ceil(words / 220));
}
