import { test } from 'node:test';
import assert from 'node:assert/strict';
import { neetcodeProblems } from '../../src/data/neetcode/problems.ts';
import { kotlinSolutions } from '../../src/data/neetcode/kotlin-solutions.ts';
import { validateKotlinSolutions } from '../../src/lib/daily-android/kotlin-solutions.ts';
import { kotlinCases } from './kotlin-cases.ts';

test('every active problem has a complete original Kotlin reference and executable test fixture', () => {
  assert.deepEqual(validateKotlinSolutions(), []);
  assert.deepEqual(Object.keys(kotlinSolutions).sort(), neetcodeProblems.map(p => p.id).sort());
  assert.deepEqual(Object.keys(kotlinCases).sort(), neetcodeProblems.map(p => p.id).sort());
  for (const problem of neetcodeProblems) {
    assert.match(kotlinSolutions[problem.id]!.code, /class (Solution|LRUCache|KthLargest)/);
    assert.match(kotlinCases[problem.id]!.tests, /eq\(/);
  }
  assert.match(kotlinSolutions['reverse-linked-list']!.platform, /Judge-provided ListNode/);
  assert.match(kotlinSolutions['binary-tree-level-order-traversal']!.platform, /Judge-provided TreeNode/);
  assert.match(kotlinSolutions['number-of-islands']!.platform, /No GraphNode/);
});
test('missing solutions, unrecognized IDs and incomplete explanations fail validation', () => {
  const missing = { ...kotlinSolutions }; delete missing['subsets'];
  assert.ok(validateKotlinSolutions(missing).some(error => error.includes('Missing Kotlin solution: subsets')));
  assert.ok(validateKotlinSolutions({ ...kotlinSolutions, invented: kotlinSolutions['subsets']! }).some(error => error.includes('Unknown')));
  for (const field of ['code', 'pattern', 'explanation', 'time', 'space', 'kotlin', 'platform'] as const) {
    assert.ok(validateKotlinSolutions({ ...kotlinSolutions, subsets: { ...kotlinSolutions['subsets']!, [field]: '' } }).some(error => error.includes(field)));
  }
});
