import type { HealthOutput, Assessment } from '../../scripts/job-market/health-types.ts';
import { indeed, employment } from '../../scripts/job-market/sources.ts';

export type ChartSeries = 'overall' | 'demand' | 'employment';
export const seriesLabels: Record<ChartSeries, string> = { overall: 'Overall market', demand: 'Job demand', employment: 'Industry employment' };
export function scoreFor(row: Assessment, series: ChartSeries): number | null {
  const value = series === 'overall' ? row.score : row.indicators.find(i => i.id === series)?.score;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100 ? value : null;
}
export function chartPath(history: Assessment[], series: ChartSeries, plotWidth = 800): string {
  let connected = false;
  return history.map((row, index) => {
    const score = scoreFor(row, series);
    if (score === null) { connected = false; return ''; }
    const x = 48 + index / Math.max(1, history.length - 1) * plotWidth;
    const y = 220 - score * 1.8;
    const command = connected ? 'L' : 'M'; connected = true;
    return `${command}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}
export function freshnessFor(data: Pick<HealthOutput, 'freshness'>, now = new Date()) {
  const today = Date.parse(now.toISOString().slice(0, 10));
  return data.freshness.sources.map(source => {
    const definition = [indeed, employment].find(item => item.id === source.id);
    const date = source.latestObservationDate ? Date.parse(source.latestObservationDate) : NaN;
    const ageDays = Number.isFinite(date) ? Math.floor((today - date) / 86_400_000) : null;
    const status = source.status === 'missing' || source.status === 'invalid' ? source.status
      : !definition || ageDays === null || ageDays < 0 ? 'invalid'
      : ageDays > definition.staleAfterDays ? 'stale' : source.status;
    return { ...source, status, ageDays };
  });
}
export type ChartRange = '1' | '3' | 'all';
export function historyRange(history: Assessment[], range: ChartRange): Assessment[] {
  const last = history.at(-1)?.referenceMonth;
  if (!last || range === 'all') return history;
  const date = new Date(last + '-01T00:00:00Z');
  date.setUTCMonth(date.getUTCMonth() - (range === '1' ? 11 : 35));
  const first = date.toISOString().slice(0, 7);
  return history.filter(row => row.referenceMonth !== null && row.referenceMonth >= first);
}
export function previousMonthChange(history: Assessment[], series: ChartSeries): number | null {
  const latest = history.at(-1), previous = history.at(-2);
  if (!latest?.referenceMonth || !previous?.referenceMonth) return null;
  const expected = new Date(latest.referenceMonth + '-01T00:00:00Z');
  expected.setUTCMonth(expected.getUTCMonth() - 1);
  if (previous.referenceMonth !== expected.toISOString().slice(0, 7)) return null;
  const current = scoreFor(latest, series), before = scoreFor(previous, series);
  return current === null || before === null ? null : current - before;
}
// Display conversion only; model inputs and scoring retain their log-percent units.
export function ordinaryPercentValue(logPercent: number | null | undefined): number | null {
  if (logPercent == null || !Number.isFinite(logPercent)) return null;
  const value = 100 * Math.expm1(logPercent / 100);
  return Number.isFinite(value) ? value : null;
}
export function ordinaryPercent(logPercent: number | null | undefined): string {
  const value = ordinaryPercentValue(logPercent);
  return value === null ? 'Unavailable' : `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}
export function metricChange(current: number | null | undefined, previous: number | null | undefined, precision = 2, unit = '') {
  if (current == null || previous == null || !Number.isFinite(current) || !Number.isFinite(previous)) return null;
  const difference = Number((current - previous).toFixed(precision));
  return {
    tone: difference > 0 ? 'increase' : difference < 0 ? 'decrease' : 'unchanged',
    label: `${difference > 0 ? '+' : difference < 0 ? '−' : ''}${Math.abs(difference).toLocaleString('en-US', { maximumFractionDigits: precision })}${unit ? ` ${unit}` : ''}`,
  };
}
export const formatScore = (value: number | null) => value === null ? 'Unavailable' : value.toFixed(1);
export function formatDate(value: string | null, monthly = false): string {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', ...(monthly ? {} : { day: 'numeric' }), timeZone: 'UTC' })
    .format(new Date(value.length === 7 ? value + '-01T00:00:00Z' : value));
}
