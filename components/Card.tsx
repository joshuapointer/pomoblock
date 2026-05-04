import { View, type ViewProps } from 'react-native';
import { usePalette } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';

export function Card({ style, ...rest }: ViewProps) {
  const p = usePalette();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: p.surface,
          borderColor: p.border,
          borderWidth: 1,
          borderRadius: radius.lg,
          overflow: 'hidden',
        },
        style,
      ]}
    />
  );
}
