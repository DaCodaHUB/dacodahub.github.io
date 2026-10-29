// These assertions execute the exact code strings displayed by the portfolio.
export const kotlinCases: Readonly<Record<string, { setup?: string; tests: string }>> = {
  'contains-duplicate': { tests: `
    val s = Solution()
    eq(s.containsDuplicate(intArrayOf()), false)
    eq(s.hasDuplicate(intArrayOf(4)), false)
    eq(s.containsDuplicate(intArrayOf(-1, 0, -1)), true)
    eq(s.containsDuplicate(intArrayOf(Int.MIN_VALUE, Int.MAX_VALUE)), false)
    repeat(100) { n ->
        val input = IntArray(n) { random.nextInt(-20, 21) }
        eq(s.containsDuplicate(input), input.toSet().size != input.size)
    }` },
  'valid-anagram': { tests: `
    val s = Solution()
    eq(s.isAnagram("anagram", "nagaram"), true)
    eq(s.isAnagram("rat", "car"), false)
    eq(s.isAnagram("", ""), true)
    eq(s.isAnagram("a", "aa"), false)
    eq(s.isAnagram("aabb", "abbb"), false)
    repeat(100) {
        val a = List(20) { ('a'.code + random.nextInt(5)).toChar() }.joinToString("")
        val b = List(20) { ('a'.code + random.nextInt(5)).toChar() }.joinToString("")
        eq(s.isAnagram(a, b), a.toList().sorted() == b.toList().sorted())
    }` },
  'two-sum': { tests: `
    val s = Solution()
    eq(s.twoSum(intArrayOf(2, 7, 11, 15), 9), intArrayOf(0, 1))
    eq(s.twoSum(intArrayOf(3, 3), 6), intArrayOf(0, 1))
    eq(s.twoSum(intArrayOf(-4, -1, 6, 10), 5), intArrayOf(1, 2))
    eq(s.twoSum(intArrayOf(0, 4, 3, 0), 0), intArrayOf(0, 3))` },
  'relative-sort-array': { tests: `
    val s = Solution()
    eq(s.relativeSortArray(intArrayOf(2,3,1,3,2,4,6,7,9,2,19), intArrayOf(2,1,4,3,9,6)), intArrayOf(2,2,2,1,4,3,3,9,6,7,19))
    eq(s.relativeSortArray(intArrayOf(5,5,2,1), intArrayOf(2)), intArrayOf(2,1,5,5))
    eq(s.relativeSortArray(intArrayOf(0), intArrayOf(0)), intArrayOf(0))
    val original = intArrayOf(3,2,1)
    s.relativeSortArray(original, intArrayOf(2))
    eq(original, intArrayOf(3,2,1))` },
  'sort-the-people': { tests: `
    val s = Solution()
    eq(s.sortPeople(arrayOf("Mary","John","Emma"), intArrayOf(180,165,170)), arrayOf("Mary","Emma","John"))
    eq(s.sortPeople(arrayOf("Alice","Bob","Bob"), intArrayOf(155,185,150)), arrayOf("Bob","Alice","Bob"))
    eq(s.sortPeople(arrayOf("Solo"), intArrayOf(1)), arrayOf("Solo"))` },
  'group-anagrams': { tests: `
    val s = Solution()
    fun groups(input: List<List<String>>) = input.map { it.sorted().joinToString("|") }.sorted()
    eq(groups(s.groupAnagrams(arrayOf("eat","tea","tan","ate","nat","bat"))), groups(listOf(listOf("eat","tea","ate"),listOf("tan","nat"),listOf("bat"))))
    eq(groups(s.groupAnagrams(arrayOf("","","a"))), groups(listOf(listOf("",""),listOf("a"))))
    eq(s.groupAnagrams(arrayOf("x")), listOf(listOf("x")))
    eq(s.groupAnagrams(arrayOf("abbbbbbbbbbb", "aaaaaaaaaaab")).size, 2)` },
  'top-k-frequent-elements': { tests: `
    val s = Solution()
    eq(s.topKFrequent(intArrayOf(1,1,1,2,2,3),2).toSet(), setOf(1,2))
    eq(s.topKFrequent(intArrayOf(-1,-1),1), intArrayOf(-1))
    eq(s.topKFrequent(intArrayOf(2,3,4),3).toSet(), setOf(2,3,4))
    for (n in 1..25) {
        val input = (1..n).flatMap { value -> List(value) { value } }.toIntArray()
        for (k in 1..n) eq(s.topKFrequent(input,k).toSet(), (n-k+1..n).toSet())
    }` },
  'valid-palindrome': { tests: `
    val s = Solution()
    eq(s.isPalindrome("A man, a plan, a canal: Panama"), true)
    eq(s.isPalindrome("race a car"), false)
    eq(s.isPalindrome(".,!"), true)
    eq(s.isPalindrome(""), true)
    eq(s.isPalindrome("0P"), false)
    eq(s.isPalindrome("a."), true)` },
  'valid-parentheses': { tests: `
    val s = Solution()
    for (value in listOf("", "()[]{}", "{[()]}")) eq(s.isValid(value), true)
    for (value in listOf(")", "(", "([)]", "(()", "}{")) eq(s.isValid(value), false)
    eq(s.isValid("(".repeat(5000) + ")".repeat(5000)), true)` },
  'daily-temperatures': { tests: `
    val s = Solution()
    eq(s.dailyTemperatures(intArrayOf(73,74,75,71,69,72,76,73)), intArrayOf(1,1,4,2,1,1,0,0))
    eq(s.dailyTemperatures(intArrayOf(30,30,30)), intArrayOf(0,0,0))
    eq(s.dailyTemperatures(intArrayOf(3,2,1)), intArrayOf(0,0,0))
    repeat(100) {
        val input = IntArray(40) { random.nextInt(1,101) }
        val expected = IntArray(input.size) { i ->
            val next = (i+1 until input.size).firstOrNull { input[it] > input[i] }
            if (next == null) 0 else next-i
        }
        eq(s.dailyTemperatures(input), expected)
    }` },
  'binary-search': { tests: `
    val s = Solution()
    eq(s.search(intArrayOf(),1), -1)
    eq(s.search(intArrayOf(5),5), 0)
    eq(s.search(intArrayOf(5),6), -1)
    for (n in 1..50) {
        val values = IntArray(n) { it*2-50 }
        for (target in -52..52) eq(s.search(values,target), values.indexOf(target))
    }` },
  'search-in-rotated-sorted-array': { tests: `
    val s = Solution()
    eq(s.search(intArrayOf(4,5,6,7,0,1,2),0), 4)
    eq(s.search(intArrayOf(4,5,6,7,0,1,2),3), -1)
    eq(s.search(intArrayOf(),0), -1)
    for (n in 1..30) for (rotation in 0 until n) {
        val input = IntArray(n) { ((it+rotation)%n)*2 }
        for (target in -1..n*2) eq(s.search(input,target), input.indexOf(target))
    }` },
  'best-time-to-buy-and-sell-stock': { tests: `
    val s = Solution()
    eq(s.maxProfit(intArrayOf(7,1,5,3,6,4)),5)
    eq(s.maxProfit(intArrayOf(7,6,4,3,1)),0)
    eq(s.maxProfit(intArrayOf(5)),0)
    repeat(100) {
        val prices = IntArray(20) { random.nextInt(1,100) }
        var expected = 0
        for (buy in prices.indices) for (sell in buy+1 until prices.size) expected = maxOf(expected,prices[sell]-prices[buy])
        eq(s.maxProfit(prices),expected)
    }` },
  'longest-substring-without-repeating-characters': { tests: `
    val s = Solution()
    eq(s.lengthOfLongestSubstring("abcabcbb"),3)
    eq(s.lengthOfLongestSubstring("bbbbb"),1)
    eq(s.lengthOfLongestSubstring("abba"),2)
    eq(s.lengthOfLongestSubstring(""),0)
    eq(s.lengthOfLongestSubstring("pwwkew"),3)
    repeat(100) {
        val input = List(20) { ('a'.code + random.nextInt(5)).toChar() }.joinToString("")
        var expected = 0
        for (start in input.indices) for (end in start+1..input.length) {
            val part = input.substring(start,end)
            if (part.toSet().size == part.length) expected = maxOf(expected,part.length)
        }
        eq(s.lengthOfLongestSubstring(input),expected)
    }` },
  'reverse-linked-list': {
    setup: `class ListNode(var \`val\`: Int) { var next: ListNode? = null }
fun linked(vararg values: Int): ListNode? {
    var head: ListNode? = null
    for (value in values.reversed()) { val node = ListNode(value); node.next = head; head = node }
    return head
}
fun values(head: ListNode?): List<Int> {
    val result = mutableListOf<Int>(); var node = head
    while (node != null) { check(result.size < 2000); result.add(node.\`val\`); node = node.next }
    return result
}`,
    tests: `
    val s = Solution()
    eq(s.reverseList(null),null)
    val singleton = linked(7)
    eq(s.reverseList(singleton) === singleton,true)
    eq(values(s.reverseList(linked(1,2,3,4))),listOf(4,3,2,1))
    eq(values(s.reverseList(linked(1,1))),listOf(1,1))
    val head = linked(*IntArray(1000) { it })
    eq(values(s.reverseList(s.reverseList(head))),(0 until 1000).toList())` },
  'lru-cache': { tests: `
    val cache = LRUCache(2)
    cache.put(1,1); cache.put(2,2); eq(cache.get(1),1)
    cache.put(3,3); eq(cache.get(2),-1)
    cache.put(4,4); eq(cache.get(1),-1); eq(cache.get(3),3); eq(cache.get(4),4)
    cache.put(3,9); eq(cache.get(3),9)
    for (capacity in 1..4) {
        val actual = LRUCache(capacity)
        val reference = linkedMapOf<Int,Int>()
        repeat(1000) {
            val key = random.nextInt(8)
            if (random.nextBoolean()) {
                val value = random.nextInt(100)
                actual.put(key,value); reference.remove(key); reference[key] = value
                if (reference.size > capacity) reference.remove(reference.keys.first())
            } else {
                val value = reference.remove(key)
                eq(actual.get(key),value ?: -1)
                if (value != null) reference[key] = value
            }
        }
    }` },
  'binary-tree-level-order-traversal': {
    setup: `class TreeNode(var \`val\`: Int) { var left: TreeNode? = null; var right: TreeNode? = null }`,
    tests: `
    val s = Solution()
    eq(s.levelOrder(null), emptyList<List<Int>>())
    eq(s.levelOrder(TreeNode(1)), listOf(listOf(1)))
    val root = TreeNode(3)
    root.left = TreeNode(9); root.right = TreeNode(20)
    root.right!!.left = TreeNode(15); root.right!!.right = TreeNode(7)
    eq(s.levelOrder(root),listOf(listOf(3),listOf(9,20),listOf(15,7)))
    val skewed = TreeNode(0); var end = skewed
    for (i in 1 until 2000) { val next = TreeNode(i); end.right = next; end = next }
    eq(s.levelOrder(skewed),(0 until 2000).map { listOf(it) })` },
  'kth-largest-element-in-a-stream': { tests: `
    val stream = KthLargest(3,intArrayOf(4,5,8,2))
    eq(listOf(3,5,10,9,4).map { stream.add(it) },listOf(4,5,5,8,8))
    val empty = KthLargest(1,intArrayOf())
    eq(empty.add(-3),-3); eq(empty.add(-4),-3); eq(empty.add(2),2)
    val values = mutableListOf(2,2,2)
    val duplicates = KthLargest(3,values.toIntArray())
    repeat(100) { val value = random.nextInt(-20,21); values.add(value); eq(duplicates.add(value),values.sortedDescending()[2]) }` },
  'last-stone-weight': { tests: `
    val s = Solution()
    eq(s.lastStoneWeight(intArrayOf(2,7,4,1,8,1)),1)
    eq(s.lastStoneWeight(intArrayOf(4,4)),0)
    eq(s.lastStoneWeight(intArrayOf(9)),9)
    repeat(100) {
        val stones = IntArray(20) { random.nextInt(1,100) }
        val reference = stones.toMutableList()
        while (reference.size > 1) {
            reference.sort(); val a = reference.removeAt(reference.lastIndex); val b = reference.removeAt(reference.lastIndex)
            if (a != b) reference.add(a-b)
        }
        eq(s.lastStoneWeight(stones),reference.firstOrNull() ?: 0)
    }` },
  'kth-largest-element-in-an-array': { tests: `
    val s = Solution()
    eq(s.findKthLargest(intArrayOf(3,2,1,5,6,4),2),5)
    eq(s.findKthLargest(intArrayOf(3,2,3,1,2,4,5,5,6),4),4)
    eq(s.findKthLargest(intArrayOf(-3),1),-3)
    repeat(100) {
        val values = IntArray(25) { random.nextInt(-100,101) }
        for (k in 1..values.size) eq(s.findKthLargest(values,k),values.sortedDescending()[k-1])
    }` },
  'subsets': { tests: `
    val s = Solution()
    eq(rows(s.subsets(intArrayOf(1,2))), rows(listOf(emptyList(),listOf(1),listOf(2),listOf(1,2))))
    eq(s.subsets(intArrayOf(7)),listOf(emptyList(),listOf(7)))
    for (n in 0..10) {
        val actual = s.subsets(IntArray(n) { it })
        val expected = (0 until (1 shl n)).map { mask -> (0 until n).filter { mask and (1 shl it) != 0 } }
        eq(rows(actual),rows(expected))
    }` },
  'combination-sum': { tests: `
    val s = Solution()
    eq(rows(s.combinationSum(intArrayOf(2,3,6,7),7)),rows(listOf(listOf(2,2,3),listOf(7))))
    eq(rows(s.combinationSum(intArrayOf(2,3,5),8)),rows(listOf(listOf(2,2,2,2),listOf(2,3,3),listOf(3,5))))
    eq(s.combinationSum(intArrayOf(3),5),emptyList<List<Int>>())
    eq(s.combinationSum(intArrayOf(2),2),listOf(listOf(2)))
    for (target in 2..20) {
        val expected = mutableListOf<List<Int>>()
        for (a in 0..target/2) for (b in 0..target/3) for (c in 0..target/5) {
            if (2*a+3*b+5*c == target) expected.add(List(a){2}+List(b){3}+List(c){5})
        }
        eq(rows(s.combinationSum(intArrayOf(5,2,3),target)),rows(expected))
    }` },
  'permutations': { tests: `
    val s = Solution()
    eq(rows(s.permute(intArrayOf(1,2))),rows(listOf(listOf(1,2),listOf(2,1))))
    eq(s.permute(intArrayOf(7)),listOf(listOf(7)))
    for (n in 1..6) {
        val input = IntArray(n) { it }
        val actual = s.permute(input)
        eq(actual.size,(1..n).fold(1) { a,b -> a*b })
        eq(rows(actual).toSet().size,actual.size)
        for (permutation in actual) eq(permutation.sorted(),input.toList())
    }` },
  'number-of-islands': { tests: `
    val s = Solution()
    fun grid(vararg rows: String) = rows.map { it.toCharArray() }.toTypedArray()
    eq(s.numIslands(grid("11000","11000","00100","00011")),3)
    eq(s.numIslands(grid("10","01")),2)
    eq(s.numIslands(grid("0")),0)
    eq(s.numIslands(grid("1")),1)
    eq(s.numIslands(Array(100) { CharArray(100) { '1' } }),1)
    eq(s.numIslands(Array(100) { r -> CharArray(100) { c -> if ((r+c)%2 == 0) '1' else '0' } }),5000)
    val empty = emptyArray<CharArray>(); eq(s.numIslands(empty),0)` },
  'climbing-stairs': { tests: `
    val s = Solution()
    eq(s.climbStairs(1),1); eq(s.climbStairs(2),2); eq(s.climbStairs(3),3)
    eq(s.climbStairs(5),8); eq(s.climbStairs(45),1836311903)
    val ways = IntArray(46); ways[0] = 1; ways[1] = 1
    for (i in 2..45) ways[i] = ways[i-1]+ways[i-2]
    for (i in 1..45) eq(s.climbStairs(i),ways[i])` },
  'merge-intervals': { tests: `
    val s = Solution()
    fun intervals(vararg values: Int) = values.toList().chunked(2).map { it.toIntArray() }.toTypedArray()
    eq(s.merge(intervals(1,3,2,6,8,10,15,18)), intervals(1,6,8,10,15,18))
    eq(s.merge(intervals(1,4,4,5)),intervals(1,5))
    eq(s.merge(intervals(1,10,2,3,4,7)),intervals(1,10))
    eq(s.merge(intervals(5,5)),intervals(5,5))
    eq(s.merge(emptyArray()),emptyArray<IntArray>())
    val original = intervals(4,6,1,3,2,5)
    eq(s.merge(original),intervals(1,6)); eq(original,intervals(4,6,1,3,2,5))` },
};
