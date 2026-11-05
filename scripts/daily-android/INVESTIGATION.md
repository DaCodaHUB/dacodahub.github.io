# Daily Android deployment investigation — 2026-11-05

## Finding

No stale deployment, missing component wiring, missing requested content, or visual override was reproduced. The public page already displays the implemented updates. This does not establish what was in the reporting browser's cache or what it displayed yesterday.

The exercises intentionally do not rotate with the date. Both clients restore the selected exercise from localStorage, otherwise recommending the earliest incomplete exercise. Kotlin solutions are deliberately collapsed until “Reveal Kotlin Solution” is activated. Progress updates preserve an open solution; changing problems or reloading hides it. A familiar question or collapsed answer therefore does not indicate a stale deployment.

## Rendering path

`src/pages/daily-android.astro` imports `NeetCode.astro` and `MobileDesign.astro` directly into their respective tab panels. `challenge-types.ts` switches panel visibility without recreating their content.

NeetCode imports the current problem bank and Kotlin solution map. Its client imports that same bank and roadmap prerequisites and mounts the selected solution template. All 26 solutions have highlighted Kotlin, explanation, time/space complexity, Kotlin guidance, platform signatures, and copy controls. Six prerequisite problems supplement the original 20-problem bank.

MobileDesign imports all eight current challenges and the presentation data. Its client clones the selected question template. Scenario, requirements, constraint tiles, and numbered tasks are in the actual question area, outside the hidden reference design. The prompt uses portfolio surface tokens, with distinct tinted scenario/constraint panels; there is no OS-light preference override forcing a white question background. The portfolio itself keeps its dark palette under both system preferences.

## Deployment evidence

- Checkout HEAD: `17a6799e082b89aed6db2dc543587a7c8ae56ee9`; initial working tree clean.
- Public GitHub Actions run `41505392660` succeeded for that SHA on November 2, 2026: https://github.com/DaCodaHUB/dacodahub.github.io/actions/runs/41505392660
- Live `/daily-android/` returned HTTP 200, Last-Modified `Mon, 02 Nov 2026 18:58:20 GMT`, edge cache MISS / Age 0.
- Downloaded live HTML and newly built local HTML are byte-for-byte identical. SHA-256: `021C53C3FF546499378B333E3636C47E630C4B2FBFD909DD1143238B4E056AD2`.
- Astro emits content-hashed CSS/JS under `/_astro/`; the root deployment path matches this user Pages repository. No service worker was found. HTML has GitHub Pages' standard `max-age=600`. No additional cache-busting change is justified by this evidence.
- GitHub CLI credentials were expired; public API access independently confirmed deployment status.

## Verification and changes

All 136 tests passed, Astro check returned zero errors/warnings/hints, and production build passed. The browser checker served the production `dist/` and also ran against `https://dacodahub.github.io`.

Both runs verified all 26 Kotlin disclosures, copy success and denial fallback, prerequisites, independent progress, reload persistence, and tab/navigation behavior. All eight rendered design briefs matched source wording, had distinct tinted panels, complete task lists, and theme-correct backgrounds at 320/375/1440px under both system color preferences. Broader layout checks passed at 320/375/768/1024/1440/1920px. These are rendered DOM and computed-style assertions, not just source or build checks.

The only code changes are to `browser-check.mjs`: optional `DAILY_TEST_ORIGIN` for production verification, unique isolated browser profiles to prevent concurrent runs from attaching to another test browser, and screenshots of the actual design question area under both preferences at desktop/mobile sizes. Existing Kotlin screenshots also capture expanded solutions. Generated evidence is under ignored `.astro/`.

To repeat local verification after building: `npm.cmd run daily:test-browser`.

To verify live in PowerShell:

```powershell
$env:DAILY_TEST_ORIGIN = 'https://dacodahub.github.io'
npm.cmd run daily:test-browser
Remove-Item Env:DAILY_TEST_ORIGIN
```

The verification improvements and this report are local, uncommitted, and undeployed. No production UI changes were necessary or made. The user's specific prior-browser symptom remains unverified; it should not be described as a confirmed caching defect.
