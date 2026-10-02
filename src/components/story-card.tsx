import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts, type ThemePalette } from '@/constants/theme';
import type { DailyVerse } from '@/lib/daily-verse';
import type { FontSizeSetting } from '@/lib/storage';
import { getPrayerForVerse } from '@/lib/verse-prayers';

type StoryCardProps = {
  verse: DailyVerse;
  dateLabel: string;
  theme: ThemePalette;
  fontSize?: FontSizeSetting;
  width?: number;
  height?: number;
  isFriday?: boolean;
  showPrayer?: boolean;
};

// 9:16 Standart Hikaye Oranı (540 x 960 = 9:16)
const DEFAULT_STORY_WIDTH = 540;
const DEFAULT_STORY_HEIGHT = 960;

export const StoryCard = forwardRef<View, StoryCardProps>(function StoryCard(
  {
    verse,
    dateLabel,
    theme,
    fontSize = 'medium',
    width = DEFAULT_STORY_WIDTH,
    height = DEFAULT_STORY_HEIGHT,
    isFriday = false,
    showPrayer = false,
  },
  ref,
) {
  const prayerData = useMemo(() => {
    return showPrayer ? getPrayerForVerse(verse) : null;
  }, [showPrayer, verse]);

  // Ayet uzunluğu kontrolü (Taşmayı önlemek için akıllı aralık ölçekleme)
  const isVeryLong = verse.meaning.length > 220;

  // Mobil uygulamadaki font seçimine göre orantılı tipografi
  const { verseFontSize, verseLineHeight, prayerFontSize, prayerLineHeight } =
    useMemo(() => {
      if (fontSize === 'small') {
        return {
          verseFontSize: showPrayer && isVeryLong ? 17.5 : 19,
          verseLineHeight: showPrayer && isVeryLong ? 28 : 31,
          prayerFontSize: 13.5,
          prayerLineHeight: 21,
        };
      }
      if (fontSize === 'large') {
        return {
          verseFontSize: showPrayer && isVeryLong ? 22 : 25,
          verseLineHeight: showPrayer && isVeryLong ? 34 : 39,
          prayerFontSize: 16,
          prayerLineHeight: 24,
        };
      }
      // medium (varsayılan)
      return {
        verseFontSize: showPrayer && isVeryLong ? 19.5 : 22,
        verseLineHeight: showPrayer && isVeryLong ? 31 : 35,
        prayerFontSize: 14.5,
        prayerLineHeight: 22.5,
      };
    }, [fontSize, isVeryLong, showPrayer]);

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[
        styles.container,
        {
          width,
          height,
          backgroundColor: theme.background,
        },
      ]}>
      {/* 1. Üst Bilgi Çubuğu (Sol: 🌿 Bir Ayet Rozeti, Sağ: Tarih) */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.badge,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}>
          <Text style={styles.badgeEmoji}>{isFriday ? '🌸' : '🌿'}</Text>
          <Text style={[styles.badgeText, { color: theme.text }]}>
            {isFriday ? 'Bir Ayet · Cuma' : 'Bir Ayet'}
          </Text>
        </View>

        <Text style={[styles.topDate, { color: theme.textSecondary }]}>
          {dateLabel}
        </Text>
      </View>

      {/* 2. Sol Alta Yaslı Ana İçerik Gövdesi */}
      <View style={styles.bottomBlock}>
        {/* Kicker Başlık */}
        <Text style={[styles.kicker, { color: theme.accent }]}>
          {isFriday ? '🌸 CUMA GÜNÜNÜN AYETİ' : '1 Ayet - Günün Ayeti & Meal'}
        </Text>

        {/* Sure Başlığı ve Yaprak İkonu */}
        <View style={styles.surahTitleRow}>
          <Ionicons
            name="leaf-outline"
            size={22}
            color={theme.accent}
            style={styles.surahLeafIcon}
          />
          <Text
            style={[
              styles.surahTitle,
              { color: theme.text, fontFamily: Fonts.serif },
            ]}>
            {verse.surahName} Suresi
          </Text>
        </View>

        {/* Cüz ve Ayet Numarası */}
        <Text style={[styles.metaText, { color: theme.textSecondary }]}>
          {verse.juz}. Cüz · {verse.ayahNumber}. Ayet
        </Text>

        {/* Ayet Meali */}
        <Text
          style={[
            styles.verseMeaning,
            {
              color: theme.text,
              fontFamily: Fonts.serif,
              fontSize: verseFontSize,
              lineHeight: verseLineHeight,
            },
          ]}>
          {`“${verse.meaning}”`}
        </Text>

        {/* Ayetin Duası & Tefekkür Bölümü (Yalnızca açıksa gösterilir) */}
        {showPrayer && prayerData && (
          <View
            style={[
              styles.prayerBox,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
              },
            ]}>
            {/* Şık ve Hizalı Tek Satır Başlık */}
            <View style={styles.prayerHeader}>
              <Text style={styles.prayerEmoji}>🤲</Text>
              <Text
                numberOfLines={1}
                style={[styles.prayerKicker, { color: theme.accent }]}>
                AYETİN DUASI & TEFEKKÜR
                <Text style={[styles.prayerDot, { color: theme.textSecondary }]}>
                  {' '}·{' '}
                </Text>
                <Text style={[styles.prayerTheme, { color: theme.textSecondary }]}>
                  {prayerData.theme.toUpperCase()}
                </Text>
              </Text>
            </View>

            {/* Dua Metni */}
            <Text
              style={[
                styles.prayerText,
                {
                  color: theme.text,
                  fontFamily: Fonts.serif,
                  fontSize: prayerFontSize,
                  lineHeight: prayerLineHeight,
                },
              ]}>
              &ldquo;{prayerData.prayer}&rdquo;
            </Text>
          </View>
        )}

        {/* Alt Vurgu Çizgisi (Sadece tefekkür kapalıysa gösterilir) */}
        {!showPrayer && (
          <View style={[styles.accentLine, { backgroundColor: theme.border }]} />
        )}

        {/* Kaynak Alt Bilgisi */}
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Diyanet İşleri Meali
          </Text>
          <Text style={[styles.footerDot, { color: theme.textSecondary }]}>·</Text>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Kur&apos;an-ı Kerim
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingHorizontal: 36,
    paddingTop: 48,
    paddingBottom: 40,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeEmoji: {
    fontSize: 13,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  topDate: {
    fontSize: 13,
    fontWeight: '500',
  },
  bottomBlock: {
    alignItems: 'flex-start',
    width: '100%',
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 0.6,
    fontWeight: '700',
    textAlign: 'left',
    marginBottom: 8,
  },
  surahTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  surahLeafIcon: {
    marginTop: 1,
  },
  surahTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    textAlign: 'left',
  },
  metaText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'left',
  },
  verseMeaning: {
    textAlign: 'left',
    letterSpacing: 0.2,
    marginBottom: 16,
  },
  prayerBox: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 20,
    gap: 8,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  prayerEmoji: {
    fontSize: 15,
  },
  prayerKicker: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  prayerDot: {
    fontWeight: '400',
  },
  prayerTheme: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  prayerText: {
    fontStyle: 'italic',
  },
  accentLine: {
    width: 48,
    height: 2,
    borderRadius: 1,
    marginBottom: 18,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  footerText: {
    fontSize: 12,
  },
  footerDot: {
    fontSize: 12,
  },
});
