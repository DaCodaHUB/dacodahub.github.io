# Archived challenge JSON

These files preserve the earlier mixed-format collection using `../types.ts`.
They are not discovered or loaded by the active daily page. All 80 legacy challenges
are also preserved together in `../legacy-archive.json`, with a content fingerprint.
Legacy schema, coverage, completion-key, and provenance tests remain in the suite.

The active 30-question bank is `../reviews.ts`, with the independent contract in
`../review-types.ts`. Edit that bank deliberately, validate it with
`npm run challenges:validate`, and keep the schedule and published lock aligned.
The pre-migration schedule is archived under `scripts/daily-android/archive/`.
No report or documentation directory is required for validation or builds.
