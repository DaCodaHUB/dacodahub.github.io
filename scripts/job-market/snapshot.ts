import { readFile } from 'node:fs/promises';
import type { HealthOutput } from './health-types.ts';
import { request, type Fetcher } from './http.ts';

/** Comparisons use an actual saved assessment, never reconstructed chart history. */
export async function readHealthSnapshot(published = false, fetcher: Fetcher = fetch): Promise<HealthOutput | undefined> {
  let missing = false;
  try {
    const read: Fetcher = async (url, init) => {
      const response = await fetcher(url, init);
      if (response.status === 404) missing = true;
      return response;
    };
    const data = published
      ? await (await request('https://dacodahub.github.io/data/job-market/market-health.json', 'Previous assessment', read)).json()
      : JSON.parse(await readFile(new URL('../../public/data/job-market/market-health.json', import.meta.url), 'utf8'));
    if (data.schemaVersion !== 1 || !Array.isArray(data.current?.indicators) || !data.current.indicators.every((i: { values?: unknown }) => i.values && typeof i.values === 'object')) throw new Error('Invalid saved assessment');
    return data as HealthOutput;
  } catch (error) {
    if (missing || (!published && (error as NodeJS.ErrnoException).code === 'ENOENT')) return undefined;
    throw new Error('Previous assessment could not be read; saved snapshots must be retained.');
  }
}

export function preserveHealthSnapshot(next: HealthOutput, previous: HealthOutput | undefined, updated: boolean): HealthOutput {
  if (previous?.methodologyVersion === next.methodologyVersion) {
    const snapshot = updated ? previous.current : previous.previous;
    if (snapshot) next.previous = structuredClone(snapshot);
  }
  return next;
}
