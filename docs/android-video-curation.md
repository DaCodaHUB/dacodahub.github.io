# Android library video curation

Reviewed October 19, 2026. Added **55 unique videos**; the library now has **59 videos** and **210 unique resources** across the same 102 topics and 12 categories. **62 topics** have an attached video. The original 151 documentation, repository and article resources are retained.

## New videos by creator

| Creator | Added |
| --- | ---: |
| Philipp Lackner | 31 |
| Kotlin by JetBrains | 6 |
| Android Developers | 18 |

## Verification and selection

Candidates were discovered from the requested creators' public YouTube channel search pages. Exact titles and author names were checked through YouTube oEmbed, with watch-page publication dates and descriptions used to check subject relevance. No IDs were guessed and no generic channel/search URLs were added as topic resources.

Practical implementations favor Philipp Lackner; platform, Compose and performance coverage favors Android Developers; language/concurrency presentations include Kotlin by JetBrains. Each addition declares the topic IDs it supports in `src/data/android-fundamentals/videos.ts`. A video is shared only between explicitly related topics, never repeated within a topic. Titles are retained as returned by YouTube. Creator is optional resource metadata, shown alongside descriptions. Topic difficulty remains the existing level label.

Older recordings are identified by year. Older language explanations are included for durable concepts; setup and API examples are subordinate to current written documentation. A 2021 Flow-testing candidate was excluded in favor of the KotlinConf coroutine-testing presentation. A foreground-service discussion narrowly about Android 12 was excluded in favor of broader official background-work guidance and the existing up-to-date documentation. No claim is made that older SDK examples describe today's service limits. Metadata and topic descriptions were reviewed; videos were not watched end-to-end, and regional playback restrictions cannot be ruled out.

The existing Roman Elizarov Flow recording is published by **JetBrains**, not the separate **Kotlin by JetBrains** channel; its creator field matches the verified author. Existing video links and their descriptions remain intact.

Run `npm run library:check-links` for availability, exact video-title and creator checks. The ignored report is `.astro/android-link-report.json`. This is an opt-in maintenance command, not a browser request or CI network dependency.

## Added video-to-topic matches

| Video | Creator | Topics |
| --- | --- | --- |
| [Kotlin Newbie To Pro - NULL VALUES AND USER INPUT - Part 10](https://www.youtube.com/watch?v=e4Wg9L59ANk) | Philipp Lackner | Null safety |
| [All Classes In Kotlin Explained](https://www.youtube.com/watch?v=xAslJ-f9PWs) | Philipp Lackner | Classes, interfaces & inheritance; Data classes, sealed classes & objects |
| [Kotlin Collections Overview](https://www.youtube.com/watch?v=F8jj7e-_jFA) | Kotlin by JetBrains | Collections & functional operations |
| [What is the IN Keyword Used For in Kotlin? (Generics)](https://www.youtube.com/watch?v=D4kYc0Cu4Qs) | Philipp Lackner | Generics & variance |
| [THIS Is What the Out Keyword Is All About In Kotlin](https://www.youtube.com/watch?v=RLWY4dVLFiI) | Philipp Lackner | Generics & variance |
| [Kotlin Newbie to Pro - EXTENSION FUNCTIONS - Part 19](https://www.youtube.com/watch?v=rXJk9Qk8_2U) | Philipp Lackner | Extension functions |
| [Kotlin Newbie to Pro - LAMBDA FUNCTIONS - Part 28](https://www.youtube.com/watch?v=wnyN8umZIRM) | Philipp Lackner | Lambdas & higher-order functions |
| [Full Guide to Delegation in Kotlin  - Android Studio Tutorial](https://www.youtube.com/watch?v=MfJB-JhRAoQ) | Philipp Lackner | Delegation |
| [FULL Guide to Kotlin's Inline Keyword (inline, crossinline & noinline)](https://www.youtube.com/watch?v=Itb5fu4UVt4) | Philipp Lackner | Inline functions & reified generics |
| [All You Need to Know About the REIFIED Keyword In Kotlin](https://www.youtube.com/watch?v=thOZxsSqEMM) | Philipp Lackner | Inline functions & reified generics |
| [From Java to Kotlin and Back \| Kotlin Team Tutorial](https://www.youtube.com/watch?v=ihMhu3hvCCE) | Kotlin by JetBrains | Java interoperability |
| [Threads vs. Kotlin Coroutines vs. Dispatchers - The Last Video You'll Need](https://www.youtube.com/watch?v=0Hv5LTxAutw) | Philipp Lackner | Coroutines; Coroutine scopes & dispatchers |
| [What Really Is Structured Concurrency In Kotlin? - Android Coding Interview Q&A](https://www.youtube.com/watch?v=Of6cqKjEBGw) | Philipp Lackner | Structured concurrency |
| [Graceful Resource Handling Using Structured Concurrency in Kotlin](https://www.youtube.com/watch?v=zKrTBH8jqH4) | Kotlin by JetBrains | Structured concurrency |
| [CoroutineScope VS. SupervisorScope](https://www.youtube.com/watch?v=5QKdFFqktbk) | Philipp Lackner | Job versus SupervisorJob |
| [In-Depth Guide to Coroutine Cancellation & Exception Handling - Android Studio Tutorial](https://www.youtube.com/watch?v=VWlwkqmTLHc) | Philipp Lackner | Cancellation & exception handling |
| [Flow Basics - The Ultimate Guide to Kotlin Flows (Part 1)](https://www.youtube.com/watch?v=ZX8VsqNO_Ss) | Philipp Lackner | Flow |
| [StateFlow & SharedFlow - The Ultimate Guide to Kotlin Flows (Part 3)](https://www.youtube.com/watch?v=za-EEkqJLCQ) | Philipp Lackner | StateFlow versus SharedFlow |
| [Channels in Kotlin Coroutines \| Nikita Koval](https://www.youtube.com/watch?v=ee0cG2SDJNE) | Kotlin by JetBrains | Channels |
| [Coroutines and Loom behind the scenes by Roman Elizarov](https://www.youtube.com/watch?v=zluKcazgkV4) | Kotlin by JetBrains | Coroutines |
| [Best practices for saving UI state on Android](https://www.youtube.com/watch?v=V-s4z7B_Gnc) | Android Developers | Process death & state restoration; remember & rememberSaveable |
| [ViewModels & Configuration Changes - Android Basics 2023](https://www.youtube.com/watch?v=9sqvBydNJSg) | Philipp Lackner | Configuration changes; ViewModel & lifecycle-aware state |
| [Collecting flows in a lifecycle-aware manner](https://www.youtube.com/watch?v=6hNXFs1fYaY) | Android Developers | ViewModel & lifecycle-aware state |
| [Jetpack Compose: Debugging recomposition](https://www.youtube.com/watch?v=SWBN0y0lFNY) | Android Developers | Recomposition & state |
| [From data to UI: Compose phases - MAD Skills](https://www.youtube.com/watch?v=0yK7KoruhSM) | Android Developers | Composition, layout & drawing |
| [Advanced state and side effects in Jetpack Compose](https://www.youtube.com/watch?v=TbxCz5AljQk) | Android Developers | Side effects & effect APIs |
| [Where to hoist that state in Compose?](https://www.youtube.com/watch?v=hWwZ_AuSGfo) | Android Developers | State hoisting |
| [Performance best practices for Jetpack Compose](https://www.youtube.com/watch?v=EOQB8PTLkpY) | Android Developers | UI performance & accessibility |
| [MVVM vs. MVI - Understand the Difference Once and for All](https://www.youtube.com/watch?v=b2z1jvD4VMQ) | Philipp Lackner | MVVM; MVI |
| [Clean Architecture: The ONE Change That Transforms Use Cases From Terrible to Super Useful](https://www.youtube.com/watch?v=xrxC5gRNV48) | Philipp Lackner | Clean Architecture |
| [The Ultimate Dagger-Hilt Guide (Dependency Injection) - Android Studio Tutorial](https://www.youtube.com/watch?v=bbMsuI2p1DQ) | Philipp Lackner | Dependency injection with Hilt & Dagger |
| [Architecture: The data layer - MAD Skills](https://www.youtube.com/watch?v=r5AseKQh2ZE) | Android Developers | Repository pattern |
| [Architecture: The UI layer - MAD Skills](https://www.youtube.com/watch?v=p9VR8KbmzEE) | Android Developers | Unidirectional Data Flow |
| [How to Build an MVI Clean Code Weather App in Android Studio (Jetpack Compose)](https://www.youtube.com/watch?v=eAbKK7JNxCE) | Philipp Lackner | MVI |
| [The FULL Beginner Guide for Room in Android \| Local Database Tutorial for Android](https://www.youtube.com/watch?v=bOd3wO0uFr8) | Philipp Lackner | Room & SQLite |
| [Preferences DataStore - MAD Skills](https://www.youtube.com/watch?v=kp53qL_O5gk) | Android Developers | DataStore |
| [The Ultimate Retrofit Crash Course](https://www.youtube.com/watch?v=t6Sql3WMAnk) | Philipp Lackner | REST APIs & Retrofit |
| [Offline First Architecture - Android Developers Office Hours](https://www.youtube.com/watch?v=vpJIH1vSv0g) | Android Developers | Offline-first architecture; Offline-first design |
| [The 4 Types of Offline Caches On Android - Mobile System Design Basics](https://www.youtube.com/watch?v=4FOw6a8Rrwc) | Philipp Lackner | Caching; Caching strategies |
| [How to Model an SQL Database (DON'T SKIP THIS) - Android Room With Multiple Tables - Part 1](https://www.youtube.com/watch?v=A8AUtcP0rRs) | Philipp Lackner | Database design |
| [Paging with Paging 3](https://www.youtube.com/watch?v=1cwqGOku2a4) | Android Developers | Paging 3; Pagination |
| [WorkManager - Android Basics 2023](https://www.youtube.com/watch?v=A2JetouoNSc) | Philipp Lackner | WorkManager |
| [All 4 Types of Background Work On Android Explained - Mobile System Design Basics](https://www.youtube.com/watch?v=gI7cvPVWZ7w) | Philipp Lackner | Execution restrictions; Mobile-specific trade-offs |
| [Best practices for running background work on Android](https://www.youtube.com/watch?v=t1_8WSEguDY) | Android Developers | Foreground service execution |
| [Engineering memory-performant Android apps](https://www.youtube.com/watch?v=fOXJR5qLq54) | Android Developers | Android runtime & memory management; R8 & shrinking |
| [Find and Fix MEMORY LEAKS with Leak Canary in Android 👀](https://www.youtube.com/watch?v=VvkRe9vP5Oc) | Philipp Lackner | Memory leaks & LeakCanary |
| [Performance: Perfetto Traceviewer - MAD Skills](https://www.youtube.com/watch?v=phhLFicMacY) | Android Developers | Profiling |
| [Making apps blazing fast with Baseline Profiles](https://www.youtube.com/watch?v=yJm5On5Gp4c) | Android Developers | Baseline Profiles |
| [How Google made their Android app start faster](https://www.youtube.com/watch?v=UiJXe5ipSYA) | Android Developers | App startup performance |
| [How to Know What to Test in Your App?](https://www.youtube.com/watch?v=BNLwer9JGcs) | Philipp Lackner | Unit testing |
| [Untangling Coroutine Testing by Márton Braun](https://www.youtube.com/watch?v=nKCsIHWircA) | Kotlin by JetBrains | Coroutines testing |
| [Write your first Compose UI test](https://www.youtube.com/watch?v=JyUJZvJ-OV8) | Android Developers | Compose UI testing |
| [Beginner's Guide to Mobile App System Design (+ Tips for Interviews!)](https://www.youtube.com/watch?v=OP6JHa21We8) | Philipp Lackner | Requirements gathering; High-level mobile architecture |
| [Activities & the Activity Lifecycle - Android Basics 2023](https://www.youtube.com/watch?v=SJw3Nu_h8kk) | Philipp Lackner | Activity & Fragment lifecycles |
| [Full Guide to Testing APIs on Android & KMP With Ktor MockEngine](https://www.youtube.com/watch?v=mKwPoGvkjSw) | Philipp Lackner | Integration testing |

## Topics without a verified video match in this pass

These topics keep their written resources. This list records curation gaps, not a claim that no suitable video exists. A broad tutorial or loosely related talk was not added just to fill a slot. Coverage elsewhere means at least one relevant video, not complete coverage of every sub-concept (for example, Activity guidance does not replace Fragment-specific documentation).

- **Concurrency:** Thread safety & shared mutable state.
- **Android platform:** Intents & deep links; Services & foreground services; Broadcast receivers; Runtime permissions; Application & Context lifetimes.
- **Compose & UI:** Lazy lists; Navigation; Material Design; XML Views & interoperability.
- **App architecture:** Modularization.
- **Data, storage & networking:** GraphQL; Serialization; Authentication; Synchronization & conflict resolution; Error handling, retries & backoff.
- **Background execution:** JobScheduler; Notifications & FCM.
- **Performance & reliability:** Android Runtime & garbage collection; ANRs & crashes; Battery efficiency; Crash reporting.
- **Security:** Android Keystore; Secure data storage; OAuth & token handling; Permissions & least privilege; Deep link security; Network security.
- **Testing & tooling:** Fakes & mocking; Gradle; Build variants; CI/CD; App signing & Google Play releases.
- **Mobile system design:** API contracts; Synchronization; Reliability & scalability.
- **Interview preparation:** Android fundamentals questions; Kotlin exercises; Algorithms & data structures; Mobile system design exercises.

## Reset button repair

The empty-state native button had only `.btn`: light foreground text but no explicit background or primary variant. Unlike anchor buttons, it could inherit a white browser ButtonFace background. It now reuses `.btn.btn--primary`; the shared `button.btn` rule resets native appearance and inherits the site font. Existing primary normal/hover colors, border and the library's focus-visible outline are reused. The existing reset handler clears query, category and difficulty and restores focus to search.

The portfolio has a fixed dark palette and no separate light theme. Browser checks cover both light/dark color-scheme preferences, desktop and narrow viewports, normal/hover contrast, keyboard focus and Enter activation. No theme system or unrelated page redesign is introduced.
