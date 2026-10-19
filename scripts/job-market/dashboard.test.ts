import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chartPath, scoreFor, freshnessFor, formatDate, formatScore } from '../../src/lib/market.ts';
import type { Assessment, HealthOutput } from './health-types.ts';
import { indeed, employment } from './sources.ts';

// UI protocol fixtures only. No values are written to production JSON.
const row = (score: number | null): Assessment => ({ asOf: '2026-10-19', referenceMonth: '2026-08', score, classification: score === null ? 'Insufficient Data' : 'Balanced', explanation: '', indicators: [] });
const source = (id: string, date: string | null, status: 'fresh' | 'missing' | 'invalid' | 'stale' = 'fresh') => ({ id, latestObservationDate: date, status, ageDays: null });
function freshness(sources: HealthOutput['freshness']['sources'], at: string) {
  return freshnessFor({ freshness: { evaluatedAt: '2026-10-19T00:00:00Z', sources } }, new Date(at));
}

test('chart preserves zero, rejects invalid scores, and never turns missing values into zero', () => {
  assert.equal(scoreFor(row(0), 'overall'), 0);
  assert.equal(scoreFor(row(null), 'overall'), null);
  assert.equal(scoreFor(row(Infinity), 'overall'), null);
  assert.equal(scoreFor(row(101), 'overall'), null);
  assert.equal(scoreFor(row(50), 'demand'), null);
  assert.equal(formatScore(null), 'Unavailable');
  assert.equal(formatScore(0), '0.0');
});

test('chart paths break at missing history and keep all-missing history empty', () => {
  const path = chartPath([row(50), row(60), row(null), row(40)], 'overall');
  assert.equal((path.match(/M/g) ?? []).length, 2);
  assert.equal((path.match(/L/g) ?? []).length, 1);
  assert.equal(chartPath([row(null), row(null)], 'overall').trim(), '');
  assert.ok(!chartPath([row(50)], 'overall').includes('NaN'));
  assert.equal(chartPath([], 'overall'), '');
});

test('freshness is recomputed from observation dates at the exact tolerance boundary', () => {
  const sources = [source(indeed.id, '2026-10-01')];
  assert.equal(freshness(sources, '2026-10-22')[0]!.status, 'fresh');
  assert.equal(freshness(sources, '2026-10-23')[0]!.status, 'stale');
  assert.equal(freshness(sources, '2026-10-23')[0]!.ageDays, 22);
  assert.equal(freshness([source(employment.id, '2026-08-01')], '2026-10-15')[0]!.status, 'fresh');
  assert.equal(freshness([source(employment.id, '2026-08-01')], '2026-10-16')[0]!.status, 'stale');
});

test('missing and invalid source states cannot be upgraded; future dates are invalid', () => {
  assert.equal(freshness([source(indeed.id, null, 'missing')], '2026-10-19')[0]!.status, 'missing');
  assert.equal(freshness([source(indeed.id, '2026-10-01', 'invalid')], '2026-10-19')[0]!.status, 'invalid');
  assert.equal(freshness([source(indeed.id, '2026-10-20')], '2026-10-19')[0]!.status, 'invalid');
});

test('dates retain UTC observation dates and monthly references', () => {
  assert.equal(formatDate('2026-08', true), 'Aug 2026');
  assert.equal(formatDate('2026-10-09'), 'Oct 9, 2026');
  assert.equal(formatDate(null), 'Not available');
});
