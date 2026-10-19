import { mkdir, writeFile } from 'node:fs/promises';
import { challengeBank } from '../../src/data/android-challenges/index.ts';

const refs = [...new Map(challengeBank.challenges.flatMap(c => c.references).map(r => [r.url, r])).values()];
const results: { url: string; status?: number; title?: string; finalUrl?: string; error?: string }[] = [];
let next = 0;
async function worker() {
  while (next < refs.length) {
    const ref = refs[next++]!;
    try {
      const requestUrl = new URL(ref.url);
      if (requestUrl.hostname === 'developer.android.com') requestUrl.searchParams.set('hl', 'en');
      const response = await fetch(requestUrl, { signal: AbortSignal.timeout(30_000), headers: { 'Accept-Language': 'en' } });
      const html = await response.text();
      const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, ' ').trim();
      const host = new URL(response.url).hostname;
      const error = !response.ok ? `HTTP ${response.status}` : !['developer.android.com', 'kotlinlang.org'].includes(host) || /accounts\.google|\/404|not-found/i.test(response.url) ? 'Unexpected redirect' : !title || /access denied|just a moment|not found|sign in - google|redirected shortly/i.test(title) || /http-equiv=["']refresh/i.test(html) ? 'Missing, challenged or client-redirected documentation' : undefined;
      results.push({ url: ref.url, status: response.status, title, finalUrl: response.url, ...(error ? { error } : {}) });
    } catch (error) { results.push({ url: ref.url, error: error instanceof Error ? error.message : 'Request failed' }); }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
results.sort((a, b) => a.url.localeCompare(b.url));
await mkdir('.astro', { recursive: true });
await writeFile('.astro/challenge-reference-report.json', JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2) + '\n');
for (const result of results) console.log(`${result.error ?? 'OK'} | ${result.url} | ${result.title ?? ''}`);
console.log(`${results.length} references; ${results.filter(r => r.error).length} need review. HTTP availability is separate from technical content review.`);
if (results.some(r => r.error)) process.exitCode = 1;
