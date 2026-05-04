import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { Text } from '@/components/Text';
import { usePalette } from '@/theme/ThemeProvider';

const SIZE = 220;

export function BreathOrb({ active = true }: { active?: boolean }) {
  const p = usePalette();
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0.85);

  useEffect(() => {
    cancelAnimation(scale);
    cancelAnimation(opacity);
    if (active) {
      scale.value = withRepeat(
        withTiming(1.04, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
      opacity.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    }
  }, [active, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.orb,
          {
            backgroundColor: 'transparent',
            shadowColor: p.accent,
            shadowOpacity: 0.4,
            shadowRadius: 60,
          },
          animatedStyle,
        ]}
      >
        <View
          style={[
            styles.glow,
            { backgroundColor: p.accent, opacity: 0.18 },
          ]}
        />
        <View style={[styles.ringOuter, { borderColor: p.accent }]} />
        <View style={[styles.ringInner, { borderColor: p.accent }]} />
        <Text
          variant="eyebrow"
          tone="fg2"
          style={{ fontSize: 18, fontWeight: '200', letterSpacing: 1.8 }}
        >
          BREATHE
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  orb: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    inset: 30,
    borderRadius: SIZE,
  },
  ringOuter: {
    position: 'absolute',
    inset: 26,
    borderRadius: SIZE,
    borderWidth: 1,
    opacity: 0.7,
  },
  ringInner: {
    position: 'absolute',
    inset: 50,
    borderRadius: SIZE,
    borderWidth: 1,
    opacity: 0.45,
  },
});
