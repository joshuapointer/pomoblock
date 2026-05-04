import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { usePalette } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { screenTime } from '@/native/screen-time';
import { useSettings } from '@/state/settings';

export default function Onboarding() {
  const p = usePalette();
  const [pending, setPending] = useState(false);
  const setAuth = useSettings((s) => s.setAuth);
  const setOnboarded = useSettings((s) => s.setOnboarded);

  async function grant() {
    setPending(true);
    try {
      const status = await screenTime.requestAuthorization();
      setAuth(status);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      if (status === 'approved') {
        setOnboarded(true);
        router.replace('/(tabs)');
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: p.bg }]}>
      <View style={styles.header}>
        <View style={styles.stepPill}>
          <View style={styles.dots}>
            <View style={[styles.dot, { backgroundColor: p.fg }]} />
            <View style={[styles.dot, { backgroundColor: p.fg }]} />
            <View style={[styles.dot, { backgroundColor: p.border2 }]} />
          </View>
          <Text variant="caption" tone="muted" style={styles.stepLabel}>
            STEP 2 OF 3
          </Text>
        </View>
        <Pressable
          onPress={() => {
            setOnboarded(true);
            router.replace('/(tabs)');
          }}
        >
          <Text variant="body" tone="muted">Skip</Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text variant="eyebrow" tone="accent">CONNECT SCREEN TIME</Text>
        <Text variant="h1" style={{ marginTop: 16, fontSize: 32, lineHeight: 34 }}>
          Trade the scroll{'\n'}for a 25-minute timer.
        </Text>
        <Text variant="body" tone="muted" style={{ marginTop: 14, fontSize: 16, lineHeight: 23 }}>
          When you open Instagram during a work block, Pomoblock covers it with a focus session — not a wall. Wait it out, get the minutes back.
        </Text>

        <Card style={styles.sheet}>
          <View style={[styles.handle, { backgroundColor: p.border2 }]} />
          <Text variant="body" style={{ fontWeight: '600', marginTop: 8, fontSize: 15 }}>
            "Pomoblock" Would Like to Access Screen Time
          </Text>
          <Text variant="caption" tone="muted" style={{ marginTop: 6, fontSize: 13, lineHeight: 18 }}>
            This will let Pomoblock see when you open apps you've added to a block, and replace the screen with a focus timer.
          </Text>
          <View style={[styles.appRow, { backgroundColor: p.surface2 }]}>
            <View style={[styles.appIcon, { backgroundColor: p.accent }]}>
              <Text variant="body" style={{ color: 'white', fontWeight: '700' }}>P</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '600', fontSize: 14 }}>Pomoblock</Text>
              <Text variant="caption" tone="muted">Apps, Categories, Web Domains</Text>
            </View>
          </View>
          <View style={styles.actionRow}>
            <View style={[styles.sheetBtn, { borderColor: p.border, backgroundColor: p.surface2 }]}>
              <Text variant="caption" style={{ fontSize: 13 }}>Don't Allow</Text>
            </View>
            <View style={[styles.sheetBtn, { backgroundColor: p.fg, borderColor: p.fg }]}>
              <Text variant="caption" style={{ fontSize: 13, color: p.surface, fontWeight: '600' }}>Continue</Text>
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.footer}>
        <Text variant="caption" tone="muted" style={{ fontSize: 12, lineHeight: 17 }}>
          Pomoblock never reads what's behind the cover. Apps and categories you select live on-device.
        </Text>
        <Button
          label={pending ? 'Requesting…' : 'Allow Screen Time access'}
          onPress={grant}
          disabled={pending}
          style={{ marginTop: 16 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dots: { flexDirection: 'row', gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 999 },
  stepLabel: { fontSize: 12 },
  hero: { flex: 1, paddingHorizontal: 28, paddingTop: 32 },
  sheet: { marginTop: 28, padding: 18 },
  handle: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 999,
  },
  appRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 14,
  },
  appIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: { marginTop: 14, flexDirection: 'row', gap: 8 },
  sheetBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
  },
  footer: { padding: 24 },
});
