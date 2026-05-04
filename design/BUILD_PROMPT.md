# Build Prompt — Pomoblock MVP (React Native · Expo · CNG)

You are building an MVP iOS app called **Pomoblock**. A complete visual design concept already exists in this directory — read it before writing code.

## What Pomoblock is

A focus app that uses Apple's Screen Time / Family Controls APIs to **cover** distracting apps with a calm pomodoro timer. When the user opens a covered app (Instagram, Slack, etc.) during a focus block, the app's content is replaced by one of two cover takes — chosen per-block at setup time:

- **Take 1 — Full pomodoro timer**: the covered app becomes the timer; wait it out or take an honest break.
- **Take 2 — Breathe, then decide**: a 10-second breath animation, then three options — wait, 5-minute budget, or end the block.

Audience: knowledge workers / focus-seekers. Posture: calm, not punitive. Never red, never shake, never shame. Native-first. OLED-friendly cover screens.

## Read these first (design source of truth)

In this directory:

- `index.html` — the visual concept gallery; the overall picture of what's being built.
- `01-onboarding.html` · `02-home.html` · `03-block-setup.html` · `06-schedules.html` — iPhone screens, pixel-spec.
- `04a-cover-pomodoro.html` · `04b-cover-friction.html` — the two cover takes (dark/OLED).
- `05-break.html` — between-pomodoro break screen.
- `assets/tokens.css` — design tokens (modern-minimal direction; cobalt accent; SF Pro stacks).
- `ipad-home.html` · `mac-home.html` — out of MVP scope; reference only.

The HTML is **design reference, not code to port** — re-implement natively in React Native. Match layout, type scale, color palette, rhythm, and restraint.

## Stack (pin these)

- **Expo SDK 53+** with **CNG / prebuild** — config-driven native builds, not bare workflow.
- **TypeScript**, strict mode.
- **Expo Router** v3+ for file-based routing.
- **React Native Reanimated 3** for the timer ring + breath animations — worklet-based, not `setInterval` / Animated API.
- **expo-haptics** for the start/end beats.
- **react-native-mmkv** for fast local persistence.
- **Zustand** for state (one store per domain: `blocks`, `session`, `settings`).
- **Apple Family Controls + DeviceActivity + ManagedSettings + ShieldConfiguration** frameworks — see "the hard part" below.

Verify these versions are current at the time you build — Expo moves fast. Don't pin to old SDKs.

## The hard part — Screen Time integration

The Screen Time API is **not** accessible from JavaScript. You will need to:

1. **Add the `com.apple.developer.family-controls` entitlement** via an Expo config plugin. Production distribution requires Apple's approval; **development on a personal team works without approval** for a single registered device — that's enough for the MVP.
2. **Add three iOS app extensions** (each is a separate target with its own bundle id):
   - **DeviceActivityMonitor extension** — callbacks when monitored intervals start/end or thresholds are crossed.
   - **ShieldConfiguration extension** — owns the UI shown when a covered app is opened. **This UI is SwiftUI — React Native does not run inside iOS extensions.** You will implement each cover take twice: once in SwiftUI for the shield, once in React Native for the in-app preview / settings.
   - **ShieldAction extension** — handles button taps on the shield ("End block", "5-minute budget") and mutates ManagedSettings accordingly.
3. **Evaluate `react-native-device-activity` (Kingstinct)** as a community wrapper. It bundles the extensions, provides a JS bridge to start/stop monitoring, and gives a `FamilyActivityPicker` view. **Verify it's current and maintained** before committing — if it's stale, fall back to a thin custom Expo Module wrapping the same Apple APIs.
4. **Family Activity Picker** is a system-supplied SwiftUI view — the user picks apps/categories without your app ever seeing the bundle ids (privacy by design). Persist the returned `FamilyActivitySelection` opaque token.

If you write a custom Expo Module, expose this surface:

```ts
// native/screen-time.ts (the only file in the app that knows how the bridge works)
requestAuthorization(): Promise<'approved' | 'denied' | 'notDetermined'>
presentFamilyActivityPicker(initial?: SelectionToken): Promise<SelectionToken>
startBlock(opts: { id: string; selection: SelectionToken; durationMinutes: number; shieldStyle: 'pomodoro' | 'friction' }): Promise<void>
endActiveBlock(id: string): Promise<void>
onShieldAction(handler: (e: { blockId: string; action: 'wait' | 'budget5' | 'end' }) => void): Unsubscribe
```

Every other file imports from `native/screen-time.ts` — never from the underlying RN module directly. This makes the community-vs-custom decision a single-file change later.

## MVP scope — IN

iPhone only. Single device. No cloud sync. No stats. No location/calendar triggers.

| Route | Maps to | Notes |
|---|---|---|
| `app/onboarding.tsx` | `01-onboarding.html` | Family Controls grant; "covered, not blocked" intro. |
| `app/(tabs)/index.tsx` | `02-home.html` | What's covering now, what's queued, today's pomodoro count. |
| `app/blocks/new.tsx` | `03-block-setup.html` | Family Activity Picker + duration + cover-take radio. |
| `app/(tabs)/schedules.tsx` | `06-schedules.html` | Time-of-day only (e.g. "weekdays 9–12, 14–17"). |
| `app/break.tsx` (modal) | `05-break.html` | Five-minute break between pomodoros. |

Plus the two **SwiftUI shield views** (in the ShieldConfiguration extension target):

- `PomodoroShieldView.swift` — full dark timer; matches `04a-cover-pomodoro.html`.
- `FrictionShieldView.swift` — breath circle + three options; matches `04b-cover-friction.html`.

## MVP scope — OUT

- macOS / iPadOS targets (concept shows them; ship iPhone first).
- iCloud / CloudKit cross-device sync.
- Stats, streaks, history.
- Location / calendar / Focus-mode triggers (time-of-day only for now).
- App Store-ready Family Controls approval (dev-only is fine for MVP).

## Design system — carry from the HTML

Modern-minimal, near-greyscale, single cobalt accent.

```ts
// theme/tokens.ts
export const light = {
  bg:      'oklch(99% 0.002 240)',
  surface: 'oklch(100% 0 0)',
  fg:      'oklch(18% 0.012 250)',
  muted:   'oklch(54% 0.012 250)',
  border:  'oklch(92% 0.005 250)',
  accent:  'oklch(58% 0.18 255)',
};
export const dark = {                    // cover screens only
  bg:     'oklch(11% 0.008 250)',
  fg:     'oklch(96% 0.005 250)',
  muted:  'oklch(60% 0.012 250)',
  border: 'oklch(20% 0.012 250)',
  accent: 'oklch(72% 0.16 255)',
};
```

(If RN's color parser still chokes on `oklch()` in your target SDK, pre-resolve to sRGB hex at build time and keep the OKLch values as comments.)

Typography: SF Pro (system). Display for big numerals — thin weights, tabular numerics, letter-spacing -0.02em. Text for body. Hairline borders only — no shadows except dropdowns and modals. One accent color, used at most twice per screen.

The cover screens are slow, dark, generous. Wait, breathe, decide — never punish.

## Architecture conventions

- File-based routing; co-locate route + its components in `app/`.
- One Zustand store per domain in `state/` — no monolithic store.
- All persistence through `lib/storage.ts` (MMKV wrapper) — never call MMKV from screens.
- All native Screen Time calls through `native/screen-time.ts` — see the bridge surface above.
- Animations via Reanimated worklets in `animations/` — no `setInterval`, no Animated API.

## Verification (before declaring done)

1. `npx expo prebuild --clean` succeeds.
2. `npx expo run:ios --device` (must be a real device — Family Controls is unavailable in the simulator) installs to a paired iPhone.
3. Onboarding grants Family Controls authorization.
4. Block setup opens the system Family Activity Picker; user picks Instagram (or any app).
5. After a block starts, opening Instagram replaces it with the SwiftUI shield, live pomodoro counting down.
6. "End block" on the shield ends the block; Instagram becomes accessible again on the next launch.
7. The friction-take shield shows the 10-second breath, then the three buttons; "Wait" returns to the timer view.

If any verification step fails, fix it before claiming done. **Do not stub** the Screen Time integration — a working cover on a real device is the entire point of this MVP.

## Working pattern (recommended)

1. **Read the HTML design files first.** Lock the visual vocabulary in your head before writing TS.
2. **Bootstrap the Expo project** in this directory (or a `mvp/` subfolder if the existing HTML would fight tooling — your call).
3. **Ship the JS-only flow first** (onboarding → home → block setup → schedules → break) against a **mocked** `native/screen-time.ts` that logs intent. This lets you iterate UI fast in the simulator.
4. **Implement the real bridge** — pick `react-native-device-activity` if current, otherwise write a custom Expo Module. Keep the surface above intact.
5. **Write the SwiftUI shields** (`PomodoroShieldView`, `FrictionShieldView`) and wire ShieldAction back to JS via the bridge's event emitter.
6. **Test end-to-end on a real iPhone** before declaring complete.

## Deliverables

- A working Expo app in this directory that satisfies all 7 verification steps on a real device.
- A short `MVP_NOTES.md` at the project root covering:
  - Which native-module path you took (community wrapper vs custom Expo Module) and why.
  - Known limitations / things skipped.
  - A one-paragraph "next session" pickup list (what to do first to extend toward the full concept).

## Start here

Read the HTML files, propose a 6–10 step plan via TodoWrite, then begin. If the Screen Time integration approach is still uncertain after reading the Apple docs and the community wrapper's README, **ask before committing** to one path — picking the wrong wrapper is the most expensive mistake you can make on this brief.
