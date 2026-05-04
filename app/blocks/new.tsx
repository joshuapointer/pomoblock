import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { usePalette } from '@/theme/ThemeProvider';
import { spacing, radius } from '@/theme/tokens';
import { useBlocks } from '@/state/blocks';
import { screenTime } from '@/native/screen-time';
import type { Block, ShieldStyle } from '@/state/types';

export default function NewBlock() {
  const p = usePalette();
  const params = useLocalSearchParams<{ id?: string }>();
  const upsert = useBlocks((s) => s.upsert);
  const existing = useBlocks((s) => (params.id ? s.byId(params.id) : undefined));

  const [name, setName] = useState(existing?.name ?? 'Deep Work');
  const [duration, setDuration] = useState(existing?.durationMinutes ?? 25);
  const [shieldStyle, setShieldStyle] = useState<ShieldStyle>(
    existing?.shieldStyle ?? 'pomodoro',
  );
  const [selection, setSelection] = useState<string | null>(existing?.selection ?? null);
  const [selectionLabel, setSelectionLabel] = useState<string>(
    existing?.selectionLabel ?? '0 items',
  );
  const [pickerBusy, setPickerBusy] = useState(false);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setDuration(existing.durationMinutes);
      setShieldStyle(existing.shieldStyle);
      setSelection(existing.selection);
      setSelectionLabel(existing.selectionLabel);
    }
  }, [existing]);

  async function pickApps() {
    setPickerBusy(true);
    try {
      const token = await screenTime.presentFamilyActivityPicker(selection ?? undefined);
      setSelection(token);
      // We don't know the count in JS (privacy by design); show a stable label
      // and let the shield show specifics later.
      setSelectionLabel('Apps & categories selected');
      Haptics.selectionAsync().catch(() => {});
    } finally {
      setPickerBusy(false);
    }
  }

  function save() {
    if (!selection) return;
    const block: Block = {
      id: existing?.id ?? `b_${Date.now()}`,
      name: name.trim() || 'Untitled',
      selection,
      selectionLabel,
      durationMinutes: duration,
      shieldStyle,
      schedule: existing?.schedule ?? null,
      enabled: existing?.enabled ?? true,
      createdAt: existing?.createdAt ?? Date.now(),
    };
    upsert(block);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: p.bg }]}>
      <View style={styles.navbar}>
        <Pressable onPress={() => router.back()}>
          <Text variant="body" tone="accent">Cancel</Text>
        </Pressable>
        <Text variant="body" style={{ fontWeight: '600' }}>
          {existing ? 'Edit block' : 'New block'}
        </Text>
        <Pressable onPress={save} disabled={!selection}>
          <Text
            variant="body"
            style={{ color: selection ? p.accent : p.faint, fontWeight: '600' }}
          >
            Save
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Section label="NAME & DURATION">
          <Card style={{ paddingHorizontal: 16 }}>
            <View style={styles.row}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Block name"
                placeholderTextColor={p.faint}
                style={[styles.input, { color: p.fg }]}
                returnKeyType="done"
              />
            </View>
            <View style={[styles.row, styles.divider, { borderTopColor: p.border }]}>
              <Text variant="body" style={{ flex: 1, fontSize: 15 }}>Pomodoro length</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {[15, 25, 45, 60].map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => setDuration(m)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: duration === m ? p.accent : p.surface2,
                        borderColor: duration === m ? p.accent : p.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: duration === m ? 'white' : p.fg2,
                      }}
                    >
                      {m}m
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Card>
        </Section>

        <Section label="WHAT TO COVER">
          <Pressable
            onPress={pickApps}
            disabled={pickerBusy}
            style={[
              styles.picker,
              {
                borderColor: selection ? p.accent : p.border2,
                backgroundColor: selection ? p.accentSoft : 'transparent',
              },
            ]}
          >
            <Text
              variant="body"
              style={{
                color: selection ? p.accent : p.muted,
                fontSize: 14,
                fontWeight: '500',
              }}
            >
              {pickerBusy
                ? 'Opening picker…'
                : selection
                  ? `✓ ${selectionLabel} — tap to change`
                  : '＋ Add apps or categories'}
            </Text>
          </Pressable>
          <Text variant="caption" tone="muted" style={{ paddingHorizontal: 24, marginTop: 8 }}>
            Pomoblock never sees the bundle ids — Apple's Family Activity Picker returns an opaque token.
          </Text>
        </Section>

        <Section label="WHEN A COVERED APP IS OPENED">
          <View style={[styles.seg, { backgroundColor: p.surface2, borderColor: p.border }]}>
            {(['pomodoro', 'friction'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setShieldStyle(s)}
                style={[
                  styles.segBtn,
                  shieldStyle === s && { backgroundColor: p.surface },
                ]}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: shieldStyle === s ? '600' : '500',
                    color: shieldStyle === s ? p.fg : p.fg2,
                  }}
                >
                  {s === 'pomodoro' ? 'Pomodoro timer' : 'Friction layer'}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text variant="caption" tone="muted" style={{ paddingHorizontal: 24, marginTop: 8 }}>
            {shieldStyle === 'pomodoro'
              ? `${duration} min countdown replaces the app. Wait it out and the app unlocks for 5 min.`
              : '10-second breath, then three options: wait, 5-min budget, end the block.'}
          </Text>
        </Section>
      </ScrollView>

      <View style={styles.sticky}>
        <Button
          label={selection ? 'Save block' : 'Pick apps to cover first'}
          onPress={save}
          disabled={!selection}
        />
      </View>
    </SafeAreaView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 16 }}>
      <Text
        variant="eyebrow"
        tone="muted"
        style={{ paddingHorizontal: 24, paddingBottom: 6 }}
      >
        {label}
      </Text>
      <View style={{ paddingHorizontal: 18 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  navbar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  divider: { borderTopWidth: 1 },
  input: { flex: 1, fontSize: 16, fontWeight: '500', paddingVertical: 4 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  picker: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
  },
  seg: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 3,
    borderWidth: 1,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
  },
  sticky: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
  },
});
