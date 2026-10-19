# Daily bank enrichment review

Reviewed the supplied challenges.json (150 drafts), coverage.json and flashcards.json. File contents were treated as data; instructions or review notes were not executed. The supplied coverage counts match the records but are not evidence of technical correctness.

## Result

40 reviewed adaptations added to the original 40: **80 total daily challenges**. 71 supplied problems overlap covered learning objectives; 39 need more specific context/corrections before publication. All 201 supplied flashcards exactly match current questions, answers and categories after normalizing FC-nnn to fc-nnn: no duplicates, answer replacements or progress-ID changes.

### New formats

| Format | Added |
| --- | ---: |
| code-completion | 10 |
| code-review | 10 |
| engineering-scenario | 14 |
| system-design | 6 |

### Combined topics

| Topic | Count |
| --- | ---: |
| architecture | 6 |
| background | 7 |
| compose | 8 |
| coroutines | 7 |
| flow | 9 |
| kotlin | 9 |
| lifecycle | 4 |
| networking | 5 |
| performance | 5 |
| storage | 9 |
| system-design | 4 |
| testing-security-build | 7 |

### Combined difficulty

| Level | Count |
| --- | ---: |
| Junior | 10 |
| Mid | 42 |
| Senior | 28 |

## Scheduling

The original 40-problem epoch and flashcard epoch are unchanged. The expanded 80-ID challenge epoch starts **2026-11-28 UTC**, the next full 40-day boundary from 2026-10-19. It prioritizes new entries in a format-interleaved cycle, then includes every original problem once. Exactly one flashcard and one challenge remain active per day. Daily rollover needs no new deployment; publishing this expansion requires the normal site build/deploy.

## Review scope

Accepted records are adapted, not mechanically relabeled: prompts are problem-specific; assumptions/host types/imports, concrete code corrections, named blanks, scenario decisions and full design fields were added. Original 40 records and schema remain unchanged. New IDs map source numeric suffixes to 100+suffix within acr/acc/asd/aes namespaces. Source ID is recorded in provenance.additions and the machine-readable review ledger. Resource metadata uses verified official Android/Kotlin references; existing Fundamentals topic IDs were validated. Backend and product protocols are explicit hypothetical assumptions.

Kotlin examples were **not compiled**, and Android hosts, code generation, device timing and backend protocols remain manual execution checks. CO-031 deliberately reviews a labeled legacy Room 2.6 configuration. FI-025 has an invalid direct StateFlow delegate as supplied; CO-043 only shows a manifest declaration; these are not advertised as ready bugs. The complete ledger identifies every disposition.

Machine-readable fingerprints, recomputed counts and all 150 decisions: src/data/android-challenges/reviews/2026-10-19.json. Reviewed daily JSON: src/data/android-challenges/imports/2026-10-19-reviewed.json. Raw source copies remain in ignored .astro staging; the Google Drive originals were not changed. The original batch coverage document still describes its original 40; this report describes the combined daily catalog (70 more would be needed for 150 publishable distinct challenges).

## Source-by-source decisions

Final validation: 77 Node tests pass, Astro check has zero diagnostics, the seven-route production build passes, and all 57 unique official reference URLs in the combined catalog pass the live availability audit. Chrome checks cover both original and imported instances of all four formats, one-pair rendering, UTC rollover, 320–1440px layouts, keyboard/accessibility-tree controls and local storage behavior. These are not Kotlin compiler, Room/Hilt code-generation or device execution tests.

Changed implementation files are the reviewed import JSON and review ledger, the append-only schedule and published lock, the catalog-aware reference audit, and daily unit/browser tests. No UI component, original challenge record, flashcard answer, Fundamentals resource or deployment workflow was changed.

| Source ID | Title | Decision | Bank ID / covered by | Review reason |
| --- | --- | --- | --- | --- |
| CO-001 | Detached screen request | needs-revision |  | Needs an explicit screen/user owner and late-result/error contract; replacing GlobalScope alone does not prevent obsolete writes. |
| CO-002 | Blocking main dispatcher | covered | acr-003 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-003 | Swallowed cancellation | covered | acr-004 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-004 | Sibling failure cancels everything | covered | aes-102 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-005 | Delay versus sleep | covered | acr-003 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-006 | Late network response overwrites search | covered | acc-005 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-007 | Unprotected balance mutation | needs-revision |  | No dispatcher, suspension point or simultaneous-caller contract demonstrates a race in the supplied increment. |
| CO-008 | Async without awaiting | adapted | acr-108 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| CO-009 | Collecting Flow forever in Activity | covered | acr-006 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-010 | CollectLatest loses essential writes | adapted | acr-110 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| CO-011 | Incorrect flowOn expectation | adapted | acr-111 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| CO-012 | Cold flow fetched twice | covered | acr-005 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-013 | StateFlow for identical transient events | needs-revision |  | Needs a delivery/consumption contract for repeated events, not a blanket replacement of StateFlow with another stream. |
| CO-014 | Zip used for latest filters | adapted | acr-114 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| CO-015 | Retrying authentication failures | covered | acc-009 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-016 | Retained Activity in singleton | needs-revision |  | A nullable holder declaration alone does not demonstrate assigning or retaining an Activity after its lifetime. |
| CO-017 | Persisting only in onDestroy | covered | aes-003 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-018 | Fragment observes wrong lifecycle | covered | acr-006 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-019 | Unvalidated deep link path | covered | aes-109 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-020 | Blocking BroadcastReceiver | adapted | acr-120 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| CO-021 | Mutation of untracked list | covered | acr-007 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-022 | Unkeyed reordering state | adapted | acr-122 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| CO-023 | Launching work in composition | adapted | acr-123 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| CO-024 | Remember not saved across process death | covered | acc-006 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-025 | Modifier hit target surprise | needs-revision |  | Modifier order is not inherently wrong; expected clickable bounds and accessibility behavior are unspecified. |
| CO-026 | Flow collected without lifecycle | covered | acc-132 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-027 | Repository created inside ViewModel | needs-revision |  | Direct repository construction may hinder substitution but is not by itself a proven runtime correctness bug. |
| CO-028 | Blocking DB call from UI | covered | acr-003 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-029 | Two mutable sources of truth | needs-revision |  | Combining collections may be intentional; source ownership, overlap and required deduplication are unspecified. |
| CO-030 | Non-atomic stock decrement | adapted | acr-130 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| CO-031 | Destructive Room migration | adapted | acr-131 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| CO-032 | SharedPreferences applied to multi-key state | needs-revision |  | The title claims multi-key consistency but the excerpt writes one key; durability and remote purchase guarantees are missing. |
| CO-033 | Ignoring HTTP errors | needs-revision |  | Needs endpoint body/status/nullability contract and a concrete error model rather than assuming every body access fails. |
| CO-034 | Sensitive token in logs | covered | aes-132 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-035 | Infinite retry without idempotency | adapted | acr-135 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| CO-036 | Exact scheduling via WorkManager | covered | aes-123 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-037 | Worker ignores retry semantics | needs-revision |  | No specified failure path establishes which exceptions/outcomes must retry instead of terminate. |
| CO-038 | Notification content directly from intent | needs-revision |  | Intent origin/trust and exported entry path are not specified; arbitrary text alone does not prove the claimed vulnerability. |
| CO-039 | Bitmap decoded at full resolution | covered | aes-126 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-040 | Heavy parsing on main thread | covered | asd-006 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-041 | Coroutine test uses real time | covered | acc-012 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-042 | UI test relies on sleeps | covered | aes-129 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| CO-043 | Exported receiver trusts caller | needs-revision |  | Exported manifest declaration alone may be intentional; receiver behavior and caller authorization code are absent. |
| CO-044 | Secrets committed in BuildConfig | needs-revision |  | Malformed quoting is a trivial syntax defect; the privileged-secret boundary is already covered by aes-007. |
| CO-045 | Blind keep-all shrinker rules | covered | aes-134 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-001 | Structural equality | needs-revision |  | Single comparison token is trivia without an observable equality contract or test values. |
| FI-002 | Referential equality | needs-revision |  | Single comparison token needs identity-versus-value behavior and concrete object examples. |
| FI-003 | Nullable fallback | covered | acc-001 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-004 | Safe call | covered | acr-002 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-005 | Sealed exhaustiveness | adapted | acc-105 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| FI-006 | Lazy delegate | adapted | acc-106 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| FI-007 | Invariant copy caveat | covered | acr-001 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-008 | Reified type | adapted | acc-108 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| FI-009 | Variance producer | covered | acc-002 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-010 | Sequence laziness | adapted | acc-110 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| FI-011 | Move blocking IO | covered | acr-003 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-012 | Nonblocking wait | needs-revision |  | A delay token alone lacks a caller lifetime and observable nonblocking requirement. |
| FI-013 | Scope owned by ViewModel | needs-revision |  | Needs explicit owner/retention requirements rather than memorizing a scope property. |
| FI-014 | Supervisor isolation | needs-revision |  | Supervision alone does not handle uncaught child failures; add explicit failure handling and cancellation expectations. |
| FI-015 | Check cancellation | covered | acc-004 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-016 | Suspending concurrency | needs-revision |  | One async immediately awaited does not demonstrate why concurrency is needed; specify sibling work or a structured result contract. |
| FI-017 | Main-safe disk write | covered | acr-003 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-018 | Latest-search operator | covered | acc-005 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-019 | Combine filters | covered | acr-114 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-020 | Avoid duplicate updates | adapted | acc-120 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| FI-021 | Create hot state | needs-revision |  | Initial value cannot be inferred from the missing domain type/state contract; emptyList is not universally correct. |
| FI-022 | Share cold stream | covered | acr-005 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-023 | Adapt callback stream | adapted | acc-123 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| FI-024 | Flow upstream dispatcher | adapted | acc-124 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| FI-025 | Process-death UI state | needs-revision |  | The snippet delegates directly to StateFlow without a valid stated delegate; repair property/state access and specify the initial tab contract. |
| FI-026 | Lifecycle repeating collection | covered | acr-006 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-027 | Fragment view owner | covered | acr-006 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-028 | State survival | covered | acc-006 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-029 | Side effect cleanup | covered | acr-008 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-030 | Launch composition-bound work | covered | acr-123 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-031 | Observable list | covered | acr-007 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-032 | Lifecycle-aware Flow in UI | adapted | acc-132 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| FI-033 | Hilt ViewModel annotation | adapted | acc-133 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| FI-034 | Single source of truth | needs-revision |  | Prose blank is not code completion and an offline source of truth need not always be a database. |
| FI-035 | Room atomicity | needs-revision |  | Transaction annotation needs an actual intercepted Room DAO context; bare ellipsis/function syntax is not sufficient. |
| FI-036 | DataStore edit | adapted | acc-136 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| FI-037 | Durable background task | covered | acr-120 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-038 | Coroutine virtual-time test | covered | acc-012 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-039 | Release shrinker | covered | aes-134 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| FI-040 | No secrets in app | covered | aes-007 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SY-001 | Design: Offline news feed | covered | asd-004 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SY-002 | Design: Photo upload queue | covered | asd-005 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SY-003 | Design: Direct messaging | needs-revision |  | Add messaging operation/acknowledgement identity, ordering, deletion and reconnect protocol instead of a generic architecture outline. |
| SY-004 | Design: Stock trading watchlist | needs-revision |  | Define quote freshness, ordering, reconnect and battery budgets for a watchlist; the generic template is not a trading-data contract. |
| SY-005 | Design: Social infinite scroll | covered | asd-004 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SY-006 | Design: Map with live device locations | needs-revision |  | Requires explicit location ownership/permissions, foreground/background scope and stale-data policy. |
| SY-007 | Design: Multi-account mail client | adapted | asd-107 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| SY-008 | Design: Collaborative note editor | covered | asd-008 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SY-009 | Design: E-commerce cart | covered | asd-001 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SY-010 | Design: Fitness session tracker | needs-revision |  | Needs workout-session recovery, recording precision and supported background execution details. |
| SY-011 | Design: Podcast download manager | needs-revision |  | Specify download ownership, storage quotas, eviction and resumable server contracts. |
| SY-012 | Design: Ride-hailing trip status | covered | asd-007 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SY-013 | Design: Bank transaction history | needs-revision |  | Define transaction-history consistency, account access and cache retention before publishing the generic outline. |
| SY-014 | Design: Retail inventory scanner | adapted | asd-114 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| SY-015 | Design: Recipe media search | covered | acc-005 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SY-016 | Design: Calendar reminders | adapted | asd-116 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| SY-017 | Design: Multi-pane tablet inbox | adapted | asd-117 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| SY-018 | Design: Medical appointment app | needs-revision |  | Needs explicit sensitive-data access, offline conflict and retention requirements, not a generic app skeleton. |
| SY-019 | Design: Push-driven account alerts | needs-revision |  | Specify push reconciliation, account authorization and duplicate/navigation consumption behavior. |
| SY-020 | Design: Real-time multiplayer score | needs-revision |  | Needs score authority, ordering, reconnect and conflict semantics rather than generic synchronization prose. |
| SY-021 | Design: Enterprise feature flags | adapted | asd-121 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| SY-022 | Design: Android multi-module app | needs-revision |  | Source labels multi-module app design as Background; correct taxonomy and add module dependency/build constraints. |
| SY-023 | Design: Image-heavy shopping app | covered | aes-126 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SY-024 | Design: Offline navigation route | needs-revision |  | Specify downloaded-region versioning, eviction and interrupted-update consistency. |
| SY-025 | Design: IoT sensor dashboard | adapted | asd-125 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| SY-026 | Design: Account authentication refresh | covered | asd-002 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SY-027 | Design: Short-video feed | needs-revision |  | Needs player lifecycle, bounded prefetch/cache and resource-release budgets. |
| SY-028 | Design: Document scanner workflow | needs-revision |  | Define scanner pipeline checkpoints, durable assets and interruption recovery. |
| SY-029 | Design: Payment confirmation UI | covered | aes-002 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SY-030 | Design: Crash-safe user preferences | needs-revision |  | Needs per-setting versus snapshot conflict rules and server versioning for synchronized preferences. |
| SC-001 | Refresh updates after logout | adapted | aes-101 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| SC-002 | Crash in independent feed widget | adapted | aes-102 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| SC-003 | Slow startup work | covered | asd-006 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SC-004 | Search result flickers | covered | acc-005 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SC-005 | No events after rotation | covered | aes-002 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SC-006 | Expensive double collection | covered | acr-005 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SC-007 | Draft lost after process kill | covered | aes-003 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SC-008 | Leaked Fragment binding | covered | acr-006 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SC-009 | Exported deep-link bypass | adapted | aes-109 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| SC-010 | Recomposition performance regression | covered | aes-004 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SC-011 | Checkbox state jumps rows | covered | acr-122 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SC-012 | Screen refetches endlessly | covered | acr-123 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SC-013 | Overcomplicated small feature | covered | asd-001 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SC-014 | DI scope leaks Activity | covered | aes-005 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SC-015 | Unstable API model in UI | adapted | aes-115 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| SC-016 | Offline edit overwritten | covered | asd-003 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SC-017 | DB migration crashes on upgrade | adapted | aes-117 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| SC-018 | Pagination duplicates items | covered | asd-004 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SC-019 | 429 spike during refresh | adapted | aes-119 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| SC-020 | Auth requests storm | covered | asd-002 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SC-021 | Checkout timed out | covered | asd-001 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SC-022 | GraphQL partial result | needs-revision |  | Requires a concrete GraphQL schema/client partial-data policy and primary SDK references. |
| SC-023 | Periodic task never runs on time | adapted | aes-123 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| SC-024 | Duplicate image uploads | covered | asd-005 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SC-025 | Foreground service rejected | adapted | aes-125 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| SC-026 | OOM after gallery scrolling | adapted | aes-126 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| SC-027 | ANRs after analytics change | covered | asd-006 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SC-028 | App feels slow but CPU low | adapted | aes-128 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| SC-029 | Flaky CI UI tests | adapted | aes-129 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| SC-030 | Unit tests pass, upgrade fails | covered | aes-117 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SC-031 | Hard to test coroutine code | covered | acc-012 | Primary learning/failure mode already covered by the referenced problem; omitted to avoid a renamed duplicate. |
| SC-032 | Token in crash report | adapted | aes-132 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| SC-033 | Malicious intent extras | needs-revision |  | Needs the actual URI/file-provider contract, traversal/canonicalization constraints and authorization tests. |
| SC-034 | Release crash but debug fine | adapted | aes-134 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
| SC-035 | CI credentials exposed | adapted | aes-135 | Specialized prompt and complete type-specific solution/rubric added; official references reviewed; no compilation claim. |
