import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { occupations, demandUrl } from './sources.ts';
import { numberOrNull, parseBlsRows, parseBlsWorkbook, parseCsv, parseOnetPage, parseTechnologies, projectionPeriod } from './parse.ts';
import { download, fetchOnet, refreshDemand, restorePublished, validateDemand } from './pipeline.ts';
import { readOfficialExtract, readValidated, writeValidated } from './cli.ts';
import { openingsLabel, percentLabel, periodLabel, selectOccupation, sourceStatus, topTechnologies, technologyChanges } from '../../src/lib/engineering-demand.ts';
import type { DemandData, SourceMetadata, Technologies } from './types.ts';

const at = '2026-10-19T23:45:53.000Z';
const extract = new URL('./sources/bls-2025-2035-extract.json', import.meta.url);
const fixture = JSON.parse(await readFile(extract, 'utf8'));
const bls = await readOfficialExtract(fileURLToPath(extract));
const source: SourceMetadata = { url: demandUrl(occupations[0]!.onetSoc), downloadUrl: `${demandUrl(occupations[0]!.onetSoc)}/In_Demand_15-1252-00.csv?fmt=csv`, attribution: 'Test fixture only', licenseUrl: 'https://www.onetonline.org/help/license', retrievedAt: at, publicationDate: null, period: { start: '2025-01-01', end: '2025-12-31' }, retrievalMethod: 'csv', sha256: 'a'.repeat(64) };
const onet: Record<string, Technologies> = Object.fromEntries(occupations.map(o => [o.id, parseTechnologies('Percentage,Software Skill,Hot Technology\r\n30,Test technology,Yes\r\n10,Other test technology,Yes\r\n', { ...source, url: demandUrl(o.onetSoc), downloadUrl: `${demandUrl(o.onetSoc)}/export.csv?fmt=csv` })]));
const providers = { onet: async () => structuredClone(onet), bls: async () => structuredClone(bls) };
const base = () => refreshDemand(null, at, providers);
const fail = async (): Promise<never> => { throw new Error('Temporary HTTP 403'); };
test('explorer snapshots advance on successful updates and remain stable when both providers fail', async () => {
  const first = await base();
  assert.equal(first.previous, undefined);
  const second = await refreshDemand(first, '2026-10-20T12:00:00.000Z', providers);
  assert.deepEqual(second.previous?.occupations, first.occupations);
  const failed = await refreshDemand(second, '2026-10-21T12:00:00.000Z', { onet: fail, bls: fail });
  assert.deepEqual(failed.previous, second.previous);
  const partial = await refreshDemand(second, '2026-10-21T12:00:00.000Z', { onet: fail, bls: providers.bls });
  assert.deepEqual(partial.previous?.occupations, second.occupations);
  assert.equal(Object.hasOwn(partial.previous!, 'previous'), false);
});

test('CSV handles BOM, quoted commas, quotes, embedded newlines, CRLF and trailing newline', () => {
  assert.deepEqual(parseCsv('\uFEFFa,b\r\n"Hello, ""world""","two\nlines"\r\n'), [['a', 'b'], ['Hello, "world"', 'two\nlines']]);
  assert.throws(() => parseCsv('a,"broken'));
  assert.throws(() => parseCsv('"a"junk,b'));
});
test('numeric parsing preserves zero and missing data; rejects non-finite and malformed values', () => {
  for (const value of ['', null, '—', 'N/A']) assert.equal(numberOrNull(value), null);
  assert.equal(numberOrNull('0'), 0);
  assert.equal(numberOrNull('1,234.5'), 1234.5);
  for (const value of ['Infinity', 'NaN', '1,2', '12%', false]) assert.throws(() => numberOrNull(value));
});
test('O*NET CSV keeps percentages, stable ties, and rejects invalid and duplicate records', () => {
  const data = parseTechnologies('Percentage,Software Skill\n10,B\n30,A\n10,C\n', source);
  assert.deepEqual(data.values.map(v => v.name), ['A', 'B', 'C']);
  for (const csv of ['Percentage,Software Skill\n101,A', 'Percentage,Software Skill\n—,A', 'Percentage,Software Skill\n4,A', 'Percentage,Software Skill\n10,A\n20,a', '<html>Access denied</html>', 'Percentage,Software Skill\n10,A,extra']) assert.throws(() => parseTechnologies(csv, source));
  assert.equal(parseTechnologies('Percentage,Software Skill\n', source).status, 'unavailable');
});
function page(index = 0) {
  const o = occupations[index]!;
  return `<h1>Employer-Based In Demand Software Skills ${o.onetSoc} - <a>${o.name}</a></h1><a href="/link/demand/${o.onetSoc}/export.csv?fmt=csv"><i class="icon"></i>CSV</a>Source: Lightcast job postings data for the US nationwide between January 1, 2025 and December 31, 2025.`;
}
test('export discovery validates exact occupation, annual period, host and CSV anchor', () => {
  assert.equal(parseOnetPage(page(), occupations[0]!, source.url, at).downloadUrl, `${source.url}/export.csv?fmt=csv`);
  assert.throws(() => parseOnetPage(page(1), occupations[0]!, source.url, at));
  assert.throws(() => parseOnetPage(page().replace('December 31, 2025', 'December 31, 2024'), occupations[0]!, source.url, at));
  assert.throws(() => parseOnetPage(page().replace('/link/demand/15-1252.00/export.csv?fmt=csv', 'https://unverified.example/export.csv'), occupations[0]!, source.url, at));
});
test('fetches official exports sequentially and fails closed on HTTP errors and wrong bodies', async () => {
  const requests: string[] = [];
  const data = await fetchOnet(at, async input => {
    const url = String(input); requests.push(url);
    if (url.includes('.csv')) return new Response('Percentage,Software Skill\n20,Fixture skill\n');
    return new Response(page(occupations.findIndex(o => demandUrl(o.onetSoc) === url)));
  });
  assert.equal(requests.length, 10);
  assert.equal(Object.keys(data).length, 5);
  await assert.rejects(download(source.url, async () => new Response('', { status: 403 })), /403/);
  await assert.rejects(fetchOnet(at, async () => new Response('<html>Access denied</html>')), /identity/);
});
test('BLS uses official growth percentages and converts thousands of annual openings once', () => {
  assert.equal(bls['software-developers']!.employmentGrowthPercent, 10.2);
  assert.equal(bls['software-developers']!.averageAnnualOpenings, 95300);
  assert.equal(bls['software-qa']!.averageAnnualOpenings, 10700);
  assert.deepEqual(projectionPeriod('Table 1.2 Occupational projections, 2025–35'), { start: '2025-01-01', end: '2035-12-31' });
  assert.throws(() => projectionPeriod('2025–34'));
});
test('BLS unavailable cells stay null; invalid codes, titles, units, duplicate rows and periods fail', () => {
  const rows = structuredClone(fixture.rows);
  rows[2][3] = '—'; rows[2][4] = '—';
  const missing = parseBlsRows(rows, occupations, bls['software-developers']!.source!);
  assert.equal(missing['software-developers']!.status, 'unavailable');
  assert.equal(missing['software-developers']!.averageAnnualOpenings, null);
  for (const change of [(r: unknown[][]) => r.pop(), (r: unknown[][]) => r.push(r[2]!), (r: unknown[][]) => { r[2]![0] = 'Combined developers and testers'; }, (r: unknown[][]) => { r[0]![0] = 'Employment in jobs'; }, (r: unknown[][]) => { r[1]![3] = 'Employment change, percent, 2024–34'; }, (r: unknown[][]) => { r[2]![4] = -1; }]) {
    const copy = structuredClone(fixture.rows); change(copy);
    assert.throws(() => parseBlsRows(copy, occupations, bls['software-developers']!.source!));
  }
});
test('XLSX reader parses Table 1.2 and rejects non-workbooks', async () => {
  const workbook = await readFile(new URL('./fixtures/table-1.2.xlsx', import.meta.url));
  const result = await parseBlsWorkbook(workbook, occupations, at);
  assert.equal(result['software-developers']!.employmentGrowthPercent, 12);
  assert.equal(result['software-developers']!.averageAnnualOpenings, 2000);
  assert.equal(result['data-scientists']!.source!.retrievalMethod, 'xlsx');
  await assert.rejects(parseBlsWorkbook(Buffer.from('<html>Access denied</html>'), occupations, at));
});
test('mappings preserve separate QA/web occupations and explicitly broader BLS Data Scientists', async () => {
  const data = await base();
  assert.equal(data.occupations.find(o => o.blsSoc === '15-2051')!.relationship, 'bls-broader');
  assert.match(data.occupations.find(o => o.blsSoc === '15-2051')!.caveat, /Clinical Data Managers/);
  const wrong = structuredClone(data); wrong.occupations[0]!.blsSoc = '15-1250';
  assert.throws(() => validateDemand(wrong, new Date(at)));
  const duplicate = structuredClone(data); duplicate.occupations[1] = duplicate.occupations[0]!;
  assert.throws(() => validateDemand(duplicate, new Date(at)));
});
test('failed or partial provider updates retain all five prior records and original retrieval dates', async () => {
  const previous = await base();
  const data = await refreshDemand(previous, '2026-10-21T00:00:00Z', { onet: fail, bls: async () => ({}) });
  assert.equal(data.refresh.onet, 'retained'); assert.equal(data.refresh.bls, 'retained');
  assert.deepEqual(data.occupations, previous.occupations);
  assert.notEqual(data.generatedAt, previous.generatedAt);
  assert.equal(data.occupations[0]!.technologies.source!.retrievedAt, at);
});
test('independent successful source can update while another is unavailable; first failure stays unavailable', async () => {
  const data = await refreshDemand(null, at, { onet: fail, bls: providers.bls });
  assert.equal(data.refresh.onet, 'unavailable'); assert.equal(data.refresh.bls, 'updated');
  assert.equal(data.occupations[0]!.technologies.values.length, 0);
  assert.equal(data.occupations[0]!.outlook.averageAnnualOpenings, 95300);
});
test('invalid values, source periods, citations and future retrieval dates cannot be published', async () => {
  for (const change of [(d: DemandData) => { d.occupations[0]!.outlook.averageAnnualOpenings = -1; }, (d: DemandData) => { d.occupations[0]!.technologies.values[0]!.mentionPercent = Infinity; }, (d: DemandData) => { d.occupations[0]!.technologies.source!.retrievedAt = '2030-01-01'; }, (d: DemandData) => { d.occupations[0]!.technologies.source!.url = 'https://unverified.example/'; }, (d: DemandData) => { d.occupations[0]!.outlook.source!.period.start = '2024-01-01'; }]) {
    const data = await base(); change(data); assert.throws(() => validateDemand(data, new Date(at)));
  }
  const old = await base();
  const result = await refreshDemand(old, '2026-10-21T00:00:00Z', { onet: async () => { const rows = structuredClone(onet); for (const row of Object.values(rows)) row.source!.period = { start: '2024-01-01', end: '2024-12-31' }; return rows; }, bls: fail });
  assert.equal(result.refresh.onet, 'retained');
});
test('atomic file writer refuses invalid data without changing the last valid snapshot', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'engineering-demand-'));
  try {
    const path = join(directory, 'demand.json');
    const data = await base(); await writeValidated(path, data);
    const before = await readFile(path, 'utf8');
    const bad = structuredClone(data); bad.occupations[0]!.outlook.averageAnnualOpenings = -10;
    await assert.rejects(writeValidated(path, bad));
    assert.equal(await readFile(path, 'utf8'), before);
    assert.equal((await readValidated(path))!.occupations.length, 5);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('chart helpers show top ten, exact zero, unavailable values, real dates and overdue checks', async () => {
  const data = await base();
  assert.equal(topTechnologies(data, 'missing').length, 0);
  data.occupations[0]!.technologies.values = Array.from({ length: 12 }, (_, i) => ({ name: `Fixture ${i}`, mentionPercent: 50 - i }));
  assert.equal(topTechnologies(data, data.occupations[0]!.id).length, 10);
  assert.equal(percentLabel(0), '0%'); assert.equal(percentLabel(null), 'Unavailable');
  assert.equal(openingsLabel(0), '0'); assert.equal(openingsLabel(null), 'Unavailable');
  assert.equal(periodLabel(null), 'Unavailable'); assert.equal(periodLabel(source), '2025–2025');
  assert.match(sourceStatus(source, 'onet', new Date('2026-12-01')), /overdue/);
  assert.match(sourceStatus(source, 'onet', new Date('2028-01-01')), /Older/);
  assert.match(sourceStatus(bls['software-developers']!.source, 'bls', new Date('2028-01-01')), /Older/);
});
test('occupation selection shows exactly one panel, updates comparison and preserves selection on bad IDs', () => {
  const panels = occupations.map(o => ({ dataset: { demandOccupation: o.id, occupationName: o.name }, hidden: false }));
  const comparisons = occupations.map(o => ({ dataset: { demandComparison: o.id, selected: 'false' } }));
  const status = { textContent: '' };
  const root = { querySelectorAll: (selector: string) => selector === '[data-demand-occupation]' ? panels : comparisons, querySelector: () => status } as unknown as HTMLElement;
  for (const occupation of occupations) {
    assert.ok(selectOccupation(root, occupation.id));
    assert.equal(panels.filter(p => !p.hidden).length, 1);
    assert.equal(panels.find(p => !p.hidden)!.dataset.demandOccupation, occupation.id);
    assert.equal(comparisons.filter(p => p.dataset.selected === 'true').length, 1);
    assert.match(status.textContent, new RegExp(occupation.name));
  }
  assert.equal(selectOccupation(root, 'invalid'), false);
  assert.equal(panels.filter(p => !p.hidden).length, 1);
});
test('checked-in production data validates and contains no test skills', async () => {
  const production: unknown = JSON.parse(await readFile(new URL('../../public/data/engineering-demand/demand.json', import.meta.url), 'utf8'));
  validateDemand(production);
  assert.ok(production.occupations.every(o => o.technologies.values.every(skill => !/Fixture|Test technology/.test(skill.name))));
});
test('published restore bootstraps on 404 but blocks outages, network failures and invalid content', async () => {
  const previous = await base();
  assert.equal(await restorePublished(previous, async () => new Response('', { status: 404 })), previous);
  for (const fetcher of [async () => new Response('', { status: 503 }), async () => new Response('{}'), fail]) {
    await assert.rejects(restorePublished(previous, fetcher));
  }
});
test('published restore chooses observations by source period and retrieval date, not failed attempt time', async () => {
  const previous = await base();
  const published = structuredClone(previous);
  for (const occupation of published.occupations) {
    occupation.technologies.source!.retrievedAt = '2026-10-19T23:46:00.000Z';
    occupation.technologies.values[0]!.mentionPercent = 31;
  }
  const restored = await restorePublished(previous, async () => Response.json(published));
  assert.equal(restored!.occupations[0]!.technologies.values[0]!.mentionPercent, 31);
  const regressed = structuredClone(published);
  regressed.generatedAt = '2026-10-19T23:47:00.000Z';
  for (const occupation of regressed.occupations) occupation.technologies.source!.period = { start: '2024-01-01', end: '2024-12-31' };
  const retained = await restorePublished(previous, async () => Response.json(regressed));
  assert.deepEqual(retained!.occupations[0]!.technologies, previous.occupations[0]!.technologies);
});


test('technology indicators select substantial comparable changes without altering snapshots', async () => {
  const data = await base();
  const occupation = data.occupations[0]!;
  occupation.technologies.values = [
    { name: 'Kotlin', mentionPercent: 20 },
    { name: 'Compose', mentionPercent: 15 },
    { name: 'React Native', mentionPercent: 10 },
    { name: 'Other', mentionPercent: 5 },
    { name: 'Unchanged', mentionPercent: 8 },
    { name: 'Small', mentionPercent: 8.5 },
    { name: 'New without baseline', mentionPercent: 25 },
  ];
  data.previous = { occupations: structuredClone(data.occupations) };
  const before = data.previous.occupations[0]!.technologies;
  before.values = [
    { name: 'Kotlin', mentionPercent: 15 },
    { name: 'Compose', mentionPercent: 19 },
    { name: 'React Native', mentionPercent: 8 },
    { name: 'Other', mentionPercent: 4 },
    { name: 'Unchanged', mentionPercent: 8 },
    { name: 'Small', mentionPercent: 8 },
  ];
  const saved = JSON.stringify(data);
  assert.deepEqual([...technologyChanges(data, occupation.id)], [['Kotlin', 15], ['Compose', 19], ['React Native', 8]]);
  assert.equal(JSON.stringify(data), saved);
  before.source!.period.start = '2024-01-01';
  assert.equal(technologyChanges(data, occupation.id).size, 0);
  before.source = structuredClone(occupation.technologies.source);
  before.status = 'unavailable';
  assert.equal(technologyChanges(data, occupation.id).size, 0);
  delete data.previous;
  assert.equal(technologyChanges(data, occupation.id).size, 0);
});
