import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

import {
  resolveWidgetTheme,
  type WidgetThemeConfig,
} from '@/constants/widget-themes';
import { formatDateLabel, verseForDate } from '@/lib/daily-verse';
import { getStoredThemeId, getStoredWidgetThemeId } from '@/lib/storage';
import { getPrayerForVerse } from '@/lib/verse-prayers';
import type { DailyVerseWidgetProps } from '@/widgets/daily-verse-widget';

export type { DailyVerseWidgetProps };

let cachedWidgetTheme: WidgetThemeConfig = resolveWidgetTheme('auto');

export function isWidgetSupported(): boolean {
  if (Platform.OS === 'web') return false;
  try {
    return requireOptionalNativeModule('ExpoWidgets') != null;
  } catch {
    return false;
  }
}

export function getWidgetPayloadForDate(
  date: Date,
  themeConfig?: WidgetThemeConfig
): DailyVerseWidgetProps {
  const verse = verseForDate(date);
  const prayerData = getPrayerForVerse(verse);
  const theme = themeConfig || cachedWidgetTheme;

  return {
    surahName: verse.surahName,
    surahNumber: verse.surahNumber,
    ayahNumber: verse.ayahNumber,
    juz: verse.juz,
    meaning: verse.meaning,
    dateLabel: formatDateLabel(date),
    isFriday: date.getDay() === 5,
    prayer: prayerData.prayer,
    prayerTheme: prayerData.theme,
    bgStart: theme.bgStart,
    bgEnd: theme.bgEnd,
    accentColor: theme.accentColor,
    textColor: theme.textColor,
    secondaryTextColor: theme.secondaryTextColor,
    cardBgColor: theme.cardBgColor,
    badgeBgColor: theme.badgeBgColor,
  };
}

/**
 * Günün ayetini ve önümüzdeki günlerin zaman çizelgesini (timeline)
 * seçilen renk paletiyle ana ekran widget'ına aktarır.
 */
export function syncDailyVerseWidget(
  daysAhead: number = 7,
  themeConfig?: WidgetThemeConfig
): boolean {
  if (!isWidgetSupported()) {
    return false;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const widgetModule = require('@/widgets/daily-verse-widget');
    const DailyVerseWidget = widgetModule?.DailyVerseWidget;
    if (!DailyVerseWidget) {
      return false;
    }

    if (themeConfig) {
      cachedWidgetTheme = themeConfig;
    }

    const today = new Date();
    const todayPayload = getWidgetPayloadForDate(today, themeConfig);

    // Anlık snapshot güncellemesi
    DailyVerseWidget.updateSnapshot(todayPayload);

    // Önümüzdeki günlerin timeline zamanlaması
    const entries: { date: Date; props: DailyVerseWidgetProps }[] = [
      {
        date: today,
        props: todayPayload,
      },
    ];

    for (let i = 1; i <= daysAhead; i++) {
      const futureDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + i,
        0,
        0,
        5 // Her gece yarısı 00:00:05'te yeni güne geçiş
      );

      entries.push({
        date: futureDate,
        props: getWidgetPayloadForDate(futureDate, themeConfig),
      });
    }

    DailyVerseWidget.updateTimeline(entries);
    return true;
  } catch (error) {
    console.log('[WidgetSync] Widget timeline güncellenemedi:', error);
    return false;
  }
}

/**
 * Kayıtlı kullanıcı temasını AsyncStorage'dan okuyup widget'ı senkronize eder.
 */
export async function syncDailyVerseWidgetAsync(
  daysAhead: number = 7,
  customWidgetThemeId?: string
): Promise<boolean> {
  try {
    const widgetThemeId = customWidgetThemeId || (await getStoredWidgetThemeId());
    const appThemeId = await getStoredThemeId();
    const config = resolveWidgetTheme(widgetThemeId, appThemeId);
    cachedWidgetTheme = config;
    return syncDailyVerseWidget(daysAhead, config);
  } catch (error) {
    console.log('[WidgetSyncAsync] Hata:', error);
    return false;
  }
}
