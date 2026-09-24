import { useCallback, useEffect, useState } from 'react';

export type ThemeName = 'dark' | 'sunset' | 'light';

export interface ThemeOption {
  key: ThemeName;
  label: string;
}

export const THEMES: ThemeOption[] = [
  { key: 'dark', label: 'Midnight' },
  { key: 'sunset', label: 'Sunset' },
  { key: 'light', label: 'Daylight' },
];

const STORAGE_KEY = 'creo-theme';

function readStoredTheme(): ThemeName {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'sunset' || stored === 'light' || stored === 'dark' ? stored : 'dark';
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>(readStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
  }, []);

  return { theme, setTheme, isLight: theme === 'light' };
}
