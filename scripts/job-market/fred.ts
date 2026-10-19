import { request } from './http.ts';
import type { Fetcher } from './http.ts';
import { employment } from './sources.ts';
import { normalize, numericValue, observationDate } from './normalize.ts';
import type { Observation } from './types.ts';

export function parseFred(payload: unknown): Observation[] {
  if (!payload || typeof payload !== 'object') throw new Error('Invalid FRED response');
  const data = payload as Record<string, unknown>;
  if (!Array.isArray(data.observations) || !Number.isInteger(data.count) || data.count !== data.observations.length || data.offset !== 0) {
    throw new Error('Invalid or truncated FRED response');
  }
  return data.observations.map((row: unknown) => {
    if (!row || typeof row !== 'object') throw new Error('Invalid FRED observation');
    const item = row as Record<string, unknown>;
    return { date: observationDate(item.date), value: numericValue(item.value) };
  });
}

export async function fetchEmployment(apiKey: string | undefined, fetcher?: Fetcher, now = new Date()) {
  if (!apiKey?.trim()) throw new Error('Set FRED_API_KEY to retrieve FRED data');
  const url = new URL(employment.downloadUrl);
  Object.entries({ series_id: employment.id, api_key: apiKey, file_type: 'json', units: 'lin',
    observation_start: '1776-07-04', observation_end: now.toISOString().slice(0, 10),
    sort_order: 'asc', limit: '100000', offset: '0' }).forEach(([name, value]) => url.searchParams.set(name, value));
  const response = await request(url, 'FRED', fetcher);
  let payload: unknown;
  try { payload = await response.json(); } catch { throw new Error('Invalid FRED JSON'); }
  return normalize(employment, parseFred(payload), now);
}
