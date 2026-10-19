# Android Engineering Interview Challenge Bank

Batch 1 contains 40 authored problems, not a daily-challenge UI. Import `challengeBank` from `src/data/android-challenges/index.ts`. Its schema version is `1.0.0`, content version is `1.0.0-batch-1`, and target is 150. The bank is ordinary TypeScript data that Astro can consume; it requires no database, browser request, secret or service.

## Files and source boundaries

| Location | Purpose |
| --- | --- |
| `src/data/android-challenges/types.ts` | Shared metadata and discriminated unions for four formats |
| `src/data/android-challenges/curriculum.ts` | 201 source-question IDs, eight section names and SHA-256 of the original export |
| `src/data/android-challenges/references.ts` | Official documentation URLs and the API facts each supports |
| `src/data/android-challenges/authoring.ts` | Small helpers for provenance, code metadata and scored rubrics |
| `src/data/android-challenges/code-review.ts` | 12 debugging/review problems and possible corrections |
| `src/data/android-challenges/code-completion.ts` | 12 completion problems with named markers and answer keys |
| `src/data/android-challenges/system-design.ts` | Eight designs with constraints, alternatives and reference outlines |
| `src/data/android-challenges/engineering-scenarios.ts` | Eight production/team decisions with response steps |
| `src/data/android-challenges/index.ts` | Versioned, typed import entry point |
| `scripts/android-challenges/validate.ts` | Content-contract validation, blank substitution and coverage calculation |
| `scripts/android-challenges/bank.test.ts` | Positive and negative validation tests |
| `scripts/android-challenges/cli.ts` | Local validation, report and standalone fixture generation |
| `scripts/android-challenges/fixtures.ts` | Compiler-candidate fixtures derived from the actual bank |
| `scripts/android-challenges/check-links.ts` | Explicit network-dependent official-reference audit |
| `docs/android-challenge-coverage.md` | Generated distribution, problem/card matrix and unmapped source questions |
| `docs/android-challenge-content-review.md` | Technical review decisions, assumptions and outstanding manual checks |
| `docs/android-challenge-roadmap.md` | Remaining 110 problems and coverage gaps |

The user-provided `Android + Kotlin Interview.md` is foundational curriculum, not an instruction file. Its RemNote directions and suggested study order were not executed. The export actually separates questions and answers with the Unicode arrow `→`, despite its introductory mention of `>>`. The curriculum index preserves question order and gives each card `fc-001` through `fc-201`. It includes question text only; the local Downloads path and full answers are not required to build or validate this repository.

Every challenge identifies source cards, existing Fundamentals topic IDs and `provenance.additions`. Product scenarios, failure observations, backend contracts, constraints, code and rubrics are newly authored additions. A source card about retries is not represented as already containing a distributed-sync protocol. Official references support technical claims, not a unique design or a measured production outcome. Existing library topics and resources remain unchanged.

## Local commands

Use the repository's supported Node version (>=22.19; Node 24 matches deployment). On PowerShell, use `npm.cmd` if execution policy prevents `npm`.

```text
npm run challenges:validate
npm run challenges:validate -- --write-report
npm run challenges:validate -- --write-fixtures
npm run challenges:check-links
npm test
npm run check
npm run build
```

Normal tests, validation and builds are offline. Only `challenges:check-links` requests external documentation and writes an ignored `.astro/challenge-reference-report.json` with real retrieval time, status, final URL and page title. It requests English Android pages, rejects unavailable/challenged/client-redirect pages and returns nonzero if review is required. It does not prove the technical answer correct just because HTTP succeeded.

Report generation is deterministic and writes only the dedicated coverage document. Fixture generation writes five `.kt` candidates under ignored `.astro/android-challenge-fixtures/`: `acr-001`, `acr-012`, `acc-001`, `acc-002`, `acc-009`. They use the actual correction/first accepted answers and include `main` checks. Each must be compiled separately because examples reuse declaration names. If a Kotlin CLI and JDK are installed, one example command pair is:

```text
kotlinc .astro/android-challenge-fixtures/acc-009.kt -include-runtime -d .astro/android-challenge-fixtures/acc-009.jar
java -jar .astro/android-challenge-fixtures/acc-009.jar
```

The compiler was **not run** for this batch. Structural substitution tests are not compiler or Android integration tests. Compose, Fragment, Room, Hilt, WorkManager and coroutine examples still need the declared dependencies and relevant host fixtures for execution.

## Authoring and evaluation

Keep stable IDs when editing an existing problem; allocate a new ID for a genuinely different published problem. Review content-version changes deliberately. Each problem has a primary topic for distribution and may link several library topics. Difficulty and completion minutes are editorial estimates pending interview calibration.

Rubrics have three problem-specific criteria worth two points each: 0 = absent/incorrect, 1 = partially demonstrated, 2 = supported by the stated evidence. Six is a per-problem maximum, not a calibrated ranking across formats or seniorities. Follow-ups probe depth and are not silently added to the base score. Design alternatives are valid when their trade-offs meet the requirements; the reference answer is not the only accepted architecture.

Completion keys are curated examples, not a future exact-string grading specification. Equivalent correct solutions require human review. The prompt deliberately constrains the missing token/expression to keep each exercise determinable; explicitly listed alternatives are tested for complete marker substitution, not semantic equivalence by a Kotlin compiler.

Before expanding the bank, run validation and inspect the coverage and content-review documents. Add a genuinely new failure mode or decision, rather than renaming a scenario. No daily rotation, progress tracking, UI, accounts, deployment workflow or Market Analyzer changes belong to this phase.
