import { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Switch } from '@/components/Switch';
import { usePalette } from '@/theme/ThemeProvider';
import { spacing, radius } from '@/theme/tokens';
import { useBlocks } from '@/state/blocks';
import { useSession } from '@/state/session';
import type { Block } from '@/state/types';

function formatTimeRange(b: Block): string {
  if (!b.schedule) return 'Manual';
  const fmt = (m: number) =>
    `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  return `${fmt(b.schedule.startMinute)} – ${fmt(b.schedule.endMinute)}`;
}

export default function Home() {
  const p = usePalette();
  const blocks = useBlocks((s) => s.blocks);
  const setEnabled = useBlocks((s) => s.setEnabled);
  const session = useSession((s) => s.active);
  const pomodorosToday = useSession((s) => s.pomodorosToday);
  const resetIfStale = useSession((s) => s.resetTodayIfStale);
  const activeBlock = blocks.find((b) => b.id === session?.blockId);

  useEffect(() => {
    resetIfStale();
  }, [resetIfStale]);

  const today = new Date();
  const dateLabel = today.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: p.bg }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.topbar}>
          <Text variant="label" tone="muted">{dateLabel}</Text>
        </View>

        <View style={styles.hero}>
          <View style={styles.liveRow}>
            <View style={[styles.liveDot, { backgroundColor: p.accent }]} />
            <Text variant="eyebrow" tone="accent">
              {activeBlock
                ? `${activeBlock.name} — covering`
                : 'Idle — no block active'}
            </Text>
          </View>
          <Text variant="h1" style={{ fontSize: 36, lineHeight: 38, marginTop: 6 }}>
            <Text style={{ color: p.accent, fontSize: 36, fontWeight: '600', letterSpacing: -0.9 }}>
              {activeBlock ? `${activeBlock.durationMinutes}m` : '—'}
            </Text>
            {'\n'}left in this block.
          </Text>
          <Text variant="body" tone="muted" style={{ marginTop: 10, fontSize: 13 }}>
            {activeBlock ? formatTimeRange(activeBlock) : 'Pick a block below to start'}
          </Text>
        </View>

        <View style={styles.stats}>
          <Stat value={`${pomodorosToday}`} label="Pomodoros today" suffix="/ 8" />
          <Stat
            value={`${Math.floor(pomodorosToday * 25 / 60)}h ${(pomodorosToday * 25) % 60}m`}
            label="Focus time"
          />
          <Stat value={`${blocks.filter((b) => b.enabled).length}`} label="Blocks on" />
        </View>

        <View style={styles.sectionHead}>
          <Text variant="eyebrow" tone="muted">YOUR BLOCKS</Text>
          <Pressable onPress={() => router.push('/blocks/new')}>
            <Text variant="body" tone="accent" style={{ fontSize: 13 }}>+ New</Text>
          </Pressable>
        </View>

        <View style={styles.blockList}>
          {blocks.length === 0 ? (
            <Card style={styles.empty}>
              <Text variant="body" tone="muted">No blocks yet.</Text>
              <Text variant="caption" tone="faint" style={{ marginTop: 4 }}>
                Tap + New to create your first.
              </Text>
            </Card>
          ) : (
            blocks.map((b) => (
              <BlockRow
                key={b.id}
                block={b}
                isActive={b.id === session?.blockId}
                onToggle={(v) => setEnabled(b.id, v)}
                onPress={() => router.push(`/blocks/new?id=${b.id}`)}
              />
            ))
          )}
        </View>

        <Pressable
          style={[styles.previewBtn, { borderColor: p.border }]}
          onPress={() => router.push('/cover-preview')}
        >
          <Text variant="body" tone="fg2" style={{ fontSize: 13 }}>Preview cover takes →</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label, suffix }: { value: string; label: string; suffix?: string }) {
  const p = usePalette();
  return (
    <View style={[styles.stat, { backgroundColor: p.surface, borderColor: p.border }]}>
      <Text style={{ fontSize: 22, fontWeight: '600', letterSpacing: -0.5, color: p.fg }} tabular>
        {value}
        {suffix && (
          <Text variant="caption" tone="muted" style={{ fontSize: 12, marginLeft: 2 }}>
            {' '}{suffix}
          </Text>
        )}
      </Text>
      <Text variant="caption" tone="muted" style={{ fontSize: 11, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

function BlockRow({
  block,
  isActive,
  onToggle,
  onPress,
}: {
  block: Block;
  isActive: boolean;
  onToggle: (v: boolean) => void;
  onPress: () => void;
}) {
  const p = usePalette();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.block,
        { backgroundColor: p.surface, borderColor: isActive ? p.accent : p.border },
      ]}
    >
      <View
        style={[
          styles.glyph,
          {
            backgroundColor: isActive ? p.accent : p.surface2,
            borderColor: isActive ? p.accent : p.border,
          },
        ]}
      >
        <Text style={{ color: isActive ? 'white' : p.fg2, fontSize: 14, fontWeight: '600' }}>
          {block.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="body" style={{ fontSize: 15, fontWeight: '600' }}>
          {block.name}
        </Text>
        <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
          {isActive && (
            <Text variant="caption" tone="accent" style={{ fontWeight: '600' }}>
              Covering now ·{' '}
            </Text>
          )}
          {formatTimeRange(block)} · {block.selectionLabel}
        </Text>
      </View>
      <Switch value={block.enabled} onValueChange={onToggle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topbar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hero: { paddingHorizontal: spacing.xl, paddingTop: 8, paddingBottom: 16 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  liveDot: { width: 7, height: 7, borderRadius: 999 },
  stats: {
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 12,
  },
  sectionHead: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blockList: { paddingHorizontal: spacing.xl, gap: 8 },
  block: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  glyph: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { padding: 24, alignItems: 'center' },
  previewBtn: {
    marginTop: 18,
    marginHorizontal: spacing.xl,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
});
