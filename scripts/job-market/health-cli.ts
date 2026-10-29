import { readFile, writeFile, rename } from 'node:fs/promises';
import { calculateHealth } from './health.ts';
import { readHealthSnapshot, preserveHealthSnapshot } from './snapshot.ts';

const directory = new URL('../../public/data/job-market/', import.meta.url);
try {
  if (process.argv.length !== 2) throw new Error('Usage: npm run data:health');
  let payload: unknown;
  try { payload = JSON.parse(await readFile(new URL('market-data.json', directory), 'utf8')); }
  catch (error) {
    // Allow an honest partial result before a FRED key has been configured.
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw new Error('Invalid market-data.json; existing output retained');
    payload = JSON.parse(await readFile(new URL('indeed.json', directory), 'utf8'));
  }
  const output = calculateHealth(payload);
  const previous = await readHealthSnapshot();
  output.dataGeneratedAt = (payload as { generatedAt: string }).generatedAt;
  preserveHealthSnapshot(output, previous, output.dataGeneratedAt !== (previous?.dataGeneratedAt ?? previous?.update?.dataGeneratedAt ?? previous?.generatedAt));
  const temporary = new URL(`market-health.json.${process.pid}.tmp`, directory);
  await writeFile(temporary, JSON.stringify(output, null, 2) + '\n');
  await rename(temporary, new URL('market-health.json', directory));
  console.log(`${output.current.classification}; reference month ${output.current.referenceMonth}; score ${output.current.score ?? 'unavailable'}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Assessment generation failed');
  process.exitCode = 1;
}
