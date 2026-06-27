import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkColors, LightColors, ThemeColors } from '../constants';

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  colors: DarkColors,
  themeMode: 'dark',
  setThemeMode: () => {},
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const THEME_STORAGE_KEY = '@app_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'dark' || stored === 'light' || stored === 'system') {
          setThemeModeState(stored);
        }
      } catch {}
    })();
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {});
  };

  const toggleTheme = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
  };

  const isDark =
    themeMode === 'system' ? systemScheme !== 'light' : themeMode === 'dark';

  const colors = isDark ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, themeMode, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
