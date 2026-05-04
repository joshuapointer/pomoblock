// Modern-minimal palette. Light surfaces in-app; dark reserved for cover screens.
// sRGB hex pre-resolved from the oklch source (design/assets/tokens.css)
// because RN's color parser still chokes on oklch() in StyleSheet values.

export const light = {
  bg: '#FCFCFD',
  surface: '#FFFFFF',
  surface2: '#F7F7F9',
  fg: '#1C1F26',
  fg2: '#2F3340',
  muted: '#7A7E8A',
  faint: '#B0B3BC',
  border: '#E5E6EA',
  border2: '#D1D3D9',
  accent: '#2563EB',
  accent2: '#3B7DF0',
  accentSoft: '#E4ECFB',
  good: '#2EA868',
  warn: '#C28E2E',
  crit: '#DD3A3A',
} as const;

export const dark = {
  bg: '#0E1015',
  surface: '#15181F',
  surface2: '#1B1F27',
  fg: '#ECEEF2',
  fg2: '#C5C9D2',
  muted: '#8B8F9A',
  faint: '#585B66',
  border: '#2C2F38',
  border2: '#393C46',
  accent: '#6B9CFF',
  accent2: '#80AAFF',
  accentSoft: '#1B2738',
  good: '#3FB87A',
  warn: '#D9A551',
  crit: '#E66A6A',
} as const;

export type Palette = { [K in keyof typeof light]: string };

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  xl: 28,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// SF Pro stacks. Display for big numerals, Text for body.
export const fonts = {
  display: 'System',
  body: 'System',
  mono: 'Menlo',
} as const;

export const tabular = {
  fontVariant: ['tabular-nums' as const],
} as const;
