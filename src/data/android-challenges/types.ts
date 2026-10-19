export const challengeTypes = ['code-review', 'code-completion', 'system-design', 'engineering-scenario'] as const;
export const difficulties = ['Junior', 'Mid', 'Senior'] as const;
export const challengeTopics = ['kotlin', 'coroutines', 'flow', 'lifecycle', 'compose', 'architecture', 'networking', 'storage', 'background', 'performance', 'testing-security-build', 'system-design'] as const;
export type ChallengeType = typeof challengeTypes[number];
export type ChallengeTopic = typeof challengeTopics[number];
export type Difficulty = typeof difficulties[number];

export interface DocumentationReference {
  title: string;
  url: string;
  supports: string;
}
export interface RubricItem { criterion: string; evidence: string; points: number }
export interface CodeSample {
  language: 'kotlin' | 'pseudocode';
  context: string;
  dependencies: string[];
  code: string;
  verification: 'not-compiled';
}
export interface BaseChallenge {
  id: string;
  title: string;
  topic: ChallengeTopic;
  difficulty: Difficulty;
  estimatedMinutes: number;
  prompt: string;
  assumptions: string[];
  referenceAnswer: string;
  explanation: string;
  rubric: RubricItem[];
  references: DocumentationReference[];
  followUps: string[];
  provenance: {
    source: 'android-kotlin-flashcards';
    cardIds: string[];
    libraryTopicIds: string[];
    additions: string;
  };
}
export interface CodeReviewChallenge extends BaseChallenge {
  type: 'code-review';
  snippet: CodeSample;
  issues: { location: string; rootCause: string; consequence: string }[];
  correctedImplementation: CodeSample;
}
export interface CodeCompletionChallenge extends BaseChallenge {
  type: 'code-completion';
  snippet: CodeSample;
  blanks: { id: string; instruction: string; acceptedAnswers: string[]; explanation: string; commonIncorrectAnswers: { answer: string; reason: string }[] }[];
}
export interface SystemDesignChallenge extends BaseChallenge {
  type: 'system-design';
  functionalRequirements: string[];
  nonfunctionalRequirements: string[];
  clarifyingQuestions: string[];
  suggestedArchitecture: string[];
  apiAndDataModel: string[];
  offlineAndErrors: string[];
  solutionOutline: string[];
  alternatives: { design: string; tradeOff: string }[];
}
export interface EngineeringScenarioChallenge extends BaseChallenge {
  type: 'engineering-scenario';
  observations: string[];
  constraints: string[];
  decisionQuestion: string;
  responseSteps: string[];
  tradeOffs: string[];
}
export type Challenge = CodeReviewChallenge | CodeCompletionChallenge | SystemDesignChallenge | EngineeringScenarioChallenge;
