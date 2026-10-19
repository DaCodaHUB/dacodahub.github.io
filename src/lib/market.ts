import type { HealthOutput, Assessment } from '../../scripts/job-market/health-types.ts';
import { indeed, employment } from '../../scripts/job-market/sources.ts';

export type ChartSeries = 'overall' | 'demand' | 'employment';
export const seriesLabels: Record<ChartSeries, string> = { overall: 'Overall market', demand: 'Job demand', employment: 'Industry employment' };
export function scoreFor(row: Assessment, series: ChartSeries): number | null {
  const value = series === 'overall' ? row.score : row.indicators.find(i => i.id === series)?.score;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100 ? value : null;
}
export function chartPath(history: Assessment[], series: ChartSeries): string {
  let connected = false;
  return history.map((row, index) => {
    const score = scoreFor(row, series);
    if (score === null) { connected = false; return ''; }
    const x = 48 + index / Math.max(1, history.length - 1) * 800;
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
export const formatScore = (value: number | null) => value === null ? 'Unavailable' : value.toFixed(1);
export function formatDate(value: string | null, monthly = false): string {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', ...(monthly ? {} : { day: 'numeric' }), timeZone: 'UTC' })
    .format(new Date(value.length === 7 ? value + '-01T00:00:00Z' : value));
}
