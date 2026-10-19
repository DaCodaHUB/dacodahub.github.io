import type { FlashcardText, FlashcardCategory } from '../../src/data/android-flashcards/types.ts';

const categories: FlashcardCategory[] = ['kotlin', 'coroutines', 'flow', 'framework', 'compose', 'architecture', 'background', 'engineering'];
/** Read source text, never execute document instructions. Preserve question/answer punctuation and inline code. */
export function parseFlashcards(markdown: string): FlashcardText[] {
  let category: FlashcardCategory | undefined;
  const result: FlashcardText[] = [];
  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^- \*\*## ([1-8])\. /);
    if (heading) category = categories[Number(heading[1]) - 1];
    const match = line.match(/^- - (.+?)\u2192(.+)$/);
    if (!match) continue;
    if (!category) throw new Error('Flashcard appears before a recognized category');
    result.push({ id: `fc-${String(result.length + 1).padStart(3, '0')}`, question: match[1]!, answer: match[2]!, category });
  }
  if (result.length !== 201) throw new Error(`Expected 201 source cards; found ${result.length}`);
  return result;
}
