// Original interview implementations and explanations, not copied solution text.
export interface KotlinSolution {
  code: string;
  pattern: string;
  explanation: string;
  time: string;
  space: string;
  kotlin: string;
  platform: string;
}
const standard = 'Kotlin/JVM: class Solution with the shown public method. No Android dependencies. Parameter names may differ between editors; positional arguments and types are unchanged.';
export const kotlinSolutions: Readonly<Record<string, KotlinSolution>> = {
  'contains-duplicate': {
    code: `class Solution {
    fun containsDuplicate(nums: IntArray): Boolean {
        val seen = mutableSetOf<Int>()
        for (num in nums) {
            if (!seen.add(num)) return true
        }
        return false
    }

    // Alias for editors that name this operation hasDuplicate.
    fun hasDuplicate(nums: IntArray): Boolean = containsDuplicate(nums)
}`,
    pattern: 'HashSet membership', explanation: 'The set contains exactly the values already visited. A failed insertion therefore proves a repeated value; if every insertion succeeds, all values are distinct. Empty and single-element arrays return false.',
    time: 'O(n) expected, assuming average constant-time hashing.', space: 'O(n) auxiliary.', kotlin: 'mutableSetOf<Int>() creates a mutable hash-based set. add returns whether the value was newly inserted; IntArray avoids boxing the input.', platform: standard,
  },
  'valid-anagram': {
    code: `class Solution {
    fun isAnagram(s: String, t: String): Boolean {
        if (s.length != t.length) return false
        val counts = mutableMapOf<Char, Int>()
        for (char in s) counts[char] = counts.getOrDefault(char, 0) + 1
        for (char in t) {
            val remaining = counts.getOrDefault(char, 0)
            if (remaining == 0) return false
            counts[char] = remaining - 1
        }
        return true
    }
}`,
    pattern: 'Frequency map', explanation: 'Count each character in the first string, then consume one occurrence for every character in the second. Equal lengths plus no exhausted count imply equal multiplicities. This uses Kotlin Char units, sufficient for the problem’s lowercase English alphabet.',
    time: 'O(n) expected.', space: 'O(a), where a is the number of distinct characters; O(1) for a fixed alphabet.', kotlin: 'mutableMapOf and getOrDefault make missing counts explicit. String iteration yields Char values; early returns avoid unnecessary work.', platform: standard,
  },
  'two-sum': {
    code: `class Solution {
    fun twoSum(nums: IntArray, target: Int): IntArray {
        val positions = mutableMapOf<Int, Int>()
        for ((index, num) in nums.withIndex()) {
            val previous = positions[target - num]
            if (previous != null) return intArrayOf(previous, index)
            positions[num] = index
        }
        error("The problem guarantees one valid pair")
    }
}`,
    pattern: 'HashMap complement lookup', explanation: 'Before inserting the current index, search for a previously seen complement. This prevents reusing the same position and handles equal values at distinct indices. The previous index is smaller, satisfying the linked problem’s output ordering. Arithmetic fits Int under its constraints.',
    time: 'O(n) expected.', space: 'O(n) auxiliary.', kotlin: 'withIndex supports destructuring index/value pairs. Map lookup returns Int?, and the null check smart-casts a found index. intArrayOf returns the expected primitive array.', platform: standard,
  },
  'relative-sort-array': {
    code: `class Solution {
    fun relativeSortArray(arr1: IntArray, arr2: IntArray): IntArray {
        val counts = mutableMapOf<Int, Int>()
        for (value in arr1) counts[value] = counts.getOrDefault(value, 0) + 1
        val result = IntArray(arr1.size)
        var write = 0
        for (value in arr2) {
            repeat(counts.remove(value) ?: 0) { result[write++] = value }
        }
        for (value in counts.keys.sorted()) {
            repeat(counts.getValue(value)) { result[write++] = value }
        }
        return result
    }
}`,
    pattern: 'Frequency map and ordered emission', explanation: 'Emit all occurrences of each arr2 value in its prescribed order, removing those keys. Only unranked values remain; emitting their sorted keys places the remaining values in ascending order. Multiplicities are retained and neither input is mutated.',
    time: 'O(n + m + u log u), where u is the number of remaining distinct values.', space: 'O(n + u) including the returned array; O(u + m) at most for stored distinct keys.', kotlin: 'remove returns the old count or null. The Elvis operator supplies zero, repeat emits duplicates, and sorted creates an ordered key list.', platform: standard,
  },
  'sort-the-people': {
    code: `class Solution {
    fun sortPeople(names: Array<String>, heights: IntArray): Array<String> {
        val order = heights.indices.sortedWith(compareByDescending<Int> { heights[it] })
        return Array(names.size) { names[order[it]] }
    }
}`,
    pattern: 'Sort associated records by index', explanation: 'Sort indices by descending height, then read each name through that index. Keeping the association by index handles repeated names correctly. The problem guarantees distinct heights and matching input lengths.',
    time: 'O(n log n).', space: 'O(n) for sorted indices and the returned array.', kotlin: 'indices supplies valid array positions. sortedWith and compareByDescending define the comparator without subtraction overflow. Array(size) initializes the output.', platform: standard,
  },
  'group-anagrams': {
    code: `class Solution {
    fun groupAnagrams(strs: Array<String>): List<List<String>> {
        val groups = mutableMapOf<String, MutableList<String>>()
        for (word in strs) {
            val counts = IntArray(26)
            for (char in word) counts[char - 'a']++
            val key = counts.joinToString("#")
            groups.getOrPut(key) { mutableListOf() }.add(word)
        }
        return groups.values.toList()
    }
}`,
    pattern: 'HashMap keyed by character frequencies', explanation: 'Two lowercase English strings are anagrams exactly when their 26 counts agree. Separators make the serialized count vector unambiguous, and all empty strings share the zero vector. Group order is intentionally unspecified.',
    time: 'O(L + 26n) expected, where L is the total input character count.', space: 'O(26g + n) for g group keys and output references, treating bounded count digits as constant.', kotlin: 'IntArray uses primitive counters. Do not use an IntArray directly as a content-equality map key: joinToString produces a structural String key. getOrPut lazily creates each mutable group.', platform: standard,
  },
  'top-k-frequent-elements': {
    code: `class Solution {
    fun topKFrequent(nums: IntArray, k: Int): IntArray {
        val counts = mutableMapOf<Int, Int>()
        for (num in nums) counts[num] = counts.getOrDefault(num, 0) + 1
        val buckets = Array(nums.size + 1) { mutableListOf<Int>() }
        for ((num, count) in counts) buckets[count].add(num)
        val answer = IntArray(k)
        var write = 0
        for (frequency in nums.size downTo 1) {
            for (num in buckets[frequency]) {
                answer[write++] = num
                if (write == k) return answer
            }
        }
        return answer
    }
}`,
    pattern: 'Frequency counting and bucket sort', explanation: 'A value’s frequency lies between one and n. Put values into frequency buckets and visit buckets from largest to smallest. The first k values must be the most frequent. The problem guarantees a valid k and a unique selected set; output order may vary.',
    time: 'O(n) expected.', space: 'O(n) auxiliary, plus O(k) output.', kotlin: 'Array(size) { mutableListOf<Int>() } creates distinct buckets, not repeated references to one list. downTo visits frequencies in reverse; destructuring iterates map entries.', platform: standard,
  },
  'valid-palindrome': {
    code: `class Solution {
    fun isPalindrome(s: String): Boolean {
        var left = 0
        var right = s.lastIndex
        while (left < right) {
            while (left < right && !s[left].isLetterOrDigit()) left++
            while (left < right && !s[right].isLetterOrDigit()) right--
            if (s[left].lowercaseChar() != s[right].lowercaseChar()) return false
            left++
            right--
        }
        return true
    }
}`,
    pattern: 'Two pointers', explanation: 'Skip punctuation at both ends, then compare the next meaningful pair ignoring case. A mismatched pair disproves palindrome symmetry; matching pairs reduce the unresolved substring. Empty and punctuation-only strings are valid. The platform restricts input to printable ASCII.',
    time: 'O(n).', space: 'O(1) auxiliary.', kotlin: 'lastIndex works for an empty string too. isLetterOrDigit and lowercaseChar avoid allocating a filtered or reversed string; short-circuit bounds checks protect indexing.', platform: standard,
  },
  'valid-parentheses': {
    code: `class Solution {
    fun isValid(s: String): Boolean {
        val stack = ArrayDeque<Char>()
        for (char in s) {
            when (char) {
                '(', '[', '{' -> stack.addLast(char)
                else -> {
                    val expected = when (char) {
                        ')' -> '('
                        ']' -> '['
                        '}' -> '{'
                        else -> return false
                    }
                    if (stack.isEmpty() || stack.removeLast() != expected) return false
                }
            }
        }
        return stack.isEmpty()
    }
}`,
    pattern: 'Stack matching', explanation: 'The latest unmatched opening bracket must match the next closing bracket. A stack models this nesting directly. Reject missing or mismatched openings, and require the stack to be empty at the end so unfinished pairs do not pass.',
    time: 'O(n).', space: 'O(n) in the deepest nesting case.', kotlin: 'Kotlin ArrayDeque supports efficient end operations. when expressions map closers to openers. Short-circuit || avoids removing from an empty deque; Kotlin stdlib 1.4+ is needed for ArrayDeque.', platform: standard,
  },
  'daily-temperatures': {
    code: `class Solution {
    fun dailyTemperatures(temperatures: IntArray): IntArray {
        val answer = IntArray(temperatures.size)
        val pending = ArrayDeque<Int>()
        for (today in temperatures.indices) {
            while (pending.isNotEmpty() && temperatures[today] > temperatures[pending.last()]) {
                val previous = pending.removeLast()
                answer[previous] = today - previous
            }
            pending.addLast(today)
        }
        return answer
    }
}`,
    pattern: 'Monotonic decreasing stack', explanation: 'Keep unresolved day indices with non-increasing temperatures. Today resolves every cooler day popped from the top, and it is the first warmer day because earlier days could not resolve them. Equal temperatures remain unresolved; default zero means no warmer future day.',
    time: 'O(n): every index is pushed once and popped at most once.', space: 'O(n) auxiliary, plus the output.', kotlin: 'ArrayDeque<Int> stores indices, not temperatures. IntArray initializes answers to zero, and indices avoids manual range endpoints.', platform: standard,
  },
  'binary-search': {
    code: `class Solution {
    fun search(nums: IntArray, target: Int): Int {
        var left = 0
        var right = nums.lastIndex
        while (left <= right) {
            val mid = left + (right - left) / 2
            when {
                nums[mid] == target -> return mid
                nums[mid] < target -> left = mid + 1
                else -> right = mid - 1
            }
        }
        return -1
    }
}`,
    pattern: 'Binary search on a closed interval', explanation: 'If the target exists, it stays within left..right. Sorted order lets each comparison discard the half that cannot contain it. Using mid ± 1 guarantees progress, including when only one candidate remains.',
    time: 'O(log n).', space: 'O(1) auxiliary.', kotlin: 'when without an argument expresses ordered conditions. lastIndex is -1 for an empty input, so the loop safely skips it. The midpoint form avoids adding the endpoints.', platform: standard,
  },
  'search-in-rotated-sorted-array': {
    code: `class Solution {
    fun search(nums: IntArray, target: Int): Int {
        var left = 0
        var right = nums.lastIndex
        while (left <= right) {
            val mid = left + (right - left) / 2
            if (nums[mid] == target) return mid
            if (nums[left] <= nums[mid]) {
                if (target >= nums[left] && target < nums[mid]) right = mid - 1
                else left = mid + 1
            } else {
                if (target > nums[mid] && target <= nums[right]) left = mid + 1
                else right = mid - 1
            }
        }
        return -1
    }
}`,
    pattern: 'Binary search using the sorted half', explanation: 'With distinct values, at least one half around mid is sorted. Check whether the target belongs to that half’s value range, then discard the other half. The distinct-value assumption matters: duplicates can hide which half is sorted.',
    time: 'O(log n).', space: 'O(1) auxiliary.', kotlin: 'IntArray indexing and explicit comparisons keep interval inclusivity visible. No slices or temporary subarrays are allocated.', platform: standard,
  },
  'best-time-to-buy-and-sell-stock': {
    code: `class Solution {
    fun maxProfit(prices: IntArray): Int {
        var lowest = Int.MAX_VALUE
        var best = 0
        for (price in prices) {
            lowest = minOf(lowest, price)
            best = maxOf(best, price - lowest)
        }
        return best
    }
}`,
    pattern: 'One-pass minimum / moving buy boundary', explanation: 'At each possible selling day, the cheapest price seen so far is the best eligible buy price. Keep the largest nonnegative difference. Updating the minimum first allows a zero-profit same-day comparison, which cannot improve the answer and handles falling prices.',
    time: 'O(n).', space: 'O(1) auxiliary.', kotlin: 'minOf/maxOf express state updates directly. Int.MAX_VALUE seeds the first minimum; the input’s bounded positive prices keep subtraction safe.', platform: standard,
  },
  'longest-substring-without-repeating-characters': {
    code: `class Solution {
    fun lengthOfLongestSubstring(s: String): Int {
        val lastSeen = mutableMapOf<Char, Int>()
        var left = 0
        var best = 0
        for ((right, char) in s.withIndex()) {
            val previous = lastSeen[char]
            if (previous != null) left = maxOf(left, previous + 1)
            lastSeen[char] = right
            best = maxOf(best, right - left + 1)
        }
        return best
    }
}`,
    pattern: 'Sliding window with last-seen indices', explanation: 'The current window has unique characters. A repeated character moves its left boundary past the previous occurrence, but never backward. For each right boundary this is the longest valid window ending there. The empty string returns zero.',
    time: 'O(n) expected.', space: 'O(min(n, a)) for a distinct Char values.', kotlin: 'withIndex iterates positions and characters. Nullable map lookup avoids a special sentinel; maxOf prevents an occurrence outside the window from moving left backward. Char indexing matches the platform’s input alphabet, not arbitrary Unicode grapheme clusters.', platform: standard,
  },
  'reverse-linked-list': {
    code: `// ListNode is supplied by the judge; do not redeclare it there.
class Solution {
    fun reverseList(head: ListNode?): ListNode? {
        var previous: ListNode? = null
        var current = head
        while (current != null) {
            val next = current.next
            current.next = previous
            previous = current
            current = next
        }
        return previous
    }
}`,
    pattern: 'Iterative pointer reversal', explanation: 'previous heads the reversed prefix, while current heads the unprocessed suffix. Save the next pointer before redirecting it, then move the boundary forward. Null and single-node inputs need no special branch. This changes links in place.',
    time: 'O(n).', space: 'O(1) auxiliary.', kotlin: 'ListNode? makes nullable links explicit. The loop smart-casts the local current reference while processing it; saving next avoids losing the suffix.', platform: 'Judge-provided ListNode: class ListNode(var `val`: Int) { var next: ListNode? = null }. Submit only Solution; the local harness supplies a matching stand-in. No values need to be read to reverse links.',
  },
  'lru-cache': {
    code: `class LRUCache(private val capacity: Int) {
    private class Node(val key: Int, var value: Int) {
        var previous: Node? = null
        var next: Node? = null
    }
    private val nodes = mutableMapOf<Int, Node>()
    private val head = Node(0, 0)
    private val tail = Node(0, 0)

    init {
        head.next = tail
        tail.previous = head
    }

    private fun detach(node: Node) {
        node.previous!!.next = node.next
        node.next!!.previous = node.previous
    }

    private fun makeRecent(node: Node) {
        node.previous = tail.previous
        node.next = tail
        tail.previous!!.next = node
        tail.previous = node
    }

    fun get(key: Int): Int {
        val node = nodes[key] ?: return -1
        detach(node)
        makeRecent(node)
        return node.value
    }

    fun put(key: Int, value: Int) {
        val existing = nodes[key]
        if (existing != null) {
            existing.value = value
            detach(existing)
            makeRecent(existing)
            return
        }
        val node = Node(key, value)
        nodes[key] = node
        makeRecent(node)
        if (nodes.size > capacity) {
            val oldest = head.next!!
            detach(oldest)
            nodes.remove(oldest.key)
        }
    }
}`,
    pattern: 'HashMap plus doubly linked recency list', explanation: 'The map locates a node directly; the list orders nodes from least to most recently used. Both get and put move an existing node to the recent end. Sentinel nodes remove endpoint cases, and eviction removes the first real node. Capacity is positive under the platform contract.',
    time: 'O(1) expected per get or put.', space: 'O(capacity).', kotlin: 'A private nested Node avoids any platform node dependency. init joins the sentinels. Nullable links model boundaries; !! is used only where the linked-node/sentinel invariant guarantees a neighbor. Elvis returns -1 for a missing key.', platform: 'Design-class signature: LRUCache(capacity: Int), get(key: Int): Int, put(key: Int, value: Int). No Solution wrapper and no judge-provided node type.',
  },
  'binary-tree-level-order-traversal': {
    code: `// TreeNode is supplied by the judge; do not redeclare it there.
class Solution {
    fun levelOrder(root: TreeNode?): List<List<Int>> {
        if (root == null) return emptyList()
        val levels = mutableListOf<List<Int>>()
        val queue = ArrayDeque<TreeNode>()
        queue.addLast(root)
        while (queue.isNotEmpty()) {
            val count = queue.size
            val level = mutableListOf<Int>()
            repeat(count) {
                val node = queue.removeFirst()
                level.add(node.\`val\`)
                node.left?.let { queue.addLast(it) }
                node.right?.let { queue.addLast(it) }
            }
            levels.add(level)
        }
        return levels
    }
}`,
    pattern: 'Breadth-first search with a queue', explanation: 'At each outer iteration the queue starts with exactly one level. Capture its size before adding children, then remove that many nodes from left to right. Their children form the next level. A null root yields an empty result.',
    time: 'O(n).', space: 'O(w) auxiliary queue for maximum width w, plus O(n) output.', kotlin: 'ArrayDeque supports FIFO addLast/removeFirst. repeat uses a captured count; safe calls and let enqueue only non-null children. Backticks access the judge’s property named val, a Kotlin keyword.', platform: 'Judge-provided TreeNode: class TreeNode(var `val`: Int) { var left: TreeNode? = null; var right: TreeNode? = null }. Submit only Solution; the local harness supplies the stand-in.',
  },
  'kth-largest-element-in-a-stream': {
    code: `import java.util.PriorityQueue

class KthLargest(private val k: Int, nums: IntArray) {
    private val largest = PriorityQueue<Int>()

    init {
        for (num in nums) {
            largest.offer(num)
            if (largest.size > k) largest.poll()
        }
    }

    fun add(value: Int): Int {
        largest.offer(value)
        if (largest.size > k) largest.poll()
        return largest.peek()
    }
}`,
    pattern: 'Bounded min-heap', explanation: 'Keep only the k largest values seen. Removing the smallest whenever size exceeds k preserves that set; its minimum is the kth largest. Duplicates count separately. The platform guarantees at least k values by each queried add, even if the initial array is shorter.',
    time: 'Initialization O(n log(k + 1)); add O(log(k + 1)).', space: 'O(k).', kotlin: 'JVM PriorityQueue is a min-heap by default. init processes constructor input; offer/poll/peek expose heap operations. The platform names the add argument val in some languages; value avoids Kotlin’s keyword without changing the method type.', platform: 'Design-class signature: KthLargest(k: Int, nums: IntArray) and add(value: Int): Int. No Solution wrapper. Uses java.util.PriorityQueue on Kotlin/JVM.',
  },
  'last-stone-weight': {
    code: `import java.util.PriorityQueue

class Solution {
    fun lastStoneWeight(stones: IntArray): Int {
        val heap = PriorityQueue<Int>(compareByDescending { it })
        for (stone in stones) heap.offer(stone)
        while (heap.size > 1) {
            val heavier = heap.poll()
            val lighter = heap.poll()
            if (heavier != lighter) heap.offer(heavier - lighter)
        }
        return heap.peek() ?: 0
    }
}`,
    pattern: 'Max-heap simulation', explanation: 'A descending comparator makes each removal return the heaviest remaining stone. Replace two unequal stones by their positive difference and discard equal stones. Each round reduces the number of stones, so the process ends with zero or one.',
    time: 'O(n log n).', space: 'O(n) auxiliary.', kotlin: 'compareByDescending avoids a subtraction-based comparator. PriorityQueue.peek is nullable for an empty heap; ?: 0 handles complete destruction.', platform: standard,
  },
  'kth-largest-element-in-an-array': {
    code: `import java.util.PriorityQueue

class Solution {
    fun findKthLargest(nums: IntArray, k: Int): Int {
        val largest = PriorityQueue<Int>()
        for (num in nums) {
            largest.offer(num)
            if (largest.size > k) largest.poll()
        }
        return largest.peek()
    }
}`,
    pattern: 'Bounded min-heap for top K', explanation: 'After each value the heap holds the k largest values of the processed prefix, or all values if fewer than k have been processed. Its minimum at the end is the kth largest, counting duplicates. The platform guarantees 1 ≤ k ≤ nums.size.',
    time: 'O(n log(k + 1)).', space: 'O(k) auxiliary; input is not mutated.', kotlin: 'java.util.PriorityQueue provides a JVM min-heap. Keeping its size bounded avoids sorting or copying the input.', platform: standard,
  },
  'subsets': {
    code: `class Solution {
    fun subsets(nums: IntArray): List<List<Int>> {
        val result = mutableListOf<List<Int>>()
        val path = mutableListOf<Int>()
        fun visit(index: Int) {
            if (index == nums.size) {
                result.add(path.toList())
                return
            }
            visit(index + 1)
            path.add(nums[index])
            visit(index + 1)
            path.removeAt(path.lastIndex)
        }
        visit(0)
        return result
    }
}`,
    pattern: 'Include/exclude backtracking', explanation: 'For each distinct input value, branch on excluding or including it. Each subset has exactly one sequence of choices, so all subsets are produced once. Save a snapshot at the leaf; saving the mutable path itself would make results change during backtracking.',
    time: 'O(n · 2^n), including copying output subsets.', space: 'O(n) auxiliary stack/path; O(n · 2^n) output.', kotlin: 'A local recursive function captures result and path. toList copies the current path. removeAt(path.lastIndex) undoes only the most recent choice.', platform: standard,
  },
  'combination-sum': {
    code: `class Solution {
    fun combinationSum(candidates: IntArray, target: Int): List<List<Int>> {
        val values = candidates.sortedArray()
        val result = mutableListOf<List<Int>>()
        val path = mutableListOf<Int>()
        fun visit(start: Int, remaining: Int) {
            if (remaining == 0) {
                result.add(path.toList())
                return
            }
            for (index in start until values.size) {
                val value = values[index]
                if (value > remaining) break
                path.add(value)
                visit(index, remaining - value)
                path.removeAt(path.lastIndex)
            }
        }
        visit(0, target)
        return result
    }
}`,
    pattern: 'Backtracking with reuse and pruning', explanation: 'The start index keeps choices in nondecreasing index order, so permutations of the same combination are not emitted again. Recursing at the same index allows unlimited reuse. Positive distinct candidates ensure decreasing remaining sum; sorting lets the loop stop when a value is too large.',
    time: 'O(n log n + n*V + R*d), where V is the number of visited search states, d = floor(target/min(candidates)), and R is the answer count. The search can be exponential.', space: 'O(n + d) auxiliary for the sorted copy and recursion/path; O(R·d) output.', kotlin: 'sortedArray copies rather than mutates the input. until excludes the upper bound. Captured mutable path is copied only for a complete answer.', platform: standard + ' The linked question calls candidates nums in its prose; both are positional IntArray parameters.',
  },
  'permutations': {
    code: `class Solution {
    fun permute(nums: IntArray): List<List<Int>> {
        val result = mutableListOf<List<Int>>()
        val path = mutableListOf<Int>()
        val used = BooleanArray(nums.size)
        fun visit() {
            if (path.size == nums.size) {
                result.add(path.toList())
                return
            }
            for (index in nums.indices) {
                if (used[index]) continue
                used[index] = true
                path.add(nums[index])
                visit()
                path.removeAt(path.lastIndex)
                used[index] = false
            }
        }
        visit()
        return result
    }
}`,
    pattern: 'Backtracking with used-position tracking', explanation: 'Choose one unused position for each slot. Every ordering of the distinct input values has one path through these choices. Undo both the appended value and its used flag before trying a sibling branch. Copy each completed path to keep outputs independent.',
    time: 'O(n · n!), including output copies.', space: 'O(n) auxiliary; O(n · n!) output.', kotlin: 'BooleanArray initializes flags to false without boxing. indices supplies valid positions; continue skips used choices. Local recursion avoids persistent class state between calls.', platform: standard,
  },
  'number-of-islands': {
    code: `class Solution {
    fun numIslands(grid: Array<CharArray>): Int {
        if (grid.isEmpty() || grid[0].isEmpty()) return 0
        val rows = grid.size
        val cols = grid[0].size
        val queue = ArrayDeque<Pair<Int, Int>>()
        val directions = arrayOf(intArrayOf(1, 0), intArrayOf(-1, 0),
            intArrayOf(0, 1), intArrayOf(0, -1))
        var islands = 0
        for (row in 0 until rows) {
            for (col in 0 until cols) {
                if (grid[row][col] != '1') continue
                islands++
                grid[row][col] = '0'
                queue.addLast(row to col)
                while (queue.isNotEmpty()) {
                    val (r, c) = queue.removeFirst()
                    for (direction in directions) {
                        val nr = r + direction[0]
                        val nc = c + direction[1]
                        if (nr in 0 until rows && nc in 0 until cols && grid[nr][nc] == '1') {
                            grid[nr][nc] = '0'
                            queue.addLast(nr to nc)
                        }
                    }
                }
            }
        }
        return islands
    }
}`,
    pattern: 'Grid BFS / flood fill', explanation: 'Each unvisited land cell starts one component. Mark neighbors as water when enqueuing, not when dequeuing, so a cell is queued at most once. Only four orthogonal directions connect land; diagonals do not. Iterative BFS avoids a deep recursive call stack. This intentionally mutates the grid; clone rows first if the caller needs the original.',
    time: 'O(rows · cols).', space: 'O(rows · cols) worst-case auxiliary queue.', kotlin: 'Array<CharArray> is the standard JVM judge grid, not an array of String or graph nodes. Pair construction with to and destructuring keep coordinates explicit; until and in check bounds.', platform: standard + ' No GraphNode type is required. The judge supplies a rectangular character grid; each row is a CharArray.',
  },
  'climbing-stairs': {
    code: `class Solution {
    fun climbStairs(n: Int): Int {
        var twoBack = 1
        var oneBack = 1
        for (step in 2..n) {
            val current = oneBack + twoBack
            twoBack = oneBack
            oneBack = current
        }
        return oneBack
    }
}`,
    pattern: 'Rolling dynamic programming', explanation: 'A route to step i ends with either one step from i−1 or two steps from i−2. These disjoint cases sum to the number of routes. Only the two previous counts are needed. For n = 1 the loop is empty; the platform limits n to 45, whose answer fits Int.',
    time: 'O(n).', space: 'O(1) auxiliary.', kotlin: 'The ascending range 2..n is empty for n < 2. Local val current preserves the old values during the rolling update.', platform: standard,
  },
  'merge-intervals': {
    code: `class Solution {
    fun merge(intervals: Array<IntArray>): Array<IntArray> {
        if (intervals.isEmpty()) return emptyArray()
        val sorted = intervals.sortedWith(compareBy<IntArray> { it[0] })
        val result = mutableListOf<IntArray>()
        var start = sorted[0][0]
        var end = sorted[0][1]
        for (index in 1 until sorted.size) {
            val interval = sorted[index]
            if (interval[0] <= end) {
                end = maxOf(end, interval[1])
            } else {
                result.add(intArrayOf(start, end))
                start = interval[0]
                end = interval[1]
            }
        }
        result.add(intArrayOf(start, end))
        return result.toTypedArray()
    }
}`,
    pattern: 'Sort and sweep', explanation: 'Once intervals are sorted by start, an interval starting after the current end cannot overlap the current group or any earlier interval. Otherwise extend the current end. The ≤ comparison merges touching closed endpoints. New output arrays keep the caller’s intervals unchanged.',
    time: 'O(n log n).', space: 'O(n) including sorted references and output.', kotlin: 'Array<IntArray> matches the interval signature. sortedWith(compareBy) sorts references without changing the input array. toTypedArray converts the result list to the judge’s expected array.', platform: standard,
  },
};
