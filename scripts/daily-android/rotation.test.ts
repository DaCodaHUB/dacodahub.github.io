import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localDay } from '../../src/lib/daily-android/calendar.ts';
import { categories, categoryProgress, createNeetcodeStore, dailyProblem, defaultCategory, neetcodePrefix, requiredTopics, type ProblemStatus } from '../../src/lib/daily-android/neetcode.ts';
import { neetcodeProblems as problems } from '../../src/data/neetcode/problems.ts';
import { roadmapOrder } from '../../src/data/neetcode/roadmap.ts';
import { dailyDesign, createDesignStore, mobileDesignPrefix } from '../../src/lib/daily-android/mobile-design.ts';
import { designChallenges } from '../../src/data/mobile-system-design/challenges.ts';
const storage = () => {
  const values = new Map<string, string>();
  return { values, getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => { values.set(k, v); } };
};
test('category order, counts and completion use current status, including Needs Review', () => {
  assert.deepEqual(categories, roadmapOrder.filter(t => problems.some(p => p.topic === t)));
  const saved = storage(), store = createNeetcodeStore(() => saved), topic = categories[0]!;
  assert.equal(defaultCategory(store.status), topic);
  const bank = problems.filter(p => p.topic === topic);
  for (const p of bank) store.setStatus(p.id, 'completed');
  assert.deepEqual(categoryProgress(topic, store.status), { completed: bank.length, total: bank.length, complete: true });
  assert.equal(defaultCategory(store.status), categories[1]);
  store.setStatus(bank[0]!.id, 'needs-review');
  assert.equal(categoryProgress(topic, store.status).complete, false);
  assert.equal(categoryProgress(topic, store.status).completed, bank.length - 1);
});
test('category selection survives refresh, corrupt/retired values recover without altering legacy progress', () => {
  const saved = storage(), store = createNeetcodeStore(() => saved);
  store.setStatus(problems[0]!.id, 'needs-review'); store.selectCategory('Trees');
  store.visit(problems.at(-1)!.id);
  assert.equal(createNeetcodeStore(() => saved).category(), 'Trees');
  assert.equal(createNeetcodeStore(() => saved).status(problems[0]!.id), 'needs-review');
  saved.values.set(neetcodePrefix + 'category', 'retired');
  assert.equal(createNeetcodeStore(() => saved).category(), categories[0]);
  assert.equal(saved.values.get(neetcodePrefix + 'problem:' + problems[0]!.id), 'needs-review');
});
test('pure category rotation is deterministic, prefers incomplete, avoids yesterday and honors prerequisites', () => {
  const states = new Map<string, ProblemStatus>(), status = (id: string) => states.get(id);
  const topic = categories[0]!, bank = problems.filter(p => p.topic === topic);
  const seen = new Set<string>();
  for (let day = 20000; day < 20000 + bank.length; day++) {
    const pick = dailyProblem(topic, status, day)!;
    assert.equal(pick, dailyProblem(topic, status, day)); seen.add(pick.id);
    assert.notEqual(pick.id, dailyProblem(topic, status, day + 1)!.id);
  }
  assert.equal(seen.size, bank.length);
  const yesterday = dailyProblem(topic, status, 20000)!;
  for (const p of bank) if (p.id !== yesterday.id) states.set(p.id, 'completed');
  const other = bank.find(p => p.id !== yesterday.id)!; states.set(other.id, 'needs-review');
  assert.equal(dailyProblem(topic, status, 20001, yesterday.id)!.id, other.id);
  states.set(other.id, 'completed');
  assert.equal(dailyProblem(topic, status, 20002, yesterday.id)!.id, yesterday.id);
  assert.equal(dailyProblem('Trees', status, 20000), undefined);
  for (const p of problems) if (requiredTopics('Trees').includes(p.topic)) states.set(p.id, 'completed');
  assert.equal(dailyProblem('Trees', status, 20000)?.topic, 'Trees');
});
test('same-day snapshots survive progress edits, manual navigation, reload and corrupted snapshots', () => {
  const saved = storage(), store = createNeetcodeStore(() => saved), topic = categories[0]!;
  const today = store.daily(topic, 20000)!;
  store.setStatus(today.id, 'completed'); store.visit(problems.at(-1)!.id);
  assert.equal(store.daily(topic, 20000), today);
  assert.equal(createNeetcodeStore(() => saved).daily(topic, 20000), today);
  assert.notEqual(store.daily(topic, 20001)!.id, today.id);
  saved.values.set(neetcodePrefix + 'daily:' + topic, '{broken');
  assert.ok(store.daily(topic, 20002));
  saved.values.set(neetcodePrefix + 'daily:' + topic, JSON.stringify({ day: 20002, id: 'retired' }));
  assert.ok(store.daily(topic, 20002));
});
test('all-completed categories rotate review, with valid singleton repeats', () => {
  for (const topic of categories) {
    const bank = problems.filter(p => p.topic === topic), seen = new Set<string>();
    for (let day = 0; day < bank.length; day++) seen.add(dailyProblem(topic, () => 'completed', day)!.id);
    assert.equal(seen.size, bank.length);
  }
});
test('design full-cycle rotation is date-only and never resets status or legacy migration', () => {
  const saved = storage(), store = createDesignStore(() => saved);
  saved.values.set(mobileDesignPrefix + 'msd-001', JSON.stringify({ version: 1, status: 'needs-review', notes: 'legacy' }));
  const seen = new Set<string>();
  for (let day = 20000; day < 20000 + designChallenges.length; day++) {
    const pick = dailyDesign(day); seen.add(pick.id); store.visit('msd-003');
    assert.equal(dailyDesign(day), pick);
    assert.notEqual(dailyDesign(day + 1), pick);
  }
  assert.equal(seen.size, 20); assert.equal(dailyDesign(20020), dailyDesign(20000));
  assert.equal(store.progress('msd-001')?.status, 'needs-review');
  assert.deepEqual(JSON.parse(saved.values.get(mobileDesignPrefix + 'msd-001')!), { version: 1, status: 'needs-review' });
});
test('local calendar boundaries, DST and year changes advance one day', () => {
  const oldTZ = process.env.TZ;
  try {
    for (const tz of ['America/Los_Angeles', 'Asia/Tokyo']) {
      process.env.TZ = tz;
      const instant = new Date('2026-10-23T00:30:00Z');
      assert.equal(localDay(instant), Math.floor(Date.UTC(2026, 9, tz === 'America/Los_Angeles' ? 22 : 23) / 86400000));
      assert.equal(localDay(new Date(2026, 9, 23, 0, 0)) - localDay(new Date(2026, 9, 22, 23, 59, 59)), 1);
      assert.equal(localDay(new Date(2026, 10, 2)) - localDay(new Date(2026, 10, 1)), 1);
      assert.equal(localDay(new Date(2027, 0, 1)) - localDay(new Date(2026, 11, 31)), 1);
      assert.equal(localDay(new Date(2026, 2, 9)) - localDay(new Date(2026, 2, 8)), 1);
    }
  } finally { if (oldTZ === undefined) delete process.env.TZ; else process.env.TZ = oldTZ; }
});
