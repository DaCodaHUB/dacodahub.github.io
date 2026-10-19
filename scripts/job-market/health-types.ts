export type Classification = 'Contracting' | 'Balanced' | 'Growing' | 'Unknown' | 'Insufficient Data';
export interface IndicatorScore {
  id: 'demand' | 'employment' | 'tightness';
  status: 'available' | 'missing' | 'invalid' | 'stale' | 'insufficient-history';
  score: number | null;
  proposedWeight: number;
  effectiveWeight: number;
  observationDate: string | null;
  values: Record<string, number | null>;
  scales: Record<string, number>;
  calibrationObservations: number;
  explanation: string;
  source: { id: string; url: string; attribution: string } | null;
}
export interface Assessment {
  asOf: string;
  referenceMonth: string | null;
  score: number | null;
  classification: Classification;
  explanation: string;
  indicators: IndicatorScore[];
}
export interface HealthOutput {
  schemaVersion: 1;
  methodologyVersion: '2.0.0-provisional';
  generatedAt: string;
  update?: { status: 'updated' | 'retained'; attemptedAt: string; dataGeneratedAt: string; message: string };
  scope: string;
  methodology: {
    provisional: true;
    thresholds: { contractingBelow: 40; growingAbove: 60 };
    historyBasis: 'retrospective-latest-vintage';
    assumedAvailabilityDaysAfterMonthEnd: 45;
    limitations: string[];
  };
  freshness: { evaluatedAt: string; sources: { id: string; status: 'fresh' | 'stale' | 'missing' | 'invalid'; latestObservationDate: string | null; ageDays: number | null }[] };
  current: Assessment;
  history: Assessment[];
}
