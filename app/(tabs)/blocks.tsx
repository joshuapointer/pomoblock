import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { usePalette } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
import { useBlocks } from '@/state/blocks';

export default function BlocksList() {
  const p = usePalette();
  const blocks = useBlocks((s) => s.blocks);
  const remove = useBlocks((s) => s.remove);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: p.bg }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24, gap: 8, padding: spacing.xl }}>
        <View style={styles.head}>
          <Text variant="h1" style={{ fontSize: 28 }}>Blocks</Text>
          <Button label="+ New" variant="primary" onPress={() => router.push('/blocks/new')} />
        </View>

        {blocks.length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center', marginTop: 16 }}>
            <Text variant="body" tone="muted">No blocks. Tap + New to create one.</Text>
          </Card>
        ) : (
          blocks.map((b) => (
            <Card key={b.id} style={{ padding: 14, gap: 6, marginTop: 4 }}>
              <Text variant="body" style={{ fontWeight: '600' }}>{b.name}</Text>
              <Text variant="caption" tone="muted">
                {b.durationMinutes}m · {b.shieldStyle === 'pomodoro' ? 'Timer' : 'Friction'} · {b.selectionLabel}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <Pressable onPress={() => router.push(`/blocks/new?id=${b.id}`)}>
                  <Text variant="caption" tone="accent">Edit</Text>
                </Pressable>
                <Pressable onPress={() => remove(b.id)}>
                  <Text variant="caption" tone="muted">Delete</Text>
                </Pressable>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
