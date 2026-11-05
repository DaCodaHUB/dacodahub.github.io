# Daily NeetCode dataset

`problems.ts` is the active 26-problem dataset. It preserves the original 20
problems, IDs, difficulties, and patterns from the supplied
`NeetCode_Android_Daily_20.md`, retained beside it for provenance. Problem statements and proprietary solution text are not included. Original
Kotlin references are maintained separately in `kotlin-solutions.ts`. Six foundational
prerequisite exercises extend that selection.

The problem sequence is Arrays & Hashing (7), Two Pointers (1), Stack (2),
Binary Search (2), Sliding Window (2), Linked List (2), Trees (1), Heap / Priority Queue (3), Backtracking (3), Graphs (1),
1-D Dynamic Programming (1), Intervals (1). Easy precedes Medium within topics.

`roadmap.ts` records the official graph checked on 2026-10-29 at
https://neetcode.io/roadmap. This sequence is a topological ordering, not a claim
that each adjacent topic depends on the previous one. Two Pointers and Stack
depend on Arrays & Hashing; Binary Search, Sliding Window, and Linked List
depend on Two Pointers. Trees depends on Linked List and Binary Search.
Graphs and 1-D DP depend on Backtracking, which depends on Trees. Intervals
depends on Heap / Priority Queue, which also depends on Trees.

The original selection had no Heap or Backtracking exercises. The expansion adds:

| Topic | Problem (stable ID) | Difficulty | Focus |
| --- | --- | --- | --- |
| Heap / Priority Queue | Kth Largest Element in a Stream (`kth-largest-element-in-a-stream`) | Easy | Bounded min-heap |
| Heap / Priority Queue | Last Stone Weight (`last-stone-weight`) | Easy | Max-heap simulation |
| Heap / Priority Queue | Kth Largest Element in an Array (`kth-largest-element-in-an-array`) | Medium | Top K with a heap |
| Backtracking | Subsets (`subsets`) | Medium | Include/exclude decisions |
| Backtracking | Combination Sum (`combination-sum`) | Medium | Reuse and pruning |
| Backtracking | Permutations (`permutations`) | Medium | Used-element tracking |

All six belong to the official NeetCode 150 roadmap. Its Backtracking topic
has no Easy problems, so the introductory Medium exercises establish the pattern
without adding Hard problems. No other transitive prerequisite topic for the
active collection lacks practice. Heap and Backtracking both follow Trees;
Graphs and DP follow Backtracking, and Intervals follows Heap.

Passive study checkpoints have been removed. Previously saved acknowledgements
remain untouched in storage but do not skip actual practice. Original problem
statuses and saved browsing IDs retain their keys and values. If all 20 original
problems were completed and no category was saved, the default category is the
earliest with incomplete prerequisite practice. Users can freely revisit,
navigate, and mark any problem; prerequisites govern recommendations while
unlimited practice remains available.

Categories follow the existing roadmap order and come from the active problem bank.
The selected category persists; absent or retired selections fall back to the first
category with incomplete problems. Prerequisite topics must be fully Completed
before an incomplete category receives recommendations; free practice stays open.

Daily recommendations use local calendar-day ordinals modulo the eligible bank,
prefer incomplete problems, and exclude yesterday when another incomplete option
exists. A per-category `{ day, id }` snapshot freezes each day's pick through status
changes and refreshes. Completed categories rotate all their problems for review.
Manual browsing never affects selection. Midnight updates labels and the return-to-
today action without replacing an open exercise or revealed solution.

Native selects show green checkmarks and category counts. Only current Completed
status counts; Needs Review removes both the problem check and category completion.
New keys under the existing prefix are `category` and `daily:<topic>`. Existing
`problem:<id>` and `current` keys remain intact; `current` is practice history, not
an input to the daily algorithm. Corrupt snapshots are recomputed safely.

Progress uses only `daily-android:neetcode:v1:` browser storage keys, separate
from Android review and Flashcard storage. If storage fails, progress remains
usable for the page session and the UI reports that it cannot persist.

Validation (no local `docs/` inputs):

```text
npm test
npm run check
npm run build
npm run daily:validate
npm run daily:test-browser
node --experimental-strip-types scripts/daily-android/check-neetcode-links.ts
```

The link checker verifies both the native `ncLink` routing metadata and HTTP
responses, because NeetCode's client-rendered application may serve HTTP 200
for unknown routes. Several native problem slugs differ from the solution links
in the original document. Link verification is an explicit network check;
normal tests and builds work offline.


## Original Kotlin reference solutions

`kotlin-solutions.ts` is keyed by stable problem ID and covers all 26 active
problems, including the six prerequisite additions. Each entry has full code,
pattern, original explanation, time/space complexity, Kotlin feature notes and
platform signature/type guidance. Build validation rejects missing entries or
fields, so future problems must supply a reference as well.

Each solution starts hidden. Native details/summary supports keyboard reveal;
changing problem or refreshing closes the reference. Status updates preserve
an already-open reference and code selection. Copy Code copies the highlighted
code's plain text with the Clipboard API; if blocked, it selects the code and
explains how to copy manually. No answer fields or solution-visibility storage
are introduced. Existing problem data, links, roadmap and progress keys are
unchanged.

Verification on 2026-10-29: all 26 exact displayed implementations compiled with
Kotlin/JVM 2.0.21, targeting JVM 17, and executed successfully through 31,640
assertions. Checks include representative examples, edge cases, deterministic
randomized comparisons, exhaustive rotated searches, LRU eviction/update
sequences, independent brute-force oracles, and large tree/grid inputs.
These are local tests, not claims of submission acceptance by an online judge.

Reverse Linked List uses the judge-provided `ListNode` with nullable `next`.
Level Order Traversal uses `TreeNode` with a property named `val` (accessed with
Kotlin backticks) and nullable `left`/`right`. The harness supplies matching
stand-ins, not definitions to paste over judge types. Number of Islands uses
`Array<CharArray>` and needs no GraphNode. LRUCache defines its own private
linked nodes. KthLargest and LRUCache use design-class signatures rather than
a Solution wrapper. The duplicate check includes both `containsDuplicate` and
`hasDuplicate` entry points for editor naming differences.

Re-run compilation and execution with:

```text
npm run neetcode:test-kotlin
```

The explicit compiler check uses locally cached Gradle compiler artifacts for
Kotlin 2.0.21, without downloading or installing software. On another machine,
provide `KOTLIN_COMPILER_CLASSPATH` (compiler and its runtime dependencies),
`KOTLIN_STDLIB` (stdlib JAR), and optionally `JAVA_BIN` or `KOTLIN_GRADLE_CACHE`.
It fails clearly if tooling is unavailable; ordinary tests/checks/builds do not
require a compiler installation. Generated harness files and classes live in
ignored `.astro/neetcode-kotlin/`. `kotlin-cases.ts` stores executable fixtures;
`kotlin-solutions.test.ts` checks complete dataset and fixture coverage.
