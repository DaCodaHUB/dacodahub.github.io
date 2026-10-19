import type { Challenge } from '../../src/data/android-challenges/types.ts';
import { challengeBank } from '../../src/data/android-challenges/index.ts';
import { validateChallenges } from '../android-challenges/validate.ts';

/** Future JSON files contain arrays using the existing schema. Validate before any UI or schedule consumes them. */
export function createChallengeCatalog(imports: readonly unknown[]): readonly Challenge[] {
  if (imports.some(value => !Array.isArray(value))) throw new Error('Each imported challenge JSON must be an array');
  const candidates: unknown[] = [...challengeBank.challenges, ...imports.flatMap(value => value as unknown[])];
  const errors = validateChallenges(candidates);
  if (errors.length) throw new Error('Invalid challenge catalog:\n' + errors.join('\n'));
  return candidates as Challenge[];
}
