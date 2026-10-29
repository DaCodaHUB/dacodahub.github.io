import type { ReviewChallenge, ReviewDifficulty } from './review-types.ts';

const references: Record<string, string> = {
  Kotlin: 'https://kotlinlang.org/docs/collections-overview.html',
  Coroutines: 'https://developer.android.com/kotlin/coroutines/coroutines-best-practices',
  Flow: 'https://developer.android.com/kotlin/flow/stateflow-and-sharedflow',
  Lifecycle: 'https://developer.android.com/topic/libraries/architecture/coroutines',
  Compose: 'https://developer.android.com/develop/ui/compose/side-effects',
  Room: 'https://developer.android.com/training/data-storage/room/async-queries',
  Background: 'https://developer.android.com/develop/background-work/background-tasks/persistent',
  Architecture: 'https://developer.android.com/topic/architecture/data-layer',
  Testing: 'https://developer.android.com/kotlin/coroutines/test',
  Performance: 'https://developer.android.com/develop/ui/compose/performance/bestpractices',
  Networking: 'https://developer.android.com/topic/architecture/data-layer/offline-first',
  'React Native': 'https://reactnative.dev/docs/the-new-architecture/native-modules-lifecycle',
};
type Finding = [location: string, cause: string, impact: string, fix: string];
const dependencies: Record<string, string[]> = {
  Kotlin: ['Kotlin standard library'], Coroutines: ['kotlinx-coroutines-core'],
  Flow: ['kotlinx-coroutines-core', 'AndroidX lifecycle-viewmodel-ktx where ViewModel scope is used'],
  Lifecycle: ['AndroidX Lifecycle', 'Fragment / ViewBinding where specified'],
  Compose: ['Jetpack Compose runtime and UI'], Room: ['AndroidX Room KTX', 'Paging 3 for the RemoteMediator example'],
  Background: ['AndroidX WorkManager CoroutineWorker', 'Kotlin coroutines'],
  Architecture: ['AndroidX Lifecycle', 'Hilt for the dependency-scope example', 'Kotlin Flow where specified'],
  Testing: ['JUnit', 'kotlinx-coroutines-test'], Performance: ['Compose foundation lazy lists', 'Compose runtime'],
  Networking: ['Kotlin coroutines Mutex', 'Application-defined atomic session store'],
  'React Native': ['React Native Codegen', 'Kotlin coroutines', 'java.io'],
};
const foundationalReferences: Record<number, string> = {
  31: 'https://kotlinlang.org/docs/flow.html',
  32: 'https://developer.android.com/reference/android/os/Handler',
  33: 'https://kotlinlang.org/docs/exceptions.html',
  34: 'https://kotlinlang.org/docs/null-safety.html',
};
const foundationalDependencies: Record<number, string[]> = {
  31: ['kotlinx-coroutines-core', 'AndroidX lifecycle-runtime-ktx'],
  32: ['Android SDK Activity, Handler, and Looper'],
  33: ['Kotlin standard library', 'java.io.IOException'],
  34: ['AndroidX ViewModel', 'Kotlin StateFlow'],
};
function review(n: number, difficulty: ReviewDifficulty, topic: string, title: string, context: string, prompt: string, bad: string, findings: Finding[], corrected: string, tradeoffs: string, followUp: string): ReviewChallenge {
  const code = (text: string) => ({ language: 'kotlin' as const, context, dependencies: foundationalDependencies[n] ?? dependencies[topic]!, code: text, verification: 'not-compiled' as const });
  return {
    id: `cr-${String(n).padStart(3, '0')}`, type: 'code-review', difficulty, topic, title, prompt,
    estimatedMinutes: difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 10 : 15,
    snippet: code(bad), correctedImplementation: code(corrected),
    issues: findings.map(([location, rootCause, consequence, fix]) => ({ location, rootCause, consequence, fix })),
    tradeoffs, followUps: [followUp],
    references: [{ title: `${topic} engineering guidance`, url: foundationalReferences[n] ?? references[topic]!, supports: 'Ownership, state, and execution contracts discussed in this review.' }],
  };
}

export const codeReviewChallenges: readonly ReviewChallenge[] = [
  review(1, 'Easy', 'Kotlin', 'A copied basket changes its preview',
    'Standalone Kotlin. Basket owns a MutableList<String>; preview must be independent.',
    'Review the copy boundary. Explain why the preview changes and propose the smallest safe correction.',
    `data class Basket(val items: MutableList<String>)
fun preview(basket: Basket): Basket {
    val copy = basket.copy()
    copy.items.add("Gift wrap")
    return copy
}`,
    [['basket.copy()', 'Data-class copy shares the nested mutable list.', 'Adding preview-only content mutates the original basket.', 'Copy the list before mutation, or publish immutable basket values.']],
    `data class Basket(val items: List<String>)
fun preview(basket: Basket): Basket =
    basket.copy(items = basket.items + "Gift wrap")`,
    'This copies the collection structure, not mutable elements. For large edit-heavy models consider persistent collections; do not claim List alone guarantees deep immutability.',
    'What changes if each item contains a mutable quantity object?'),
  review(2, 'Easy', 'Kotlin', 'A missing profile becomes a crash',
    'ProfileApi.userName returns String?; this UI permits a Guest label. Snippet is a standalone suspend function.',
    'Review the nullable boundary and explain how your correction handles both null and blank responses.',
    `suspend fun label(api: ProfileApi): String =
    api.userName()!!.trim()`,
    [['!!', 'A legitimate absent name is force-unwrapped.', 'The screen crashes instead of showing its specified fallback.', 'Normalize the nullable response and supply the product-defined fallback.']],
    `suspend fun label(api: ProfileApi): String =
    api.userName()?.trim()?.takeIf { it.isNotEmpty() } ?: "Guest"`,
    'A fallback is appropriate for optional display text. Missing required identity should be a typed failure rather than silently showing Guest.',
    'Where would you validate a Java SDK platform type?'),
  review(3, 'Easy', 'Coroutines', 'A suspend function still blocks scrolling',
    'Repository member. File.readText is blocking; file is java.io.File. Inject io: CoroutineDispatcher.',
    'Identify the thread-safety contract violated when a ViewModel calls this method on Main.',
    `suspend fun readDraft(): String = file.readText()`,
    [['readText()', 'Suspend does not move blocking work to a background dispatcher.', 'Disk latency blocks the caller’s main thread and can cause jank or ANRs.', 'Make this blocking implementation main-safe with an injected IO dispatcher.']],
    `suspend fun readDraft(): String = withContext(io) {
    file.readText()
}`,
    'Do not wrap already main-safe Room or Retrofit suspend calls in IO by habit. CPU-heavy decoding may need Default separately.',
    'How would you make the dispatcher deterministic in tests?'),
  review(4, 'Easy', 'Lifecycle', 'A request outlives its screen',
    'Inside a ViewModel; repository.load suspends and state is MutableStateFlow<ScreenState>.',
    'Review who owns this request when the navigation destination is removed.',
    `fun refresh() {
    GlobalScope.launch {
        state.value = repository.load()
    }
}`,
    [['GlobalScope', 'The job has no ViewModel owner.', 'It may continue after the screen is discarded and makes cancellation and tests harder.', 'Launch in viewModelScope for screen-owned work.']],
    `fun refresh() {
    viewModelScope.launch {
        state.value = repository.load()
    }
}`,
    'ViewModel work survives rotation, not process death. Truly durable writes need persisted intent and a suitable scheduler, not a longer-lived unowned coroutine.',
    'When should refresh also be cancelled while a screen is invisible?'),
  review(5, 'Easy', 'Flow', 'A new row never appears',
    'Inside a ViewModel. Item is immutable. Consumers collect rows as UI state.',
    'Review emission behavior and mutation ownership.',
    `val rows = MutableStateFlow(mutableListOf<Item>())
fun add(item: Item) {
    rows.value.add(item)
}`,
    [['rows.value.add', 'The same mutable value is edited without publishing a new state value.', 'Collectors are not notified of the changed list.', 'Keep mutation private and atomically replace the list.']],
    `private val _rows = MutableStateFlow<List<Item>>(emptyList())
val rows = _rows.asStateFlow()
fun add(item: Item) {
    _rows.update { it + item }
}`,
    'The update lambda can run more than once, so keep side effects outside it. Atomic list updates do not implement durable database transactions.',
    'Why might assigning the same mutated list back still emit nothing?'),
  review(6, 'Easy', 'Compose', 'Typing disappears during recomposition',
    'Composable function body. SearchField takes value: String and onValueChange: (String) -> Unit.',
    'Review how the text is retained and made observable.',
    `var query = ""
SearchField(query) { query = it }`,
    [['Local query variable', 'Ordinary local mutation is neither retained composition state nor observable.', 'Input may reset or fail to redraw.', 'Use remembered observable state at the appropriate owner.']],
    `var query by rememberSaveable { mutableStateOf("") }
SearchField(query) { query = it }`,
    'rememberSaveable suits a small UI value. Hoist to a ViewModel if query drives shared business state; persistent drafts need durable storage.',
    'What happens when the composable is removed from the back stack?'),
  review(7, 'Easy', 'Compose', 'Analytics fires while rendering',
    'Inside @Composable ProductScreen(productId: String). analytics.recordOpen is a non-suspending event call.',
    'Find the side-effect ownership issue. Define the intended meaning of one open event.',
    `analytics.recordOpen(productId)
ProductContent(productId)`,
    [['recordOpen in composable body', 'Composition can re-execute or be abandoned.', 'Events can be duplicated or recorded for work that never commits.', 'Tie the event to a composition effect keyed by the product.']],
    `LaunchedEffect(productId) {
    analytics.recordOpen(productId)
}
ProductContent(productId)`,
    'This is once per matching composition lifetime, not globally once per navigation or app session. Use a navigation-level owner if that is the analytics contract.',
    'Should a configuration change count as a new open?'),
  review(8, 'Easy', 'Lifecycle', 'A Fragment retains its destroyed view',
    'Fragment members. FragmentFeedBinding is generated ViewBinding; normal view inflation is omitted.',
    'Review binding ownership when the Fragment remains on the back stack.',
    `private var binding: FragmentFeedBinding? = null
override fun onDestroyView() {
    super.onDestroyView()
}`,
    [['binding field', 'The Fragment outlives its view but retains the binding.', 'The old view tree and Activity can remain reachable.', 'Clear the binding at view destruction and scope view observers to that lifecycle.']],
    `private var binding: FragmentFeedBinding? = null
override fun onDestroyView() {
    binding = null
    super.onDestroyView()
}`,
    'Clearing the field does not fix listeners or coroutines that separately capture the old binding. Each longer-lived reference needs its own ownership cleanup.',
    'How would you confirm the retention path in a heap dump?'),
  review(9, 'Easy', 'Coroutines', 'Cancelling a refresh shows an error',
    'Inside a coroutine. api.refresh suspends and can throw IOException; showRetry updates screen state.',
    'Review cancellation and which failures should be mapped to a user-visible error.',
    `try {
    api.refresh()
} catch (error: Exception) {
    showRetry()
}`,
    [['catch Exception', 'The broad handler also consumes CancellationException.', 'Leaving the screen can be misreported as an error and obsolete work may continue.', 'Rethrow cancellation and handle expected failures explicitly.']],
    `try {
    api.refresh()
} catch (cancelled: CancellationException) {
    throw cancelled
} catch (offline: IOException) {
    showRetry()
}`,
    'A real REST boundary also needs an explicit HTTP and domain-error contract. Do not turn programming bugs into a generic offline banner.',
    'Does runCatching preserve cancellation automatically?'),
  review(10, 'Easy', 'Architecture', 'An application cache owns an Activity',
    'Hilt binding; DiskCache needs only app-private storage and has no themed UI behavior.',
    'Review the Context lifetime and demonstrate a suitable constructor boundary.',
    `@Singleton
class DiskCache @Inject constructor(
    private val activity: Activity
)`,
    [['Singleton Activity dependency', 'An application-scoped object captures a shorter-lived UI owner; default Hilt graphs also reject this binding.', 'A manual binding can retain a destroyed Activity; a normal graph fails compilation.', 'Depend on application Context for this storage-only service.']],
    `@Singleton
class DiskCache @Inject constructor(
    @ApplicationContext private val context: Context
)`,
    'Application Context is not a universal replacement for themed or window-bound operations. Put UI work under a current Activity owner instead.',
    'Does Singleton make cache mutation thread-safe?'),
  review(11, 'Medium', 'Coroutines', 'Parallel loading is detached from its caller',
    'Repository member; profile and orders are required suspend API results, Screen combines them.',
    'Review cancellation, sibling failure, and unnecessary scope creation.',
    `suspend fun load(): Screen {
    val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    val profile = scope.async { api.profile() }
    val orders = scope.async { api.orders() }
    return Screen(profile.await(), orders.await())
}`,
    [['New CoroutineScope', 'The new Job detaches work from the calling coroutine.', 'Caller cancellation does not reliably stop the requests.', 'Use coroutineScope to inherit the caller’s Job.'], ['Supervision of required results', 'SupervisorJob isolates the two required requests from each other’s failures.', 'One failed result can leave its detached sibling running even though no complete screen can be returned.', 'Keep required results as children of one ordinary structured scope.']],
    `suspend fun load(): Screen = coroutineScope {
    val profile = async { api.profile() }
    val orders = async { api.orders() }
    Screen(profile.await(), orders.await())
}`,
    'Ordinary coroutineScope is right when both results are required. Independent optional panels may need supervision and separate error outcomes.',
    'How would you bound concurrency for a feed of hundreds of requests?'),
  review(12, 'Medium', 'Flow', 'Search results arrive in the wrong order',
    'ViewModel property. queries is Flow<String>; repository.search returns Flow<List<Item>> and can throw IOException. Uses experimental Flow operators where required.',
    'Review stale-result handling and whether a failed query prevents future searches.',
    `val results = queries.flatMapMerge { query ->
    repository.search(query)
}.catch { emit(emptyList()) }`,
    [['flatMapMerge', 'Old and new searches emit concurrently without query identity.', 'An old result can replace the latest search.', 'Use flatMapLatest for replaceable reads.'], ['Outer catch', 'An upstream failure is replaced once and the collection then completes.', 'Later queries may no longer produce results.', 'Handle expected failure inside each query stream.']],
    `@OptIn(ExperimentalCoroutinesApi::class, FlowPreview::class)
val results = queries
    .map { it.trim() }
    .debounce(300)
    .distinctUntilChanged()
    .flatMapLatest { query ->
        repository.search(query).catch { error ->
            if (error is IOException) emit(emptyList()) else throw error
        }
    }`,
    'An empty list is only a compact fallback here; production UI should distinguish no matches from an error. Latest cancellation is inappropriate for writes that must finish.',
    'What if the underlying SDK cannot cancel an old request?'),
  review(13, 'Medium', 'Flow', 'A successful checkout vanishes during rotation',
    'ViewModel; a successful checkout result must remain visible to a newly started UI collector. Receipt is immutable.',
    'Review the delivery guarantee of the event stream and propose a renderable outcome.',
    `val receipts = MutableSharedFlow<Receipt>()
suspend fun checkout() {
    receipts.emit(repository.pay())
}`,
    [['Replay-zero receipts', 'A SharedFlow with no replay does not retain a receipt for absent collectors.', 'Rotation can leave the user without confirmation.', 'Expose a current receipt state for returning collectors.'], ['Public mutable flow', 'Callers can emit outcomes outside the owner.', 'State transitions become difficult to reason about or test.', 'Publish a read-only flow.']],
    `private val _receipt = MutableStateFlow<Receipt?>(null)
val receipt = _receipt.asStateFlow()
suspend fun checkout() {
    _receipt.value = repository.pay()
}`,
    'StateFlow survives UI collector restarts, not process death or duplicate payments. Durable payment identity and server idempotency remain necessary.',
    'How would the UI acknowledge a receipt without replaying a navigation action?'),
  review(14, 'Medium', 'Lifecycle', 'Two collectors target an invisible Fragment view',
    'Inside Fragment.onViewCreated. render and showBadge use the current binding; state and badge are non-completing StateFlows.',
    'Review the owner, visibility, and sequential collection behavior.',
    `lifecycleScope.launch {
    viewModel.state.collect { render(it) }
    viewModel.badge.collect { showBadge(it) }
}`,
    [['Fragment lifecycleScope', 'The Fragment can outlive its view and remain alive while invisible.', 'Stale views may be accessed and unnecessary work continues.', 'Use the view lifecycle and repeatOnLifecycle.'], ['Sequential collect calls', 'The first StateFlow collection never completes normally.', 'The badge collector never starts.', 'Launch sibling collectors inside the repeating lifecycle block.']],
    `viewLifecycleOwner.lifecycleScope.launch {
    viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
        launch { viewModel.state.collect { render(it) } }
        launch { viewModel.badge.collect { showBadge(it) } }
    }
}`,
    'Restarting collectors may restart cold upstream producers. Share expensive work at the correct owner and do not assume visibility is equivalent to ViewModel lifetime.',
    'What changes for Compose collection on Android?'),
  review(15, 'Medium', 'Compose', 'A timeout logs out the wrong account',
    'Composable body with accountId: String and onTimeout: () -> Unit. The timer restarts for a new account but not for every callback instance.',
    'Review effect keys and the captured callback when the UI recomposes.',
    `LaunchedEffect(Unit) {
    delay(30_000)
    onTimeout()
}`,
    [['Constant effect key', 'Changing account does not cancel the old timer.', 'A timer from a previous account can affect the next session.', 'Key the effect by accountId.'], ['Captured callback', 'The running effect retains its original callback.', 'It may execute stale UI behavior.', 'Use rememberUpdatedState for a callback that should not restart the timer.']],
    `val latestTimeout by rememberUpdatedState(onTimeout)
LaunchedEffect(accountId) {
    delay(30_000)
    latestTimeout()
}`,
    'Composition removal cancels this UI timer. A security session-expiry policy belongs in a domain/session owner with server validation, not solely in this effect.',
    'When should the callback itself be an effect key?'),
  review(16, 'Medium', 'Room', 'Refreshing deletes the cache before the network returns',
    'Repository method; db is RoomDatabase, dao.clear and insertAll are suspend DAO methods, api.fetch returns List<Entity>.',
    'Review offline behavior and what observers can see between writes.',
    `suspend fun refresh() {
    dao.clear()
    dao.insertAll(api.fetch())
}`,
    [['Clear before fetch', 'The known-good cache is removed before a fallible remote operation.', 'Offline users lose their last usable data.', 'Fetch first and retain cache on failure.'], ['Separate writes', 'The replacement is not atomic.', 'Observers can see an unintended empty state or partial update.', 'Perform the short local replacement in one Room transaction.']],
    `suspend fun refresh() {
    val rows = api.fetch()
    db.withTransaction {
        dao.clear()
        dao.insertAll(rows)
    }
}`,
    'Do not hold a database transaction over network I/O. Replace only this dataset’s rows; local edits and other accounts may require a merge instead of clear.',
    'What if two refreshes finish out of order?'),
  review(17, 'Medium', 'Background', 'A Worker retries a rejected upload forever',
    'Inside CoroutineWorker.doWork. uploadPending uses a stable operation ID and a server deduplication contract; InvalidUpload is a permanent domain failure.',
    'Review retry classification and cancellation. Success must follow the durable upload checkpoint.',
    `return try {
    repository.uploadPending()
    Result.success()
} catch (error: Exception) {
    Result.retry()
}`,
    [['All failures retry', 'Invalid data and cancellation are treated like transient outages.', 'Work churns indefinitely or misreports cancellation.', 'Propagate cancellation and distinguish permanent from transient failures.'], ['Unbounded policy', 'No product attempt limit is applied to transient failure.', 'Persistent outages consume resources without an actionable state.', 'Bound retries and persist a user-visible failure status.']],
    `return try {
    repository.uploadPending()
    Result.success()
} catch (cancelled: CancellationException) {
    throw cancelled
} catch (invalid: InvalidUpload) {
    repository.markFailed()
    Result.failure()
} catch (offline: IOException) {
    if (runAttemptCount < 5) Result.retry() else {
        repository.markFailed()
        Result.failure()
    }
}`,
    'Configure WorkManager backoff and constraints separately. A network constraint is not proof of reachability, and a retry limit is a product decision rather than a universal number.',
    'How do you recover after the server commits but the process dies before local acknowledgement?'),
  review(18, 'Medium', 'Architecture', 'A ViewModel constructs the production database',
    'FeedRepository is an interface exposing Flow<List<Item>>. Room and HTTP implementations exist at the composition root.',
    'Review responsibility boundaries and testability without adding layers that only forward calls.',
    `class FeedViewModel(app: Application) : ViewModel() {
    private val db = Room.databaseBuilder(app, AppDb::class.java, "feed").build()
    private val api = createProductionApi()
    val rows = api.feed()
}`,
    [['Infrastructure construction', 'Screen policy owns concrete storage and network setup.', 'Tests cannot cheaply replace dependencies and instances may be duplicated.', 'Inject a repository boundary.'], ['Direct API reads', 'The database exists but is bypassed as a read source.', 'Offline data and UI freshness can disagree.', 'Observe the repository’s authoritative cache-backed stream.']],
    `class FeedViewModel(
    repository: FeedRepository
) : ViewModel() {
    val rows = repository.observeFeed().stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList()
    )
}`,
    'Manual constructor injection is sufficient here; Hilt can provide the production binding. Add use cases only for meaningful reusable policy, not for every lookup.',
    'Who should own the database instance, dispatcher, and refresh operation?'),
  review(19, 'Medium', 'Coroutines', 'Concurrent counters lose completed work',
    'Member of a ViewModel. count is MutableStateFlow<Int>; several coroutines can invoke recordCompletion concurrently.',
    'Review atomicity and whether changing dispatchers would fix the lost updates.',
    `fun recordCompletion() {
    count.value = count.value + 1
    analytics.recordCompletion()
}`,
    [['Read-modify-write', 'Reading and assigning separately is not an atomic increment.', 'Concurrent completions overwrite one another.', 'Use StateFlow.update for the single-value invariant.'], ['Side-effect placement', 'Moving analytics into an update lambda would introduce a second bug.', 'The lambda may retry and duplicate analytics.', 'Keep side effects outside the atomic transformation.']],
    `fun recordCompletion() {
    count.update { it + 1 }
    analytics.recordCompletion()
}`,
    'This fixes an in-memory counter, not atomicity between analytics and state. Multi-row durable invariants need database transactions or a serialized owner.',
    'When would a Mutex be more appropriate than update?'),
  review(20, 'Medium', 'Lifecycle', 'An unsaved draft survives rotation but not process death',
    'DraftViewModel. The draft ID is a small reconstruction input; content is owned by a durable repository.',
    'Review the restoration contract and whether retaining an Activity would help.',
    `class DraftViewModel : ViewModel() {
    var draftId: String? = null
    var activity: Activity? = null
}`,
    [['In-memory draft ID only', 'ViewModel memory does not survive process death.', 'The editor cannot reconstruct the intended draft.', 'Save a small ID through SavedStateHandle and reload content from storage.'], ['Activity field', 'A retained ViewModel can outlive the Activity instance.', 'Rotation can retain a destroyed Activity.', 'Keep UI owners out of the ViewModel.']],
    `class DraftViewModel(private val saved: SavedStateHandle) : ViewModel() {
    val draftId = saved.getStateFlow<String?>("draftId", null)
    fun open(id: String) { saved["draftId"] = id }
}`,
    'Saved state is a restoration aid, not guaranteed durable persistence after every kind of termination. Save important edits as they happen rather than waiting for onDestroy.',
    'How would you test restoration separately from rotation?'),
  review(21, 'Medium', 'Testing', 'A retry test passes only on a fast laptop',
    'JUnit test. RetryController(scope, dispatcher) starts retry work in its injected scope; it sets retried after a 1-second delay.',
    'Review timing control and what the assertion actually proves.',
    `@Test fun retries() = runBlocking {
    val controller = RetryController(this, Dispatchers.IO)
    controller.start()
    Thread.sleep(1_100)
    assertTrue(controller.retried)
}`,
    [['Real sleep and IO', 'The test depends on wall-clock scheduling and blocks a thread.', 'Slow CI can fail despite correct behavior and failures take real time.', 'Use runTest with a shared test scheduler and injected dispatcher.'], ['Only final state asserted', 'The test does not verify the retry delay boundary.', 'An immediate unintended retry could pass.', 'Assert both before and at the virtual deadline.']],
    `@OptIn(ExperimentalCoroutinesApi::class)
@Test fun retries() = runTest {
    val dispatcher = StandardTestDispatcher(testScheduler)
    val controller = RetryController(backgroundScope, dispatcher)
    controller.start()
    runCurrent()
    advanceTimeBy(999)
    assertFalse(controller.retried)
    advanceTimeBy(1)
    runCurrent()
    assertTrue(controller.retried)
}`,
    'Virtual time only controls work using the test scheduler. A small integration test can still verify actual framework wiring; do not replace all device behavior with fakes.',
    'Why is runCurrent needed at the exact advanced-time boundary?'),
  review(22, 'Medium', 'Performance', 'Expanded list state follows the wrong row',
    'Composable body. rows is an immutable List<Row>; Row has stable String id and title. RowCard remembers expanded state internally.',
    'Review item identity and repeated work during recomposition.',
    `LazyColumn {
    items(rows.sortedBy { it.title }) { row ->
        RowCard(row)
    }
}`,
    [['No domain key', 'State is associated with position when sorted items move.', 'Expansion can appear on the wrong row.', 'Supply stable unique item keys.'], ['Sorting in composition', 'The same sorting work is repeated for unrelated recompositions.', 'Large lists can consume the frame budget.', 'Memoize by immutable input or prepare sorted state off Main when expensive.']],
    `val sorted = remember(rows) { rows.sortedBy { it.title } }
LazyColumn {
    items(sorted, key = { it.id }) { row -> RowCard(row) }
}`,
    'remember assumes input changes are represented honestly; mutating the same list breaks this cache. Measure before optimizing, and move genuinely expensive transforms to the presentation/data owner.',
    'Would adding @Stable fix either problem?'),
  review(23, 'Hard', 'Networking', 'Token refresh resurrects a logged-out session',
    'Contextual Kotlin fragment for an authentication adapter: readSession returns immutable Session(token, generation); refreshToken suspends; installIfGeneration atomically rejects a changed/logout generation. I/O calls occur off Main. mutex is shared by refresh callers.',
    'Review concurrent 401 responses, logout during refresh, and recursive authentication. Return a token for at most one eligible request replay.',
    `suspend fun tokenAfter401(rejected: String): String {
    val token = refreshToken(readSession()!!.token)
    saveToken(token)
    return token
}`,
    [['Uncoordinated refresh', 'Every 401 refreshes independently and does not recheck current credentials.', 'Refresh storms can rotate credentials against one another.', 'Serialize refresh and recheck the token under coordination.'], ['Unconditional install', 'A slow response overwrites logout or a new account.', 'A revoked session can reappear.', 'Install only if the original generation is still current.'], ['Unspecified replay', 'The refresh endpoint and original retry can recursively re-enter auth.', 'Requests loop or repeat non-replayable writes.', 'Exclude refresh from the authenticator and bound original replay at the adapter.']],
    `suspend fun tokenAfter401(rejected: String): String? = mutex.withLock {
    val session = readSession() ?: return@withLock null
    if (session.token != rejected) return@withLock session.token
    val refreshed = refreshToken(session.token)
    if (installIfGeneration(session.generation, refreshed)) refreshed else null
}`,
    'Holding a coroutine Mutex across refresh deliberately implements single-flight here; do not block a JVM monitor or Main. Logout must change generation without waiting on this network lock. Refresh rejection must end authentication, not retry forever.',
    'How would callers share a failure, and what happens to a non-replayable request body?'),
  review(24, 'Hard', 'Room', 'An offline edit is uploaded twice after a crash',
    'Repository. Operation has stable id, recordId and payload. dao.saveEdit and enqueue are suspend writes; api.apply accepts an operation ID as a server-enforced idempotency key; dao.ack is transactional with returned server data.',
    'Review the local durability boundary and the crash window between remote commit and local acknowledgement.',
    `suspend fun edit(operation: Operation) {
    dao.saveEdit(operation)
    api.apply(UUID.randomUUID().toString(), operation.payload)
    dao.markSynced(operation.recordId)
}`,
    [['No durable outbox', 'The edit is saved without atomically recording upload intent.', 'Process death can leave an unscheduled local change.', 'Save the edit and outbox operation together.'], ['Fresh request identity', 'A retry uses a different idempotency key.', 'The server can apply the same logical change twice.', 'Reuse the persisted operation ID on every attempt.'], ['Acknowledgement window', 'Remote commit and local state cannot share one transaction.', 'A crash after commit requires safe replay and reconciliation.', 'Make remote deduplication and local acknowledgement explicit.']],
    `suspend fun edit(operation: Operation) {
    db.withTransaction {
        dao.saveEdit(operation)
        dao.enqueue(operation)
    }
}
suspend fun upload(operation: Operation) {
    val result = api.apply(operation.id, operation.payload)
    db.withTransaction { dao.ack(operation.id, result) }
}`,
    'Schedule an idempotent outbox drain with WorkManager and expose pending/error state. The server must enforce deduplication for an adequate retention window; local code alone cannot guarantee exactly-once writes.',
    'How would you handle a conflicting edit or a deleted record from another device?'),
  review(25, 'Hard', 'Room', 'A slow refresh rolls the cache backward',
    'Repository can be called by UI and a Worker. Server Snapshot has a monotonically increasing revision for one dataset. dao.revision returns the stored revision; all writers must honor the same transaction policy.',
    'Review overlapping refreshes and whether an in-memory Mutex would protect every writer.',
    `suspend fun refresh() {
    val snapshot = api.fetchSnapshot()
    dao.replace(snapshot.rows)
    dao.setRevision(snapshot.revision)
}`,
    [['Completion order as freshness', 'A stale response can arrive after a newer one.', 'The cache silently loses newer server state.', 'Compare server revision when committing, not when requesting.'], ['Separate data and metadata writes', 'Revision and rows can diverge.', 'Observers or subsequent writers can reason from inconsistent metadata.', 'Update both in one durable transaction.']],
    `suspend fun refresh() {
    val snapshot = api.fetchSnapshot()
    db.withTransaction {
        if (snapshot.revision > dao.revision()) {
            dao.replace(snapshot.rows)
            dao.setRevision(snapshot.revision)
        }
    }
}`,
    'This relies on the stated server ordering contract. Device wall clocks are not a substitute. Partition by account/query, and preserve local pending edits rather than destructively replacing them.',
    'How does the design change if the API exposes only an ETag, not an ordered revision?'),
  review(31, 'Easy', 'Flow', 'A Flow is built but never collected',
    'Inside Fragment.onViewCreated. repository.observeRows returns a cold Flow<List<Row>>; render updates the current view. This exercise observes while the view exists. Import lifecycleScope, launch, and Flow.collect.',
    'Explain why render is never called and start collection under the view lifecycle owner.',
`repository.observeRows().onEach { rows -> render(rows) }`,
    [['Unused Flow pipeline', 'onEach creates another Flow; it does not start collecting a cold producer.', 'The repository never runs and the view receives no rows.', 'Use collect inside a coroutine owned by the Fragment view.']],
`viewLifecycleOwner.lifecycleScope.launch {
    repository.observeRows().collect { rows -> render(rows) }
}`,
    'The view lifecycle cancels this job when the view is destroyed. If collection should also stop while the screen is invisible, wrap it in repeatOnLifecycle(STARTED). Do not use GlobalScope merely to start a collector.',
    'Which operation starts a cold Flow: onEach or collect?'),
  review(32, 'Easy', 'Lifecycle', 'A delayed callback retains a closed screen',
    'Activity members. handler is Handler(Looper.getMainLooper()); titleView is initialized before scheduleRefresh. The callback is screen-only and must not run after onDestroy. Handler and Looper are android.os APIs.',
    'Find the reference that can keep this Activity alive after rotation. Cancel the screen-owned callback at destruction.',
`private val refresh = Runnable { titleView.text = "Ready" }
fun scheduleRefresh() {
    handler.postDelayed(refresh, 60_000)
}`,
    [['Queued refresh callback', 'The message queue retains the Runnable, which captures this Activity through titleView.', 'A destroyed Activity and its view can stay reachable until the callback runs; obsolete UI work may execute.', 'Remove this exact Runnable when its Activity owner is destroyed.']],
`private val refresh = Runnable { titleView.text = "Ready" }
fun scheduleRefresh() {
    handler.postDelayed(refresh, 60_000)
}
override fun onDestroy() {
    handler.removeCallbacks(refresh)
    super.onDestroy()
}`,
    'Use the same Runnable instance for posting and removal. Removing all messages could cancel unrelated work on a shared Handler. A lifecycle-owned coroutine with delay is another option; durable background work needs a different owner.',
    'What happens if this Activity is rotated before the 60-second delay finishes?'),
  review(28, 'Hard', 'Room', 'Pagination mixes queries and declares completion too early',
    'Inside RemoteMediator.load after fetching page for feedId. page.nextCursor is authoritative; page.rows may be empty with a next cursor. DAO methods below explicitly scope by feedId; clearForFeed removes items and keys only for that feed.',
    'Review cache identity, remote-key consistency, and end-of-pagination semantics.',
    `if (loadType == LoadType.REFRESH) dao.clearEverything()
dao.insert(page.rows)
keys.save(page.nextCursor)
return MediatorResult.Success(endOfPaginationReached = page.rows.isEmpty())`,
    [['Unpartitioned clearing and keys', 'Independent queries/accounts share one cache namespace.', 'Refreshing one feed destroys another feed or uses its cursor.', 'Partition both rows and remote keys by feed identity.'], ['Non-atomic persistence', 'Items and remote keys can disagree after a crash.', 'Paging can skip or duplicate data.', 'Commit cache and key updates in one Room transaction.'], ['Empty page as completion', 'The contract allows empty pages before the final cursor.', 'The client stops loading available data.', 'Use the server’s explicit cursor completion signal.']],
    `db.withTransaction {
    if (loadType == LoadType.REFRESH) dao.clearForFeed(feedId)
    dao.insertForFeed(feedId, page.rows)
    keys.saveForFeed(feedId, page.nextCursor)
}
return MediatorResult.Success(endOfPaginationReached = page.nextCursor == null)`,
    'Define stable server ordering and deduplicate item IDs; a transaction does not fix an inconsistent remote cursor contract. Fetch outside the transaction and retain old cache if the fetch fails.',
    'How would you test a process restart after items are written but before keys are saved?'),
  review(33, 'Easy', 'Coroutines', 'An optional recommendation request fails the screen',
    'Repository helper called by a screen loader. api.recommendations is a main-safe suspend function returning List<Recommendation> and can throw java.io.IOException. Product policy allows an empty optional panel during an I/O failure; programming errors must still propagate.',
    'Handle the expected optional-request failure without hiding unrelated exceptions or cancellation.',
`suspend fun optionalRecommendations(): List<Recommendation> =
    api.recommendations()`,
    [['Unmapped expected I/O failure', 'The helper propagates IOException despite its stated optional-panel fallback policy.', 'A temporary recommendation outage can fail the surrounding screen load.', 'Catch IOException at this boundary and return the specified empty-list fallback.']],
`suspend fun optionalRecommendations(): List<Recommendation> =
    try {
        api.recommendations()
    } catch (offline: IOException) {
        emptyList()
    }`,
    'An empty fallback is valid only under this product policy. Required data should not be silently replaced. Catching IOException leaves coroutine cancellation and programming failures visible; a richer UI can distinguish unavailable recommendations from a genuine empty result.',
    'Why is catching IOException safer here than catching every Exception?'),
  review(34, 'Easy', 'Lifecycle', 'A refresh crashes when the user is signed out',
    'Inside a ViewModel. activeAccount is StateFlow<String?> and null means signed out. A connectivity callback may invoke this helper even when signed out. api.refresh(accountId) is a main-safe suspend call; no request should start without an account ID.',
    'Replace the force unwrap with a clear early return for the signed-out state.',
`suspend fun refreshIfSignedIn() {
    api.refresh(activeAccount.value!!)
}`,
    [['Force-unwrapped account ID', 'Signed-out state is a normal nullable value, not a programming impossibility.', 'A connectivity-triggered refresh can crash before making a request.', 'Capture the account ID in a local val and return when it is null.']],
`suspend fun refreshIfSignedIn() {
    val accountId = activeAccount.value ?: return
    api.refresh(accountId)
}`,
    'This checks whether a request may start; it does not authorize server access or handle logout while a request is already running. Keep those separate policies at the appropriate session and data boundaries.',
    'What does the Elvis operator do when activeAccount.value is null?'),
];
