import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Text } from '@/components/Text';
import { usePalette } from '@/theme/ThemeProvider';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 300;
const RADIUS = 140;
const STROKE = 2;
const CIRC = 2 * Math.PI * RADIUS;

type Props = {
  totalSeconds: number;
  remainingSeconds: number;
  // When provided, the ring animates the remaining seconds toward 0 in real
  // time using a Reanimated worklet — no setInterval, no Animated API.
  running?: boolean;
};

export function TimerRing({ totalSeconds, remainingSeconds, running = false }: Props) {
  const p = usePalette();
  const remain = useSharedValue(remainingSeconds);

  useEffect(() => {
    cancelAnimation(remain);
    remain.value = remainingSeconds;
    if (running && remainingSeconds > 0) {
      remain.value = withTiming(0, {
        duration: remainingSeconds * 1000,
        easing: Easing.linear,
      });
    }
  }, [running, remainingSeconds, remain]);

  const animatedProps = useAnimatedProps(() => {
    const fraction = totalSeconds > 0 ? remain.value / totalSeconds : 0;
    const offset = CIRC * (1 - fraction);
    return { strokeDashoffset: offset } as { strokeDashoffset: number };
  });

  const minsLabel = useDerivedValue(() => {
    const v = Math.max(0, Math.ceil(remain.value));
    return v;
  });

  return (
    <View style={styles.wrap}>
      <Svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={p.border}
          strokeWidth={1.2}
          fill="none"
        />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={p.accent}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${CIRC}`}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={styles.center}>
        <DigitsView remainShared={minsLabel} totalSeconds={totalSeconds} />
      </View>
    </View>
  );
}

function DigitsView({
  remainShared,
  totalSeconds,
}: {
  remainShared: SharedValue<number>;
  totalSeconds: number;
}) {
  const text = useDerivedValue(() => {
    const total = Math.max(0, Math.floor(remainShared.value));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  });

  return (
    <>
      <ReactiveText shared={text} />
      <Text variant="eyebrow" tone="faint" style={{ marginTop: 8 }}>
        of {Math.round(totalSeconds / 60)} minutes
      </Text>
    </>
  );
}

// Reanimated ReactiveText — re-renders without leaving the worklet boundary.
import Reanimated from 'react-native-reanimated';
import { TextInput } from 'react-native';

const AnimatedTextInput = Reanimated.createAnimatedComponent(TextInput);

function ReactiveText({ shared }: { shared: SharedValue<string> }) {
  const p = usePalette();
  const animatedProps = useAnimatedProps(() => {
    return { text: shared.value, defaultValue: shared.value } as unknown as object;
  });
  return (
    <AnimatedTextInput
      editable={false}
      animatedProps={animatedProps}
      style={[
        styles.digits,
        { color: p.fg },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  center: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digits: {
    fontSize: 88,
    fontWeight: '200',
    letterSpacing: -4.4,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    minWidth: 230,
    padding: 0,
  },
});
