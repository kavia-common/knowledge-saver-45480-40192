import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { DarkTheme, DefaultTheme, Theme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

type ThemeName = 'light' | 'dark' | 'system';

type ThemeContextType = {
  themeName: ThemeName;
  setThemeName: (t: ThemeName) => void;
};

const Ctx = createContext<ThemeContextType>({ themeName: 'system', setThemeName: () => {} });

export function useThemeSettings() {
  return useContext(Ctx);
}

const STORAGE_KEY = 'clipstack_theme_preference';

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [themeName, setThemeNameState] = useState<ThemeName>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystemScheme(colorScheme));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    (async () => {
      const v = await SecureStore.getItemAsync(STORAGE_KEY);
      if (v === 'light' || v === 'dark' || v === 'system') setThemeNameState(v);
    })();
  }, []);

  const setThemeName = async (t: ThemeName) => {
    setThemeNameState(t);
    await SecureStore.setItemAsync(STORAGE_KEY, t);
  };

  const navTheme: Theme = useMemo(() => {
    const scheme = themeName === 'system' ? systemScheme : themeName;
    return scheme === 'dark' ? DarkTheme : DefaultTheme;
  }, [themeName, systemScheme]);

  return (
    <Ctx.Provider value={{ themeName, setThemeName }}>
      <NavThemeProvider value={navTheme}>{children}</NavThemeProvider>
    </Ctx.Provider>
  );
};
