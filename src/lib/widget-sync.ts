import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

import { formatDateLabel, verseForDate } from '@/lib/daily-verse';
import { getPrayerForVerse } from '@/lib/verse-prayers';
import type { DailyVerseWidgetProps } from '@/widgets/daily-verse-widget';

export type { DailyVerseWidgetProps };

export function isWidgetSupported(): boolean {
  if (Platform.OS === 'web') return false;
  try {
    return requireOptionalNativeModule('ExpoWidgets') != null;
  } catch {
    return false;
  }
}

export function getWidgetPayloadForDate(date: Date): DailyVerseWidgetProps {
  const verse = verseForDate(date);
  const prayerData = getPrayerForVerse(verse);

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
  };
}

/**
 * Günün ayetini ve önümüzdeki günlerin zaman çizelgesini (timeline)
 * ana ekran widget'ına senkronize eder.
 *
 * Expo Go veya Web gibi native modülün bulunmadığı ortamlarda
 * uygulamanın çökmemesi için korumalı (graceful) çalışır.
 */
export function syncDailyVerseWidget(daysAhead: number = 7): boolean {
  if (!isWidgetSupported()) {
    return false;
  }

  try {
    // Native modül yalnızca mevcut olduğunda dinamik yüklenir
    // (Böylece Expo Go veya Web ortamında import zamanı hataları önlenir)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const widgetModule = require('@/widgets/daily-verse-widget');
    const DailyVerseWidget = widgetModule?.DailyVerseWidget;
    if (!DailyVerseWidget) {
      return false;
    }

    const today = new Date();
    const todayPayload = getWidgetPayloadForDate(today);

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
        props: getWidgetPayloadForDate(futureDate),
      });
    }

    DailyVerseWidget.updateTimeline(entries);
    return true;
  } catch (error) {
    console.log('[WidgetSync] Widget timeline güncellenemedi:', error);
    return false;
  }
}
