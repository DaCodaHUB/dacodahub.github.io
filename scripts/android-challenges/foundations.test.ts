import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { codeReviewChallenges } from '../../src/data/android-challenges/reviews.ts';
import { dailySchedule } from '../../src/data/daily-android-schedule.ts';
import { createProgressStore, reviewProgressPrefix } from '../../src/lib/daily-android/progress.ts';

const hash = (data: string | Uint8Array) => createHash('sha256').update(data).digest('hex');
const baseline = JSON.parse(await readFile(new URL('./fixtures/foundations-baseline.json', import.meta.url), 'utf8'));
const archive = JSON.parse(await readFile(new URL('../../src/data/android-challenges/foundations-predecessors.json', import.meta.url), 'utf8'));
const cards = codeReviewChallenges;

test('foundational bank contains exactly 14 Easy, 12 Medium, and 4 Hard challenges', () => {
  assert.equal(cards.length, 30);
  assert.deepEqual(cards.reduce<Record<string, number>>((counts, card) => {
    counts[card.difficulty] = (counts[card.difficulty] ?? 0) + 1; return counts;
  }, {}), { Easy: 14, Medium: 12, Hard: 4 });
  const added = cards.filter(c => ['cr-031', 'cr-032', 'cr-033', 'cr-034'].includes(c.id));
  assert.equal(added.length, 4);
  for (const card of added) {
    assert.equal(card.difficulty, 'Easy');
    assert.ok(card.issues.length >= 1 && card.issues.length <= 2);
    assert.ok(card.followUps.length && card.tradeoffs);
    assert.ok(card.snippet.code.split('\n').length <= 4, `${card.id}: focused starter snippet`);
    assert.ok(card.correctedImplementation.code.split('\n').length <= 9, `${card.id}: approachable correction`);
  }
});

test('the original 10 Easy, all 12 Medium, and four retained Hard challenges remain intact', () => {
  assert.equal(Object.keys(baseline.unchanged).length, 26);
  for (const [id, fingerprint] of Object.entries(baseline.unchanged)) {
    const card = cards.find(c => c.id === id);
    assert.ok(card, `${id} is preserved`);
    assert.equal(hash(JSON.stringify(card)), fingerprint, `${id} changed beyond the requested rewrites`);
  }
  assert.deepEqual(cards.filter(c => c.difficulty === 'Hard').map(c => c.id), ['cr-023', 'cr-024', 'cr-025', 'cr-028']);
});

test('four advanced predecessors are archived and their new objectives get fresh active identities', () => {
  assert.equal(archive.count, 4);
  const predecessors = archive.changes.map((entry: { challenge: unknown }) => entry.challenge);
  assert.equal(hash(JSON.stringify(predecessors)), archive.sha256);
  const mapping: Record<string, string> = { 'cr-026': 'cr-031', 'cr-027': 'cr-032', 'cr-029': 'cr-033', 'cr-030': 'cr-034' };
  for (const entry of archive.changes) {
    assert.equal(entry.challenge.difficulty, 'Hard');
    assert.equal(entry.replacementId, mapping[entry.challenge.id]);
    assert.ok(!cards.some(c => c.id === entry.challenge.id));
    assert.ok(cards.some(c => c.id === entry.replacementId));
  }
  assert.deepEqual(new Set(dailySchedule.challenges[0].ids), new Set(cards.map(c => c.id)));
});

test('all 80 original archived records remain byte-for-byte unchanged', async () => {
  const bytes = await readFile(new URL('../../src/data/android-challenges/legacy-archive.json', import.meta.url));
  assert.equal(hash(bytes), baseline.legacyArchiveSha256);
  const legacy = JSON.parse(bytes.toString('utf8'));
  assert.equal(legacy.count, 80);
  assert.equal(legacy.challenges.length, 80);
});

test('new learning objectives never inherit or overwrite their predecessors’ saved progress', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const store = createProgressStore(() => storage);
  for (const { replacementId, challenge } of archive.changes) {
    store.saveResponse(challenge.id, 'My advanced review');
    store.complete(challenge.id);
    const previous = values.get(reviewProgressPrefix + challenge.id);
    assert.equal(store.challenge(replacementId), undefined);
    store.complete(replacementId);
    assert.equal(values.get(reviewProgressPrefix + challenge.id), previous);
    assert.equal(store.challenge(challenge.id)!.response, 'My advanced review');
  }
  const reloaded = createProgressStore(() => storage);
  for (const { replacementId, challenge } of archive.changes) {
    assert.ok(reloaded.challenge(replacementId)!.completedAt);
    assert.equal(reloaded.challenge(challenge.id)!.response, 'My advanced review');
  }
});
