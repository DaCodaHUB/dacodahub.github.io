import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { challengeBank } from '../../src/data/android-challenges/index.ts';
import { challengeBank as originalBank } from '../../src/data/android-challenges/legacy-bank.ts';
import { validateReviews, validateActiveReviews } from './validate-reviews.ts';
import { dailySchedule } from '../../src/data/daily-android-schedule.ts';
import { assignmentForDate, dayNumber } from '../../src/lib/daily-android/schedule.ts';
import { nextReview, parseReviewPractice } from '../../src/lib/daily-android/review-practice.ts';
import { createProgressStore, reviewProgressPrefix, progressPrefix } from '../../src/lib/daily-android/progress.ts';

const cards = challengeBank.challenges;
test('obsolete active responses are removed while review history and unrelated storage remain intact', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const history = { version: 1, updatedAt: '2026-10-19T00:00:00.000Z', completedAt: '2026-10-19T00:00:00.000Z', completionDates: ['2026-10-19'], reviewStatus: 'needs-review' };
  values.set(reviewProgressPrefix + 'cr-001', JSON.stringify({ ...history, response: 'Obsolete typed answer' }));
  const legacy = JSON.stringify({ ...history, response: 'Archived legacy record' });
  values.set(progressPrefix + 'challenge:acr-001', legacy);
  values.set('daily-android:neetcode:v1:problem:subsets', 'completed');
  values.set('daily-android:mobile-system-design:v1:msd-001', 'untouched');
  const store = createProgressStore(() => storage);
  assert.deepEqual(store.challenge('cr-001'), history);
  assert.deepEqual(JSON.parse(values.get(reviewProgressPrefix + 'cr-001')!), history);
  assert.equal(values.get(progressPrefix + 'challenge:acr-001'), legacy);
  assert.equal(values.get('daily-android:neetcode:v1:problem:subsets'), 'completed');
  assert.equal(values.get('daily-android:mobile-system-design:v1:msd-001'), 'untouched');
  store.complete('cr-001');
  const reloaded = createProgressStore(() => storage);
  assert.equal(reloaded.challenge('cr-001')!.reviewStatus, 'completed');
  assert.ok(!Object.hasOwn(JSON.parse(values.get(reviewProgressPrefix + 'cr-001')!), 'response'));
});
test('active bank has exactly 30 distinct complete code reviews with the requested difficulty distribution', () => {
  assert.equal(cards.length, 30);
  assert.deepEqual(validateActiveReviews(cards), []);
  assert.ok(cards.every(c => c.type === 'code-review'));
  const replacements: Record<string, string> = { 'cr-026': 'cr-031', 'cr-027': 'cr-032', 'cr-029': 'cr-033', 'cr-030': 'cr-034' };
  assert.deepEqual(cards.map(c => c.id), Array.from({ length: 30 }, (_, i) => {
    const id = `cr-${String(i + 1).padStart(3, '0')}`; return replacements[id] ?? id;
  }));
  assert.ok(cards.filter(c => c.difficulty === 'Easy').every(c => c.issues.length <= 2));
  assert.ok(cards.filter(c => c.difficulty !== 'Easy').every(c => c.issues.length >= 2));
  for (const card of cards) {
    assert.ok(card.followUps.length && card.tradeoffs.length);
    for (const code of [card.snippet, card.correctedImplementation]) {
      assert.equal(code.language, 'kotlin'); assert.equal(code.verification, 'not-compiled');
      assert.ok(code.context && code.dependencies.length);
      assert.ok(code.code.split('\n').length <= 25, `${card.id}: keep examples focused`);
    }
  }
});

test('all 80 original challenges are preserved verbatim in an independent archive', async () => {
  const archive = JSON.parse(await readFile(new URL('../../src/data/android-challenges/legacy-archive.json', import.meta.url), 'utf8'));
  const additions = JSON.parse(await readFile(new URL('../../src/data/android-challenges/imports/2026-10-19-reviewed.json', import.meta.url), 'utf8'));
  assert.equal(archive.count, 80);
  assert.deepEqual(archive.challenges, [...originalBank.challenges, ...additions]);
  assert.equal(archive.sha256, createHash('sha256').update(JSON.stringify(archive.challenges)).digest('hex'));
  assert.equal(new Set(archive.challenges.map((c: { id: string }) => c.id)).size, 80);
  const active = new Set(cards.map(c => c.id));
  assert.ok(archive.challenges.every((c: { id: string }) => !active.has(c.id)));
});

test('daily rotation uses all reviews once, while flashcard epochs remain unchanged', async () => {
  const previous = JSON.parse(await readFile(new URL('../daily-android/archive/pre-code-review-schedule.json', import.meta.url), 'utf8'));
  assert.deepEqual(dailySchedule.flashcards, previous.flashcards);
  const start = dayNumber(dailySchedule.challenges[0].effectiveFrom);
  const idAt = (offset: number) => assignmentForDate(new Date((start + offset) * 86_400_000).toISOString().slice(0, 10), dailySchedule)!.challengeId;
  assert.deepEqual(new Set(Array.from({ length: 30 }, (_, n) => idAt(n))), new Set(cards.map(c => c.id)));
  assert.equal(idAt(30), idAt(0));
});

test('random practice exhausts each difficulty before repetition and can repeat indefinitely', () => {
  for (const difficulty of ['Easy', 'Medium', 'Hard', 'all'] as const) {
    const pool = cards.filter(c => difficulty === 'all' || c.difficulty === difficulty);
    let state = undefined as ReturnType<typeof nextReview> | undefined;
    let current = cards[0]!.id;
    const seen = new Set(difficulty === 'Easy' || difficulty === 'all' ? [current] : []);
    for (let n = seen.size; n < pool.length; n++) {
      state = nextReview(cards, state, difficulty, current, () => 0);
      assert.ok(!seen.has(state.currentId)); seen.add(state.currentId);
      assert.ok(pool.some(c => c.id === state!.currentId));
      assert.deepEqual(parseReviewPractice(state, cards), state);
      current = state.currentId;
    }
    assert.equal(seen.size, pool.length);
    for (let n = 0; n < pool.length * 3; n++) {
      const next = nextReview(cards, state, difficulty, current, () => 0.5);
      assert.notEqual(next.currentId, current);
      state = next; current = next.currentId;
    }
  }
});

test('review status and practice cursor survive refresh without reusing legacy progress', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const legacy = JSON.stringify({ version: 1, updatedAt: '2026-10-19T00:00:00.000Z', completionDates: ['2026-10-19'], completedAt: '2026-10-19T00:00:00.000Z' });
  values.set(progressPrefix + 'challenge:acr-001', legacy);
  const store = createProgressStore(() => storage);
  assert.equal(store.challenge('cr-001'), undefined);
  store.complete('cr-001'); store.needsReview('cr-001');
  const practice = nextReview(cards, undefined, 'Hard', 'cr-001', () => 0);
  store.saveReviewPractice(practice);
  const reloaded = createProgressStore(() => storage);
  assert.deepEqual(reloaded.reviewPractice(cards), practice);
  assert.equal(reloaded.challenge('cr-001')!.reviewStatus, 'needs-review');
  assert.ok(reloaded.challenge('cr-001')!.completedAt);
  reloaded.complete('cr-001');
  assert.equal(reloaded.challenge('cr-001')!.reviewStatus, 'completed');
  assert.ok(values.has(reviewProgressPrefix + 'cr-001'));
  assert.equal(values.get(progressPrefix + 'challenge:acr-001'), legacy);
});

test('malformed content, unsupported difficulty, duplicate IDs, and obsolete practice records are rejected', () => {
  for (const change of [{ difficulty: 'Junior' }, { tradeoffs: '' }, { snippet: { code: 42 } }, { issues: [] }, { followUps: [] }, { correctedImplementation: cards[0]!.snippet }]) {
    assert.ok(validateReviews([{ ...cards[0], ...change }]).length);
  }
  assert.ok(validateReviews([cards[0], cards[0]]).some(e => e.includes('duplicate')));
  assert.ok(validateActiveReviews(cards.slice(1)).length);
  for (const raw of [{}, null, { version: 1, difficulty: 'Easy', currentId: 'acr-001', seen: ['acr-001'] }, { version: 1, difficulty: 'Hard', currentId: 'cr-001', seen: ['cr-001'] }]) assert.equal(parseReviewPractice(raw, cards), undefined);
});

test('active challenge dependency graph never loads the archive or deleted documentation', async () => {
  const visited = new Set<string>();
  async function inspect(url: URL) {
    if (visited.has(url.href)) return;
    visited.add(url.href);
    assert.doesNotMatch(url.pathname, /legacy|archive|\/docs\//);
    const source = await readFile(url, 'utf8');
    for (const match of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) if (match[1]!.startsWith('.')) await inspect(new URL(match[1]!, url));
  }
  await inspect(new URL('../../src/data/android-challenges/index.ts', import.meta.url));
});
