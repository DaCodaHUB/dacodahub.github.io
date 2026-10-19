# Batch 1 content review

## Review performed

Reviewed the 201-card source curriculum, the existing Fundamentals topic/resource data and official Kotlin/Android documentation. All 40 challenges have matching source-card/topic provenance and an explicit description of added material. Review concentrated on whether each alleged defect exists under the supplied assumptions, whether a correction addresses that defect and whether reference solutions overclaim platform guarantees.

The URL audit initially found an obsolete Android ANR URL and moved Kotlin cancellation/Flow pages. Challenge references now use the current destinations: [Android ANRs](https://developer.android.com/topic/performance/issues/anr), [Kotlin cancellation](https://kotlinlang.org/docs/coroutines-cancellation.html) and [Kotlin Flow](https://kotlinlang.org/docs/coroutines-flow.html). The audit rejects HTML/JavaScript redirect stubs as well as HTTP failures. All 34 distinct official reference pages returned usable documentation after correction. Existing Fundamentals resources were not edited as part of this task.

The source's shorthand was refined where necessary: swallowing cancellation does not reactivate a Job; an off-main blocking call is not automatically interruptible; a read-only collection interface is not deep immutability; saved state is not unconditional durable persistence; a scheduler does not guarantee exactly-once server effects. These refinements follow the official references linked on each relevant challenge.

Two early collection-alias problems overlapped. The second was replaced before publication by the Java platform-nullability boundary problem. A repeated cancellation completion was likewise replaced by a bounded retry-policy/off-by-one problem. Titles/prompts are unique, but that automated check alone cannot detect all conceptual duplication.

## Code review decisions and remaining checks

| ID | Key factual check / assumption | Manual execution still needed |
| --- | --- | --- |
| acr-001 | Generated copy shares the mutable list; correction creates a new list of immutable strings. | Compile generated fixture; add mutable-item variant only as a separate problem. |
| acr-002 | Unannotated Java may return null despite a non-null Kotlin local; blank fallback is explicitly required. | Compile a Java/Kotlin fixture with null, blank and valid Java results; inspect boundary exception. |
| acr-003 | The injected ordinary read blocks; suspend does not switch its thread. | Coroutine test proving dispatcher use and caller cancellation; choose a real cancellable I/O adapter separately. |
| acr-004 | Broad Exception catches cancellation; only IOException is expected. | Coroutine test verifying cancellation propagation and unexpected-failure behavior. |
| acr-005 | Two cold collectors invoke fetch twice. Shared state only shares the current upstream lifecycle. | Test subscription overlap, stop timeout, restart and error-state behavior. |
| acr-006 | Fragment outlives its view; binding is cleared. | Fragment fixture with destroyed/recreated view and STARTED stop/restart. |
| acr-007 | Plain mutableListOf mutation is not snapshot-observable. | Compose test that clicks without unrelated invalidation and checks rendering. |
| acr-008 | Cleanup exists; constant identity is the actual bug. | Compose test changing account/source and counting registrations/disposals. |
| acr-009 | Public MutableStateFlow permits bypassing the validation action. | ViewModel test for blank rejection and observable valid updates. |
| acr-010 | Two writes require one same-database transaction. Network fetch remains outside it. | Room/KSP compilation and rollback/invalidation integration test with an insertion failure. |
| acr-011 | Permanent/transient upload outcomes are supplied app contracts. | Worker tests for result mapping, cancellation and dependent-chain policy. |
| acr-012 | Slow I/O holds the monitor that Main needs; one refresh at a time is assumed. | Compile basic-value fixture, then a separate latch/trace test for contention; fixture does not prove responsiveness. |

Code samples explicitly identify full declarations versus host/body excerpts. Android snippets are not advertised as standalone programs. Dependencies and app-owned types are declared in sample context. The corrected Fragment body requires the listed Fragment host, binding and state flow. Room needs an entity/database and code generation; Hilt needs normal application/plugin/component setup. Snippets use explicit opt-ins where relevant and no deliberately deprecated Android API.

## Completion ambiguity review

| ID | Accepted scope and edge cases |
| --- | --- |
| acc-001 | takeIf(nonblank) and takeUnless(blank) are both listed; null, blank and padded name cases are in the fixture. |
| acc-002 | Only declaration-site `out` fits the unchanged producer API. |
| acc-003 | `coroutineScope` and both `await()` calls implement all-or-fail paired work; partial success is a different contract. |
| acc-004 | Imported `ensureActive()` is required; merely reading isActive does nothing. Caller owns CPU dispatcher choice. |
| acc-005 | `flatMapLatest` switches inner subscriptions; debounce is not a server-request guarantee. |
| acc-006 | `getStateFlow<String>` and the exact shared key satisfy the specified API; durable documents are excluded. |
| acc-007 | `rememberUpdatedState` and the delegated current callback preserve timer identity. |
| acc-008 | `@Singleton` is scoped to its component instance/process; no Activity is retained. |
| acc-009 | Two accepted status orders, inclusive retry indices 0..1; GET-only and three total attempts are hypothetical product policy. The predicate does not implement backoff or Retry-After. |
| acc-010 | `Flow<List<Note>>` fits the imported observable Room query; it is not an exactly-once row-change feed. |
| acc-011 | KEEP preserves unfinished unique work; separate account names/drain loops may be necessary in a real sync system. |
| acc-012 | One testScheduler and advanceUntilIdle drive queued virtual-time work; a real sleep does not. |

All accepted answer combinations are structurally substituted in Node tests. The five generated standard-library fixtures include behavioral checks but remain uncompiled. The other seven completion problems need appropriate coroutine/Android/JUnit hosts. Alternative semantically correct answers not listed should be reviewed by an interviewer, not automatically rejected by a future UI.

## Design and scenario review gates

| IDs | Assumptions / decisions to revisit with a real product |
| --- | --- |
| asd-001 | Quote authority, idempotent order submission and incremental refactor constraints are proposed contracts. A domain layer is optional. |
| asd-002 | Refresh-token rotation, account epochs and permitted replay require backend/security agreement; client refresh hooks vary by HTTP library. |
| asd-003 | Stable operation IDs, conditional versions, tombstones and user-resolved conflicts need an actual server protocol. |
| asd-004 | Cursor/snapshot semantics and cache retention must be negotiated; Paging/Room cannot supply missing backend consistency. |
| asd-005 | Stated work is deferrable. Before implementing an immediate-transfer alternative, verify current OS/target-specific API, foreground-service, quota and notification rules. |
| asd-006 | No timing numbers are supplied. Baselines, critical readiness and upgrade paths must be measured rather than invented. |
| asd-007 | Server revisions are per delivery; a notification is not a guaranteed ordered event or an authorization token. |
| asd-008 | Conflict/deletion/access-control semantics precede transport choice. A CRDT alternative needs its own correctness analysis. |
| aes-001 | Hash identity must stay suitable for set/map lookup; editable email is not a stable member key. |
| aes-002 | Receipt identity is recoverable state; replay alone is neither durable nor exactly-once navigation. |
| aes-003 | Long/sensitive drafts need explicit durability, privacy and loss-window policies; distinguish process restoration from force-stop/task removal. |
| aes-004 | Trace evidence must connect phases/image work to dropped frames; annotations cannot be justified by recomposition counts alone. |
| aes-005 | The supplied retaining path supports targeted listener cleanup; applicationContext is not a blanket UI-context replacement. |
| aes-006 | Actual Play enrollment, certificate fingerprints and account recovery permissions must be verified before operational changes. No credentials or keys were accessed. |
| aes-007 | The credential is explicitly privileged; public client IDs are a different threat model. The hypothetical service proposal does not add a portfolio backend. |
| aes-008 | Fresh operation IDs are a causal hypothesis supported by supplied evidence; replay deduplication requires server semantics and retention. |

## Status and limits

- Node schema/content-contract tests, negative fixtures and reference availability checks passed. Astro type checking and the six-route production build passed.
- Kotlin compilation, Android code generation, emulator/device behavior, real concurrency timing, performance measurements and live backend protocols were **not** executed. No Kotlin compiler was found on PATH. Every code sample retains `verification: 'not-compiled'`.
- Estimated minutes, difficulty and six-point rubrics need calibration with interviewees and an Android engineer's editorial review before high-stakes evaluation. Follow-ups are discussion prompts rather than a hidden single answer.
- The first 40 are the complete authored batch. The remaining 110 are planned in the roadmap, not generated placeholders. Validate this batch's execution fixtures and review gates before scaling it.
