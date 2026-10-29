# Practical Android/mobile flashcard audit

Reviewed 2026-10-29. This file is documentation only. The application neither imports it nor uses it to construct cards. The audit generator and runtime alias table have been removed.

## Implementation inspected

The original bank was 201 records in `source.ts`: `id`, `question`, `answer`, and one of eight category keys. That file is now preserved unchanged as `src/data/android-flashcards/android-flashcards-archive.ts`. `mappings.ts` resolves Learn More links into the Fundamentals library and contains only active-card metadata. The Astro component records Known / Review Again locally and mounts one daily card by its canonical ID. There is no separate flashcard filter or navigation control in this implementation.

The archive and fingerprint remain as provenance, separate from the self-contained active bank in `src/data/android-flashcards/interview.ts`. All 73 questions, answers, follow-ups, and 17 examples are unchanged by the storage separation. No active dataset dependency imports the archive or audit. The string answer remains compatible, with optional `followUp` and `code: {language, context, code}`. Code and follow-up use native expandable details. Astro's bundled Shiki highlighter escapes and highlights snippets at build time. Code blocks scroll horizontally and are keyboard-focusable.

## Accounting

| Disposition | Original questions |
| --- | ---: |
| Keep | 4 |
| Rewrite | 64 |
| Merge | 112 |
| Remove | 21 |
| Total audited | 201 |

Added 5: fc-202, fc-203, fc-204, fc-205, fc-206. Final: **73 distinct questions** (4 kept + 64 rewritten + 5 added). Merge counts are redundant source questions absorbed into surviving cards. Keep means the original question and direct answer are unchanged, with a new practical follow-up.

## Compatibility and scope

The daily flashcard pool now has exactly 73 canonical IDs, each used once before the cycle repeats. It no longer contains historical aliases or retired IDs. The flashcard schedule and its published snapshot were explicitly replaced for this collection migration; the previous published snapshot is retained at `scripts/daily-android/archive/published-schedule-legacy.json` for historical reference only. The reset clock, challenge schedule, challenge progress keys, and challenge data and behavior remain unchanged.

Active flashcard reviews use `daily-android:v2:flashcard:<id>`. Only fc-147, fc-153, fc-166, and fc-201 retain an identical original question and answer, so only those four v1 records can be copied to the new namespace, on first read. A current v2 review takes precedence. No merge or alias progress is combined. All v1 keys remain untouched on the device as archived progress; rewritten and retired records are not assigned to new questions. Challenge persistence remains on v1.

The final column below records the earlier alias design as historical audit context only. Those aliases are no longer executed, and a removed question remains removed. The Markdown is useful for reviewing editorial decisions but is not required to run, build, schedule, or search the active collection.

Fragment/view lifecycles, Java callers, SharedPreferences migration, Handler/Looper, Binder, Compose/View interoperability, and ProGuard-style R8 rules remain where useful for production maintenance. Removed definitions are lower priority here, not necessarily obsolete technology.

## Final categories

| Category | Questions |
| --- | ---: |
| Kotlin language | 7 |
| Coroutines and concurrency | 9 |
| Flow, StateFlow, and SharedFlow | 8 |
| Android framework and lifecycle | 7 |
| Jetpack Compose | 9 |
| Architecture, data, and dependency injection | 14 |
| Background work and system behavior | 6 |
| Testing, performance, build, and security | 13 |
| Total | 73 |

Networking, authentication, pagination, offline sync, and mobile system design use the existing architecture category. React Native integration uses engineering. Category keys and labels remain compatible.

## Technical sources and examples

Review references: [coroutine ownership and cancellation](https://developer.android.com/kotlin/coroutines/coroutines-best-practices), [exceptions and supervision](https://kotlinlang.org/docs/exception-handling.html), [coroutine tests](https://developer.android.com/kotlin/coroutines/test), [Compose stability](https://developer.android.com/develop/ui/compose/performance/stability), [Compose performance](https://developer.android.com/develop/ui/compose/performance/bestpractices), [background task selection](https://developer.android.com/develop/background-work/background-tasks), [offline-first design](https://developer.android.com/topic/architecture/data-layer/offline-first), [Paging with network and database](https://developer.android.com/topic/libraries/architecture/paging/v3-network-db), [TurboModule contracts](https://reactnative.dev/docs/turbo-native-modules-introduction), and [native module lifecycle](https://reactnative.dev/docs/the-new-architecture/native-modules-lifecycle).

The 17 code examples are contextual fragments with dependencies and surrounding types stated next to each snippet. Kotlin review covered cancellation, dispatcher use, state generic inference, effect keys, lifecycle disposal, and transaction boundaries. The TypeScript Codegen specification is checked by TypeScript for syntax/transpilation. This Astro repository has no Android project, Kotlin compiler, React Native runtime, or generated native implementation, so the fragments are not claimed to be compiled or device-tested against native dependencies.

## Every original question

| Source ID | Original question | Decision | Retained / merge target | Reason | Historical replacement (inactive) |
| --- | --- | --- | --- | --- | --- |
| fc-001 | What is the difference between `val` and `var`? | rewrite | fc-001 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-001 |
| fc-002 | What is the difference between `const val` and `val`? | remove | — | Compile-time constant syntax has low interview value compared with mutability and boundary correctness. | fc-004 |
| fc-003 | What do `==` and `===` mean in Kotlin? | merge | fc-001 | Consolidate equality, shallow copying, and read-only collections into observable immutable UI state. | fc-001 |
| fc-004 | How does Kotlin null safety work? | rewrite | fc-004 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-004 |
| fc-005 | Why should `!!` be used sparingly? | merge | fc-004 | Consolidate null operators and smart casts into boundary validation and Java platform-type handling. | fc-004 |
| fc-006 | What is a smart cast? | merge | fc-004 | Consolidate null operators and smart casts into boundary validation and Java platform-type handling. | fc-004 |
| fc-007 | What does the Elvis operator do? | merge | fc-004 | Consolidate null operators and smart casts into boundary validation and Java platform-type handling. | fc-004 |
| fc-008 | What is the difference between `lateinit` and `lazy`? | merge | fc-096 | Keep Fragment/view lifetime and initialization risks in an incremental migration scenario. | fc-096 |
| fc-009 | How can you check whether a `lateinit` property is initialized? | remove | — | Initialization-check syntax encourages symptom checks rather than lifecycle ownership; migration ownership is covered by fc-096. | fc-004 |
| fc-010 | What does a Kotlin data class generate? | merge | fc-001 | Consolidate equality, shallow copying, and read-only collections into observable immutable UI state. | fc-001 |
| fc-011 | When should you use a sealed class or sealed interface? | rewrite | fc-011 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-011 |
| fc-012 | What is the difference between an enum and a sealed hierarchy? | merge | fc-011 | Compare sealed states with fixed enum values through valid screen-state combinations. | fc-011 |
| fc-013 | How do you create a singleton in Kotlin? | remove | — | Singleton declaration syntax is basic trivia; lifetime and shared-state risks are covered by dependency scopes. | fc-027 |
| fc-014 | What is a companion object? | merge | fc-035 | Keep Java-facing signatures and failure contracts together in migration preparation. | fc-035 |
| fc-015 | Are extension functions dynamically dispatched? | rewrite | fc-015 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-015 |
| fc-016 | What is the difference between `public`, `internal`, `protected`, and `private`? | remove | — | Visibility keyword enumeration is low-value recall; public module boundaries are covered by fc-154. | fc-004 |
| fc-017 | Why are Kotlin classes and methods final by default? | remove | — | Final-by-default definition is less useful than API compatibility and dependency-boundary decisions. | fc-011 |
| fc-018 | What is the difference between an abstract class and an interface? | remove | — | Abstract-class versus interface definition is generic language recall; practical contracts remain in architecture questions. | fc-015 |
| fc-019 | What happens when two interfaces provide the same default method? | remove | — | Default-interface conflict syntax is rare interview trivia without a useful Android scenario. | fc-024 |
| fc-020 | What are higher-order functions? | remove | — | Higher-order-function definition is basic; callback ownership and allocation reasoning remain in practical topics. | fc-027 |
| fc-021 | What is an inline function? | merge | fc-024 | Explain reification and erasure together through a realistic typed deserialization boundary. | fc-024 |
| fc-022 | What do `noinline` and `crossinline` do? | remove | — | Noinline/crossinline syntax trivia is lower priority than cancellation and interop correctness. | fc-001 |
| fc-023 | What does `reified` do? | merge | fc-024 | Explain reification and erasure together through a realistic typed deserialization boundary. | fc-024 |
| fc-024 | What is type erasure? | rewrite | fc-024 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-024 |
| fc-025 | What do `out` and `in` mean in Kotlin generics? | remove | — | Variance terminology is lower priority than the retained runtime generic-boundary scenario. | fc-202 |
| fc-026 | What is the difference between `List` and `MutableList`? | merge | fc-001 | Consolidate equality, shallow copying, and read-only collections into observable immutable UI state. | fc-001 |
| fc-027 | When is a `Sequence` useful? | rewrite | fc-027 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-027 |
| fc-028 | What is the difference between `map` and `flatMap`? | remove | — | Collection map/flatMap definitions are basic; async stream flattening remains in fc-078. | fc-035 |
| fc-029 | How should Kotlin scope functions be selected? | remove | — | Scope-function selection by receiver name is syntax recall rather than practical interview reasoning. | fc-203 |
| fc-030 | When is `let` useful? | remove | — | Let syntax is basic and duplicated by the null-boundary scenario. | fc-004 |
| fc-031 | When is `apply` useful? | remove | — | Apply syntax adds little beyond everyday Kotlin usage. | fc-011 |
| fc-032 | What is delegation in Kotlin? | remove | — | Delegation definition alone lacks enough mobile-specific value for this smaller bank. | fc-204 |
| fc-033 | What is a value class? | remove | — | Value-class definition and boxing trivia are lower priority than production concurrency and state modeling. | fc-024 |
| fc-034 | Does Kotlin have checked exceptions? | merge | fc-035 | Keep Java-facing signatures and failure contracts together in migration preparation. | fc-035 |
| fc-035 | What are `@JvmStatic`, `@JvmField`, and `@JvmOverloads` for? | rewrite | fc-035 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-035 |
| fc-036 | What is a coroutine? | merge | fc-037 | Replace dispatcher and suspend definitions with diagnosing blocking Android work. | fc-037 |
| fc-037 | What does `suspend` mean? | rewrite | fc-037 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-037 |
| fc-038 | What is structured concurrency? | rewrite | fc-038 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-038 |
| fc-039 | What is a `CoroutineScope`? | merge | fc-057 | Consolidate scope/context primitives and detached-work warnings around explicit lifecycle ownership. | fc-057 |
| fc-040 | What is a `CoroutineContext`? | merge | fc-057 | Consolidate scope/context primitives and detached-work warnings around explicit lifecycle ownership. | fc-057 |
| fc-041 | What is a `Job`? | merge | fc-046 | Teach job hierarchy and exception propagation through independent panel failures. | fc-046 |
| fc-042 | What is the difference between `launch` and `async`? | merge | fc-038 | Consolidate async, launch, and concurrent result loading into required dashboard requests. | fc-038 |
| fc-043 | When should you use `withContext`? | merge | fc-037 | Replace dispatcher and suspend definitions with diagnosing blocking Android work. | fc-037 |
| fc-044 | What are the standard dispatchers? | merge | fc-037 | Replace dispatcher and suspend definitions with diagnosing blocking Android work. | fc-037 |
| fc-045 | What does main-safe mean? | merge | fc-037 | Replace dispatcher and suspend definitions with diagnosing blocking Android work. | fc-037 |
| fc-046 | What is the difference between `coroutineScope` and `supervisorScope`? | rewrite | fc-046 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-046 |
| fc-047 | What is a `SupervisorJob`? | merge | fc-046 | Teach job hierarchy and exception propagation through independent panel failures. | fc-046 |
| fc-048 | How do exceptions propagate from `launch`? | merge | fc-046 | Teach job hierarchy and exception propagation through independent panel failures. | fc-046 |
| fc-049 | How do exceptions propagate from `async`? | merge | fc-046 | Teach job hierarchy and exception propagation through independent panel failures. | fc-046 |
| fc-050 | What is `CoroutineExceptionHandler` for? | merge | fc-046 | Teach job hierarchy and exception propagation through independent panel failures. | fc-046 |
| fc-051 | How does coroutine cancellation work? | rewrite | fc-051 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-051 |
| fc-052 | Why should `CancellationException` usually be rethrown? | merge | fc-051 | Combine cancellation propagation and cleanup into a stale-search failure scenario. | fc-051 |
| fc-053 | What is the difference between `delay` and `Thread.sleep`? | merge | fc-037 | Replace dispatcher and suspend definitions with diagnosing blocking Android work. | fc-037 |
| fc-054 | When should `NonCancellable` be used? | merge | fc-051 | Combine cancellation propagation and cleanup into a stale-search failure scenario. | fc-051 |
| fc-055 | What does `runBlocking` do? | merge | fc-057 | Consolidate scope/context primitives and detached-work warnings around explicit lifecycle ownership. | fc-057 |
| fc-056 | Why avoid `GlobalScope`? | merge | fc-057 | Consolidate scope/context primitives and detached-work warnings around explicit lifecycle ownership. | fc-057 |
| fc-057 | What is `viewModelScope`? | rewrite | fc-057 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-057 |
| fc-058 | What is `lifecycleScope`? | merge | fc-057 | Consolidate scope/context primitives and detached-work warnings around explicit lifecycle ownership. | fc-057 |
| fc-059 | Why use `repeatOnLifecycle`? | rewrite | fc-059 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-059 |
| fc-060 | How do you run independent suspending operations concurrently? | merge | fc-038 | Consolidate async, launch, and concurrent result loading into required dashboard requests. | fc-038 |
| fc-061 | How should shared mutable state be protected in coroutines? | rewrite | fc-061 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-061 |
| fc-062 | Why can `synchronized` be problematic around suspending code? | merge | fc-061 | Combine races, monitors, and shared mutation into protecting a cache invariant. | fc-061 |
| fc-063 | What is a race condition? | merge | fc-061 | Combine races, monitors, and shared mutation into protecting a cache invariant. | fc-061 |
| fc-064 | How do you convert a one-shot callback to a suspending function? | rewrite | fc-064 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-064 |
| fc-065 | How should coroutine code be tested? | rewrite | fc-065 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-065 |
| fc-066 | What is a Kotlin `Flow`? | merge | fc-074 | Teach cold producers, collection, and sharing timeout through duplicate upstream requests. | fc-074 |
| fc-067 | What is the difference between intermediate and terminal Flow operators? | merge | fc-074 | Teach cold producers, collection, and sharing timeout through duplicate upstream requests. | fc-074 |
| fc-068 | What does `flowOn` change? | rewrite | fc-068 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-068 |
| fc-069 | How should Flow exceptions be handled? | rewrite | fc-069 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-069 |
| fc-070 | What is the difference between `retry` and `retryWhen`? | merge | fc-069 | Place bounded retry and catch in one error-handling pipeline decision. | fc-069 |
| fc-071 | What is `StateFlow`? | merge | fc-073 | Combine hot-flow definitions and read-only exposure into UI-state versus broadcast decisions. | fc-073 |
| fc-072 | What is `SharedFlow`? | merge | fc-073 | Combine hot-flow definitions and read-only exposure into UI-state versus broadcast decisions. | fc-073 |
| fc-073 | StateFlow or SharedFlow for UI state? | rewrite | fc-073 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-073 |
| fc-074 | What do `stateIn` and `shareIn` do? | rewrite | fc-074 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-074 |
| fc-075 | What is `SharingStarted.WhileSubscribed` useful for? | merge | fc-074 | Teach cold producers, collection, and sharing timeout through duplicate upstream requests. | fc-074 |
| fc-076 | What is the difference between `combine` and `zip`? | rewrite | fc-076 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-076 |
| fc-077 | What is the difference between `flatMapConcat`, `flatMapMerge`, and `flatMapLatest`? | merge | fc-078 | Compare latest, concat, and merge using query cancellation and write guarantees. | fc-078 |
| fc-078 | Why is `flatMapLatest` useful for search? | rewrite | fc-078 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-078 |
| fc-079 | What is the difference between `collect` and `collectLatest`? | merge | fc-080 | Compare collector cancellation, buffering, and conflation through an explicit loss policy. | fc-080 |
| fc-080 | What do `buffer` and `conflate` do? | rewrite | fc-080 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-080 |
| fc-081 | When should `callbackFlow` be used? | rewrite | fc-081 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-081 |
| fc-082 | How should Flow be exposed from a ViewModel? | merge | fc-073 | Combine hot-flow definitions and read-only exposure into UI-state versus broadcast decisions. | fc-073 |
| fc-083 | What are Android's four core app components? | merge | fc-198 | Keep component boundaries, sandbox, visibility, and URI grants in one security review. | fc-198 |
| fc-084 | What is `Context`? | merge | fc-085 | Replace Context definition with concrete UI versus process ownership. | fc-085 |
| fc-085 | Application context or Activity context? | rewrite | fc-085 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-085 |
| fc-086 | What is the `Application` class for? | merge | fc-187 | Keep initialization and Baseline Profiles in a measured startup optimization scenario. | fc-187 |
| fc-087 | What is an Activity? | merge | fc-092 | Consolidate lifecycle and restoration primitives into checkout reconstruction after rotation and process death. | fc-092 |
| fc-088 | What are the major Activity lifecycle callbacks? | merge | fc-092 | Consolidate lifecycle and restoration primitives into checkout reconstruction after rotation and process death. | fc-092 |
| fc-089 | What is the difference between `onCreate` and `onStart`? | merge | fc-092 | Consolidate lifecycle and restoration primitives into checkout reconstruction after rotation and process death. | fc-092 |
| fc-090 | Can Android kill a process without calling `onDestroy`? | merge | fc-092 | Consolidate lifecycle and restoration primitives into checkout reconstruction after rotation and process death. | fc-092 |
| fc-091 | What is a configuration change? | merge | fc-092 | Consolidate lifecycle and restoration primitives into checkout reconstruction after rotation and process death. | fc-092 |
| fc-092 | What is the difference between configuration change and process death? | rewrite | fc-092 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-092 |
| fc-093 | ViewModel, saved instance state, or database? | merge | fc-092 | Consolidate lifecycle and restoration primitives into checkout reconstruction after rotation and process death. | fc-092 |
| fc-094 | What is a Fragment? | merge | fc-096 | Keep Fragment/view lifetime and initialization risks in an incremental migration scenario. | fc-096 |
| fc-095 | Why observe view-related state with a Fragment's `viewLifecycleOwner`? | merge | fc-096 | Keep Fragment/view lifetime and initialization risks in an incremental migration scenario. | fc-096 |
| fc-096 | Why should Fragment arguments be used instead of custom constructors? | rewrite | fc-096 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-096 |
| fc-097 | What is an Intent? | merge | fc-099 | Combine intents, launch modes, links, and task semantics into debugging duplicate navigation. | fc-099 |
| fc-098 | What is an intent filter? | merge | fc-099 | Combine intents, launch modes, links, and task semantics into debugging duplicate navigation. | fc-099 |
| fc-099 | What are tasks and the back stack? | rewrite | fc-099 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-099 |
| fc-100 | When should special Activity launch modes be used? | merge | fc-099 | Combine intents, launch modes, links, and task semantics into debugging duplicate navigation. | fc-099 |
| fc-101 | What is a Service, and does it create a background thread? | merge | fc-037 | Replace dispatcher and suspend definitions with diagnosing blocking Android work. | fc-037 |
| fc-102 | What is a foreground service? | merge | fc-167 | Compare durable scheduling, coroutines, and eligible foreground execution in one decision. | fc-167 |
| fc-103 | What is a BroadcastReceiver? | merge | fc-176 | Combine short receiver processing with durable follow-up and validated push navigation. | fc-176 |
| fc-104 | What is a ContentProvider? | merge | fc-198 | Keep component boundaries, sandbox, visibility, and URI grants in one security review. | fc-198 |
| fc-105 | What are `Looper`, `MessageQueue`, and `Handler`? | rewrite | fc-105 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-105 |
| fc-106 | What is an ANR? | merge | fc-186 | Use trace-based ANR diagnosis instead of component definitions or timeout trivia. | fc-186 |
| fc-107 | Why should exact ANR timeout numbers be used cautiously in interview answers? | merge | fc-186 | Use trace-based ANR diagnosis instead of component definitions or timeout trivia. | fc-186 |
| fc-108 | How does Android isolate apps? | merge | fc-198 | Keep component boundaries, sandbox, visibility, and URI grants in one security review. | fc-198 |
| fc-109 | What is Binder? | rewrite | fc-109 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-109 |
| fc-110 | What is package visibility? | merge | fc-198 | Keep component boundaries, sandbox, visibility, and URI grants in one security review. | fc-198 |
| fc-111 | What is the difference between deep links and Android App Links? | merge | fc-099 | Combine intents, launch modes, links, and task semantics into debugging duplicate navigation. | fc-099 |
| fc-112 | What are runtime permissions? | rewrite | fc-112 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-112 |
| fc-113 | What is process importance? | merge | fc-092 | Consolidate lifecycle and restoration primitives into checkout reconstruction after rotation and process death. | fc-092 |
| fc-114 | What does declarative UI mean in Compose? | merge | fc-120 | Consolidate declarative UI and state ownership into a reusable form with a persistence owner. | fc-120 |
| fc-115 | What is composition? | merge | fc-120 | Consolidate declarative UI and state ownership into a reusable form with a persistence owner. | fc-120 |
| fc-116 | What is recomposition? | merge | fc-137 | Replace recomposition and rendering-phase definitions with measured frame diagnosis. | fc-137 |
| fc-117 | What causes a composable to recompose? | merge | fc-137 | Replace recomposition and rendering-phase definitions with measured frame diagnosis. | fc-137 |
| fc-118 | What does `remember` do? | merge | fc-120 | Consolidate declarative UI and state ownership into a reusable form with a persistence owner. | fc-120 |
| fc-119 | What does `rememberSaveable` do? | merge | fc-092 | Consolidate lifecycle and restoration primitives into checkout reconstruction after rotation and process death. | fc-092 |
| fc-120 | What is state hoisting? | rewrite | fc-120 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-120 |
| fc-121 | Stateful or stateless composable? | merge | fc-120 | Consolidate declarative UI and state ownership into a reusable form with a persistence owner. | fc-120 |
| fc-122 | What is unidirectional data flow in Compose? | merge | fc-120 | Consolidate declarative UI and state ownership into a reusable form with a persistence owner. | fc-120 |
| fc-123 | What is stability in Compose? | rewrite | fc-123 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-123 |
| fc-124 | Why can mutable collections cause stale Compose UI? | merge | fc-001 | Consolidate equality, shallow copying, and read-only collections into observable immutable UI state. | fc-001 |
| fc-125 | Why are keys important in lazy lists? | rewrite | fc-125 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-125 |
| fc-126 | What is `LaunchedEffect`? | rewrite | fc-126 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-126 |
| fc-127 | What is `DisposableEffect`? | merge | fc-126 | Compare composition side-effect APIs by work lifetime, restart keys, and cleanup. | fc-126 |
| fc-128 | What is `SideEffect`? | merge | fc-126 | Compare composition side-effect APIs by work lifetime, restart keys, and cleanup. | fc-126 |
| fc-129 | What is `rememberCoroutineScope`? | merge | fc-126 | Compare composition side-effect APIs by work lifetime, restart keys, and cleanup. | fc-126 |
| fc-130 | What problem does `rememberUpdatedState` solve? | merge | fc-126 | Compare composition side-effect APIs by work lifetime, restart keys, and cleanup. | fc-126 |
| fc-131 | When is `derivedStateOf` useful? | rewrite | fc-131 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-131 |
| fc-132 | What does `snapshotFlow` do? | merge | fc-131 | Compare derived rendering state with snapshotFlow for scroll observation. | fc-131 |
| fc-133 | How should Flow be collected in Compose on Android? | rewrite | fc-133 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-133 |
| fc-134 | Why does Modifier order matter? | merge | fc-139 | Cover touch behavior and decorative descriptions within accessibility and semantics review. | fc-139 |
| fc-135 | What is `CompositionLocal` for? | remove | — | CompositionLocal definition is lower priority than explicit state ownership and injected screen dependencies. | fc-139 |
| fc-136 | What are Compose's major phases? | merge | fc-137 | Replace recomposition and rendering-phase definitions with measured frame diagnosis. | fc-137 |
| fc-137 | How do you reduce unnecessary recomposition? | rewrite | fc-137 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-137 |
| fc-138 | How do Compose and Views interoperate? | rewrite | fc-138 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-138 |
| fc-139 | What are semantics in Compose? | rewrite | fc-139 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-139 |
| fc-140 | When should `contentDescription` be null? | merge | fc-139 | Cover touch behavior and decorative descriptions within accessibility and semantics review. | fc-139 |
| fc-141 | How should navigation arguments be handled? | merge | fc-092 | Consolidate lifecycle and restoration primitives into checkout reconstruction after rotation and process death. | fc-092 |
| fc-142 | What architecture does Android currently recommend? | merge | fc-146 | Replace architecture and Room definitions with cached reads, refresh, policy boundaries, and observable persistence. | fc-146 |
| fc-143 | What is separation of concerns? | merge | fc-146 | Replace architecture and Room definitions with cached reads, refresh, policy boundaries, and observable persistence. | fc-146 |
| fc-144 | What is a single source of truth? | merge | fc-146 | Replace architecture and Room definitions with cached reads, refresh, policy boundaries, and observable persistence. | fc-146 |
| fc-145 | What is the role of a ViewModel? | merge | fc-092 | Consolidate lifecycle and restoration primitives into checkout reconstruction after rotation and process death. | fc-092 |
| fc-146 | What is a repository responsible for? | rewrite | fc-146 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-146 |
| fc-147 | When should a domain layer be added? | keep | fc-147 | Retain this practical, frequently relevant answer; add a specific interview follow-up. | fc-147 |
| fc-148 | What is MVVM in Android? | merge | fc-146 | Replace architecture and Room definitions with cached reads, refresh, policy boundaries, and observable persistence. | fc-146 |
| fc-149 | How does MVI differ from MVVM? | merge | fc-146 | Replace architecture and Room definitions with cached reads, refresh, policy boundaries, and observable persistence. | fc-146 |
| fc-150 | What does Clean Architecture mean in practice? | merge | fc-146 | Replace architecture and Room definitions with cached reads, refresh, policy boundaries, and observable persistence. | fc-146 |
| fc-151 | Why use dependency injection? | merge | fc-152 | Teach injection through scopes, qualifiers, and test replacement rather than terminology. | fc-152 |
| fc-152 | What does Hilt provide? | rewrite | fc-152 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-152 |
| fc-153 | What is the danger of an incorrectly scoped dependency? | keep | fc-153 | Retain this practical, frequently relevant answer; add a specific interview follow-up. | fc-153 |
| fc-154 | When is modularization useful? | rewrite | fc-154 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-154 |
| fc-155 | What is offline-first architecture? | rewrite | fc-155 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-155 |
| fc-156 | Why is a database commonly the source of truth in offline-first apps? | merge | fc-146 | Replace architecture and Room definitions with cached reads, refresh, policy boundaries, and observable persistence. | fc-146 |
| fc-157 | What are Room's three primary components? | merge | fc-146 | Replace architecture and Room definitions with cached reads, refresh, policy boundaries, and observable persistence. | fc-146 |
| fc-158 | Why use Room instead of raw SQLite? | merge | fc-146 | Replace architecture and Room definitions with cached reads, refresh, policy boundaries, and observable persistence. | fc-146 |
| fc-159 | What is a Room migration? | rewrite | fc-159 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-159 |
| fc-160 | When should Room operations use a transaction? | rewrite | fc-160 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-160 |
| fc-161 | How does Room work with Flow? | merge | fc-146 | Replace architecture and Room definitions with cached reads, refresh, policy boundaries, and observable persistence. | fc-146 |
| fc-162 | Room, DataStore, or files? | rewrite | fc-162 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-162 |
| fc-163 | DataStore or SharedPreferences? | merge | fc-162 | Retain SharedPreferences migration while comparing storage consistency and access patterns. | fc-162 |
| fc-164 | Parcelable or Serializable for Android component data? | merge | fc-092 | Consolidate lifecycle and restoration primitives into checkout reconstruction after rotation and process death. | fc-092 |
| fc-165 | How should network errors be modeled? | rewrite | fc-165 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-165 |
| fc-166 | What makes a sync operation safe to retry? | keep | fc-166 | Retain this practical, frequently relevant answer; add a specific interview follow-up. | fc-166 |
| fc-167 | When should WorkManager be used? | rewrite | fc-167 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-167 |
| fc-168 | How does WorkManager provide durable scheduling? | merge | fc-167 | Compare durable scheduling, coroutines, and eligible foreground execution in one decision. | fc-167 |
| fc-169 | What should a Worker return on failure? | rewrite | fc-169 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-169 |
| fc-170 | What is unique work? | rewrite | fc-170 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-170 |
| fc-171 | WorkManager or foreground service? | merge | fc-167 | Compare durable scheduling, coroutines, and eligible foreground execution in one decision. | fc-167 |
| fc-172 | WorkManager or AlarmManager? | rewrite | fc-172 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-172 |
| fc-173 | What is Doze? | rewrite | fc-173 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-173 |
| fc-174 | What is App Standby? | merge | fc-173 | Combine idle power restrictions into investigating delayed durable work. | fc-173 |
| fc-175 | How should background sync handle unstable networks? | merge | fc-155 | Consolidate unstable-network sync with outbox durability and explicit conflict handling. | fc-155 |
| fc-176 | How should push notifications be handled? | rewrite | fc-176 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-176 |
| fc-177 | What is the difference between local and instrumented Android tests? | merge | fc-178 | Compare test boundaries, fakes, and deterministic execution through a cached-refresh ViewModel. | fc-178 |
| fc-178 | What should a ViewModel unit test verify? | rewrite | fc-178 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-178 |
| fc-179 | Fake or mock? | merge | fc-178 | Compare test boundaries, fakes, and deterministic execution through a cached-refresh ViewModel. | fc-178 |
| fc-180 | What makes a test reliable? | merge | fc-178 | Compare test boundaries, fakes, and deterministic execution through a cached-refresh ViewModel. | fc-178 |
| fc-181 | What does Espresso synchronize with? | rewrite | fc-181 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-181 |
| fc-182 | How are Compose UIs tested? | rewrite | fc-182 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-182 |
| fc-183 | What is a memory leak? | merge | fc-184 | Combine leak definition, retained paths, and OOM distinction into an Activity leak investigation. | fc-184 |
| fc-184 | How do you investigate a memory leak? | rewrite | fc-184 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-184 |
| fc-185 | Memory leak versus OOM? | merge | fc-184 | Combine leak definition, retained paths, and OOM distinction into an Activity leak investigation. | fc-184 |
| fc-186 | What commonly causes Android jank? | rewrite | fc-186 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-186 |
| fc-187 | How should app startup be improved? | rewrite | fc-187 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-187 |
| fc-188 | What are baseline profiles? | merge | fc-187 | Keep initialization and Baseline Profiles in a measured startup optimization scenario. | fc-187 |
| fc-189 | What is R8? | rewrite | fc-189 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-189 |
| fc-190 | ProGuard or R8? | merge | fc-189 | Retain ProGuard-style rule compatibility in diagnosing a minified release crash. | fc-189 |
| fc-191 | Build type, product flavor, and build variant? | remove | — | Build variant terminology is basic; release-artifact validation remains in fc-189. | fc-198 |
| fc-192 | What does Android lint do? | remove | — | Lint definition is low-value recall compared with actionable testing and production diagnosis. | fc-205 |
| fc-193 | Why use Android App Bundles? | remove | — | Publishing-format definition is low-value trivia for this practical preparation set. | fc-206 |
| fc-194 | How should secrets be stored in an Android app? | rewrite | fc-194 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-194 |
| fc-195 | Does encryption alone secure local data? | merge | fc-194 | Combine device-bound key management with threat modeling, backup, and local data protection. | fc-194 |
| fc-196 | What protects network traffic? | merge | fc-165 | Include network trust and error boundaries in practical client failure handling. | fc-165 |
| fc-197 | How does least privilege apply to Android? | merge | fc-198 | Keep component boundaries, sandbox, visibility, and URI grants in one security review. | fc-198 |
| fc-198 | How do you protect an exported component? | rewrite | fc-198 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-198 |
| fc-199 | What is app signing responsible for? | remove | — | Signing definition is lower priority than credential protection; signing is not declared obsolete. | fc-184 |
| fc-200 | What should production observability include? | rewrite | fc-200 | Replace the definition or brief overview with a decision or failure scenario and practical follow-up. | fc-200 |
| fc-201 | How should a senior engineer describe a production incident? | keep | fc-201 | Retain this practical, frequently relevant answer; add a specific interview follow-up. | fc-201 |

## Final distinct inventory

| ID | Category | Question | Code |
| --- | --- | --- | --- |
| fc-001 | kotlin | A UI state exposes a val List, but rows change without a new emission. What went wrong? | kotlin |
| fc-004 | kotlin | A Java SDK returns nullable platform types. Where would you enforce null safety? | — |
| fc-011 | kotlin | How would you model loading, content, and failure without impossible UI combinations? | kotlin |
| fc-015 | kotlin | A Kotlin extension behaves differently when a value is typed as an interface. Why? | — |
| fc-024 | kotlin | Why can a generic JSON helper not reliably check that a value is List<User> at runtime? | — |
| fc-027 | kotlin | Would you switch a large mapping pipeline to Sequence to improve scrolling? | — |
| fc-035 | kotlin | How would you evolve a Kotlin API still called by Java screens? | — |
| fc-037 | coroutines | A suspend repository method still freezes the UI. How would you fix it? | kotlin |
| fc-038 | coroutines | A dashboard needs two required API results. How would you load them concurrently? | kotlin |
| fc-046 | coroutines | One optional dashboard panel fails. How can other panels keep loading? | — |
| fc-051 | coroutines | A cancelled search keeps consuming CPU or reports an error. What would you inspect? | kotlin |
| fc-057 | coroutines | Which scope should own a request when the user rotates or leaves a screen? | — |
| fc-059 | coroutines | A Fragment keeps collecting data after its view is destroyed. How would you fix it? | kotlin |
| fc-061 | coroutines | Two coroutines update the same cache and occasionally lose writes. What would you change? | — |
| fc-064 | coroutines | How would you safely wrap a one-shot Android callback API as a suspend function? | — |
| fc-065 | coroutines | How would you test debounce, retries, and cancellation without waiting in real time? | kotlin |
| fc-068 | flow | A Flow transformation does expensive parsing. Where should flowOn go? | — |
| fc-069 | flow | A Flow error handler misses a rendering exception. Why, and where should retries live? | — |
| fc-073 | flow | When would you use StateFlow instead of SharedFlow for UI state? | kotlin |
| fc-074 | flow | Two collectors trigger duplicate API requests. How would you share a cold stream? | kotlin |
| fc-076 | flow | A screen combines a filter and cached rows. Would you use combine or zip? | — |
| fc-078 | flow | How would you stop stale search results from replacing results for a newer query? | kotlin |
| fc-080 | flow | A slow collector cannot keep up with location updates. Should you buffer, conflate, or use collectLatest? | — |
| fc-081 | flow | How would you expose a repeated SDK listener as Flow without leaking the listener? | — |
| fc-085 | framework | A singleton retains an Activity after rotation. How would you choose and manage its Context? | — |
| fc-092 | framework | A checkout survives rotation but loses its draft after process death. How would you restore it? | — |
| fc-096 | framework | How would you maintain Fragment-based screens while incrementally migrating to Compose? | kotlin |
| fc-099 | framework | A deep link opens a duplicate screen and Back exits unexpectedly. How would you debug it? | — |
| fc-105 | framework | How would you migrate delayed Handler callbacks without introducing lifecycle bugs? | — |
| fc-109 | framework | A bound-service call intermittently stalls the UI. What would you investigate? | — |
| fc-112 | framework | A user revokes permission while a feature is open. How should the app respond? | — |
| fc-120 | compose | Where would you own state for a reusable form and a screen that saves it? | — |
| fc-123 | compose | An unstable parameter appears in a Compose compiler report. Would you add @Stable? | — |
| fc-125 | compose | After reordering a LazyColumn, expanded row state moves to the wrong item. Why? | kotlin |
| fc-126 | compose | A request restarts on every recomposition, or uses an old callback. How would you fix its effect? | kotlin |
| fc-131 | compose | A scroll-to-top button recomposes on every scroll tick. How would you reduce that work? | kotlin |
| fc-133 | compose | How would you collect a ViewModel StateFlow without keeping an invisible Android screen active? | kotlin |
| fc-137 | compose | How would you diagnose and reduce unnecessary recomposition in a janky screen? | — |
| fc-138 | compose | How would you embed Compose in a Fragment and a legacy View inside Compose? | — |
| fc-139 | compose | A custom Compose control looks correct but is hard to test or use with TalkBack. What would you change? | — |
| fc-146 | architecture | How would you structure a screen that shows cached data and refreshes from an API? | — |
| fc-147 | architecture | When should a domain layer be added? | — |
| fc-152 | architecture | How would you scope and replace dependencies for a Hilt-backed screen? | — |
| fc-153 | architecture | What is the danger of an incorrectly scoped dependency? | — |
| fc-154 | architecture | When would you split a growing Android app into modules? | — |
| fc-155 | architecture | How would you synchronize offline edits when the same record changes on another device? | — |
| fc-159 | architecture | A Room schema change must preserve millions of users’ offline drafts. How would you ship it? | — |
| fc-160 | architecture | When should a Room refresh or local mutation use a transaction? | kotlin |
| fc-162 | architecture | Where would you store a theme preference, searchable cached records, and downloaded media? | — |
| fc-165 | architecture | How should a REST client distinguish errors and decide what the UI can retry? | — |
| fc-166 | architecture | What makes a sync operation safe to retry? | — |
| fc-167 | background | When would you choose WorkManager over a coroutine or foreground service? | — |
| fc-169 | background | A sync Worker fails repeatedly. When should it retry versus fail? | — |
| fc-170 | background | Multiple entry points schedule the same sync. How would you avoid duplicate work? | — |
| fc-172 | background | How would you schedule a user reminder that needs a specific time? | — |
| fc-173 | background | Sync is delayed when a phone is idle. How would you investigate and design around it? | — |
| fc-176 | background | How would you handle a push that opens a record and triggers a refresh? | — |
| fc-178 | engineering | What would you test for a ViewModel that renders cache, refreshes, and handles failure? | — |
| fc-181 | engineering | An Espresso test passes locally but flakes when background work runs slowly. How would you fix it? | — |
| fc-182 | engineering | How would you test a Compose screen’s loading, retry, and accessible content? | — |
| fc-184 | engineering | How would you investigate a memory leak caused by a long-lived reference to an Activity? | — |
| fc-186 | engineering | Users report ANRs and jank after a release. What evidence would you collect first? | — |
| fc-187 | engineering | How would you improve cold startup without breaking first-use behavior? | — |
| fc-189 | engineering | A release-only crash appears after enabling shrinking. How would you debug it? | — |
| fc-194 | engineering | How would you protect credentials and local data in a mobile app? | — |
| fc-198 | engineering | How would you review an exported component and its deep-link inputs? | — |
| fc-200 | engineering | How would you detect and mitigate a production regression during a staged rollout? | — |
| fc-201 | engineering | How should a senior engineer describe a production incident? | — |
| fc-202 | architecture | How would you paginate a large feed while keeping cached pages available offline? | — |
| fc-203 | architecture | Several requests receive 401 together. How would you avoid a token-refresh storm? | — |
| fc-204 | architecture | How would you design a chat client for intermittent connectivity and duplicate messages? | — |
| fc-205 | engineering | How would you expose an Android capability to React Native using the current native module architecture? | typescript |
| fc-206 | engineering | A React Native screen freezes while native Android scrolling stays smooth. How would you investigate? | — |
