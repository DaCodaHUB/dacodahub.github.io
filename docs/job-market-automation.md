# Monday updates and GitHub Pages

## Workflow and settings

`.github/workflows/deploy.yml` is the single deployment workflow. It retains the
existing `withastro/action@v6` static build/upload and `actions/deploy-pages@v4`
deployment, Node 24, and the `github-pages` environment. It now runs on main
pushes, manual dispatch, and Mondays at **01:00 America/Los_Angeles**, using
GitHub's native `schedule.timezone` field to track daylight saving time.
Scheduling is best effort; delayed or skipped runs are possible.

Required repository configuration:

1. Keep `main` as the default branch and merge these changes there. Schedules
   run the latest default-branch commit; deployment deliberately accepts main only.
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Settings → Secrets and variables → Actions → Repository secrets: add
   **FRED_API_KEY** with your registered FRED API key. It is passed only to the
   server-side refresh step, not to the frontend build or generated JSON.
4. Allow the workflow's actions under Settings → Actions → General. Its token
   requires `contents: read`, `pages: write`, and `id-token: write`. No PAT,
   contents-write permission, PR permission, or external hosting account is needed.
5. The `github-pages` environment must allow deployments from main. Configure
   required reviewers only if you want automated deployments to wait for approval.
6. Enable Actions failure notifications. GitHub can disable schedules in public
   repositories after 60 days without repository activity; re-enable the workflow
   from Actions if needed. Updates themselves do not make commits.

The former Friday PR workflow is removed, so updates no longer depend on merging
an automated data PR. All triggers share a non-cancelling `github-pages`
concurrency group to avoid overlapping data restoration and deployments. GitHub
may replace older queued runs; it does not guarantee FIFO execution.

References: [schedule and timezone](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule),
[Astro action](https://github.com/withastro/action),
[custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Publication safety

Each deployment installs from the lockfile and runs all ingestion, calculation,
dashboard and refresh tests. It restores the currently published observations
from this same site's `/data/job-market/market-data.json`, bypassing HTTP cache
where supported, and validates the schema, source identities, dates, values,
units, frequencies and timestamps. It reconstructs approved metadata rather than
copying arbitrary downloaded fields. If the complete JSON is 404, it checks the
original `indeed.json`. Only when both return 404 does it bootstrap from the
validated checkout dataset. This supports the initial portfolio deployment.

A published-data network error, 5xx response, malformed JSON, invalid complete
snapshot or unexpected partial complete-file response stops deployment. It must
not silently restore an older checkout snapshot over a newer live dataset.
If Pages itself is temporarily unavailable, this intentionally leaves the live
deployment untouched rather than assuming no previous dataset exists.

Both economic sources must succeed together. Fresh data must pass Phase 1 and
Phase 2 validation, including freshness and a guard against regressing latest
observation dates, dropping historical coverage, or losing previously nonmissing
observations. Partial,
invalid, stale or regressed candidates never replace the baseline. Source
revision of values within retained history remains supported. No economic
observations are fabricated, interpolated, or filled from another source.

On a source outage, the last validated observations and original retrieval and
dataset timestamps are retained. The assessment is regenerated at the actual
attempt time, so ages/stale flags and insufficient-data states reflect reality.
`market-health.json.update` records status, attempt time, original data generation
time, and a generic safe explanation. The dashboard shows retained-data notices,
actual observation dates, and a separate last data update time. Stale current
scores are withheld; historical scores remain explicitly retrospective.

Calculation completes in memory before both files are staged. I/O, tests, type
checks, or build failures stop deployment. Only a successful Astro build uploads
a Pages artifact, and deploy-pages publishes the complete site. No generated
data commits, branches, credential files, extra backup artifacts or database are
created. The published dataset itself is the durable snapshot; the workflow does
not depend on expiring Actions caches/artifacts for data recovery.

If retained data was deployed successfully, a final reporting step intentionally
marks the workflow failed so failure notifications identify the refresh outage.
The earlier deploy-pages step still exposes the successfully published Pages
URL. The build summary reports per-source dates, ages and freshness. A green run
therefore means both data refresh and Pages deployment succeeded.

## Local development

Use Node >=22.19; Node 24 matches CI. On Windows use `npm.cmd` when PowerShell
blocks npm.ps1. Never put the key in a `PUBLIC_` variable or commit it.

```powershell
npm ci
npm test
$env:FRED_API_KEY = 'your registered key'
npm run data:refresh
npm run check
npm run build
npm run dev
```

`data:refresh` uses the local validated snapshot. Add `-- --restore-published` to
exercise the exact CI restore path (requires network access). Source failures
return a retained result with exit code 0 when a valid baseline exists, so it
can still build; inspect the logged status and JSON update notice. An invalid
baseline or I/O failure returns a nonzero exit code. GitHub's final reporting
step converts retained status into a failed update notification after deployment.

The stricter `data:fetch` followed by `data:health` remains available for manual
ingestion that must fail rather than retain data. `data:fetch -- --indeed-only`
creates an explicit partial dataset and cannot substitute for a complete bundle.

## Recovery

- **Source or secret failure:** inspect the build summary and retained-data notice.
  Check FRED_API_KEY exists/is valid, then run Actions → Deploy to GitHub Pages →
  Run workflow on main. No data file cleanup or secret disclosure is needed.
- **Published snapshot restore failure:** check Pages availability and the public
  JSON URL. Restore service and rerun. The live site stays unchanged. If JSON was
  externally corrupted, restore a known-good previous Pages deployment before
  retrying; do not delete the live JSON just to force the bootstrap path.
- **Tests/type/build failure:** correct the code and push main or rerun the fixed
  revision. Candidate runner-local files never become the published baseline.
- **Pages permission/environment failure:** configure Pages source, token/action
  permissions and main environment rules above; rerun the whole workflow so it
  restores the current snapshot before attempting publication.
- **Schedule disabled or missed:** re-enable it and manually dispatch. Monday's
  run is not a guarantee of freshness; the dashboard continuously checks dates.
- **Initial bootstrap:** the existing Indeed-only checkout is an honest partial
  baseline. Until both real sources succeed, output remains Insufficient Data.

No remote deployment has been executed by local verification. A real run with the
repository secret is required to verify provider access and GitHub permissions.
