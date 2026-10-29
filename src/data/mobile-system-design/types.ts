export const questionFields = ['scenario', 'functional', 'outOfScope', 'nonFunctional', 'assumptions', 'tasks'] as const;
export const solutionFields = ['architecture', 'components', 'technologies', 'contracts', 'workflows', 'recovery', 'tradeoffs', 'testing', 'talkingPoints'] as const;
export interface DesignChallenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  minutes: number;
  question: Record<typeof questionFields[number], readonly string[]>;
  solution: Record<typeof solutionFields[number], readonly string[]>;
  references: readonly { title: string; url: string }[];
}
