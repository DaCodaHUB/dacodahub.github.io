import assert from 'node:assert/strict';
import { neetcodeProblems } from '../../src/data/neetcode/problems.ts';

// Native NeetCode slugs differ from some of the curated solution/LeetCode slugs.
// Verify against the live site's routing metadata as well as HTTP responses:
// an HTTP 200 alone cannot detect an invalid route in a client-rendered app.
const home = await (await fetch('https://neetcode.io/roadmap')).text();
const script = home.match(/src="(main\.[^"]+\.js)"/);
assert.ok(script, 'Official application script not found');
const app = await (await fetch(new URL(script[1]!, 'https://neetcode.io/'))).text();
await Promise.all(neetcodeProblems.map(async problem => {
  const slug = new URL(problem.url).pathname.split('/')[2]!;
  const entry = [...app.matchAll(/\{[^{}]*problem:"([^"]+)"[^{}]*\}/g)].find(match => match[1]!.toLowerCase() === problem.title.toLowerCase());
  assert.ok(entry, `Missing official problem: ${problem.title}`);
  assert.ok(entry[0].includes(`ncLink:"${slug}/"`), `Invalid native route: ${problem.url}`);
  const response = await fetch(problem.url, { signal: AbortSignal.timeout(30_000) });
  assert.ok(response.ok, `${problem.url}: HTTP ${response.status}`);
  assert.equal(new URL(response.url).pathname, new URL(problem.url).pathname, 'Unexpected redirect');
  console.log(`${response.status} ${problem.title}: ${response.url}`);
}));
