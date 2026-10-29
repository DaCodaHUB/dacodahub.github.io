import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { flashcards } from '../../src/data/android-flashcards/index.ts';
import { flashcardText } from '../../src/data/android-flashcards/android-flashcards-archive.ts';
import { dailySchedule } from '../../src/data/daily-android-schedule.ts';
import { assignmentForDate, dayNumber } from '../../src/lib/daily-android/schedule.ts';
import { createProgressStore, progressPrefix, flashcardProgressPrefix } from '../../src/lib/daily-android/progress.ts';

test('active dataset dependency graph excludes archive and audit code or documentation', async () => {
  const visited = new Set<string>();
  async function inspect(url: URL) {
    if (visited.has(url.href)) return;
    visited.add(url.href);
    assert.doesNotMatch(fileURLToPath(url), /archive|audit|\.md$/i);
    const source = await readFile(url, 'utf8');
    for (const match of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      if (match[1]!.startsWith('.')) await inspect(new URL(match[1]!, url));
    }
  }
  await inspect(new URL('../../src/data/android-flashcards/index.ts', import.meta.url));
});

test('daily study uses all 73 active questions once per cycle and no retired identities', () => {
  const epoch = dailySchedule.flashcards[0];
  const actual = Array.from({ length: 73 }, (_, offset) => {
    const date = new Date((dayNumber(epoch.effectiveFrom) + offset) * 86_400_000).toISOString().slice(0, 10);
    return assignmentForDate(date, dailySchedule)!.flashcardId;
  });
  assert.equal(new Set(actual).size, 73);
  assert.deepEqual(new Set(actual), new Set(flashcards.map(c => c.id)));
  assert.ok(!actual.includes('fc-005'));
  assert.equal(flashcardText.length, 201);
});

test('only four unchanged identities migrate; old reviews stay archived and current reviews take precedence', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const original = JSON.stringify({ version: 1, status: 'known', reviewedAt: '2026-10-20T12:00:00.000Z' });
  for (const card of flashcardText) values.set(progressPrefix + 'flashcard:' + card.id, original);
  const archived = new Map(values);
  const store = createProgressStore(() => storage);
  const preserved = new Set(['fc-147', 'fc-153', 'fc-166', 'fc-201']);
  for (const card of flashcards) {
    assert.equal(store.flashcard(card.id)?.status, preserved.has(card.id) ? 'known' : undefined, card.id);
  }
  for (const [key, value] of archived) assert.equal(values.get(key), value, 'Legacy reviews must remain intact');
  for (const id of preserved) {
    const active = flashcards.find(c => c.id === id)!;
    const legacy = flashcardText.find(c => c.id === id)!;
    assert.equal(active.question, legacy.question);
    assert.equal(active.answer, legacy.answer);
    assert.equal(values.get(flashcardProgressPrefix + id), original);
  }
  store.review('fc-147', 'review-again', new Date('2026-10-29T12:00:00.000Z'));
  store.review('fc-004', 'known');
  const reloaded = createProgressStore(() => storage);
  assert.equal(reloaded.flashcard('fc-147')!.status, 'review-again');
  assert.equal(reloaded.flashcard('fc-004')!.status, 'known');
  assert.equal(values.get(progressPrefix + 'flashcard:fc-147'), original);
});

test('curated questions are unique, concise, and have follow-ups; TypeScript examples parse', () => {
  assert.equal(flashcards.length, 73);
  assert.equal(flashcards.filter(c => c.code).length, 17);
  assert.deepEqual(flashcards.reduce<Record<string, number>>((counts, card) => {
    counts[card.category] = (counts[card.category] ?? 0) + 1; return counts;
  }, {}), { kotlin: 7, coroutines: 9, flow: 8, framework: 7, compose: 9, architecture: 14, background: 6, engineering: 13 });
  const normalized = flashcards.map(c => c.question.toLowerCase().replace(/[^a-z0-9]/g, ''));
  assert.equal(new Set(normalized).size, flashcards.length);
  for (const card of flashcards) {
    assert.ok(card.followUp?.trim(), card.id);
    assert.ok(card.answer.split(/\s+/).length <= 130, `${card.id}: answer exceeds spoken-answer budget`);
    if (!card.code) continue;
    assert.ok(card.code.context.trim());
    assert.ok(card.code.code.split('\n').length <= 20, `${card.id}: excessive example length`);
    if (card.code.language === 'typescript') {
      const result = ts.transpileModule(card.code.code, { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022, isolatedModules: true } });
      assert.deepEqual(result.diagnostics, [], card.id);
    }
  }
});
