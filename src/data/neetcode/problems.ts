// Original selection from NeetCode_Android_Daily_20.md, plus six roadmap prerequisites. Metadata only; no statements or solutions.
export interface NeetCodeProblem { id: string; title: string; difficulty: 'Easy' | 'Medium' | 'Hard'; topic: string; pattern: string; url: string }
export const neetcodeProblems: readonly NeetCodeProblem[] = [
  {
    "id": "contains-duplicate",
    "title": "Contains Duplicate",
    "difficulty": "Easy",
    "topic": "Arrays & Hashing",
    "pattern": "HashSet membership",
    "url": "https://neetcode.io/problems/duplicate-integer/question"
  },
  {
    "id": "valid-anagram",
    "title": "Valid Anagram",
    "difficulty": "Easy",
    "topic": "Arrays & Hashing",
    "pattern": "Frequency maps",
    "url": "https://neetcode.io/problems/is-anagram/question"
  },
  {
    "id": "two-sum",
    "title": "Two Sum",
    "difficulty": "Easy",
    "topic": "Arrays & Hashing",
    "pattern": "HashMap lookup",
    "url": "https://neetcode.io/problems/two-integer-sum/question"
  },
  {
    "id": "relative-sort-array",
    "title": "Relative Sort Array",
    "difficulty": "Easy",
    "topic": "Arrays & Hashing",
    "pattern": "Frequency map + custom order",
    "url": "https://neetcode.io/problems/relative-sort-array/question"
  },
  {
    "id": "sort-the-people",
    "title": "Sort the People",
    "difficulty": "Easy",
    "topic": "Arrays & Hashing",
    "pattern": "Sort associated records",
    "url": "https://neetcode.io/problems/sort-the-people/question"
  },
  {
    "id": "group-anagrams",
    "title": "Group Anagrams",
    "difficulty": "Medium",
    "topic": "Arrays & Hashing",
    "pattern": "Grouping by key",
    "url": "https://neetcode.io/problems/anagram-groups/question"
  },
  {
    "id": "top-k-frequent-elements",
    "title": "Top K Frequent Elements",
    "difficulty": "Medium",
    "topic": "Arrays & Hashing",
    "pattern": "Frequency counting + top K",
    "url": "https://neetcode.io/problems/top-k-elements-in-list/question"
  },
  {
    "id": "valid-palindrome",
    "title": "Valid Palindrome",
    "difficulty": "Easy",
    "topic": "Two Pointers",
    "pattern": "Two pointers",
    "url": "https://neetcode.io/problems/is-palindrome/question"
  },
  {
    "id": "valid-parentheses",
    "title": "Valid Parentheses",
    "difficulty": "Easy",
    "topic": "Stack",
    "pattern": "Stack",
    "url": "https://neetcode.io/problems/validate-parentheses/question"
  },
  {
    "id": "daily-temperatures",
    "title": "Daily Temperatures",
    "difficulty": "Medium",
    "topic": "Stack",
    "pattern": "Monotonic stack",
    "url": "https://neetcode.io/problems/daily-temperatures/question"
  },
  {
    "id": "binary-search",
    "title": "Binary Search",
    "difficulty": "Easy",
    "topic": "Binary Search",
    "pattern": "Boundary handling",
    "url": "https://neetcode.io/problems/binary-search/question"
  },
  {
    "id": "search-in-rotated-sorted-array",
    "title": "Search in Rotated Sorted Array",
    "difficulty": "Medium",
    "topic": "Binary Search",
    "pattern": "Modified binary search",
    "url": "https://neetcode.io/problems/find-target-in-rotated-sorted-array/question"
  },
  {
    "id": "best-time-to-buy-and-sell-stock",
    "title": "Best Time to Buy and Sell Stock",
    "difficulty": "Easy",
    "topic": "Sliding Window",
    "pattern": "One-pass state tracking",
    "url": "https://neetcode.io/problems/buy-and-sell-crypto/question"
  },
  {
    "id": "longest-substring-without-repeating-characters",
    "title": "Longest Substring Without Repeating Characters",
    "difficulty": "Medium",
    "topic": "Sliding Window",
    "pattern": "Sliding window",
    "url": "https://neetcode.io/problems/longest-substring-without-duplicates/question"
  },
  {
    "id": "reverse-linked-list",
    "title": "Reverse Linked List",
    "difficulty": "Easy",
    "topic": "Linked List",
    "pattern": "Pointer updates",
    "url": "https://neetcode.io/problems/reverse-a-linked-list/question"
  },
  {
    "id": "lru-cache",
    "title": "LRU Cache",
    "difficulty": "Medium",
    "topic": "Linked List",
    "pattern": "HashMap + recency ordering",
    "url": "https://neetcode.io/problems/lru-cache/question"
  },
  {
    "id": "binary-tree-level-order-traversal",
    "title": "Binary Tree Level Order Traversal",
    "difficulty": "Medium",
    "topic": "Trees",
    "pattern": "BFS queue",
    "url": "https://neetcode.io/problems/level-order-traversal-of-binary-tree/question"
  },
  {
    "id": "kth-largest-element-in-a-stream",
    "title": "Kth Largest Element in a Stream",
    "difficulty": "Easy",
    "topic": "Heap / Priority Queue",
    "pattern": "Bounded min-heap for streaming top K",
    "url": "https://neetcode.io/problems/kth-largest-integer-in-a-stream/question"
  },
  {
    "id": "last-stone-weight",
    "title": "Last Stone Weight",
    "difficulty": "Easy",
    "topic": "Heap / Priority Queue",
    "pattern": "Max-heap simulation",
    "url": "https://neetcode.io/problems/last-stone-weight/question"
  },
  {
    "id": "kth-largest-element-in-an-array",
    "title": "Kth Largest Element in an Array",
    "difficulty": "Medium",
    "topic": "Heap / Priority Queue",
    "pattern": "Bounded min-heap for top K",
    "url": "https://neetcode.io/problems/kth-largest-element-in-an-array/question"
  },
  {
    "id": "subsets",
    "title": "Subsets",
    "difficulty": "Medium",
    "topic": "Backtracking",
    "pattern": "Include/exclude decisions and recursive state",
    "url": "https://neetcode.io/problems/subsets/question"
  },
  {
    "id": "combination-sum",
    "title": "Combination Sum",
    "difficulty": "Medium",
    "topic": "Backtracking",
    "pattern": "Backtracking with reuse and pruning",
    "url": "https://neetcode.io/problems/combination-target-sum/question"
  },
  {
    "id": "permutations",
    "title": "Permutations",
    "difficulty": "Medium",
    "topic": "Backtracking",
    "pattern": "Backtracking with used-element tracking",
    "url": "https://neetcode.io/problems/permutations/question"
  },
  {
    "id": "number-of-islands",
    "title": "Number of Islands",
    "difficulty": "Medium",
    "topic": "Graphs",
    "pattern": "Grid traversal",
    "url": "https://neetcode.io/problems/count-number-of-islands/question"
  },
  {
    "id": "climbing-stairs",
    "title": "Climbing Stairs",
    "difficulty": "Easy",
    "topic": "1-D Dynamic Programming",
    "pattern": "Intro to DP",
    "url": "https://neetcode.io/problems/climbing-stairs/question"
  },
  {
    "id": "merge-intervals",
    "title": "Merge Intervals",
    "difficulty": "Medium",
    "topic": "Intervals",
    "pattern": "Sort + merge ranges",
    "url": "https://neetcode.io/problems/merge-intervals/question"
  }
];
