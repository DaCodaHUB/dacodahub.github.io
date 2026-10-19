import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, parseIndeed, fetchIndeed } from './indeed.ts';
import { parseFred, fetchEmployment } from './fred.ts';
import { normalize, numericValue, observationDate } from './normalize.ts';
import { indeed, employment } from './sources.ts';
import { request } from './http.ts';
import type { Fetcher } from './http.ts';

// Synthetic protocol fixtures exercise parsers only; never published as economic data.
const header = 'date,jobcountry,indeed_job_postings_index,variable,display_name\n';
const row = '2026-10-01,US,100,total postings,Software Development';
const mock = (body: string, status = 200): Fetcher => async () => new Response(body, { status });
const now = new Date('2026-10-19T12:00:00Z');

test('CSV supports BOM, CRLF, quoted commas, escaped quotes and embedded newlines', () => {
  assert.deepEqual(parseCsv('\uFEFFa,b\r\n"x,y","say ""yes""\nnow"\r\n'), [['a', 'b'], ['x,y', 'say "yes"\nnow']]);
  for (const text of ['"unfinished', '"closed"junk,x', 'bad"quote,x']) assert.throws(() => parseCsv(text));
});

test('Indeed selects only US software development total postings and preserves index', () => {
  const text = header + [row, row.replace('US', 'CA'), row.replace('total postings', 'new postings'), row.replace('Software Development', 'Accounting')].join('\n');
  assert.deepEqual(parseIndeed(text), [{ date: '2026-10-01', value: 100 }]);
  assert.throws(() => parseIndeed('<html>unavailable</html>'));
  assert.throws(() => parseIndeed(header + row + ',extra'));
  assert.throws(() => parseIndeed(header));
});

test('missing values remain null and malformed numbers/dates fail', () => {
  assert.equal(numericValue('.'), null);
  assert.equal(numericValue(''), null);
  for (const value of ['NaN', 'Infinity', '12oops', '-1', '0x10']) assert.throws(() => numericValue(value));
  for (const date of ['2026-02-30', '2026-13-01', '10/01/2026']) assert.throws(() => observationDate(date));
});

test('normalization sorts, rejects duplicates/future dates and evaluates latest nonmissing date', () => {
  const result = normalize(indeed, [{ date: '2026-10-18', value: null }, { date: '2026-09-01', value: 100 }], now);
  assert.equal(result.latestObservationDate, '2026-09-01');
  assert.equal(result.missingCount, 1);
  assert.equal(result.freshness.stale, true);
  assert.equal(result.observations[0]?.date, '2026-09-01');
  assert.throws(() => normalize(indeed, [], now));
  assert.throws(() => normalize(indeed, [{ date: '2026-10-20', value: 100 }], now));
  assert.throws(() => normalize(indeed, [{ date: '2026-10-01', value: 100 }, { date: '2026-10-01', value: 101 }], now));
  assert.throws(() => normalize(employment, [{ date: '2026-10-02', value: 100 }], now));
  assert.equal(normalize(employment, [{ date: '2026-09-01', value: 100 }], now).freshness.stale, false);
});

test('FRED validates envelope, detects truncation and handles dot missing values', () => {
  assert.deepEqual(parseFred({ count: 1, offset: 0, observations: [{ date: '2026-09-01', value: '.' }] }), [{ date: '2026-09-01', value: null }]);
  for (const value of [null, {}, { error_code: 400 }, { count: 2, offset: 0, observations: [] }, { count: 0, offset: 1, observations: [] }]) assert.throws(() => parseFred(value));
});

test('FRED uses the confirmed series and keeps key out of normalized data', async () => {
  const fetcher: Fetcher = async (input) => {
    const url = new URL(String(input));
    assert.equal(url.searchParams.get('series_id'), 'CES6054150001');
    assert.equal(url.searchParams.get('api_key'), 'test-secret');
    assert.equal(url.searchParams.get('units'), 'lin');
    return new Response(JSON.stringify({ count: 1, offset: 0, observations: [{ date: '2026-09-01', value: '100' }] }));
  };
  const result = await fetchEmployment('test-secret', fetcher, now);
  assert.equal(JSON.stringify(result).includes('test-secret'), false);
  await assert.rejects(fetchEmployment(undefined, fetcher, now), /FRED_API_KEY/);
  await assert.rejects(fetchEmployment('test-secret', mock('invalid JSON'), now), /Invalid FRED JSON/);
});

test('HTTP rejects permanent failures and redacts network exception URLs', async () => {
  await assert.rejects(request('https://example.test/?api_key=secret', 'FRED', mock('secret', 403)), /^Error: FRED: HTTP 403$/);
  const failing: Fetcher = async () => { throw new Error('secret URL'); };
  await assert.rejects(request('https://example.test', 'FRED', failing), /^Error: FRED: network request failed$/);
});

test('HTTP retries transient failures and Indeed fetch normalizes data', async () => {
  let calls = 0;
  const fetcher: Fetcher = async () => ++calls === 1 ? new Response('', { status: 503 }) : new Response(header + row);
  const result = await fetchIndeed(fetcher, now);
  assert.equal(calls, 2);
  assert.equal(result.retrievedAt, now.toISOString());
  assert.equal(result.freshness.stale, false);
});
