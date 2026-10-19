import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateBundle, refreshMarket, restorePublished } from './refresh.ts';
import type { DataBundle } from './refresh.ts';
import type { Fetcher } from './http.ts';
import { normalize } from './normalize.ts';
import { indeed, employment } from './sources.ts';

const now = new Date('2026-10-19T12:00:00Z');
// Synthetic inputs stay in tests; no production observations are invented.
function fixture(complete = true): DataBundle {
  const series = [normalize(indeed, [{ date: '2026-10-01', value: 100 }, { date: '2026-10-09', value: 101 }], now)];
  if (complete) series.push(normalize(employment, [{ date: '2026-08-01', value: 1000 }, { date: '2026-09-01', value: 1001 }], now));
  return { schemaVersion: 1, generatedAt: now.toISOString(), complete, series };
}

test('failed source retrieval retains the complete snapshot and original timestamps without secret leakage', async () => {
  const baseline = fixture();
  const result = await refreshMarket(baseline, async () => { throw new Error('api_key=secret'); }, now);
  assert.equal(result.status, 'retained');
  assert.deepEqual(result.data, baseline);
  assert.equal(JSON.stringify(result).includes('secret'), false);
  assert.equal(result.health.update?.dataGeneratedAt, baseline.generatedAt);
});

test('a partial or invalid candidate cannot replace a complete snapshot', async () => {
  const baseline = fixture();
  const partial = await refreshMarket(baseline, async () => fixture(false).series, now);
  assert.equal(partial.status, 'retained');
  const bad = fixture(); bad.series[0]!.observations[0]!.value = NaN;
  assert.equal((await refreshMarket(baseline, async () => bad.series, now)).status, 'retained');
});

test('retained observations age naturally and stale scores are withheld', async () => {
  const baseline = fixture();
  const later = new Date('2027-01-01T00:00:00Z');
  const result = await refreshMarket(baseline, async () => baseline.series, later);
  assert.equal(result.status, 'retained');
  assert.equal(result.data.generatedAt, baseline.generatedAt);
  assert.equal(result.health.freshness.sources[0]!.status, 'stale');
  assert.equal(result.health.current.score, null);
  assert.equal(result.health.current.classification, 'Insufficient Data');
});

test('fresh complete sources can upgrade the original partial bundle', async () => {
  const result = await refreshMarket(fixture(false), async () => fixture().series, now);
  assert.equal(result.status, 'updated');
  assert.equal(result.data.complete, true);
  assert.equal(result.health.update?.status, 'updated');
});

test('date regression, truncated history, invalid metadata and invalid baselines are rejected', async () => {
  const previous = fixture();
  const regressed = fixture(); regressed.series[0]!.observations.pop();
  assert.equal((await refreshMarket(previous, async () => regressed.series, now)).status, 'retained');
  const truncated = fixture(); truncated.series[0]!.observations.shift();
  assert.equal((await refreshMarket(previous, async () => truncated.series, now)).status, 'retained');
  const missingValue = fixture(); missingValue.series[0]!.observations[0]!.value = null;
  assert.equal((await refreshMarket(previous, async () => missingValue.series, now)).status, 'retained');
  const invalid = fixture(); invalid.series[0]!.units = 'wrong';
  assert.throws(() => validateBundle(invalid, now));
  await assert.rejects(refreshMarket(invalid, async () => previous.series, now));
});

test('validation reconstructs approved metadata rather than publishing arbitrary fields', () => {
  const payload = fixture(); payload.series[0]!.downloadUrl = 'https://example.test/?api_key=secret';
  assert.equal(JSON.stringify(validateBundle(payload, now)).includes('secret'), false);
});

test('published complete snapshot takes precedence over checkout data', async () => {
  const fetcher: Fetcher = async () => new Response(JSON.stringify(fixture()));
  const result = await restorePublished(async () => { throw Error('Must not read local data'); }, now, fetcher);
  assert.equal(result.complete, true);
});

test('404 complete snapshot supports an original partial deployment; two 404s support bootstrap', async () => {
  const fetcher: Fetcher = async url => String(url).endsWith('market-data.json') ? new Response('', { status: 404 }) : new Response(JSON.stringify(fixture(false)));
  assert.equal((await restorePublished(async () => { throw Error('No local fallback'); }, now, fetcher)).complete, false);
  assert.equal((await restorePublished(async () => fixture(false), now, async () => new Response('', { status: 404 }))).complete, false);
});

test('published outage or invalid content blocks deployment instead of rolling back to checkout data', async () => {
  let localCalled = false;
  const local = async () => { localCalled = true; return fixture(false); };
  await assert.rejects(restorePublished(local, now, async () => new Response('', { status: 503 })));
  await assert.rejects(restorePublished(local, now, async () => new Response('{broken')));
  await assert.rejects(restorePublished(local, now, async () => new Response(JSON.stringify(fixture(false)))));
  assert.equal(localCalled, false);
});
