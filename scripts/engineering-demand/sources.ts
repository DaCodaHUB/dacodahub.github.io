import type { OccupationMapping } from './types.ts';

export const mappingUrl = 'https://www.onetcenter.org/taxonomy/2019/soc.html';
export const blsTableUrl = 'https://www.bls.gov/emp/tables/occupational-projections-and-characteristics.htm';
export const blsDownloadUrl = 'https://www.bls.gov/emp/ind-occ-matrix/occupation.xlsx';
export const onetLicenseUrl = 'https://www.onetonline.org/help/license';
export const blsLicenseUrl = 'https://www.bls.gov/bls/linksite.htm';
export const occupations: OccupationMapping[] = [
  { id: 'software-developers', name: 'Software Developers', onetSoc: '15-1252.00', blsSoc: '15-1252', relationship: 'same-soc-scope', caveat: 'SOC-aligned occupation; online posting coverage and total employment are different populations.' },
  { id: 'web-developers', name: 'Web Developers', onetSoc: '15-1254.00', blsSoc: '15-1254', relationship: 'same-soc-scope', caveat: 'Excludes Web and Digital Interface Designers (15-1255). Posting coverage differs from total employment.' },
  { id: 'data-scientists', name: 'Data Scientists', onetSoc: '15-2051.00', blsSoc: '15-2051', relationship: 'bls-broader', caveat: 'BLS 15-2051 also maps to Business Intelligence Analysts (15-2051.01) and Clinical Data Managers (15-2051.02). Its outlook covers a broader population than these O*NET posting percentages.' },
  { id: 'information-security-analysts', name: 'Information Security Analysts', onetSoc: '15-1212.00', blsSoc: '15-1212', relationship: 'same-soc-scope', caveat: 'Excludes Information Security Engineers (15-1299.05) and Penetration Testers (15-1299.04). Posting coverage differs from total employment.' },
  { id: 'software-qa', name: 'Software Quality Assurance Analysts and Testers', onetSoc: '15-1253.00', blsSoc: '15-1253', relationship: 'same-soc-scope', caveat: 'Uses the separate QA occupation, not the combined developers-and-testers Occupational Outlook Handbook profile.' },
];
export const demandUrl = (code: string) => `https://www.onetonline.org/link/demand/${code}`;
