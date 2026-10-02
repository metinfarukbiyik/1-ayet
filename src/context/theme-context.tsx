import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

import { ThemePalettes, type PresetThemeKey, type ThemePalette } from '@/constants/theme';
import { getStoredThemeId, setStoredThemeId, type ThemeId } from '@/lib/storage';
import { syncDailyVerseWidgetAsync } from '@/lib/widget-sync';

type ThemeContextType = {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  theme: ThemePalette;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  themeId: 'system',
  setThemeId: () => {},
  theme: ThemePalettes.parchment,
  isDark: false,
});

function resolvePalette(themeId: ThemeId, deviceDark: boolean): { palette: ThemePalette; isDark: boolean } {
  if (themeId === 'system') {
    const palette = deviceDark ? ThemePalettes.night : ThemePalettes.parchment;
    return { palette, isDark: deviceDark };
  }

  // Geriye dönük 'light' / 'dark' desteği
  if (themeId === 'light') {
    return { palette: ThemePalettes.parchment, isDark: false };
  }
  if (themeId === 'dark') {
    return { palette: ThemePalettes.night, isDark: true };
  }

  const found = ThemePalettes[themeId as PresetThemeKey];
  if (found) {
    return { palette: found, isDark: found.isDark };
  }

  return { palette: ThemePalettes.parchment, isDark: false };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const deviceScheme = useDeviceColorScheme();
  const [themeId, setThemeIdState] = useState<ThemeId>('system');

  useEffect(() => {
    let mounted = true;
    getStoredThemeId().then((stored) => {
      if (mounted) setThemeIdState(stored);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const setThemeId = (newId: ThemeId) => {
    setThemeIdState(newId);
    setStoredThemeId(newId);
    // Uygulama teması değiştiğinde widget'ı otomatik senkronize et
    syncDailyVerseWidgetAsync(7);
  };

  const { palette, isDark } = resolvePalette(themeId, deviceScheme === 'dark');

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, theme: palette, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextType {
  return useContext(ThemeContext);
}
