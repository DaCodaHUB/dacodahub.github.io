import { request } from './http.ts';
import type { Fetcher } from './http.ts';
import { numericValue, observationDate, normalize } from './normalize.ts';
import { indeed } from './sources.ts';
import type { Observation } from './types.ts';

// CSV state machine supports quoted commas, escaped quotes, BOM and CRLF.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', quoted = false, closed = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { quoted = false; closed = true; }
      else field += c;
    } else if (c === ',' || c === '\n' || c === '\r') {
      row.push(field); field = ''; closed = false;
      if (c !== ',') {
        if (row.some(cell => cell !== '')) rows.push(row);
        row = [];
        if (c === '\r' && text[i + 1] === '\n') i++;
      }
    } else if (c === '"' && field === '' && !closed) quoted = true;
    else {
      if (closed || c === '"') throw new Error('Malformed CSV quoting');
      field += c;
    }
  }
  if (quoted) throw new Error('Unclosed CSV quote');
  row.push(field);
  if (row.some(cell => cell !== '')) rows.push(row);
  return rows;
}

export function parseIndeed(text: string): Observation[] {
  const [headers, ...rows] = parseCsv(text);
  const required = ['date', 'jobcountry', 'indeed_job_postings_index', 'variable', 'display_name'];
  if (!headers || new Set(headers).size !== headers.length || required.some(name => !headers.includes(name))) {
    throw new Error('Indeed CSV schema changed');
  }
  const at = (row: string[], name: string) => row[headers.indexOf(name)];
  const result: Observation[] = [];
  for (const row of rows) {
    if (row.length !== headers.length) throw new Error('Invalid Indeed CSV row');
    if (at(row, 'jobcountry') !== 'US' || at(row, 'display_name') !== 'Software Development' || at(row, 'variable') !== 'total postings') continue;
    result.push({ date: observationDate(at(row, 'date')), value: numericValue(at(row, 'indeed_job_postings_index')) });
  }
  if (!result.length) throw new Error('Indeed software development total postings not found');
  return result;
}

export async function fetchIndeed(fetcher?: Fetcher, now = new Date()) {
  const response = await request(indeed.downloadUrl, 'Indeed', fetcher);
  return normalize(indeed, parseIndeed(await response.text()), now);
}
