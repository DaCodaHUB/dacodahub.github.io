import { challengeTypes, challengeTopics, difficulties } from '../../src/data/android-challenges/types.ts';
import type { Challenge, CodeCompletionChallenge } from '../../src/data/android-challenges/types.ts';
import { curriculumCards } from '../../src/data/android-challenges/curriculum.ts';
import { topics } from '../../src/data/android-fundamentals/topics.ts';

const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.length > 0 && v.every(text);
const canonical = (v: string) => v.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const cardIds = new Set<string>(curriculumCards.map(c => c.id));
const libraryIds = new Set(topics.map(t => t.id));

/** Structural/content-contract validation, not proof that an Android solution executes correctly. */
export function validateChallenges(input: readonly unknown[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>(), titles = new Set<string>(), prompts = new Set<string>();
  const fail = (id: string, message: string) => errors.push(`${id}: ${message}`);
  for (const [position, value] of input.entries()) {
    if (!record(value)) { fail(String(position), 'challenge must be an object'); continue; }
    const id = text(value.id) ? value.id : `entry-${position}`;
    for (const field of ['id', 'title', 'prompt', 'referenceAnswer', 'explanation']) if (!text(value[field])) fail(id, `missing ${field}`);
    if (!/^(acr|acc|asd|aes)-\d{3}$/.test(id)) fail(id, 'invalid stable ID');
    for (const [field, seen] of [['id', ids], ['title', titles], ['prompt', prompts]] as const) {
      if (text(value[field])) { const key = canonical(value[field]); if (seen.has(key)) fail(id, `duplicate ${field}`); seen.add(key); }
    }
    if (!challengeTypes.includes(value.type as never)) fail(id, 'invalid type');
    if (!challengeTopics.includes(value.topic as never)) fail(id, 'invalid topic');
    if (!difficulties.includes(value.difficulty as never)) fail(id, 'invalid difficulty');
    if (!Number.isInteger(value.estimatedMinutes) || Number(value.estimatedMinutes) < 1 || Number(value.estimatedMinutes) > 120) fail(id, 'invalid estimatedMinutes');
    if (!strings(value.assumptions)) fail(id, 'assumptions required');
    if (!strings(value.followUps) || value.followUps.length > 2) fail(id, 'one or two followUps required');
    if (!Array.isArray(value.rubric) || value.rubric.length < 3) fail(id, 'at least three rubric criteria required');
    else for (const item of value.rubric) if (!record(item) || !text(item.criterion) || !text(item.evidence) || !Number.isInteger(item.points) || Number(item.points) <= 0) fail(id, 'invalid rubric item');
    if (!Array.isArray(value.references) || value.references.length === 0) fail(id, 'references required');
    else {
      const urls = new Set<string>();
      for (const ref of value.references) {
        if (!record(ref) || !text(ref.title) || !text(ref.url) || !text(ref.supports)) { fail(id, 'invalid reference'); continue; }
        try {
          const url = new URL(ref.url);
          if (url.protocol !== 'https:' || !['developer.android.com', 'kotlinlang.org'].includes(url.hostname) || url.username || url.password || url.search) fail(id, 'reference must be a direct official HTTPS URL');
          if (urls.has(url.href)) fail(id, 'duplicate reference'); urls.add(url.href);
        } catch { fail(id, 'invalid reference URL'); }
      }
    }
    const p = value.provenance;
    if (!record(p) || p.source !== 'android-kotlin-flashcards' || !strings(p.cardIds) || !strings(p.libraryTopicIds) || !text(p.additions)) fail(id, 'invalid provenance');
    else {
      for (const card of p.cardIds) if (!cardIds.has(card)) fail(id, `unknown source card ${card}`);
      for (const topic of p.libraryTopicIds) if (!libraryIds.has(topic)) fail(id, `unknown library topic ${topic}`);
      if (new Set(p.cardIds).size !== p.cardIds.length || new Set(p.libraryTopicIds).size !== p.libraryTopicIds.length) fail(id, 'duplicate provenance link');
    }
    const code = (sample: unknown, label: string) => {
      if (!record(sample) || !['kotlin', 'pseudocode'].includes(String(sample.language)) || !text(sample.context) || !text(sample.code) || !strings(sample.dependencies) || sample.verification !== 'not-compiled') fail(id, `invalid ${label} or unsupported compilation claim`);
    };
    const fields = (names: string[]) => { for (const name of names) if (!strings(value[name])) fail(id, `nonempty ${name} required`); };
    switch (value.type) {
      case 'code-review':
        code(value.snippet, 'snippet'); code(value.correctedImplementation, 'correction');
        if (!Array.isArray(value.issues) || !value.issues.length) fail(id, 'issues required');
        else for (const issue of value.issues) if (!record(issue) || !text(issue.location) || !text(issue.rootCause) || !text(issue.consequence)) fail(id, 'invalid issue');
        break;
      case 'code-completion': {
        code(value.snippet, 'snippet');
        const markers = record(value.snippet) && text(value.snippet.code) ? [...value.snippet.code.matchAll(/\/\*BLANK:([A-Z][A-Z0-9_]*)\*\//g)].map(m => m[1]!) : [];
        if (!Array.isArray(value.blanks) || value.blanks.length === 0) { fail(id, 'blanks required'); break; }
        const blanks: string[] = [];
        for (const blank of value.blanks) {
          if (!record(blank) || !text(blank.id) || !text(blank.instruction) || !text(blank.explanation) || !strings(blank.acceptedAnswers)) { fail(id, 'invalid blank answer key'); continue; }
          blanks.push(blank.id);
          if (!/^[A-Z][A-Z0-9_]*$/.test(blank.id)) fail(id, 'invalid blank ID');
          if (new Set(blank.acceptedAnswers.map(a => a.trim())).size !== blank.acceptedAnswers.length || blank.acceptedAnswers.some(a => a.includes('/*BLANK:'))) fail(id, 'invalid accepted answers');
          if (!Array.isArray(blank.commonIncorrectAnswers)) fail(id, 'incorrect-answer list required');
          else for (const wrong of blank.commonIncorrectAnswers) if (!record(wrong) || !text(wrong.answer) || !text(wrong.reason) || blank.acceptedAnswers.includes(String(wrong.answer))) fail(id, 'invalid incorrect-answer rationale');
        }
        if (new Set(markers).size !== markers.length || new Set(blanks).size !== blanks.length || markers.length !== blanks.length || markers.some(m => !blanks.includes(m))) fail(id, 'blank markers and keys must match exactly once');
        if (record(value.snippet) && text(value.snippet.code) && value.snippet.code.replace(/\/\*BLANK:[A-Z][A-Z0-9_]*\*\//g, '').includes('BLANK:')) fail(id, 'malformed blank marker');
        break;
      }
      case 'system-design':
        fields(['functionalRequirements', 'nonfunctionalRequirements', 'clarifyingQuestions', 'suggestedArchitecture', 'apiAndDataModel', 'offlineAndErrors', 'solutionOutline']);
        if (!Array.isArray(value.alternatives) || value.alternatives.length < 2) fail(id, 'at least two architecture alternatives required');
        else for (const a of value.alternatives) if (!record(a) || !text(a.design) || !text(a.tradeOff)) fail(id, 'invalid design alternative');
        break;
      case 'engineering-scenario':
        fields(['observations', 'constraints', 'responseSteps', 'tradeOffs']);
        if (!text(value.decisionQuestion)) fail(id, 'decisionQuestion required');
        break;
    }
    const exclusive: Record<string, string[]> = {
      'code-review': ['issues', 'correctedImplementation'], 'code-completion': ['blanks'],
      'system-design': ['functionalRequirements', 'suggestedArchitecture', 'alternatives'],
      'engineering-scenario': ['observations', 'decisionQuestion', 'responseSteps'],
    };
    for (const [type, names] of Object.entries(exclusive)) if (type !== value.type && names.some(name => name in value)) fail(id, `unexpected ${type} fields`);
  }
  return errors;
}

export function completeCode(challenge: CodeCompletionChallenge, answers: Record<string, string>): string {
  let code = challenge.snippet.code;
  for (const blank of challenge.blanks) {
    const answer = answers[blank.id];
    if (!answer || !blank.acceptedAnswers.includes(answer)) throw new Error(`${challenge.id}: unsupported answer for ${blank.id}`);
    code = code.replace(`/*BLANK:${blank.id}*/`, answer);
  }
  return code;
}

export function coverage(challenges: readonly Challenge[]) {
  const count = (key: 'type' | 'topic' | 'difficulty', values: readonly string[]) => Object.fromEntries(values.map(v => [v, challenges.filter(c => c[key] === v).length]));
  const covered = new Set(challenges.flatMap(c => c.provenance.cardIds));
  return {
    total: challenges.length,
    byType: count('type', challengeTypes), byTopic: count('topic', challengeTopics), byDifficulty: count('difficulty', difficulties),
    sourceCardsCovered: covered.size,
    sourceCardsNotYetUsed: curriculumCards.filter(c => !covered.has(c.id)).map(c => c.id),
  };
}
