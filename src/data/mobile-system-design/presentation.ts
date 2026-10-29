// Presentation metadata only. The original briefs and reference text stay intact.
type Role = 'ui' | 'logic' | 'storage' | 'work' | 'risk';
interface Node { label: string; role: Role }
interface Flow { from: Node; to: Node; label: string; bidirectional?: boolean; async?: boolean }
interface Presentation { summary: string; flows: Flow[]; recommendation: string; why: string; alternative: string; risk: string }
const ui = (label: string): Node => ({ label, role: 'ui' });
const logic = (label: string): Node => ({ label, role: 'logic' });
const storage = (label: string): Node => ({ label, role: 'storage' });
const work = (label: string): Node => ({ label, role: 'work' });
const risk = (label: string): Node => ({ label, role: 'risk' });
const flow = (from: Node, to: Node, label: string, bidirectional = false, async = false): Flow => ({ from, to, label, bidirectional, async });
export const designPresentation: Record<string, Presentation> = {
  'msd-001': {
    summary: 'Room is the UI source of truth. The worker reads the durable outbox and writes acknowledgements and pulled changes back to Room; it never updates the screen directly.',
    flows: [flow(ui('Compose UI'), logic('ViewModel'), 'Actions / state', true), flow(logic('ViewModel'), logic('Notes repository'), 'Save / observe', true), flow(logic('Notes repository'), storage('Room + outbox'), 'Atomic writes / Flow', true), flow(work('Sync worker'), storage('Room + outbox'), 'Drain / reconcile', true, true), flow(work('Sync worker'), work('Notes API'), 'Operations / revisions', true, true)],
    recommendation: 'Room + transactional outbox', why: 'A local save and its pending sync operation commit together, even if the process dies.', alternative: 'Server-confirmed saves reduce local conflict work but prevent offline editing.', risk: 'A late acknowledgement must not mark a newer edit Synced.',
  },
  'msd-002': {
    summary: 'Paging reads the database. RemoteMediator fetches network pages and commits rows plus remote keys together; network responses reach the UI through Room.',
    flows: [flow(ui('Feed UI'), logic('ViewModel / Paging 3'), 'Scroll / load state', true), flow(logic('PagingSource'), storage('Room feed cache'), 'Query / invalidation', true), flow(logic('Paging 3'), work('RemoteMediator'), 'Request page', false, true), flow(work('RemoteMediator'), work('Feed API'), 'Cursor / page', true, true), flow(work('RemoteMediator'), storage('Room + remote keys'), 'Atomic page commit'), flow(logic('Like queue'), work('Like API'), 'Intent / acknowledgement', true, true)],
    recommendation: 'Snapshot cursors + Room cache', why: 'Stable snapshot membership prevents inserts from shifting paging boundaries.', alternative: 'Offset pagination is simpler but can duplicate or skip posts as the feed changes.', risk: 'Fence stale append responses when a refresh changes the snapshot.',
  },
  'msd-003': {
    summary: 'The session repository owns identity. Browser authorization and a single-flight refresh coordinator update encrypted credentials; authenticated requests are fenced by the active session generation.',
    flows: [flow(ui('Sign-in UI'), logic('Session repository'), 'Intent / session state', true), flow(logic('Auth coordinator'), work('External browser / IdP'), 'PKCE / validated redirect', true, true), flow(logic('Session repository'), storage('Encrypted credentials'), 'Atomic rotation / read', true), flow(logic('Token provider'), logic('Refresh coordinator'), 'Single-flight refresh', true, true), flow(logic('Refresh coordinator'), work('Token endpoint'), 'Attempt ID / new tokens', true, true), flow(logic('API client'), work('Protected API'), 'Token / authorized result', true, true)],
    recommendation: 'Single-flight refresh + session fences', why: 'Concurrent 401s share a refresh, and old responses cannot revive a logged-out account.', alternative: 'Persisting encrypted access tokens saves refreshes; memory-only tokens reduce persistence exposure.', risk: 'A lost rotation response needs the same durable attempt ID, not a guessed token.',
  },
  'msd-004': {
    summary: 'The local queue is durable; worker execution is temporary. File staging precedes enqueue, chunks are checkpointed, and only a server commit confirms an uploaded asset.',
    flows: [flow(ui('Upload UI'), logic('Upload repository'), 'Queue / observed progress', true), flow(logic('Upload repository'), storage('Staged files + Room'), 'Stage / durable record', true), flow(logic('Scheduler'), work('WorkManager'), 'Enqueue bounded work', false, true), flow(work('Upload worker'), storage('Room upload queue'), 'Read / checkpoint', true, true), flow(work('Upload worker'), work('Upload API'), 'Chunks / committed offset', true, true), flow(work('Upload API'), storage('Room upload queue'), 'Confirmed asset via worker')],
    recommendation: 'Resumable protocol + durable queue', why: 'A transfer can resume after its execution window or process ends.', alternative: 'Immediate long user transfers may need a supported transfer job or permitted foreground service.', risk: 'Bytes sent do not imply asset commit; cancellation can race server acceptance.',
  },
  'msd-005': {
    summary: 'REST acknowledgements, socket events and history recovery converge in Room. The UI observes the repository, while a persisted contiguous sequence detects missing events.',
    flows: [flow(ui('Conversation UI'), logic('Message repository'), 'Send / observed history', true), flow(logic('Message repository'), storage('Room + send outbox'), 'Atomic pending message', true), flow(work('Send coordinator'), work('REST message API'), 'Client ID / acceptance', true, true), flow(work('Foreground WebSocket'), logic('Event ingestor'), 'Events; may duplicate', false, true), flow(logic('Event ingestor'), storage('Room history'), 'Deduplicate / upsert'), flow(work('Gap resolver'), work('History API'), 'Missing sequence range', true, true), flow(work('Background push'), logic('Sync coordinator'), 'Hint, not delivery', false, true)],
    recommendation: 'Local history + idempotent message IDs', why: 'Multiple transport paths can safely converge on the same stored message.', alternative: 'Polling reduces connection complexity but increases latency and radio work.', risk: 'The largest sequence seen is not necessarily the largest contiguous sequence.',
  },
  'msd-006': {
    summary: 'Push and App Links enter one validated route pipeline. A retained destination passes the account gate and task authorization before navigation; push remains an optional hint.',
    flows: [flow(work('FCM hint'), logic('Notification handler'), 'Validate / deduplicate', false, true), flow(logic('Notification handler'), ui('Notification'), 'Publish if permitted'), flow(ui('Notification tap / link'), logic('Destination parser'), 'Untrusted input'), flow(logic('Destination parser'), storage('Pending destination'), 'Persist typed route', true), flow(logic('Account gate'), work('Task API'), 'Fetch / authorize', true, true), flow(storage('Pending destination'), logic('Navigation coordinator'), 'Restore / consume route', true), flow(logic('Account gate'), logic('Navigation coordinator'), 'Authorized destination'), flow(logic('Navigation coordinator'), ui('Task screen'), 'Consume route once')],
    recommendation: 'Typed routes + account authorization gate', why: 'Cold and warm starts use one path without leaking cached data across accounts.', alternative: 'Automatically displayed notification payloads change callback and presentation handling.', risk: 'Verified domain ownership does not authorize access to a task.',
  },
  'msd-007': {
    summary: 'A repository separates UI state from a foreground connection controller. GATT operations are serialized; transport completion and sensor acknowledgement are distinct events.',
    flows: [flow(ui('Compose dashboard'), logic('ViewModel'), 'Actions / display state', true), flow(logic('ViewModel'), logic('BLE repository'), 'Commands / readings', true), flow(logic('BLE repository'), work('Connection controller'), 'State machine / events', true), flow(work('Connection controller'), work('GATT / sensor'), 'Queued writes / notifications', true, true), flow(work('GATT / sensor'), logic('Protocol codec'), 'Packets / command ACKs', false, true), flow(logic('Protocol codec'), logic('BLE repository'), 'Validated readings / ACKs'), flow(logic('BLE repository'), storage('Room samples'), 'Sample / cached history', true)],
    recommendation: 'Foreground owner + serialized GATT queue', why: 'Connection generations and application ACKs make device state explicit.', alternative: 'Continuous background collection requires a new contract and suitable companion/service APIs.', risk: 'A GATT write callback does not prove the sensor applied the command.',
  },
  'msd-008': {
    summary: 'Local applied values overlay confirmed settings. A sync engine serializes each key, sends versioned compare-and-set operations, and reconciles the result without clearing newer intent.',
    flows: [flow(ui('Settings UI'), logic('Settings repository'), 'Validated edit / state', true), flow(logic('Settings repository'), storage('Local settings + outbox'), 'Atomic intent / observe', true), flow(work('Sync engine'), storage('Local settings + outbox'), 'Drain / reconcile by key', true, true), flow(work('Sync engine'), work('Settings API'), 'Revisioned CAS / result', true, true), flow(work('Settings API'), work('Other devices'), 'Independent sync', true, true), flow(risk('409 conflict'), logic('Per-field resolution'), 'Server winner + notice')],
    recommendation: 'Per-field revisions + immutable operation IDs', why: 'Independent edits merge without relying on device wall clocks.', alternative: 'Whole-document last-write-wins is simpler but loses unrelated concurrent edits.', risk: 'An old acknowledgement must not clear a newer local generation.',
  },
};

// Emphasis is rendered as text nodes and <strong>, never injected HTML.
export function emphasizedParts(text: string) {
  return text.split(/(WorkManager|RemoteMediator|PagingSource|Paging 3|Room|DataStore|StateFlow|ViewModel|WebSockets?|PKCE|GATT|FCM|compare-and-set|operationId|clientMessageId|baseRevision|single-flight|source of truth|transactionally|atomically|Mandatory:)/g).map((value, index) => ({ value, strong: index % 2 === 1 }));
}
export function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+(?=[A-Z])/);
}
