import type { Resource } from './types.ts';

export interface TopicVideo { topicIds: readonly string[]; resource: Resource }
// Verified against public channel results, oEmbed titles/authors and watch-page dates.
// Review details and remaining coverage gaps: docs/android-video-curation.md.
export const videoAdditions = [
  {
    "topicIds": [
      "kotlin-null-safety"
    ],
    "resource": {
      "title": "Kotlin Newbie To Pro - NULL VALUES AND USER INPUT - Part 10",
      "url": "https://www.youtube.com/watch?v=e4Wg9L59ANk",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Nullable values, safe access and absent user input. A language-focused example; use the current Kotlin docs for tooling and API details. Recorded in 2019."
    }
  },
  {
    "topicIds": [
      "kotlin-classes",
      "kotlin-data-sealed-objects"
    ],
    "resource": {
      "title": "All Classes In Kotlin Explained",
      "url": "https://www.youtube.com/watch?v=xAslJ-f9PWs",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Explains normal, data, sealed, abstract and object declarations with practical examples. Recorded in 2025."
    }
  },
  {
    "topicIds": [
      "kotlin-collections"
    ],
    "resource": {
      "title": "Kotlin Collections Overview",
      "url": "https://www.youtube.com/watch?v=F8jj7e-_jFA",
      "type": "video",
      "creator": "Kotlin by JetBrains",
      "description": "An official tour of Kotlin collection types and how they differ. Recorded in 2021."
    }
  },
  {
    "topicIds": [
      "kotlin-generics"
    ],
    "resource": {
      "title": "What is the IN Keyword Used For in Kotlin? (Generics)",
      "url": "https://www.youtube.com/watch?v=D4kYc0Cu4Qs",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Explains contravariance and the in keyword through generic APIs. Recorded in 2023."
    }
  },
  {
    "topicIds": [
      "kotlin-generics"
    ],
    "resource": {
      "title": "THIS Is What the Out Keyword Is All About In Kotlin",
      "url": "https://www.youtube.com/watch?v=RLWY4dVLFiI",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Explains covariance and the out keyword; pair with the in-keyword example. Recorded in 2022."
    }
  },
  {
    "topicIds": [
      "kotlin-extensions"
    ],
    "resource": {
      "title": "Kotlin Newbie to Pro - EXTENSION FUNCTIONS - Part 19",
      "url": "https://www.youtube.com/watch?v=rXJk9Qk8_2U",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "A focused introduction to extension functions. Language fundamentals remain useful; consult current docs alongside the older recording. Recorded in 2020."
    }
  },
  {
    "topicIds": [
      "kotlin-lambdas"
    ],
    "resource": {
      "title": "Kotlin Newbie to Pro - LAMBDA FUNCTIONS - Part 28",
      "url": "https://www.youtube.com/watch?v=wnyN8umZIRM",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Builds lambda functions and passes behavior as values. Use current Kotlin documentation alongside the older language tutorial. Recorded in 2020."
    }
  },
  {
    "topicIds": [
      "kotlin-delegation"
    ],
    "resource": {
      "title": "Full Guide to Delegation in Kotlin  - Android Studio Tutorial",
      "url": "https://www.youtube.com/watch?v=MfJB-JhRAoQ",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Demonstrates Kotlin delegation and how it changes implementation and ownership of behavior. Recorded in 2022."
    }
  },
  {
    "topicIds": [
      "kotlin-inline-reified"
    ],
    "resource": {
      "title": "FULL Guide to Kotlin's Inline Keyword (inline, crossinline & noinline)",
      "url": "https://www.youtube.com/watch?v=Itb5fu4UVt4",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Explains inline, crossinline and noinline and the behavior of function parameters. Recorded in 2024."
    }
  },
  {
    "topicIds": [
      "kotlin-inline-reified"
    ],
    "resource": {
      "title": "All You Need to Know About the REIFIED Keyword In Kotlin",
      "url": "https://www.youtube.com/watch?v=thOZxsSqEMM",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Explains reified type parameters and when runtime type access is useful. Recorded in 2023."
    }
  },
  {
    "topicIds": [
      "kotlin-java-interop"
    ],
    "resource": {
      "title": "From Java to Kotlin and Back | Kotlin Team Tutorial",
      "url": "https://www.youtube.com/watch?v=ihMhu3hvCCE",
      "type": "video",
      "creator": "Kotlin by JetBrains",
      "description": "A Kotlin team tutorial about crossing the Kotlin–Java boundary in both directions. Recorded in 2022."
    }
  },
  {
    "topicIds": [
      "concurrency-coroutines",
      "concurrency-scopes-dispatchers"
    ],
    "resource": {
      "title": "Threads vs. Kotlin Coroutines vs. Dispatchers - The Last Video You'll Need",
      "url": "https://www.youtube.com/watch?v=0Hv5LTxAutw",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Separates threads, coroutine execution and dispatchers with practical examples. Recorded in 2025."
    }
  },
  {
    "topicIds": [
      "concurrency-structured"
    ],
    "resource": {
      "title": "What Really Is Structured Concurrency In Kotlin? - Android Coding Interview Q&A",
      "url": "https://www.youtube.com/watch?v=Of6cqKjEBGw",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Explains structured concurrency through ownership and parent–child coroutine lifetimes. Recorded in 2026."
    }
  },
  {
    "topicIds": [
      "concurrency-structured"
    ],
    "resource": {
      "title": "Graceful Resource Handling Using Structured Concurrency in Kotlin",
      "url": "https://www.youtube.com/watch?v=zKrTBH8jqH4",
      "type": "video",
      "creator": "Kotlin by JetBrains",
      "description": "A Kotlin presentation on resource handling and cleanup within structured concurrency. Recorded in 2023."
    }
  },
  {
    "topicIds": [
      "concurrency-job-supervisor"
    ],
    "resource": {
      "title": "CoroutineScope VS. SupervisorScope",
      "url": "https://www.youtube.com/watch?v=5QKdFFqktbk",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Compares coroutineScope and supervisorScope and how child failures affect sibling work. Recorded in 2022."
    }
  },
  {
    "topicIds": [
      "concurrency-cancellation"
    ],
    "resource": {
      "title": "In-Depth Guide to Coroutine Cancellation & Exception Handling - Android Studio Tutorial",
      "url": "https://www.youtube.com/watch?v=VWlwkqmTLHc",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Practical cancellation, exception propagation and supervision. Check current coroutine documentation for API details. Recorded in 2022."
    }
  },
  {
    "topicIds": [
      "concurrency-flow"
    ],
    "resource": {
      "title": "Flow Basics - The Ultimate Guide to Kotlin Flows (Part 1)",
      "url": "https://www.youtube.com/watch?v=ZX8VsqNO_Ss",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Introduces Flow creation and collection through a focused implementation tutorial. Recorded in 2021."
    }
  },
  {
    "topicIds": [
      "concurrency-stateflow-sharedflow"
    ],
    "resource": {
      "title": "StateFlow & SharedFlow - The Ultimate Guide to Kotlin Flows (Part 3)",
      "url": "https://www.youtube.com/watch?v=za-EEkqJLCQ",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Compares StateFlow and SharedFlow behavior and practical use cases. Use current docs for lifecycle collection guidance. Recorded in 2021."
    }
  },
  {
    "topicIds": [
      "concurrency-channels"
    ],
    "resource": {
      "title": "Channels in Kotlin Coroutines | Nikita Koval",
      "url": "https://www.youtube.com/watch?v=ee0cG2SDJNE",
      "type": "video",
      "creator": "Kotlin by JetBrains",
      "description": "Nikita Koval explains channels in Kotlin coroutines and communication between concurrent operations. Recorded in 2024."
    }
  },
  {
    "topicIds": [
      "concurrency-coroutines"
    ],
    "resource": {
      "title": "Coroutines and Loom behind the scenes by Roman Elizarov",
      "url": "https://www.youtube.com/watch?v=zluKcazgkV4",
      "type": "video",
      "creator": "Kotlin by JetBrains",
      "description": "Roman Elizarov explores coroutine implementation concepts and the relationship with Loom. JVM implementation details evolve. Recorded in 2023."
    }
  },
  {
    "topicIds": [
      "platform-process-death",
      "ui-remember"
    ],
    "resource": {
      "title": "Best practices for saving UI state on Android",
      "url": "https://www.youtube.com/watch?v=V-s4z7B_Gnc",
      "type": "video",
      "creator": "Android Developers",
      "description": "Official guidance comparing remember, rememberSaveable, ViewModel and saved state across recreation and process death. Recorded in 2023."
    }
  },
  {
    "topicIds": [
      "platform-configuration",
      "architecture-viewmodel"
    ],
    "resource": {
      "title": "ViewModels & Configuration Changes - Android Basics 2023",
      "url": "https://www.youtube.com/watch?v=9sqvBydNJSg",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Explains how ViewModels relate to configuration changes and screen state ownership. Recorded in 2023."
    }
  },
  {
    "topicIds": [
      "architecture-viewmodel"
    ],
    "resource": {
      "title": "Collecting flows in a lifecycle-aware manner",
      "url": "https://www.youtube.com/watch?v=6hNXFs1fYaY",
      "type": "video",
      "creator": "Android Developers",
      "description": "Official guidance for collecting flows while the UI is in an appropriate lifecycle state. Recorded in 2022."
    }
  },
  {
    "topicIds": [
      "ui-recomposition"
    ],
    "resource": {
      "title": "Jetpack Compose: Debugging recomposition",
      "url": "https://www.youtube.com/watch?v=SWBN0y0lFNY",
      "type": "video",
      "creator": "Android Developers",
      "description": "Shows how to investigate recomposition rather than guessing which UI work is repeated. Recorded in 2022."
    }
  },
  {
    "topicIds": [
      "ui-phases"
    ],
    "resource": {
      "title": "From data to UI: Compose phases - MAD Skills",
      "url": "https://www.youtube.com/watch?v=0yK7KoruhSM",
      "type": "video",
      "creator": "Android Developers",
      "description": "Explains composition, layout and drawing and how data moves through Compose phases. Recorded in 2023."
    }
  },
  {
    "topicIds": [
      "ui-effects"
    ],
    "resource": {
      "title": "Advanced state and side effects in Jetpack Compose",
      "url": "https://www.youtube.com/watch?v=TbxCz5AljQk",
      "type": "video",
      "creator": "Android Developers",
      "description": "Official presentation on state and effect lifetimes in Compose; pair with the current effect API reference. Recorded in 2023."
    }
  },
  {
    "topicIds": [
      "ui-hoisting"
    ],
    "resource": {
      "title": "Where to hoist that state in Compose?",
      "url": "https://www.youtube.com/watch?v=hWwZ_AuSGfo",
      "type": "video",
      "creator": "Android Developers",
      "description": "Explains how to choose the owner of state and decide how far to hoist it. Recorded in 2022."
    }
  },
  {
    "topicIds": [
      "ui-performance-accessibility"
    ],
    "resource": {
      "title": "Performance best practices for Jetpack Compose",
      "url": "https://www.youtube.com/watch?v=EOQB8PTLkpY",
      "type": "video",
      "creator": "Android Developers",
      "description": "Focuses on the performance part of this topic: measuring and improving Compose rendering. Accessibility guidance remains in the linked docs. Recorded in 2022."
    }
  },
  {
    "topicIds": [
      "architecture-mvvm",
      "architecture-mvi"
    ],
    "resource": {
      "title": "MVVM vs. MVI - Understand the Difference Once and for All",
      "url": "https://www.youtube.com/watch?v=b2z1jvD4VMQ",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "A practical comparison of MVVM and MVI terminology, state and event handling; conventions vary between codebases. Recorded in 2024."
    }
  },
  {
    "topicIds": [
      "architecture-clean"
    ],
    "resource": {
      "title": "Clean Architecture: The ONE Change That Transforms Use Cases From Terrible to Super Useful",
      "url": "https://www.youtube.com/watch?v=xrxC5gRNV48",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Discusses use-case design within Clean Architecture. Treat the proposed approach as a design trade-off, not a universal rule. Recorded in 2025."
    }
  },
  {
    "topicIds": [
      "architecture-dependency-injection"
    ],
    "resource": {
      "title": "The Ultimate Dagger-Hilt Guide (Dependency Injection) - Android Studio Tutorial",
      "url": "https://www.youtube.com/watch?v=bbMsuI2p1DQ",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Demonstrates Hilt modules, bindings and injection. Follow current Hilt docs for dependency versions and setup. Recorded in 2022."
    }
  },
  {
    "topicIds": [
      "architecture-repositories"
    ],
    "resource": {
      "title": "Architecture: The data layer - MAD Skills",
      "url": "https://www.youtube.com/watch?v=r5AseKQh2ZE",
      "type": "video",
      "creator": "Android Developers",
      "description": "Official explanation of data-layer responsibilities, repositories and data sources. Recorded in 2022."
    }
  },
  {
    "topicIds": [
      "architecture-udf"
    ],
    "resource": {
      "title": "Architecture: The UI layer - MAD Skills",
      "url": "https://www.youtube.com/watch?v=p9VR8KbmzEE",
      "type": "video",
      "creator": "Android Developers",
      "description": "Official explanation of the UI layer, state ownership and the direction of data and events. Recorded in 2022."
    }
  },
  {
    "topicIds": [
      "architecture-mvi"
    ],
    "resource": {
      "title": "How to Build an MVI Clean Code Weather App in Android Studio (Jetpack Compose)",
      "url": "https://www.youtube.com/watch?v=eAbKK7JNxCE",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Implements a weather app with Compose and MVI. Use it to inspect the architecture; setup and dependencies may differ today. Recorded in 2022."
    }
  },
  {
    "topicIds": [
      "data-room-sqlite"
    ],
    "resource": {
      "title": "The FULL Beginner Guide for Room in Android | Local Database Tutorial for Android",
      "url": "https://www.youtube.com/watch?v=bOd3wO0uFr8",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "A practical Room tutorial covering local database setup and access. Refer to current Room docs for library versions. Recorded in 2023."
    }
  },
  {
    "topicIds": [
      "data-datastore"
    ],
    "resource": {
      "title": "Preferences DataStore - MAD Skills",
      "url": "https://www.youtube.com/watch?v=kp53qL_O5gk",
      "type": "video",
      "creator": "Android Developers",
      "description": "Official demonstration of Preferences DataStore and asynchronous preference updates. Recorded in 2022."
    }
  },
  {
    "topicIds": [
      "data-retrofit"
    ],
    "resource": {
      "title": "The Ultimate Retrofit Crash Course",
      "url": "https://www.youtube.com/watch?v=t6Sql3WMAnk",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Demonstrates HTTP API interfaces, requests and response handling. Retrofit has moved to Lysine; use the current docs for setup. Recorded in 2021."
    }
  },
  {
    "topicIds": [
      "data-offline-first",
      "system-design-offline"
    ],
    "resource": {
      "title": "Offline First Architecture - Android Developers Office Hours",
      "url": "https://www.youtube.com/watch?v=vpJIH1vSv0g",
      "type": "video",
      "creator": "Android Developers",
      "description": "Android Developers discusses offline-first architecture. Use the linked written guide for precise sync and conflict policies. Recorded in 2026."
    }
  },
  {
    "topicIds": [
      "data-caching",
      "system-design-cache-strategies"
    ],
    "resource": {
      "title": "The 4 Types of Offline Caches On Android - Mobile System Design Basics",
      "url": "https://www.youtube.com/watch?v=4FOw6a8Rrwc",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Compares mobile cache approaches and explains their freshness and ownership trade-offs. Recorded in 2026."
    }
  },
  {
    "topicIds": [
      "system-design-database"
    ],
    "resource": {
      "title": "How to Model an SQL Database (DON'T SKIP THIS) - Android Room With Multiple Tables - Part 1",
      "url": "https://www.youtube.com/watch?v=A8AUtcP0rRs",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Models a relational database before implementing Room tables and relationships. Recorded in 2020."
    }
  },
  {
    "topicIds": [
      "data-paging",
      "system-design-pagination"
    ],
    "resource": {
      "title": "Paging with Paging 3",
      "url": "https://www.youtube.com/watch?v=1cwqGOku2a4",
      "type": "video",
      "creator": "Android Developers",
      "description": "Official introduction to loading and presenting paginated data with Paging 3. Recorded in 2020."
    }
  },
  {
    "topicIds": [
      "background-workmanager"
    ],
    "resource": {
      "title": "WorkManager - Android Basics 2023",
      "url": "https://www.youtube.com/watch?v=A2JetouoNSc",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Implements WorkManager tasks and explains persistent background work. Verify current platform limits and dependency versions. Recorded in 2023."
    }
  },
  {
    "topicIds": [
      "background-restrictions",
      "system-design-trade-offs"
    ],
    "resource": {
      "title": "All 4 Types of Background Work On Android Explained - Mobile System Design Basics",
      "url": "https://www.youtube.com/watch?v=gI7cvPVWZ7w",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Compares background-work mechanisms and their mobile lifecycle trade-offs. Consult current restrictions before implementation. Recorded in 2026."
    }
  },
  {
    "topicIds": [
      "background-foreground"
    ],
    "resource": {
      "title": "Best practices for running background work on Android",
      "url": "https://www.youtube.com/watch?v=t1_8WSEguDY",
      "type": "video",
      "creator": "Android Developers",
      "description": "Official guidance for choosing and running background work. Check current foreground-service restrictions for your Android version and target SDK. Recorded in 2022."
    }
  },
  {
    "topicIds": [
      "platform-runtime-memory",
      "testing-r8"
    ],
    "resource": {
      "title": "Engineering memory-performant Android apps",
      "url": "https://www.youtube.com/watch?v=fOXJR5qLq54",
      "type": "video",
      "creator": "Android Developers",
      "description": "Official guidance on memory-efficient apps, bitmap optimization, R8 and production memory diagnostics. Recorded in 2026."
    }
  },
  {
    "topicIds": [
      "performance-memory-leaks"
    ],
    "resource": {
      "title": "Find and Fix MEMORY LEAKS with Leak Canary in Android 👀",
      "url": "https://www.youtube.com/watch?v=VvkRe9vP5Oc",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Demonstrates finding retained objects and diagnosing memory leaks with LeakCanary. Recorded in 2022."
    }
  },
  {
    "topicIds": [
      "performance-profiling"
    ],
    "resource": {
      "title": "Performance: Perfetto Traceviewer - MAD Skills",
      "url": "https://www.youtube.com/watch?v=phhLFicMacY",
      "type": "video",
      "creator": "Android Developers",
      "description": "Official walkthrough of investigating performance with Perfetto traces. Recorded in 2021."
    }
  },
  {
    "topicIds": [
      "performance-baseline-profiles"
    ],
    "resource": {
      "title": "Making apps blazing fast with Baseline Profiles",
      "url": "https://www.youtube.com/watch?v=yJm5On5Gp4c",
      "type": "video",
      "creator": "Android Developers",
      "description": "Explains Baseline Profiles and their role in improving important application journeys. Recorded in 2022."
    }
  },
  {
    "topicIds": [
      "performance-startup"
    ],
    "resource": {
      "title": "How Google made their Android app start faster",
      "url": "https://www.youtube.com/watch?v=UiJXe5ipSYA",
      "type": "video",
      "creator": "Android Developers",
      "description": "A concrete Android startup optimization case study from Google. Recorded in 2026."
    }
  },
  {
    "topicIds": [
      "testing-unit"
    ],
    "resource": {
      "title": "How to Know What to Test in Your App?",
      "url": "https://www.youtube.com/watch?v=BNLwer9JGcs",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Practical guidance for choosing test cases and testing observable behavior instead of implementation details. Recorded in 2023."
    }
  },
  {
    "topicIds": [
      "testing-coroutines"
    ],
    "resource": {
      "title": "Untangling Coroutine Testing by Márton Braun",
      "url": "https://www.youtube.com/watch?v=nKCsIHWircA",
      "type": "video",
      "creator": "Kotlin by JetBrains",
      "description": "A KotlinConf presentation untangling coroutine testing, test dispatchers and virtual time. Pair with the current runTest reference. Recorded in 2023."
    }
  },
  {
    "topicIds": [
      "testing-compose-ui"
    ],
    "resource": {
      "title": "Write your first Compose UI test",
      "url": "https://www.youtube.com/watch?v=JyUJZvJ-OV8",
      "type": "video",
      "creator": "Android Developers",
      "description": "Official walkthrough of writing a first Compose UI test using semantics and assertions. Recorded in 2022."
    }
  },
  {
    "topicIds": [
      "system-design-requirements",
      "system-design-architecture"
    ],
    "resource": {
      "title": "Beginner's Guide to Mobile App System Design (+ Tips for Interviews!)",
      "url": "https://www.youtube.com/watch?v=OP6JHa21We8",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Introduces mobile system-design discussions, requirements and architecture trade-offs with interview-oriented examples. Recorded in 2026."
    }
  },
  {
    "topicIds": [
      "platform-lifecycles"
    ],
    "resource": {
      "title": "Activities & the Activity Lifecycle - Android Basics 2023",
      "url": "https://www.youtube.com/watch?v=SJw3Nu_h8kk",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Explains Activity callbacks and how lifecycle changes affect a running Android screen. Fragment-specific guidance remains in the official docs. Recorded in 2023."
    }
  },
  {
    "topicIds": [
      "testing-integration"
    ],
    "resource": {
      "title": "Full Guide to Testing APIs on Android & KMP With Ktor MockEngine",
      "url": "https://www.youtube.com/watch?v=mKwPoGvkjSw",
      "type": "video",
      "creator": "Philipp Lackner",
      "description": "Tests HTTP client behavior using Ktor MockEngine, illustrating controlled API boundaries without a live backend. The example uses Ktor rather than Retrofit. Recorded in 2025."
    }
  },
{
  "topicIds": [
    "data-datastore"
  ],
  "resource": {
    "title": "Proto DataStore - Persist Typed Objects with Protocol Buffers | Android Studio Tutorial",
    "url": "https://www.youtube.com/watch?v=5_Jy8Alcp14",
    "type": "video",
    "creator": "Stevdza-San",
    "description": "Persist typed settings with Proto DataStore and protocol buffers. Pair the implementation with current DataStore documentation. Recorded in 2020."
  }
},
{
  "topicIds": [
    "ui-navigation"
  ],
  "resource": {
    "title": "Everything you need to know about NEW Navigation 3",
    "url": "https://www.youtube.com/watch?v=rzbCXhcoAbo",
    "type": "video",
    "creator": "Stevdza-San",
    "description": "Legacy implementation. An introduction to Navigation 3 and its back-stack model for Compose. Check current release notes before adopting APIs. Recorded during the initial 2025 release; APIs may differ from the stable release. Recorded in 2025."
  }
},
{
  "topicIds": [
    "platform-permissions"
  ],
  "resource": {
    "title": "Single/Multiple Permission Request with Jetpack Compose | Android Studio Tutorial",
    "url": "https://www.youtube.com/watch?v=uO6igFsa5y0",
    "type": "video",
    "creator": "Stevdza-San",
    "description": "Request single and multiple runtime permissions from a Compose screen; check current platform-specific permission rules. Recorded in 2022."
  }
},
{
  "topicIds": [
    "platform-intents-links"
  ],
  "resource": {
    "title": "2021 Android Guide: Activity Navigation with Intents",
    "url": "https://www.youtube.com/watch?v=P9N15dtsNgQ",
    "type": "video",
    "creator": "The Android Factory",
    "description": "Legacy implementation. Foundational explicit Activity navigation with intents. Legacy Views-era example; this does not cover verified App Links. Recorded in 2021."
  }
},
{
  "topicIds": [
    "testing-unit"
  ],
  "resource": {
    "title": "Writing your first test: Android explained",
    "url": "https://www.youtube.com/watch?v=KtpTvJXXK2k",
    "type": "video",
    "creator": "The Android Factory",
    "description": "A practical introduction to writing a first Android test and asserting behavior. Recorded in 2023."
  }
},
{
  "topicIds": [
    "testing-ci-cd"
  ],
  "resource": {
    "title": "GitHub Actions: Run tests on pull request open",
    "url": "https://www.youtube.com/watch?v=LHNzLCmCnPA",
    "type": "video",
    "creator": "The Android Factory",
    "description": "Run automated tests when a pull request opens using GitHub Actions. Update action versions and permissions to current guidance. Recorded in 2023."
  }
},
{
  "topicIds": [
    "testing-gradle"
  ],
  "resource": {
    "title": "The Ultimate Gradle Kotlin Beginner's Crash Course For 2025",
    "url": "https://www.youtube.com/watch?v=RCRQlz78wCg",
    "type": "video",
    "creator": "Philipp Lackner",
    "description": "Gradle Kotlin DSL fundamentals, tasks and build configuration. Recorded in 2024."
  }
},
{
  "topicIds": [
    "testing-variants"
  ],
  "resource": {
    "title": "Gradle for Beginners (Build Types, Product Flavors, Build Variants, Source Sets)",
    "url": "https://www.youtube.com/watch?v=o0M4f5djJTQ",
    "type": "video",
    "creator": "Philipp Lackner",
    "description": "Legacy implementation. Build types, product flavors, variants and source sets. Older implementation: compare plugin syntax with current Android build guidance. Recorded in 2022."
  }
},
{
  "topicIds": [
    "architecture-modularization"
  ],
  "resource": {
    "title": "Don't Do These Fatal Mistakes With a Multi-Module Architecture",
    "url": "https://www.youtube.com/watch?v=p7-AffMucBw",
    "type": "video",
    "creator": "Philipp Lackner",
    "description": "Practical multi-module architecture mistakes and module dependency decisions. Recorded in 2022."
  }
},
{
  "topicIds": [
    "data-authentication"
  ],
  "resource": {
    "title": "Save User Credentials With the Google Credential Manager - Android Studio Tutorial",
    "url": "https://www.youtube.com/watch?v=FULNucVxf94",
    "type": "video",
    "creator": "Philipp Lackner",
    "description": "Use Credential Manager for user credentials; consult current supported providers and security guidance. Recorded in 2024."
  }
},
{
  "topicIds": [
    "concurrency-scopes-dispatchers"
  ],
  "resource": {
    "title": "95% Don't Understand THIS About Coroutines (Main-Safety)",
    "url": "https://www.youtube.com/watch?v=4_fDefmI3yI",
    "type": "video",
    "creator": "Philipp Lackner",
    "description": "Main-safe suspend functions and dispatcher ownership; complements structured concurrency documentation. Recorded in 2023."
  }
},
{
  "topicIds": [
    "background-notifications-fcm"
  ],
  "resource": {
    "title": "Notifications Tutorial Part 1 - NOTIFICATION CHANNELS - Android Studio Tutorial",
    "url": "https://www.youtube.com/watch?v=tTbd1Mfi-Sk",
    "type": "video",
    "creator": "Coding in Flow",
    "description": "Legacy implementation. Notification channel fundamentals. Legacy implementation: notification permission and modern background restrictions require current documentation. Recorded in 2018."
  }
}
] satisfies readonly TopicVideo[];
