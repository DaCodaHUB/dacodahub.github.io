# Dang Le portfolio

Static Astro portfolio deployed at https://dacodahub.github.io/.

## Local development

Use Node.js 22.19 or later. Run `npm install`, `npm run dev`, `npm run check`, and `npm run build`.

## Job market data

Data ingestion tools and source definitions live in `scripts/job-market/`.
Run `npm test` and `npm run data:fetch` (requires server-side `FRED_API_KEY`), or
`npm run data:fetch -- --indeed-only` for the public Indeed source alone.
Run `npm run data:health` to generate versioned assessments from those files.
Formulas, classification thresholds, and coverage rules are implemented in
`scripts/job-market/health.ts`; the dashboard explains them under Methodology.

The dashboard lives at `/market/` and is linked from the shared navigation.
It reads generated `market-health.json` at build time; visitor browsers make no
economic API requests. SVG charts support series selection and month inspection
via keyboard or touch, with a full historical table available without JavaScript.
Observation freshness is checked at build time and again in the browser. A stale
current assessment is withheld; historical component values remain labeled by
their reference periods. No React or chart dependency is needed.

## Content

Daily engineering practice uses 30 Android/Kotlin code reviews in
`src/data/android-challenges/reviews.ts` (14 Easy, 12 Medium, 4 Hard), with a daily
recommendation, unlimited random practice, and difficulty filters. All 80 prior
challenges remain intact in `src/data/android-challenges/legacy-archive.json`.
The four advanced predecessors of the new foundational exercises are preserved
separately in `src/data/android-challenges/foundations-predecessors.json`.
New `cr-` progress uses its own storage namespace; old completion and response
records stay untouched. Flashcard data, sessions, and progress are independent.

The [Android Fundamentals Library](/android-fundamentals/) is a static searchable
reference with category/level filters and expandable resources. Edit typed content
in `src/data/android-fundamentals/`. Its validation lives in
`scripts/android-fundamentals/library.test.ts`.
Run `npm run library:check-links` to audit resource URLs explicitly; normal tests
and builds remain offline.

- `src/content/projects/*.md` contains the six existing projects. Frontmatter is validated in `src/content.config.ts` and powers both the homepage and `/projects/`.
- A project gets a `/projects/[slug]/` page only when its Markdown body contains a real case study and `caseStudy: true` is set in frontmatter. Keep that flag false while only metadata exists.
- Add technical articles as Markdown in `src/content/writing/` with `title`, `description`, and `publishedAt` frontmatter. Optional fields are `updatedAt`, `tags`, and `draft`. Set `draft: true` until ready. Published articles appear at `/writing/[slug]/` and `/writing/`.
- Static files such as the résumé and JobTracker screenshots live in `public/assets/` and use `/assets/...` URLs.

## GitHub Pages

The existing Pages workflow also refreshes market data every Monday at **01:00
America/Los_Angeles** (DST aware), on main pushes, and on manual dispatch. Set the
repository Actions secret `FRED_API_KEY`. No automated commits are made; failed
source updates retain published observations and recalculate their freshness.
Use `npm run data:refresh` locally. Inspect `scripts/job-market/refresh-cli.ts`
and `refresh.ts` for validation and retained-data recovery behavior.

## Validation and optional reports

Run `npm test`, `npm run check`, and `npm run build` without any local documentation
folder. `npm run daily:validate`, `npm run challenges:validate`, and
`npm run demand:validate` validate the source datasets directly.

Optional local Markdown reports can be generated with `npm run daily:validate --
--write-report` and `npm run challenges:validate -- --write-report`. They are
written under `.astro/reports/`, which is ignored by Git. Tests and deployment
never require these reports. The ignored `docs/` folder is also optional.

This repository is the `dacodahub.github.io` user site, so Astro uses `https://dacodahub.github.io/` with no `base` path. `.github/workflows/deploy.yml` builds and deploys the static `dist/` output on pushes to `main`. In repository Settings → Pages, select **GitHub Actions** as the source before using the workflow.
