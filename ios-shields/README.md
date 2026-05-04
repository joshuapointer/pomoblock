# iOS Shield extensions

The 3 `.swift` files in this folder belong to iOS app extensions, not the main
React Native target. The Kingstinct `react-native-device-activity` plugin
generates the extension targets during `expo prebuild`. After prebuild, copy
(or symlink) these files into the generated extension folders:

| File | Destination target | Apple superclass |
|---|---|---|
| `PomoblockShieldConfiguration.swift` | `ios/<extension-name>ShieldConfiguration/` | `ShieldConfigurationDataSource` |
| `PomoblockShieldAction.swift` | `ios/<extension-name>ShieldAction/` | `ShieldActionDelegate` |
| `PomodoroShieldView.swift` | Optional — embed inside ShieldConfiguration target if you want full SwiftUI rendering instead of the system `ShieldConfiguration` API | (SwiftUI `View`) |
| `FrictionShieldView.swift` | Same as above | (SwiftUI `View`) |

Apple's `ShieldConfiguration` is a structured config (background, icon,
title/subtitle, two buttons). It does **not** support arbitrary SwiftUI
content. The `*View.swift` files are kept here because (a) they're a faithful
spec of what the cover should look like and (b) Apple is steadily widening
extension UI surface area — when fully custom shield UI lands they slot in.

For v0.1 the visual richness lives in the in-app preview
(`app/cover-preview.tsx`) and `PomoblockShieldConfiguration.swift` builds the
maximally-rich system `ShieldConfiguration` allowed by iOS 15.1+.

App Group `group.com.joshpointer.pomoblock` is the shared bucket between the
JS bridge and these extensions — see `native/screen-time.ts` and the two
`*Action.swift` files for the keys.
