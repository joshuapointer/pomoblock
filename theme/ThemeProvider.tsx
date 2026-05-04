import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { dark, light, type Palette } from './tokens';

type ThemeMode = 'light' | 'dark' | 'cover';

type ThemeContextValue = {
  mode: ThemeMode;
  palette: Palette;
};

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  palette: light,
});

// In-app surfaces stay light always (per concept). Cover screens force dark.
export function ThemeProvider({
  children,
  forceMode,
}: {
  children: ReactNode;
  forceMode?: ThemeMode;
}) {
  const system = useColorScheme();
  const mode: ThemeMode = forceMode ?? 'light';
  const palette = mode === 'cover' || (mode === 'dark' && system === 'dark') ? dark : light;
  return (
    <ThemeContext.Provider value={{ mode, palette }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function usePalette(): Palette {
  return useContext(ThemeContext).palette;
}
