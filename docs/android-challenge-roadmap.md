# Remaining coverage toward 150

The first batch is 40 complete problems: 12 reviews, 12 completions, eight designs and eight scenarios. There are no empty challenge records. Another 110 are required. Proposed allocations below are editorial planning targets, not permission to fill quotas with duplicates or an assertion that one question exhausts a topic.

## Proposed primary-topic targets

| Topic | Authored | Add | Target | Important remaining applications |
| --- | ---: | ---: | ---: | --- |
| Kotlin | 5 | 13 | 18 | Equality beyond data classes, sealed outcomes, extension dispatch, inline/reified boundaries, lazy sequences, delegation, Java annotations/overloads |
| Coroutines | 4 | 12 | 16 | Supervision/async failure timing, callback cancellation races, resource cleanup, Mutex invariants, scope ownership, bounded concurrency |
| Flow | 3 | 9 | 12 | flowOn boundaries, catch placement, combine/zip, callbackFlow cleanup, buffer/conflate loss policies, stateIn restart/error behavior |
| Lifecycle | 3 | 9 | 12 | Intent/back-stack reasoning, App Links validation, permissions/revocation, service threading, receivers, Binder/IPC, process importance |
| Compose | 4 | 14 | 18 | Hoisting, lazy keys, derivedStateOf, snapshotFlow, lifecycle collection, semantics/accessibility, modifier order, Views interop, measured phase optimizations |
| Architecture | 3 | 9 | 12 | Repository invariants, optional use cases, MVVM/MVI decisions, dependency scopes, module boundaries and deterministic state transitions |
| Networking | 2 | 8 | 10 | Typed HTTP/transport/decoding errors, cancellation adapters, pagination contracts, conditional requests, auth replay and TLS endpoint validation |
| Storage/offline | 4 | 10 | 14 | Room migrations/indexes/relations, DataStore update atomicity, cache expiry, partial sync, schema evolution, encryption/backup policies |
| Background | 3 | 7 | 10 | JobScheduler versus WorkManager, alarms versus deferred work, foreground-service version restrictions, notification denial/channels, unique-work drain races |
| Performance | 3 | 7 | 10 | Heap pressure versus leaks, allocations/GC, ANR attribution, startup tracing, baseline profiles, battery budgets and release-like benchmarks |
| Testing/security/build | 3 | 9 | 12 | Fakes versus mocks, ViewModel/UI tests, release R8 failures, variant isolation, lint, exported-component/URI validation, device-bound keys |
| Mobile system design | 3 | 3 | 6 | Capacity/freshness budgets, multi-account isolation, media/offline contracts and bounded degradation under partial failure |
| Total | 40 | 110 | 150 | |

Primary-topic totals do not describe all cross-topic coverage: for example, the storage designs also assess mobile system design. The generated coverage report links each problem to the existing library and shows all 100 source cards not yet mapped after batch 1. Some mapped cards remain only background knowledge; review the actual rubric before considering an application covered.

## Proposed format and difficulty targets

| Format | Authored | Add | Target |
| --- | ---: | ---: | ---: |
| Code Review | 12 | 33 | 45 |
| Completion | 12 | 33 | 45 |
| Mobile System Design | 8 | 22 | 30 |
| Engineering Scenario | 8 | 22 | 30 |
| Total | 40 | 110 | 150 |

| Difficulty | Authored | Add | Target |
| --- | ---: | ---: | ---: |
| Junior | 10 | 30 | 40 |
| Mid | 17 | 48 | 65 |
| Senior | 13 | 32 | 45 |
| Total | 40 | 110 | 150 |

The initial batch is relatively senior-heavy. Later batches should add approachable implementation and debugging tasks as well as the remaining advanced topics. Counts are provisional until human calibration.

## Expansion sequence

1. Review the first 40 with an Android engineer. Compile/run the five standard-library fixtures and add isolated Android/coroutine hosts for the highest-risk examples (Room transactions, Fragment destruction, Hilt scope and cancellation).
2. Add a second batch of 40 with the largest unmapped applications: callback races, Flow context/errors, lifecycle/navigation, Compose state/keys, migration tests and release/security debugging.
3. Validate that batch and inspect similarity against all earlier prompts, not only title equality. Add another 40 emphasizing persistence, background limits, resilience and test design.
4. Add the final 30 based on the measured remaining gaps. Recheck all distributions, source mappings, documentation and interviewer feedback. Keep review/build gates identical.

Do not add an unsupported API claim to meet a count. Record any unresolved version-specific platform behavior as a review gate or omit the problem until verified. UI, scheduling/rotation and user progress remain separate future work.
