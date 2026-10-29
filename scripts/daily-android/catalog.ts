import { challengeBank } from '../../src/data/android-challenges/index.ts';
import { validateActiveReviews } from '../android-challenges/validate-reviews.ts';

export function createChallengeCatalog() {
  const errors = validateActiveReviews(challengeBank.challenges);
  if (errors.length) throw new Error('Invalid active review bank:\n' + errors.join('\n'));
  return challengeBank.challenges;
}
