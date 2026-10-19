import type { Flashcard } from '../../data/android-flashcards/types.ts';
import { flashcardCategories } from '../../data/android-flashcards/types.ts';
import type { Topic } from '../../data/android-fundamentals/types.ts';

export function resolveFlashcardLinks(card: Flashcard, topics: readonly Topic[]) {
  const topic = topics.find(topic => topic.id === card.topicId);
  return {
    topic: topic ? { title: topic.title, href: `/android-fundamentals/#${topic.id}` } : undefined,
    resources: topic ? [...new Set(card.resourceUrls ?? [])].slice(0, 2).flatMap(url => {
      const resource = topic.resources.find(resource => resource.url === url);
      return resource ? [resource] : [];
    }) : [],
  };
}
export function validateFlashcards(cards: readonly Flashcard[], topics: readonly Topic[]): string[] {
  const errors: string[] = [], ids = new Set<string>();
  for (const card of cards) {
    if (!/^fc-\d{3}$/.test(card.id) || ids.has(card.id)) errors.push(`${card.id}: invalid/duplicate ID`);
    ids.add(card.id);
    if (!card.question.trim() || !card.answer.trim()) errors.push(`${card.id}: missing question/answer`);
    if (!Object.hasOwn(flashcardCategories, card.category)) errors.push(`${card.id}: unknown category`);
    const topic = topics.find(topic => topic.id === card.topicId);
    if (card.topicId && !topic) errors.push(`${card.id}: unknown topic ${card.topicId}`);
    if ((card.resourceUrls?.length ?? 0) > 2 || new Set(card.resourceUrls ?? []).size !== (card.resourceUrls?.length ?? 0)) errors.push(`${card.id}: too many or duplicate resources`);
    for (const url of card.resourceUrls ?? []) if (!topic?.resources.some(resource => resource.url === url)) errors.push(`${card.id}: resource not in mapped topic ${url}`);
    if (!card.topicId && !card.gap) errors.push(`${card.id}: unmapped card needs a gap explanation`);
  }
  return errors;
}
