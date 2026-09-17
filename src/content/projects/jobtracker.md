---
title: JobTracker
description: An offline-first Android application for managing job applications. The project demonstrates how local writes, background synchronization, and explicit conflict handling can work together in a modern Android codebase.
lead: An offline-first Android application for managing job applications. The project demonstrates how local writes, background synchronization, and explicit conflict handling can work together in a modern Android codebase.
category: Personal project
technologies: [Kotlin, Jetpack Compose, Room, Apollo GraphQL, WorkManager, Hilt]
githubUrl: https://github.com/DaCodaHUB/JobTracker
featured: true
order: 1
caseStudy: false
highlights:
  - title: Local-first by design
    description: Room is the single source of truth, so the UI remains fast and fully useful without a connection.
  - title: Reliable synchronization
    description: WorkManager flushes queued GraphQL mutations, with version-based optimistic locking for safe reconciliation.
  - title: Conflicts made understandable
    description: A side-by-side resolution flow lets users choose between divergent local and server versions.
images:
  - src: /assets/Screenshot_20260727-172108_JobTracker.png
    alt: JobTracker dashboard showing application metrics, search, and a list of saved job applications
    caption: Application dashboard
  - src: /assets/Screenshot_20260727-172148_JobTracker.png
    alt: JobTracker application detail screen showing job information and application progress timeline
    caption: Progress timeline
---
