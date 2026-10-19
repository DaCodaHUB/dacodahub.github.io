// Imported verbatim from the user-provided 201-card curriculum. Do not silently edit technical answers.
import type { FlashcardText } from './types.ts';
export const flashcardSource = {
  "filename": "Android + Kotlin Interview.md",
  "sourceSha256": "952ef06cad7c5b54dc87e8e0e26295997a036e7dd5aa0d8ab956fec6e9e32002",
  "cardsSha256": "456ec70fd80877455f3f2f8dd2d3ef9b1b553ab0deb2c37e428e0f2fd73a2919",
  "count": 201
} as const;
export const flashcardText = [
  {
    "id": "fc-001",
    "question": "What is the difference between `val` and `var`?",
    "answer": "`val` is a read-only reference that can be assigned once; `var` can be reassigned. `val` does not make the referenced object immutable, so the object's internal state may still change.",
    "category": "kotlin"
  },
  {
    "id": "fc-002",
    "question": "What is the difference between `const val` and `val`?",
    "answer": "`const val` is a compile-time constant restricted to primitives and strings at top level, in an object, or in a companion object. A regular `val` is assigned at runtime and may hold any type.",
    "category": "kotlin"
  },
  {
    "id": "fc-003",
    "question": "What do `==` and `===` mean in Kotlin?",
    "answer": "`==` checks structural equality by calling `equals`; `===` checks whether two references point to the same object.",
    "category": "kotlin"
  },
  {
    "id": "fc-004",
    "question": "How does Kotlin null safety work?",
    "answer": "Nullable types are declared with `?`. Safe calls `?.`, the Elvis operator `?:`, safe casts `as?`, and explicit null checks let the compiler prevent most accidental null dereferences.",
    "category": "kotlin"
  },
  {
    "id": "fc-005",
    "question": "Why should `!!` be used sparingly?",
    "answer": "`!!` converts a nullable reference to non-null and throws if it is null. It discards compiler protection, so prefer validation, safe calls, or an explicit error with useful context.",
    "category": "kotlin"
  },
  {
    "id": "fc-006",
    "question": "What is a smart cast?",
    "answer": "After a stable value passes a type or null check, the compiler can treat it as the narrower type without an explicit cast. Smart casts are not always possible for mutable or externally changeable properties.",
    "category": "kotlin"
  },
  {
    "id": "fc-007",
    "question": "What does the Elvis operator do?",
    "answer": "`a ?: b` returns `a` when it is non-null and otherwise evaluates and returns `b`. Because `return` and `throw` are expressions, they can be used on the right side.",
    "category": "kotlin"
  },
  {
    "id": "fc-008",
    "question": "What is the difference between `lateinit` and `lazy`?",
    "answer": "`lateinit` defers initialization of a non-null mutable property and throws if read too early. `lazy` computes a read-only property on first access, caches the result, and is thread-safe by default.",
    "category": "kotlin"
  },
  {
    "id": "fc-009",
    "question": "How can you check whether a `lateinit` property is initialized?",
    "answer": "From an allowed scope, use `::property.isInitialized`. This should not replace sound lifecycle ownership because it can hide unclear initialization rules.",
    "category": "kotlin"
  },
  {
    "id": "fc-010",
    "question": "What does a Kotlin data class generate?",
    "answer": "It generates `equals`, `hashCode`, `toString`, `componentN`, and `copy` from primary-constructor properties. `copy` is shallow, so referenced mutable objects remain shared.",
    "category": "kotlin"
  },
  {
    "id": "fc-011",
    "question": "When should you use a sealed class or sealed interface?",
    "answer": "Use it for a closed hierarchy whose permitted direct subtypes are known to the compiler. It enables exhaustive `when` expressions and works well for UI states, results, and events.",
    "category": "kotlin"
  },
  {
    "id": "fc-012",
    "question": "What is the difference between an enum and a sealed hierarchy?",
    "answer": "An enum provides a fixed set of singleton values with the same base shape. A sealed hierarchy allows different subtype data and behavior while retaining exhaustive handling.",
    "category": "kotlin"
  },
  {
    "id": "fc-013",
    "question": "How do you create a singleton in Kotlin?",
    "answer": "Declare an `object`. Its initialization is lazy and JVM initialization semantics make it thread-safe; still avoid turning the singleton into unbounded global mutable state.",
    "category": "kotlin"
  },
  {
    "id": "fc-014",
    "question": "What is a companion object?",
    "answer": "It is an object associated with a class rather than an instance. Its members can be accessed through the class name, but they are not true Java static members unless interoperability annotations are used.",
    "category": "kotlin"
  },
  {
    "id": "fc-015",
    "question": "Are extension functions dynamically dispatched?",
    "answer": "No. Extension resolution is static and depends on the compile-time type of the receiver. Extensions do not actually add members or access private state.",
    "category": "kotlin"
  },
  {
    "id": "fc-016",
    "question": "What is the difference between `public`, `internal`, `protected`, and `private`?",
    "answer": "`public` is visible everywhere; `internal` within the module; `protected` in the declaring class and subclasses; `private` within the declaring scope. Top-level declarations cannot be `protected`.",
    "category": "kotlin"
  },
  {
    "id": "fc-017",
    "question": "Why are Kotlin classes and methods final by default?",
    "answer": "Final-by-default prevents accidental inheritance and overriding. Use `open`, `abstract`, or an interface when extension is intentionally part of the design.",
    "category": "kotlin"
  },
  {
    "id": "fc-018",
    "question": "What is the difference between an abstract class and an interface?",
    "answer": "An abstract class can hold constructor state and implementation with single class inheritance. Interfaces support multiple inheritance of type and behavior but do not have backing-field instance state.",
    "category": "kotlin"
  },
  {
    "id": "fc-019",
    "question": "What happens when two interfaces provide the same default method?",
    "answer": "The implementing class must resolve the ambiguity by overriding the method. It can call a specific implementation with `super<Interface>.method()`.",
    "category": "kotlin"
  },
  {
    "id": "fc-020",
    "question": "What are higher-order functions?",
    "answer": "Functions that accept functions as parameters or return them. They enable reusable behavior but capturing lambdas can allocate and retain objects, so consider performance and lifecycle ownership in hot paths.",
    "category": "kotlin"
  },
  {
    "id": "fc-021",
    "question": "What is an inline function?",
    "answer": "The compiler can substitute the function body and lambda arguments at call sites, often avoiding lambda allocations and enabling reified type parameters. Excessive inlining can increase bytecode size.",
    "category": "kotlin"
  },
  {
    "id": "fc-022",
    "question": "What do `noinline` and `crossinline` do?",
    "answer": "`noinline` prevents a lambda parameter from being inlined so it can be stored or passed normally. `crossinline` keeps it inline but forbids non-local returns because it may execute in another context.",
    "category": "kotlin"
  },
  {
    "id": "fc-023",
    "question": "What does `reified` do?",
    "answer": "A reified type parameter in an inline function makes the type available at the call site, enabling checks such as `value is T` without explicitly passing a `Class` or `KClass`.",
    "category": "kotlin"
  },
  {
    "id": "fc-024",
    "question": "What is type erasure?",
    "answer": "On the JVM, most generic type arguments are not retained at runtime. This prevents checks such as `value is List<String>` unless type information is supplied another way.",
    "category": "kotlin"
  },
  {
    "id": "fc-025",
    "question": "What do `out` and `in` mean in Kotlin generics?",
    "answer": "`out T` is covariant and produces `T`; `in T` is contravariant and consumes `T`. Declaration-site variance improves safe substitutability without Java-style wildcard noise.",
    "category": "kotlin"
  },
  {
    "id": "fc-026",
    "question": "What is the difference between `List` and `MutableList`?",
    "answer": "`List` exposes read-only operations while `MutableList` exposes mutation. A read-only interface is not a guarantee that the underlying collection can never change elsewhere.",
    "category": "kotlin"
  },
  {
    "id": "fc-027",
    "question": "When is a `Sequence` useful?",
    "answer": "A sequence evaluates chained operations lazily and can avoid intermediate collections. It helps with large or multi-stage pipelines but may add overhead for small collections or simple operations.",
    "category": "kotlin"
  },
  {
    "id": "fc-028",
    "question": "What is the difference between `map` and `flatMap`?",
    "answer": "`map` transforms every element into one result. `flatMap` transforms each element into a collection or sequence and flattens those results into one stream.",
    "category": "kotlin"
  },
  {
    "id": "fc-029",
    "question": "How should Kotlin scope functions be selected?",
    "answer": "Choose based on receiver name and return value: `let` and `run` return the lambda result; `also` and `apply` return the receiver; `with` is a non-extension. Prefer clarity over chaining several scope functions.",
    "category": "kotlin"
  },
  {
    "id": "fc-030",
    "question": "When is `let` useful?",
    "answer": "Commonly for transforming a value or executing a small block on a non-null receiver via `value?.let`. Avoid using it when an ordinary local variable or `if` reads more clearly.",
    "category": "kotlin"
  },
  {
    "id": "fc-031",
    "question": "When is `apply` useful?",
    "answer": "For configuring an object while returning that object, such as a builder-style initialization block. Inside the lambda the receiver is `this`.",
    "category": "kotlin"
  },
  {
    "id": "fc-032",
    "question": "What is delegation in Kotlin?",
    "answer": "The `by` syntax lets another object implement an interface or manage a property. It favors composition and powers property delegates such as `lazy`, observable properties, and saved-state delegates.",
    "category": "kotlin"
  },
  {
    "id": "fc-033",
    "question": "What is a value class?",
    "answer": "A `@JvmInline value class` wraps one value to provide type safety with fewer allocations in many compiled usages. Boxing can still occur with generics, nullable values, interfaces, or other runtime boundaries.",
    "category": "kotlin"
  },
  {
    "id": "fc-034",
    "question": "Does Kotlin have checked exceptions?",
    "answer": "No. Callers are not forced to declare or catch exceptions. APIs should still document failures and use domain result types when failure is expected and meaningful.",
    "category": "kotlin"
  },
  {
    "id": "fc-035",
    "question": "What are `@JvmStatic`, `@JvmField`, and `@JvmOverloads` for?",
    "answer": "They improve Java interoperability by exposing static-style methods, direct fields, or overloads for default parameters. They should be used for an actual Java-facing need, not by default.",
    "category": "kotlin"
  },
  {
    "id": "fc-036",
    "question": "What is a coroutine?",
    "answer": "A coroutine is a cooperatively scheduled computation that can suspend without blocking its underlying thread. It is cheaper than a thread, but it still executes on threads chosen by its dispatcher.",
    "category": "coroutines"
  },
  {
    "id": "fc-037",
    "question": "What does `suspend` mean?",
    "answer": "A suspending function may pause and later resume without blocking its thread. `suspend` does not automatically move work off the main thread and does not itself create a coroutine.",
    "category": "coroutines"
  },
  {
    "id": "fc-038",
    "question": "What is structured concurrency?",
    "answer": "Child coroutines are tied to an owning scope, which waits for them and propagates cancellation and failures according to the job hierarchy. This prevents detached work and makes lifetimes predictable.",
    "category": "coroutines"
  },
  {
    "id": "fc-039",
    "question": "What is a `CoroutineScope`?",
    "answer": "It combines a `CoroutineContext` with lifecycle ownership for launched coroutines. Cancel the owning scope when its work is no longer valid.",
    "category": "coroutines"
  },
  {
    "id": "fc-040",
    "question": "What is a `CoroutineContext`?",
    "answer": "It is an indexed set of elements such as `Job`, dispatcher, coroutine name, and exception handler. New context elements replace elements with the same key.",
    "category": "coroutines"
  },
  {
    "id": "fc-041",
    "question": "What is a `Job`?",
    "answer": "A `Job` represents a cancellable coroutine lifecycle and can have parent-child relationships. It moves through states such as active, cancelling, and completed.",
    "category": "coroutines"
  },
  {
    "id": "fc-042",
    "question": "What is the difference between `launch` and `async`?",
    "answer": "`launch` returns a `Job` and is used for work without a returned value. `async` returns a `Deferred<T>` whose result or exception is observed with `await`; use it when concurrency and a result are actually needed.",
    "category": "coroutines"
  },
  {
    "id": "fc-043",
    "question": "When should you use `withContext`?",
    "answer": "Use it to run a suspending block in a different context and return its result sequentially. It is usually clearer than `async().await()` when no parallelism is needed.",
    "category": "coroutines"
  },
  {
    "id": "fc-044",
    "question": "What are the standard dispatchers?",
    "answer": "`Main` is for UI work, `IO` for blocking I/O, `Default` for CPU-intensive work, and `Unconfined` starts in the caller and resumes according to the suspending function; `Unconfined` is rarely appropriate for application code.",
    "category": "coroutines"
  },
  {
    "id": "fc-045",
    "question": "What does main-safe mean?",
    "answer": "A public suspending function is main-safe when it can be called from the main thread without blocking it. The function that performs blocking work should move that work to an appropriate dispatcher.",
    "category": "coroutines"
  },
  {
    "id": "fc-046",
    "question": "What is the difference between `coroutineScope` and `supervisorScope`?",
    "answer": "In `coroutineScope`, one child failure cancels the scope and its siblings. In `supervisorScope`, a child failure does not automatically cancel sibling children, so failures must be handled deliberately.",
    "category": "coroutines"
  },
  {
    "id": "fc-047",
    "question": "What is a `SupervisorJob`?",
    "answer": "It changes downward failure propagation so one child failure does not cancel sibling children. Parent cancellation still cancels all children.",
    "category": "coroutines"
  },
  {
    "id": "fc-048",
    "question": "How do exceptions propagate from `launch`?",
    "answer": "A root `launch` treats an uncaught exception as unhandled, while a child normally propagates failure to its parent and cancels siblings. Catch expected exceptions near the operation or isolate children with supervision.",
    "category": "coroutines"
  },
  {
    "id": "fc-049",
    "question": "How do exceptions propagate from `async`?",
    "answer": "The exception is stored in the `Deferred` and rethrown by `await`, but a child `async` can still fail its parent immediately through structured concurrency. Not awaiting is not a safe way to ignore failure.",
    "category": "coroutines"
  },
  {
    "id": "fc-050",
    "question": "What is `CoroutineExceptionHandler` for?",
    "answer": "It handles otherwise uncaught exceptions in root coroutines and does not replace normal `try/catch`. It cannot recover a failed child or generally catch exceptions merely by being placed on that child.",
    "category": "coroutines"
  },
  {
    "id": "fc-051",
    "question": "How does coroutine cancellation work?",
    "answer": "Cancellation is cooperative and usually delivered as `CancellationException`. Suspending functions check cancellation; CPU loops should call `ensureActive`, `yield`, or otherwise check job state.",
    "category": "coroutines"
  },
  {
    "id": "fc-052",
    "question": "Why should `CancellationException` usually be rethrown?",
    "answer": "It signals normal cancellation. Swallowing it can let obsolete work continue and break structured concurrency; broad catches should rethrow it before handling other failures.",
    "category": "coroutines"
  },
  {
    "id": "fc-053",
    "question": "What is the difference between `delay` and `Thread.sleep`?",
    "answer": "`delay` suspends the coroutine and releases the thread; `Thread.sleep` blocks the thread. Blocking the main thread freezes UI work and can cause ANRs.",
    "category": "coroutines"
  },
  {
    "id": "fc-054",
    "question": "When should `NonCancellable` be used?",
    "answer": "Only for a small, essential cleanup operation in `finally` that must suspend after cancellation. Large non-cancellable blocks make cancellation unresponsive.",
    "category": "coroutines"
  },
  {
    "id": "fc-055",
    "question": "What does `runBlocking` do?",
    "answer": "It starts a coroutine and blocks the current thread until completion. It is useful at synchronous boundaries such as tests or command-line entry points, but it should not be used on Android's main thread.",
    "category": "coroutines"
  },
  {
    "id": "fc-056",
    "question": "Why avoid `GlobalScope`?",
    "answer": "Its work is not owned by an application lifecycle, making cancellation, testing, and error handling difficult. Use an injected application scope only for truly application-wide work.",
    "category": "coroutines"
  },
  {
    "id": "fc-057",
    "question": "What is `viewModelScope`?",
    "answer": "A scope owned by a `ViewModel` and cancelled when that ViewModel is cleared. It is appropriate for work that should survive configuration changes but stop when the screen's ViewModel is discarded.",
    "category": "coroutines"
  },
  {
    "id": "fc-058",
    "question": "What is `lifecycleScope`?",
    "answer": "A scope owned by a `LifecycleOwner` and cancelled when its lifecycle is destroyed. For repeating UI collection, combine it with lifecycle-aware APIs rather than launching an always-active collector.",
    "category": "coroutines"
  },
  {
    "id": "fc-059",
    "question": "Why use `repeatOnLifecycle`?",
    "answer": "It starts the block when the lifecycle reaches a target state, cancels it when below that state, and repeats as the lifecycle changes. This prevents invisible UI from continuing to collect and update.",
    "category": "coroutines"
  },
  {
    "id": "fc-060",
    "question": "How do you run independent suspending operations concurrently?",
    "answer": "Start them with `async` inside a structured scope and call `await` or `awaitAll`. Do not use concurrency when operations depend on each other or when it overloads a downstream service.",
    "category": "coroutines"
  },
  {
    "id": "fc-061",
    "question": "How should shared mutable state be protected in coroutines?",
    "answer": "Prefer confinement or immutable state. When mutation truly is shared, use tools such as `Mutex`, actors/channels, or atomic operations based on the access pattern.",
    "category": "coroutines"
  },
  {
    "id": "fc-062",
    "question": "Why can `synchronized` be problematic around suspending code?",
    "answer": "A monitor is thread-blocking and must never be held across suspension. `Mutex` suspends waiters instead of blocking threads, though it is not automatically the right choice for every state design.",
    "category": "coroutines"
  },
  {
    "id": "fc-063",
    "question": "What is a race condition?",
    "answer": "The result depends on nondeterministic timing between concurrent operations accessing shared state. Prevent it through ownership, immutability, atomicity, serialization, or appropriate synchronization.",
    "category": "coroutines"
  },
  {
    "id": "fc-064",
    "question": "How do you convert a one-shot callback to a suspending function?",
    "answer": "Use `suspendCancellableCoroutine`, resume exactly once, propagate errors, and unregister or cancel the callback resource when the coroutine is cancelled.",
    "category": "coroutines"
  },
  {
    "id": "fc-065",
    "question": "How should coroutine code be tested?",
    "answer": "Inject dispatchers or abstractions, use `runTest`, control a test scheduler, and avoid real delays. Assert emitted state, cancellation, and failure behavior rather than implementation timing.",
    "category": "coroutines"
  },
  {
    "id": "fc-066",
    "question": "What is a Kotlin `Flow`?",
    "answer": "An asynchronous stream that emits values sequentially. A regular flow is cold: its producer starts separately for each collector.",
    "category": "flow"
  },
  {
    "id": "fc-067",
    "question": "What is the difference between intermediate and terminal Flow operators?",
    "answer": "Intermediate operators such as `map` and `filter` build a new flow and remain lazy. Terminal operators such as `collect`, `first`, and `toList` trigger collection.",
    "category": "flow"
  },
  {
    "id": "fc-068",
    "question": "What does `flowOn` change?",
    "answer": "It changes the context of upstream flow execution while downstream collection remains in the collector's context. It does not simply switch the entire pipeline.",
    "category": "flow"
  },
  {
    "id": "fc-069",
    "question": "How should Flow exceptions be handled?",
    "answer": "`catch` handles exceptions thrown upstream of it, not failures in downstream collection. Cancellation should not be converted into ordinary error state.",
    "category": "flow"
  },
  {
    "id": "fc-070",
    "question": "What is the difference between `retry` and `retryWhen`?",
    "answer": "Both retry upstream collection after failures; `retryWhen` can inspect the cause and attempt count and can suspend. Retry only transient failures and apply limits and backoff.",
    "category": "flow"
  },
  {
    "id": "fc-071",
    "question": "What is `StateFlow`?",
    "answer": "A hot, state-holding flow with a required current value. It replays the latest value to new collectors and conflates updates using equality, making it suitable for observable UI state.",
    "category": "flow"
  },
  {
    "id": "fc-072",
    "question": "What is `SharedFlow`?",
    "answer": "A configurable hot broadcast flow with replay and buffering options but no required current value. It is useful for sharing emissions among multiple collectors.",
    "category": "flow"
  },
  {
    "id": "fc-073",
    "question": "StateFlow or SharedFlow for UI state?",
    "answer": "Prefer `StateFlow` for durable state a new collector must immediately render. Use `SharedFlow` selectively for broadcasts; model important user-visible outcomes as state when they must survive collector restarts.",
    "category": "flow"
  },
  {
    "id": "fc-074",
    "question": "What do `stateIn` and `shareIn` do?",
    "answer": "They convert a cold flow into a shared hot flow within a supplied scope. `stateIn` exposes a `StateFlow` and needs an initial or first value; both require a deliberate sharing policy.",
    "category": "flow"
  },
  {
    "id": "fc-075",
    "question": "What is `SharingStarted.WhileSubscribed` useful for?",
    "answer": "It keeps upstream active while subscribers exist and can use a stop timeout to tolerate brief configuration changes. Choose its behavior based on cost, freshness, and ownership.",
    "category": "flow"
  },
  {
    "id": "fc-076",
    "question": "What is the difference between `combine` and `zip`?",
    "answer": "`combine` emits whenever either upstream changes after both have produced a value, using the latest pair. `zip` pairs corresponding emissions and waits for each side.",
    "category": "flow"
  },
  {
    "id": "fc-077",
    "question": "What is the difference between `flatMapConcat`, `flatMapMerge`, and `flatMapLatest`?",
    "answer": "`flatMapConcat` processes inner flows sequentially, `flatMapMerge` collects them concurrently, and `flatMapLatest` cancels the previous inner flow when a new value arrives.",
    "category": "flow"
  },
  {
    "id": "fc-078",
    "question": "Why is `flatMapLatest` useful for search?",
    "answer": "A new query cancels collection of the previous query's result flow, preventing stale results from winning. It is commonly combined with `debounce` and `distinctUntilChanged`.",
    "category": "flow"
  },
  {
    "id": "fc-079",
    "question": "What is the difference between `collect` and `collectLatest`?",
    "answer": "`collect` completes handling every emission sequentially. `collectLatest` cancels the previous collector block when a new value arrives.",
    "category": "flow"
  },
  {
    "id": "fc-080",
    "question": "What do `buffer` and `conflate` do?",
    "answer": "`buffer` allows producer and collector to run more independently with queued values. `conflate` skips intermediate values when the collector is slow and only makes sense when the latest state matters most.",
    "category": "flow"
  },
  {
    "id": "fc-081",
    "question": "When should `callbackFlow` be used?",
    "answer": "To adapt a multi-shot callback API into a Flow. Register the callback, use `trySend`, and call `awaitClose` to unregister resources on completion or cancellation.",
    "category": "flow"
  },
  {
    "id": "fc-082",
    "question": "How should Flow be exposed from a ViewModel?",
    "answer": "Keep mutable flow private and expose an immutable `StateFlow` or `SharedFlow`. Build screen state in the ViewModel, then collect it lifecycle-aware in the UI.",
    "category": "flow"
  },
  {
    "id": "fc-083",
    "question": "What are Android's four core app components?",
    "answer": "Activities, services, broadcast receivers, and content providers. The system can create these entry points, so they must be declared and secured appropriately.",
    "category": "framework"
  },
  {
    "id": "fc-084",
    "question": "What is `Context`?",
    "answer": "A handle to application environment and services used for resources, starting components, storage, and system APIs. Use the narrowest correctly scoped context and avoid retaining an Activity context beyond its lifecycle.",
    "category": "framework"
  },
  {
    "id": "fc-085",
    "question": "Application context or Activity context?",
    "answer": "Application context lives with the process and is suitable for app-scoped dependencies. Activity context is theme- and window-aware and is required for many UI operations, but retaining it can leak the Activity.",
    "category": "framework"
  },
  {
    "id": "fc-086",
    "question": "What is the `Application` class for?",
    "answer": "Process-level initialization and application context. Keep startup work minimal because `onCreate` runs on the main thread and the process may exist without any visible Activity.",
    "category": "framework"
  },
  {
    "id": "fc-087",
    "question": "What is an Activity?",
    "answer": "A system-managed application component representing a user-facing entry point and window. Its lifecycle is not a durable place to store application data.",
    "category": "framework"
  },
  {
    "id": "fc-088",
    "question": "What are the major Activity lifecycle callbacks?",
    "answer": "`onCreate`, `onStart`, `onResume`, then `onPause`, `onStop`, and possibly `onDestroy`. Design must not depend on `onDestroy` being called before process termination.",
    "category": "framework"
  },
  {
    "id": "fc-089",
    "question": "What is the difference between `onCreate` and `onStart`?",
    "answer": "`onCreate` performs one-time setup for that Activity instance and restores state. `onStart` means the Activity is becoming visible and may run repeatedly as visibility changes.",
    "category": "framework"
  },
  {
    "id": "fc-090",
    "question": "Can Android kill a process without calling `onDestroy`?",
    "answer": "Yes. The OS can terminate the process to reclaim resources, so `onDestroy` is not a persistence or guaranteed-cleanup callback.",
    "category": "framework"
  },
  {
    "id": "fc-091",
    "question": "What is a configuration change?",
    "answer": "A runtime environment change such as rotation, locale, or window size that may recreate UI components. Preserve durable screen state outside the Activity and make layouts adaptive.",
    "category": "framework"
  },
  {
    "id": "fc-092",
    "question": "What is the difference between configuration change and process death?",
    "answer": "During configuration change, in-memory owners such as a ViewModel may survive recreation. After process death, memory is gone, so restoration requires saved state or persistent storage.",
    "category": "framework"
  },
  {
    "id": "fc-093",
    "question": "ViewModel, saved instance state, or database?",
    "answer": "Use ViewModel for screen state across recreation, saved state for small reconstructable values across process death, and persistent storage for durable application data.",
    "category": "framework"
  },
  {
    "id": "fc-094",
    "question": "What is a Fragment?",
    "answer": "A reusable controller with its own lifecycle that is hosted by an Activity and commonly owns a view or Compose content. Its instance lifecycle and view lifecycle are separate.",
    "category": "framework"
  },
  {
    "id": "fc-095",
    "question": "Why observe view-related state with a Fragment's `viewLifecycleOwner`?",
    "answer": "The Fragment may outlive its destroyed view. Binding observers to the view lifecycle prevents updates to stale views and related leaks.",
    "category": "framework"
  },
  {
    "id": "fc-096",
    "question": "Why should Fragment arguments be used instead of custom constructors?",
    "answer": "The system may recreate a Fragment using its default constructor. Arguments in a `Bundle` can be restored and are available to the recreated instance.",
    "category": "framework"
  },
  {
    "id": "fc-097",
    "question": "What is an Intent?",
    "answer": "A message describing an action to perform, optionally with data, categories, component, flags, and extras. Explicit intents name the target; implicit intents let the system resolve capable components.",
    "category": "framework"
  },
  {
    "id": "fc-098",
    "question": "What is an intent filter?",
    "answer": "A manifest declaration describing which implicit intents a component accepts. Exported components and filters must be reviewed as security boundaries.",
    "category": "framework"
  },
  {
    "id": "fc-099",
    "question": "What are tasks and the back stack?",
    "answer": "A task is a collection of activities arranged in a stack representing a user journey. Launch modes and intent flags can change instance creation and stack behavior.",
    "category": "framework"
  },
  {
    "id": "fc-100",
    "question": "When should special Activity launch modes be used?",
    "answer": "Only when the product navigation truly requires their task semantics. They can create surprising intent delivery and back-stack behavior, so default `standard` is usually safest.",
    "category": "framework"
  },
  {
    "id": "fc-101",
    "question": "What is a Service, and does it create a background thread?",
    "answer": "A Service is a component for work without a UI, but it runs on the app's main thread by default. It must explicitly use asynchronous execution for long work.",
    "category": "framework"
  },
  {
    "id": "fc-102",
    "question": "What is a foreground service?",
    "answer": "A service for user-noticeable work that must continue immediately, accompanied by a persistent notification and a declared service type when required. Platform restrictions limit when it can start.",
    "category": "framework"
  },
  {
    "id": "fc-103",
    "question": "What is a BroadcastReceiver?",
    "answer": "A short-lived component that reacts to broadcast events. Keep `onReceive` brief; schedule suitable work when processing must continue.",
    "category": "framework"
  },
  {
    "id": "fc-104",
    "question": "What is a ContentProvider?",
    "answer": "A component that exposes structured data through content URIs and a standard CRUD interface, often for controlled inter-app sharing. Permissions and URI grants protect access.",
    "category": "framework"
  },
  {
    "id": "fc-105",
    "question": "What are `Looper`, `MessageQueue`, and `Handler`?",
    "answer": "A Looper processes a thread's MessageQueue; a Handler posts messages and runnables to that queue. The main thread owns the main Looper used for UI work.",
    "category": "framework"
  },
  {
    "id": "fc-106",
    "question": "What is an ANR?",
    "answer": "The system reports an Application Not Responding condition when the main thread or another critical component cannot respond within platform time limits. Prevent it by keeping callbacks short and investigating blocking I/O, locks, and expensive computation.",
    "category": "framework"
  },
  {
    "id": "fc-107",
    "question": "Why should exact ANR timeout numbers be used cautiously in interview answers?",
    "answer": "Thresholds vary by component and platform behavior. The senior answer focuses on main-thread responsiveness, traces, and the operation causing the stall rather than memorizing one number.",
    "category": "framework"
  },
  {
    "id": "fc-108",
    "question": "How does Android isolate apps?",
    "answer": "Each app normally runs under its own Linux UID and sandbox, with private files protected by filesystem permissions. IPC, exported components, permissions, and shared storage intentionally cross that boundary.",
    "category": "framework"
  },
  {
    "id": "fc-109",
    "question": "What is Binder?",
    "answer": "Android's core IPC mechanism for calling across process boundaries using marshalled data and Binder threads. AIDL generates typed Binder interfaces when direct cross-process APIs are required.",
    "category": "framework"
  },
  {
    "id": "fc-110",
    "question": "What is package visibility?",
    "answer": "Modern Android limits which installed apps an app can query. Declare only necessary visibility in the manifest and avoid broad package discovery.",
    "category": "framework"
  },
  {
    "id": "fc-111",
    "question": "What is the difference between deep links and Android App Links?",
    "answer": "Deep links route URIs into an app but may show a chooser. App Links use verified HTTPS domain association so supported links can open directly in the trusted app.",
    "category": "framework"
  },
  {
    "id": "fc-112",
    "question": "What are runtime permissions?",
    "answer": "Dangerous permissions requested while the app runs. Ask in context, explain value, handle denial and revocation, and degrade gracefully rather than assuming permanent access.",
    "category": "framework"
  },
  {
    "id": "fc-113",
    "question": "What is process importance?",
    "answer": "Android ranks processes based on active components and user visibility when reclaiming memory. Apps must tolerate process termination instead of trying to remain alive unnecessarily.",
    "category": "framework"
  },
  {
    "id": "fc-114",
    "question": "What does declarative UI mean in Compose?",
    "answer": "UI is described as a function of state. When observed state changes, Compose schedules recomposition to produce the new UI instead of manually mutating view objects.",
    "category": "compose"
  },
  {
    "id": "fc-115",
    "question": "What is composition?",
    "answer": "The process of running composable functions and recording the UI tree and dependencies. The recorded structure is updated by later recompositions.",
    "category": "compose"
  },
  {
    "id": "fc-116",
    "question": "What is recomposition?",
    "answer": "Re-executing affected composable functions after observed state changes. Recomposition can happen often and out of order, so composables should be fast and free of uncontrolled side effects.",
    "category": "compose"
  },
  {
    "id": "fc-117",
    "question": "What causes a composable to recompose?",
    "answer": "Reading Compose-observable state creates a dependency. When that state changes, scopes that read it may be invalidated and scheduled for recomposition.",
    "category": "compose"
  },
  {
    "id": "fc-118",
    "question": "What does `remember` do?",
    "answer": "It stores a value in the composition across recompositions at that call position. It does not inherently survive removal from composition, configuration changes, or process death.",
    "category": "compose"
  },
  {
    "id": "fc-119",
    "question": "What does `rememberSaveable` do?",
    "answer": "It saves compatible UI state through the saved-state mechanism so it can survive recreation and process death. It is not durable application storage and saved values should remain small.",
    "category": "compose"
  },
  {
    "id": "fc-120",
    "question": "What is state hoisting?",
    "answer": "Moving state to a caller and exposing `value` plus events such as `onValueChange`. It produces reusable stateless components and establishes a clear source of truth.",
    "category": "compose"
  },
  {
    "id": "fc-121",
    "question": "Stateful or stateless composable?",
    "answer": "A stateful composable owns state and is convenient at an ownership boundary. A stateless composable receives state and events, making it easier to reuse, preview, and test.",
    "category": "compose"
  },
  {
    "id": "fc-122",
    "question": "What is unidirectional data flow in Compose?",
    "answer": "State flows down into composables and events flow upward to the owner that changes state. This improves consistency and makes state transitions easier to reason about.",
    "category": "compose"
  },
  {
    "id": "fc-123",
    "question": "What is stability in Compose?",
    "answer": "Stability tells Compose whether values can be assumed unchanged or reliably observed. Stable parameters can allow eligible composable calls to be skipped, but correct state modeling matters more than adding annotations blindly.",
    "category": "compose"
  },
  {
    "id": "fc-124",
    "question": "Why can mutable collections cause stale Compose UI?",
    "answer": "Mutating an ordinary collection does not notify Compose. Expose observable immutable snapshots or use Compose-aware state so state replacement or mutation is tracked.",
    "category": "compose"
  },
  {
    "id": "fc-125",
    "question": "Why are keys important in lazy lists?",
    "answer": "Stable unique keys preserve item identity when positions change, helping Compose retain item state and animate or reuse nodes correctly. Index keys are unsafe for reorderable data.",
    "category": "compose"
  },
  {
    "id": "fc-126",
    "question": "What is `LaunchedEffect`?",
    "answer": "It launches a coroutine tied to the composition. When its keys change the old coroutine is cancelled and a new one starts; when it leaves composition it is cancelled.",
    "category": "compose"
  },
  {
    "id": "fc-127",
    "question": "What is `DisposableEffect`?",
    "answer": "It performs setup that requires synchronous cleanup, such as registering an observer. Its `onDispose` runs when keys change or the effect leaves composition.",
    "category": "compose"
  },
  {
    "id": "fc-128",
    "question": "What is `SideEffect`?",
    "answer": "It publishes Compose state to non-Compose code after a successful recomposition. It is not intended for suspending work.",
    "category": "compose"
  },
  {
    "id": "fc-129",
    "question": "What is `rememberCoroutineScope`?",
    "answer": "It returns a scope bound to that composition location, useful for launching work in response to events such as button clicks. The scope is cancelled when the call leaves composition.",
    "category": "compose"
  },
  {
    "id": "fc-130",
    "question": "What problem does `rememberUpdatedState` solve?",
    "answer": "It lets a long-lived effect access the latest changing value or callback without restarting the effect solely because that value changed.",
    "category": "compose"
  },
  {
    "id": "fc-131",
    "question": "When is `derivedStateOf` useful?",
    "answer": "When a derived value changes less frequently than its rapidly changing inputs and recomposition should depend on the derived result. It has overhead and is unnecessary for ordinary cheap expressions.",
    "category": "compose"
  },
  {
    "id": "fc-132",
    "question": "What does `snapshotFlow` do?",
    "answer": "It converts reads of Compose snapshot state into a cold Flow and emits when the observed result changes. It is useful for applying Flow operators to UI state changes.",
    "category": "compose"
  },
  {
    "id": "fc-133",
    "question": "How should Flow be collected in Compose on Android?",
    "answer": "Prefer `collectAsStateWithLifecycle` so collection follows the UI lifecycle. The ViewModel exposes state; the composable renders it and sends events back.",
    "category": "compose"
  },
  {
    "id": "fc-134",
    "question": "Why does Modifier order matter?",
    "answer": "Each modifier wraps or transforms the result of the previous chain, so `padding().clickable()` can behave differently from `clickable().padding()` in hit area, drawing, and layout.",
    "category": "compose"
  },
  {
    "id": "fc-135",
    "question": "What is `CompositionLocal` for?",
    "answer": "Providing tree-scoped implicit dependencies such as theming or framework services. Avoid using it as a service locator for ordinary screen dependencies because hidden dependencies hurt clarity and testing.",
    "category": "compose"
  },
  {
    "id": "fc-136",
    "question": "What are Compose's major phases?",
    "answer": "Composition determines what UI exists, layout measures and places it, and drawing renders pixels. Reading frequently changing state in a later phase can avoid unnecessary earlier-phase work.",
    "category": "compose"
  },
  {
    "id": "fc-137",
    "question": "How do you reduce unnecessary recomposition?",
    "answer": "Keep state near its owner, pass stable immutable values, use keys, defer rapidly changing reads when appropriate, and measure with tooling. Do not optimize based only on recomposition counts because recomposition may be cheap.",
    "category": "compose"
  },
  {
    "id": "fc-138",
    "question": "How do Compose and Views interoperate?",
    "answer": "Use `ComposeView` to host Compose in a View hierarchy and `AndroidView` to host a View inside Compose. Define state ownership and disposal carefully during incremental migration.",
    "category": "compose"
  },
  {
    "id": "fc-139",
    "question": "What are semantics in Compose?",
    "answer": "Metadata describing meaning and actions for accessibility and testing. Prefer meaningful labels, roles, state descriptions, and merged semantics rather than relying on visual structure.",
    "category": "compose"
  },
  {
    "id": "fc-140",
    "question": "When should `contentDescription` be null?",
    "answer": "For decorative images that add no information, so accessibility services do not announce noise. Meaningful controls and images need a localized description or other appropriate semantics.",
    "category": "compose"
  },
  {
    "id": "fc-141",
    "question": "How should navigation arguments be handled?",
    "answer": "Pass stable identifiers rather than large domain objects, retrieve data from the source of truth at the destination, and preserve navigation-related state through the appropriate saved-state owner.",
    "category": "compose"
  },
  {
    "id": "fc-142",
    "question": "What architecture does Android currently recommend?",
    "answer": "At minimum, a UI layer and data layer, with an optional domain layer when it reduces complexity or enables reuse. Use clear ownership, unidirectional data flow, coroutines/Flow, and dependency injection.",
    "category": "architecture"
  },
  {
    "id": "fc-143",
    "question": "What is separation of concerns?",
    "answer": "Giving components focused responsibilities and explicit boundaries. Activities and composables should coordinate and render rather than own persistence, networking, and business rules.",
    "category": "architecture"
  },
  {
    "id": "fc-144",
    "question": "What is a single source of truth?",
    "answer": "One owner is authoritative for a type of data and is the only place that mutates it. Other layers observe immutable representations and send operations back to the owner.",
    "category": "architecture"
  },
  {
    "id": "fc-145",
    "question": "What is the role of a ViewModel?",
    "answer": "It owns screen-level state and presentation logic across UI recreation. It should not hold Activity, Fragment, or View references and should not become a container for unrelated application responsibilities.",
    "category": "architecture"
  },
  {
    "id": "fc-146",
    "question": "What is a repository responsible for?",
    "answer": "Exposing domain-relevant data, coordinating data sources, resolving conflicts, centralizing mutations, and hiding storage and transport details from callers.",
    "category": "architecture"
  },
  {
    "id": "fc-147",
    "question": "When should a domain layer be added?",
    "answer": "When business logic is complex or reused across multiple ViewModels or entry points. Adding one use-case class for every trivial repository call creates ceremony without useful separation.",
    "category": "architecture"
  },
  {
    "id": "fc-148",
    "question": "What is MVVM in Android?",
    "answer": "The UI renders observable state and forwards events; the ViewModel prepares UI state and coordinates use cases or repositories; model/data components own application data. The exact boundaries matter more than the acronym.",
    "category": "architecture"
  },
  {
    "id": "fc-149",
    "question": "How does MVI differ from MVVM?",
    "answer": "MVI emphasizes explicit intents/events, a reducer-like state transition, and a single immutable state stream. MVVM can implement the same unidirectional principles without requiring a strict reducer for every screen.",
    "category": "architecture"
  },
  {
    "id": "fc-150",
    "question": "What does Clean Architecture mean in practice?",
    "answer": "Dependencies point toward stable business policy, and framework/data details implement interfaces at outer boundaries. Apply it proportionally; excessive layers and mappings can make a small app harder to change.",
    "category": "architecture"
  },
  {
    "id": "fc-151",
    "question": "Why use dependency injection?",
    "answer": "Objects receive dependencies rather than constructing them, making ownership explicit, centralizing configuration, and enabling replacement in tests. DI does not by itself guarantee good boundaries.",
    "category": "architecture"
  },
  {
    "id": "fc-152",
    "question": "What does Hilt provide?",
    "answer": "Compile-time generated dependency graphs integrated with Android component lifecycles. Scopes control instance lifetime; qualifiers distinguish bindings of the same type.",
    "category": "architecture"
  },
  {
    "id": "fc-153",
    "question": "What is the danger of an incorrectly scoped dependency?",
    "answer": "It may retain shorter-lived objects and leak them, or share mutable state more broadly than intended. Scope should match the actual owner and lifetime.",
    "category": "architecture"
  },
  {
    "id": "fc-154",
    "question": "When is modularization useful?",
    "answer": "When it improves ownership, build isolation, reuse, boundaries, or parallel development. Too many small modules add Gradle and navigation/API complexity without proportional value.",
    "category": "architecture"
  },
  {
    "id": "fc-155",
    "question": "What is offline-first architecture?",
    "answer": "The app reads from a local source of truth and synchronizes with remote sources. Writes, conflicts, freshness, retry, and user-visible sync state must be designed explicitly.",
    "category": "architecture"
  },
  {
    "id": "fc-156",
    "question": "Why is a database commonly the source of truth in offline-first apps?",
    "answer": "It provides durable, queryable state across process death and network loss. Network responses update the database, and UI observes database-backed streams.",
    "category": "architecture"
  },
  {
    "id": "fc-157",
    "question": "What are Room's three primary components?",
    "answer": "Entities define stored tables, DAOs define database operations, and the `RoomDatabase` provides the database and DAOs.",
    "category": "architecture"
  },
  {
    "id": "fc-158",
    "question": "Why use Room instead of raw SQLite?",
    "answer": "It adds compile-time query verification, mapping and annotation support, migration infrastructure, and integration with Kotlin coroutines and Flow while retaining SQLite capabilities.",
    "category": "architecture"
  },
  {
    "id": "fc-159",
    "question": "What is a Room migration?",
    "answer": "A deterministic schema transformation between released versions that preserves valid user data. Test migrations using real historical schemas rather than relying only on fresh installs.",
    "category": "architecture"
  },
  {
    "id": "fc-160",
    "question": "When should Room operations use a transaction?",
    "answer": "When multiple reads or writes must be atomic and observe a consistent database state. Transactions should be as small as practical to reduce contention.",
    "category": "architecture"
  },
  {
    "id": "fc-161",
    "question": "How does Room work with Flow?",
    "answer": "Observable DAO queries emit new results when relevant tables are invalidated. The Flow is typically cold and executes the query when collected.",
    "category": "architecture"
  },
  {
    "id": "fc-162",
    "question": "Room, DataStore, or files?",
    "answer": "Use Room for relational structured data and queries, DataStore for small preference or typed settings data, and files for stream-oriented or opaque content. Choose based on access patterns, not convenience alone.",
    "category": "architecture"
  },
  {
    "id": "fc-163",
    "question": "DataStore or SharedPreferences?",
    "answer": "DataStore provides asynchronous transactional updates through Flow and avoids blocking preference I/O patterns. SharedPreferences remains a legacy key-value API and does not provide the same consistency model.",
    "category": "architecture"
  },
  {
    "id": "fc-164",
    "question": "Parcelable or Serializable for Android component data?",
    "answer": "Parcelable is designed for Android IPC and Bundles and is typically more efficient; Serializable is Java reflection-based and simpler but less suitable for hot Android boundaries. Prefer small IDs over passing large objects.",
    "category": "architecture"
  },
  {
    "id": "fc-165",
    "question": "How should network errors be modeled?",
    "answer": "Distinguish transport, protocol, authentication, parsing, cancellation, and domain failures when the UI or retry policy treats them differently. Avoid collapsing every failure into a generic string.",
    "category": "architecture"
  },
  {
    "id": "fc-166",
    "question": "What makes a sync operation safe to retry?",
    "answer": "Idempotency or deduplication, stable operation identifiers, transactional local updates, bounded exponential backoff, and a conflict policy. Retrying blindly can duplicate writes or amplify outages.",
    "category": "architecture"
  },
  {
    "id": "fc-167",
    "question": "When should WorkManager be used?",
    "answer": "For deferrable persistent work that must eventually run despite app exits or process restarts and may require constraints. It is not a general replacement for every coroutine.",
    "category": "background"
  },
  {
    "id": "fc-168",
    "question": "How does WorkManager provide durable scheduling?",
    "answer": "It persists work specifications and delegates execution to platform schedulers while handling constraints and rescheduling. Exact execution time is not guaranteed.",
    "category": "background"
  },
  {
    "id": "fc-169",
    "question": "What should a Worker return on failure?",
    "answer": "`success` when complete, `retry` for a transient failure that should use backoff, and `failure` for a permanent failure. The operation should be idempotent because execution may be repeated.",
    "category": "background"
  },
  {
    "id": "fc-170",
    "question": "What is unique work?",
    "answer": "A named WorkManager chain with a policy controlling whether new work keeps, replaces, appends to, or updates existing work. It prevents accidental duplicate scheduling for the same logical job.",
    "category": "background"
  },
  {
    "id": "fc-171",
    "question": "WorkManager or foreground service?",
    "answer": "WorkManager is for deferrable guaranteed work; a foreground service is for immediate, ongoing, user-noticeable work that must not be interrupted and displays a notification.",
    "category": "background"
  },
  {
    "id": "fc-172",
    "question": "WorkManager or AlarmManager?",
    "answer": "WorkManager handles deferrable persistent work. AlarmManager is for user-facing or system-critical work that must occur at a particular time, with exact alarms reserved for justified cases.",
    "category": "background"
  },
  {
    "id": "fc-173",
    "question": "What is Doze?",
    "answer": "A power-saving state that defers background CPU and network work and batches maintenance. Use appropriate schedulers and high-priority messaging only for genuinely urgent user-visible needs.",
    "category": "background"
  },
  {
    "id": "fc-174",
    "question": "What is App Standby?",
    "answer": "The system limits background activity for apps the user has not recently used. Design refresh and sync around platform scheduling rather than continuous background execution.",
    "category": "background"
  },
  {
    "id": "fc-175",
    "question": "How should background sync handle unstable networks?",
    "answer": "Use a durable local source of truth, connectivity constraints when helpful, idempotent requests, backoff with jitter, resumability, and visible pending/error state.",
    "category": "background"
  },
  {
    "id": "fc-176",
    "question": "How should push notifications be handled?",
    "answer": "Treat the payload as untrusted input, keep processing short, use data identifiers rather than sensitive content, honor notification permission and channels, and route deep links through validated destinations.",
    "category": "background"
  },
  {
    "id": "fc-177",
    "question": "What is the difference between local and instrumented Android tests?",
    "answer": "Local tests run on the JVM and are fast but lack the real Android framework. Instrumented tests run on a device or emulator and are used for framework integration and end-to-end behavior.",
    "category": "engineering"
  },
  {
    "id": "fc-178",
    "question": "What should a ViewModel unit test verify?",
    "answer": "Initial state, event-to-state transitions, success and failure paths, cancellation, and interactions at architectural boundaries. Control coroutine dispatchers and time instead of waiting in real time.",
    "category": "engineering"
  },
  {
    "id": "fc-179",
    "question": "Fake or mock?",
    "answer": "A fake is a lightweight working implementation and often produces more realistic stateful tests. A mock verifies interactions and is useful at narrow boundaries but can couple tests to implementation details.",
    "category": "engineering"
  },
  {
    "id": "fc-180",
    "question": "What makes a test reliable?",
    "answer": "Deterministic inputs and time, controlled concurrency, isolated state, no arbitrary sleeps, clear assertions, and ownership of external dependencies such as network and storage.",
    "category": "engineering"
  },
  {
    "id": "fc-181",
    "question": "What does Espresso synchronize with?",
    "answer": "It waits for the main message queue and registered idling resources to become idle before interactions and assertions. Custom asynchronous work may require an idling strategy or a different test boundary.",
    "category": "engineering"
  },
  {
    "id": "fc-182",
    "question": "How are Compose UIs tested?",
    "answer": "Use semantics-based finders, actions, and assertions with the Compose test rule. Test user-visible behavior and accessibility semantics rather than implementation structure.",
    "category": "engineering"
  },
  {
    "id": "fc-183",
    "question": "What is a memory leak?",
    "answer": "An object remains strongly reachable after its useful lifetime, preventing garbage collection. Common Android causes include long-lived references to Activities, listeners not removed, callbacks, and incorrectly scoped dependencies.",
    "category": "engineering"
  },
  {
    "id": "fc-184",
    "question": "How do you investigate a memory leak?",
    "answer": "Reproduce it, inspect heap growth and retained-object paths with Memory Profiler or LeakCanary, identify the unexpected reference owner, fix lifecycle cleanup or scope, and verify again.",
    "category": "engineering"
  },
  {
    "id": "fc-185",
    "question": "Memory leak versus OOM?",
    "answer": "A leak is unintended retention; an OutOfMemoryError means allocation cannot be satisfied. Leaks can cause OOM, but large legitimate allocations or fragmentation can also exhaust memory.",
    "category": "engineering"
  },
  {
    "id": "fc-186",
    "question": "What commonly causes Android jank?",
    "answer": "Main-thread blocking, expensive composition/layout/draw work, excessive allocations, shader or bitmap cost, and missed frame deadlines. Measure traces before choosing an optimization.",
    "category": "engineering"
  },
  {
    "id": "fc-187",
    "question": "How should app startup be improved?",
    "answer": "Remove or defer unnecessary main-thread initialization, initialize lazily, inspect startup traces, and use baseline profiles where appropriate. Preserve correctness and first-use readiness.",
    "category": "engineering"
  },
  {
    "id": "fc-188",
    "question": "What are baseline profiles?",
    "answer": "Ahead-of-time compilation hints for important code paths, improving startup and runtime performance from first launch. They should be generated and validated against representative user journeys.",
    "category": "engineering"
  },
  {
    "id": "fc-189",
    "question": "What is R8?",
    "answer": "Android's code shrinker and optimizer; it can remove unused code/resources, optimize bytecode, and obfuscate names. Keep rules preserve code reached through reflection or other patterns R8 cannot infer.",
    "category": "engineering"
  },
  {
    "id": "fc-190",
    "question": "ProGuard or R8?",
    "answer": "R8 is the current Android shrinker and consumes ProGuard-style keep rules. ProGuard is often used colloquially to refer to those rules, but R8 performs the Android build optimization.",
    "category": "engineering"
  },
  {
    "id": "fc-191",
    "question": "Build type, product flavor, and build variant?",
    "answer": "A build type represents development/release behavior; a product flavor represents a product dimension; a build variant is their combination used to compile and package an artifact.",
    "category": "engineering"
  },
  {
    "id": "fc-192",
    "question": "What does Android lint do?",
    "answer": "Static analysis that detects Android correctness, performance, accessibility, security, and API-usage issues. Teams can add custom lint rules to enforce project-specific contracts.",
    "category": "engineering"
  },
  {
    "id": "fc-193",
    "question": "Why use Android App Bundles?",
    "answer": "An AAB is a publishing format from which Google Play generates optimized APKs for device configurations. Signing and release configuration still require careful protection.",
    "category": "engineering"
  },
  {
    "id": "fc-194",
    "question": "How should secrets be stored in an Android app?",
    "answer": "Assume anything shipped in the app can be extracted. Keep privileged secrets on a server; use Android Keystore for device-bound cryptographic keys and minimize sensitive local data.",
    "category": "engineering"
  },
  {
    "id": "fc-195",
    "question": "Does encryption alone secure local data?",
    "answer": "No. Key management, authentication, backup behavior, logs, screenshots, exported components, and rooted or compromised devices also matter. Start with a threat model.",
    "category": "engineering"
  },
  {
    "id": "fc-196",
    "question": "What protects network traffic?",
    "answer": "Use HTTPS/TLS, validate endpoints, avoid permissive trust managers, and use Network Security Configuration where appropriate. Certificate pinning adds operational risk and should only be used with a rotation and recovery plan.",
    "category": "engineering"
  },
  {
    "id": "fc-197",
    "question": "How does least privilege apply to Android?",
    "answer": "Request only necessary permissions, export only intended components, validate all IPC input, restrict URI grants, and limit stored data and dependency access.",
    "category": "engineering"
  },
  {
    "id": "fc-198",
    "question": "How do you protect an exported component?",
    "answer": "Explicitly decide whether it is exported, apply permissions when appropriate, validate caller-controlled intents and URIs, and never assume an external caller follows your UI flow.",
    "category": "engineering"
  },
  {
    "id": "fc-199",
    "question": "What is app signing responsible for?",
    "answer": "It establishes update identity and trust between installed versions. Protect signing keys, use Play App Signing appropriately, and never treat the debug key as a production credential.",
    "category": "engineering"
  },
  {
    "id": "fc-200",
    "question": "What should production observability include?",
    "answer": "Crash and ANR reporting, structured non-sensitive logs, performance traces, release/version context, and domain health signals. Alerts should connect symptoms to user impact and support rollback or mitigation.",
    "category": "engineering"
  },
  {
    "id": "fc-201",
    "question": "How should a senior engineer describe a production incident?",
    "answer": "State the user/business impact, detection signal, diagnosis, decision and trade-off, mitigation, verification, and prevention. Separate facts from assumptions and quantify the result when possible.",
    "category": "engineering"
  }
] satisfies readonly FlashcardText[];
