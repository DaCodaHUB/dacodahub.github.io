import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flashcards } from '../../src/data/android-flashcards/index.ts';
import { startStudy, nextStudy, parseStudySession } from '../../src/lib/daily-android/study.ts';
import { createProgressStore, studySessionKey, flashcardProgressPrefix } from '../../src/lib/daily-android/progress.ts';

const ids = flashcards.map(card => card.id);
test('sessions use the active collection once per cycle and can repeat without a daily limit', () => {
  let session = startStudy(ids, ids[0]);
  assert.notEqual(session.order[0], ids[0]);
  for (let cycle = 0; cycle < 4; cycle++) {
    const seen = new Set<string>();
    for (let i = 0; i < 73; i++) {
      assert.equal(session.position, i);
      assert.equal(session.reviewed, false);
      assert.equal(nextStudy(session), session, 'Advancement waits for a review, not a new day');
      const id = session.order[session.position]!;
      assert.ok(!seen.has(id)); seen.add(id);
      session = nextStudy({ ...session, reviewed: true });
    }
    assert.deepEqual(seen, new Set(ids));
    assert.equal(session.position, 0);
  }
});

test('session cursor and completion survive reload; starting again never resets review or challenge data', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  let store = createProgressStore(() => storage);
  store.complete('acr-001'); store.saveResponse('acr-001', 'Keep this response');
  let session = startStudy(ids);
  for (let i = 0; i < 73; i++) {
    const id = session.order[session.position]!;
    store.review(id, i % 2 ? 'review-again' : 'known');
    session = { ...session, reviewed: true };
    store.saveStudySession(session);
    store = createProgressStore(() => storage);
    assert.deepEqual(store.studySession(ids), session);
    if (i < 72) {
      session = nextStudy(session); store.saveStudySession(session);
      assert.deepEqual(createProgressStore(() => storage).studySession(ids), session);
    }
  }
  const reviews = [...values].filter(([key]) => key.startsWith(flashcardProgressPrefix));
  assert.equal(reviews.length, 73);
  const savedChallenge = store.challenge('acr-001');
  store.saveStudySession(nextStudy(session));
  const reloaded = createProgressStore(() => storage);
  assert.equal(reloaded.studySession(ids)!.position, 0);
  assert.equal(reloaded.studySession(ids)!.reviewed, false);
  assert.deepEqual([...values].filter(([key]) => key.startsWith(flashcardProgressPrefix)), reviews);
  assert.deepEqual(reloaded.challenge('acr-001'), savedChallenge);
});

test('invalid, duplicate, retired, and obsolete session records cannot enter active study', () => {
  const valid = startStudy(ids);
  assert.deepEqual(parseStudySession(valid, ids), valid);
  for (const raw of [null, {}, { ...valid, version: 2 }, { ...valid, position: -1 }, { ...valid, position: 73 }, { ...valid, position: 1.5 }, { ...valid, reviewed: 'yes' }, { ...valid, order: [...valid.order.slice(1), valid.order[1]] }, { ...valid, order: ['fc-005', ...valid.order.slice(1)] }]) {
    assert.equal(parseStudySession(raw, ids), undefined);
  }
  assert.throws(() => startStudy([]));
  assert.throws(() => startStudy(['fc-001', 'fc-001']));
});

test('blocked storage and corrupt session JSON do not prevent unlimited session practice', () => {
  const denied = createProgressStore(() => { throw Error('blocked'); });
  assert.equal(denied.studySession(ids), undefined);
  const session = startStudy(ids);
  denied.saveStudySession(session);
  assert.deepEqual(denied.studySession(ids), session);
  assert.equal(denied.sessionOnly, true);
  const corrupt = createProgressStore(() => ({ getItem: key => key === studySessionKey ? '{broken' : null, setItem: () => {} }));
  assert.equal(corrupt.studySession(ids), undefined);
});
