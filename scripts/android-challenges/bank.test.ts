import { test } from 'node:test';
import assert from 'node:assert/strict';
import { challengeBank } from '../../src/data/android-challenges/legacy-bank.ts';
import { curriculumCards, curriculumSource } from '../../src/data/android-challenges/curriculum.ts';
import { codeReviews } from '../../src/data/android-challenges/code-review.ts';
import { codeCompletions } from '../../src/data/android-challenges/code-completion.ts';
import { systemDesigns } from '../../src/data/android-challenges/system-design.ts';
import { engineeringScenarios } from '../../src/data/android-challenges/engineering-scenarios.ts';
import { validateChallenges, coverage, completeCode } from './validate.ts';
import { standaloneFixtures } from './fixtures.ts';

test('batch one meets the complete schema and exact requested format/topic distribution', () => {
  assert.deepEqual(validateChallenges(challengeBank.challenges), []);
  assert.match(challengeBank.schemaVersion, /^\d+\.\d+\.\d+$/);
  const report = coverage(challengeBank.challenges);
  assert.equal(report.total, 40);
  assert.deepEqual(report.byType, { 'code-review': 12, 'code-completion': 12, 'system-design': 8, 'engineering-scenario': 8 });
  assert.deepEqual(report.byTopic, { kotlin: 5, coroutines: 4, flow: 3, lifecycle: 3, compose: 4, architecture: 3, networking: 2, storage: 4, background: 3, performance: 3, 'testing-security-build': 3, 'system-design': 3 });
  assert.deepEqual(report.byDifficulty, { Junior: 10, Mid: 17, Senior: 13 });
  assert.equal(challengeBank.targetCount - report.total, 110);
});

test('curriculum preserves 201 numbered question records and source fingerprint', () => {
  assert.equal(curriculumSource.cardCount, 201);
  assert.equal(curriculumCards.length, 201);
  assert.match(curriculumSource.sha256, /^[a-f0-9]{64}$/);
  assert.equal(new Set(curriculumCards.map(c => c.id)).size, 201);
  assert.equal(new Set(curriculumCards.map(c => c.section)).size, 8);
  curriculumCards.forEach((card, index) => {
    assert.equal(card.id, `fc-${String(index + 1).padStart(3, '0')}`);
    assert.ok(card.question.trim());
  });
  const report = coverage(challengeBank.challenges);
  assert.equal(report.sourceCardsCovered + report.sourceCardsNotYetUsed.length, 201);
});

test('validation rejects duplicate IDs, normalized titles and prompts', () => {
  const duplicate = structuredClone(codeReviews[0]!);
  duplicate.title = '  THE COPIED BASKET changes its original! ';
  assert.ok(validateChallenges([codeReviews[0], duplicate]).some(e => e.includes('duplicate id')));
  assert.ok(validateChallenges([codeReviews[0], duplicate]).some(e => e.includes('duplicate title')));
  assert.ok(validateChallenges([codeReviews[0], duplicate]).some(e => e.includes('duplicate prompt')));
});

test('validation rejects missing metadata, answers, rubrics and invalid enums', () => {
  for (const field of ['id', 'title', 'prompt', 'referenceAnswer', 'explanation', 'assumptions', 'followUps', 'rubric', 'references', 'provenance']) {
    const bad = { ...codeReviews[0] } as Record<string, unknown>; delete bad[field];
    assert.ok(validateChallenges([bad]).length, `Missing ${field} must fail`);
  }
  for (const [field, value] of [['type', 'trivia'], ['topic', 'unknown'], ['difficulty', 'Expert'], ['estimatedMinutes', 0], ['estimatedMinutes', 1.5]]) {
    assert.ok(validateChallenges([{ ...codeReviews[0], [String(field)]: value }]).length);
  }
  assert.ok(validateChallenges([null, 42, 'invalid']).length === 3);
  assert.ok(validateChallenges([{ ...codeReviews[0], rubric: [{ criterion: 'x', evidence: '', points: -1 }] }]).length);
});

test('each discriminant requires its own structure and rejects unrelated format fields', () => {
  for (const [challenge, field] of [[codeReviews[0], 'issues'], [codeCompletions[0], 'blanks'], [systemDesigns[0], 'solutionOutline'], [engineeringScenarios[0], 'responseSteps']] as const) {
    const bad: Record<string, unknown> = { ...challenge }; delete bad[field];
    assert.ok(validateChallenges([bad]).length, `${challenge!.type} requires ${field}`);
  }
  assert.ok(validateChallenges([{ ...systemDesigns[0], alternatives: [] }]).length);
  assert.ok(validateChallenges([{ ...codeReviews[0], blanks: [] }]).some(e => e.includes('unexpected')));
  assert.ok(validateChallenges([{ ...codeCompletions[0], type: 'code-review' }]).length);
});

test('references require official direct URLs and provenance IDs must resolve', () => {
  const original = codeReviews[0]!;
  for (const url of ['not a url', 'http://developer.android.com/topic/architecture', 'https://example.com/', 'https://user:pass@kotlinlang.org/docs/home.html', 'https://kotlinlang.org/docs/home.html?token=secret']) {
    assert.ok(validateChallenges([{ ...original, references: [{ ...original.references[0], url }] }]).length, url);
  }
  assert.ok(validateChallenges([{ ...original, references: [original.references[0], original.references[0]] }]).length);
  assert.ok(validateChallenges([{ ...original, provenance: { ...original.provenance, cardIds: ['fc-999'] } }]).length);
  assert.ok(validateChallenges([{ ...original, provenance: { ...original.provenance, libraryTopicIds: ['missing-topic'] } }]).length);
});

test('all accepted blank combinations substitute deterministically without claiming compilation', () => {
  for (const challenge of codeCompletions) {
    let alternatives: Record<string, string>[] = [{}];
    for (const blank of challenge.blanks) alternatives = alternatives.flatMap(choice => blank.acceptedAnswers.map(answer => ({ ...choice, [blank.id]: answer })));
    for (const choice of alternatives) {
      const result = completeCode(challenge, choice);
      assert.ok(!result.includes('BLANK:'));
      for (const answer of Object.values(choice)) assert.ok(result.includes(answer));
    }
    assert.throws(() => completeCode(challenge, {}), /unsupported answer/);
    assert.equal(challenge.snippet.verification, 'not-compiled');
  }
});

test('blank marker mismatches, repeated markers, empty keys and contradictory keys fail', () => {
  const c = codeCompletions[0]!;
  for (const code of [c.snippet.code.replace('NONBLANK', 'UNKNOWN'), c.snippet.code + '\n/*BLANK:NONBLANK*/', c.snippet.code.replace('/*BLANK:NONBLANK*/', '/*BLANK:bad-id*/')]) {
    assert.ok(validateChallenges([{ ...c, snippet: { ...c.snippet, code } }]).length);
  }
  assert.ok(validateChallenges([{ ...c, blanks: [{ ...c.blanks[0], acceptedAnswers: [] }] }]).length);
  assert.ok(validateChallenges([{ ...c, blanks: [{ ...c.blanks[0], commonIncorrectAnswers: [{ answer: c.blanks[0]!.acceptedAnswers[0], reason: 'Contradiction' }] }] }]).length);
});

test('compiler candidate fixtures derive from actual bank snippets and include behavioral checks', () => {
  const fixtures = standaloneFixtures(challengeBank.challenges);
  assert.deepEqual(fixtures.map(f => f.id), ['acr-001', 'acr-012', 'acc-001', 'acc-002', 'acc-009']);
  for (const fixture of fixtures) {
    assert.match(fixture.code, /fun main\(/);
    assert.match(fixture.code, /check\(/);
    assert.ok(!fixture.code.includes('BLANK:'));
  }
  const bad = { ...codeReviews[0], snippet: { ...codeReviews[0]!.snippet, verification: 'compiled' } };
  assert.ok(validateChallenges([bad]).some(e => e.includes('compilation claim')));
});
