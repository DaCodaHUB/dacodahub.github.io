import type { Resource } from './types.ts';

export const doc = (title: string, url: string, description?: string): Resource => ({ title, url, type: 'documentation', ...(description ? { description } : {}) });
export const kotlin = (title: string, page: string): Resource => doc(title, `https://kotlinlang.org/docs/${page}`);
export const android = (title: string, page: string): Resource => doc(title, `https://developer.android.com/${page}`);
export const repo = (title: string, url: string, description?: string): Resource => ({ title, url, type: 'repository', ...(description ? { description } : {}) });
export const article = (title: string, url: string, description?: string): Resource => ({ title, url, type: 'article', ...(description ? { description } : {}) });

export const curated = {
  nowInAndroid: repo('Now in Android', 'https://github.com/android/nowinandroid', 'Google’s reference app: Kotlin, Compose, modularization, offline data and testing.'),
  architectureJourney: article('Now in Android: architecture learning journey', 'https://github.com/android/nowinandroid/blob/main/docs/ArchitectureLearningJourney.md', 'The maintainers explain the decisions behind a production-style reference app.'),
  modularizationJourney: article('Now in Android: modularization learning journey', 'https://github.com/android/nowinandroid/blob/main/docs/ModularizationLearningJourney.md', 'Module boundaries, dependency graphs and build organization in a concrete codebase.'),
  interviewQuestions: repo('Android Interview Questions and Answers', 'https://github.com/amitshekhariitbhu/android-interview-questions', 'Community-maintained prompts; cross-check answers against current platform documentation.'),
  mobileDesign: repo('Mobile System Design', 'https://github.com/weeeBox/mobile-system-design', 'A community framework for requirements, architecture, APIs and trade-off discussions.'),
  composeVideo: { title: 'Intuitive: Thinking in Compose - MAD Skills', url: 'https://www.youtube.com/watch?v=4zf30a34OOA', type: 'video', description: 'Android Developers explains the declarative UI mental model. Recorded in 2022; pair with current docs.' } satisfies Resource,
  stateVideo: { title: 'Jetpack Compose: State', url: 'https://www.youtube.com/watch?v=mymWGMy9pYI', type: 'video', description: 'Android Developers on observable state and data flow. Recorded in 2021; APIs may have evolved.' } satisfies Resource,
  flowVideo: { title: 'KotlinConf 2019: Asynchronous Data Streams with Kotlin Flow by Roman Elizarov', url: 'https://www.youtube.com/watch?v=tYcqn48SMT8', type: 'video', description: 'A conceptual introduction from JetBrains. Consult current docs for API details.' } satisfies Resource,
  mockVideo: { title: 'Mobile System Design Mock Interview: Stock Trading App', url: 'https://www.youtube.com/watch?v=qLdy-65LsGk', type: 'video', description: 'Alex Lementuev walks through a concrete mobile system design interview. Compare the reasoning with the written design framework.' } satisfies Resource,
  hotFlowArticle: article('Introducing StateFlow and SharedFlow', 'https://blog.jetbrains.com/kotlin/2020/10/kotlinx-coroutines-1-4-0-introducing-stateflow-and-sharedflow/', 'JetBrains’ original design explanation; use current API references alongside this historical article.'),
  stateArticle: article('The state of managing state (with Compose)', 'https://code.cash.app/the-state-of-managing-state-with-compose', 'Cash App’s engineering perspective on state producers and Compose; an implementation approach, not a mandatory architecture.'),
};
