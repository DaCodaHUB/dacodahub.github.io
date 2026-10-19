import type { NormalizedSeries, Observation, SeriesDefinition } from './types.ts';

export function observationDate(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) {
    throw new Error('Invalid observation date');
  }
  return value;
}

export function numericValue(value: unknown): number | null {
  if (typeof value !== 'string') throw new Error('Invalid observation value');
  const text = value.trim();
  if (text === '' || text === '.') return null;
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) throw new Error('Invalid numeric value');
  const result = Number(text);
  if (!Number.isFinite(result) || result < 0) throw new Error('Invalid economic value');
  return result;
}

export function normalize(definition: SeriesDefinition, rows: Observation[], now = new Date()): NormalizedSeries {
  const retrievedAt = now.toISOString();
  const today = retrievedAt.slice(0, 10);
  const seen = new Set<string>();
  const observations = rows.map(({ date, value }) => {
    observationDate(date);
    if (date > today || seen.has(date)) throw new Error('Future or duplicate observation date');
    if (definition.frequency === 'monthly' && !date.endsWith('-01')) throw new Error('Invalid monthly observation date');
    if (value !== null && (!Number.isFinite(value) || value < 0)) throw new Error('Invalid economic value');
    seen.add(date);
    return { date, value };
  }).sort((a, b) => a.date.localeCompare(b.date));
  const latest = observations.findLast(row => row.value !== null);
  if (!latest) throw new Error('Source contains no usable observations');
  const ageDays = Math.floor((Date.parse(today) - Date.parse(latest.date)) / 86_400_000);
  return {
    ...definition, retrievedAt, latestObservationDate: latest.date,
    freshness: { evaluatedAt: retrievedAt, ageDays, stale: ageDays > definition.staleAfterDays },
    missingCount: observations.filter(row => row.value === null).length,
    observations,
  };
}
