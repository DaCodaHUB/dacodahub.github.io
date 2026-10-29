import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { designChallenges } from '../../src/data/mobile-system-design/challenges.ts';
import { questionFields, solutionFields } from '../../src/data/mobile-system-design/types.ts';
import { adjacentDesign, createDesignStore, mobileDesignPrefix, parseDesignProgress, recommendedDesign, validateDesignChallenges } from '../../src/lib/daily-android/mobile-design.ts';

function storage() {
  const values = new Map<string, string>();
  return { values, getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}
test('eight independent interview briefs and nine-part reference designs follow the requested progression', () => {
  assert.deepEqual(validateDesignChallenges(designChallenges), []);
  assert.deepEqual(designChallenges.map(c => c.id), Array.from({ length: 8 }, (_, n) => `msd-00${n + 1}`));
  assert.deepEqual(designChallenges.map(c => c.difficulty), ['Easy', 'Medium', 'Medium', 'Medium', 'Hard', 'Medium', 'Medium', 'Hard']);
  assert.deepEqual(designChallenges.map(c => c.title), ['Offline-First Notes App', 'Paginated Social Feed', 'Authentication and Session Management', 'Reliable Background Uploads', 'Real-Time Messaging', 'Push Notifications and Deep Links', 'Bluetooth Device Dashboard', 'Cross-Device Offline Settings Sync']);
  assert.ok(designChallenges.every(c => c.question.nonFunctional.some(line => line.includes('Interview assumptions'))));
});
test('validation rejects absent question/solution fields, duplicate IDs and malformed briefs', () => {
  for (const section of ['question', 'solution'] as const) for (const field of section === 'question' ? questionFields : solutionFields) {
    const bank = structuredClone(designChallenges) as unknown as Record<string, unknown>[];
    delete (bank[0]![section] as Record<string, unknown>)[field];
    assert.ok(validateDesignChallenges(bank).some(error => error.includes(`${section}.${field}`)));
  }
  assert.ok(validateDesignChallenges(designChallenges.slice(1)).length);
  const duplicate = [...designChallenges]; duplicate[1] = duplicate[0]!;
  assert.ok(validateDesignChallenges(duplicate).some(e => e.includes('duplicate')));
  for (const change of [{ question: { tasks: [] } }, { solution: {} }, { minutes: 50 }, { difficulty: 'Senior' }, { references: [{ title: 'x', url: 'http://example.com' }] }]) {
    assert.ok(validateDesignChallenges([{ ...designChallenges[0], ...change }, ...designChallenges.slice(1)]).length);
  }
});
test('statuses and browsing position persist across refresh while legacy notes are removed', () => {
  const saved = storage();
  saved.values.set('daily-android:neetcode:v1:problem:subsets', 'completed');
  saved.values.set('daily-android:v2:challenge:cr-001', 'original-review');
  saved.values.set(mobileDesignPrefix + 'msd-001', JSON.stringify({ version: 1, notes: 'old written response', status: 'completed' }));
  const first = createDesignStore(() => saved);
  assert.deepEqual(first.progress('msd-001'), { version: 1, status: 'completed' });
  assert.deepEqual(JSON.parse(saved.values.get(mobileDesignPrefix + 'msd-001')!), { version: 1, status: 'completed' });
  first.setStatus('msd-001', 'completed'); first.setStatus('msd-002', 'needs-review'); first.visit('msd-003');
  const next = createDesignStore(() => saved);
  assert.equal(next.progress('msd-001')?.status, 'completed');
  assert.equal(next.progress('msd-002')?.status, 'needs-review');
  assert.equal(next.current()?.id, 'msd-003');
  assert.equal(recommendedDesign(next.progress)?.id, 'msd-002');
  assert.equal(saved.values.get('daily-android:neetcode:v1:problem:subsets'), 'completed');
  assert.equal(saved.values.get('daily-android:v2:challenge:cr-001'), 'original-review');
  saved.values.clear(); assert.equal(next.progress('msd-001'), undefined);
});
test('recommendation never calendar-skips; navigation and repeated practice preserve completion', () => {
  const saved = storage(), store = createDesignStore(() => saved);
  assert.equal(adjacentDesign('msd-001', -1).id, 'msd-001');
  assert.equal(adjacentDesign('msd-008', 1).id, 'msd-008');
  assert.equal(adjacentDesign('msd-002', -1).id, 'msd-001');
  store.setStatus('msd-008', 'completed'); assert.equal(recommendedDesign(store.progress)?.id, 'msd-001');
  for (let cycle = 0; cycle < 3; cycle++) for (const c of designChallenges) {
    store.visit(c.id); store.setStatus(c.id, 'completed');
  }
  assert.equal(recommendedDesign(store.progress), undefined);
  store.setStatus('msd-004', 'needs-review'); assert.equal(recommendedDesign(store.progress)?.id, 'msd-004');
});
test('storage denial, quota failure and invalid records preserve usable session progress', () => {
  const messages: string[] = [];
  const denied = createDesignStore(() => { throw Error('Denied'); }, text => messages.push(text));
  denied.setStatus('msd-001', 'completed');
  assert.equal(denied.progress('msd-001')?.status, 'completed');
  assert.equal(denied.sessionOnly, true); assert.ok(messages.length);
  const full = createDesignStore(() => ({ getItem: () => null, setItem: () => { throw Error('Quota'); } }));
  full.setStatus('msd-002', 'needs-review'); assert.equal(full.progress('msd-002')?.status, 'needs-review');
  const saved = storage(); saved.values.set(mobileDesignPrefix + 'msd-001', '{broken');
  const corrupt = createDesignStore(() => saved); assert.equal(corrupt.progress('msd-001'), undefined);
  corrupt.setStatus('msd-001', 'completed'); assert.equal(corrupt.progress('msd-001')?.status, 'completed');
  for (const raw of [null, [], { version: 2 }, { version: 1, status: 'pass' }]) assert.equal(parseDesignProgress(raw), undefined);
  assert.throws(() => denied.setStatus('__proto__', 'completed')); assert.throws(() => adjacentDesign('invalid', 1));
});
test('active bank and validation imports never depend on deleted docs', async () => {
  const seen = new Set<string>();
  async function inspect(url: URL) {
    if (seen.has(url.href)) return; seen.add(url.href);
    assert.doesNotMatch(url.pathname, /\/docs\//);
    const source = await readFile(url, 'utf8');
    for (const match of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) if (match[1]!.startsWith('.')) await inspect(new URL(match[1]!, url));
  }
  await inspect(new URL('../../src/lib/daily-android/mobile-design.ts', import.meta.url));
});
