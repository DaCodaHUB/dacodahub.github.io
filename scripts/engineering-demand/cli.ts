import { readFile, mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchOnet, fetchBls, refreshDemand, restorePublished, validateDemand } from './pipeline.ts';
import { parseBlsRows, parseBlsWorkbook, projectionPeriod, sha256 } from './parse.ts';
import { occupations, blsTableUrl, blsDownloadUrl, blsLicenseUrl } from './sources.ts';
import type { DemandData, SourceMetadata } from './types.ts';

export const outputPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../public/data/engineering-demand/demand.json');
export async function readValidated(path: string): Promise<DemandData | null> {
  try {
    const data: unknown = JSON.parse(await readFile(path, 'utf8'));
    validateDemand(data);
    return data;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error; // A corrupt previous snapshot must never silently become the fallback.
  }
}
export async function writeValidated(path: string, data: DemandData) {
  validateDemand(data);
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.tmp`;
  await writeFile(temporary, JSON.stringify(data, null, 2) + '\n', 'utf8');
  await rename(temporary, path);
}

export async function readOfficialExtract(path: string) {
  const text = await readFile(path, 'utf8');
  const extract = JSON.parse(text);
  if (extract.sourceUrl !== blsTableUrl || typeof extract.description !== 'string' || !Array.isArray(extract.rows)) throw new Error('Invalid official table extract');
  const source: SourceMetadata = { url: blsTableUrl, downloadUrl: blsDownloadUrl, attribution: 'U.S. Bureau of Labor Statistics, Employment Projections, Table 1.2 (reviewed official HTML extract)', licenseUrl: blsLicenseUrl, retrievedAt: extract.retrievedAt, publicationDate: extract.publicationDate, period: projectionPeriod(String(extract.rows[0]?.[0])), retrievalMethod: 'official-table-extract', sha256: sha256(text) };
  return parseBlsRows(extract.rows, occupations, source);
}

async function main() {
  const args = process.argv.slice(2);
  const allowed = new Set(['--validate-only', '--restore-published', '--bls-extract', '--bls-xlsx']);
  let localExtract: string | undefined, localXlsx: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (!allowed.has(args[i]!)) throw new Error(`Unknown argument: ${args[i]}`);
    if (args[i] === '--bls-extract' || args[i] === '--bls-xlsx') {
      const option = args[i++];
      if (!args[i] || args[i]!.startsWith('--')) throw new Error(`${option} needs a file path`);
      if (option === '--bls-extract') localExtract = args[i]; else localXlsx = args[i];
    }
  }
  if (localExtract && localXlsx) throw new Error('Choose one local BLS input');
  let previous = await readValidated(outputPath);
  if (args.includes('--validate-only')) {
    if (!previous) throw new Error('No generated explorer dataset');
    console.log(`Validated ${previous.occupations.length} occupations; ${previous.generatedAt}`); return;
  }
  if (args.includes('--restore-published')) {
    previous = await restorePublished(previous);
  }
  const at = new Date().toISOString();
  const bls = localExtract ? () => readOfficialExtract(resolve(localExtract!))
    : localXlsx ? async () => parseBlsWorkbook(await readFile(resolve(localXlsx!)), occupations, at) : fetchBls;
  const data = await refreshDemand(previous, at, { onet: fetchOnet, bls });
  await writeValidated(outputPath, data);
  console.log(`Engineering Demand: O*NET ${data.refresh.onet}, BLS ${data.refresh.bls}; ${data.occupations.length} occupations.`);
  for (const message of data.refresh.messages) {
    console.warn(message);
    if (process.env.GITHUB_ACTIONS) console.warn(`::warning::${message.replace(/[\r\n]/g, ' ')}`);
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(`Engineering Demand refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`); process.exitCode = 1; });
}
