---
title: JobTracker
description: "A personal Android engineering project exploring how local-first job application tracking can stay useful through unreliable connectivity and synchronize safely afterward."
lead: "A personal Android engineering project built around a practical question: how can people keep tracking applications when the network disappears, then reconcile their changes safely later?"
category: Personal project
technologies: [Kotlin, Jetpack Compose, Room, Apollo GraphQL, WorkManager, Hilt]
githubUrl: https://github.com/DaCodaHUB/JobTracker
featured: true
order: 1
caseStudy: true
highlights:
  - title: Work locally first
    description: Room drives the UI; creates and edits update local data immediately with a pending sync state.
  - title: Synchronize when connected
    description: Network-constrained WorkManager work sends pending GraphQL mutations and retries Apollo or I/O failures.
  - title: Make divergence visible
    description: Version checks can surface a conflict for an explicit Keep Mine or Keep Server choice.
images:
  - src: /assets/Screenshot_20260727-172108_JobTracker.png
    alt: JobTracker dashboard showing application metrics, search, and a list of saved job applications
    caption: Application dashboard
  - src: /assets/Screenshot_20260727-172148_JobTracker.png
    alt: JobTracker application detail screen showing job information and application progress timeline
    caption: Progress timeline
---

## Overview

JobTracker is a **personal engineering project** for tracking job applications. It explores an Android problem that appears in many mobile products: a screen should remain useful when connectivity is unreliable, while changes made locally still need a safe path to a remote system. The included GraphQL server is a demonstration backend with in-memory storage, not production infrastructure.

## The problem

Creating an application or changing its status should not require an immediate API response. A user may leave the app, lose a connection, or retry after a request times out. In those cases, local and server versions can diverge. A retried create can also produce a duplicate unless the server recognizes it as the same operation. JobTracker models those cases through pending sync states, idempotent creation, version checks, and an explicit conflict choice.

## Architecture

<div class="architecture-diagram" role="group" aria-label="JobTracker write and synchronization path from Compose UI through ViewModel, repository, Room, WorkManager, Apollo GraphQL, and demonstration server">
  <p class="architecture-diagram__label">Write and synchronization path</p>
  <ol class="architecture-flow">
    <li><strong>Compose UI</strong><span>User action and Room-backed rendering</span></li>
    <li><strong>ViewModel + StateFlow</strong><span>Screen state and UI events</span></li>
    <li><strong>Repository</strong><span>Local writes and reconciliation</span></li>
    <li class="architecture-flow__truth"><strong>Room</strong><span>UI source of truth · pending sync state</span></li>
    <li><strong>WorkManager</strong><span>Connected-network background work</span></li>
    <li><strong>Apollo GraphQL</strong><span>Queries and create, update, delete mutations</span></li>
    <li><strong>Demo GraphQL server</strong><span>In-memory remote state and version checks</span></li>
  </ol>
  <p class="architecture-diagram__note">The UI observes Room through the repository. It does not wait for the server to render a successful local edit.</p>
</div>

The repository reads a Room `Flow`, while the list ViewModel combines that stream with search and loading state into `StateFlow`. The same repository owns local writes and remote reconciliation. See the [repository implementation](https://github.com/DaCodaHUB/JobTracker/blob/23e72ab3f87a48e8050fe8eb2a8cd35d0b972889/app/src/main/java/com/dangle/jobtracker/data/repository/JobApplicationRepositoryImpl.kt) and [list ViewModel](https://github.com/DaCodaHUB/JobTracker/blob/23e72ab3f87a48e8050fe8eb2a8cd35d0b972889/app/src/main/java/com/dangle/jobtracker/ui/list/ApplicationListViewModel.kt).

## Local-first writes

On create, the repository assigns a temporary `local_` UUID, inserts a Room entity with `PENDING_CREATE`, and schedules sync. Status and notes edits similarly update the Room row immediately; a previously synced row becomes `PENDING_UPDATE`. Deleting a record that never reached the server removes it locally, while a synced record becomes `PENDING_DELETE`. The Room `Flow` lets the UI react to those local changes without waiting for GraphQL. The [repository](https://github.com/DaCodaHUB/JobTracker/blob/23e72ab3f87a48e8050fe8eb2a8cd35d0b972889/app/src/main/java/com/dangle/jobtracker/data/repository/JobApplicationRepositoryImpl.kt) and [DAO](https://github.com/DaCodaHUB/JobTracker/blob/23e72ab3f87a48e8050fe8eb2a8cd35d0b972889/app/src/main/java/com/dangle/jobtracker/data/local/dao/JobApplicationDao.kt) show this path.

<div class="case-callout">
  <p class="case-callout__label">Local write path</p>
  <p>User action → Room write and pending state → Room Flow → updated UI → background synchronization when available.</p>
</div>

## Background synchronization

The repository enqueues **unique one-time WorkManager work** with a connected-network constraint. Its worker processes pending creates, updates, and deletes through Apollo GraphQL mutations. The application also observes connectivity; when a connection is detected, it refreshes remote state and schedules sync. The worker returns `Result.retry()` for Apollo or I/O exceptions and `Result.failure()` for other exceptions. This separates local interaction from work that may need to survive a lost connection or a closed screen. See the [sync worker](https://github.com/DaCodaHUB/JobTracker/blob/23e72ab3f87a48e8050fe8eb2a8cd35d0b972889/app/src/main/java/com/dangle/jobtracker/data/worker/SyncJobApplicationsWorker.kt) and [application connectivity handling](https://github.com/DaCodaHUB/JobTracker/blob/23e72ab3f87a48e8050fe8eb2a8cd35d0b972889/app/src/main/java/com/dangle/jobtracker/JobTrackerApplication.kt).

## Idempotent creates

The temporary local UUID also becomes the create request's **idempotency key**. If the same create is retried, the demonstration server can return the existing record for that key rather than adding a second one. After a successful create, a Room `@Transaction` replaces the temporary row with the server row. That atomic ID swap avoids an intermediate state in which the item disappears from the local list. The behavior is visible in the [repository](https://github.com/DaCodaHUB/JobTracker/blob/23e72ab3f87a48e8050fe8eb2a8cd35d0b972889/app/src/main/java/com/dangle/jobtracker/data/repository/JobApplicationRepositoryImpl.kt), [DAO](https://github.com/DaCodaHUB/JobTracker/blob/23e72ab3f87a48e8050fe8eb2a8cd35d0b972889/app/src/main/java/com/dangle/jobtracker/data/local/dao/JobApplicationDao.kt), and [demo server](https://github.com/DaCodaHUB/JobTracker/blob/23e72ab3f87a48e8050fe8eb2a8cd35d0b972889/graphql-server/server.js).

## Conflict handling

The server uses version numbers when updating or deleting a record. During refresh, the repository compares server and local state, preserves pending local edits, and can store a divergent server snapshot. A rejected mutation can also trigger a fetch of the current server record. When the relevant values differ, the Compose dialog shows a side-by-side comparison and offers **Keep Mine** or **Keep Server**. The dialog currently compares company, position, and status; this case study does not assume every field or conflict scenario is fully handled. See [reconciliation logic](https://github.com/DaCodaHUB/JobTracker/blob/23e72ab3f87a48e8050fe8eb2a8cd35d0b972889/app/src/main/java/com/dangle/jobtracker/data/repository/JobApplicationRepositoryImpl.kt) and the [conflict dialog](https://github.com/DaCodaHUB/JobTracker/blob/23e72ab3f87a48e8050fe8eb2a8cd35d0b972889/app/src/main/java/com/dangle/jobtracker/ui/list/components/ConflictResolutionDialog.kt).

## Failure paths and targeted tests

The test suite includes repository tests for mapping the DAO's Room Flow and queuing a local create, a Robolectric worker test that expects retry after a network exception, and instrumented DAO tests for replacement and deletion. These are targeted checks of important paths, not a claim of comprehensive coverage or passing CI. Review the [repository tests](https://github.com/DaCodaHUB/JobTracker/blob/23e72ab3f87a48e8050fe8eb2a8cd35d0b972889/app/src/test/java/com/dangle/jobtracker/data/repository/JobApplicationRepositoryTest.kt), [worker test](https://github.com/DaCodaHUB/JobTracker/blob/23e72ab3f87a48e8050fe8eb2a8cd35d0b972889/app/src/test/java/com/dangle/jobtracker/data/worker/SyncJobApplicationsWorkerTest.kt), and [DAO tests](https://github.com/DaCodaHUB/JobTracker/blob/23e72ab3f87a48e8050fe8eb2a8cd35d0b972889/app/src/androidTest/java/com/dangle/jobtracker/data/local/dao/JobApplicationDaoTest.kt).

## Engineering decisions

- **Room drives the screen** so a successful local action remains visible during network loss. The repository reconciles remote data back into that same source of truth.
- **WorkManager owns deferred sync** because pending changes may need processing after the screen's ViewModel is gone; a connected-network constraint avoids starting remote work without connectivity.
- **Create requests carry an idempotency key** because a timeout does not reveal whether the server accepted the first request.
- **Divergent versions are exposed** instead of silently overwriting a pending local edit. The UI gives the user an explicit choice for the differences it currently presents.

## Interface and technology

<div class="case-shots">
  <figure><img src="/assets/Screenshot_20260727-172108_JobTracker.png" alt="JobTracker dashboard with job application metrics, search, and application list" loading="lazy" /><figcaption>Application dashboard</figcaption></figure>
  <figure><img src="/assets/Screenshot_20260727-172148_JobTracker.png" alt="JobTracker detail screen with application information and status timeline" loading="lazy" /><figcaption>Progress timeline</figcaption></figure>
</div>

The project uses Kotlin, Jetpack Compose, `StateFlow`, Room, WorkManager, Apollo GraphQL, Hilt, Material 3, and DataStore for theme preference. Those tools support the local-first interaction and synchronization decisions above.

## Explore the source

<div class="case-source-cta">
  <p>Read the repository and trace the local write, synchronization, and conflict paths in the implementation.</p>
  <a href="https://github.com/DaCodaHUB/JobTracker" target="_blank" rel="noopener noreferrer">View JobTracker on GitHub <span aria-hidden="true">↗</span></a>
</div>
