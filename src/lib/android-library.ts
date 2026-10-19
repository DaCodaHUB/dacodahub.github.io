import type { Topic, Difficulty } from '../data/android-fundamentals/types.ts';

export interface TopicIndex { id: string; category: string; difficulty: Difficulty; text: string }
export interface LibraryFilters { query: string; category: string; difficulty: string }
export function normalizeSearch(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
export function indexTopic(topic: Topic): TopicIndex {
  return { id: topic.id, category: topic.category, difficulty: topic.difficulty,
    text: normalizeSearch([topic.title, topic.description, ...topic.concepts, ...topic.resources.map(resource => resource.title)].join(' ')) };
}
export function filterTopics(index: readonly TopicIndex[], filters: LibraryFilters): TopicIndex[] {
  const terms = normalizeSearch(filters.query).split(' ').filter(Boolean);
  return index.filter(topic => (filters.category === 'all' || topic.category === filters.category)
    && (filters.difficulty === 'all' || topic.difficulty === filters.difficulty)
    && terms.every(term => topic.text.includes(term)));
}
