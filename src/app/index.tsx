import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type GestureResponderEvent,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KehfModal } from '@/components/kehf-modal';
import { SavedModal } from '@/components/saved-modal';
import { SettingsModal } from '@/components/settings-modal';
import { ShareModal } from '@/components/share-modal';
import { StoryCard } from '@/components/story-card';
import { VerseNoteModal } from '@/components/verse-note-modal';
import { VersePrayerCard } from '@/components/verse-prayer-card';
import { Fonts, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  formatDateLabel,
  getRandomDayVerse,
  getVerseBySurahAndAyah,
  verseByIndex,
  verseForDate,
  type DailyVerse,
  type RandomVerseItem,
} from '@/lib/daily-verse';
import {
  getSavedVerses,
  getStoredFontSize,
  getVerseNote,
  isVerseSaved,
  removeSavedVerse,
  setStoredFontSize,
  toggleSaveVerse,
  type FontSizeSetting,
  type SavedVerse,
} from '@/lib/storage';
import { syncDailyVerseWidgetAsync } from '@/lib/widget-sync';

type ActiveSlot = 'today' | 'previous' | 'saved';

export default function HomeScreen() {
  const theme = useTheme();
  const storyCardRef = useRef<View>(null);
  const mainScrollRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams<{ openPrayer?: string }>();

  // Bugün ve Günün Ayeti (1. Ayet)
  const today = useMemo(() => new Date(), []);
  const todayVerse = useMemo(() => verseForDate(today), [today]);
  const todayDateLabel = useMemo(() => formatDateLabel(today), [today]);

  // Önceki Ayet: Rastgele herhangi bir günün ayeti (2. Ayet)
  const [randomItem, setRandomItem] = useState<RandomVerseItem>(() =>
    getRandomDayVerse(today, todayVerse.globalNumber)
  );

  // Aktif Slot: 'today' (1/2) veya 'previous' (2/2) veya 'saved'
  const [activeSlot, setActiveSlot] = useState<ActiveSlot>('today');
  const [savedActiveVerse, setSavedActiveVerse] = useState<DailyVerse | null>(null);

  // Yazı Boyutu Tercihi
  const [fontSize, setFontSize] = useState<FontSizeSetting>('medium');

  // Ayetin Duası & Tefekkür Kartı Açık mı?
  const [prayerExpanded, setPrayerExpanded] = useState(false);

  // Hızlı Kopyalama Durumu
  const [copiedActive, setCopiedActive] = useState(false);

  // Modallar
  const [shareVisible, setShareVisible] = useState(false);
  const [savedVisible, setSavedVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [noteVisible, setNoteVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState('');

  // Cuma Günü Etkinliği
  const isFriday = today.getDay() === 5;
  const [fridayBannerVisible, setFridayBannerVisible] = useState(true);
  const [kehfModalVisible, setKehfModalVisible] = useState(false);

  // Kayıtlı ayetler listesi
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const [isCurrentSaved, setIsCurrentSaved] = useState(false);

  // Yatay Kaydırma (Swipe) Algılayıcıları
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Aktif Ayet ve Tarih Etiketi
  const activeVerse: DailyVerse =
    activeSlot === 'saved' && savedActiveVerse
      ? savedActiveVerse
      : activeSlot === 'previous'
      ? randomItem.verse
      : todayVerse;

  const activeDateLabel: string =
    activeSlot === 'saved'
      ? 'KAYITLI AYET'
      : activeSlot === 'previous'
      ? randomItem.dateLabel
      : todayDateLabel;

  // Başlangıçta kayıtlı ayetleri ve yazı boyutu tercihini yükle, widget'ı senkronize et
  useEffect(() => {
    let mounted = true;
    getSavedVerses().then((verses) => {
      if (mounted) setSavedVerses(verses);
    });
    getStoredFontSize().then((size) => {
      if (mounted) setFontSize(size);
    });

    // Ana ekran widget verilerini otomatik senkronize et
    syncDailyVerseWidgetAsync();

    return () => {
      mounted = false;
    };
  }, []);

  // Widget veya Deep Link ile doğrudan Ayetin Duası açıldığında
  useEffect(() => {
    if (params.openPrayer === 'true' || params.openPrayer === '1') {
      const timer = setTimeout(() => {
        setActiveSlot('today');
        setPrayerExpanded(true);
        mainScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [params.openPrayer]);

  // Arka plandan veya soğuk başlangıçtan gelen deep linkleri dinle
  useEffect(() => {
    const handleDeepLink = (url: string | null) => {
      if (!url) return;
      if (
        url.includes('openPrayer=true') ||
        url.includes('openPrayer=1') ||
        url.includes('//prayer')
      ) {
        setActiveSlot('today');
        setPrayerExpanded(true);
        setTimeout(() => {
          mainScrollRef.current?.scrollToEnd({ animated: true });
        }, 350);
      } else if (url.includes('birayet://') || url.includes('1ayet://')) {
        setActiveSlot('today');
      }
    };

    Linking.getInitialURL().then(handleDeepLink);
    const sub = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      sub.remove();
    };
  }, []);

  // Aktif ayet değiştikçe kaydedilmiş mi kontrol et ve notunu yükle
  useEffect(() => {
    let mounted = true;
    isVerseSaved(activeVerse.surahNumber, activeVerse.ayahNumber).then((saved) => {
      if (mounted) {
        setIsCurrentSaved(saved);
      }
    });
    getVerseNote(activeVerse.surahNumber, activeVerse.ayahNumber).then((note) => {
      if (mounted) {
        setCurrentNote(note);
      }
    });
    return () => {
      mounted = false;
    };
  }, [activeVerse]);

  // Yazı boyutu değiştirme
  const handleSelectFontSize = async (size: FontSizeSetting) => {
    setFontSize(size);
    await setStoredFontSize(size);
  };

  // Yeni bir rastgele ayet çekme
  const handleRefreshRandom = () => {
    const nextRandom = getRandomDayVerse(today, activeVerse.globalNumber);
    setRandomItem(nextRandom);
    setActiveSlot('previous');
  };

  // Ayet Meali Kopyalama
  const handleCopyVerse = async () => {
    const textToCopy = `“${activeVerse.meaning}”\n\n— ${activeVerse.surahName} Suresi, ${activeVerse.ayahNumber}. Ayet (${activeVerse.juz}. Cüz)`;
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        try {
          const textarea = document.createElement('textarea');
          textarea.value = textToCopy;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        } catch {
          await Clipboard.setStringAsync(textToCopy);
        }
      } else {
        await Clipboard.setStringAsync(textToCopy);
      }
      setCopiedActive(true);
      setTimeout(() => setCopiedActive(false), 2500);
    } catch {
      // Hata durumunda sessizce geç
    }
  };

  // Cuma Tebriki ve Ayeti Paylaşma
  const handleShareFridayGreeting = async () => {
    const text = `🌸 Hayırlı Cumalar 🌿\n\n“${activeVerse.meaning}”\n\n— ${activeVerse.surahName} Suresi, ${activeVerse.ayahNumber}. Ayet (${activeVerse.juz}. Cüz)\n\nCumanız mübarek, dualarınız kabul olsun. · 1 Ayet`;
    try {
      await Share.share({
        message: text,
        title: 'Hayırlı Cumalar - 1 Ayet',
      });
    } catch {
      // Hata durumunda sessizce geç
    }
  };

  // Kehf Suresi 1. Ayetine Hızlı Geçiş
  const handleOpenKehfSurah = () => {
    try {
      const kehfVerse = getVerseBySurahAndAyah(18, 1);
      setSavedActiveVerse(kehfVerse);
      setActiveSlot('saved');
    } catch {
      // Hata durumunda sessizce geç
    }
  };

  // Cum'a Suresi 9. Ayetine Hızlı Geçiş
  const handleOpenJumaSurah = () => {
    try {
      const jumaVerse = getVerseBySurahAndAyah(62, 9);
      setSavedActiveVerse(jumaVerse);
      setActiveSlot('saved');
    } catch {
      // Hata durumunda sessizce geç
    }
  };

  const handleToggleSave = async () => {
    const result = await toggleSaveVerse(activeVerse);
    setIsCurrentSaved(result.saved);
    setSavedVerses(result.verses);
  };

  const handleRemoveSaved = async (id: string) => {
    const updated = await removeSavedVerse(id);
    setSavedVerses(updated);
    if (activeVerse && `${activeVerse.surahNumber}:${activeVerse.ayahNumber}` === id) {
      setIsCurrentSaved(false);
    }
  };

  const handleSelectSavedVerse = (saved: SavedVerse) => {
    const full = verseByIndex(saved.globalNumber - 1);
    setSavedActiveVerse(full);
    setActiveSlot('saved');
  };

  // Yatay Kaydırma (Swipe) Algılayıcıları
  const handleTouchStart = (e: GestureResponderEvent) => {
    const touch = e.nativeEvent;
    touchStartRef.current = { x: touch.pageX, y: touch.pageY };
  };

  const handleTouchEnd = (e: GestureResponderEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.nativeEvent;
    const dx = touch.pageX - touchStartRef.current.x;
    const dy = touch.pageY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Yatay kaydırma belirginse 2 ayet arasında geçiş yap
    if (Math.abs(dx) > 50 && Math.abs(dy) < 60) {
      if (dx > 0) {
        // Sağa kaydırma -> Günün Ayeti'ne geç
        setActiveSlot('today');
      } else {
        // Sola kaydırma -> Önceki Ayet'e (Rastgele) geç
        setActiveSlot('previous');
      }
    }
  };

  // Font boyutuna göre stil değerleri
  const meaningFontSize = fontSize === 'small' ? 18 : fontSize === 'large' ? 25 : 21;
  const meaningLineHeight = fontSize === 'small' ? 29 : fontSize === 'large' ? 40 : 34;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={['top', 'bottom']}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}>
      {/* Üst Navigasyon Çubuğu */}
      <View style={styles.topBar}>
        {/* Sol Taraf: 2 Ayet Arasında Geçiş Segmenti (Maksimum 2 Ayet) */}
        <View style={styles.slotSwitcher}>
          <Pressable
            hitSlop={4}
            style={[
              styles.slotBtn,
              {
                backgroundColor: activeSlot === 'today' ? theme.accent : 'transparent',
              },
            ]}
            onPress={() => setActiveSlot('today')}>
            <Text
              style={[
                styles.slotBtnText,
                {
                  color: activeSlot === 'today' ? theme.accentContrast : theme.textSecondary,
                  fontWeight: activeSlot === 'today' ? '700' : '500',
                },
              ]}>
              Günün Ayeti
            </Text>
          </Pressable>

          <Pressable
            hitSlop={4}
            style={[
              styles.slotBtn,
              {
                backgroundColor: activeSlot === 'previous' ? theme.accent : 'transparent',
              },
            ]}
            onPress={() => setActiveSlot('previous')}>
            <Text
              style={[
                styles.slotBtnText,
                {
                  color: activeSlot === 'previous' ? theme.accentContrast : theme.textSecondary,
                  fontWeight: activeSlot === 'previous' ? '700' : '500',
                },
              ]}>
              Önceki Ayet
            </Text>
          </Pressable>
        </View>

        {/* Sağ Üst Aksiyonlar: Kaydedilenler & Ayarlar */}
        <View style={styles.topActions}>
          {/* Kaydedilenler Butonu */}
          <Pressable
            hitSlop={8}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: theme.card, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
            onPress={() => setSavedVisible(true)}>
            <Ionicons name="bookmark-outline" size={19} color={theme.text} />
            {savedVerses.length > 0 && (
              <View style={[styles.badgeDot, { backgroundColor: theme.accent }]} />
            )}
          </Pressable>

          {/* Ayarlar Butonu */}
          <Pressable
            hitSlop={8}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: theme.card, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
            onPress={() => setSettingsVisible(true)}>
            <Ionicons name="settings-outline" size={19} color={theme.text} />
          </Pressable>
        </View>
      </View>

      {/* Tarih ve Gösterge Çubuğu */}
      <View style={styles.subHeader}>
        <View style={styles.subHeaderLeft}>
          <Text
            style={[styles.dateText, { color: theme.textSecondary }]}
            numberOfLines={1}>
            {activeDateLabel.toLocaleUpperCase('tr-TR')}
          </Text>
        </View>

        {/* 2 Ayet Sayfa Noktaları (1/2 ve 2/2) veya Rastgele Yenile */}
        {activeSlot === 'previous' ? (
          <Pressable
            hitSlop={6}
            style={({ pressed }) => [
              styles.refreshRandomBtn,
              { backgroundColor: theme.card, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
            onPress={handleRefreshRandom}>
            <Ionicons name="shuffle" size={14} color={theme.accent} />
            <Text style={[styles.refreshRandomText, { color: theme.accent }]}>Farklı Ayet</Text>
          </Pressable>
        ) : activeSlot === 'saved' ? (
          <Pressable
            hitSlop={6}
            style={styles.returnTodayBtn}
            onPress={() => setActiveSlot('today')}>
            <Ionicons name="arrow-back" size={13} color={theme.accent} />
            <Text style={[styles.returnTodayText, { color: theme.accent }]}>Bugüne Dön</Text>
          </Pressable>
        ) : (
          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.dotActive, { backgroundColor: theme.accent }]} />
            <View style={[styles.dot, { backgroundColor: theme.border }]} />
          </View>
        )}
      </View>

      {/* Ana Gövde: Sol Alta Yaslı Tasarım */}
      <ScrollView
        ref={mainScrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <View style={styles.bottomLeftBlock}>
            {/* Cuma Gününe Özel Tebrik & Karşılama Kartı */}
            {isFriday && fridayBannerVisible && (
              <View
                style={[
                  styles.fridayBanner,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}>
                <View style={styles.fridayBannerTop}>
                  <View style={styles.fridayBadge}>
                    <Text style={styles.fridayFlowerEmoji}>🌸</Text>
                    <Text style={[styles.fridayBadgeTitle, { color: theme.text }]}>
                      Hayırlı Cumalar
                    </Text>
                    <Text style={styles.fridayLeafEmoji}>🌿</Text>
                  </View>
                  <Pressable
                    hitSlop={8}
                    style={styles.fridayCloseBtn}
                    onPress={() => setFridayBannerVisible(false)}>
                    <Ionicons name="close" size={16} color={theme.textSecondary} />
                  </Pressable>
                </View>

                <Text style={[styles.fridayMessage, { color: theme.textSecondary }]}>
                  Cumanız mübarek, dualarınız kabul olsun. Günün bereketi için Kehf ve Cum&apos;a surelerini okuyabilir, sevdiklerinizle Cuma tebriki paylaşabilirsiniz.
                </Text>

                <View style={styles.fridayActionsRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.fridayActionPill,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      pressed && styles.pressed,
                    ]}
                    onPress={handleShareFridayGreeting}>
                    <Ionicons name="paper-plane-outline" size={14} color={theme.accent} />
                    <Text style={[styles.fridayActionPillText, { color: theme.accent, fontWeight: '600' }]}>
                      Cuma Tebriki Paylaş
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Kicker Başlıkçık */}
            <View style={styles.kickerRow}>
              <Text style={[styles.kicker, { color: theme.accent }]}>
                {activeSlot === 'saved'
                  ? 'KAYITLI AYET'
                  : activeSlot === 'previous'
                  ? 'ÖNCEKİ AYET · RASTGELE'
                  : isFriday
                  ? '🌸 CUMA GÜNÜNÜN AYETİ'
                  : '1 Ayet - Günün Ayeti & Meal'}
              </Text>
            </View>

            {/* Sure Adı (Sola yaslı, büyük serif ve yaprak ikonu) */}
            <View style={styles.surahTitleRow}>
              <Ionicons
                name="leaf-outline"
                size={22}
                color={theme.accent}
                style={styles.surahLeafIcon}
              />
              <Text
                accessibilityRole="header"
                style={[styles.surahTitle, { color: theme.text, fontFamily: Fonts.serif }]}>
                {activeVerse.surahName} Suresi
              </Text>
            </View>

            {/* Cüz ve Sure İçi Ayet Numarası */}
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
              {activeVerse.juz}. Cüz · {activeVerse.ayahNumber}. Ayet
            </Text>

            {/* Ayet Meali (Dinamik Yazı Boyutu ile) */}
            <Text
              selectable
              style={[
                styles.verseMeaning,
                {
                  color: theme.text,
                  fontFamily: Fonts.serif,
                  fontSize: meaningFontSize,
                  lineHeight: meaningLineHeight,
                },
              ]}>
              {`“${activeVerse.meaning}”`}
            </Text>

            {/* Varsa Eklenen Tefekkür Notu Önizlemesi */}
            {currentNote.trim().length > 0 && (
              <Pressable
                style={({ pressed }) => [
                  styles.activeNotePreview,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                  pressed && styles.pressed,
                ]}
                onPress={() => setNoteVisible(true)}>
                <View style={styles.activeNoteHeader}>
                  <Ionicons name="journal" size={14} color={theme.accent} />
                  <Text style={[styles.activeNoteTitle, { color: theme.accent }]}>
                    Tefekkür Notunuz
                  </Text>
                </View>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.activeNoteText,
                    { color: theme.textSecondary, fontFamily: Fonts.serif },
                  ]}>
                  {currentNote}
                </Text>
              </Pressable>
            )}

            {/* Ayetin Duası & Tefekkür Damlası */}
            <VersePrayerCard
              verse={activeVerse}
              theme={theme}
              isExpanded={prayerExpanded}
              onToggleExpand={() => setPrayerExpanded((prev) => !prev)}
            />

            {/* Alt Vurgu Çizgisi */}
            <View style={[styles.accentLine, { backgroundColor: theme.border }]} />

            {/* Eylem Butonları: Sürgülü / Yatay Kaydırılabilir Çubuk */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              bounces={true}
              overScrollMode="never"
              style={styles.actionRowScroll}
              contentContainerStyle={styles.actionRowContent}
              onTouchStart={(e) => {
                e.stopPropagation?.();
                touchStartRef.current = null;
              }}
              onTouchEnd={(e) => {
                e.stopPropagation?.();
                touchStartRef.current = null;
              }}>
              {/* Not Al / Tefekkür Butonu */}
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  {
                    backgroundColor: currentNote.trim().length > 0 ? theme.border : theme.card,
                    borderColor:
                      currentNote.trim().length > 0 ? theme.accent : theme.cardBorder,
                  },
                  pressed && styles.pressed,
                ]}
                onPress={() => setNoteVisible(true)}>
                <Ionicons
                  name={currentNote.trim().length > 0 ? 'journal' : 'journal-outline'}
                  size={18}
                  color={currentNote.trim().length > 0 ? theme.accent : theme.text}
                />
                <Text
                  style={[
                    styles.actionBtnText,
                    {
                      color: currentNote.trim().length > 0 ? theme.accent : theme.text,
                    },
                  ]}>
                  {currentNote.trim().length > 0 ? 'Notunuz' : 'Not Al'}
                </Text>
              </Pressable>

              {/* Kaydet Butonu */}
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  {
                    backgroundColor: isCurrentSaved ? theme.accent : theme.card,
                    borderColor: isCurrentSaved ? theme.accent : theme.cardBorder,
                  },
                  pressed && styles.pressed,
                ]}
                onPress={handleToggleSave}>
                <Ionicons
                  name={isCurrentSaved ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={isCurrentSaved ? theme.accentContrast : theme.text}
                />
                <Text
                  style={[
                    styles.actionBtnText,
                    {
                      color: isCurrentSaved ? theme.accentContrast : theme.text,
                    },
                  ]}>
                  {isCurrentSaved ? 'Kaydedildi' : 'Kaydet'}
                </Text>
              </Pressable>

              {/* Paylaş Butonu */}
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                  pressed && styles.pressed,
                ]}
                onPress={() => setShareVisible(true)}>
                <Ionicons name="share-outline" size={18} color={theme.text} />
                <Text style={[styles.actionBtnText, { color: theme.text }]}>Paylaş</Text>
              </Pressable>

              {/* Hızlı Kopyala Butonu (Harici Özellik) */}
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  {
                    backgroundColor: copiedActive ? theme.border : theme.card,
                    borderColor: copiedActive ? theme.accent : theme.cardBorder,
                  },
                  pressed && styles.pressed,
                ]}
                onPress={handleCopyVerse}>
                <Ionicons
                  name={copiedActive ? 'checkmark-circle' : 'copy-outline'}
                  size={18}
                  color={copiedActive ? theme.accent : theme.text}
                />
                <Text
                  style={[
                    styles.actionBtnText,
                    { color: copiedActive ? theme.accent : theme.text },
                  ]}>
                  {copiedActive ? 'Kopyalandı' : 'Kopyala'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Ekran Dışı 9:16 Hikaye Kartı */}
      <View style={styles.offscreenCapture}>
        <StoryCard
          ref={storyCardRef}
          verse={activeVerse}
          dateLabel={activeDateLabel}
          theme={theme}
          fontSize={fontSize}
          isFriday={isFriday}
          showPrayer={prayerExpanded}
        />
      </View>

      {/* Paylaş Modal */}
      <ShareModal
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        verse={activeVerse}
        dateLabel={activeDateLabel}
        theme={theme}
        storyCardRef={storyCardRef}
        isFriday={isFriday}
      />

      {/* Kaydedilenler Modal */}
      <SavedModal
        visible={savedVisible}
        onClose={() => setSavedVisible(false)}
        savedVerses={savedVerses}
        onRemove={handleRemoveSaved}
        onSelectVerse={handleSelectSavedVerse}
        theme={theme}
      />

      {/* Ayarlar Modal (Temalar & Yazı Boyutu & Geliştirici) */}
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        theme={theme}
        fontSize={fontSize}
        onSelectFontSize={handleSelectFontSize}
      />

      {/* Tefekkür & Ayet Notu Modal */}
      <VerseNoteModal
        visible={noteVisible}
        onClose={() => setNoteVisible(false)}
        verse={activeVerse}
        theme={theme}
        onNoteSaved={(hasNote) => {
          if (!hasNote) {
            setCurrentNote('');
          } else {
            getVerseNote(activeVerse.surahNumber, activeVerse.ayahNumber).then(setCurrentNote);
          }
        }}
      />

      {/* Cuma & Kehf Suresi Fazileti Modal */}
      <KehfModal
        visible={kehfModalVisible}
        onClose={() => setKehfModalVisible(false)}
        theme={theme}
        onOpenKehfSurah={handleOpenKehfSurah}
        onOpenJumaSurah={handleOpenJumaSurah}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 4,
  },
  slotSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderRadius: 20,
    backgroundColor: 'rgba(128, 128, 128, 0.12)',
    gap: 4,
  },
  slotBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  slotBtnText: {
    fontSize: 12,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingTop: 8,
    paddingBottom: 4,
  },
  subHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  dateText: {
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 14,
  },
  refreshRandomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  refreshRandomText: {
    fontSize: 11,
    fontWeight: '600',
  },
  returnTodayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  returnTodayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  contentContainer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 32,
  },
  bottomLeftBlock: {
    alignItems: 'flex-start',
    width: '100%',
  },
  fridayBanner: {
    width: '100%',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
    gap: 8,
  },
  fridayBannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fridayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fridayFlowerEmoji: {
    fontSize: 16,
  },
  fridayBadgeTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  fridayLeafEmoji: {
    fontSize: 14,
  },
  fridayCloseBtn: {
    padding: 4,
  },
  fridayMessage: {
    fontSize: 13,
    lineHeight: 19,
  },
  fridayActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  fridayActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  fridayActionPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 0.6,
    fontWeight: '700',
    textAlign: 'left',
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
    marginBottom: 20,
    textAlign: 'left',
  },
  verseMeaning: {
    textAlign: 'left',
    letterSpacing: 0.2,
    marginBottom: 24,
  },
  activeNotePreview: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    gap: 4,
  },
  activeNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeNoteTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  activeNoteText: {
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  accentLine: {
    width: 48,
    height: 2,
    borderRadius: 1,
    marginBottom: 24,
  },
  actionRowScroll: {
    alignSelf: 'stretch',
    marginHorizontal: -28,
  },
  actionRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    flexShrink: 0,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  offscreenCapture: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 540,
    height: 960,
    opacity: 0,
    zIndex: -1,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
});
