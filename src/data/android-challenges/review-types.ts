export const reviewDifficulties = ['Easy', 'Medium', 'Hard'] as const;
export type ReviewDifficulty = typeof reviewDifficulties[number];
export interface ReviewCode { language: 'kotlin'; context: string; dependencies: string[]; code: string; verification: 'not-compiled' }
export interface ReviewChallenge {
  id: string; type: 'code-review'; difficulty: ReviewDifficulty; topic: string;
  title: string; prompt: string; estimatedMinutes: number;
  snippet: ReviewCode; correctedImplementation: ReviewCode;
  issues: { location: string; rootCause: string; consequence: string; fix: string }[];
  tradeoffs: string; followUps: string[];
  references: { title: string; url: string; supports: string }[];
}
