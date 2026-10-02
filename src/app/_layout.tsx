import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useAppTheme } from '@/context/theme-context';
import { syncDailyVerseWidget } from '@/lib/widget-sync';

function NavigationStack() {
  const { isDark, theme } = useAppTheme();

  useEffect(() => {
    // Uygulama ilk açıldığında widget verilerini senkronize et
    syncDailyVerseWidget();

    // Uygulama her ön plana geldiğinde widget verilerini tazele
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        syncDailyVerseWidget();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'fade',
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <NavigationStack />
    </ThemeProvider>
  );
}
