import { designChallenges } from '../../data/mobile-system-design/challenges.ts';
import { questionFields, solutionFields } from '../../data/mobile-system-design/types.ts';
import type { StorageAdapter } from './progress.ts';

export function validateDesignChallenges(input: readonly unknown[]): string[] {
  const errors: string[] = [], ids = new Set<string>(), titles = new Set<string>();
  if (input.length !== 8) errors.push('Expected exactly 8 Mobile System Design challenges');
  const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
  const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
  for (const raw of input) {
    if (!record(raw)) { errors.push('Challenge must be an object'); continue; }
    const fail = (message: string) => errors.push(`${String(raw.id)}: ${message}`);
    if (!text(raw.id) || !/^msd-\d{3}$/.test(raw.id) || ids.has(raw.id)) fail('invalid or duplicate ID');
    ids.add(String(raw.id));
    if (!text(raw.title) || titles.has(raw.title)) fail('missing or duplicate title');
    titles.add(String(raw.title));
    if (!text(raw.topic) || !['Easy', 'Medium', 'Hard'].includes(String(raw.difficulty)) || typeof raw.minutes !== 'number' || raw.minutes < 20 || raw.minutes > 40) fail('invalid metadata');
    for (const [section, fields] of [['question', questionFields], ['solution', solutionFields]] as const) {
      const value = raw[section];
      for (const field of fields) if (!record(value) || !Array.isArray(value[field]) || !(value[field] as unknown[]).length || !(value[field] as unknown[]).every(text)) fail(`${section}.${field} is required`);
    }
    if (record(raw.question) && Array.isArray(raw.question.tasks) && (raw.question.tasks.length < 5 || raw.question.tasks.length > 8)) fail('Expected 5–8 design tasks');
    if (!Array.isArray(raw.references) || !raw.references.length) fail('References required');
    else for (const ref of raw.references) {
      try {
        if (!record(ref) || !text(ref.title) || !text(ref.url)) throw Error();
        const url = new URL(ref.url);
        if (url.protocol !== 'https:' || !['developer.android.com', 'www.rfc-editor.org'].includes(url.hostname) || url.username || url.password) throw Error();
      } catch { fail('Invalid reference'); }
    }
  }
  return errors;
}

export const mobileDesignPrefix = 'daily-android:mobile-system-design:v1:';
export interface DesignProgress { version: 1; status?: 'completed' | 'needs-review'; notes: string }
export function parseDesignProgress(value: unknown): DesignProgress | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const p = value as DesignProgress;
  if (p.version !== 1 || typeof p.notes !== 'string' || p.notes.length > 50_000 || (p.status !== undefined && p.status !== 'completed' && p.status !== 'needs-review')) return undefined;
  return { version: 1, notes: p.notes, ...(p.status ? { status: p.status } : {}) };
}
export function recommendedDesign(progress: (id: string) => DesignProgress | undefined) {
  return designChallenges.find(c => progress(c.id)?.status !== 'completed');
}
export function adjacentDesign(id: string, offset: -1 | 1) {
  const position = designChallenges.findIndex(c => c.id === id);
  if (position < 0) throw Error('Unknown design challenge');
  return designChallenges[Math.max(0, Math.min(designChallenges.length - 1, position + offset))]!;
}
export function createDesignStore(storage: () => StorageAdapter, notify: (message: string) => void = () => {}) {
  const memory = new Map<string, string>();
  let sessionOnly = false;
  const fail = () => { sessionOnly = true; notify('Browser storage is unavailable. Design notes and progress stay only for this page session.'); };
  function read(key: string) {
    if (sessionOnly) return memory.get(key);
    try {
      const value = storage().getItem(mobileDesignPrefix + key);
      if (value === null) memory.delete(key); else memory.set(key, value);
      return value ?? undefined;
    } catch { fail(); return memory.get(key); }
  }
  function write(key: string, value: string) {
    memory.set(key, value);
    if (!sessionOnly) try { storage().setItem(mobileDesignPrefix + key, value); } catch { fail(); }
  }
  function valid(id: string) { if (!designChallenges.some(c => c.id === id)) throw Error('Unknown design challenge'); }
  function progress(id: string) {
    valid(id); const raw = read(id);
    if (!raw) return undefined;
    try { const parsed = parseDesignProgress(JSON.parse(raw)); if (parsed) return parsed; } catch { /* Preserve usability after malformed storage. */ }
    notify('Some saved design progress could not be read. You can save new notes and progress.');
    return undefined;
  }
  return {
    progress,
    get sessionOnly() { return sessionOnly; },
    current() { const id = read('current'); return designChallenges.find(c => c.id === id); },
    visit(id: string) { valid(id); write('current', id); },
    saveNotes(id: string, notes: string) { write(id, JSON.stringify({ version: 1, ...progress(id), notes: notes.slice(0, 50_000) } satisfies DesignProgress)); },
    setStatus(id: string, status: NonNullable<DesignProgress['status']>) { write(id, JSON.stringify({ version: 1, notes: '', ...progress(id), status } satisfies DesignProgress)); },
  };
}
