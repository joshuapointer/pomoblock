import { Pressable, View, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { usePalette } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';

type Variant = 'primary' | 'secondary' | 'tertiary';

export function Button({
  label,
  variant = 'primary',
  onPress,
  style,
  disabled,
}: {
  label: string;
  variant?: Variant;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}) {
  const p = usePalette();
  const v: Record<Variant, ViewStyle> = {
    primary: {
      backgroundColor: p.fg,
      borderColor: p.fg,
      borderWidth: 1,
    },
    secondary: {
      backgroundColor: p.surface,
      borderColor: p.border,
      borderWidth: 1,
    },
    tertiary: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
    },
  };
  const labelTone = variant === 'primary' ? p.surface : p.fg;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          height: variant === 'tertiary' ? 36 : 52,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          paddingHorizontal: 18,
        },
        v[variant],
        style,
      ]}
    >
      <View>
        <Text variant="body" style={{ color: labelTone, fontWeight: '600', fontSize: 16 }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
