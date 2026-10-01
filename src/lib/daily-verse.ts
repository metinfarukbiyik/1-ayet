import corpus from '@/data/verses.json';
import { SURAHS } from '@/data/surahs';

/** 1 Ocak 2026, Fâtiha 1. ayettir. Her yerel gün bir sonraki ayete geçer. */
const EPOCH_UTC = Date.UTC(2026, 0, 1);

type Corpus = {
  counts: number[];
  juz: number[];
  tr: string[];
};

const data = corpus as Corpus;

export type DailyVerse = {
  globalNumber: number;
  total: number;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  juz: number;
  meaning: string;
};

export function verseForDate(date: Date): DailyVerse {
  const dayUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.floor((dayUtc - EPOCH_UTC) / 86_400_000);
  const total = data.tr.length;
  const index = ((days % total) + total) % total;
  return verseByIndex(index);
}

export function verseByIndex(index: number): DailyVerse {
  const total = data.tr.length;
  const safeIndex = Math.max(0, Math.min(index, total - 1));
  const located = locate(safeIndex);
  const surah = SURAHS[located.surahNumber - 1];
  const meaning = data.tr[safeIndex];

  if (!surah || meaning === undefined) {
    throw new Error(`Ayet bulunamadı: ${safeIndex}`);
  }

  return {
    globalNumber: safeIndex + 1,
    total,
    surahNumber: located.surahNumber,
    surahName: surah.name,
    ayahNumber: located.ayahNumber,
    juz: data.juz[safeIndex] ?? 1,
    meaning,
  };
}

export function getVerseBySurahAndAyah(surahNumber: number, ayahNumber: number): DailyVerse {
  let start = 0;
  for (let s = 0; s < surahNumber - 1; s++) {
    start += data.counts[s] ?? 0;
  }
  const index = start + (ayahNumber - 1);
  return verseByIndex(index);
}

export function locate(index: number): { surahNumber: number; ayahNumber: number } {
  let start = 0;

  for (let surahIndex = 0; surahIndex < data.counts.length; surahIndex++) {
    const count = data.counts[surahIndex] ?? 0;
    if (index < start + count) {
      return { surahNumber: surahIndex + 1, ayahNumber: index - start + 1 };
    }
    start += count;
  }

  throw new Error(`Ayet dizini geçersiz: ${index}`);
}

export const WEEKDAYS = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
] as const;

export const MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
] as const;

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function getDaysDifference(target: Date, base: Date): number {
  const tUtc = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const bUtc = Date.UTC(base.getFullYear(), base.getMonth(), base.getDate());
  return Math.round((tUtc - bUtc) / 86_400_000);
}

export function formatDateLabel(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} · ${WEEKDAYS[date.getDay()]}`;
}

export function formatRelativeDay(diff: number): string {
  if (diff === 0) return 'Bugün';
  if (diff === -1) return 'Dün';
  if (diff === -2) return 'Önceki gün';
  if (diff < 0) return `${Math.abs(diff)} gün önce`;
  return `${diff} gün sonra`;
}

export type RandomVerseItem = {
  verse: DailyVerse;
  date: Date;
  dateLabel: string;
  sourceDayDesc: string;
};

export function getRandomDayVerse(today: Date, excludeGlobalNumber?: number): RandomVerseItem {
  const dayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const elapsedDays = Math.floor((dayUtc - EPOCH_UTC) / 86_400_000);
  // Eğer yılın başıysa veya tek gün varsa 365 gün üzerinden rastgele seç
  const range = elapsedDays > 1 ? elapsedDays : 365;

  let tries = 0;
  let randomOffset = Math.floor(Math.random() * range);
  let randomDate = new Date(EPOCH_UTC + randomOffset * 86_400_000);
  let verse = verseForDate(randomDate);

  while (excludeGlobalNumber && verse.globalNumber === excludeGlobalNumber && tries < 15) {
    randomOffset = Math.floor(Math.random() * range);
    randomDate = new Date(EPOCH_UTC + randomOffset * 86_400_000);
    verse = verseForDate(randomDate);
    tries++;
  }

  const dateLabel = formatDateLabel(randomDate);
  const sourceDayDesc = `${randomDate.getDate()} ${MONTHS[randomDate.getMonth()]} Gününden`;

  return {
    verse,
    date: randomDate,
    dateLabel,
    sourceDayDesc,
  };
}

