// SwiftUI shield view for the "pomodoro" cover take.
//
// This file is the source of truth for what shows over a covered app when
// `block.shieldStyle === 'pomodoro'`. It mirrors design/04a-cover-pomodoro.html
// and is rendered by the ShieldConfiguration extension that
// react-native-device-activity ships in `ios/PomoblockShield/`.
//
// During EAS prebuild this file is copied (or symlinked) into the
// ShieldConfiguration extension target. See MVP_NOTES.md for the wiring step.

import SwiftUI
import ManagedSettings
import ManagedSettingsUI

@available(iOS 15.1, *)
struct PomodoroShieldView: View {
    let appName: String
    let blockName: String
    let totalMinutes: Int
    let remainingSeconds: Int

    private var minutes: Int { remainingSeconds / 60 }
    private var seconds: Int { remainingSeconds % 60 }
    private var fraction: Double {
        guard totalMinutes > 0 else { return 0 }
        return Double(remainingSeconds) / Double(totalMinutes * 60)
    }

    var body: some View {
        ZStack {
            Color(red: 0.055, green: 0.063, blue: 0.082) // dark bg
                .ignoresSafeArea()

            VStack(spacing: 0) {
                header
                Spacer().frame(height: 30)
                posture
                Spacer()
                ring
                Spacer()
                actions
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 24)
        }
        .preferredColorScheme(.dark)
    }

    private var header: some View {
        HStack {
            HStack(spacing: 8) {
                Text(String(appName.prefix(2)).uppercased())
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(.white)
                    .frame(width: 22, height: 22)
                    .background(Color.pink)
                    .cornerRadius(6)
                Text(appName).font(.system(size: 12, weight: .medium))
                Text("covered").font(.system(size: 11)).foregroundColor(.gray)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Color.white.opacity(0.06))
            .clipShape(Capsule())

            Spacer()

            HStack(spacing: 6) {
                Circle().fill(Color(red: 0.42, green: 0.61, blue: 1.0)).frame(width: 6, height: 6)
                Text(blockName.uppercased())
                    .font(.system(size: 11, weight: .heavy))
                    .kerning(1.4)
                    .foregroundColor(Color(red: 0.42, green: 0.61, blue: 1.0))
            }
        }
    }

    private var posture: some View {
        Text("You opened a covered app. Sit with it for \(minutes) more minutes, or take an honest break.")
            .font(.system(size: 15))
            .foregroundColor(.gray)
            .multilineTextAlignment(.center)
            .padding(.horizontal, 12)
    }

    private var ring: some View {
        ZStack {
            Circle()
                .stroke(Color.white.opacity(0.08), lineWidth: 1.2)
                .frame(width: 280, height: 280)

            Circle()
                .trim(from: 0, to: fraction)
                .stroke(
                    Color(red: 0.42, green: 0.61, blue: 1.0),
                    style: StrokeStyle(lineWidth: 2, lineCap: .round)
                )
                .frame(width: 280, height: 280)
                .rotationEffect(.degrees(-90))
                .shadow(color: Color(red: 0.42, green: 0.61, blue: 1.0).opacity(0.5), radius: 8)
                .animation(.linear(duration: 1), value: fraction)

            VStack(spacing: 6) {
                Text(String(format: "%02d:%02d", minutes, seconds))
                    .font(.system(size: 84, weight: .ultraLight, design: .default))
                    .monospacedDigit()
                    .kerning(-4)
                    .foregroundColor(.white)
                Text("OF \(totalMinutes) MINUTES")
                    .font(.system(size: 11, weight: .semibold))
                    .kerning(1.6)
                    .foregroundColor(.gray)
            }
        }
    }

    private var actions: some View {
        VStack(spacing: 10) {
            // The shield action buttons are wired through ShieldActionExtension —
            // they don't live as SwiftUI buttons here. This is the visual
            // affordance only; tap routing happens at the extension boundary.
            HStack {
                Spacer()
                Text("Take a 5-minute break instead")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.85))
                Spacer()
            }
            .padding(.vertical, 12)
            .background(Color.white.opacity(0.04))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.white.opacity(0.08)))
            .clipShape(RoundedRectangle(cornerRadius: 12))

            Text("Need this app for work? End block early")
                .font(.system(size: 12))
                .foregroundColor(.gray)
        }
    }
}
