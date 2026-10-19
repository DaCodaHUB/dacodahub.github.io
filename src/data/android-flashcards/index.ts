import { flashcardText } from './source.ts';
import { flashcardMappings } from './mappings.ts';
import type { Flashcard } from './types.ts';
export const flashcards: readonly Flashcard[] = flashcardText.map(card => ({ ...card, ...flashcardMappings[card.id] }));
