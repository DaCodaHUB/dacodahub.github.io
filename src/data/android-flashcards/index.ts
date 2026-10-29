import { interviewCards } from './interview.ts';
import { flashcardMappings } from './mappings.ts';
import type { Flashcard } from './types.ts';
export const flashcards: readonly Flashcard[] = interviewCards.map(card => ({
  ...card,
  ...(flashcardMappings[card.id] ?? { gap: 'New interview scenario has no dedicated Fundamentals resource yet.' }),
}));
