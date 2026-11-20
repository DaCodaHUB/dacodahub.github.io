---
title: PhysicalLink
description: "A working Android and ESP32 prototype that turns firmware-defined numeric sensors into a customizable Jetpack Compose dashboard over Bluetooth Low Energy."
lead: "I built a reusable path from ESP32 sensor readings to an Android dashboard. Register a numeric sensor in firmware and PhysicalLink discovers it over BLE and generates the interface."
category: Independent engineering prototype
technologies: [Kotlin, Jetpack Compose, Android BLE GATT, C++, ESP32, NimBLE, PlatformIO, Coroutines/Flow, DataStore]
githubUrl: https://github.com/DaCodaHUB/PhysicalLink
firmwareUrl: https://github.com/DaCodaHUB/PhysicalLink-firmware
featured: true
order: 0
caseStudy: true
highlights:
  - title: Generate dashboards from metadata
    description: Stable sensor IDs, labels, and units let Android render new numeric channels without sensor-specific screens.
  - title: Keep reading freshness visible
    description: Session-aware BLE handling distinguishes live, last-known, unavailable, and disconnected readings.
  - title: Save independent widget settings
    description: DataStore preserves per-device layouts and per-widget visualization choices.
images:
  - src: /assets/physicallink-greenhouse-dashboard.png
    alt: Connected greenhouse dashboard showing a temperature range widget and humidity gauge
    caption: Greenhouse dashboard
    width: 1080
    height: 2220
  - src: /assets/physicallink-device-overview.png
    alt: Device Overview showing a connected greenhouse device, diagnostics, device discovery, and Demo Mode
    caption: Device Overview
    width: 1080
    height: 2220
---

## The problem

Getting a number out of an ESP32 is often easier than making it useful on a phone. For each prototype, makers can end up watching serial output or building another mobile screen just to see what their hardware is doing. I wanted a reusable path from a sensor sketch to a useful Android interface that would work locally over Bluetooth Low Energy.

## Architecture

<div class="architecture-diagram" role="group" aria-labelledby="physicallink-flow-label">
  <p class="architecture-diagram__label" id="physicallink-flow-label">From sensor measurement to dashboard</p>
  <ol class="architecture-flow" role="list">
    <li><strong>ESP32 Sensors</strong><span>BME280 and capacitive soil probe in the development setup</span></li>
    <li><strong>C++ Firmware Library</strong><span>Register numeric channels and update their readings</span></li>
    <li class="architecture-flow__truth"><strong>Custom BLE Protocol</strong><span>Version 2 metadata pages and binary notifications</span></li>
    <li><strong>Android BLE Client</strong><span>Sequence GATT operations, validate metadata, and track freshness</span></li>
    <li><strong>Jetpack Compose Dashboard</strong><span>Render widgets and restore their settings from DataStore</span></li>
  </ol>
</div>

## From firmware metadata to widgets

The reusable C++ library lets an ESP32 sketch register up to 16 numeric channels. Each channel has a stable sensor ID, a label, and a unit. The sketch supplies current values or marks a reading unavailable. In the development setup, a BME280 provided temperature, humidity, and pressure over I²C, and a capacitive soil probe provided raw ADC readings.

Android scans for the PhysicalLink service and loads the device's sensor metadata. Once the client has assembled and validated the metadata, Compose can generate a dashboard for the declared channels. A maker can add a supported numeric sensor without changing Android code. The same rendering path powers Demo Mode, which labels its simulated readings and runs without hardware or Bluetooth scan permission.

## BLE transport and connection reliability

The NimBLE GATT server exposes characteristics for metadata, control, and state/live readings. The wire protocol splits JSON metadata into pages because a sensor catalog can exceed a single BLE payload. It uses compact 20-byte binary records for state and live readings. Firmware and Android test matching protocol fixtures independently so that encoding changes on either side can be checked against the same contract.

On Android, a serialized GATT workflow sequences asynchronous operations. The client tracks the active connection session so a late callback from a previous connection cannot update the current dashboard. Coroutines and Flow carry updates into screen state. A connected device can still have a stale or unavailable channel. The interface distinguishes live readings, last-known values, explicit unavailability, and disconnection so the user can judge whether a measurement is current.

## Dashboard customization and persistence

Users can rearrange, hide, resize, or duplicate widgets and choose among Value, Chart, Gauge, and Range. Sensor Details exposes controls suited to each visualization, including precision, gauge bounds, and chart axes. Edits preview in place before Apply saves valid settings or Cancel discards the draft.

DataStore ties layouts to stable device and sensor identities, so discovery order can change without shifting a saved layout to the wrong sensor. Each duplicate widget keeps its own settings. Two widgets can show the same measurement with different bounds or precision, while the firmware remains the source of the reading.

## The Android prototype in use

<div class="case-shots">
  <figure><img src="/assets/physicallink-device-overview.png" alt="Device Overview showing a connected greenhouse device, diagnostics, device discovery, and Demo Mode" width="1080" height="2220" loading="lazy" decoding="async" /><figcaption>Device Overview</figcaption></figure>
  <figure><img src="/assets/physicallink-greenhouse-dashboard.png" alt="Connected greenhouse dashboard showing a temperature range widget and humidity gauge" width="1080" height="2220" loading="lazy" decoding="async" /><figcaption>Greenhouse dashboard</figcaption></figure>
</div>

## Validation and tradeoffs

The last reported project runs recorded **266 passing Android tests**, **45 passing native firmware tests**, and successful PlatformIO builds for the basic, real-sensor, and 16-channel stress examples. Android regression checks covered late callbacks and error paths, invalid widget input, and duplicate-widget isolation. Earlier development included physical Android-to-ESP32 exercises. Long-duration hardware runs, TalkBack validation, and signed-build fault testing remained incomplete.

The prototype supports one connected device at a time. Chart history is bounded and held in memory. Recent snapshots can remain available after a disconnect while the Android process is running, and they disappear when it exits. Keeping readings local and transient let me focus on the live device-to-phone experience. The Android app reached Google Play internal testing during development.

The hardest part was preserving the meaning of a sensor value across a wireless boundary. Stable identity keeps a layout attached to the right device after reconnecting, explicit freshness gives an old value the right context, and independent widget settings let users change the presentation without changing the measurement. Matching fixtures made those decisions easier to verify as the firmware and Android app moved into separate repositories.
