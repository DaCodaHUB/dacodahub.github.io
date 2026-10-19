import { utcDay } from './schedule.ts';
export const progressPrefix = 'daily-android:v1:';
export interface FlashcardProgress { version: 1; status: 'known' | 'review-again'; reviewedAt: string }
export interface ChallengeProgress { version: 1; response?: string; completedAt?: string; completionDates: string[]; updatedAt: string }
export interface StorageAdapter { getItem(key: string): string | null; setItem(key: string, value: string): void }
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const timestamp = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
const date = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && timestamp(value + 'T00:00:00.000Z');
export function parseFlashcardProgress(raw: unknown): FlashcardProgress | undefined {
  if (!object(raw) || raw.version !== 1 || !['known', 'review-again'].includes(String(raw.status)) || !timestamp(raw.reviewedAt)) return undefined;
  return { version: 1, status: raw.status as FlashcardProgress['status'], reviewedAt: raw.reviewedAt };
}
export function parseChallengeProgress(raw: unknown): ChallengeProgress | undefined {
  if (!object(raw) || raw.version !== 1 || !timestamp(raw.updatedAt) || !Array.isArray(raw.completionDates) || !raw.completionDates.every(date) || (raw.completedAt !== undefined && !timestamp(raw.completedAt)) || (raw.response !== undefined && (typeof raw.response !== 'string' || raw.response.length > 20_000))) return undefined;
  return { version: 1, updatedAt: raw.updatedAt, completionDates: [...new Set(raw.completionDates)], ...(typeof raw.response === 'string' ? { response: raw.response } : {}), ...(typeof raw.completedAt === 'string' ? { completedAt: raw.completedAt } : {}) };
}

/** One key per content ID avoids overwriting another day's or another tab's unrelated progress. */
export function createProgressStore(storage: () => StorageAdapter, notify: (message: string) => void = () => {}) {
  const memory = new Map<string, unknown>();
  let unavailable = false;
  const warned = new Set<string>();
  const key = (kind: string, id: string) => {
    if (!(kind === 'flashcard' ? /^fc-\d{3}$/ : /^(acr|acc|asd|aes)-\d{3}$/).test(id)) throw new Error('Invalid progress ID');
    return progressPrefix + kind + ':' + id;
  };
  function read<T>(itemKey: string, parse: (value: unknown) => T | undefined): T | undefined {
    if (unavailable) return parse(memory.get(itemKey));
    try {
      const raw = storage().getItem(itemKey);
      if (raw === null) { memory.delete(itemKey); return undefined; }
      let parsed: T | undefined;
      try { parsed = parse(JSON.parse(raw)); } catch { /* Corruption falls back to this session. */ }
      if (parsed) { memory.set(itemKey, parsed); return parsed; }
      if (!warned.has(itemKey)) { warned.add(itemKey); notify('Some saved progress could not be read. You can continue and save a new review.'); }
      return parse(memory.get(itemKey));
    } catch {
      unavailable = true;
      notify('Browser storage is unavailable. Progress is kept only for this page session.');
      return parse(memory.get(itemKey));
    }
  }
  function write(itemKey: string, value: unknown) {
    memory.set(itemKey, value);
    if (unavailable) return;
    try { storage().setItem(itemKey, JSON.stringify(value)); }
    catch { unavailable = true; notify('Browser storage is unavailable or full. Progress is kept only for this page session.'); }
  }
  const flashcard = (id: string) => read(key('flashcard', id), parseFlashcardProgress);
  const challenge = (id: string) => read(key('challenge', id), parseChallengeProgress);
  return {
    flashcard, challenge,
    get sessionOnly() { return unavailable; },
    review(id: string, status: FlashcardProgress['status'], now = new Date()) {
      write(key('flashcard', id), { version: 1, status, reviewedAt: now.toISOString() } satisfies FlashcardProgress);
    },
    saveResponse(id: string, response: string | undefined, now = new Date()) {
      const previous = challenge(id);
      write(key('challenge', id), { ...previous, version: 1, response: response?.slice(0, 20_000), completionDates: previous?.completionDates ?? [], updatedAt: now.toISOString() } satisfies ChallengeProgress);
    },
    complete(id: string, now = new Date()) {
      const previous = challenge(id);
      write(key('challenge', id), { ...previous, version: 1, completedAt: now.toISOString(), completionDates: [...new Set([...(previous?.completionDates ?? []), utcDay(now)])], updatedAt: now.toISOString() } satisfies ChallengeProgress);
    },
  };
}
