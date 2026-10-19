import { writeFile, mkdir } from 'node:fs/promises';
import { topics } from '../../src/data/android-fundamentals/topics.ts';

// Opt-in maintenance tool. Normal tests and Astro builds never access these sites.
const resources = [...new Map(topics.flatMap(topic => topic.resources).map(resource => [resource.url, resource])).values()];
const results: { url: string; status: number | null; title: string; finalUrl: string; creator?: string; note?: string }[] = [];
let next = 0;
async function worker() {
  while (next < resources.length) {
    const resource = resources[next++]!;
    try {
      const video = new URL(resource.url).hostname === 'www.youtube.com';
      const url = video ? `https://www.youtube.com/oembed?url=${encodeURIComponent(resource.url)}&format=json` : resource.url;
      const response = await fetch(url, { signal: AbortSignal.timeout(25_000), headers: { 'User-Agent': 'AndroidFundamentalsLibrary-LinkReview/1.0' } });
      const body = await response.text();
      const metadata = video && response.ok ? JSON.parse(body) as { title: string; author_name: string } : null;
      const title = metadata ? String(metadata.title) : (body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').replace(/\s+/g, ' ').trim();
      const target = new URL(resource.url), destination = new URL(response.url);
      const hash = target.hash.slice(1);
      const missingAnchor = hash && !video && response.ok && !body.includes(`id="${hash}"`) && !body.includes(`id="user-content-${hash}"`) && !body.includes(`name="${hash}"`);
      const note = !response.ok ? 'Manual review or replacement needed' : metadata && metadata.title !== resource.title ? 'Video title changed; review metadata' : metadata && resource.creator && metadata.author_name !== resource.creator ? 'Video creator differs; review metadata' : /captcha|^access denied|^just a moment|^sign in/i.test(title) ? 'Possible access challenge; review manually' : missingAnchor ? 'Anchor not found in returned HTML; review section' : target.origin === destination.origin && target.pathname !== '/' && destination.pathname === '/' ? 'Redirected to generic homepage; review' : undefined;
      results.push({ url: resource.url, status: response.status, title, finalUrl: response.url, ...(metadata ? { creator: metadata.author_name } : {}), ...(note ? { note } : {}) });
    } catch { results.push({ url: resource.url, status: null, title: '', finalUrl: '', note: 'Network failure or timeout; review manually' }); }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
results.sort((a, b) => a.url.localeCompare(b.url));
await mkdir(new URL('../../.astro/', import.meta.url), { recursive: true });
await writeFile(new URL('../../.astro/android-link-report.json', import.meta.url), JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2) + '\n');
const issues = results.filter(result => result.note);
console.log(`${topics.length} topics; ${resources.length} unique resources; ${results.length - issues.length} checks passed; ${issues.length} need review.`);
for (const result of issues) console.log(`${result.status ?? 'NETWORK'} ${result.url} — ${result.note}`);
if (issues.length) process.exitCode = 1;
