import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateHealth, classify, scaleScore } from './health.ts';
import { indeed, employment } from './sources.ts';
import { normalize } from './normalize.ts';
import type { Observation } from './types.ts';

const now = new Date('2026-10-19T12:00:00Z');
// Synthetic scenarios are test inputs only. No fixtures enter production output.
function fixture(demandRate = 1, employmentRate = 1) {
  const demand: Observation[] = [], jobs: Observation[] = [];
  for (let time = Date.parse('2019-01-01'); time <= Date.parse('2026-10-18'); time += 86_400_000) {
    const date = new Date(time).toISOString().slice(0, 10);
    const n = Math.max(0, (Number(date.slice(0, 4)) - 2025) * 12 + Number(date.slice(5, 7)) - 8);
    demand.push({ date, value: 100 * demandRate ** n });
    if (date.endsWith('-01')) jobs.push({ date, value: 1000 * employmentRate ** n });
  }
  return { schemaVersion: 1, series: [normalize(indeed, demand, now), normalize(employment, jobs, now)] };
}

test('strong expansion yields Growing and a bounded explainable proxy', () => {
  const output = calculateHealth(fixture(1.03, 1.005), now);
  assert.equal(output.current.classification, 'Growing');
  assert.ok(output.current.score! > 60 && output.current.score! <= 100);
  assert.equal(output.current.referenceMonth, '2026-08');
  assert.deepEqual(output.current.indicators.map(i => i.effectiveWeight), [0.625, 0.375, 0]);
  assert.equal(output.current.indicators[2]!.score, null);
  assert.ok(output.current.indicators[0]!.source?.url);
});

test('sustained contraction yields Contracting', () => {
  assert.equal(calculateHealth(fixture(0.97, 0.995), now).current.classification, 'Contracting');
});

test('stable market has neutral components and Balanced classification', () => {
  const current = calculateHealth(fixture(), now).current;
  assert.equal(current.classification, 'Balanced');
  assert.equal(current.score, 50);
});

test('recovery acknowledges depressed level and improving recent demand separately', () => {
  const input = fixture(0.97, 0.995);
  const demand = input.series[0]!;
  for (const row of demand.observations) if (row.date >= '2026-06-01') {
    const months = Number(row.date.slice(5, 7)) - 5;
    row.value = 100 * 0.97 ** 9 * 1.1 ** months;
  }
  const result = calculateHealth(input, now).current.indicators[0]!;
  assert.equal(result.status, 'available');
  assert.ok(result.values.level! > 0);
  assert.ok(result.values.threeMonthLogChangePercent! > 0);
  assert.ok(result.score! > 50);
  // In June, the level is still below baseline even as the recovery starts.
  const june = calculateHealth(input, now).history.find(row => row.referenceMonth === '2026-06')!;
  assert.ok(june.indicators[0]!.values.level! < 100);
  assert.ok(june.indicators[0]!.values.threeMonthLogChangePercent! > 0);
});

test('missing component and stale data suppress the current composite', () => {
  const missing = fixture(); missing.series.pop();
  assert.equal(calculateHealth(missing, now).current.classification, 'Insufficient Data');
  const stale = calculateHealth(fixture(), new Date('2027-02-01T00:00:00Z'));
  assert.equal(stale.current.score, null);
  assert.equal(stale.freshness.sources[0]!.status, 'stale');
  assert.equal(stale.current.indicators[0]!.status, 'stale');
});

test('opposing strong indicators yield Unknown, not false balance', () => {
  const current = calculateHealth(fixture(1.03, 0.995), now).current;
  assert.equal(current.classification, 'Unknown');
  assert.equal(current.score, null);
});

test('invalid values, dates, duplicate series and metadata cannot yield a score', () => {
  for (const mutate of [
    (input: ReturnType<typeof fixture>) => { input.series[0]!.observations[0]!.value = Number.NaN; },
    (input: ReturnType<typeof fixture>) => { input.series[0]!.observations[0]!.date = '2026-02-30'; },
    (input: ReturnType<typeof fixture>) => { input.series.push(input.series[0]!); },
    (input: ReturnType<typeof fixture>) => { input.series[0]!.units = 'percent'; },
    (input: ReturnType<typeof fixture>) => { input.series[0]!.observations.push(input.series[0]!.observations[0]!); },
  ]) {
    const input = fixture(); mutate(input);
    const output = calculateHealth(input, now);
    assert.equal(output.current.score, null);
    assert.equal(output.freshness.sources[0]!.status, 'invalid');
  }
  assert.equal(calculateHealth({ series: [] }, now).current.classification, 'Insufficient Data');
});

test('classification boundaries are inclusive Balanced and reject invalid scores', () => {
  assert.equal(classify(39.999), 'Contracting');
  assert.equal(classify(40), 'Balanced');
  assert.equal(classify(60), 'Balanced');
  assert.equal(classify(60.001), 'Growing');
  assert.equal(classify(NaN), 'Unknown');
  assert.equal(classify(101), 'Unknown');
  assert.equal(scaleScore(0, 5), 50);
});

test('later observation changes cannot alter earlier assessments or calibration', () => {
  const original = fixture(1.03, 1.005);
  const before = calculateHealth(original, now);
  for (const series of original.series) for (const row of series.observations) if (row.date >= '2025-01-01') row.value! *= 2;
  const after = calculateHealth(original, now);
  assert.deepEqual(before.history.filter(row => row.referenceMonth! < '2025-01'), after.history.filter(row => row.referenceMonth! < '2025-01'));
  assert.equal(before.methodology.historyBasis, 'retrospective-latest-vintage');
  assert.ok(before.history.some(row => row.classification === 'Insufficient Data'));
});

test('incomplete daily coverage and holes in growth windows fail without falling back to older months', () => {
  const input = fixture();
  input.series[0]!.observations = input.series[0]!.observations.filter(row => !row.date.startsWith('2026-08') || row.date.endsWith('-01'));
  const output = calculateHealth(input, now);
  assert.equal(output.current.referenceMonth, '2026-08');
  assert.equal(output.current.classification, 'Insufficient Data');
  const gap = fixture();
  gap.series[1]!.observations = gap.series[1]!.observations.filter(row => row.date !== '2026-07-01');
  assert.equal(calculateHealth(gap, now).current.score, null);
});
