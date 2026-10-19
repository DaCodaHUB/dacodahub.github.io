import type { CodeCompletionChallenge } from './types.ts';
import { kotlin, rubric, source } from './authoring.ts';
import { references as r } from './references.ts';

export const codeCompletions = [
  {
    id: 'acc-001', type: 'code-completion', title: 'Validate an optional display name at the boundary', topic: 'kotlin', difficulty: 'Junior', estimatedMinutes: 6,
    prompt: 'Fill the expression so null, empty and whitespace-only input returns Guest; otherwise return the trimmed input. Use the supplied safe-call and Elvis structure.',
    assumptions: ['Blank input is not an error.', 'The single blank must be one standard-library function call on the trimmed string.'],
    snippet: kotlin('Standalone function. Replace the named comment marker with an expression.', `fun displayName(raw: String?): String =
    raw?.trim()?./*BLANK:NONBLANK*/ ?: "Guest"`),
    blanks: [{ id: 'NONBLANK', instruction: 'Keep only a nonblank trimmed string.', acceptedAnswers: ['takeIf { it.isNotBlank() }', 'takeUnless { it.isBlank() }'], explanation: 'The predicate returns null for the empty trimmed result so Elvis selects Guest.', commonIncorrectAnswers: [{ answer: 'toString()', reason: 'An empty string remains non-null and bypasses the fallback.' }] }],
    referenceAnswer: 'Use takeIf { it.isNotBlank() } (or takeUnless { it.isBlank() }). Examples: null -> Guest; spaces -> Guest; " Ada " -> Ada.',
    explanation: 'Safe calls propagate null; trim alone does not turn a blank value into null. The predicate supplies the missing validation step.',
    rubric: rubric(['Predicate', 'Rejects blank trimmed strings.'], ['Null handling', 'Preserves safe calls and the Elvis fallback.'], ['Examples', 'Checks null, blank and a padded valid name.']),
    references: [r.nullSafety, r.scopeFunctions], followUps: ['Would rejecting blank input with an error be a better contract for an account form?'],
    provenance: source([4, 6, 7, 30], ['kotlin-null-safety'], 'Original input contract and edge cases.'),
  },
  {
    id: 'acc-002', type: 'code-completion', title: 'A producer can serve a wider animal consumer', topic: 'kotlin', difficulty: 'Junior', estimatedMinutes: 8,
    prompt: 'Insert exactly one declaration-site variance keyword so a Source<Cat> can be assigned to Source<Animal>. Keep the interface API unchanged.',
    assumptions: ['Source only produces T.', 'No unsafe casts or star projections are allowed.'],
    snippet: kotlin('Complete standalone program after replacing the marker.', `open class Animal
class Cat : Animal()
interface Source</*BLANK:VARIANCE*/ T> { fun next(): T }
fun main() {
    val cats: Source<Cat> = object : Source<Cat> { override fun next() = Cat() }
    val animals: Source<Animal> = cats
    check(animals.next() is Cat)
}`),
    blanks: [{ id: 'VARIANCE', instruction: 'Make the producer covariant.', acceptedAnswers: ['out'], explanation: 'A source of a subtype can safely produce values for a supertype consumer.', commonIncorrectAnswers: [{ answer: 'in', reason: 'Contravariance is for consuming T and conflicts with returning T here.' }] }],
    referenceAnswer: 'out T permits the demonstrated subtype-to-supertype source assignment.', explanation: 'The return-only constraint makes covariance sound. Adding a method accepting T would require a different API rather than suppressing the variance error.',
    rubric: rubric(['Keyword', 'Selects out.'], ['Safety', 'Explains why every returned Cat is an Animal.'], ['API evolution', 'Recognizes that consuming T changes the variance constraints.']),
    references: [r.generics], followUps: ['Which direction is safe for a Sink<in T>?'],
    provenance: source([25], ['kotlin-generics'], 'Original producer assignment and check.'),
  },
  {
    id: 'acc-003', type: 'code-completion', title: 'Parallel dependencies with a shared lifetime', topic: 'coroutines', difficulty: 'Mid', estimatedMinutes: 10,
    prompt: 'Start both suspend reads concurrently, return their paired results, and cancel siblings if one fails. Replace the scope builder and both terminal operations.',
    assumptions: ['Both operations are main-safe and cooperate with cancellation.', 'Partial success is not acceptable.'],
    snippet: kotlin('Complete suspend function after substitution.', `import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
suspend fun loadPair(a: suspend () -> String, b: suspend () -> Int): Pair<String, Int> =
    /*BLANK:SCOPE*/ {
        val first = async { a() }
        val second = async { b() }
        Pair(first./*BLANK:FIRST*/, second./*BLANK:SECOND*/)
    }`, ['kotlinx-coroutines-core']),
    blanks: [
      { id: 'SCOPE', instruction: 'Use the imported structured scope builder.', acceptedAnswers: ['coroutineScope'], explanation: 'This scope owns the children and fails the operation together.', commonIncorrectAnswers: [{ answer: 'supervisorScope', reason: 'It changes sibling-failure policy and is not imported or desired here.' }] },
      { id: 'FIRST', instruction: 'Read the Deferred<String> result.', acceptedAnswers: ['await()'], explanation: 'await returns the value rather than just waiting for completion.', commonIncorrectAnswers: [{ answer: 'join()', reason: 'join returns Unit and cannot supply the String.' }] },
      { id: 'SECOND', instruction: 'Read the Deferred<Int> result.', acceptedAnswers: ['await()'], explanation: 'Both async calls have started before either await.', commonIncorrectAnswers: [] },
    ],
    referenceAnswer: 'coroutineScope; await(); await(). Start both async children before waiting on either.', explanation: 'Concurrent start is preserved even though result retrieval is written sequentially. Launching detached work would violate caller lifetime and failure requirements.',
    rubric: rubric(['Structured scope', 'Uses coroutineScope and no detached Job.'], ['Results', 'Awaits both Deferred values.'], ['Failure model', 'Explains sibling cancellation and cooperative cleanup.']),
    references: [r.concurrent], followUps: ['How would a deliberate partial-success design differ?'],
    provenance: source([38, 42, 46, 60], ['concurrency-structured'], 'Original typed pair-loading contract.'),
  },
  {
    id: 'acc-004', type: 'code-completion', title: 'Keep a CPU loop cancellable', topic: 'coroutines', difficulty: 'Mid', estimatedMinutes: 8,
    prompt: 'Insert the imported coroutine cancellation check so cancelling the caller can stop this non-suspending loop. Do not add a delay or allocate a coroutine per element.',
    assumptions: ['The caller already runs CPU work on a suitable dispatcher.', 'Each arithmetic step is bounded; overflow is intentionally not relevant to these test inputs.'],
    snippet: kotlin('Complete suspend function after substitution.', `import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
suspend fun sum(values: LongArray): Long {
    var total = 0L
    for (value in values) {
        currentCoroutineContext()./*BLANK:CHECK*/
        total += value
    }
    return total
}`, ['kotlinx-coroutines-core']),
    blanks: [{ id: 'CHECK', instruction: 'Throw on cancellation using the imported context extension.', acceptedAnswers: ['ensureActive()'], explanation: 'ensureActive checks Job cancellation without adding an artificial timed wait.', commonIncorrectAnswers: [{ answer: 'isActive', reason: 'Reading and ignoring a Boolean does not stop the loop.' }] }],
    referenceAnswer: 'ensureActive(). A production hot loop may check every bounded chunk after measuring responsiveness and overhead.', explanation: 'Cancellation is cooperative. This check does not move CPU work off Main, which the assumptions assign to the caller.',
    rubric: rubric(['Correct check', 'Invokes ensureActive.'], ['Propagation', 'Does not catch and ignore cancellation.'], ['Cost', 'Discusses bounded chunks without promising immediate preemption.']),
    references: [r.cancellation], followUps: ['How would you choose a chunk size from a cancellation-latency budget?'],
    provenance: source([44, 51, 53], ['concurrency-cancellation'], 'Original cancellable numerical loop.'),
  },
  {
    id: 'acc-005', type: 'code-completion', title: 'Only the latest search should remain subscribed', topic: 'flow', difficulty: 'Mid', estimatedMinutes: 10,
    prompt: 'Insert the imported Flow operator that cancels the previous result collection when a new query arrives. Leave the 300 ms debounce and repository contract unchanged.',
    assumptions: ['search returns a cold Flow whose operations cooperate with cancellation.', 'Opt-in annotations are included explicitly for versions where these operators require them.'],
    snippet: kotlin('Complete stream builder after substitution.', `import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.*
@OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
fun results(queries: Flow<String>, search: (String) -> Flow<List<String>>): Flow<List<String>> =
    queries.debounce(300).distinctUntilChanged()./*BLANK:SWITCH*/ { search(it) }`, ['kotlinx-coroutines-core']),
    blanks: [{ id: 'SWITCH', instruction: 'Use the latest-switching flattening operator.', acceptedAnswers: ['flatMapLatest'], explanation: 'A new query cancels collection of the previously produced flow.', commonIncorrectAnswers: [{ answer: 'flatMapConcat', reason: 'It queues query flows rather than cancelling obsolete collection.' }, { answer: 'flatMapMerge', reason: 'It permits older and newer query results concurrently.' }] }],
    referenceAnswer: 'flatMapLatest. The repository must honor cancellation; this is not a guarantee that a remote server stops work.', explanation: 'Debounce limits bursts while latest switching controls obsolete subscriptions. Server-side execution and local coroutine cancellation are separate boundaries.',
    rubric: rubric(['Operator', 'Uses flatMapLatest.'], ['Cancellation', 'Describes replacement of the prior inner collection.'], ['Limits', 'Does not claim debounce or cancellation prevents all server requests.']),
    references: [r.flow], followUps: ['How would you show cached results while the new query loads?'],
    provenance: source([77, 78], ['concurrency-flow'], 'Original repository stream and explicit replacement policy.'),
  },
  {
    id: 'acc-006', type: 'code-completion', title: 'Restore a small draft through SavedStateHandle', topic: 'lifecycle', difficulty: 'Junior', estimatedMinutes: 8,
    prompt: 'Complete the handle access so the draft uses a StateFlow and writes back under the same key. The default for a new task is an empty string.',
    assumptions: ['The ViewModel is created by the normal saved-state-aware factory.', 'The draft is small and saved-state restoration is available; durable document storage is separate.'],
    snippet: kotlin('Complete ViewModel declaration after substitution.', `import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
class DraftVm(private val saved: SavedStateHandle) : ViewModel() {
    val draft = saved./*BLANK:READ*/("draft", "")
    fun edit(text: String) { saved[/*BLANK:KEY*/] = text }
}`, ['androidx.lifecycle:lifecycle-viewmodel-savedstate']),
    blanks: [
      { id: 'READ', instruction: 'Use the SavedStateHandle StateFlow getter with an explicit String type.', acceptedAnswers: ['getStateFlow<String>'], explanation: 'It returns state connected to the saved-state key.', commonIncorrectAnswers: [{ answer: 'get<String>', reason: 'It returns a nullable value, not the required StateFlow with initial value.' }] },
      { id: 'KEY', instruction: 'Write to the exact key used above.', acceptedAnswers: ['"draft"'], explanation: 'The same key updates the observable saved-state value.', commonIncorrectAnswers: [] },
    ],
    referenceAnswer: 'getStateFlow<String>; "draft".', explanation: 'Saved state can restore small UI values after system recreation when the task is restored. It is not a guarantee across force-stop, explicit task dismissal or an arbitrary crash before saving.',
    rubric: rubric(['Read API', 'Uses the StateFlow getter and empty initial value.'], ['Write key', 'Updates the matching key.'], ['Lifetime', 'Distinguishes saved state from durable persistence.']),
    references: [r.savedState], followUps: ['Where would an unsent long-form document be stored?'],
    provenance: source([92, 93], ['platform-process-death'], 'Original small-draft restoration API exercise.'),
  },
  {
    id: 'acc-007', type: 'code-completion', title: 'A timeout calls the newest callback without restarting', topic: 'compose', difficulty: 'Mid', estimatedMinutes: 10,
    prompt: 'The timeout must start once per composition entry, yet invoke the latest onTimeout callback. Fill only the state wrapper and the value invoked after the delay.',
    assumptions: ['Changing the callback must not restart the timer.', 'Leaving composition cancels the timer.'],
    snippet: kotlin('Complete composable after substitution.', `import androidx.compose.runtime.*
import kotlinx.coroutines.delay
@Composable fun Timeout(onTimeout: () -> Unit) {
    val current by /*BLANK:LATEST*/(onTimeout)
    LaunchedEffect(Unit) {
        delay(3_000)
        /*BLANK:INVOKE*/()
    }
}`, ['androidx.compose.runtime:runtime', 'kotlinx-coroutines-core']),
    blanks: [
      { id: 'LATEST', instruction: 'Keep the latest callback without changing the effect key.', acceptedAnswers: ['rememberUpdatedState'], explanation: 'The effect reads updated state when the delay finishes.', commonIncorrectAnswers: [{ answer: 'remember { mutableStateOf', reason: 'Besides not fitting the syntax, retaining only the initial callback would be stale.' }] },
      { id: 'INVOKE', instruction: 'Invoke the delegated current callback.', acceptedAnswers: ['current'], explanation: 'Reading the delegated value at invocation time avoids the stale captured parameter.', commonIncorrectAnswers: [{ answer: 'onTimeout', reason: 'The existing constant-key effect would retain the callback captured when launched.' }] },
    ],
    referenceAnswer: 'rememberUpdatedState; current.', explanation: 'Restart keys describe effect identity. Updated state is appropriate for a changing callback that should not restart the effect; it is not a substitute for keys when the underlying operation identity changes.',
    rubric: rubric(['State wrapper', 'Uses rememberUpdatedState.'], ['Latest invocation', 'Reads current after delay.'], ['Effect identity', 'Preserves the constant key under the stated contract.']),
    references: [r.effects], followUps: ['What if a changed account ID should restart the timer?'],
    provenance: source([126, 130], ['ui-effects'], 'Original timeout/callback contract, contrasted with subscription identity.'),
  },
  {
    id: 'acc-008', type: 'code-completion', title: 'Choose the Hilt scope for an application cache', topic: 'architecture', difficulty: 'Mid', estimatedMinutes: 8,
    prompt: 'Fill the imported scope annotation so Hilt reuses this binding within SingletonComponent. The constructor must not capture an Activity.',
    assumptions: ['The app uses Hilt and its generated application component.', 'Cache owns only process-local non-UI data; it is not durable storage.'],
    snippet: kotlin('Complete injectable class after substitution; app setup is a prerequisite.', `import javax.inject.Inject
import javax.inject.Singleton
/*BLANK:SCOPE*/
class Cache @Inject constructor()`, ['com.google.dagger:hilt-android', 'Hilt compiler via KSP or kapt']),
    blanks: [{ id: 'SCOPE', instruction: 'Use the imported process-component scope annotation.', acceptedAnswers: ['@Singleton'], explanation: 'A scoped binding is cached within its component instance.', commonIncorrectAnswers: [{ answer: '@ActivityScoped', reason: 'That scope belongs to the Activity component, not the requested application-owned cache.' }] }],
    referenceAnswer: '@Singleton, with normal Hilt installation in the application component hierarchy.', explanation: 'The scope is per component instance and process, not a cross-process global singleton or disk persistence. A longer-lived object must not retain a shorter-lived Activity.',
    rubric: rubric(['Annotation', 'Selects Singleton rather than an Activity scope.'], ['Lifetime', 'Bounds reuse to the component/process.'], ['Ownership', 'Avoids UI references in the long-lived cache.']),
    references: [r.hilt], followUps: ['When would an unscoped cheap binding be preferable?'],
    provenance: source([151, 152, 153], ['architecture-dependency-injection'], 'Original application-cache lifetime requirement.'),
  },
  {
    id: 'acc-009', type: 'code-completion', title: 'Bound retries under an explicit HTTP contract', topic: 'networking', difficulty: 'Mid', estimatedMinutes: 10,
    prompt: 'Complete the retry predicate. This adapter supports only GET retries, only status 429 or 503, and at most three total attempts (attempt indices 0, 1, 2). The caller separately honors server delay and cancellation.',
    assumptions: ['The request has no side effects under the stated GET contract.', 'attempt is the zero-based index of the attempt that just failed; negative inputs must not retry.', 'This is a product policy exercise, not a universal HTTP status rule.'],
    snippet: kotlin('Standalone retry-policy function after substitution.', `fun shouldRetry(method: String, status: Int, attempt: Int): Boolean =
    method == "GET" &&
    status in setOf(/*BLANK:STATUSES*/) &&
    attempt in /*BLANK:ATTEMPTS*/`),
    blanks: [
      { id: 'STATUSES', instruction: 'List the two allowed status codes.', acceptedAnswers: ['429, 503', '503, 429'], explanation: 'Only the two explicitly allowed statuses pass this product policy.', commonIncorrectAnswers: [{ answer: '400, 401, 500', reason: 'These responses are outside the specified retry contract.' }] },
      { id: 'ATTEMPTS', instruction: 'Use an inclusive IntRange of failed attempt indices that may retry.', acceptedAnswers: ['0..1'], explanation: 'After failures at 0 and 1 another attempt is allowed; failure at index 2 exhausts the three-attempt budget.', commonIncorrectAnswers: [{ answer: '0..2', reason: 'It permits a fourth total attempt after index 2 fails.' }] },
    ],
    referenceAnswer: '429, 503 (either order); 0..1. GET/503 at attempts 0 and 1 retries; at 2 it stops. POST, other statuses and negative attempts do not retry.',
    explanation: 'A bounded eligibility predicate is separate from backoff, Retry-After handling, cancellation and server idempotency. Never generalize this fixture to blind retries of mutations.',
    rubric: rubric(['Contract', 'Allows only GET and the two specified statuses.'], ['Attempt budget', 'Avoids the off-by-one fourth attempt.'], ['Separation', 'Leaves delay/cancellation and mutation semantics explicit.']),
    references: [r.offline], followUps: ['How would a server-supported idempotency key change the policy for a POST?'],
    provenance: source([70, 165, 166, 175], ['data-retries'], 'Original explicit HTTP retry contract and off-by-one boundary exercise.'),
  },
  {
    id: 'acc-010', type: 'code-completion', title: 'Expose a local source of truth as a Room stream', topic: 'storage', difficulty: 'Junior', estimatedMinutes: 8,
    prompt: 'Complete the DAO return type so clients observe the current ordered row list and later database changes. Keep the method non-suspending.',
    assumptions: ['Note is an existing Room entity with primary key id.', 'Room code generation is configured; writes happen through this database.'],
    snippet: kotlin('Room DAO declaration after substitution.', `import androidx.room.Dao
import androidx.room.Query
import kotlinx.coroutines.flow.Flow
@Dao interface NotesDao {
    @Query("SELECT * FROM Note ORDER BY id")
    fun observe(): /*BLANK:STREAM*/
}`, ['androidx.room:room-runtime', 'Room coroutine/Flow support', 'Room compiler via KSP', 'App Note entity']),
    blanks: [{ id: 'STREAM', instruction: 'Use the imported Flow of an immutable-facing row list.', acceptedAnswers: ['Flow<List<Note>>'], explanation: 'Room supports observable queries as Flow; the query method need not be suspend.', commonIncorrectAnswers: [{ answer: 'List<Note>', reason: 'It is a one-shot synchronous result and does not observe invalidations.' }] }],
    referenceAnswer: 'Flow<List<Note>>.', explanation: 'Room reruns an observable query when relevant tables invalidate. That is not an exactly-once per-row change feed, nor is an uncollected cold query a permanent active subscription.',
    rubric: rubric(['Return type', 'Uses Flow<List<Note>>.'], ['Observation', 'Explains invalidation and re-query.'], ['Limits', 'Does not promise only distinct row changes or eager continuous collection.']),
    references: [r.room], followUps: ['When would distinctUntilChanged help downstream consumers?'],
    provenance: source([156, 161], ['data-room-sqlite'], 'Original ordered note query and observation requirement.'),
  },
  {
    id: 'acc-011', type: 'code-completion', title: 'Avoid duplicate queued sync work', topic: 'background', difficulty: 'Junior', estimatedMinutes: 8,
    prompt: 'Complete the WorkManager policy so repeated enqueue calls keep an already unfinished sync request. Do not replace running work.',
    assumptions: ['SyncWorker is a configured worker; one account is in scope.', 'Ignoring a newer enqueue while existing work is unfinished is acceptable.'],
    snippet: kotlin('Function body excerpt; workManager is injected.', `import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
// Inside enqueueSync():
workManager.enqueueUniqueWork(
    "sync", ExistingWorkPolicy./*BLANK:POLICY*/,
    OneTimeWorkRequestBuilder<SyncWorker>().build()
)`, ['androidx.work:work-runtime-ktx', 'App SyncWorker and injected WorkManager']),
    blanks: [{ id: 'POLICY', instruction: 'Keep unfinished unique work.', acceptedAnswers: ['KEEP'], explanation: 'KEEP skips adding a new unique request while unfinished work with that name exists.', commonIncorrectAnswers: [{ answer: 'REPLACE', reason: 'It cancels/replaces unfinished existing work, contrary to the requirement.' }] }],
    referenceAnswer: 'KEEP.', explanation: 'Unique work reduces scheduler duplication, not duplicate remote side effects after a crash or retry. Account-specific names are needed when accounts must sync independently.',
    rubric: rubric(['Policy', 'Selects KEEP.'], ['Scope', 'Explains unfinished versus completed work.'], ['Idempotency', 'Separates unique scheduling from exactly-once effects.']),
    references: [r.uniqueWork], followUps: ['How would you guarantee newly queued local mutations are not stranded by KEEP?'],
    provenance: source([168, 170], ['background-workmanager'], 'Original single-account deduplication policy.'),
  },
  {
    id: 'acc-012', type: 'code-completion', title: 'Drive delayed work with one test scheduler', topic: 'testing-security-build', difficulty: 'Mid', estimatedMinutes: 10,
    prompt: 'Fill the scheduler argument and advancement statement so the delayed write completes deterministically without sleeping in real time.',
    assumptions: ['The kotlinx-coroutines-test version matches coroutines-core.', 'No real I/O or other dispatchers escape the supplied dispatcher.'],
    snippet: kotlin('JUnit test declaration after substitution.', `import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.*
import org.junit.Test
import org.junit.Assert.assertEquals
@OptIn(ExperimentalCoroutinesApi::class)
class DelayTest {
    @Test fun updates() = runTest {
        val dispatcher = StandardTestDispatcher(/*BLANK:SCHEDULER*/)
        var value = 0
        launch(dispatcher) { delay(1_000); value = 1 }
        /*BLANK:ADVANCE*/
        assertEquals(1, value)
    }
}`, ['kotlinx-coroutines-core', 'kotlinx-coroutines-test', 'JUnit 4']),
    blanks: [
      { id: 'SCHEDULER', instruction: 'Use the scheduler provided by runTest.', acceptedAnswers: ['testScheduler'], explanation: 'Both the test scope and dispatcher share one virtual clock.', commonIncorrectAnswers: [{ answer: 'TestCoroutineScheduler()', reason: 'It introduces a separate scheduler rather than sharing the test clock.' }] },
      { id: 'ADVANCE', instruction: 'Run all queued work until idle.', acceptedAnswers: ['advanceUntilIdle()'], explanation: 'It starts the queued child and advances through its delay.', commonIncorrectAnswers: [{ answer: 'runCurrent()', reason: 'It starts current work but does not advance through the 1,000 ms delay.' }, { answer: 'Thread.sleep(1000)', reason: 'Real sleeping does not drive the virtual scheduler.' }] },
    ],
    referenceAnswer: 'testScheduler; advanceUntilIdle().', explanation: 'StandardTestDispatcher queues work. A shared TestCoroutineScheduler makes the result deterministic and avoids separate clocks that cannot be advanced together.',
    rubric: rubric(['One scheduler', 'Passes testScheduler.'], ['Execution', 'Uses advanceUntilIdle rather than sleeping.'], ['Boundaries', 'Identifies dependencies that must not escape virtual time.']),
    references: [r.coroutineTest], followUps: ['How would you assert the state immediately before the delay finishes?'],
    provenance: source([65, 180], ['testing-coroutines'], 'Original deterministic delayed-write test.'),
  },
] satisfies CodeCompletionChallenge[];
