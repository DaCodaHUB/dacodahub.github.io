import { mkdir, writeFile } from 'node:fs/promises';
import { createChallengeCatalog } from '../daily-android/catalog.ts';
const args = process.argv.slice(2);
if (args.some(arg => arg !== '--write-report')) throw new Error('Usage: npm run challenges:validate -- [--write-report]');
const challenges = createChallengeCatalog();
const byDifficulty = Object.fromEntries(['Easy', 'Medium', 'Hard'].map(d => [d, challenges.filter(c => c.difficulty === d).length]));
console.log(JSON.stringify({ active: challenges.length, type: 'code-review', byDifficulty }, null, 2));
if (args.includes('--write-report')) {
  await mkdir('.astro/reports', { recursive: true });
  await writeFile('.astro/reports/android-challenge-coverage.md', `# Active Android code reviews\n\n| ID | Difficulty | Topic | Title |\n| --- | --- | --- | --- |\n${challenges.map(c => `| ${c.id} | ${c.difficulty} | ${c.topic} | ${c.title} |`).join('\n')}\n`);
}
