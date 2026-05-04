// Routes shield button taps back to JS via App Group user defaults.
// The Kingstinct wrapper polls this defaults bucket and re-emits a JS
// `shieldAction` event — handled by `lib/useShieldActionBridge.ts`.

import ManagedSettings
import Foundation

@available(iOS 15.1, *)
class PomoblockShieldAction: ShieldActionDelegate {

    private let appGroup = "group.com.joshpointer.pomoblock"

    override func handle(action: ShieldAction, for application: ApplicationToken, completionHandler: @escaping (ShieldActionResponse) -> Void) {
        write(action: action, target: "app")
        completionHandler(action == .secondaryButtonPressed ? .none : .defer)
    }

    override func handle(action: ShieldAction, for webDomain: WebDomainToken, completionHandler: @escaping (ShieldActionResponse) -> Void) {
        write(action: action, target: "web")
        completionHandler(action == .secondaryButtonPressed ? .none : .defer)
    }

    override func handle(action: ShieldAction, for category: ActivityCategoryToken, completionHandler: @escaping (ShieldActionResponse) -> Void) {
        write(action: action, target: "category")
        completionHandler(action == .secondaryButtonPressed ? .none : .defer)
    }

    private func write(action: ShieldAction, target: String) {
        guard let d = UserDefaults(suiteName: appGroup) else { return }
        let blockId = activeBlockId(in: d) ?? "unknown"
        let mapped: String
        switch action {
        case .primaryButtonPressed:    mapped = "wait"
        case .secondaryButtonPressed:  mapped = "end"
        @unknown default:              mapped = "wait"
        }
        let payload: [String: Any] = [
            "blockId": blockId,
            "action": mapped,
            "target": target,
            "timestamp": Date().timeIntervalSince1970,
        ]
        d.set(payload, forKey: "pomoblock.lastShieldAction")
    }

    private func activeBlockId(in d: UserDefaults) -> String? {
        let keys = d.dictionaryRepresentation().keys
            .filter { $0.hasPrefix("pomoblock.block.") && $0.hasSuffix(".startedAt") }
        return keys.first.map {
            $0.replacingOccurrences(of: "pomoblock.block.", with: "")
              .replacingOccurrences(of: ".startedAt", with: "")
        }
    }
}
