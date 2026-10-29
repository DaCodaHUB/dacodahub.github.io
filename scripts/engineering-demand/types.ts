export interface OccupationMapping {
  id: string;
  name: string;
  onetSoc: string;
  blsSoc: string;
  relationship: 'same-soc-scope' | 'bls-broader';
  caveat: string;
}
export interface SourceMetadata {
  url: string;
  downloadUrl: string;
  attribution: string;
  licenseUrl: string;
  retrievedAt: string;
  publicationDate: string | null;
  period: { start: string; end: string };
  retrievalMethod: 'csv' | 'xlsx' | 'official-table-extract';
  sha256: string;
}
export interface Technologies {
  status: 'available' | 'unavailable';
  reason: string | null;
  source: SourceMetadata | null;
  values: { name: string; mentionPercent: number }[];
}
export interface Outlook {
  status: 'available' | 'unavailable';
  reason: string | null;
  source: SourceMetadata | null;
  employmentGrowthPercent: number | null;
  averageAnnualOpenings: number | null;
}
export interface DemandOccupation extends OccupationMapping {
  technologies: Technologies;
  outlook: Outlook;
}
export interface DemandData {
  schemaVersion: '1.0';
  methodologyVersion: 'engineering-demand-1';
  generatedAt: string;
  refresh: { attemptedAt: string; onet: 'updated' | 'retained' | 'unavailable'; bls: 'updated' | 'retained' | 'unavailable'; messages: string[] };
  methodology: {
    mappingUrl: string;
    technologyDefinition: string;
    outlookDefinition: string;
    transformations: string[];
    limitations: string[];
  };
  occupations: DemandOccupation[];
  previous?: { occupations: DemandOccupation[] };
}
