import type { SeriesDefinition } from './types.ts';

export const indeed: SeriesDefinition = {
  id: 'indeed-us-software-development-total',
  title: 'U.S. software development total job postings',
  provider: 'Indeed Hiring Lab',
  sourceUrl: 'https://github.com/hiring-lab/job_postings_tracker',
  downloadUrl: 'https://raw.githubusercontent.com/hiring-lab/job_postings_tracker/master/US/job_postings_by_sector_US.csv',
  units: 'Index, February 1, 2020 = 100',
  frequency: 'daily',
  seasonalAdjustment: 'seasonally adjusted',
  definition: 'U.S. Software Development occupational sector, total postings; seven-day trailing average. Daily observations refreshed weekly.',
  caveats: [
    'Indeed postings measure advertised demand, not hires, employment, or all U.S. vacancies.',
    'Sector categories use normalized job titles rather than official occupation codes.',
    'Historical data are revised; the repository documents a November 2024 seasonal adjustment methodology change.',
    'The README uses percent-change wording, but its baseline example and CSV use an index with baseline 100. Values are retained without rebasing.',
  ],
  attribution: 'Indeed Hiring Lab, Indeed Job Postings Index, Software Development, United States.',
  license: 'CC BY 4.0: https://creativecommons.org/licenses/by/4.0/',
  staleAfterDays: 21,
};

export const employment: SeriesDefinition = {
  id: 'CES6054150001',
  title: 'All Employees, Computer Systems Design and Related Services',
  provider: 'U.S. Bureau of Labor Statistics via FRED',
  sourceUrl: 'https://fred.stlouisfed.org/series/CES6054150001',
  downloadUrl: 'https://api.stlouisfed.org/fred/series/observations',
  units: 'Thousands of persons',
  frequency: 'monthly',
  seasonalAdjustment: 'seasonally adjusted',
  definition: 'BLS Current Employment Statistics establishment-survey payroll employment in Computer Systems Design and Related Services. Dates identify reference months, not publication dates.',
  caveats: [
    'Industry employment includes non-developer occupations and excludes developers working in other industries.',
    'Payroll jobs are not vacancies or unique workers. Preliminary and historical observations can be revised.',
    'Monthly observations retain their native frequency and must not be counted as independent daily signals.',
  ],
  attribution: 'U.S. Bureau of Labor Statistics, All Employees, Computer Systems Design and Related Services [CES6054150001], retrieved from FRED, Federal Reserve Bank of St. Louis.',
  license: 'Public domain; citation requested. https://fred.stlouisfed.org/series/CES6054150001',
  staleAfterDays: 75,
};
