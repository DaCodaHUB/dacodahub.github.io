# Android resource-filter and video update

Added 12 unique videos across 12 topics. The library now contains 71 unique videos and 222 unique resources across 102 topics. All 151 existing non-video URLs remain represented.

Creator totals: Philipp Lackner 5; Stevdza-San 3; The Android Factory 3; Coding in Flow 1. Existing Android Developers, Kotlin/JetBrains and other resources remain intact. The existing Kotlin, Flow, lifecycle, Compose, architecture, networking, background work, performance and mobile system-design coverage was reviewed before choosing these additions.

## Verification and scope

Each added ID was discovered in the creator's public channel results. Exact titles and creator names were verified with YouTube oEmbed, and publication dates/descriptions checked on the watch page. This verifies public metadata and availability, not full playback or every teaching claim. Descriptions are editorial summaries. Older implementation examples and the initial Navigation 3 release are explicitly labeled Legacy and paired with current documentation. No guessed URLs or unverifiable candidates were added. No selected URLs failed verification. droidcon channel searches did not return usable verified candidates in this review; no links were invented to fill that gap.

| Creator | Verified video | Topic |
| --- | --- | --- |
| Stevdza-San | [Proto DataStore - Persist Typed Objects with Protocol Buffers \| Android Studio Tutorial](https://www.youtube.com/watch?v=5_Jy8Alcp14) | data-datastore |
| Stevdza-San | [Everything you need to know about NEW Navigation 3](https://www.youtube.com/watch?v=rzbCXhcoAbo) | ui-navigation |
| Stevdza-San | [Single/Multiple Permission Request with Jetpack Compose \| Android Studio Tutorial](https://www.youtube.com/watch?v=uO6igFsa5y0) | platform-permissions |
| The Android Factory | [2021 Android Guide: Activity Navigation with Intents](https://www.youtube.com/watch?v=P9N15dtsNgQ) | platform-intents-links |
| The Android Factory | [Writing your first test: Android explained](https://www.youtube.com/watch?v=KtpTvJXXK2k) | testing-unit |
| The Android Factory | [GitHub Actions: Run tests on pull request open](https://www.youtube.com/watch?v=LHNzLCmCnPA) | testing-ci-cd |
| Philipp Lackner | [The Ultimate Gradle Kotlin Beginner's Crash Course For 2025](https://www.youtube.com/watch?v=RCRQlz78wCg) | testing-gradle |
| Philipp Lackner | [Gradle for Beginners (Build Types, Product Flavors, Build Variants, Source Sets)](https://www.youtube.com/watch?v=o0M4f5djJTQ) | testing-variants |
| Philipp Lackner | [Don't Do These Fatal Mistakes With a Multi-Module Architecture](https://www.youtube.com/watch?v=p7-AffMucBw) | architecture-modularization |
| Philipp Lackner | [Save User Credentials With the Google Credential Manager - Android Studio Tutorial](https://www.youtube.com/watch?v=FULNucVxf94) | data-authentication |
| Philipp Lackner | [95% Don't Understand THIS About Coroutines (Main-Safety)](https://www.youtube.com/watch?v=4_fDefmI3yI) | concurrency-scopes-dispatchers |
| Coding in Flow | [Notifications Tutorial Part 1 - NOTIFICATION CHANNELS - Android Studio Tutorial](https://www.youtube.com/watch?v=tTbd1Mfi-Sk) | background-notifications-fcm |

## Filter behavior

Native radio controls provide All, Documentation, Videos, GitHub and Articles with arrow-key selection and visible focus. They intersect category, experience level and text search. Search retains its existing title, description, key-concept and resource-title matching. URL parameter `type` preserves the selected type; invalid values default to All. Reset clears all filters and focuses search. Hash navigation clears incompatible filters to reveal the requested topic.

The result summary counts unique currently displayed resource URLs; topic disclosures show matching links out of their total. Shared resources count once in the summary. Hidden topics close their disclosures, while still-visible expanded topics retain their state. With JavaScript disabled all topics and resources remain available.

## Validation

- 49 Node tests pass, including resource-type intersections, missing types, filtered counts, empty results, duplicate URLs and preserved written resources.
- Astro check: zero errors, warnings or hints. Production build: six routes successful.
- Live link audit: 222 of 222 unique resources passed, including exact video titles and creators.
- Headless Chrome: combined filters, empty/reset/focus, native radio arrow keys, hash navigation and layouts at 320, 390, 768 and 1440 pixels passed. Reset colors remain distinct under light/dark system preferences; the portfolio uses its existing fixed palette.

Changed implementation files: `src/data/android-fundamentals/videos.ts`, `src/lib/android-library.ts`, `src/components/AndroidTopicCard.astro`, `src/pages/android-fundamentals.astro`, `src/styles/android-library.css`, `scripts/android-fundamentals/library.test.ts`. No dependencies or deployment changes.
