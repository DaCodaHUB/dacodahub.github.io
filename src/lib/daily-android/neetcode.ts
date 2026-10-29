import { neetcodeProblems as problems } from '../../data/neetcode/problems.ts';
import { prerequisites } from '../../data/neetcode/roadmap.ts';
import type { StorageAdapter } from './progress.ts';

export const neetcodePrefix = 'daily-android:neetcode:v1:';
export type ProblemStatus = 'completed' | 'needs-review';
/** All transitive prerequisite topics, for context while freely browsing practice. */
export function requiredTopics(topic: string): string[] {
  return [...new Set((prerequisites[topic] ?? []).flatMap(parent => [
    ...requiredTopics(parent), parent,
  ]))];
}
/** No date input: midnight and new sessions cannot advance the roadmap. */
export function recommendedProblem(status: (id: string) => ProblemStatus | undefined) {
  return problems.find(problem => status(problem.id) !== 'completed');
}
export function adjacentProblem(id: string, offset: -1 | 1) {
  const index = problems.findIndex(problem => problem.id === id);
  return problems[Math.min(problems.length - 1, Math.max(0, index + offset))]!;
}
export function createNeetcodeStore(storage: () => StorageAdapter, notify: (message: string) => void = () => {}) {
  const memory = new Map<string, string>();
  let sessionOnly = false;
  function read(key: string) {
    if (sessionOnly) return memory.get(key);
    try { return storage().getItem(neetcodePrefix + key) ?? undefined; }
    catch { fail(); return memory.get(key); }
  }
  function fail() { sessionOnly = true; notify('NeetCode storage is unavailable. Progress stays only for this page session.'); }
  function write(key: string, value: string) {
    memory.set(key, value);
    if (!sessionOnly) try { storage().setItem(neetcodePrefix + key, value); } catch { fail(); }
  }
  const validId = (id: string) => { if (!problems.some(p => p.id === id)) throw Error('Unknown NeetCode problem'); };
  const status = (id: string): ProblemStatus | undefined => {
    validId(id);
    const value = read('problem:' + id);
    if (value === 'completed' || value === 'needs-review') { memory.set('problem:' + id, value); return value; }
    return undefined;
  };
  return {
    status,
    currentProblem() { const id = read('current'); return problems.find(p => p.id === id); },
    visit(id: string) { validId(id); write('current', id); },
    setStatus(id: string, value: ProblemStatus) { validId(id); write('problem:' + id, value); },
    get sessionOnly() { return sessionOnly; },
  };
}
