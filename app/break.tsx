import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { usePalette } from '@/theme/ThemeProvider';
import { spacing, radius } from '@/theme/tokens';
import { useSession } from '@/state/session';
import { useSettings } from '@/state/settings';

export default function Break() {
  const p = usePalette();
  const breakMin = useSettings((s) => s.defaultBreakMinutes);
  const pomodorosToday = useSession((s) => s.pomodorosToday);
  const endBreak = useSession((s) => s.endBreak);
  const [remain, setRemain] = useState(breakMin * 60);

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const r = breakMin * 60 - elapsed;
      if (r <= 0) {
        clearInterval(id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        endBreak();
        router.back();
        return;
      }
      setRemain(r);
    }, 1000);
    return () => clearInterval(id);
  }, [breakMin, endBreak]);

  const m = Math.floor(remain / 60);
  const s = remain % 60;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: p.bg }]}>
      <View style={styles.top}>
        <View style={[styles.pill, { backgroundColor: p.surface, borderColor: p.border }]}>
          <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: p.accent }} />
          <Text variant="caption" tone="fg2" style={{ fontSize: 12, fontWeight: '500' }}>
            Short break
          </Text>
        </View>
      </View>

      <View style={styles.hero}>
        <Text variant="eyebrow" tone="accent">
          POMODORO {pomodorosToday} — DONE
        </Text>
        <Text variant="h1" style={{ fontSize: 38, lineHeight: 40, marginTop: 8 }}>
          Look up.{'\n'}Five honest minutes.
        </Text>
        <Text variant="body" tone="muted" style={{ marginTop: 12, fontSize: 15, lineHeight: 22 }}>
          Covered apps stay covered during the break. Apps you didn't add work normally.
        </Text>

        <Card style={[styles.timer, { padding: 18 }]}>
          <Text
            tabular
            style={{
              fontSize: 56,
              fontWeight: '200',
              letterSpacing: -2.2,
              color: p.fg,
              fontVariant: ['tabular-nums'],
            }}
          >
            {String(m).padStart(2, '0')}
            <Text style={{ color: p.muted }}>:</Text>
            {String(s).padStart(2, '0')}
          </Text>
          <View style={{ marginLeft: 14, gap: 4 }}>
            <Text variant="body" style={{ fontWeight: '600', fontSize: 13 }}>
              break
            </Text>
            <Text variant="caption" tone="muted">
              back at{' '}
              {new Date(Date.now() + remain * 1000).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </Card>
      </View>

      <View style={styles.cta}>
        <Button
          label="Start next pomodoro now →"
          onPress={() => {
            endBreak();
            router.back();
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: { padding: spacing.xl, alignItems: 'flex-start' },
  pill: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: 'center',
  },
  hero: { paddingHorizontal: spacing.xl, flex: 1 },
  timer: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'baseline',
    borderRadius: radius.lg,
  },
  cta: { padding: spacing.xl },
});
