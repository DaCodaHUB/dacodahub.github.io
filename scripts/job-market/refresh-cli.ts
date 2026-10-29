import { readFile, writeFile, mkdir, rename, appendFile } from 'node:fs/promises';
import { fetchIndeed } from './indeed.ts';
import { fetchEmployment } from './fred.ts';
import { validateBundle, refreshMarket, restorePublished } from './refresh.ts';
import type { DataBundle } from './refresh.ts';
import { readHealthSnapshot } from './snapshot.ts';

const directory = new URL('../../public/data/job-market/', import.meta.url);
async function localBaseline(now: Date): Promise<DataBundle> {
  try { return validateBundle(JSON.parse(await readFile(new URL('market-data.json', directory), 'utf8')), now); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw new Error('Local complete dataset is invalid; refusing fallback');
    return validateBundle(JSON.parse(await readFile(new URL('indeed.json', directory), 'utf8')), now);
  }
}

try {
  const args = process.argv.slice(2);
  if (args.length > 1 || args.some(arg => arg !== '--restore-published')) throw new Error('Usage: npm run data:refresh -- [--restore-published]');
  const now = new Date();
  const baseline = args.includes('--restore-published') ? await restorePublished(() => localBaseline(now), now) : await localBaseline(now);
  const previousHealth = await readHealthSnapshot(args.includes('--restore-published'));
  const result = await refreshMarket(baseline, async () => {
    if (!process.env.FRED_API_KEY?.trim()) throw new Error('FRED_API_KEY missing');
    return [await fetchIndeed(undefined, now), await fetchEmployment(process.env.FRED_API_KEY, undefined, now)];
  }, now, previousHealth);
  const files = [
    { name: result.data.complete ? 'market-data.json' : 'indeed.json', value: result.data },
    { name: 'market-health.json', value: result.health },
  ];
  await mkdir(directory, { recursive: true });
  // Calculate and stage both files before replacing either; failures stop the Pages build.
  for (const file of files) await writeFile(new URL(`${file.name}.${process.pid}.tmp`, directory), JSON.stringify(file.value, null, 2) + '\n');
  for (const file of files) await rename(new URL(`${file.name}.${process.pid}.tmp`, directory), new URL(file.name, directory));
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `refresh_status=${result.status}\n`);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY,
    `## Market data: ${result.status}\n\n${result.health.update!.message}\n\nLast data generation: ${result.data.generatedAt}\n\nAssessment: ${result.health.current.classification}\n\n` +
    result.health.freshness.sources.map(source => `- ${source.id}: ${source.status}; latest observation ${source.latestObservationDate ?? 'unavailable'}; age ${source.ageDays ?? 'unavailable'} days\n`).join(''));
  console.log(`Market data ${result.status}; observation timestamps preserved; assessment ${result.health.current.classification}.`);
  if (result.status === 'retained' && process.env.GITHUB_ACTIONS) console.log('::warning::Source refresh failed. Retained validated data will be deployed with recalculated freshness.');
} catch {
  console.error('Market refresh could not prepare a validated dataset. Build/deployment must stop; the live site remains unchanged.');
  process.exitCode = 1;
}
