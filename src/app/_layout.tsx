import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useAppTheme } from '@/context/theme-context';
import { initNotifications, scheduleDailyVerseNotification } from '@/lib/notifications';
import { getNotificationSettings } from '@/lib/storage';
import { syncDailyVerseWidgetAsync } from '@/lib/widget-sync';

function NavigationStack() {
  const { isDark, theme } = useAppTheme();

  useEffect(() => {
    // Bildirim altyapısını başlat
    initNotifications().then(async () => {
      const settings = await getNotificationSettings();
      if (settings.enabled) {
        await scheduleDailyVerseNotification(settings.hour, settings.minute);
      }
    });

    // Uygulama ilk açıldığında widget verilerini senkronize et
    syncDailyVerseWidgetAsync();

    // Uygulama her ön plana geldiğinde widget verilerini tazele
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        syncDailyVerseWidgetAsync();
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
