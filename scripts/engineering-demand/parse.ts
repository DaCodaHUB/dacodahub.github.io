import { createHash } from 'node:crypto';
import readXlsxFile from 'read-excel-file/node';
import type { OccupationMapping, Outlook, SourceMetadata, Technologies } from './types.ts';
import { blsDownloadUrl, blsLicenseUrl, blsTableUrl, onetLicenseUrl } from './sources.ts';

export const sha256 = (input: string | Uint8Array) => createHash('sha256').update(input).digest('hex');
export const clean = (value: unknown) => String(value ?? '').replace(/\s+/g, ' ').trim();

// RFC 4180: quoted delimiters, escaped quotes, CRLF and embedded newlines.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', quoted = false, closed = false;
  const input = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < input.length; i++) {
    const c = input[i]!;
    if (quoted) {
      if (c === '"' && input[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { quoted = false; closed = true; }
      else field += c;
    } else if (c === '"') {
      if (field || closed) throw new Error('CSV: unexpected quote');
      quoted = true;
    } else if (c === ',' || c === '\n' || c === '\r') {
      row.push(field); field = ''; closed = false;
      if (c !== ',') {
        if (row.some(v => v.trim())) rows.push(row);
        row = [];
        if (c === '\r' && input[i + 1] === '\n') i++;
      }
    } else {
      if (closed) throw new Error('CSV: text after closing quote');
      field += c;
    }
  }
  if (quoted) throw new Error('CSV: unterminated quote');
  if (field || row.length) { row.push(field); if (row.some(v => v.trim())) rows.push(row); }
  return rows;
}

export function numberOrNull(value: unknown): number | null {
  const text = clean(value);
  if (!text || ['—', '–', '-', 'N/A', 'Not available'].includes(text)) return null;
  if (!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(text)) throw new Error(`Invalid numeric value: ${text.slice(0, 50)}`);
  const number = Number(text.replaceAll(',', ''));
  if (!Number.isFinite(number)) throw new Error('Non-finite number');
  return number;
}

export function parseTechnologies(csv: string, source: SourceMetadata): Technologies {
  const rows = parseCsv(csv);
  const header = rows.shift()?.map(clean) ?? [];
  const nameIndex = header.indexOf('Software Skill'), percentIndex = header.indexOf('Percentage');
  if (nameIndex < 0 || percentIndex < 0) throw new Error('O*NET CSV: unrecognized headers');
  const seen = new Set<string>();
  const values = rows.map(row => {
    if (row.length !== header.length) throw new Error('O*NET CSV: inconsistent row length');
    const name = clean(row[nameIndex]);
    const mentionPercent = numberOrNull(row[percentIndex]);
    if (!name || mentionPercent === null || mentionPercent < 5 || mentionPercent > 100) throw new Error('O*NET CSV: invalid in-demand skill');
    const key = name.toLocaleLowerCase('en-US');
    if (seen.has(key)) throw new Error('O*NET CSV: duplicate skill');
    seen.add(key);
    return { name, mentionPercent };
  });
  if (!values.length) return { status: 'unavailable', reason: 'The official table lists no in-demand software skills.', source, values: [] };
  // Stable source ordering resolves rounded-percentage ties; never claim ranks measure growth.
  return { status: 'available', reason: null, source, values: values.sort((a, b) => b.mentionPercent - a.mentionPercent) };
}

export function parseOnetPage(html: string, occupation: OccupationMapping, url: string, retrievedAt: string) {
  const title = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]*>/g, '');
  if (!title?.includes('In Demand') || !title.includes(occupation.onetSoc) || !title.includes(occupation.name)) throw new Error('O*NET: occupation identity changed');
  const period = html.match(/between January 1, (20\d{2}) and December 31, (20\d{2})/);
  if (!period || period[1] !== period[2]) throw new Error('O*NET: unrecognized posting period');
  const link = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .filter(m => m[2]!.replace(/<[^>]*>/g, '').trim() === 'CSV')
    .map(m => new URL(m[1]!.replaceAll('&amp;', '&'), url))
    .find(u => u.pathname.startsWith(`/link/demand/${occupation.onetSoc}/`) && u.pathname.endsWith('.csv') && u.protocol === 'https:' && u.hostname === 'www.onetonline.org');
  if (!link) throw new Error('O*NET: CSV download not found');
  const source: SourceMetadata = { url, downloadUrl: link.href, attribution: 'O*NET OnLine, USDOL/ETA; Lightcast U.S. nationwide job postings', licenseUrl: onetLicenseUrl, retrievedAt, publicationDate: null, period: { start: `${period[1]}-01-01`, end: `${period[2]}-12-31` }, retrievalMethod: 'csv', sha256: '' };
  return source;
}

export function projectionPeriod(text: string): { start: string; end: string } {
  const match = text.replaceAll('–', '-').replaceAll('—', '-').match(/(20\d{2})\s*-\s*(20\d{2}|\d{2})/);
  if (!match) throw new Error('BLS: projection period missing');
  const start = Number(match[1]);
  const end = Number(match[2]!.length === 2 ? match[1]!.slice(0, 2) + match[2] : match[2]);
  if (end - start !== 10) throw new Error('BLS: expected ten-year projection period');
  return { start: `${start}-01-01`, end: `${end}-12-31` };
}

export function parseBlsRows(rows: unknown[][], mappings: OccupationMapping[], source: SourceMetadata): Record<string, Outlook> {
  const headerIndex = rows.findIndex(row => row.some(v => /National Employment Matrix code/i.test(clean(v))));
  if (headerIndex < 0) throw new Error('BLS: Table 1.2 headers missing');
  const header = rows[headerIndex]!.map(clean);
  const index = (pattern: RegExp) => {
    const matches = header.map((value, i) => pattern.test(value) ? i : -1).filter(i => i >= 0);
    if (matches.length !== 1) throw new Error('BLS: ambiguous or missing column');
    return matches[0]!;
  };
  const code = index(/National Employment Matrix code/i), title = index(/National Employment Matrix title/i);
  const growth = index(/Employment change,? percent/i), openings = index(/Occupational openings.*annual average/i);
  const kind = index(/^Occupation type$/i);
  if (!rows.slice(0, headerIndex).flat().some(v => /(?:Employment|Numbers) in thousands/i.test(clean(v)))) throw new Error('BLS: units must be thousands');
  const headerPeriod = projectionPeriod(header[growth]!);
  if (headerPeriod.start !== source.period.start || headerPeriod.end !== source.period.end || !header[openings]!.includes(source.period.start.slice(0, 4))) throw new Error('BLS: mismatched projection periods');
  const output: Record<string, Outlook> = {};
  for (const mapping of mappings) {
    const matches = rows.slice(headerIndex + 1).filter(row => clean(row[code]) === mapping.blsSoc);
    if (matches.length !== 1) throw new Error(`BLS: expected one row for ${mapping.blsSoc}`);
    const row = matches[0]!;
    if (clean(row[kind]) !== 'Line item' || clean(row[title]).toLowerCase() !== mapping.name.toLowerCase()) throw new Error(`BLS: occupation definition mismatch for ${mapping.blsSoc}`);
    const employmentGrowthPercent = numberOrNull(row[growth]), thousands = numberOrNull(row[openings]);
    if ((employmentGrowthPercent !== null && employmentGrowthPercent < -100) || (thousands !== null && thousands < 0)) throw new Error('BLS: invalid projection value');
    output[mapping.id] = { status: employmentGrowthPercent === null && thousands === null ? 'unavailable' : 'available', reason: employmentGrowthPercent === null || thousands === null ? 'One or more metrics are unavailable in the official table.' : null, source, employmentGrowthPercent, averageAnnualOpenings: thousands === null ? null : Math.round(thousands * 1000) };
  }
  return output;
}

export async function parseBlsWorkbook(buffer: Buffer, mappings: OccupationMapping[], retrievedAt: string): Promise<Record<string, Outlook>> {
  const sheets = await readXlsxFile(buffer);
  const sheet = sheets.find(item => /(?:^|\b)1\.2(?:\b|$)/.test(item.sheet));
  if (!sheet) throw new Error('BLS: Table 1.2 worksheet not found');
  const rows = sheet.data;
  const heading = rows.flat().map(clean).find(value => /Table 1\.2.*Occupational projections/i.test(value));
  if (!heading) throw new Error('BLS: Table 1.2 title missing');
  const source: SourceMetadata = { url: blsTableUrl, downloadUrl: blsDownloadUrl, attribution: 'U.S. Bureau of Labor Statistics, Employment Projections, Table 1.2', licenseUrl: blsLicenseUrl, retrievedAt, publicationDate: null, period: projectionPeriod(heading), retrievalMethod: 'xlsx', sha256: sha256(buffer) };
  return parseBlsRows(rows, mappings, source);
}
