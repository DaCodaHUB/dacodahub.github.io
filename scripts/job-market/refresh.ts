import { normalize } from './normalize.ts';
import { calculateHealth } from './health.ts';
import { indeed, employment } from './sources.ts';
import type { NormalizedSeries, Observation } from './types.ts';
import type { HealthOutput } from './health-types.ts';
import { request } from './http.ts';
import type { Fetcher } from './http.ts';
import { preserveHealthSnapshot } from './snapshot.ts';

export interface DataBundle { schemaVersion: 1; generatedAt: string; complete: boolean; series: NormalizedSeries[] }
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid dataset object');
  return value as Record<string, unknown>;
}
function timestamp(value: unknown, latest: Date): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value)) || Date.parse(value) > latest.getTime()) throw new Error('Invalid dataset timestamp');
  return value;
}

// Reconstruct only approved fields; never copy arbitrary downloaded metadata to public JSON.
export function validateBundle(payload: unknown, now = new Date()): DataBundle {
  const bundle = object(payload);
  if (bundle.schemaVersion !== 1 || typeof bundle.complete !== 'boolean' || !Array.isArray(bundle.series)) throw new Error('Invalid dataset envelope');
  const generatedAt = timestamp(bundle.generatedAt, now);
  const expected = bundle.complete ? [indeed, employment] : [indeed];
  if (bundle.series.length !== expected.length) throw new Error('Incomplete or duplicate dataset');
  const series = expected.map(definition => {
    const matches = (bundle.series as unknown[]).filter(raw => object(raw).id === definition.id);
    if (matches.length !== 1) throw new Error('Required source missing or duplicated');
    const raw = object(matches[0]);
    if (raw.units !== definition.units || raw.frequency !== definition.frequency || raw.seasonalAdjustment !== definition.seasonalAdjustment || !Array.isArray(raw.observations)) throw new Error('Invalid source schema');
    const retrievedAt = timestamp(raw.retrievedAt, new Date(generatedAt));
    const observations: Observation[] = raw.observations.map(value => {
      const row = object(value);
      if (typeof row.date !== 'string' || (row.value !== null && typeof row.value !== 'number')) throw new Error('Invalid source observation');
      return { date: row.date, value: row.value as number | null };
    });
    return normalize(definition, observations, new Date(retrievedAt));
  });
  return { schemaVersion: 1, generatedAt, complete: bundle.complete, series };
}

export function preventRegression(previous: DataBundle, candidate: DataBundle): void {
  for (const old of previous.series) {
    const next = candidate.series.find(source => source.id === old.id);
    if (!next || next.latestObservationDate < old.latestObservationDate || next.observations[0]!.date > old.observations[0]!.date) throw new Error('Source history or latest date regressed');
    const available = new Set(next.observations.filter(row => row.value !== null).map(row => row.date));
    if (old.observations.some(row => row.value !== null && !available.has(row.date))) throw new Error('Previously available observations are missing from candidate');
  }
}

export async function restorePublished(local: () => Promise<DataBundle>, now = new Date(), fetcher: Fetcher = fetch): Promise<DataBundle> {
  const origin = 'https://dacodahub.github.io/data/job-market/';
  for (const filename of ['market-data.json', 'indeed.json']) {
    let missing = false;
    const read: Fetcher = async (url, init) => {
      const response = await fetcher(url, { ...init, cache: 'no-store' });
      if (response.status === 404) missing = true;
      return response;
    };
    let response: Response;
    try { response = await request(new URL(filename, origin), 'Published dataset', read); }
    catch {
      if (missing) continue;
      throw new Error('Published dataset could not be restored; live site left unchanged');
    }
    const bundle = validateBundle(await response.json(), now);
    if (filename === 'market-data.json' && !bundle.complete) throw new Error('Published complete dataset is partial');
    return bundle;
  }
  // Initial deployment only: neither dataset URL exists on the current portfolio.
  return validateBundle(await local(), now);
}

export async function refreshMarket(previous: DataBundle, fetchSources: () => Promise<NormalizedSeries[]>, now = new Date(), previousHealth?: HealthOutput): Promise<{ data: DataBundle; health: HealthOutput; status: 'updated' | 'retained' }> {
  // Baseline validation errors are fatal, outside the source-outage fallback.
  const baseline = validateBundle(previous, now);
  let data = baseline, status: 'updated' | 'retained' = 'retained';
  try {
    const candidate = validateBundle({ schemaVersion: 1, generatedAt: now.toISOString(), complete: true, series: await fetchSources() }, now);
    const assessment = calculateHealth(candidate, now);
    if (assessment.freshness.sources.some(source => source.status !== 'fresh')) throw new Error('Candidate observations are stale or invalid');
    preventRegression(baseline, candidate);
    data = candidate; status = 'updated';
  } catch {
    // Deliberately omit provider errors, response bodies and URLs from published status.
    // These can contain FRED query credentials. Tests/runtime failures outside fetching remain fatal.
  }
  const health = calculateHealth(data, now);
  health.dataGeneratedAt = data.generatedAt;
  preserveHealthSnapshot(health, previousHealth, status === 'updated');
  health.update = { status, attemptedAt: now.toISOString(), dataGeneratedAt: data.generatedAt,
    message: status === 'updated' ? 'Both sources refreshed and validated.' : 'Latest refresh failed validation or retrieval. Previous validated observations retained.' };
  return { data, health, status };
}
