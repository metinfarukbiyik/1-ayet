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

// Web platformu için boş no-op widget nesnesi
export const DailyVerseWidget = {
  reload: () => {},
  updateTimeline: () => {},
  updateSnapshot: () => {},
  getTimeline: async () => [],
};
