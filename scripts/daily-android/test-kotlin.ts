import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join, delimiter } from 'node:path';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { neetcodeProblems } from '../../src/data/neetcode/problems.ts';
import { kotlinSolutions } from '../../src/data/neetcode/kotlin-solutions.ts';
import { kotlinCases } from './kotlin-cases.ts';

// No download or installation. Use an explicit compiler classpath, or discover
// locally cached Gradle compiler artifacts. Missing tools fail this explicit check.
const cache = process.env.KOTLIN_GRADLE_CACHE ?? join(homedir(), '.gradle/caches/modules-2/files-2.1');
async function jars(path: string): Promise<string[]> {
  try {
    const entries = await readdir(path, { withFileTypes: true });
    const nested = await Promise.all(entries.map(e => e.isDirectory() ? jars(join(path, e.name)) : Promise.resolve(e.name.endsWith('.jar') && !/-(sources|javadoc)\.jar$/.test(e.name) ? [join(path, e.name)] : [])));
    return nested.flat();
  } catch { return []; }
}
async function artifact(group: string, name: string, version?: string) {
  const files = await jars(join(cache, group, name, version ?? ''));
  return files.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0];
}
const version = '2.0.21';
const stdlib = process.env.KOTLIN_STDLIB ?? await artifact('org.jetbrains.kotlin', 'kotlin-stdlib', version);
const compiler = process.env.KOTLIN_COMPILER_CLASSPATH ?? (await Promise.all([
  artifact('org.jetbrains.kotlin', 'kotlin-compiler-embeddable', version),
  artifact('org.jetbrains.kotlin', 'kotlin-stdlib', version),
  artifact('org.jetbrains.kotlin', 'kotlin-script-runtime', version),
  artifact('org.jetbrains.kotlin', 'kotlin-reflect', '1.6.10'),
  artifact('org.jetbrains.intellij.deps', 'trove4j'),
  artifact('org.jetbrains', 'annotations'),
  artifact('org.jetbrains.kotlinx', 'kotlinx-coroutines-core-jvm'),
])).filter(Boolean).join(delimiter);
assert.ok(stdlib && compiler, 'Set KOTLIN_STDLIB and KOTLIN_COMPILER_CLASSPATH, or populate the Kotlin 2.0.21 Gradle cache. No solutions were compiled.');
assert.deepEqual(Object.keys(kotlinSolutions).sort(), neetcodeProblems.map(p => p.id).sort());
assert.deepEqual(Object.keys(kotlinCases).sort(), neetcodeProblems.map(p => p.id).sort());
const output = resolve('.astro/neetcode-kotlin');
await mkdir(output, { recursive: true });
const sources: string[] = [];
const calls: string[] = [];
for (const problem of neetcodeProblems) {
  const name = problem.id.replaceAll('-', '_');
  const fixture = kotlinCases[problem.id]!;
  const file = join(output, `${name}.kt`);
  await writeFile(file, `package practice.${name}\nimport harness.*\n${kotlinSolutions[problem.id]!.code}\n${fixture.setup ?? ''}\nfun runTests() {\n${fixture.tests}\nprintln("PASS ${problem.id}")\n}\n`);
  sources.push(file); calls.push(`practice.${name}.runTests()`);
}
const support = join(output, 'Support.kt'), runner = join(output, 'Main.kt');
await writeFile(support, `package harness
val random = kotlin.random.Random(20261029)
var checks = 0
fun normalize(value: Any?): Any? = when (value) {
    is IntArray -> value.toList()
    is Array<*> -> value.map { normalize(it) }
    is List<*> -> value.map { normalize(it) }
    else -> value
}
fun eq(actual: Any?, expected: Any?) {
    checks++
    check(normalize(actual) == normalize(expected)) { "Expected: " + normalize(expected) + "; actual: " + normalize(actual) }
}
fun rows(values: List<List<Int>>) = values.map { it.joinToString(",") }.sorted()
`);
await writeFile(runner, `fun main() {\n${calls.join('\n')}\nprintln("Verified ${calls.length} solutions; " + harness.checks + " assertions")\n}`);
const java = process.env.JAVA_BIN ?? 'java';
function run(args: string[]) {
  const result = spawnSync(java, args, { encoding: 'utf8', windowsHide: true, timeout: 120_000, maxBuffer: 4_000_000 });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  assert.equal(result.error, undefined); assert.equal(result.status, 0, 'Kotlin compile/execution failed');
}
run(['-cp', compiler, 'org.jetbrains.kotlin.cli.jvm.K2JVMCompiler', '-no-stdlib', '-no-reflect', '-version']);
run(['-cp', compiler, 'org.jetbrains.kotlin.cli.jvm.K2JVMCompiler', '-no-stdlib', '-no-reflect', '-jvm-target', '17', '-classpath', stdlib!, ...sources, support, runner, '-d', join(output, 'solutions.jar')]);
run(['-cp', [join(output, 'solutions.jar'), stdlib!].join(delimiter), 'MainKt']);
