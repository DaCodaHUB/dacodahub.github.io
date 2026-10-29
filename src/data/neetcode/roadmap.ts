// Official graph verified 2026-10-29 at https://neetcode.io/roadmap.
// Sibling branches are not prerequisites of each other.
export const roadmapOrder = ["Arrays & Hashing", "Two Pointers", "Stack", "Binary Search", "Sliding Window", "Linked List", "Trees", "Heap / Priority Queue", "Backtracking", "Graphs", "1-D Dynamic Programming", "Intervals"] as const;
export const prerequisites: Readonly<Record<string, readonly string[]>> = {
  "Arrays & Hashing": [],
  "Two Pointers": [
    "Arrays & Hashing"
  ],
  "Binary Search": [
    "Two Pointers"
  ],
  "Stack": [
    "Arrays & Hashing"
  ],
  "Sliding Window": [
    "Two Pointers"
  ],
  "Linked List": [
    "Two Pointers"
  ],
  "Trees": [
    "Linked List",
    "Binary Search"
  ],
  "Tries": [
    "Trees"
  ],
  "Heap / Priority Queue": [
    "Trees"
  ],
  "Backtracking": [
    "Trees"
  ],
  "Graphs": [
    "Backtracking"
  ],
  "1-D Dynamic Programming": [
    "Backtracking"
  ],
  "Intervals": [
    "Heap / Priority Queue"
  ],
  "Greedy": [
    "Heap / Priority Queue"
  ],
  "Advanced Graphs": [
    "Heap / Priority Queue",
    "Graphs"
  ],
  "Math & Geometry": [
    "2-D Dynamic Programming",
    "Bit Manipulation"
  ],
  "2-D Dynamic Programming": [
    "Graphs",
    "1-D Dynamic Programming"
  ],
  "Bit Manipulation": [
    "1-D Dynamic Programming"
  ]
};
