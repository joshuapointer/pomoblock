# Pomoblock MVP — implementation notes

Status snapshot at first hand-off. JS-only flow ships; the Family Controls
bridge is wired through `react-native-device-activity` but cannot be verified
on the build host (Linux). Every verification step that needs Apple silicon
+ a real iPhone is parked under "What still needs your iPhone" below.

## Native-module path: Kingstinct wrapper

Picked **`react-native-device-activity` v0.6.1** (Feb 2026, actively
maintained, iOS 15.1+, 31 published versions). Reasons:

- Bundles all three iOS extensions (DeviceActivityMonitor,
  ShieldConfiguration, ShieldAction) as part of `expo prebuild` — no manual
  Xcode wiring of extension targets, no entitlement plumbing.
- Provides the SwiftUI `FamilyActivityPicker` view via a JS API.
- App Group bridge for App ↔ Extension comms is set up automatically.
- Custom Expo Module would mean re-implementing all of that for ~1–2 weeks
  of net-new infra before we'd even see a shield render. Not the right knob
  to twist for a v0.1 MVP.

Single seam: `native/screen-time.ts`. Every other file imports from there.
Swapping to a hand-rolled Expo Module later is a single-file change.

## Build path: EAS cloud only

Linux dev machine here, no Xcode. iOS builds run on EAS (`eas.json`):

```bash
npm install -g eas-cli
eas login                   # one-time
eas build --profile development --platform ios --local=false
```

EAS handles the Apple Developer cert / provisioning. After the build
completes, install via TestFlight or the EAS QR-code flow on the iPhone.

The two follow-up commands the brief calls out (`expo prebuild --clean`,
`expo run:ios --device`) cannot run from Linux. EAS replaces both.

## What still needs your iPhone

These verification steps from `BUILD_PROMPT.md` are the user's to run, in
order, on a paired iPhone:

1. **`eas build --profile development --platform ios`** — produces an
   installable build with the `family-controls` entitlement. First run
   prompts for an Apple Developer team.
2. Install on device. **Open the app** → onboarding screen renders, tap
   *Allow Screen Time access* → iOS shows the Family Controls grant sheet
   → approve. `screenTime.requestAuthorization()` returns `'approved'`.
3. **Block setup** → tap *Add apps or categories* → SwiftUI picker opens →
   pick Instagram (or any app). The `SelectionToken` is opaque on the JS
   side — privacy by design.
4. Save the block, leave the app, **open Instagram**. The shield should
   replace Instagram's content with the dark cover (system
   `ShieldConfiguration` for now — see "Known limitations").
5. Tap **Wait it out** on the shield → defers and Instagram re-shields.
   Tap **End block** → block ends, Instagram becomes accessible again.
6. The two cover *takes* (timer vs. friction) are previewed in-app via
   `/cover-preview` — picks the one that matches `block.shieldStyle` for
   the active block.

## Known limitations / things skipped

- **Cover takes are not yet pixel-perfect on the actual shield.** Apple's
  `ShieldConfiguration` API still constrains shield UI to a structured
  config (background, icon, two title labels, two buttons). Full SwiftUI
  rendering inside the shield requires either a private API or the broader
  shield UI surface that Apple has been rolling out incrementally. The two
  `*ShieldView.swift` files in `ios-shields/` are the design spec and are
  ready to drop in the moment Apple opens that door. In-app
  (`/cover-preview`) renders both takes faithfully today.
- **Schedules are time-of-day only.** The `Schedule` model + UI exist; the
  actual scheduler that flips blocks on/off at the right hour is not
  wired — needs `DeviceActivitySchedule` integration. v0.1 ships manual
  toggles.
- **Break timer in `app/break.tsx` uses `setInterval`** instead of a
  Reanimated worklet. The pomodoro ring (`animations/timerRing.tsx`) is
  worklet-based; the break is a small modal where worklet overhead wasn't
  worth it. Swap it if it bothers you.
- **No background fetch / haptic ticks** when a pomodoro elapses — relies
  on the DeviceActivity callback firing the next state change, which only
  happens on real iOS.
- **No iCloud sync, no stats, no streaks.** Out of MVP scope per brief.
- **iPad / Mac targets are absent.** iPhone-first per brief.
- **Family Controls production approval is not requested.** Dev-build
  entitlement on a personal team works for a single registered device,
  which is what the brief specified for MVP.

## Repo map

```
app/                      Expo Router routes
  _layout.tsx             ThemeProvider + Stack + ShieldAction listener
  index.tsx               redirect: onboarding | tabs
  onboarding.tsx          ↔ design/01-onboarding.html
  break.tsx               (modal)  ↔ design/05-break.html
  cover-preview.tsx       (full-screen modal) — both shield takes in RN
  blocks/
    new.tsx               (modal)  ↔ design/03-block-setup.html
  (tabs)/
    _layout.tsx           tab bar
    index.tsx             ↔ design/02-home.html
    blocks.tsx            block list (minimal)
    schedules.tsx         ↔ design/06-schedules.html

components/               Text, Button, Card, Switch
theme/                    tokens.ts (oklch → hex), ThemeProvider.tsx
state/                    blocks.ts, session.ts, settings.ts (Zustand + MMKV)
lib/                      storage.ts (MMKV wrapper), useShieldActionBridge.ts
animations/               timerRing.tsx + breathOrb.tsx (Reanimated 3 worklets)
native/                   screen-time.ts — the only file that knows about Kingstinct

ios-shields/              Swift sources — drop into the prebuild output
                          (see ios-shields/README.md)

design/                   Original HTML concept (untouched, reference only)
```

## Next-session pickup list

In order of impact:

1. **Run `eas build --profile development --platform ios` once** to
   confirm the entitlements + Kingstinct plugin produce an installable
   build. Paste any prebuild errors back in. This is the riskiest unknown.
2. Wire the **DeviceActivitySchedule** so a block flips on at its scheduled
   start time. The model is already in `state/types.ts:Schedule`; the
   bridge currently starts blocks immediately on `screenTime.startBlock`.
   `react-native-device-activity` exposes `startMonitoring` with hour /
   minute interval params — most of the work is mapping `Schedule` →
   that shape and choosing which block wins on overlap.
3. Replace the `setInterval` in `app/break.tsx` with a Reanimated worklet
   for symmetry with `TimerRing`.
4. Build out **stats / streaks / history** (out of MVP, but the
   `pomodorosToday` field is already persisted — extend it to a daily log).
5. **iCloud sync** via `expo-secure-store` + CloudKit (concept calls for
   this on iPad / Mac). Single-device for now.
6. **iPad split view + Mac menu bar** — full design exists (`design/`),
   none of it scoped for v0.1.

## Things to know about the wrapper

- `app.json` configures Kingstinct with `appGroup` and shield config.
  Bundle ID `com.joshpointer.pomoblock`, app group
  `group.com.joshpointer.pomoblock`. Update both if you rename.
- The wrapper writes shield-action events into App Group user defaults;
  `lib/useShieldActionBridge.ts` subscribes via the wrapper's
  `addEventReceiver('shieldAction', …)`.
- `selection: SelectionToken` is opaque JSON on the JS side. Don't try to
  read individual app IDs out of it — Apple intentionally hides them.
- iOS 15.1 minimum. Family Controls is iOS-only.
