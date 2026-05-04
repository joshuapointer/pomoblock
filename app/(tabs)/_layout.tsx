import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { usePalette } from '@/theme/ThemeProvider';
import { Text } from '@/components/Text';

function TabIcon({ glyph, focused, color }: { glyph: string; focused: boolean; color: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: 18, color, fontWeight: focused ? '700' : '500' }}>{glyph}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const p = usePalette();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: p.accent,
        tabBarInactiveTintColor: p.muted,
        tabBarStyle: {
          backgroundColor: p.bg,
          borderTopColor: p.border,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => <TabIcon glyph="◇" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="blocks"
        options={{
          title: 'Blocks',
          tabBarIcon: ({ focused, color }) => <TabIcon glyph="▦" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedules"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ focused, color }) => <TabIcon glyph="◧" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}
