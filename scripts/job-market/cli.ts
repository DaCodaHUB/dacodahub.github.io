import { mkdir, rename, writeFile } from 'node:fs/promises';
import { fetchIndeed } from './indeed.ts';
import { fetchEmployment } from './fred.ts';

const args = process.argv.slice(2);
if (args.some(arg => arg !== '--indeed-only') || args.length > 1) {
  console.error('Usage: npm run data:fetch -- [--indeed-only]');
  process.exitCode = 1;
} else {
  try {
    const indeedOnly = args.includes('--indeed-only');
    if (!indeedOnly && !process.env.FRED_API_KEY?.trim()) throw new Error('Set FRED_API_KEY or explicitly use --indeed-only');
    const now = new Date();
    const series = [await fetchIndeed(undefined, now)];
    if (!indeedOnly) series.push(await fetchEmployment(process.env.FRED_API_KEY, undefined, now));
    const stale = series.filter(item => item.freshness.stale);
    if (stale.length) throw new Error(`Stale observations: ${stale.map(item => item.id).join(', ')}. Existing files retained.`);
    const directory = new URL('../../public/data/job-market/', import.meta.url);
    await mkdir(directory, { recursive: true });
    // Partial runs use a separate filename and cannot overwrite the complete bundle.
    const filename = indeedOnly ? 'indeed.json' : 'market-data.json';
    const target = new URL(filename, directory);
    const temporary = new URL(`${filename}.${process.pid}.tmp`, directory);
    await writeFile(temporary, JSON.stringify({ schemaVersion: 1, generatedAt: now.toISOString(), complete: !indeedOnly, series }, null, 2) + '\n');
    await rename(temporary, target);
    for (const item of series) console.log(`${item.id}: ${item.observations.length} observations, latest ${item.latestObservationDate}, ${item.missingCount} missing`);
    console.log(`Wrote public/data/job-market/${filename}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Data ingestion failed');
    process.exitCode = 1;
  }
}
