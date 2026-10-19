import type { BaseChallenge, CodeSample, RubricItem } from './types.ts';

export function source(cards: number[], libraryTopicIds: string[], additions: string): BaseChallenge['provenance'] {
  return { source: 'android-kotlin-flashcards', cardIds: cards.map(n => `fc-${String(n).padStart(3, '0')}`), libraryTopicIds, additions };
}
export function kotlin(context: string, code: string, dependencies: string[] = ['Kotlin standard library']): CodeSample {
  return { language: 'kotlin', context, code: code.trim(), dependencies, verification: 'not-compiled' };
}
export function rubric(...items: [criterion: string, evidence: string][]): RubricItem[] {
  return items.map(([criterion, evidence]) => ({ criterion, evidence, points: 2 }));
}
