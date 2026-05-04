// Bridges Apple's ShieldConfigurationDataSource into our two SwiftUI takes.
// The Kingstinct wrapper sets up the ShieldConfiguration extension target;
// drop this file (and the two View files) into that target during prebuild.

import ManagedSettings
import ManagedSettingsUI
import UIKit

@available(iOS 15.1, *)
class PomoblockShieldConfiguration: ShieldConfigurationDataSource {

    private let appGroup = "group.com.joshpointer.pomoblock"

    private func defaults() -> UserDefaults? {
        UserDefaults(suiteName: appGroup)
    }

    private func resolveStyle() -> String {
        // The bridge writes the active style under a stable key when a block
        // starts. If multiple blocks are active, last-write wins — fine for
        // MVP since blocks are sequential in the v0.1 scheduler.
        let d = defaults()
        let keys = d?.dictionaryRepresentation().keys.filter { $0.hasPrefix("pomoblock.block.") && $0.hasSuffix(".style") } ?? []
        for k in keys {
            if let s = d?.string(forKey: k) { return s }
        }
        return "pomodoro"
    }

    override func configuration(shielding application: Application) -> ShieldConfiguration {
        return makeConfig(appName: application.localizedDisplayName ?? "App")
    }

    override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration {
        return makeConfig(appName: application.localizedDisplayName ?? "App")
    }

    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        return makeConfig(appName: webDomain.domain ?? "Site")
    }

    override func configuration(shielding webDomain: WebDomain, in category: ActivityCategory) -> ShieldConfiguration {
        return makeConfig(appName: webDomain.domain ?? "Site")
    }

    private func makeConfig(appName: String) -> ShieldConfiguration {
        let style = resolveStyle()
        let title: String
        let subtitle: String
        if style == "friction" {
            title = "Breathe."
            subtitle = "Then decide whether \(appName) is worth breaking focus for."
        } else {
            title = "\(appName) is covered."
            subtitle = "Sit with it, or take an honest break."
        }
        return ShieldConfiguration(
            backgroundBlurStyle: .systemUltraThinMaterialDark,
            backgroundColor: UIColor(red: 0.055, green: 0.063, blue: 0.082, alpha: 1),
            icon: nil,
            title: ShieldConfiguration.Label(text: title, color: .white),
            subtitle: ShieldConfiguration.Label(text: subtitle, color: UIColor.lightGray),
            primaryButtonLabel: ShieldConfiguration.Label(text: "Wait it out", color: .white),
            primaryButtonBackgroundColor: UIColor(red: 0.42, green: 0.61, blue: 1.0, alpha: 1),
            secondaryButtonLabel: ShieldConfiguration.Label(text: "End block", color: UIColor.lightGray)
        )
    }
}
