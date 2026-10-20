# Engineering Demand Explorer

The explorer is an independent, static section of `/market/`. It never contributes to Market Health, infers a specialty score, or calls economic APIs from a visitor's browser. Astro renders the generated JSON; a small TypeScript script switches occupation panels and recalculates source review notices. The existing design tokens, panels, controls, typography, focus styling, and responsive conventions are reused. The portfolio currently defines a fixed dark palette; this component introduces no separate theme and inherits any changes to the shared tokens.

## Verified sources (October 19, 2026)

### Employer-based technology mentions

- Entry point: https://www.onetonline.org/; database overview: https://www.onetcenter.org/database.html
- Selected data: **Employer-Based In Demand Software Skills**, Lightcast U.S. nationwide postings, January 1–December 31, **2025**.
- Occupation pages: `https://www.onetonline.org/link/demand/{O*NET-SOC}`. The pipeline discovers each actual CSV export link from the page, validates its host/path/occupation, and retrieves it. For example: https://www.onetonline.org/link/demand/15-1252.00/In_Demand_15-1252-00.csv?fmt=csv
- Verified CSV fields: `Percentage`, `Software Skill`, `Hot Technology`. We consume the first two. A Hot Technology flag is not an occupation-specific growth measure.
- Definition: unique postings mentioning a skill divided by all unique postings linked to that O*NET-SOC occupation. In Demand means at least 5%. The published values are rounded percentages, not posting counts. Each posting may mention several technologies; percentages overlap.
- All qualifying skills are retained in JSON. The UI shows the first ten after descending stable sorting; source order breaks rounded-percentage ties, including at position ten. Names are preserved, with whitespace normalized.
- Posting year comes from the source page, not retrieval year. The page currently provides no explicit release date, so `publicationDate` is null.
- The main O*NET **31.0 Software Skills** database has seven fields including `In Demand` and `Hot Technology` flags, **not posting percentages**. Its download is not substituted for the employer-based table. Verified dictionary: https://www.onetcenter.org/dictionary/31.0/excel/software_skills.html

### Career outlook

- Official tables index: https://www.bls.gov/emp/tables.htm
- Latest verified Table 1.2: https://www.bls.gov/emp/tables/occupational-projections-and-characteristics.htm
- Official workbook linked there: https://www.bls.gov/emp/ind-occ-matrix/occupation.xlsx
- Latest verified projection period: **2025–2035**; HTML last modified **August 27, 2026**.
- Required workbook sheet: Table 1.2. Columns are matched by descriptive headers, not fixed positions. Source title and growth/openings headers must identify the same ten-year period; source units must identify thousands. The pipeline rejects unfamiliar schemas rather than guessing.
- `Employment change, percent` is the published total percentage change over the ten-year projection period, not annual growth.
- `Occupational openings, annual average` is in thousands. Multiply by 1,000 once. These projected openings arise from net employment change and occupational separations; they are not current vacancies or a count of all job-to-job moves within an occupation.
- BLS definitions: https://www.bls.gov/emp/documentation/definitions.htm

**Initial retrieval limitation:** Direct requests for both the XLSX and HTML returned BLS Access Denied in this environment. The official HTML was readable through the research browser. `scripts/engineering-demand/sources/bls-2025-2035-extract.json` records the five verified rows, selected original headers, source URL, actual extraction time, and publication date. This is a reviewed first-party extract, not a workbook download or third-party estimate. Its values are parsed by the same row validator. Initial JSON marks `retrievalMethod: "official-table-extract"` and hashes the extract. A successful subsequent live workbook refresh replaces it and records `retrievalMethod: "xlsx"`, its actual retrieval time, and a hash of the workbook. The live BLS workbook parser has been exercised with a synthetic XLSX fixture, but could not be tested against the actual current workbook download locally. If its layout differs, it fails closed and retains the verified extract.

## Occupational mappings

Source: https://www.onetcenter.org/taxonomy/2019/soc.html (O*NET-SOC 2019 → 2018 SOC). These are explicit allowlisted mappings, not prefix stripping.

| Occupation | O*NET-SOC | BLS SOC | Scope |
| --- | --- | --- | --- |
| Software Developers | 15-1252.00 | 15-1252 | SOC-aligned |
| Web Developers | 15-1254.00 | 15-1254 | Excludes Web and Digital Interface Designers |
| Data Scientists | 15-2051.00 | 15-2051 | BLS broader: also maps to Business Intelligence Analysts 15-2051.01 and Clinical Data Managers 15-2051.02 |
| Information Security Analysts | 15-1212.00 | 15-1212 | Excludes Information Security Engineers and Penetration Testers |
| Software Quality Assurance Analysts and Testers | 15-1253.00 | 15-1253 | Separate occupation; not combined developers-and-testers OOH figures |

Even SOC-aligned rows measure different populations: online advertisements versus jobs in the National Employment Matrix. Keep each source's period separate. Do not multiply BLS openings by O*NET skill percentages or treat career labels as Android/backend/frontend-specific statistics.

## Data contract and safety

`scripts/engineering-demand/types.ts` defines `DemandData` (`schemaVersion: "1.0"`, `methodologyVersion: "engineering-demand-1"`). Each occupation includes the explicit mapping/caveat, `technologies` (availability, reason, source, name/mentionPercent values), and `outlook` (availability, reason, source, employmentGrowthPercent/averageAnnualOpenings). Missing numeric metrics are null, never zero-filled. Sources retain page/download/license URLs, attribution, source period dates, retrieval timestamps, optional publication date, retrieval method, and SHA-256. Top-level metadata records methodology, transformations, limitations, and per-provider refresh outcome. No credentials are used or included.

Updates are transactions **per provider across all five occupations**. A missing occupation, invalid record, inconsistent period, duplicate, or period regression rejects that provider update. The other source can update independently because these are separately labeled measures, not inputs to a composite calculation. Original retrieval dates and valid values survive a failed refresh. Final JSON is runtime-validated before a temporary file is atomically renamed over the previous file. A corrupt previous file is an error, not silently accepted.

Freshness is a **review notice**, not a claim that annual data measures today. An update check becomes overdue 35 days after the last successful source retrieval. An O*NET period is flagged for review 550 days after its end; BLS when the base year is more than two calendar years old. These deliberately documented display thresholds do not estimate missing releases or statistical validity. The browser reevaluates them on load, every minute, and on returning to the tab. Retained-data notices are separate and remain visible even when timestamps are recent.

## Commands

Use the repository's Node requirement (>=22.19; CI uses Node 24) and npm. In Windows PowerShell use `npm.cmd` when execution policy blocks npm.ps1.

```sh
npm ci
npm run demand:refresh
npm run demand:validate
npm test
npm run check
npm run build
npm run demand:test-browser
```

The browser smoke test needs Chrome/Chromium (`CHROME_PATH` override supported), a built `dist/`, and local browser launch permission. It checks all five selections, accessible selector naming, keyboard selection/focus, numeric bars, narrow layouts, theme media preferences, no visitor economic API requests, and a no-JavaScript fallback. It saves screenshots only under ignored `.astro/`.

Recovery when BLS refuses automated downloads:

```sh
# Download the official workbook manually without bypassing source access controls.
npm run demand:refresh -- --bls-xlsx /path/to/occupation.xlsx
# Reproduce the reviewed initial import (keeps its original extraction date):
npm run demand:refresh -- --bls-extract scripts/engineering-demand/sources/bls-2025-2035-extract.json
```

The extract is a historical reviewed source snapshot, not an automatic fallback pretending to be new data. Later source periods must be verified; the pipeline prevents importing this older extract over newer projections. If O*NET changes its schema/year formatting or BLS changes workbook headings, inspect the official release, update the parser and fixtures, run the full checks, and regenerate. Do not replace missing percentages with flags, samples, or estimates.

## GitHub Pages updates

The existing `.github/workflows/deploy.yml` continues using its existing Monday **America/Los_Angeles** schedule, push/manual triggers, Market Health secret and refresh, Astro build/upload, and Pages deployment. One independent step runs `npm run demand:refresh -- --restore-published`. It restores the validated currently published explorer snapshot before refreshing; a 404 bootstraps the first deployment from the checked-in snapshot. Other restore failures or invalid published JSON block deployment rather than silently rolling published data back to an old checkout. Restoring chooses the newest period and successful retrieval per provider, not the last failed attempt date. Provider update failures produce Actions warnings and retained/unavailable states in JSON, while permitting the existing portfolio deployment. An invalid final snapshot is a hard failure. No new secrets or GitHub settings are required.

Commit the normalized `public/data/engineering-demand/demand.json` as the initial offline/build fallback. Scheduled runs publish refreshed JSON in the Pages artifact without committing raw workbooks or downloaded CSVs. Tests make no external requests. `demand:validate` checks the production snapshot locally. If a refresh is retained, check Actions logs, confirm official source availability, and retry via workflow_dispatch. Existing Market Health failure/deployment rules remain unchanged.

## Reuse and attribution

- O*NET OnLine: https://www.onetonline.org/help/license (CC BY 4.0, attribution, modification notice, trademark guidance, external-source exceptions). See https://www.onetonline.org/help/online/datasources for the listed external sources. The explorer attributes both O*NET OnLine/USDOL/ETA and Lightcast, links the terms, and describes transformations. It does not claim that raw Lightcast data is open-licensed or redistribute raw postings. Recheck the publisher's terms if expanding redistribution beyond these public occupation-level aggregates.
- BLS: https://www.bls.gov/bls/linksite.htm — public domain data, citation requested. No logos or implication of endorsement.
- No API registration, API key, paid access, new backend, or database.

## Files

- `scripts/engineering-demand/{sources,types,parse,pipeline,cli,demand.test}.ts`: allowlisted mappings, contract, ingestion, validation, atomic writer and tests.
- `scripts/engineering-demand/sources/bls-2025-2035-extract.json`: reviewed initial first-party extract.
- `scripts/engineering-demand/fixtures/table-1.2.xlsx`: synthetic parser-test workbook; all five fixture rows use 12% and 2 thousand openings. **Not production data.**
- `public/data/engineering-demand/demand.json`: real normalized static output.
- `src/components/EngineeringDemand.astro`, `src/lib/engineering-demand.ts`, `src/styles/engineering-demand.css`: dashboard, selection/formatting/freshness helpers, token-based responsive styling.
- `scripts/engineering-demand/browser-check.mjs`: optional built-page browser smoke test.
- `src/pages/market.astro`: imports and places the explorer after the existing history chart.
- `package.json`, `package-lock.json`: commands, test registration and the build-time-only `read-excel-file` XLSX reader. No chart framework or browser dependency.
- `.github/workflows/deploy.yml`, `.gitignore`: independent refresh step and ignored atomic temporary output.
