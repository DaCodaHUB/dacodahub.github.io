import type { Challenge } from '../../src/data/android-challenges/types.ts';
import { challengeBank } from '../../src/data/android-challenges/legacy-bank.ts';
import { validateChallenges } from '../android-challenges/validate.ts';

/** Offline legacy validation only. The active page never imports this catalog. */
export function createChallengeCatalog(imports: readonly unknown[]): readonly Challenge[] {
  if (imports.some(value => !Array.isArray(value))) throw new Error('Each imported challenge JSON must be an array');
  const candidates: unknown[] = [...challengeBank.challenges, ...imports.flatMap(value => value as unknown[])];
  const errors = validateChallenges(candidates);
  if (errors.length) throw new Error('Invalid challenge catalog:\n' + errors.join('\n'));
  return candidates as Challenge[];
}
