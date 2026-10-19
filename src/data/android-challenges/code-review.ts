import type { CodeReviewChallenge } from './types.ts';
import { kotlin, rubric, source } from './authoring.ts';
import { references as r } from './references.ts';

export const codeReviews = [
  {
    id: 'acr-001', type: 'code-review', title: 'The copied basket changes its original', topic: 'kotlin', difficulty: 'Junior', estimatedMinutes: 10,
    prompt: 'The cart editor must leave the checkout snapshot unchanged. Explain the observed value and repair the ownership boundary without making copy deep by convention.',
    assumptions: ['Items are immutable strings; only the list is mutable.', 'Both baskets remain in use after editing.'],
    snippet: kotlin('Complete standalone Kotlin program.', `data class Basket(val items: MutableList<String>)
fun main() {
    val checkout = Basket(mutableListOf("tea"))
    val editing = checkout.copy()
    editing.items.add("cake")
    check(checkout.items == listOf("tea"))
}`),
    issues: [{ location: 'checkout.copy() followed by editing.items.add', rootCause: 'Generated copy shares the mutable list reference.', consequence: 'The check fails because both baskets now contain cake.' }],
    correctedImplementation: kotlin('Complete standalone correction; no mutable list escapes.', `data class Basket(val items: List<String>)
fun main() {
    val checkout = Basket(listOf("tea"))
    val editing = checkout.copy(items = checkout.items + "cake")
    check(checkout.items == listOf("tea"))
    check(editing.items == listOf("tea", "cake"))
}`),
    referenceAnswer: 'copy is shallow. Give the editor a separate collection, or use new read-only list values on each edit as shown.',
    explanation: 'Changing val to var does not fix aliasing. List limits mutation through this interface; it does not freeze a separately retained MutableList. The correction creates and owns fresh list values.',
    rubric: rubric(['Trace the bug', 'Identifies shared list identity and the failed check.'], ['Repair ownership', 'Creates a new list and preserves the original.'], ['State the limit', 'Explains shallow element copying and read-only versus immutable.']),
    followUps: ['What changes if an item itself is mutable?', 'Where would you copy a list received from a Java API?'],
    references: [r.dataClasses, r.collections], provenance: source([1, 10, 26], ['kotlin-data-sealed-objects', 'kotlin-collections'], 'Original basket regression and executable-style checks.'),
  },
  {
    id: 'acr-002', type: 'code-review', title: 'A Java platform value crashes before rendering', topic: 'kotlin', difficulty: 'Junior', estimatedMinutes: 10,
    prompt: 'The legacy Java API may return null. Explain why the Kotlin function can crash despite its non-null local type, then implement the required guest fallback at the boundary.',
    assumptions: ['LegacyDirectory is an unannotated Java class with public static String firstName() that can return null.', 'Null, empty or whitespace-only names should produce Hello, guest; other names are trimmed.'],
    snippet: kotlin('Kotlin function calling the described Java API; the Java class is an external prerequisite.', `fun greeting(): String {
    val name: String = LegacyDirectory.firstName()
    return "Hello, " + name.trim()
}`, ['Kotlin standard library', 'JDK', 'App Java LegacyDirectory class']),
    issues: [{ location: 'val name: String = LegacyDirectory.firstName()', rootCause: 'The unannotated Java return is a platform type, so Kotlin allows a non-null assignment that still needs a runtime null check.', consequence: 'A null Java result throws at the boundary instead of producing the required fallback.' }],
    correctedImplementation: kotlin('Same Java prerequisite; nullable capture validates the external value explicitly.', `fun greeting(): String {
    val raw: String? = LegacyDirectory.firstName()
    val name = raw?.trim()?.takeIf { it.isNotBlank() } ?: "guest"
    return "Hello, " + name
}`, ['Kotlin standard library', 'JDK', 'App Java LegacyDirectory class']),
    referenceAnswer: 'Capture the platform result as nullable and normalize/validate it before producing the non-null greeting. Improve Java nullability annotations when that API is under your control.',
    explanation: 'Kotlin null safety cannot infer an unannotated Java contract. An explicit non-null local does not prove the Java result is safe. The correction also implements the stated blank-name fallback.',
    rubric: rubric(['Boundary diagnosis', 'Explains platform types and the assignment-time null failure.'], ['Repair contract', 'Handles null and blank input without an unsafe assertion.'], ['Interop design', 'Suggests accurate Java annotations without treating annotations as runtime validation.']),
    followUps: ['How would you test both annotated and unannotated Java clients?'],
    references: [r.interop, r.nullSafety], provenance: source([4, 5, 35], ['kotlin-java-interop', 'kotlin-null-safety'], 'Original nullable Java directory contract and rendering failure.'),
  },
  {
    id: 'acr-003', type: 'code-review', title: 'A suspend loader still freezes the UI', topic: 'coroutines', difficulty: 'Mid', estimatedMinutes: 12,
    prompt: 'A ViewModel calls load from viewModelScope on Main. The injected read function blocks for 500 ms. Fix responsibility for thread switching and explain what cancellation can and cannot do.',
    assumptions: ['read is an ordinary blocking function, not a suspend-aware network client.', 'This operation belongs to the caller lifetime.'],
    snippet: kotlin('Repository declaration; call site launches load from Main.', `class Loader(private val read: () -> String) {
    suspend fun load(): String = read()
}`),
    issues: [{ location: 'suspend fun load() = read()', rootCause: 'suspend does not move blocking work to another dispatcher.', consequence: 'The blocking read occupies Main and stalls rendering.' }],
    correctedImplementation: kotlin('Complete repository declaration with injected blocking-work dispatcher.', `import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.withContext
class Loader(private val io: CoroutineDispatcher, private val read: () -> String) {
    suspend fun load(): String = withContext(io) { read() }
}`, ['kotlinx-coroutines-core']),
    referenceAnswer: 'Make the loader main-safe with withContext and an injected IO-suitable dispatcher. Keep structured caller ownership.',
    explanation: 'Dispatcher injection enables deterministic tests. Moving work does not make an arbitrary blocking read interruptible; select a cancellable client or explicit interruption strategy when needed.',
    rubric: rubric(['Diagnose', 'Distinguishes suspension from off-main execution.'], ['Repair', 'Switches at the blocking boundary without GlobalScope.'], ['Cancellation', 'Does not promise automatic interruption of arbitrary blocking I/O.']),
    followUps: ['How would you test the injected dispatcher?', 'When is Dispatchers.Default more suitable?'],
    references: [r.coroutines], provenance: source([37, 43, 44, 45], ['concurrency-scopes-dispatchers'], 'Original blocking dependency and responsiveness observation.'),
  },
  {
    id: 'acr-004', type: 'code-review', title: 'Cancelled refresh is reported as an ordinary failure', topic: 'coroutines', difficulty: 'Mid', estimatedMinutes: 12,
    prompt: 'fetch cooperatively throws CancellationException when its owner cancels. Repair this API so cancellation is propagated and I/O failures can still become a false result.',
    assumptions: ['Only IOException is an expected recoverable fetch failure.', 'There is no cleanup that must run in NonCancellable.'],
    snippet: kotlin('Function with injected suspend operation.', `suspend fun refresh(fetch: suspend () -> Unit): Boolean = try {
    fetch()
    true
} catch (e: Exception) {
    false
}`),
    issues: [{ location: 'catch (e: Exception)', rootCause: 'The broad catch also catches coroutine cancellation.', consequence: 'The function returns false instead of honoring its cancellation contract.' }],
    correctedImplementation: kotlin('Function with explicit cancellation handling and narrow expected failure handling.', `import java.io.IOException
import kotlinx.coroutines.CancellationException
suspend fun refresh(fetch: suspend () -> Unit): Boolean = try {
    fetch()
    true
} catch (e: CancellationException) {
    throw e
} catch (e: IOException) {
    false
}`, ['kotlinx-coroutines-core', 'JDK']),
    referenceAnswer: 'Rethrow CancellationException and catch only expected failures. A catch of IOException alone is also a valid simpler correction.',
    explanation: 'Catching the exception does not reactivate a cancelled Job. The concrete bug is the misleading normal return; later suspension may still throw. Unexpected programming failures should not silently become an offline result.',
    rubric: rubric(['Trace catch', 'Explains why cancellation reaches this catch.'], ['Repair taxonomy', 'Separates cancellation, expected I/O and unexpected failures.'], ['Job semantics', 'Avoids claiming swallowing cancellation restores the Job.']),
    followUps: ['How should retry code react to cancellation?'],
    references: [r.coroutines, r.cancellation], provenance: source([51, 52], ['concurrency-cancellation'], 'Original Boolean refresh contract and typed failure assumption.'),
  },
  {
    id: 'acr-005', type: 'code-review', title: 'Two collectors charge the network twice', topic: 'flow', difficulty: 'Mid', estimatedMinutes: 12,
    prompt: 'Both collectors run for the screen lifetime. fetch makes a new network call on every invocation. Explain the two requests and suggest a ViewModel-owned shared state stream.',
    assumptions: ['The screen wants one shared latest snapshot, not two independent subscriptions.', 'The correction may introduce a ViewModel property; transient failure handling is injected into fetch for this exercise.'],
    snippet: kotlin('Called inside a coroutineScope; both child jobs are awaited by that scope.', `import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
suspend fun screen(fetch: suspend () -> String) = coroutineScope {
    val data = flow { emit(fetch()) }
    launch { data.collect { println("header: " + it) } }
    launch { data.collect { println("body: " + it) } }
}`, ['kotlinx-coroutines-core']),
    issues: [{ location: 'two data.collect calls', rootCause: 'Each subscription executes the cold flow builder.', consequence: 'fetch runs once per collector rather than once per shared producer.' }],
    correctedImplementation: kotlin('ViewModel property; subscribers collect data with lifecycle-aware APIs.', `import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.stateIn
class DataVm(fetch: suspend () -> String) : ViewModel() {
    val data = flow { emit(fetch()) }.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5_000), "Loading"
    )
}`, ['kotlinx-coroutines-core', 'androidx.lifecycle:lifecycle-viewmodel-ktx']),
    referenceAnswer: 'Share upstream ownership with stateIn when a latest value is UI state. A repository cache is another valid solution if its lifetime is explicitly defined.',
    explanation: 'The correction shares concurrent subscriptions. It is not a permanent one-request guarantee: WhileSubscribed can stop and later restart upstream after its timeout. Use a real state model rather than a Loading string in production.',
    rubric: rubric(['Find duplication', 'Counts cold-flow executions.'], ['Choose ownership', 'Uses one shared producer with an explicit scope.'], ['Bound guarantee', 'Discusses restart and caching separately.']),
    followUps: ['Should refresh be triggered by re-subscription or an explicit action?', 'How would errors be represented without terminating shared state?'],
    references: [r.flow, r.stateFlow], provenance: source([66, 71, 74, 75], ['concurrency-flow', 'concurrency-stateflow-sharedflow'], 'Original two-consumer request budget and sharing exercise.'),
  },
  {
    id: 'acr-006', type: 'code-review', title: 'A Fragment collector outlives its view', topic: 'lifecycle', difficulty: 'Mid', estimatedMinutes: 12,
    prompt: 'The Fragment remains on the back stack after onDestroyView. A later state emission reaches binding!!. Repair both the owner and the active lifecycle boundary.',
    assumptions: ['binding is cleared in onDestroyView.', 'vm.state is a StateFlow and render touches views.'],
    snippet: kotlin('Fragment.onViewCreated body. Imports: androidx.lifecycle.lifecycleScope, kotlinx.coroutines.flow.collect and kotlinx.coroutines.launch.', `lifecycleScope.launch {
    vm.state.collect { binding!!.render(it) }
}`, ['androidx.fragment:fragment-ktx', 'androidx.lifecycle:lifecycle-runtime-ktx', 'kotlinx-coroutines-core']),
    issues: [{ location: 'Fragment.lifecycleScope collection', rootCause: 'The Fragment lifecycle can outlive its destroyed view.', consequence: 'An emission can dereference the cleared binding; collection also continues while not STARTED.' }],
    correctedImplementation: kotlin('Fragment.onViewCreated body; binding exists while the view is STARTED.', `import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
// Place the following inside onViewCreated:
viewLifecycleOwner.lifecycleScope.launch {
    viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
        vm.state.collect { binding!!.render(it) }
    }
}`, ['androidx.fragment:fragment-ktx', 'androidx.lifecycle:lifecycle-runtime-ktx', 'kotlinx-coroutines-core']),
    referenceAnswer: 'Launch in viewLifecycleOwner.lifecycleScope and collect inside its repeatOnLifecycle STARTED block.',
    explanation: 'The view scope is cancelled at view destruction; the inner collection also stops below STARTED and restarts on return. This does not make event replay safe automatically.',
    rubric: rubric(['Distinguish lifetimes', 'Explains Fragment versus view lifetime.'], ['Fix collection', 'Uses the view lifecycle owner for scope and repeat block.'], ['Explain restart', 'Understands stop/restart and StateFlow latest state.']),
    followUps: ['How would you collect two flows concurrently in repeatOnLifecycle?'],
    references: [r.lifecycle], provenance: source([58, 59, 94, 95], ['platform-lifecycles'], 'Original back-stack crash; snippet is explicitly a Fragment-body excerpt.'),
  },
  {
    id: 'acr-007', type: 'code-review', title: 'The counter increments but the text stays still', topic: 'compose', difficulty: 'Junior', estimatedMinutes: 10,
    prompt: 'Clicking Add mutates the list but the count does not reliably update. Fix the state representation without introducing a ViewModel solely for this example.',
    assumptions: ['No other state invalidates this composable.', 'The list is local temporary UI state; process restoration is out of scope.'],
    snippet: kotlin('Composable declaration; imports below apply to both versions.', `import androidx.compose.runtime.*
import androidx.compose.material3.*
@Composable fun Counter() {
    val names = remember { mutableListOf<String>() }
    Button(onClick = { names.add("Ada") }) { Text(names.size.toString()) }
}`, ['androidx.compose.runtime:runtime', 'androidx.compose.material3:material3']),
    issues: [{ location: 'remember { mutableListOf<String>() }', rootCause: 'Ordinary list mutation is not observable Compose snapshot state.', consequence: 'The mutation alone does not invalidate the count read.' }],
    correctedImplementation: kotlin('Composable declaration using observable immutable-value updates.', `import androidx.compose.runtime.*
import androidx.compose.material3.*
@Composable fun Counter() {
    var names by remember { mutableStateOf(listOf<String>()) }
    Button(onClick = { names = names + "Ada" }) { Text(names.size.toString()) }
}`, ['androidx.compose.runtime:runtime', 'androidx.compose.material3:material3']),
    referenceAnswer: 'Assign a new list through mutableStateOf as shown, or use a remembered mutableStateListOf with snapshot-aware mutations.',
    explanation: 'remember retains a value across recomposition but does not make arbitrary objects observable. A later unrelated invalidation could expose the new count, which is why a guaranteed never-updates claim would be too strong.',
    rubric: rubric(['Observe correctly', 'Separates retention from observable state.'], ['Repair', 'Uses snapshot state and a supported mutation path.'], ['Bound scope', 'Does not promise process-death persistence from remember.']),
    followUps: ['What would change if this count were business state?'],
    references: [r.state], provenance: source([118, 124], ['ui-recomposition'], 'Original local-state rendering regression.'),
  },
  {
    id: 'acr-008', type: 'code-review', title: 'Switching accounts keeps the old subscription alive', topic: 'compose', difficulty: 'Mid', estimatedMinutes: 12,
    prompt: 'accountId changes while this composable stays in the same composition slot. Diagnose why the listener remains attached to the old account and correct its lifetime.',
    assumptions: ['AccountEvents.listen returns an AutoCloseable handle.', 'events is a stable dependency; the callback does not capture changing UI state.'],
    snippet: kotlin('AccountEvents is an injected interface with listen(String, () -> Unit): AutoCloseable.', `import androidx.compose.runtime.*
@Composable fun AccountListener(accountId: String, events: AccountEvents) {
    DisposableEffect(Unit) {
        val handle = events.listen(accountId) { println("changed") }
        onDispose { handle.close() }
    }
}`, ['androidx.compose.runtime:runtime', 'JDK AutoCloseable', 'App-provided AccountEvents interface']),
    issues: [{ location: 'DisposableEffect(Unit)', rootCause: 'The constant key never changes when the subscription identity changes.', consequence: 'The old account remains subscribed until the effect leaves composition.' }],
    correctedImplementation: kotlin('Same injected interface; the keys describe subscription identity.', `import androidx.compose.runtime.*
@Composable fun AccountListener(accountId: String, events: AccountEvents) {
    DisposableEffect(accountId, events) {
        val handle = events.listen(accountId) { println("changed") }
        onDispose { handle.close() }
    }
}`, ['androidx.compose.runtime:runtime', 'JDK AutoCloseable', 'App-provided AccountEvents interface']),
    referenceAnswer: 'Key the effect to the account and event source, disposing the previous handle before creating the replacement.',
    explanation: 'Cleanup already exists in the bug; do not claim it is missing. The error is the wrong effect identity. A changing callback that should not restart the subscription would call for rememberUpdatedState instead.',
    rubric: rubric(['Identify actual bug', 'Names the constant key, not missing cleanup.'], ['Repair identity', 'Keys all subscription-changing inputs.'], ['Lifecycle', 'Explains disposal on key change and exit.']),
    followUps: ['How would you keep an onChanged callback current without resubscribing?'],
    references: [r.effects], provenance: source([127, 130], ['ui-effects'], 'Original account subscription interface and switch scenario.'),
  },
  {
    id: 'acr-009', type: 'code-review', title: 'UI clients can write into the ViewModel state', topic: 'architecture', difficulty: 'Junior', estimatedMinutes: 10,
    prompt: 'A screen writes vm.state.value directly, bypassing validation. Repair the public state boundary and preserve an explicit action for renaming.',
    assumptions: ['Blank names are invalid.', 'State is owned by one ViewModel; persistence is not part of this exercise.'],
    snippet: kotlin('ViewModel declaration.', `import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
class ProfileVm : ViewModel() {
    val state = MutableStateFlow("Ada")
    fun rename(name: String) { if (name.isNotBlank()) state.value = name }
}`, ['androidx.lifecycle:lifecycle-viewmodel', 'kotlinx-coroutines-core']),
    issues: [{ location: 'public MutableStateFlow property', rootCause: 'Every consumer receives mutation capability.', consequence: 'Consumers can bypass the rename invariant and create blank state.' }],
    correctedImplementation: kotlin('ViewModel with read-only observable exposure.', `import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
class ProfileVm : ViewModel() {
    private val mutableState = MutableStateFlow("Ada")
    val state = mutableState.asStateFlow()
    fun rename(name: String) { if (name.isNotBlank()) mutableState.value = name }
}`, ['androidx.lifecycle:lifecycle-viewmodel', 'kotlinx-coroutines-core']),
    referenceAnswer: 'Keep mutable state private and expose StateFlow through asStateFlow. Route writes through validated actions.',
    explanation: 'Read-only exposure centralizes mutation; it is not a security boundary against arbitrary reflection or a replacement for validating at a trusted server.',
    rubric: rubric(['Find capability leak', 'Explains how consumers bypass rename.'], ['Fix boundary', 'Private mutable source plus read-only stream.'], ['Preserve behavior', 'Keeps a validated action and observable updates.']),
    followUps: ['How would two concurrent read-modify-write actions be made atomic?'],
    references: [r.coroutines, r.architecture], provenance: source([122, 142, 145], ['architecture-udf', 'architecture-viewmodel'], 'Original validation invariant and unauthorized UI write.'),
  },
  {
    id: 'acr-010', type: 'code-review', title: 'A replacement cache becomes empty after a crash', topic: 'storage', difficulty: 'Mid', estimatedMinutes: 15,
    prompt: 'The process can stop between deleteAll and insertAll. Repair the database replacement so observers never see a committed empty intermediate state.',
    assumptions: ['rows is already fetched outside the transaction.', 'Both DAO operations use the same Room database; preserving the old snapshot on failure is required.'],
    snippet: kotlin('Room DAO excerpt; Article is an app @Entity with a stable primary key.', `import androidx.room.*
@Dao abstract class ArticleDao {
    @Query("DELETE FROM Article") abstract suspend fun deleteAll()
    @Insert abstract suspend fun insertAll(rows: List<Article>)
    suspend fun replace(rows: List<Article>) {
        deleteAll()
        insertAll(rows)
    }
}`, ['androidx.room:room-runtime', 'Room compiler via KSP', 'App Article entity']),
    issues: [{ location: 'replace without @Transaction', rootCause: 'The two independent writes are not one atomic replacement.', consequence: 'A failure after deletion leaves an empty committed cache.' }],
    correctedImplementation: kotlin('Same DAO; fetch must remain outside this database transaction.', `import androidx.room.*
@Dao abstract class ArticleDao {
    @Query("DELETE FROM Article") abstract suspend fun deleteAll()
    @Insert abstract suspend fun insertAll(rows: List<Article>)
    @Transaction
    open suspend fun replace(rows: List<Article>) {
        deleteAll()
        insertAll(rows)
    }
}`, ['androidx.room:room-runtime', 'Room compiler via KSP', 'App Article entity']),
    referenceAnswer: 'Wrap both writes in a Room transaction using an overridable concrete DAO method or db.withTransaction around the two calls.',
    explanation: 'A transaction commits all replacement writes or rolls them back. It cannot make the remote fetch and local database one distributed atomic operation. Do not hold a database transaction across network work.',
    rubric: rubric(['Failure trace', 'Identifies the committed delete/insert gap.'], ['Atomicity', 'Provides a valid transaction boundary in one database.'], ['Limits', 'Separates local atomicity from remote consistency.']),
    followUps: ['What test would prove rollback when insertion violates a constraint?', 'How do pending local edits change replacement semantics?'],
    references: [r.transaction, r.room], provenance: source([156, 157, 160, 161], ['data-room-sqlite', 'system-design-database'], 'Original interruption point and snapshot replacement policy.'),
  },
  {
    id: 'acr-011', type: 'code-review', title: 'A worker retries a permanently invalid upload', topic: 'background', difficulty: 'Mid', estimatedMinutes: 12,
    prompt: 'The backend specifies that InvalidPayload is permanent and TemporaryFailure is retryable. Repair the Worker result mapping without swallowing cancellation.',
    assumptions: ['UploadOutcome is an app sealed type with Uploaded, InvalidPayload and TemporaryFailure objects.', 'upload is a main-safe suspending call and cancellation is allowed to propagate.'],
    snippet: kotlin('CoroutineWorker.doWork body; upload returns UploadOutcome.', `return when (upload()) {
    UploadOutcome.Uploaded -> Result.success()
    UploadOutcome.InvalidPayload -> Result.retry()
    UploadOutcome.TemporaryFailure -> Result.retry()
}`, ['androidx.work:work-runtime-ktx', 'App upload suspend function']),
    issues: [{ location: 'InvalidPayload -> Result.retry()', rootCause: 'Permanent input failure is classified as a transient execution failure.', consequence: 'Work repeats without any prospect of success under the contract.' }],
    correctedImplementation: kotlin('CoroutineWorker.doWork body; reporting of terminal failure is app-owned.', `return when (upload()) {
    UploadOutcome.Uploaded -> Result.success()
    UploadOutcome.InvalidPayload -> Result.failure()
    UploadOutcome.TemporaryFailure -> Result.retry()
}`, ['androidx.work:work-runtime-ktx', 'App upload suspend function']),
    referenceAnswer: 'Map the invalid payload to failure and temporary failure to retry; set a bounded app retry policy and report actionable terminal failures.',
    explanation: 'WorkManager retry uses scheduling/backoff rather than immediate guaranteed execution. Returning failure can prevent dependent work from running; decide chain semantics deliberately. No catch in the snippet swallows cancellation.',
    rubric: rubric(['Respect contract', 'Classifies the permanent and transient outcomes correctly.'], ['Use API', 'Maps to success/failure/retry without invented result APIs.'], ['Operational limits', 'Mentions backoff and terminal UI/reporting behavior.']),
    followUps: ['Where would attempt budgets and server Retry-After constraints live?'],
    references: [r.work], provenance: source([169, 175], ['background-workmanager', 'data-retries'], 'Original explicit upload result taxonomy; no blanket HTTP status assumptions.'),
  },
  {
    id: 'acr-012', type: 'code-review', title: 'A synchronized snapshot stalls the main thread', topic: 'performance', difficulty: 'Senior', estimatedMinutes: 15,
    prompt: 'A background refresh holds this lock while readBlocking takes several seconds. Main calls snapshot during rendering. Explain the stall and shorten the critical section.',
    assumptions: ['Only one refresh runs at a time; strings are immutable.', 'Returning the previous snapshot while a refresh runs is acceptable.'],
    snippet: kotlin('Complete class; readBlocking is an injected blocking I/O dependency.', `class Cache(private val readBlocking: () -> String) {
    private val lock = Any()
    private var value = "cached"
    fun refresh() = synchronized(lock) { value = readBlocking() }
    fun snapshot(): String = synchronized(lock) { value }
}`),
    issues: [{ location: 'readBlocking inside synchronized(lock)', rootCause: 'Slow I/O holds the same monitor required by a Main-thread reader.', consequence: 'The UI blocks on lock acquisition even though I/O itself is off Main.' }],
    correctedImplementation: kotlin('Complete correction; invoke refresh on a blocking-I/O dispatcher, not Main.', `class Cache(private val readBlocking: () -> String) {
    private val lock = Any()
    private var value = "cached"
    fun refresh() {
        val fresh = readBlocking()
        synchronized(lock) { value = fresh }
    }
    fun snapshot(): String = synchronized(lock) { value }
}`),
    referenceAnswer: 'Read outside the lock and publish only the completed value in a short critical section. Investigate real traces to distinguish lock contention from direct Main-thread I/O.',
    explanation: 'Off-main work can still cause ANRs through shared locks. The one-refresh assumption matters: concurrent refreshes would need an ordering/version policy to prevent stale publication. Avoid universal ANR timeout claims.',
    rubric: rubric(['Causal diagnosis', 'Traces Main waiting on a background-owned monitor.'], ['Bound critical section', 'Moves slow I/O outside the shared lock.'], ['Concurrency limits', 'Explains the single-writer assumption and measures with traces.']),
    followUps: ['How would versioned publication handle overlapping refreshes?', 'Would replacing synchronized with Mutex alone remove the Main stall?'],
    references: [r.anr], provenance: source([61, 63, 106, 107], ['performance-anrs-crashes', 'concurrency-thread-safety'], 'Original monitor-contention scenario and stale-read contract.'),
  },
] satisfies CodeReviewChallenge[];
