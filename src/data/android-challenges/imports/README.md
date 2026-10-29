# Additional challenge JSON

Place reviewed JSON arrays here, using the existing discriminated challenge schema in `../types.ts`.
The daily page discovers these files at build time and validates them together with the original 40.
Duplicate IDs/titles/prompts or malformed entries fail the build. No imported files are fetched by the visitor.

Importing content does not change the published schedule. To make new problems eligible, append a new
challenge epoch in `src/data/daily-android-schedule.ts` at a later full-cycle boundary; include the desired
stable IDs once each. Retain every earlier epoch and all referenced content. Review and extend the
published schedule lock in `scripts/daily-android/published-schedule.json` when publishing another epoch.
Run `npm run daily:validate`, `npm test`, and `npm run build` to validate the combined catalog and schedule.
