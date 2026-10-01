import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DailyVerse } from '@/lib/daily-verse';

const SAVED_VERSES_KEY = '@1ayet_saved_verses_v1';
const THEME_MODE_KEY = '@1ayet_theme_mode_v1';
const FONT_SIZE_KEY = '@1ayet_font_size_v1';
const VERSE_NOTES_KEY = '@1ayet_verse_notes_v1';
const NOTIFICATION_SETTINGS_KEY = '@1ayet_notification_settings_v1';

export type FontSizeSetting = 'small' | 'medium' | 'large';

export type VerseNote = {
  verseId: string; // "surahNumber:ayahNumber"
  note: string;
  updatedAt: number;
};

export type NotificationSettings = {
  enabled: boolean;
  hour: number;
  minute: number;
};

export type ThemeId =
  | 'system'
  | 'parchment'
  | 'night'
  | 'emerald'
  | 'sapphire'
  | 'terracotta'
  | 'sage'
  | 'rose'
  | 'light'
  | 'dark';

export type SavedVerse = {
  id: string;
  globalNumber: number;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  juz: number;
  meaning: string;
  savedAt: number;
};

export function getVerseKey(surahNumber: number, ayahNumber: number): string {
  return `${surahNumber}:${ayahNumber}`;
}

export async function getSavedVerses(): Promise<SavedVerse[]> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_VERSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Kayıtlı ayetler yüklenirken hata oluştu:', error);
    return [];
  }
}

export async function isVerseSaved(surahNumber: number, ayahNumber: number): Promise<boolean> {
  const verses = await getSavedVerses();
  const id = getVerseKey(surahNumber, ayahNumber);
  return verses.some((v) => v.id === id);
}

export async function toggleSaveVerse(verse: DailyVerse): Promise<{ saved: boolean; verses: SavedVerse[] }> {
  const current = await getSavedVerses();
  const id = getVerseKey(verse.surahNumber, verse.ayahNumber);
  const exists = current.some((v) => v.id === id);

  let updated: SavedVerse[];
  if (exists) {
    updated = current.filter((v) => v.id !== id);
  } else {
    const newEntry: SavedVerse = {
      id,
      globalNumber: verse.globalNumber,
      surahNumber: verse.surahNumber,
      surahName: verse.surahName,
      ayahNumber: verse.ayahNumber,
      juz: verse.juz,
      meaning: verse.meaning,
      savedAt: Date.now(),
    };
    updated = [newEntry, ...current];
  }

  await AsyncStorage.setItem(SAVED_VERSES_KEY, JSON.stringify(updated));
  return { saved: !exists, verses: updated };
}

export async function removeSavedVerse(id: string): Promise<SavedVerse[]> {
  const current = await getSavedVerses();
  const updated = current.filter((v) => v.id !== id);
  await AsyncStorage.setItem(SAVED_VERSES_KEY, JSON.stringify(updated));
  return updated;
}

export async function getStoredThemeId(): Promise<ThemeId> {
  try {
    const raw = (await AsyncStorage.getItem(THEME_MODE_KEY)) as ThemeId | null;
    if (raw) return raw;
  } catch (error) {
    console.error('Tema tercihi yüklenirken hata oluştu:', error);
  }
  return 'system';
}

export async function setStoredThemeId(themeId: ThemeId): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_MODE_KEY, themeId);
  } catch (error) {
    console.error('Tema tercihi kaydedilirken hata oluştu:', error);
  }
}

export async function getStoredFontSize(): Promise<FontSizeSetting> {
  try {
    const raw = (await AsyncStorage.getItem(FONT_SIZE_KEY)) as FontSizeSetting | null;
    if (raw === 'small' || raw === 'medium' || raw === 'large') {
      return raw;
    }
  } catch (error) {
    console.error('Yazı boyutu tercihi yüklenirken hata oluştu:', error);
  }
  return 'medium';
}

export async function setStoredFontSize(size: FontSizeSetting): Promise<void> {
  try {
    await AsyncStorage.setItem(FONT_SIZE_KEY, size);
  } catch (error) {
    console.error('Yazı boyutu tercihi kaydedilirken hata oluştu:', error);
  }
}

/* ==================== AYET NOTLARI & TEFEKKÜR ==================== */

export async function getAllVerseNotes(): Promise<Record<string, VerseNote>> {
  try {
    const raw = await AsyncStorage.getItem(VERSE_NOTES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (error) {
    console.error('Notlar yüklenirken hata oluştu:', error);
    return {};
  }
}

export async function getVerseNote(surahNumber: number, ayahNumber: number): Promise<string> {
  const notes = await getAllVerseNotes();
  const id = getVerseKey(surahNumber, ayahNumber);
  return notes[id]?.note ?? '';
}

export async function saveVerseNote(
  surahNumber: number,
  ayahNumber: number,
  noteText: string
): Promise<void> {
  try {
    const notes = await getAllVerseNotes();
    const id = getVerseKey(surahNumber, ayahNumber);
    const trimmed = noteText.trim();

    if (!trimmed) {
      delete notes[id];
    } else {
      notes[id] = {
        verseId: id,
        note: trimmed,
        updatedAt: Date.now(),
      };
    }

    await AsyncStorage.setItem(VERSE_NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Not kaydedilirken hata oluştu:', error);
  }
}

/* ==================== GÜNLÜK BİLDİRİM AYARLARI ==================== */

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (!raw) {
      return { enabled: false, hour: 9, minute: 0 };
    }
    const parsed = JSON.parse(raw);
    return {
      enabled: Boolean(parsed.enabled),
      hour: typeof parsed.hour === 'number' ? parsed.hour : 9,
      minute: typeof parsed.minute === 'number' ? parsed.minute : 0,
    };
  } catch (error) {
    console.error('Bildirim ayarları yüklenirken hata oluştu:', error);
    return { enabled: false, hour: 9, minute: 0 };
  }
}

export async function setNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Bildirim ayarları kaydedilirken hata oluştu:', error);
  }
}

/** Geriye dönük uyumluluk için aliaslar */
export type ThemeMode = ThemeId;
export const getStoredThemeMode = getStoredThemeId;
export const setStoredThemeMode = setStoredThemeId;
