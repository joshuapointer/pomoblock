import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { TimerRing } from '@/animations/timerRing';
import { BreathOrb } from '@/animations/breathOrb';
import { ThemeProvider, usePalette } from '@/theme/ThemeProvider';
import { spacing, radius } from '@/theme/tokens';
import { __mockEmitShieldAction } from '@/native/screen-time';
import type { ShieldStyle } from '@/state/types';

// In-app preview of the SwiftUI shield takes. The real shield UI lives in the
// ShieldConfiguration extension (Swift); this preview is a faithful RN copy
// for design iteration + as a fallback we render whenever the user taps
// "Preview cover takes" from Home.
export default function CoverPreview() {
  const [take, setTake] = useState<ShieldStyle>('pomodoro');
  return (
    <ThemeProvider forceMode="cover">
      <Inner take={take} onSwap={setTake} />
    </ThemeProvider>
  );
}

function Inner({ take, onSwap }: { take: ShieldStyle; onSwap: (s: ShieldStyle) => void }) {
  const p = usePalette();
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: p.bg }]}>
      <View style={styles.head}>
        <View style={[styles.appPill, { borderColor: p.border, backgroundColor: p.surface }]}>
          <View style={[styles.icon, { backgroundColor: '#E1306C' }]}>
            <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>IG</Text>
          </View>
          <Text variant="caption" style={{ color: p.fg2 }}>Instagram</Text>
          <Text variant="caption" tone="muted">covered</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={[styles.dot, { backgroundColor: p.accent }]} />
          <Text variant="eyebrow" tone="accent">DEEP WORK</Text>
        </View>
      </View>

      <View style={[styles.toggleRow, { backgroundColor: p.surface, borderColor: p.border }]}>
        {(['pomodoro', 'friction'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => onSwap(t)}
            style={[
              styles.toggleBtn,
              take === t && { backgroundColor: p.accentSoft },
            ]}
          >
            <Text
              variant="caption"
              style={{ color: take === t ? p.accent : p.fg2, fontSize: 12, fontWeight: '600' }}
            >
              {t === 'pomodoro' ? 'Take 1 — timer' : 'Take 2 — friction'}
            </Text>
          </Pressable>
        ))}
      </View>

      {take === 'pomodoro' ? <PomodoroTake /> : <FrictionTake />}

      <View style={styles.exitRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text variant="caption" tone="muted">← Back to app</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function PomodoroTake() {
  const p = usePalette();
  return (
    <>
      <Text
        variant="body"
        tone="muted"
        style={{ paddingHorizontal: 36, paddingTop: 30, textAlign: 'center', fontSize: 15 }}
      >
        You opened a covered app.{' '}
        <Text style={{ color: p.fg2, fontStyle: 'italic' }}>
          Sit with it for 21 more minutes
        </Text>
        , or take an honest break.
      </Text>

      <View style={styles.ringWrap}>
        <TimerRing totalSeconds={25 * 60} remainingSeconds={21 * 60 + 43} running />
      </View>

      <View style={{ alignItems: 'center', paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                backgroundColor: i <= 4 ? p.accent : p.border2,
              }}
            />
          ))}
        </View>
        <Text variant="caption" tone="muted" style={{ marginTop: 8 }}>
          Pomodoro 5 of 8 · 1h 38m of Deep Work left
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24, gap: 10, paddingBottom: 8 }}>
        <Button
          label="Take a 5-minute break instead"
          variant="secondary"
          onPress={() => __mockEmitShieldAction({ blockId: 'preview', action: 'budget5' })}
        />
        <Pressable
          onPress={() => __mockEmitShieldAction({ blockId: 'preview', action: 'end' })}
          hitSlop={8}
        >
          <Text variant="caption" tone="muted" style={{ textAlign: 'center', fontSize: 12 }}>
            Need this app for work? End block early
          </Text>
        </Pressable>
      </View>
    </>
  );
}

function FrictionTake() {
  const p = usePalette();
  return (
    <>
      <View style={{ alignItems: 'center', paddingTop: 22 }}>
        <BreathOrb />
      </View>
      <View style={{ paddingHorizontal: 32, paddingTop: 18, alignItems: 'center' }}>
        <Text
          variant="h1"
          style={{ fontSize: 30, lineHeight: 33, textAlign: 'center', fontWeight: '500' }}
        >
          Breathe.{'\n'}
          <Text style={{ color: p.accent, fontStyle: 'italic', fontWeight: '400' }}>
            Then decide.
          </Text>
        </Text>
        <Text variant="body" tone="muted" style={{ marginTop: 10, fontSize: 14, textAlign: 'center' }}>
          You've opened Instagram <Text style={{ color: p.fg2, fontWeight: '600' }}>14 times</Text> this week.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 16, gap: 8 }}>
        <Decide
          primary
          title="I'll wait the 25 minutes"
          subtitle="Return to focus · most picked"
          onPress={() => __mockEmitShieldAction({ blockId: 'preview', action: 'wait' })}
        />
        <Decide
          title="Just 5 minutes"
          subtitle="Counts against your daily budget · 22m left"
          onPress={() => __mockEmitShieldAction({ blockId: 'preview', action: 'budget5' })}
        />
        <Decide
          title="End the Deep Work block"
          subtitle="1h 38m left"
          onPress={() => __mockEmitShieldAction({ blockId: 'preview', action: 'end' })}
        />
      </View>
    </>
  );
}

function Decide({
  title,
  subtitle,
  onPress,
  primary,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  primary?: boolean;
}) {
  const p = usePalette();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.opt,
        {
          backgroundColor: primary ? p.accentSoft : p.surface,
          borderColor: primary ? p.accent : p.border,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text variant="body" style={{ fontSize: 15, fontWeight: '600' }}>{title}</Text>
        <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>{subtitle}</Text>
      </View>
      <Text variant="body" tone="faint">→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  head: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 6,
    paddingRight: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 999,
  },
  icon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 6, height: 6, borderRadius: 999 },
  toggleRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginTop: 12,
    padding: 3,
    borderRadius: 12,
    borderWidth: 1,
    gap: 3,
  },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  ringWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  opt: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exitRow: { padding: spacing.xl, alignItems: 'center' },
});
