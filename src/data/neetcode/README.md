# Daily NeetCode dataset

`problems.ts` is the active 26-problem dataset. It preserves the original 20
problems, IDs, difficulties, and patterns from the supplied
`NeetCode_Android_Daily_20.md`, retained beside it for provenance. Only metadata
is included; statements and solutions remain on NeetCode. Six foundational
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
statuses and saved browsing IDs retain their keys and values. Even if all 20
original problems were completed, the next recommendation is the first new
incomplete prerequisite problem. Users can still freely revisit, navigate, and
mark any problem; prerequisite topics are shown as context rather than blocking
unlimited practice.

The daily recommendation is always the earliest problem whose current status
is not Completed, including Needs Review. Calendar changes do not advance it.
Next/Previous and the selector support free practice and retain the browsing
position across reloads. The Daily recommendation button returns to the earliest
incomplete item. No session action clears completed problems.

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
