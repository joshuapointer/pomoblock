import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { usePalette } from '@/theme/ThemeProvider';

export function Switch({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange?: (v: boolean) => void;
}) {
  const p = usePalette();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 180 });
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: progress.value > 0.5 ? p.accent : p.border2,
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * 16 }],
  }));

  return (
    <Pressable onPress={() => onValueChange?.(!value)} hitSlop={8}>
      <Animated.View
        style={[
          {
            width: 42,
            height: 26,
            borderRadius: 999,
            justifyContent: 'center',
          },
          trackStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              width: 22,
              height: 22,
              borderRadius: 999,
              backgroundColor: 'white',
              marginLeft: 2,
              shadowColor: '#000',
              shadowOpacity: 0.18,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 1 },
            },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
