# Market health methodology 2.0.0-provisional

This is a directional proxy for U.S. software hiring demand with computer-systems
industry employment context. It is not a validated occupation-wide market index,
probability, causal model, or claim about an individual's hiring prospects.

## Signals and weights

The Phase 1 definitions and source citations remain authoritative:
[data sources](job-market-data.md). Indeed Software Development total postings
measure advertised demand. BLS CES6054150001 measures payroll employment in
Computer Systems Design and Related Services. These are distinct quantities,
but neither their statistical independence nor their population equivalence is
established. Industry employment includes other occupations and excludes software
engineers working in other industries. No incompatible vacancy/worker ratio is
constructed. Neither source measures available labor supply or market tightness.

Proposed weights are demand 50%, employment 30%, tightness 20%. Tightness is
explicitly unavailable and gets no score. When both other components qualify,
the limited proxy uses 50/80 = 62.5% demand and 30/80 = 37.5% employment. It must
not be presented as a complete three-component score. If either supported
component is unavailable, no composite is produced; there is no single-source
fallback. Different dimensions from one series are not separate independent votes.

## Alignment and availability

Daily Indeed observations are averaged within calendar months, requiring at least
80% positive/nonmissing daily coverage, a first observation within the first
three days, and a last observation within the last three days. Original data
already use overlapping seven-day averages: monthly aggregation smooths demand
and does not create additional independent samples. No missing dates are filled.
Monthly BLS observations retain their reference month and thousands-of-persons
units. Positive denominators are required for logarithms; zero values remain
valid ingestion values but cannot enter the growth calculation.

The reference month is the latest calendar month whose month-end plus 45 days
is on or before the assessment date. This conservative shared availability rule
avoids pairing current daily demand with an older employment period. It creates
intentional reporting delay. It is an assumption, not a provider release-date
guarantee; delayed releases can still violate it. Missing reference months are
shown explicitly, never replaced silently by an older month.

Current assessments recompute source observation ages using Phase 1 tolerances
(Indeed 21 days; BLS 75 days), ignoring cached freshness booleans. Those are latest
source ages, distinct from the deliberately delayed reference month. Future
retrieval/observation dates, duplicate series/dates, incorrect units, frequency or
seasonal-adjustment metadata, and invalid numeric values invalidate the affected
source. Output includes dates, source ages, retrieval-derived validation, and
generation time. Consumers must recalculate freshness as time passes.

## Formulas

For monthly value X(t), growth over k months is `g(k,t) = 100 ln(X(t)/X(t-k))`.
Every month in that interval must be present. These are log-percent changes, not
annualized or ordinary percentage changes.

Each signal maps to `S(x,s) = 50 + 50 tanh(x/s)`. Zero maps to 50, signs retain
direction, and extreme values are bounded without giving pandemic outliers
unlimited influence. This is not a percentile or probability.

- Demand level signal: `100 ln(IndeedMonthlyIndex/100)`, with scale
  `100 ln(1.5)`. Its anchor is the documented pre-pandemic baseline; the 1.5
  scale is a provisional sensitivity choice, not an estimate of equilibrium.
- Demand trend: three-month growth, scaled by the median absolute three-month
  growth across all usable *earlier* months, with a floor of 5 log-percent.
- Employment longer-term signal: year-over-year growth, scaled by the median
  absolute prior annual growth, with a floor of 2 log-percent.
- Employment trend: three-month growth, scaled by the median absolute prior
  three-month growth, with a floor of 1 log-percent.
- Each component is `0.4 S(longerTermSignal) + 0.6 S(threeMonthTrend)`.
- Composite: `0.625 demandScore + 0.375 employmentScore`.

Employment's raw level is reported but not scored relative to an arbitrary job
count: industry size changes structurally. Its annual growth provides the
longer-term context. Demand's fixed level anchor allows a recovery to show both
improving momentum and continuing weakness relative to baseline.

Calibration requires at least 24 earlier usable growth observations per component.
Employment calibration months must have both annual and three-month changes.
Only earlier reference months enter the expanding calibration window. Scale
floors prevent a flat history from creating division by zero or amplifying tiny
changes. These historical scales adapt to observed variability, but neither the
floors nor the fixed level scale have been fitted or validated against outcomes.
An unusually volatile past can reduce sensitivity to subsequent changes.

## Classifications and failures

Use unrounded scores for decisions: below 40 Contracting; 40 through 60 inclusive
Balanced; above 60 Growing. These boundaries and the 40/60 conflict guard are
provisional policy parameters, not historically established regime boundaries.
Balanced means neutral composite direction, not vacancy/worker equilibrium.
If one component is below 40 and the other above 60, the result is Unknown with
null composite score and zero effective weights. Component scores remain visible.
Missing/stale/invalid sources, insufficient history, or incomplete growth windows
yield Insufficient Data with null composite score. Null never means zero or 50.

## Historical interpretation and evaluation limits

History is a fixed monthly calendar beginning February 2020, with explicit
Insufficient Data during warmup or missing periods. Each entry has a reference
month and an assumed assessment date (month-end + 45 days). Calibration and
signals never include later reference periods. Tests verify that changes to
later observations leave earlier outputs unchanged.

However, Phase 1 contains only latest revised observations, not release vintages.
Indeed methodology revisions and BLS revisions can alter previous measurements.
The output therefore identifies history as `retrospective-latest-vintage`.
These are retrospective estimates, not proof of what could have been known in
real time. Truly unbiased evaluation needs archived release snapshots or
appropriate ALFRED vintages and actual release dates, including for Indeed.
Generation never synthesizes economic observations or fills missing FRED history.

No production historical threshold evaluation is claimed. Before treating this
as validated, obtain the full FRED series, inspect retrospective coverage and
turning points, assess sensitivity to scale floors/weights/thresholds, and define
an independent occupation-relevant outcome with time-separated evaluation.
Changing parameters requires a new methodology version; existing history should
not be compared across versions without recalculation and disclosure.

## Commands and files

`npm run data:health` reads `public/data/job-market/market-data.json`; only when
that file is absent does it use `indeed.json`. A corrupt complete file never
silently falls back. It writes `market-health.json` by atomic rename. A valid
Insufficient Data output is publishable and is not a CLI error. With the current
Indeed-only bundle it reports genuine demand component history where calibrated,
but all overall historical scores remain null because employment is missing.
Malformed JSON or file I/O failure leaves the previous assessment intact and
returns a nonzero exit code. No network or API key is used by the calculations.

The weekly data-update workflow calculates assessments after a successful full
fetch and includes both JSON bundles in the same PR. The Pages workflow and
portfolio UI remain unchanged. Tests create synthetic scenarios exclusively in
memory, separate from production artifacts.
