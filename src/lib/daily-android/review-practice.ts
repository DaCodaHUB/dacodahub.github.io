import { reviewDifficulties } from '../../data/android-challenges/review-types.ts';
export type ReviewFilter = 'all' | typeof reviewDifficulties[number];
export interface ReviewChoice { id: string; difficulty: string }
export interface ReviewPractice { version: 1; difficulty: ReviewFilter; currentId: string; seen: string[] }
export function parseReviewPractice(raw: unknown, choices: readonly ReviewChoice[]): ReviewPractice | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const state = raw as ReviewPractice;
  const ids = new Set(choices.map(c => c.id));
  if (state.version !== 1 || !['all', ...reviewDifficulties].includes(state.difficulty) || !ids.has(state.currentId) || !Array.isArray(state.seen) || new Set(state.seen).size !== state.seen.length || !state.seen.every(id => ids.has(id)) || !state.seen.includes(state.currentId)) return undefined;
  if (state.difficulty !== 'all' && !choices.some(c => c.id === state.currentId && c.difficulty === state.difficulty)) return undefined;
  return { version: 1, difficulty: state.difficulty, currentId: state.currentId, seen: [...state.seen] };
}
export function nextReview(choices: readonly ReviewChoice[], state: ReviewPractice | undefined, difficulty: ReviewFilter, currentId: string, random = Math.random): ReviewPractice {
  const pool = choices.filter(c => difficulty === 'all' || c.difficulty === difficulty);
  if (!pool.length) throw new Error('No challenges match this difficulty');
  let seen = state?.seen ?? [currentId];
  let candidates = pool.filter(c => !seen.includes(c.id));
  if (!candidates.length) {
    seen = seen.filter(id => !pool.some(c => c.id === id));
    candidates = pool.length > 1 ? pool.filter(c => c.id !== currentId) : pool;
  }
  const selected = candidates[Math.min(candidates.length - 1, Math.max(0, Math.floor(random() * candidates.length)))]!;
  return { version: 1, difficulty, currentId: selected.id, seen: [...seen, selected.id] };
}
