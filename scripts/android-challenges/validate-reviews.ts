import { reviewDifficulties } from '../../src/data/android-challenges/review-types.ts';
import type { ReviewChallenge } from '../../src/data/android-challenges/review-types.ts';

const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && !!value.trim();
export function validateReviews(input: readonly unknown[]): string[] {
  const errors: string[] = [], ids = new Set<string>(), titles = new Set<string>(), snippets = new Set<string>();
  for (const raw of input) {
    if (!object(raw)) { errors.push('Challenge must be an object'); continue; }
    const c = raw as unknown as ReviewChallenge;
    const fail = (message: string) => errors.push(`${c.id ?? 'unknown'}: ${message}`);
    if (!/^cr-\d{3}$/.test(c.id) || ids.has(c.id)) fail('invalid or duplicate ID');
    ids.add(c.id);
    if (c.type !== 'code-review' || !reviewDifficulties.includes(c.difficulty)) fail('invalid type or difficulty');
    for (const field of ['title', 'topic', 'prompt', 'tradeoffs'] as const) if (!text(c[field])) fail(`missing ${field}`);
    const title = String(c.title).toLowerCase().replace(/\W/g, '');
    if (titles.has(title)) fail('duplicate title'); titles.add(title);
    if (!Number.isInteger(c.estimatedMinutes) || c.estimatedMinutes < 1) fail('invalid duration');
    for (const field of ['snippet', 'correctedImplementation'] as const) {
      const code = c[field];
      if (!object(code) || code.language !== 'kotlin' || !text(code.code) || !text(code.context) || code.verification !== 'not-compiled' || !Array.isArray(code.dependencies) || !code.dependencies.length || !code.dependencies.every(text)) fail(`invalid ${field}`);
    }
    if (text(c.snippet?.code)) {
      const normalized = c.snippet.code.replace(/\s/g, '');
      if (snippets.has(normalized)) fail('duplicate snippet'); snippets.add(normalized);
      if (c.snippet.code === c.correctedImplementation?.code) fail('correction must address the reviewed snippet');
    }
    if (!Array.isArray(c.issues) || !c.issues.length) fail('findings required');
    else {
      if (c.difficulty === 'Easy' && c.issues.length > 2) fail('Easy challenges require one or two focused findings');
      for (const issue of c.issues) if (!object(issue) || !(['location', 'rootCause', 'consequence', 'fix'] as const).every(key => text(issue[key]))) fail('incomplete finding');
    }
    if (!Array.isArray(c.followUps) || !c.followUps.length || !c.followUps.every(text)) fail('follow-up required');
    if (!Array.isArray(c.references) || !c.references.length) fail('references required');
    else for (const reference of c.references) {
      try {
        const url = new URL(reference.url);
        if (!['developer.android.com', 'kotlinlang.org', 'reactnative.dev'].includes(url.hostname) || url.protocol !== 'https:' || url.username || url.password || !text(reference.title) || !text(reference.supports)) fail('invalid reference');
      } catch { fail('invalid reference'); }
    }
  }
  return errors;
}
export function validateActiveReviews(input: readonly unknown[]): string[] {
  const errors = validateReviews(input);
  if (input.length !== 30) errors.push('Active review bank must contain exactly 30 challenges');
  for (const [difficulty, count] of [['Easy', 14], ['Medium', 12], ['Hard', 4]] as const) {
    if (input.filter(c => object(c) && c.difficulty === difficulty).length !== count) errors.push(`Expected ${count} ${difficulty} challenges`);
  }
  return errors;
}
