import { observationDate } from './normalize.ts';
import { indeed, employment } from './sources.ts';
import type { SeriesDefinition, Observation } from './types.ts';
import type { Assessment, Classification, HealthOutput, IndicatorScore } from './health-types.ts';

const DAY = 86_400_000;
type Monthly = Map<string, number>;
interface Input { definition: SeriesDefinition; status: 'fresh' | 'stale' | 'missing' | 'invalid'; rows: Observation[]; latest: string | null; age: number | null }
const definitions = [indeed, employment];
const month = (date: string) => date.slice(0, 7);
function shift(key: string, delta: number): string {
  return new Date(Date.UTC(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1 + delta, 1)).toISOString().slice(0, 7);
}
function end(key: string): string {
  return new Date(Date.parse(shift(key, 1) + '-01') - DAY).toISOString().slice(0, 10);
}
function available(key: string): string {
  return new Date(Date.parse(end(key)) + 45 * DAY).toISOString().slice(0, 10);
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected object');
  return value as Record<string, unknown>;
}

function inputs(payload: unknown, asOf: string): Input[] {
  let series: unknown[] = [];
  try {
    const bundle = record(payload);
    if (bundle.schemaVersion !== 1 || !Array.isArray(bundle.series)) throw new Error('Invalid bundle');
    series = bundle.series;
  } catch { return definitions.map(definition => ({ definition, status: 'invalid', rows: [], latest: null, age: null })); }
  return definitions.map(definition => {
    const base: Input = { definition, status: 'missing', rows: [], latest: null, age: null };
    try {
      const matches = series.filter(item => record(item).id === definition.id);
      if (!matches.length) return base;
      if (matches.length !== 1) throw new Error('Duplicate series');
      const item = record(matches[0]);
      if (item.units !== definition.units || item.frequency !== definition.frequency ||
          item.seasonalAdjustment !== definition.seasonalAdjustment || !Array.isArray(item.observations)) throw new Error('Invalid metadata');
      if (typeof item.retrievedAt !== 'string' || !Number.isFinite(Date.parse(item.retrievedAt)) || item.retrievedAt.slice(0, 10) > asOf) throw new Error('Invalid retrieval time');
      const seen = new Set<string>();
      const rows = item.observations.map(raw => {
        const row = record(raw), date = observationDate(row.date), value = row.value;
        if (seen.has(date) || date > asOf || date > String(item.retrievedAt).slice(0, 10) ||
            (definition.frequency === 'monthly' && !date.endsWith('-01')) ||
            (value !== null && (typeof value !== 'number' || !Number.isFinite(value) || value < 0))) throw new Error('Invalid observation');
        seen.add(date);
        return { date, value: value as number | null };
      }).sort((a, b) => a.date.localeCompare(b.date));
      const latest = rows.findLast(row => row.value !== null)?.date ?? null;
      const age = latest ? Math.floor((Date.parse(asOf) - Date.parse(latest)) / DAY) : null;
      return { definition, rows, latest, age, status: age === null ? 'missing' : age > definition.staleAfterDays ? 'stale' : 'fresh' };
    } catch { return { ...base, status: 'invalid' }; }
  });
}

function monthly(input: Input): Monthly {
  const result: Monthly = new Map();
  if (input.definition.frequency === 'monthly') {
    for (const row of input.rows) if (row.value !== null && row.value > 0) result.set(month(row.date), row.value);
    return result;
  }
  const groups = new Map<string, Observation[]>();
  for (const row of input.rows) if (row.value !== null && row.value > 0) {
    const key = month(row.date);
    const group = groups.get(key) ?? []; group.push(row); groups.set(key, group);
  }
  for (const [key, rows] of groups) {
    const days = Number(end(key).slice(8));
    if (rows.length / days >= 0.8 && Number(rows[0]!.date.slice(8)) <= 3 && Number(rows.at(-1)!.date.slice(8)) >= days - 2) {
      result.set(key, rows.reduce((mean, row, index) => mean + (row.value! - mean) / (index + 1), 0));
    }
  }
  return result;
}

function growth(data: Monthly, key: string, lag: number): number | null {
  // Require every intervening month; never bridge a missing observation.
  for (let i = 0; i <= lag; i++) if (!data.has(shift(key, -i))) return null;
  return 100 * (Math.log(data.get(key)!) - Math.log(data.get(shift(key, -lag))!));
}
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}
export const scaleScore = (value: number, scale: number): number => 50 + 50 * Math.tanh(value / scale);
export function classify(score: number): Classification {
  if (!Number.isFinite(score) || score < 0 || score > 100) return 'Unknown';
  return score < 40 ? 'Contracting' : score > 60 ? 'Growing' : 'Balanced';
}

function component(input: Input, data: Monthly, key: string, current: boolean): IndicatorScore {
  const demand = input.definition.id === indeed.id;
  const result: IndicatorScore = {
    id: demand ? 'demand' : 'employment', status: 'insufficient-history', score: null,
    proposedWeight: demand ? 0.5 : 0.3, effectiveWeight: 0,
    observationDate: data.has(key) ? demand ? end(key) : key + '-01' : null,
    values: { level: data.get(key) ?? null, threeMonthLogChangePercent: growth(data, key, 3), yearOverYearLogChangePercent: growth(data, key, 12) },
    scales: {}, calibrationObservations: 0,
    explanation: 'Requires a complete reference period, growth windows and at least 24 prior calibration months.',
    source: { id: input.definition.id, url: input.definition.sourceUrl, attribution: input.definition.attribution },
  };
  if (input.status === 'invalid' || input.status === 'missing' || (current && input.status === 'stale')) {
    result.status = input.status;
    result.explanation = `Source is ${input.status}; no component score is published.`;
    return result;
  }
  const past = [...data.keys()].filter(k => k < key).sort();
  const prior = past.map(k => ({ trend: growth(data, k, 3), year: growth(data, k, 12) }))
    .filter(row => row.trend !== null && (demand || row.year !== null));
  result.calibrationObservations = prior.length;
  const trend = result.values.threeMonthLogChangePercent;
  const year = result.values.yearOverYearLogChangePercent;
  const level = result.values.level;
  if (prior.length < 24 || trend == null || level == null || (!demand && year == null)) return result;
  const trendScale = Math.max(demand ? 5 : 1, median(prior.map(row => Math.abs(row.trend!))));
  const levelScale = demand ? 100 * Math.log(1.5) : Math.max(2, median(prior.map(row => Math.abs(row.year!))));
  const levelSignal = demand ? 100 * (Math.log(level) - Math.log(100)) : year!;
  result.values.levelSignal = levelSignal;
  result.scales = { trend: trendScale, level: levelScale };
  result.score = 0.4 * scaleScore(levelSignal, levelScale) + 0.6 * scaleScore(trend, trendScale);
  result.status = 'available';
  result.explanation = demand
    ? `Postings index ${level.toFixed(2)} (2020 baseline 100); three-month change ${trend.toFixed(2)} log-percent. Level contributes 40%, trend 60%.`
    : `Industry payroll employment ${level.toFixed(2)} thousand; annual change ${year!.toFixed(2)} and three-month change ${trend.toFixed(2)} log-percent. Annual growth contributes 40%, recent trend 60%. This is industry context, not an occupation count.`;
  return result;
}

function assess(input: Input[], data: Monthly[], key: string, asOf: string, current: boolean): Assessment {
  const indicators = input.map((source, i) => component(source, data[i]!, key, current));
  indicators.push({ id: 'tightness', status: 'missing', score: null, proposedWeight: 0.2, effectiveWeight: 0,
    observationDate: null, values: {}, scales: {}, calibrationObservations: 0, source: null,
    explanation: 'No compatible vacancy-to-worker or occupation-specific labor-supply measure exists in the selected sources. Excluded from the composite.' });
  const demand = indicators[0]!, jobs = indicators[1]!;
  if (demand.score === null || jobs.score === null) return { asOf, referenceMonth: key, score: null, classification: 'Insufficient Data', indicators,
    explanation: 'Both aligned, fresh and adequately calibrated demand and employment components are required. Missing components are never replaced with neutral scores.' };
  if ((demand.score < 40 && jobs.score > 60) || (jobs.score < 40 && demand.score > 60)) return {
    asOf, referenceMonth: key, score: null, classification: 'Unknown', indicators,
    explanation: 'Demand and industry employment point strongly in opposite directions; their disagreement does not establish a balanced market.' };
  demand.effectiveWeight = 0.625; jobs.effectiveWeight = 0.375;
  const score = demand.score * 0.625 + jobs.score * 0.375;
  return { asOf, referenceMonth: key, score, classification: classify(score), indicators,
    explanation: 'Provisional two-component proxy: 62.5% software postings and 37.5% computer-systems industry employment. Tightness is unmeasured. Thresholds are not historically validated.' };
}

export function calculateHealth(payload: unknown, now = new Date()): HealthOutput {
  const generatedAt = now.toISOString(), asOf = observationDate(generatedAt.slice(0, 10));
  const input = inputs(payload, asOf), data = input.map(monthly);
  // Fixed monthly calendar gives missing periods an explicit state rather than silently dropping them.
  const keys: string[] = [];
  for (let key = '2020-02'; available(key) <= asOf; key = shift(key, 1)) keys.push(key);
  const latest = keys.at(-1);
  return {
    schemaVersion: 1, methodologyVersion: '2.0.0-provisional', generatedAt,
    scope: 'U.S. software hiring demand and computer-systems industry employment proxy; labor-market tightness unmeasured',
    methodology: { provisional: true, thresholds: { contractingBelow: 40, growingAbove: 60 },
      historyBasis: 'retrospective-latest-vintage', assumedAvailabilityDaysAfterMonthEnd: 45,
      limitations: ['Industry and occupational populations differ; signals are distinct but not statistically independent.',
        'Historical inputs are revised, not vintage snapshots. Publication lags are assumptions, not verified release dates; this is not a real-time backtest.',
        'Expanding prior-only calibration avoids future-period scaling; thresholds and scale floors remain provisional.',
        'Balanced means neutral composite direction, not proof of equilibrium or adequate job availability.',
        'Freshness is evaluated at generation; consumers must reevaluate it as time passes.'] },
    freshness: { evaluatedAt: generatedAt, sources: input.map(i => ({ id: i.definition.id, status: i.status, latestObservationDate: i.latest, ageDays: i.age })) },
    current: latest ? assess(input, data, latest, asOf, true) : { asOf, referenceMonth: null, score: null, classification: 'Insufficient Data', indicators: [], explanation: 'No eligible completed reference month.' },
    history: keys.map(key => assess(input, data, key, available(key), false)),
  };
}
