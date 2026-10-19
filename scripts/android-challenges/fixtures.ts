import type { Challenge } from '../../src/data/android-challenges/types.ts';
import { completeCode } from './validate.ts';

/** These are compiler-ready candidates, not a claim that a compiler has run. */
export function standaloneFixtures(challenges: readonly Challenge[]): { id: string; code: string }[] {
  const checks: Record<string, string> = {
    'acc-001': 'fun main() { check(displayName(null) == "Guest"); check(displayName("  ") == "Guest"); check(displayName(" Ada ") == "Ada") }',
    'acc-002': '', // Already includes main and a variance/behavior check.
    'acc-009': 'fun main() { check(shouldRetry("GET", 503, 0)); check(shouldRetry("GET", 429, 1)); check(!shouldRetry("GET", 503, 2)); check(!shouldRetry("GET", 503, -1)); check(!shouldRetry("POST", 503, 0)); check(!shouldRetry("GET", 400, 0)) }',
  };
  return challenges.flatMap(challenge => {
    if (challenge.type === 'code-review' && ['acr-001', 'acr-012'].includes(challenge.id)) return [{ id: challenge.id, code: challenge.correctedImplementation.code + '\n' + (challenge.id === 'acr-012' ? 'fun main() { val cache = Cache { "fresh" }; check(cache.snapshot() == "cached"); cache.refresh(); check(cache.snapshot() == "fresh") }\n' : '') }];
    if (challenge.type !== 'code-completion' || !(challenge.id in checks)) return [];
    return [{ id: challenge.id, code: completeCode(challenge, Object.fromEntries(challenge.blanks.map(b => [b.id, b.acceptedAnswers[0]!]))) + '\n' + checks[challenge.id] + '\n' }];
  });
}
