import type { Challenge } from './types.ts';
import { codeReviews } from './code-review.ts';
import { codeCompletions } from './code-completion.ts';
import { systemDesigns } from './system-design.ts';
import { engineeringScenarios } from './engineering-scenarios.ts';

export const challengeBank = {
  schemaVersion: '1.0.0',
  contentVersion: '1.0.0-batch-1',
  targetCount: 150,
  challenges: [...codeReviews, ...codeCompletions, ...systemDesigns, ...engineeringScenarios] as readonly Challenge[],
} as const;
