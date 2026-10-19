# Android Fundamentals Library

The static `/android-fundamentals/` page uses the portfolio's Astro layout,
shared navigation, colors and typography. It adds no framework, runtime service,
database, dependency or visitor-side resource API calls. Topics remain available
with JavaScript disabled; search and filters progressively enhance the directory.

## Content and maintenance

- `src/data/android-fundamentals/types.ts`: typed topic/resource contracts and
  resource display groups.
- `src/data/android-fundamentals/topics.ts`: categories and topic entries.
- `src/data/android-fundamentals/resources.ts`: resource constructors and a small
  shared collection of supplementary code, videos and engineering articles.
- `src/components/AndroidTopicCard.astro`: native details/summary disclosures,
  concepts and links grouped by resource type.
- `src/lib/android-library.ts`: pure indexing and combined search/filter logic.
- `src/pages/android-fundamentals.astro` and `src/styles/android-library.css`:
  page presentation and small client-side enhancement.

To add a topic, choose an existing category, retain the `category-slug` identifier
format, and provide a description, level, key concepts and at least one specific
resource. IDs are stable public anchors: avoid changing them when editing titles.
Level describes complexity and is not a sequence or prerequisite system.
Prefer a direct official page over a generic home page; supplementary examples
should explain what they contribute and whether they are historical.

Search matches all terms across titles, descriptions, concepts and resource
titles. Category and difficulty filters intersect with the query. URL parameters
`q`, `category` and `difficulty` make filtered views shareable. Topic fragments
such as `#platform-process-death` open the relevant disclosure, clearing filters
if necessary to reveal the requested topic. No queries are transmitted to a
server or stored as progress. External links open a new tab with explicit labels
and `noopener noreferrer`.

## Resource verification

The initial directory covers 102 topics in all 12 requested categories. Resource
checks use HTTPS GET requests, response status, page titles, redirects and HTML
section identifiers where available. YouTube titles are checked using its public
oEmbed metadata. Playback or regional availability may differ from metadata
availability. Repository/docs validation cannot guarantee the correctness of
every code example; platform docs remain the starting point for API behavior.

Review on October 19, 2026: all 155 unique topic resource URLs passed the HTTP,
title/access, redirect and available-anchor checks. No unresolved broken links
remain in this revision. This validates availability and metadata, not playback
in every region or every detail of the linked content.

The supplied video `qLdy-65LsGk` was verified as **Mobile System Design Mock
Interview: Stock Trading App** by Alex Lementuev and included under mock interview
resources. Additional verified videos are Thinking in Compose (MAD Skills),
Jetpack Compose: State, and the KotlinConf 2019 Flow talk. Older recordings are
labeled and paired with current documentation.

Initial verification found moved documentation, including Retrofit and OkHttp.
The maintained documentation is now linked under `lysine.dev`; the Retrofit
repository uses `lysine-dev/retrofit`. Updated Android CI/background/network
documentation paths and current saved-state/synchronization anchors were checked
instead of retaining broken links. The three requested starting repositories,
Android Developers and Kotlin docs are incorporated.

Run an explicit link audit when editing resources:

```text
npm run library:check-links
```

This network-dependent maintenance command writes an ignored report to
`.astro/android-link-report.json`, flags HTTP failures, access challenges,
generic-homepage redirects and missing section anchors, and exits nonzero when
review is needed. A successful request is availability evidence, not a promise
that a link will remain available forever. It does not embed videos or download
resource content into the site. Normal tests and builds do not call remote sites.

## Validation

```text
npm test
npm run check
npm run build
npm run dev
```

Use Node >=22.19 (Node 24 matches deployment); on restricted PowerShell use
`npm.cmd`. The existing Node test runner also runs
`scripts/android-fundamentals/library.test.ts`, covering IDs, resources, requested
starting links, search fields, combined filters, empty states and immutability.
No changes to Market Analyzer data, scoring or deployment workflows are needed.
