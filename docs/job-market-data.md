# Tech Job Market Analyzer: phase 1

## Repository integration

Inspected Astro 7.3.3 (package range ^7.0.0), npm lockfile v3, strict TypeScript,
static output with trailing slashes, Markdown content collections, reusable layouts
and components, and shared dark CSS with Manrope/DM Mono. No existing test runner.
The original Pages workflow uses Node 24, withastro/action@v6 and deploy-pages@v4
on main pushes or manual dispatch. It is unchanged. No UI or score is added.

Server-only ingestion lives in `scripts/job-market/`; it is never imported by a
browser component. Generated files in `public/data/job-market/` are copied by
Astro to the same URL path. A future frontend can fetch
`/data/job-market/market-data.json`. No server, database, or build-time API call
is needed. A clean checkout can still build without generated data.

## Confirmed sources

### Indeed demand

- Repository and methodology: https://github.com/hiring-lab/job_postings_tracker
- Verified file: https://raw.githubusercontent.com/hiring-lab/job_postings_tracker/master/US/job_postings_by_sector_US.csv
- Exact selection: `jobcountry=US`, `display_name=Software Development`,
  `variable=total postings`; value column `indeed_job_postings_index`.
- Daily observations, seven-day trailing average, seasonally adjusted, refreshed weekly.
- Index February 1, 2020 = 100. The README inconsistently describes percentage
  change; its baseline example and actual baseline rows confirm index levels.
  Values are retained unchanged. New postings are excluded to avoid conflating
  the stock with the inflow of newly advertised positions.
- Indeed occupational categories are based on normalized titles. This is a
  platform-specific demand signal, not a count of hires or the whole market.
- History is revised; the repository describes a November 2024 methodology change.
- CC BY 4.0 permits public reuse with attribution. Attribution/license travel
  with the generated data and must also appear in the future dashboard.

### FRED employment context

- Series: https://fred.stlouisfed.org/series/CES6054150001
- BLS Current Employment Statistics, All Employees, Computer Systems Design and
  Related Services; monthly, seasonally adjusted, thousands of persons.
- Reference-month dates are not release dates. This measures industry payroll
  jobs across occupations, not software engineers across all industries.
- Preliminary observations and history may be revised. Public domain, citation requested.
- Supported retrieval: https://fred.stlouisfed.org/docs/api/fred/series_observations.html
- Requests use JSON, untransformed levels, ascending dates, full available history,
  and a 100,000-observation limit. A truncated response fails rather than silently
  dropping history. This monthly series fits in a single request.
- FRED's `IHLIDXUSTPSOFTDEVE` is verified but excluded: it duplicates Indeed's
  signal and its FRED notes impose different redistribution restrictions.
  https://fred.stlouisfed.org/series/IHLIDXUSTPSOFTDEVE

These sources support later analysis, but do not alone establish an objective
market classification. No Contracting/Balanced/Growing thresholds are defined yet.

## Local commands

Use the project's required Node >=22.19 (Node 24 matches deployment). On Windows,
use `npm.cmd` if PowerShell blocks npm.ps1.

```powershell
npm ci
npm test
$env:FRED_API_KEY = 'your registered key'
npm run data:fetch
npm run check
npm run build
```

The key is read only from the process environment. There is no automatic `.env`
loader. Do not use a `PUBLIC_` environment variable or commit credentials.
For an explicit key-free partial fetch:

```text
npm run data:fetch -- --indeed-only
```

Full runs write `market-data.json` (`complete: true`); partial runs write
`indeed.json` (`complete: false`) and never replace the complete bundle.

## Data contract and failure behavior

Schema version 1 bundles generation time and normalized series. Each series
includes source/download URLs (without credentials), attribution, definitions,
units, native frequency, seasonal adjustment, retrieval timestamp, sorted
`{date, value}` observations, missing count, latest nonmissing observation date,
and freshness evaluation time/age/status. Empty strings and FRED `.` become null;
missing calendar dates are not interpolated or manufactured. No frequency
conversion, forward filling, scoring, or derived economic metrics occur.

Invalid dates, negative/nonfinite values, duplicate dates, future dates, changed
schemas, empty series, invalid JSON, truncated responses, HTTP errors and network
failures fail the run. Requests time out after 30 seconds and retry network,
429 and 5xx failures up to three attempts. Errors omit URLs and provider bodies
to protect FRED query credentials. Full publication is a single atomic rename
after both sources succeed; previous output survives failures.

Freshness limits are operational tolerances, not economic indicators: 21 days
for weekly refreshed Indeed daily observations and 75 days for monthly BLS
reference dates. Latest *nonmissing* dates determine age. Stale fetches fail
without publishing; failed Actions runs provide the alert. Stored freshness
describes generation time only: future UI must reevaluate age at display time
and suppress classification when data become stale. Retained JSON can age even
if updates stop. Each refresh replaces history to incorporate source revisions;
this is not a vintage archive suitable for unbiased historical backtesting.

## Automated updates

Phase 4 consolidates automatic refresh and publication into `deploy.yml`, running
Mondays at 08:23 America/Los_Angeles, on main pushes, and manually. The original
Friday PR workflow is retired. See [automation and recovery](job-market-automation.md)
for required FRED_API_KEY/Pages settings, retained-data behavior, and local commands.

Tests use Node's built-in runner and synthetic protocol fixtures only. Published
JSON is generated exclusively from actual provider responses.
