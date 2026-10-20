export interface ScheduleEpoch { version: string; effectiveFrom: string; ids: readonly string[] }
export interface DailySchedule { schemaVersion: 1; flashcards: readonly ScheduleEpoch[]; challenges: readonly ScheduleEpoch[] }
export interface DailyAssignment { date: string; flashcardId: string; challengeId: string; flashcardVersion: string; challengeVersion: string }
const dayMs = 86_400_000;
export function dayNumber(day: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error('Expected a UTC YYYY-MM-DD date');
  const time = Date.parse(day + 'T00:00:00.000Z');
  if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== day) throw new Error('Invalid UTC date');
  return time / dayMs;
}
export function utcDay(now: Date): string {
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid clock');
  return now.toISOString().slice(0, 10);
}
export function nextUtcMidnight(now: Date): number { return (dayNumber(utcDay(now)) + 1) * dayMs; }

const pacificClock = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', hourCycle: 'h23',
});
function pacificParts(now: Date) {
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid clock');
  const parts = Object.fromEntries(pacificClock.formatToParts(now).map(p => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}
/** The first 1 a.m. starts the day when the autumn clock repeats that hour. */
export function dailyDay(now: Date): string {
  const { date, hour } = pacificParts(now);
  return hour < 1 ? new Date((dayNumber(date) - 1) * dayMs).toISOString().slice(0, 10) : date;
}
export function nextDailyReset(now: Date): number {
  const nextDate = new Date((dayNumber(dailyDay(now)) + 1) * dayMs).toISOString().slice(0, 10);
  for (const hour of [8, 9]) {
    const candidate = Date.parse(`${nextDate}T0${hour}:00:00.000Z`);
    const local = pacificParts(new Date(candidate));
    if (local.date === nextDate && local.hour === 1) return candidate;
  }
  throw new Error('Could not resolve Pacific reset');
}

/** Epoch pools are committed snapshots: never modulo the current live catalog length. */
export function assignmentForDate(day: string, schedule: DailySchedule): DailyAssignment | null {
  const number = dayNumber(day);
  const choose = (epochs: readonly ScheduleEpoch[]) => {
    const epoch = [...epochs].reverse().find(e => dayNumber(e.effectiveFrom) <= number);
    if (!epoch) return null;
    if (!epoch.ids.length) throw new Error('Empty daily schedule');
    return { id: epoch.ids[(number - dayNumber(epoch.effectiveFrom)) % epoch.ids.length]!, version: epoch.version };
  };
  const flashcard = choose(schedule.flashcards), challenge = choose(schedule.challenges);
  return flashcard && challenge ? { date: day, flashcardId: flashcard.id, challengeId: challenge.id, flashcardVersion: flashcard.version, challengeVersion: challenge.version } : null;
}

export function validateSchedule(schedule: DailySchedule, flashcardIds: ReadonlySet<string>, challengeIds: ReadonlySet<string>): string[] {
  const errors: string[] = [];
  if (schedule.schemaVersion !== 1) errors.push('Unsupported schedule schema');
  for (const [name, epochs, known] of [['flashcards', schedule.flashcards, flashcardIds], ['challenges', schedule.challenges, challengeIds]] as const) {
    if (!epochs.length) errors.push(`${name}: missing schedule`);
    const versions = new Set<string>();
    for (const [i, epoch] of epochs.entries()) {
      if (!epoch.version || versions.has(epoch.version)) errors.push(`${name}: duplicate/empty version`);
      versions.add(epoch.version);
      if (!epoch.ids.length || new Set(epoch.ids).size !== epoch.ids.length) errors.push(`${name}: empty/duplicate pool`);
      for (const id of epoch.ids) if (!known.has(id)) errors.push(`${name}: unknown ID ${id}`);
      try {
        const start = dayNumber(epoch.effectiveFrom), previous = epochs[i - 1];
        if (previous) {
          const elapsed = start - dayNumber(previous.effectiveFrom);
          if (elapsed <= 0 || elapsed % previous.ids.length !== 0) errors.push(`${name}: new epoch must start on a later complete-cycle boundary`);
        }
      } catch { errors.push(`${name}: invalid date`); }
    }
  }
  return errors;
}

export function validatePublishedEpochs(schedule: DailySchedule, published: Pick<DailySchedule, 'flashcards' | 'challenges'>, asOf = utcDay(new Date())): string[] {
  const errors: string[] = [];
  for (const stream of ['flashcards', 'challenges'] as const) for (const locked of published[stream]) {
    const current = schedule[stream].find(epoch => epoch.version === locked.version);
    if (!current || current.effectiveFrom !== locked.effectiveFrom || JSON.stringify(current.ids) !== JSON.stringify(locked.ids)) errors.push(`${stream}: published epoch ${locked.version} was changed or removed`);
  }
  for (const stream of ['flashcards', 'challenges'] as const) for (const epoch of schedule[stream]) {
    if (!published[stream].some(locked => locked.version === epoch.version) && epoch.effectiveFrom <= asOf) errors.push(`${stream}: an unpublished epoch must begin after today's UTC date; do not backdate assignments`);
  }
  return errors;
}
