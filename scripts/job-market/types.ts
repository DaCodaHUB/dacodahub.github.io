export interface Observation {
  date: string;
  value: number | null;
}

export interface SeriesDefinition {
  id: string;
  title: string;
  provider: string;
  sourceUrl: string;
  downloadUrl: string;
  units: string;
  frequency: 'daily' | 'monthly';
  seasonalAdjustment: 'seasonally adjusted';
  definition: string;
  caveats: string[];
  attribution: string;
  license: string;
  staleAfterDays: number;
}

export interface NormalizedSeries extends SeriesDefinition {
  retrievedAt: string;
  latestObservationDate: string;
  freshness: { evaluatedAt: string; ageDays: number; stale: boolean };
  missingCount: number;
  observations: Observation[];
}
