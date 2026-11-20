---
title: WhiteLabelApp
subtitle: Multi-Client React Native Architecture
description: "Built two independently branded Android applications from a shared React Native codebase, combining deterministic client configuration, hosted web experiences, and a capability-authorized WebView-to-native bridge."
technologies: [React Native, TypeScript, Kotlin, Android WebView, Jest]
githubUrl: https://github.com/DaCodaHUB/WhiteLabelApp
githubLabel: View GitHub Repository
demoUrl: https://dacodahub.github.io/mobile-demo/sample-cafe/
demoLabel: View Hosted Demo (Website)
order: 1.5
highlights:
  - title: Shared Android architecture
    description: Deterministic client preparation gives Demo and Sample Cafe distinct application IDs, branding, and feature configurations.
  - title: Capability-authorized WebView bridge
    description: Client policies govern native actions. Demo can launch the Android Share chooser and receive a response with the original request ID.
  - title: Independent website deployments
    description: A shared WebView shell integrates separately deployed sites with native navigation and Android Back behavior.
images:
  - src: /assets/whitelabelapp-sample-cafe-native-home.png
    alt: Sample Cafe Android Home showing café branding and the View Menu button
    caption: Sample Cafe native Home
    width: 1080
    height: 2220
  - src: /assets/whitelabelapp-demo-native-home.png
    alt: Demo Android Home showing the View Portfolio action
    caption: Demo native Home
    width: 1080
    height: 2400
---
