import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { usePalette } from '@/theme/ThemeProvider';

type Variant = 'display' | 'h1' | 'h2' | 'body' | 'caption' | 'eyebrow' | 'label';
type Tone = 'fg' | 'fg2' | 'muted' | 'faint' | 'accent';

const variants: Record<Variant, TextStyle> = {
  display: { fontSize: 88, fontWeight: '200', letterSpacing: -4.4, lineHeight: 84 },
  h1: { fontSize: 32, fontWeight: '600', letterSpacing: -0.9 },
  h2: { fontSize: 22, fontWeight: '600', letterSpacing: -0.5 },
  body: { fontSize: 15, fontWeight: '400', letterSpacing: -0.075 },
  caption: { fontSize: 12, fontWeight: '500', letterSpacing: 0 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
  label: { fontSize: 13, fontWeight: '500', letterSpacing: 0 },
};

export function Text({
  variant = 'body',
  tone = 'fg',
  tabular = false,
  style,
  ...rest
}: TextProps & { variant?: Variant; tone?: Tone; tabular?: boolean }) {
  const p = usePalette();
  const colorMap: Record<Tone, string> = {
    fg: p.fg,
    fg2: p.fg2,
    muted: p.muted,
    faint: p.faint,
    accent: p.accent,
  };
  return (
    <RNText
      {...rest}
      style={[
        variants[variant],
        { color: colorMap[tone] },
        tabular && { fontVariant: ['tabular-nums'] },
        style,
      ]}
    />
  );
}
