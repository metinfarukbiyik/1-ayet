import {
  resolveWidgetTheme,
  type WidgetThemeConfig,
} from '@/constants/widget-themes';
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
  bgStart?: string;
  bgEnd?: string;
  accentColor?: string;
  textColor?: string;
  secondaryTextColor?: string;
  cardBgColor?: string;
  badgeBgColor?: string;
};

export function isWidgetSupported(): boolean {
  return false;
}

export function getWidgetPayloadForDate(
  date: Date,
  themeConfig?: WidgetThemeConfig
): DailyVerseWidgetProps {
  const verse = verseForDate(date);
  const prayerData = getPrayerForVerse(verse);
  const theme = themeConfig || resolveWidgetTheme('auto');

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
 * Web üzerinde native widget sistemi bulunmadığı için no-op çalışır.
 */
export function syncDailyVerseWidget(
  _daysAhead: number = 7,
  _themeConfig?: WidgetThemeConfig
): boolean {
  return false;
}

export async function syncDailyVerseWidgetAsync(
  _daysAhead: number = 7,
  _customWidgetThemeId?: string
): Promise<boolean> {
  return false;
}
