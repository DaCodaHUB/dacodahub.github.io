import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { neetcodeProblems as problems } from '../../src/data/neetcode/problems.ts';
import { prerequisites, roadmapOrder } from '../../src/data/neetcode/roadmap.ts';
import { adjacentProblem, createNeetcodeStore, neetcodePrefix, recommendedProblem, requiredTopics } from '../../src/lib/daily-android/neetcode.ts';

const storage = () => {
  const values = new Map<string, string>();
  return { values, getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
};
test('expanded dataset preserves the original 20 titles, IDs, difficulties and patterns without statements', async () => {
  const source = await readFile(new URL('../../src/data/neetcode/NeetCode_Android_Daily_20.md', import.meta.url), 'utf8');
  const entries = [...source.matchAll(/\[([^\]]+)\]\(https:\/\/neetcode.io\/solutions\/([^)]*)\).*?\*\*(Easy|Medium|Hard)\*\* · (.*)/g)];
  assert.equal(entries.length, 20); assert.equal(problems.length, 26);
  assert.equal(new Set(problems.map(p => p.id)).size, 26);
  for (const [, title, id, difficulty, pattern] of entries) {
    const problem = problems.find(p => p.id === id)!;
    assert.ok(problem); assert.equal(problem.title, title); assert.equal(problem.difficulty, difficulty); assert.equal(problem.pattern, pattern);
    assert.match(problem.url, /^https:\/\/neetcode\.io\/problems\/[a-z0-9-]+\/question$/);
    assert.deepEqual(Object.keys(problem).sort(), ['difficulty', 'id', 'pattern', 'title', 'topic', 'url']);
  }
});
test('topic order honors official prerequisite graph, with actual practice for every transitive prerequisite topic', () => {
  for (const topic of roadmapOrder) for (const parent of prerequisites[topic] ?? []) {
    assert.ok(roadmapOrder.indexOf(parent as typeof roadmapOrder[number]) < roadmapOrder.indexOf(topic), `${parent} before ${topic}`);
  }
  let previous = -1, difficulty = -1;
  for (const problem of problems) {
    const topic = roadmapOrder.indexOf(problem.topic as typeof roadmapOrder[number]);
    const rank = ['Easy', 'Medium', 'Hard'].indexOf(problem.difficulty);
    assert.ok(topic >= previous);
    if (topic === previous) assert.ok(rank >= difficulty);
    previous = topic; difficulty = rank;
  }
  assert.deepEqual(prerequisites.Trees, ['Linked List', 'Binary Search']);
  for (const problem of problems) for (const topic of requiredTopics(problem.topic)) {
    const prerequisiteProblems = problems.filter(p => p.topic === topic);
    assert.ok(prerequisiteProblems.length > 0, `Missing practice for ${topic}`);
    assert.ok(prerequisiteProblems.every(p => problems.indexOf(p) < problems.indexOf(problem)), `Practice ${topic} before ${problem.title}`);
  }
  const added = problems.filter(p => ['Backtracking', 'Heap / Priority Queue'].includes(p.topic));
  assert.equal(added.length, 6);
  assert.equal(added.filter(p => p.difficulty === 'Easy').length, 2);
  assert.ok(added.every(p => p.difficulty !== 'Hard'));
  for (const problem of added) assert.match(problem.url, /^https:\/\/neetcode\.io\/problems\/[a-z0-9-]+\/question$/);
});
test('daily recommendation is earliest incomplete, never calendar driven, and completed problems remain navigable', () => {
  const saved = storage(), store = createNeetcodeStore(() => saved);
  assert.equal(recommendedProblem(store.status), problems[0]);
  store.setStatus(problems[1]!.id, 'completed');
  assert.equal(recommendedProblem(store.status), problems[0]);
  store.setStatus(problems[0]!.id, 'needs-review');
  assert.equal(recommendedProblem(store.status), problems[0]);
  store.setStatus(problems[0]!.id, 'completed');
  assert.equal(recommendedProblem(store.status), problems[2]);
  assert.equal(adjacentProblem(problems[1]!.id, -1), problems[0]);
  assert.equal(adjacentProblem(problems[0]!.id, -1), problems[0]);
  assert.equal(adjacentProblem(problems.at(-1)!.id, 1), problems.at(-1));
  for (let cycle = 0; cycle < 3; cycle++) for (const problem of problems) store.setStatus(problem.id, 'completed');
  assert.equal(recommendedProblem(store.status), undefined);
  store.setStatus(problems[4]!.id, 'needs-review');
  assert.equal(recommendedProblem(store.status), problems[4]);
});
test('refresh and new sessions preserve separate problem statuses and browsing position', () => {
  const saved = storage(); saved.values.set('daily-android:v2:challenge:cr-001', 'untouched');
  const first = createNeetcodeStore(() => saved);
  first.setStatus(problems[0]!.id, 'completed'); first.setStatus(problems[1]!.id, 'needs-review');
  first.visit(problems[4]!.id);
  const reloaded = createNeetcodeStore(() => saved);
  assert.equal(reloaded.status(problems[0]!.id), 'completed'); assert.equal(reloaded.status(problems[1]!.id), 'needs-review');
  assert.equal(reloaded.currentProblem(), problems[4]);
  assert.equal(recommendedProblem(reloaded.status), problems[1]);
  assert.equal(saved.values.get('daily-android:v2:challenge:cr-001'), 'untouched');
  saved.values.clear(); assert.equal(first.status(problems[0]!.id), undefined);
});
test('corrupt and denied storage remain usable without altering Android keys', () => {
  const saved = storage(); saved.values.set(neetcodePrefix + 'problem:' + problems[0]!.id, '{broken');
  assert.equal(createNeetcodeStore(() => saved).status(problems[0]!.id), undefined);
  const messages: string[] = [];
  const denied = createNeetcodeStore(() => { throw Error('Denied'); }, message => messages.push(message));
  denied.setStatus(problems[0]!.id, 'completed'); assert.equal(denied.status(problems[0]!.id), 'completed');
  assert.equal(denied.sessionOnly, true); assert.ok(messages.length);
  assert.throws(() => denied.setStatus('__proto__', 'completed'));
  const full = createNeetcodeStore(() => ({ getItem: () => null, setItem: () => { throw Error('Quota'); } }));
  full.setStatus(problems[1]!.id, 'needs-review'); assert.equal(full.status(problems[1]!.id), 'needs-review');
});

test('expansion recommends actual prerequisite problems despite legacy acknowledgements and advanced completions', async () => {
  const source = await readFile(new URL('../../src/data/neetcode/NeetCode_Android_Daily_20.md', import.meta.url), 'utf8');
  const originalIds = [...source.matchAll(/https:\/\/neetcode.io\/solutions\/([^)]*)/g)].map(match => match[1]!);
  const saved = storage();
  for (const id of originalIds) saved.values.set(neetcodePrefix + 'problem:' + id, 'completed');
  saved.values.set(neetcodePrefix + 'study:Backtracking', 'ready');
  saved.values.set(neetcodePrefix + 'study:Heap / Priority Queue', 'ready');
  saved.values.set(neetcodePrefix + 'current', 'number-of-islands');
  const originalEntries = new Map(saved.values);
  const store = createNeetcodeStore(() => saved);
  const additions = problems.filter(p => !originalIds.includes(p.id));
  assert.equal(store.currentProblem()?.id, 'number-of-islands');
  for (const problem of additions) {
    assert.equal(recommendedProblem(store.status), problem);
    store.setStatus(problem.id, 'completed');
  }
  assert.equal(recommendedProblem(store.status), undefined);
  for (const [key, value] of originalEntries) assert.equal(saved.values.get(key), value);
  store.setStatus(additions[0]!.id, 'needs-review');
  assert.equal(recommendedProblem(createNeetcodeStore(() => saved).status), additions[0]);
});
