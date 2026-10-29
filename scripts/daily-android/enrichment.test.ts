import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import type { Challenge, CodeCompletionChallenge } from '../../src/data/android-challenges/types.ts';
import { challengeBank } from '../../src/data/android-challenges/index.ts';
import { flashcardText } from '../../src/data/android-flashcards/android-flashcards-archive.ts';
import { dailySchedule } from '../../src/data/daily-android-schedule.ts';
import { assignmentForDate, dayNumber } from '../../src/lib/daily-android/schedule.ts';
import { completeCode, coverage, validateChallenges } from '../android-challenges/validate.ts';
import { createChallengeCatalog } from './catalog.ts';

const additions: Challenge[] = JSON.parse(await readFile(new URL('../../src/data/android-challenges/imports/2026-10-19-reviewed.json', import.meta.url), 'utf8'));
const review = JSON.parse(await readFile(new URL('../../src/data/android-challenges/reviews/2026-10-19.json', import.meta.url), 'utf8'));
const catalog = createChallengeCatalog([additions]);

test('reviewed JSON enriches the catalog with 40 complete distinct problems without transforming originals', () => {
  assert.equal(additions.length, 40);
  assert.equal(catalog.length, 80);
  assert.deepEqual(catalog.slice(0, 40), challengeBank.challenges);
  assert.deepEqual(validateChallenges(catalog), []);
  assert.deepEqual(coverage(additions).byType, { 'code-review': 10, 'code-completion': 10, 'system-design': 6, 'engineering-scenario': 14 });
  assert.equal(new Set(catalog.map(c => c.id)).size, 80);
  assert.ok(additions.every(c => /Adapted from supplied challenges\.json [A-Z]+-\d+/.test(c.provenance.additions)));
});

test('all 150 supplied drafts have one traceable disposition and all covered/imported references resolve', () => {
  assert.equal(review.decisions.length, 150);
  assert.equal(new Set(review.decisions.map((d: { sourceId: string }) => d.sourceId)).size, 150);
  const ids = new Set(catalog.map(c => c.id));
  for (const [prefix, count] of [['CO', 45], ['FI', 40], ['SY', 30], ['SC', 35]] as const) {
    for (let n = 1; n <= count; n++) assert.ok(review.decisions.some((d: { sourceId: string }) => d.sourceId === `${prefix}-${String(n).padStart(3, '0')}`));
  }
  for (const decision of review.decisions) {
    assert.ok(decision.reason.trim());
    assert.ok(['adapted', 'covered', 'needs-revision'].includes(decision.status));
    if (decision.status === 'adapted') {
      const challenge = additions.find(c => c.id === decision.challengeId);
      assert.ok(challenge);
      assert.ok(challenge.provenance.additions.includes(decision.sourceId));
    }
    if (decision.status === 'covered') assert.ok(ids.has(decision.relatedChallengeId));
  }
  assert.equal(review.decisions.filter((d: { status: string }) => d.status === 'adapted').length, 40);
  assert.equal(review.decisions.filter((d: { status: string }) => d.status === 'covered').length, 71);
  assert.equal(review.decisions.filter((d: { status: string }) => d.status === 'needs-revision').length, 39);
});

test('coverage is recalculated for the live catalog and duplicate flashcards retain their original identities', () => {
  const live = coverage(catalog);
  assert.equal(review.combined.count, live.total);
  assert.deepEqual(review.combined.byType, live.byType);
  assert.deepEqual(review.combined.byTopic, live.byTopic);
  assert.deepEqual(review.combined.byDifficulty, live.byDifficulty);
  assert.equal(review.flashcards.exactMatches, 201);
  assert.equal(review.flashcards.added, 0);
  assert.equal(review.flashcards.normalizedSha256, createHash('sha256').update(JSON.stringify(flashcardText)).digest('hex'));
  for (const hash of Object.values(review.sourceFiles)) assert.match(String(hash), /^[a-f0-9]{64}$/);
  for (const field of ['byType', 'byCategory', 'byDifficulty']) assert.deepEqual(review.recomputedSourceCoverage[field], review.suppliedCoverage[field]);
});

test('new completion keys substitute fully and code samples retain honest verification status', () => {
  for (const challenge of additions) {
    if (challenge.type === 'code-review') {
      assert.equal(challenge.snippet.verification, 'not-compiled');
      assert.equal(challenge.correctedImplementation.verification, 'not-compiled');
      assert.ok(challenge.issues.length);
    }
    if (challenge.type !== 'code-completion') continue;
    const c: CodeCompletionChallenge = challenge;
    for (const answer of c.blanks[0]!.acceptedAnswers) {
      const code = completeCode(c, { ANSWER: answer });
      assert.ok(!code.includes('BLANK:'));
      assert.ok(!code.includes('___'));
      if (c.id === 'acc-110') assert.ok(code.includes('asSequence()'));
    }
    assert.equal(c.snippet.verification, 'not-compiled');
  }
});

test('expanded pool begins after the original cycle and every eligible ID appears once before repeating', () => {
  const original = { schemaVersion: 1 as const, flashcards: [dailySchedule.flashcards[0]], challenges: [dailySchedule.challenges[0]] };
  for (let n = 0; n < 40; n++) {
    const day = new Date((dayNumber('2026-10-19') + n) * 86_400_000).toISOString().slice(0, 10);
    assert.deepEqual(assignmentForDate(day, dailySchedule), assignmentForDate(day, original));
  }
  const next = dailySchedule.challenges.find(e => e.version === 'challenges-2')!;
  assert.equal(next.effectiveFrom, '2026-11-28');
  assert.equal(next.ids.length, 80);
  assert.deepEqual(new Set(next.ids), new Set(catalog.map(c => c.id)));
  assert.ok(additions.some(c => c.id === assignmentForDate('2026-11-28', dailySchedule)!.challengeId));
  for (let n = 0; n <= 80; n++) {
    const day = new Date((dayNumber(next.effectiveFrom) + n) * 86_400_000).toISOString().slice(0, 10);
    assert.equal(assignmentForDate(day, dailySchedule)!.challengeId, next.ids[n % 80]);
  }
});
