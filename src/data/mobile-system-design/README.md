# Mobile System Design

`challenges.ts` contains eight original, self-contained Android interview exercises.
Stable IDs `msd-001`–`msd-008` follow a fixed learning sequence: offline-first notes,
paginated feed, authentication, reliable uploads, messaging, push/deep links,
Bluetooth, and cross-device settings. Each takes approximately 20–40 minutes.
All product scales, backend capabilities and timing goals are invented interview
assumptions. They are not platform guarantees or real-world measurements.

Every question includes scenario, functional requirements, exclusions,
non-functional constraints, backend/platform/offline assumptions, and 5–8 tasks.
Every reference design covers architecture, components, technology choices,
models/contracts, workflows, recovery, alternatives, testing and interview points.
References link to official Android documentation and the native OAuth RFC.
Library recommendations are choices; the given behavioral contracts are required.

The build validates the bank with `validateDesignChallenges`. Tests also reject
missing question and solution sections. Source and checks have no local `docs/`
dependency. Run `npm test`, `npm run check`, `npm run build`, and
`npm run daily:test-browser` for data, persistence, UI and regression validation.

Progress uses only `daily-android:mobile-system-design:v1:` keys. Statuses and
browsing position persist; written responses are no longer collected. Legacy
notes are discarded when their progress records are read, preserving completion
and Needs Review statuses. Practice links open CoderPad and Excalidraw in new tabs;
no external tool is embedded or connected to local progress.

The earliest incomplete design is recommended. Previous/Next and the selector
permit unlimited practice, and dates do not advance the collection. Storage
failure is reported and falls back to the current page session. Android review,
NeetCode and Flashcard stores are not changed.

Reference visibility is transient: it starts hidden after reload or navigation.
Switching challenge types preserves mounted state. Reveal and Hide controls
expose accessible expansion state and return focus safely.
