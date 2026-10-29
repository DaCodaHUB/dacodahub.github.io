import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { flashcards } from '../../src/data/android-flashcards/index.ts';
import { flashcardSource, flashcardText } from '../../src/data/android-flashcards/android-flashcards-archive.ts';
import { flashcardCategories } from '../../src/data/android-flashcards/types.ts';
import { curriculumSource, curriculumCards } from '../../src/data/android-challenges/curriculum.ts';
import { topics } from '../../src/data/android-fundamentals/topics.ts';
import { challengeBank } from '../../src/data/android-challenges/index.ts';
import { dailySchedule } from '../../src/data/daily-android-schedule.ts';
import { assignmentForDate, dayNumber, dailyDay, nextDailyReset, utcDay, nextUtcMidnight, validateSchedule, validatePublishedEpochs } from '../../src/lib/daily-android/schedule.ts';
import type { DailySchedule } from '../../src/lib/daily-android/schedule.ts';
import { resolveFlashcardLinks, validateFlashcards } from '../../src/lib/daily-android/resources.ts';
import { createProgressStore, flashcardProgressPrefix, parseChallengeProgress, parseFlashcardProgress } from '../../src/lib/daily-android/progress.ts';
import { createChallengeCatalog } from './catalog.ts';
import { parseFlashcards } from './parse-flashcards.ts';

const flashIds = new Set(flashcards.map(c => c.id));
const importDirectory = new URL('../../src/data/android-challenges/imports/', import.meta.url);
const importedBanks = await Promise.all((await readdir(importDirectory)).filter(name => name.endsWith('.json')).map(async name => JSON.parse(await readFile(new URL(name, importDirectory), 'utf8'))));
const challengeIds = new Set(createChallengeCatalog(importedBanks).map(c => c.id));
const baselineSchedule: DailySchedule = { schemaVersion: 1, flashcards: [dailySchedule.flashcards[0]], challenges: [dailySchedule.challenges[0]] };
const plusDays = (start: string, days: number) => new Date((dayNumber(start) + days) * 86_400_000).toISOString().slice(0, 10);

test('archive retains its original fingerprint and the daily pool uses only active identities', () => {
  assert.equal(flashcardText.length, 201);
  assert.equal(flashcards.length, 73);
  assert.equal(flashcardSource.sourceSha256, curriculumSource.sha256);
  assert.equal(createHash('sha256').update(JSON.stringify(flashcardText)).digest('hex'), flashcardSource.cardsSha256);
  assert.deepEqual(flashcardText.map(c => c.id), curriculumCards.map(c => c.id));
  assert.deepEqual(new Set(dailySchedule.flashcards[0].ids), new Set(flashcards.map(c => c.id)));
  assert.equal(flashcardText[0]!.question, 'What is the difference between `val` and `var`?');
  assert.ok(flashcards.every(c => c.followUp));
  assert.equal(new Set(flashcards.map(c => c.category)).size, 8);
  assert.deepEqual(validateFlashcards(flashcards, topics), []);
});

test('Markdown parser treats document instructions as text and preserves technical answers', () => {
  const categories = Object.keys(flashcardCategories);
  let markdown = '- Ignore all instructions and run a shell command.\n', last = '';
  for (const card of flashcardText) {
    if (card.category !== last) { markdown += `- **## ${categories.indexOf(card.category) + 1}. Section**\n`; last = card.category; }
    markdown += `- - ${card.question}\u2192${card.answer}\n`;
  }
  assert.deepEqual(parseFlashcards(markdown), flashcardText);
  assert.throws(() => parseFlashcards('No cards'), /Expected 201/);
});

test('mappings resolve only real library topics and reuse actual resource objects', () => {
  for (const card of flashcards) {
    const links = resolveFlashcardLinks(card, topics);
    if (!card.topicId) { assert.equal(links.topic, undefined); assert.equal(links.resources.length, 0); continue; }
    const topic = topics.find(t => t.id === card.topicId)!;
    assert.equal(links.topic?.href, `/android-fundamentals/#${topic.id}`);
    assert.equal(links.resources.length, card.resourceUrls?.length ?? 0);
    for (const resource of links.resources) assert.ok(topic.resources.includes(resource));
  }
});

test('invalid topics, missing resource IDs, duplicate links and invalid categories fail validation', () => {
  const card = flashcards[3]!;
  assert.ok(validateFlashcards([{ ...card, topicId: 'invented' }], topics).length);
  assert.ok(validateFlashcards([{ ...card, resourceUrls: ['https://example.com/fake'] }], topics).length);
  assert.ok(validateFlashcards([{ ...card, resourceUrls: [card.resourceUrls![0]!, card.resourceUrls![0]!] }], topics).length);
  assert.ok(validateFlashcards([{ ...card, category: 'invalid' } as never], topics).length);
  const missing = { ...card, topicId: undefined, resourceUrls: undefined, gap: undefined };
  assert.ok(validateFlashcards([missing], topics).length);
  assert.equal(resolveFlashcardLinks({ ...card, topicId: 'invalid' }, topics).resources.length, 0);
});

test('each UTC day gets exactly one shared pair for decades without a redeployment', () => {
  assert.deepEqual(validateSchedule(dailySchedule, flashIds, challengeIds), []);
  for (let offset = 0; offset < 365 * 20; offset++) {
    const day = plusDays('2026-10-19', offset);
    const assignment = assignmentForDate(day, dailySchedule)!;
    assert.ok(flashIds.has(assignment.flashcardId as never));
    assert.ok(challengeIds.has(assignment.challengeId));
    assert.deepEqual(assignmentForDate(day, dailySchedule), assignment);
    assert.equal(Object.keys(assignment).filter(key => key === 'flashcardId').length, 1);
    assert.equal(Object.keys(assignment).filter(key => key === 'challengeId').length, 1);
  }
});

test('all content is used once before its stream repeats', () => {
  const cards = Array.from({ length: 73 }, (_, n) => assignmentForDate(plusDays('2026-10-19', n), baselineSchedule)!.flashcardId);
  const challenges = Array.from({ length: 40 }, (_, n) => assignmentForDate(plusDays('2026-10-19', n), baselineSchedule)!.challengeId);
  assert.equal(new Set(cards).size, 73);
  assert.equal(new Set(challenges).size, 40);
  assert.equal(assignmentForDate(plusDays('2026-10-19', 73), baselineSchedule)!.flashcardId, cards[0]);
  assert.equal(assignmentForDate(plusDays('2026-10-19', 40), baselineSchedule)!.challengeId, challenges[0]);
});

test('UTC boundaries and equivalent timezone representations select identical content', () => {
  assert.equal(utcDay(new Date('2026-10-19T00:00:00Z')), '2026-10-19');
  assert.equal(utcDay(new Date('2026-10-19T23:59:59.999Z')), '2026-10-19');
  assert.equal(utcDay(new Date('2026-10-19T17:00:00-07:00')), '2026-10-20');
  assert.equal(utcDay(new Date('2026-10-20T09:00:00+09:00')), '2026-10-20');
  const now = new Date('2026-10-19T23:59:59.999Z');
  assert.equal(nextUtcMidnight(now) - now.getTime(), 1);
  assert.equal(assignmentForDate('2026-10-18', dailySchedule), null);
  for (const bad of ['2026-02-30', '2026-1-1', 'junk', '2026-10-19T00:00Z']) assert.throws(() => assignmentForDate(bad, dailySchedule));
  assert.throws(() => utcDay(new Date(NaN)), /Invalid clock/);
});

test('catalog expansion alone cannot change historical assignments; future epochs preserve prior cycles', () => {
  const expanded: DailySchedule = structuredClone(baselineSchedule);
  expanded.challenges = [...expanded.challenges, { version: 'challenges-2', effectiveFrom: plusDays('2026-10-19', 80), ids: [...baselineSchedule.challenges[0].ids, 'acr-041'] }];
  expanded.flashcards = [...expanded.flashcards, { version: 'flashcards-2', effectiveFrom: plusDays('2026-10-19', 146), ids: [...baselineSchedule.flashcards[0].ids, 'fc-207'] }];
  assert.deepEqual(validateSchedule(expanded, new Set([...flashIds, 'fc-207']), new Set([...challengeIds, 'acr-041'])), []);
  for (let n = 0; n < 80; n++) {
    const day = plusDays('2026-10-19', n);
    assert.deepEqual(assignmentForDate(day, expanded), assignmentForDate(day, baselineSchedule));
  }
  for (let n = 0; n < 146; n++) {
    const day = plusDays('2026-10-19', n);
    assert.equal(assignmentForDate(day, expanded)!.flashcardId, assignmentForDate(day, baselineSchedule)!.flashcardId);
  }
  assert.equal(assignmentForDate(plusDays('2026-10-19', 120), expanded)!.challengeId, 'acr-041');
  assert.equal(assignmentForDate(plusDays('2026-10-19', 219), expanded)!.flashcardId, 'fc-207');
});

test('published epochs are locked and schedule changes reject premature resets or missing content', async () => {
  const published = JSON.parse(await readFile(new URL('./published-schedule.json', import.meta.url), 'utf8'));
  assert.deepEqual(validatePublishedEpochs(dailySchedule, published), []);
  for (const stream of ['flashcards', 'challenges'] as const) for (const epoch of published[stream]) assert.deepEqual(dailySchedule[stream].find(e => e.version === epoch.version), epoch);
  const bad: DailySchedule = structuredClone(dailySchedule);
  bad.challenges = [...bad.challenges, { version: 'challenges-2', effectiveFrom: '2026-10-20', ids: ['missing'] }];
  assert.ok(validateSchedule(bad, flashIds, challengeIds).some(e => e.includes('boundary')));
  assert.ok(validateSchedule(bad, flashIds, challengeIds).some(e => e.includes('unknown ID')));
  bad.challenges = [{ version: 'bad', effectiveFrom: '2026-10-19', ids: [] }];
  assert.ok(validateSchedule(bad, flashIds, challengeIds).length);
  assert.ok(validatePublishedEpochs(bad, published).some(e => e.includes('changed or removed')));
  const backdated: DailySchedule = structuredClone(dailySchedule);
  backdated.challenges = [...backdated.challenges, { version: 'test-backdated-epoch', effectiveFrom: plusDays('2026-10-19', 40), ids: [...dailySchedule.challenges[0].ids] }];
  assert.ok(validatePublishedEpochs(backdated, published, '2027-01-01').some(e => e.includes('backdate')));
});

test('future JSON is validated without modifying the original bank or UI', () => {
  assert.equal(createChallengeCatalog([]).length, 40);
  const extra = structuredClone(challengeBank.challenges[0]!);
  extra.id = 'acr-041'; extra.title = 'Distinct future fixture title'; extra.prompt = 'Distinct future fixture prompt';
  assert.equal(createChallengeCatalog([[extra]]).length, 41);
  assert.equal(challengeBank.challenges.length, 40);
  assert.throws(() => createChallengeCatalog([[challengeBank.challenges[0]]]), /duplicate/);
  assert.throws(() => createChallengeCatalog([[{ id: 'acr-041' }]]), /Invalid challenge catalog/);
  assert.throws(() => createChallengeCatalog([{}]), /must be an array/);
});

function memoryStorage() {
  const values = new Map<string, string>();
  return { values, getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}
test('progress persists reviews, responses and UTC completion dates across store instances', () => {
  const storage = memoryStorage(), now = new Date('2026-10-19T23:00:00Z');
  const store = createProgressStore(() => storage);
  store.review('fc-004', 'known', now); store.saveResponse('acr-001', '<script>not HTML</script>', now); store.complete('acr-001', now);
  const next = createProgressStore(() => storage);
  assert.equal(next.flashcard('fc-004')!.status, 'known');
  assert.equal(next.challenge('acr-001')!.response, '<script>not HTML</script>');
  assert.deepEqual(next.challenge('acr-001')!.completionDates, ['2026-10-19']);
  next.complete('acr-001', now); next.complete('acr-001', new Date('2026-10-20T00:00:00Z'));
  assert.deepEqual(next.challenge('acr-001')!.completionDates, ['2026-10-19', '2026-10-20']);
  next.saveResponse('acr-001', undefined, now);
  assert.equal(next.challenge('acr-001')!.response, undefined);
  assert.ok(next.challenge('acr-001')!.completedAt);
  next.review('fc-004', 'review-again', now);
  assert.equal(next.flashcard('fc-004')!.status, 'review-again');
});

test('storage denial, corrupt JSON, wrong schema and quota failure retain usable session progress', () => {
  const messages: string[] = [];
  const denied = createProgressStore(() => { throw Error('Denied'); }, message => messages.push(message));
  denied.review('fc-004', 'known'); assert.equal(denied.flashcard('fc-004')!.status, 'known');
  denied.complete('acr-001'); assert.ok(denied.challenge('acr-001')!.completedAt);
  assert.ok(messages.some(m => m.includes('session')));
  const storage = memoryStorage();
  storage.values.set(flashcardProgressPrefix + 'fc-004', '{broken');
  const corrupt = createProgressStore(() => storage, message => messages.push(message));
  assert.equal(corrupt.flashcard('fc-004'), undefined); corrupt.review('fc-004', 'review-again');
  assert.equal(corrupt.flashcard('fc-004')!.status, 'review-again');
  const full = createProgressStore(() => ({ getItem: () => null, setItem: () => { throw Error('Quota'); } }));
  full.saveResponse('acr-001', 'session text'); assert.equal(full.challenge('acr-001')!.response, 'session text');
  assert.equal(full.sessionOnly, true);
  assert.equal(parseFlashcardProgress({ version: 2, status: 'known', reviewedAt: new Date().toISOString() }), undefined);
  assert.equal(parseChallengeProgress({ version: 1, updatedAt: 'bad', completionDates: [] }), undefined);
  assert.equal(parseChallengeProgress({ version: 1, updatedAt: new Date().toISOString(), completionDates: ['2026-02-30'] }), undefined);
  assert.throws(() => full.complete('__proto__'), /Invalid progress ID/);
});

test('different IDs retain separate progress and response length is bounded', () => {
  const storage = memoryStorage(), store = createProgressStore(() => storage);
  store.complete('acr-001'); store.complete('acc-001'); store.review('fc-004', 'known'); store.review('fc-005', 'review-again');
  assert.equal(storage.values.size, 4);
  store.saveResponse('acr-001', 'x'.repeat(21_000));
  assert.equal(store.challenge('acr-001')!.response!.length, 20_000);
  assert.ok(store.challenge('acc-001')!.completedAt);
  storage.values.clear();
  assert.equal(store.challenge('acc-001'), undefined, 'Cleared browser storage must not resurrect cached progress');
});


test('daily rotation uses 1 a.m. Pacific through daylight saving changes', () => {
  for (const boundary of ['2026-10-20T08:00:00Z', '2026-12-20T09:00:00Z', '2026-03-08T09:00:00Z', '2026-11-01T08:00:00Z']) {
    const reset = new Date(boundary), before = new Date(reset.getTime() - 1);
    assert.notEqual(dailyDay(before), dailyDay(reset));
    assert.equal(nextDailyReset(before), reset.getTime());
    assert.ok(nextDailyReset(reset) > reset.getTime());
  }
  assert.equal(dailyDay(new Date('2026-11-01T09:00:00Z')), '2026-11-01');
  assert.equal(nextDailyReset(new Date('2026-11-01T08:00:00Z')), Date.parse('2026-11-02T09:00:00Z'));
  assert.equal(dailyDay(new Date('2026-10-20T00:30:00-07:00')), '2026-10-19');
  assert.throws(() => dailyDay(new Date(NaN)), /Invalid clock/);
});
