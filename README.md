# Pomoblock

A focus timer that uses the iOS Screen Time API to block distracting apps during work sessions. Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev).

> ⚠️ **iOS only** — Pomoblock requires Apple’s Screen Time APIs, which are not available on Android.

---

## Features

- **Pomodoro timer** — customizable focus and break durations
- **Family controls integration** — leverages Apple’s native screen-time controls
- **App blocking** — automatically restrict access to distracting apps during sessions
- **Haptic feedback** — subtle tactile confirmation for timer actions
- **Shield UI** — custom lock-screen overlay when focus mode is active
- **MMKV storage** — ultra-fast, native key/value persistence
- **Zustand state management** — minimal, performant reactive stores

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK 54 |
| Runtime | React Native 0.81 (New Architecture) |
| Navigation | expo-router |
| Device Activity | react-native-device-activity |
| State | Zustand |
| Storage | react-native-mmkv |
| UI | react-native-reanimated, react-native-svg |

---

## Setup

```bash
# Install dependencies
pnpm install

# iOS prebuild + install pods
pnpm prebuild
npx pod install

# Start the dev server
pnpm start

# Or run directly on a connected device / simulator
pnpm ios
```

> You will need a valid Apple Developer account and the **Family Controls** entitlement enabled to build the Device Activity extensions.

---

## Build & Deploy

This project uses [EAS](https://docs.expo.dev/build/introduction/) for CI/CD.

```bash
# Development client
npx eas build --profile development

# Preview (TestFlight / internal)
npx eas build --profile preview

# Production (App Store)
npx eas build --profile production
```

---

## Screenshots

<!-- TODO: replace with actual App Store screenshots -->
| Focus Session | Shield UI | Settings |
|---------------|-----------|----------|
| ![Session](assets/screenshots/placeholder-session.png) | ![Shield](assets/screenshots/placeholder-shield.png) | ![Settings](assets/screenshots/placeholder-settings.png) |

---

## Download

- **App Store**: [Coming Soon]

---

## License

MIT
