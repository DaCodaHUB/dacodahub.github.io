export const resourceTypes = ['documentation', 'video', 'repository', 'article'] as const;
export type ResourceType = typeof resourceTypes[number];
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export interface Resource { title: string; url: string; type: ResourceType; description?: string }
export interface Category { id: string; title: string; description: string }
export interface Topic {
  id: string;
  category: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  concepts: string[];
  resources: Resource[];
}
export const resourceLabels: Record<ResourceType, string> = {
  documentation: 'Documentation', video: 'YouTube videos', repository: 'GitHub repositories', article: 'Technical articles',
};
