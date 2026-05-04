// SwiftUI shield view for the "friction" cover take.
//
// Mirrors design/04b-cover-friction.html. Rendered by the same
// ShieldConfiguration extension as PomodoroShieldView.swift; the extension
// reads `pomoblock.block.<id>.style` from the App Group user defaults to pick
// which view to show.
//
// Three buttons (Wait / Budget5 / End) are exposed through
// ShieldActionExtension's responder chain — the SwiftUI buttons here are
// visual only.

import SwiftUI
import ManagedSettings
import ManagedSettingsUI

@available(iOS 15.1, *)
struct FrictionShieldView: View {
    let appName: String
    let blockName: String
    let openedThisWeek: Int
    let blockMinutesLeft: Int

    @State private var orbScale: CGFloat = 0.92

    private let accent = Color(red: 0.42, green: 0.61, blue: 1.0)

    var body: some View {
        ZStack {
            Color(red: 0.055, green: 0.063, blue: 0.082).ignoresSafeArea()

            VStack(spacing: 0) {
                header
                Spacer().frame(height: 22)
                orb
                Spacer().frame(height: 18)
                copy
                Spacer().frame(height: 16)
                decisions
                Spacer()
                autoResume
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 24)
        }
        .preferredColorScheme(.dark)
        .onAppear {
            withAnimation(.easeInOut(duration: 3).repeatForever(autoreverses: true)) {
                orbScale = 1.04
            }
        }
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

            Text("STEP 2/2 — DECIDE")
                .font(.system(size: 11, weight: .semibold))
                .kerning(1.4)
                .foregroundColor(.gray)
        }
    }

    private var orb: some View {
        ZStack {
            Circle()
                .fill(
                    RadialGradient(
                        colors: [accent.opacity(0.45), accent.opacity(0.12), .clear],
                        center: .center, startRadius: 10, endRadius: 110
                    )
                )
            Circle().stroke(accent.opacity(0.35), lineWidth: 1).padding(26)
            Circle().stroke(accent.opacity(0.20), lineWidth: 1).padding(50)
            Text("BREATHE")
                .font(.system(size: 18, weight: .ultraLight))
                .kerning(1.8)
                .foregroundColor(Color.white.opacity(0.85))
        }
        .frame(width: 220, height: 220)
        .scaleEffect(orbScale)
    }

    private var copy: some View {
        VStack(spacing: 10) {
            (
                Text("Breathe.\n")
                + Text("Then decide.").italic().foregroundColor(accent)
            )
            .font(.system(size: 30, weight: .medium))
            .multilineTextAlignment(.center)
            .foregroundColor(.white)

            Text("You've opened \(appName) \(openedThisWeek) times this week.")
                .font(.system(size: 14))
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
        }
    }

    private var decisions: some View {
        VStack(spacing: 8) {
            decision(title: "I'll wait the 25 minutes", subtitle: "Return to focus · most picked", primary: true)
            decision(title: "Just 5 minutes", subtitle: "Counts against your daily budget", primary: false)
            decision(title: "End the \(blockName) block", subtitle: "\(blockMinutesLeft / 60)h \(blockMinutesLeft % 60)m left", primary: false)
        }
    }

    private func decision(title: String, subtitle: String, primary: Bool) -> some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.system(size: 15, weight: .semibold)).foregroundColor(.white)
                Text(subtitle).font(.system(size: 12)).foregroundColor(.gray)
            }
            Spacer()
            Text("→").foregroundColor(.white.opacity(0.4))
        }
        .padding(14)
        .background(primary ? accent.opacity(0.18) : Color.white.opacity(0.04))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(primary ? accent : Color.white.opacity(0.08))
        )
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private var autoResume: some View {
        HStack(spacing: 10) {
            Text("Auto-resume in 9s")
                .font(.system(size: 11))
                .kerning(0.4)
                .foregroundColor(Color.white.opacity(0.4))
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(Color.white.opacity(0.08)).frame(height: 2)
                    Capsule().fill(Color.gray).frame(width: geo.size.width * 0.22, height: 2)
                }
            }
            .frame(height: 2)
        }
    }
}
