import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chartPath, scoreFor, freshnessFor, formatDate, formatScore, historyRange, previousMonthChange, ordinaryPercent } from '../../src/lib/market.ts';
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

test('history ranges use calendar months without removing missing scores or mutating history', () => {
  const history = Array.from({ length: 48 }, (_, index) => ({ ...row(index % 3 ? 50 : null), referenceMonth: new Date(Date.UTC(2023, index, 1)).toISOString().slice(0, 7) }));
  assert.equal(historyRange(history, '1').length, 12);
  assert.equal(historyRange(history, '3').length, 36);
  assert.equal(historyRange(history, 'all').length, 48);
  assert.equal(history.length, 48);
  assert.ok(historyRange(history, '1').some(item => item.score === null));
  assert.deepEqual(historyRange([], '1'), []);
});

test('previous-month comparison requires two valid consecutive scores', () => {
  const older = { ...row(40), referenceMonth: '2026-07' };
  assert.equal(previousMonthChange([older, row(50)], 'overall'), 10);
  assert.equal(previousMonthChange([older, row(null)], 'overall'), null);
  assert.equal(previousMonthChange([{ ...older, referenceMonth: '2026-06' }, row(50)], 'overall'), null);
  assert.equal(previousMonthChange([row(50)], 'overall'), null);
});

test('ordinary percentages are display-only conversions with missing values preserved', () => {
  assert.equal(ordinaryPercent(100 * Math.log(1.1)), '+10.00%');
  assert.equal(ordinaryPercent(100 * Math.log(0.9)), '-10.00%');
  assert.equal(ordinaryPercent(0), '0.00%');
  assert.equal(ordinaryPercent(null), 'Unavailable');
  assert.equal(ordinaryPercent(undefined), 'Unavailable');
});

test('responsive chart coordinates fit the requested plot width and retain gaps', () => {
  const path = chartPath([row(50), row(null), row(60)], 'overall', 260);
  assert.ok(path.includes('M308.00'));
  assert.equal((path.match(/M/g) ?? []).length, 2);
  assert.ok(!path.includes('L'));
});
