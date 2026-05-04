import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { usePalette } from '@/theme/ThemeProvider';
import { spacing, radius } from '@/theme/tokens';
import { useBlocks } from '@/state/blocks';
import type { Block } from '@/state/types';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function Schedules() {
  const p = usePalette();
  const blocks = useBlocks((s) => s.blocks);
  const scheduled = blocks.filter((b) => b.schedule);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: p.bg }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.navbar}>
          <Text variant="h1" style={{ fontSize: 28 }}>Schedules</Text>
        </View>

        <Card style={styles.week}>
          <View style={styles.weekHead}>
            <Text variant="body" style={{ fontWeight: '600' }}>This week</Text>
            <Text variant="caption" tone="muted">
              Time-of-day only · v0.1
            </Text>
          </View>
          <WeekGrid blocks={scheduled} />
          <Legend />
        </Card>

        <Text
          variant="eyebrow"
          tone="muted"
          style={{ paddingHorizontal: 24, paddingTop: 18, paddingBottom: 6 }}
        >
          RECURRING
        </Text>

        {scheduled.length === 0 ? (
          <Card style={{ marginHorizontal: 18, padding: 18 }}>
            <Text variant="body" tone="muted">
              No scheduled blocks yet. Open a block and add a time window to schedule it.
            </Text>
          </Card>
        ) : (
          <Card style={{ marginHorizontal: 18, overflow: 'hidden' }}>
            {scheduled.map((b, i) => (
              <View
                key={b.id}
                style={[
                  styles.row,
                  i < scheduled.length - 1 && { borderBottomWidth: 1, borderBottomColor: p.border },
                ]}
              >
                <View
                  style={[
                    styles.glyph,
                    { backgroundColor: p.accent },
                  ]}
                >
                  <Text style={{ color: 'white', fontSize: 13, fontWeight: '700' }}>
                    {b.name.charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontSize: 14, fontWeight: '600' }}>
                    {b.name}
                  </Text>
                  <Text variant="caption" tone="muted" style={{ marginTop: 1 }}>
                    {scheduleSummary(b)}
                  </Text>
                </View>
                {b.enabled && (
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: p.accent,
                      backgroundColor: p.accentSoft,
                    }}
                  >
                    <Text style={{ fontSize: 10, color: p.accent, fontWeight: '700' }}>
                      ON
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </Card>
        )}

        <Text
          variant="caption"
          tone="muted"
          style={{ paddingHorizontal: 24, paddingTop: 24, fontSize: 12, lineHeight: 17 }}
        >
          MVP scope: time-of-day triggers only. Location, calendar, and Focus-mode triggers
          are out of scope for v0.1.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function scheduleSummary(b: Block): string {
  if (!b.schedule) return 'Manual';
  const days = b.schedule.daysOfWeek
    .sort((a, c) => a - c)
    .map((d) => DAY_LABELS[d === 0 ? 6 : d - 1])
    .join('');
  const fmt = (m: number) =>
    `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  return `${days} · ${fmt(b.schedule.startMinute)}–${fmt(b.schedule.endMinute)} · ${b.selectionLabel}`;
}

function WeekGrid({ blocks }: { blocks: Block[] }) {
  const p = usePalette();
  // 6am–10pm = 16 rows. Crude: paint cells matching schedules.
  const HOURS = [6, 8, 9, 10, 11, 12, 14, 17, 21];
  return (
    <View style={{ marginTop: 10 }}>
      <View style={styles.headerRow}>
        <View style={{ width: 24 }} />
        {DAY_LABELS.map((d, i) => (
          <Text
            key={i}
            variant="caption"
            tone="muted"
            style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '600' }}
          >
            {d}
          </Text>
        ))}
      </View>
      {HOURS.map((h) => (
        <View key={h} style={styles.gridRow}>
          <Text variant="caption" tone="faint" style={{ width: 24, fontSize: 9, textAlign: 'right', paddingRight: 4 }}>
            {h > 12 ? `${h - 12}p` : `${h}`}
          </Text>
          {DAY_LABELS.map((_, i) => {
            const dayIdx = i === 6 ? 0 : i + 1; // M..S → 1..6,0
            const filled = blocks.find(
              (b) =>
                b.schedule?.daysOfWeek.includes(dayIdx as 0 | 1 | 2 | 3 | 4 | 5 | 6) &&
                h * 60 >= b.schedule.startMinute &&
                h * 60 < b.schedule.endMinute,
            );
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 12,
                  marginHorizontal: 2,
                  borderRadius: 3,
                  backgroundColor: filled ? p.accent : p.surface2,
                }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

function Legend() {
  const p = usePalette();
  return (
    <View style={{ flexDirection: 'row', gap: 14, marginTop: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: p.accent }} />
        <Text variant="caption" tone="muted">Scheduled block</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: p.surface2 }} />
        <Text variant="caption" tone="muted">Free</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  navbar: { paddingHorizontal: spacing.lg, paddingVertical: 8 },
  week: { marginHorizontal: 18, padding: 14 },
  weekHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  headerRow: { flexDirection: 'row' },
  gridRow: { flexDirection: 'row', marginTop: 4, alignItems: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  glyph: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
