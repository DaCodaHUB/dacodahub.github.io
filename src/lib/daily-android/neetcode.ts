import { neetcodeProblems as problems } from '../../data/neetcode/problems.ts';
import { prerequisites, roadmapOrder } from '../../data/neetcode/roadmap.ts';
import { localDay, dayIndex } from './calendar.ts';
import type { StorageAdapter } from './progress.ts';

export const neetcodePrefix = 'daily-android:neetcode:v1:';
export type ProblemStatus = 'completed' | 'needs-review';
export const categories = roadmapOrder.filter(topic => problems.some(p => p.topic === topic));
export function categoryProgress(topic: string, status: (id: string) => ProblemStatus | undefined) {
  const bank = problems.filter(p => p.topic === topic);
  const completed = bank.filter(p => status(p.id) === 'completed').length;
  return { completed, total: bank.length, complete: bank.length > 0 && completed === bank.length };
}
export function defaultCategory(status: (id: string) => ProblemStatus | undefined) {
  return categories.find(topic => !categoryProgress(topic, status).complete) ?? categories[0]!;
}
export function dailyProblem(topic: string, status: (id: string) => ProblemStatus | undefined, day: number, yesterday?: string) {
  const bank = problems.filter(p => p.topic === topic);
  const incomplete = bank.filter(p => status(p.id) !== 'completed');
  if (incomplete.length && requiredTopics(topic).some(parent => !categoryProgress(parent, status).complete)) return undefined;
  const eligible = incomplete.length ? incomplete : bank;
  if (!eligible.length) return undefined;
  const pick = eligible[dayIndex(day, eligible.length)]!;
  return pick.id === yesterday && eligible.length > 1 ? eligible[(eligible.indexOf(pick) + 1) % eligible.length] : pick;
}
/** All transitive prerequisite topics, for context while freely browsing practice. */
export function requiredTopics(topic: string): string[] {
  return [...new Set((prerequisites[topic] ?? []).flatMap(parent => [
    ...requiredTopics(parent), parent,
  ]))];
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
    category() { const value = read('category'); return categories.find(c => c === value) ?? defaultCategory(status); },
    selectCategory(topic: string) { if (!categories.some(c => c === topic)) throw Error('Unknown category'); write('category', topic); },
    daily(topic: string, day = localDay()) {
      const key = 'daily:' + topic;
      let previous: { day: number; id: string } | undefined;
      try {
        const raw = JSON.parse(read(key) ?? 'null');
        if (raw && Number.isInteger(raw.day) && problems.some(p => p.id === raw.id && p.topic === topic)) previous = raw;
      } catch { /* Ignore obsolete snapshots, never modify progress. */ }
      if (previous?.day === day) return problems.find(p => p.id === previous.id);
      const pick = dailyProblem(topic, status, day, previous?.day === day - 1 ? previous.id : undefined);
      if (pick) write(key, JSON.stringify({ day, id: pick.id }));
      return pick;
    },
    currentProblem() { const id = read('current'); return problems.find(p => p.id === id); },
    visit(id: string) { validId(id); write('current', id); },
    setStatus(id: string, value: ProblemStatus) { validId(id); write('problem:' + id, value); },
    get sessionOnly() { return sessionOnly; },
  };
}
