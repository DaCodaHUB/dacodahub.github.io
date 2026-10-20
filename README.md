# Dang Le portfolio

Static Astro portfolio deployed at https://dacodahub.github.io/.

## Local development

Use Node.js 22.19 or later. Run `npm install`, `npm run dev`, `npm run check`, and `npm run build`.

## Job market data

The phase 1 data ingestion tools, source definitions, setup, and automated update
process are documented in [docs/job-market-data.md](docs/job-market-data.md).
Run `npm test` and `npm run data:fetch` (requires server-side `FRED_API_KEY`), or
`npm run data:fetch -- --indeed-only` for the public Indeed source alone.
Run `npm run data:health` to generate versioned assessments from those files.
See [the provisional methodology](docs/job-market-methodology.md) for formulas,
classification thresholds, coverage limits, and historical-vintage limitations.

The dashboard lives at `/market/` and is linked from the shared navigation.
It reads generated `market-health.json` at build time; visitor browsers make no
economic API requests. SVG charts support series selection and month inspection
via keyboard or touch, with a full historical table available without JavaScript.
Observation freshness is checked at build time and again in the browser. A stale
current assessment is withheld; historical component values remain labeled by
their reference periods. No React or chart dependency is needed.

## Content

The [Android Fundamentals Library](/android-fundamentals/) is a static searchable
reference with category/level filters and expandable resources. Edit typed content
in `src/data/android-fundamentals/`; see [maintenance and verification](docs/android-fundamentals-library.md).
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
Use `npm run data:refresh` locally. See [setup and failure recovery](docs/job-market-automation.md).

This repository is the `dacodahub.github.io` user site, so Astro uses `https://dacodahub.github.io/` with no `base` path. `.github/workflows/deploy.yml` builds and deploys the static `dist/` output on pushes to `main`. In repository Settings → Pages, select **GitHub Actions** as the source before using the workflow.
