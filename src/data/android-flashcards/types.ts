export const flashcardCategories = {
  kotlin: 'Kotlin language', coroutines: 'Coroutines and concurrency', flow: 'Flow, StateFlow, and SharedFlow',
  framework: 'Android framework and lifecycle', compose: 'Jetpack Compose', architecture: 'Architecture, data, and dependency injection',
  background: 'Background work and system behavior', engineering: 'Testing, performance, build, and security',
} as const;
export type FlashcardCategory = keyof typeof flashcardCategories;
export type FlashcardId = `fc-${string}`;
export interface FlashcardText {
  id: FlashcardId; question: string; answer: string; category: FlashcardCategory;
  followUp?: string;
  code?: { language: 'kotlin' | 'typescript'; context: string; code: string };
}
export interface FlashcardMapping {
  topicId?: string;
  /** URL is a lookup key within the existing topic, not a duplicate of resource metadata. */
  resourceUrls?: readonly string[];
  gap?: string;
}
export interface Flashcard extends FlashcardText, FlashcardMapping {}
