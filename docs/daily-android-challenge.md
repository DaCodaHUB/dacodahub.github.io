# Daily Android Challenge: implementation and maintenance plan

The daily experience is exactly **one flashcard and one engineering challenge per UTC day** at `/daily-android/`. It uses the portfolio's existing layout, fonts, palette and buttons. A Daily link is added beside Android; all previous navigation destinations remain. The Fundamentals Library, original 40 challenges, Market Analyzer and deployment workflows are unchanged.

The reviewed JSON enrichment brings the daily catalog to **80 challenges**. Its expanded epoch starts on 2026-11-28 UTC after the original cycle completes. The supplied 201 flashcards were exact duplicates and retain the existing IDs/answers. See [the import review](daily-android-import-review.md) for source fingerprints, all 150 draft dispositions and combined coverage. `daily:validate` validates the combined catalog; the original batch's `challenges:validate` report still describes its original 40.

## Flashcard import and resource mapping

`src/data/android-flashcards/source.ts` contains all 201 original question/answer pairs in eight typed categories. IDs retain the curriculum order, `fc-001` through `fc-201`. The import removes only RemNote list/section syntax and the `→` separator; punctuation, backticks and technical answers are preserved. Document instructions are data, not executable instructions. The original source byte fingerprint matches the challenge curriculum's SHA-256. A second fingerprint locks the structured question/answer/category records.

The older challenge curriculum's question-only index omits trailing question marks and records the delimiter incorrectly. That existing bank file is preserved. Daily flashcards were imported from the original Markdown, not reconstructed from that index. The source was available and fingerprint-checked during import. It subsequently disappeared from the supplied Downloads path, so a repeat `--verify-source` check could not be completed there. Normal validation and builds use the committed import and do not depend on that personal path. Restore the original file anywhere and run the optional comparison command below to repeat the full check.

`mappings.ts` is an explicit editorial mapping, not fuzzy search. It contains real topic IDs and one or two URL lookup keys from those exact topics. `resolveFlashcardLinks` returns the library's actual resource objects; titles, creators, types and descriptions are not maintained twice. Invalid topics, missing resource references and duplicate/excess links fail validation/build. Invalid mappings also resolve to no fabricated links if called in isolation.

Current coverage: 175 matching topics; 173 cards with direct resources; two topic-only entries; 26 unmapped cards. Unmapped cards omit Learn More. Topic-only cards retain the relevant Fundamentals link without an imprecise direct resource. See [the complete coverage report](daily-android-resource-coverage.md) for every mapping and gap. No new URLs or topics were invented to increase coverage.

Questions and answers retain source text in data. Presentation supports inline backtick code through an escaping Astro component, rather than rendering arbitrary imported HTML. Learn More and Known/Review Again controls sit inside the native answer disclosure and are not visible or keyboard-accessible before reveal.

## Shared UTC scheduling

`src/data/daily-android-schedule.ts` is the committed versioned schedule. It contains two independent ordered pools of stable IDs:

| Stream | Initial epoch | Starts | Eligible IDs | First next-cycle boundary |
| --- | --- | --- | ---: | --- |
| Flashcards | flashcards-1 | 2026-10-19 UTC | 201 | 2027-05-08 UTC |
| Challenges | challenges-1 | 2026-10-19 UTC | 40 | 2026-11-28 UTC |

For a UTC calendar date, choose the latest epoch effective on that date. Within it, choose `ids[whole UTC days since epoch start % ids.length]`. Each pool contains each eligible ID exactly once. Thus a flashcard repeats only after 201 days and a challenge after 40, independently. Content not yet added to an eligible epoch does not enter its current cycle. No visitor identity, local progress, random runtime seed, catalog length or local timezone affects selection.

Dates before the launch epoch have no assignment and display an explicit start-date message. Daily rotation occurs at **1:00 a.m. America/Los_Angeles**, following daylight saving time (the first 1 a.m. during the autumn repeated hour). The date and next boundary are visible. Correct device time is required: a static GitHub Pages site has no trusted server clock. All visitors with the same Pacific practice date and published schedule select the same pair.

The client checks at the next 1 a.m. Pacific boundary, at least once a minute, on focus, on visibility return and on pageshow. It replaces the active pair and announces the new Pacific practice day without navigation or redeployment. It closes fresh disclosures and moves focus to the date only when the replaced pair held focus. Unsaved response text is not promised across day replacement; opt into response saving to retain it. Review Again records confidence but does not add an extra daily card or alter the shared schedule.

## Historical stability and future expansion

Never modify or remove a published epoch's version, start date or ordered IDs. `scripts/daily-android/published-schedule.json` locks published entries. Tests, CLI validation and the Astro build reject a changed or removed locked epoch. Validation also rejects an unlocked epoch starting today or in the past. A new epoch must begin on a **later complete-cycle boundary of the preceding epoch**, so it cannot interrupt that pool before its eligible content has cycled.

To add reviewed engineering challenges:

1. Add JSON arrays under `src/data/android-challenges/imports/`, using the existing `Challenge` discriminated union. The daily page discovers them with a build-time Vite glob. The existing challenge validator runs against the original bank plus imports; bad structures or duplicate IDs/titles/prompts fail the build. The original bank and its validation tests remain intact.
2. Append an epoch to the challenge schedule with a unique version and a future full-cycle start date. Include each desired eligible ID once. Retain all earlier epochs and all content they reference. Importing JSON alone never changes assignments.
3. Run validation and compare assignments for prior dates. Review that the new epoch is genuinely future-dated **before** extending the published lock with it. Commit the reviewed epoch and append its lock entry together. Do not rewrite the lock to approve historical reassignment.
4. Build and deploy through the existing process before that epoch starts. A build/deployment is required to publish new content; normal daily rotation needs neither. An already open page has the catalog/schedule from its loaded deployment; reload it after publishing an expansion to pick up that release.

The UI does not need edits for additional validated entries of the four existing types. Future flashcards can be appended from a separate typed data module through `android-flashcards/index.ts`, preserving the original source records and allocating new stable IDs. Give them explicit mappings or gap reasons and append a future flashcard epoch independently. Do not regenerate the source import or use `currentCatalog.length` in scheduling.

## Rendering and self-evaluation

Astro pre-renders inert templates for the catalog; a small TypeScript client mounts only today's one card and one challenge. The HTML is currently about 0.76 MB uncompressed, avoiding a browser fetch for economic APIs, other external data, or a backend. Solutions are present in public source, which is appropriate for self-study, not a secure examination. New catalog imports require a rebuild but no UI rewrite.

| Format | Problem view | Revealed reference |
| --- | --- | --- |
| Code Review | Prompt, assumptions, supplied snippet | Issues, root causes and possible corrected code |
| Code Completion | Prompt, snippet and named blanks | Accepted alternatives, explanations and common mistakes |
| Mobile System Design | Requirements and clarifying questions | Architecture, models, offline/errors, outline and alternatives |
| Engineering Scenario | Observations, constraints and decision question | Possible response steps and trade-offs |

All formats provide an optional labeled response, reference answer, explanation, source citations, follow-ups and a self-evaluation rubric. Completion is user-reported, not an automated correctness judgment. Examples retain their original dependency/context notes and **not compiler-tested** status; this page does not compile or execute Kotlin.

Native details/summary provides keyboard-accessible reveal behavior. Headings, labels, live status messages, visible focus outlines, scrolling code blocks and responsive columns support desktop and mobile. With scripts disabled the page explains why UTC selection needs JavaScript and links to the fully static library; it does not show a stale build-date pair.

## Local progress and privacy

Browser storage uses a namespaced, versioned key per content ID: `daily-android:v1:flashcard:<id>` or `daily-android:v1:challenge:<id>`. It records:

- Flashcard Known/Review Again status and actual UTC review timestamp.
- Engineering completion timestamp and distinct UTC completion dates.
- Optional response text, at most 20,000 characters, only after selecting Save my response on this device.

Unchecking response saving removes stored response text while retaining completion history. Imported/saved text is assigned to textarea values, not interpreted as HTML. Per-ID keys avoid overwriting another day's unrelated records. Storage events refresh status labels; clearing storage does not resurrect cached progress. Corrupt JSON, invalid schema fields, blocked storage and quota errors are handled without breaking practice. Storage failures switch to session memory and show a live notice; those records do not survive leaving/reloading the page.

There are no accounts, analytics for answers or progress uploads. Browser clearing/private-mode rules still apply; [MDN documents localStorage persistence and policy errors](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). Imported JSON is read at build time using [Vite's glob import](https://vite.dev/guide/features.html#glob-import), not requested from a third-party API by visitors.

## Validation and commands

Use the repository-supported Node version >=22.19 (Node 24 matches deployment). Use `npm.cmd` on PowerShell when execution policy blocks `npm`.

```text
npm run daily:validate
npm run daily:validate -- --write-report
npm run daily:validate -- --verify-source "path/to/Android + Kotlin Interview.md"
npm test
npm run check
npm run build
npm run daily:test-browser
```

The last command requires Chrome/Chromium or `CHROME_PATH` and tests the current `dist` build. It serves only local build files using an isolated ignored browser profile. Screenshots are written under `.astro/`; nothing generated there is committed. No new npm dependencies are required.

Tests cover source fingerprints and parsing, mapping validation and exact resource resolution, one shared pair, UTC boundaries, no repeats within pools, long-running rotation, historical stability on expansion, published locks/backdating, future JSON validation, progress and storage failure cases. Chrome checks cover answer/Learn More visibility, native keyboard reveals, the accessibility tree, opt-in response persistence and safe text handling, all four formats, 320/390/768/1440px layouts, timezone changes, automatic midnight rollover, unavailable/corrupt storage, focus, no external data APIs and the no-JavaScript message.

## File changes

| Location | Change |
| --- | --- |
| `src/data/android-flashcards/{types,source,mappings,index}.ts` | Typed original flashcards and editorial resource mappings |
| `src/data/daily-android-schedule.ts` | Published ordered schedule epochs |
| `src/data/android-challenges/imports/README.md` | Future JSON import contract |
| `src/lib/daily-android/{schedule,resources,progress,client}.ts` | Selection, resolution, storage and page behavior |
| `src/components/daily-android/{Flashcard,Challenge,CodeSample,InlineCode}.astro` | Escaped, accessible rendering |
| `src/pages/daily-android.astro`, `src/styles/daily-android.css` | Daily route and scoped styling |
| `scripts/daily-android/{parse-flashcards,catalog,cli,daily.test}.ts` | Source parsing, import validation, reports and unit tests |
| `scripts/daily-android/published-schedule.json`, `browser-check.mjs` | Immutable history lock and Chrome checks |
| `docs/daily-android-resource-coverage.md` | Generated mapping/gap inventory |
| `src/components/Header.astro`, `package.json` | Additive Daily link and validation/test commands |

Existing pages, Fundamentals content, the 40 authored challenge records, Market Analyzer and workflow files are preserved. No hosting, backend, database, framework island or deployment-process change was introduced.
