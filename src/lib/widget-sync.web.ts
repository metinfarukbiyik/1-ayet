import { formatDateLabel, verseForDate } from '@/lib/daily-verse';
import { getPrayerForVerse } from '@/lib/verse-prayers';

export type DailyVerseWidgetProps = {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  juz: number;
  meaning: string;
  dateLabel: string;
  isFriday: boolean;
  prayer: string;
  prayerTheme: string;
};

export function isWidgetSupported(): boolean {
  return false;
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
 * Web üzerinde native widget sistemi bulunmadığı için no-op çalışır.
 */
export function syncDailyVerseWidget(_daysAhead: number = 7): boolean {
  return false;
}
