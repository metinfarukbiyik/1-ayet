import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Fonts, ThemePalettes, type ThemePalette } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';
import {
  getNotificationSettings,
  setNotificationSettings,
  type FontSizeSetting,
  type NotificationSettings,
  type ThemeId,
} from '@/lib/storage';
import { syncDailyVerseWidget } from '@/lib/widget-sync';

type SettingsModalProps = {
  visible: boolean;
  onClose: () => void;
  theme: ThemePalette;
  fontSize: FontSizeSetting;
  onSelectFontSize: (size: FontSizeSetting) => void;
};

type ViewMode = 'main' | 'themes' | 'feedback';

type ThemeOption = {
  id: ThemeId;
  label: string;
  desc: string;
  badge?: 'Açık' | 'Koyu' | 'Otomatik';
  colors?: { bg: string; text: string; accent: string };
};

const DEVELOPER_EMAIL = 'metin@biyik.dev';

export function SettingsModal({
  visible,
  onClose,
  theme,
  fontSize,
  onSelectFontSize,
}: SettingsModalProps) {
  const { themeId, setThemeId } = useAppTheme();
  const [currentView, setCurrentView] = useState<ViewMode>('main');
  const [copied, setCopied] = useState(false);
  const [showEmailActions, setShowEmailActions] = useState(false);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    enabled: false,
    hour: 9,
    minute: 0,
  });

  useEffect(() => {
    if (visible) {
      getNotificationSettings().then(setNotifSettings);
    }
  }, [visible]);

  const handleToggleNotification = async () => {
    const updated: NotificationSettings = {
      ...notifSettings,
      enabled: !notifSettings.enabled,
    };
    setNotifSettings(updated);
    await setNotificationSettings(updated);
  };

  const handleSelectNotificationTime = async (hour: number, minute: number) => {
    const updated: NotificationSettings = {
      ...notifSettings,
      enabled: true,
      hour,
      minute,
    };
    setNotifSettings(updated);
    await setNotificationSettings(updated);
  };

  const handleModalClose = () => {
    setCurrentView('main');
    setShowEmailActions(false);
    setCopied(false);
    onClose();
  };

  const themeOptions: ThemeOption[] = [
    {
      id: 'system',
      label: 'Sistem (Otomatik)',
      desc: 'Cihazınızın sistem temasını otomatik olarak takip eder',
      badge: 'Otomatik',
    },
    {
      id: 'parchment',
      label: ThemePalettes.parchment.name,
      desc: 'Sıcak parşömen kağıdı ve zümrüt yeşili vurgular',
      badge: 'Açık',
      colors: {
        bg: ThemePalettes.parchment.background,
        text: ThemePalettes.parchment.text,
        accent: ThemePalettes.parchment.accent,
      },
    },
    {
      id: 'night',
      label: ThemePalettes.night.name,
      desc: 'Derin kömür gecesi ve sıcak kehribar altın ışıltısı',
      badge: 'Koyu',
      colors: {
        bg: ThemePalettes.night.background,
        text: ThemePalettes.night.text,
        accent: ThemePalettes.night.accent,
      },
    },
    {
      id: 'emerald',
      label: ThemePalettes.emerald.name,
      desc: 'Manevi derin orman tonları ve ferahlatıcı zümrüt',
      badge: 'Koyu',
      colors: {
        bg: ThemePalettes.emerald.background,
        text: ThemePalettes.emerald.text,
        accent: ThemePalettes.emerald.accent,
      },
    },
    {
      id: 'sapphire',
      label: ThemePalettes.sapphire.name,
      desc: 'Sakin gece gökyüzü ve ay ışığı safir mavisi',
      badge: 'Koyu',
      colors: {
        bg: ThemePalettes.sapphire.background,
        text: ThemePalettes.sapphire.text,
        accent: ThemePalettes.sapphire.accent,
      },
    },
    {
      id: 'terracotta',
      label: ThemePalettes.terracotta.name,
      desc: 'Sıcak çöl kumu ve tarçın tonlarında doğal zarafet',
      badge: 'Açık',
      colors: {
        bg: ThemePalettes.terracotta.background,
        text: ThemePalettes.terracotta.text,
        accent: ThemePalettes.terracotta.accent,
      },
    },
    {
      id: 'sage',
      label: ThemePalettes.sage.name,
      desc: 'Dinlendirici adaçayı yaprakları ve zeytin yeşili',
      badge: 'Açık',
      colors: {
        bg: ThemePalettes.sage.background,
        text: ThemePalettes.sage.text,
        accent: ThemePalettes.sage.accent,
      },
    },
    {
      id: 'rose',
      label: ThemePalettes.rose.name,
      desc: 'Derin mürdüm gecesi ve zarif gül kurusu',
      badge: 'Koyu',
      colors: {
        bg: ThemePalettes.rose.background,
        text: ThemePalettes.rose.text,
        accent: ThemePalettes.rose.accent,
      },
    },
  ];

  const isOptionSelected = (id: ThemeId) => {
    if (themeId === id) return true;
    if (themeId === 'light' && id === 'parchment') return true;
    if (themeId === 'dark' && id === 'night') return true;
    return false;
  };

  const getActiveThemeName = () => {
    if (themeId === 'system') return 'Sistem (Otomatik)';
    if (themeId === 'light' || themeId === 'parchment') return ThemePalettes.parchment.name;
    if (themeId === 'dark' || themeId === 'night') return ThemePalettes.night.name;
    return ThemePalettes[themeId as keyof typeof ThemePalettes]?.name ?? 'Özel Tema';
  };

  const handleCopyEmail = async () => {
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        try {
          const textarea = document.createElement('textarea');
          textarea.value = DEVELOPER_EMAIL;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        } catch {
          await Clipboard.setStringAsync(DEVELOPER_EMAIL);
        }
      } else {
        await Clipboard.setStringAsync(DEVELOPER_EMAIL);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3500);

      if (Platform.OS !== 'web') {
        Alert.alert(
          'E-posta Adresi Kopyalandı',
          `${DEVELOPER_EMAIL} panoya kopyalandı. İstediğiniz e-posta uygulamasına yapıştırabilirsiniz.`
        );
      }
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 3500);
      if (Platform.OS !== 'web') {
        Alert.alert('E-posta Adresi', DEVELOPER_EMAIL);
      }
    }
  };

  const handleOpenEmail = async (subjectPrefix = 'Öneri & İstek') => {
    const subject = encodeURIComponent(`1 Ayet - ${subjectPrefix}`);
    const body = encodeURIComponent(
      `Merhaba Metin,\n\n1 Ayet uygulamasıyla ilgili görüş ve önerilerim:\n\n`
    );
    const mailtoUrl = `mailto:${DEVELOPER_EMAIL}?subject=${subject}&body=${body}`;

    try {
      await Linking.openURL(mailtoUrl);
    } catch {
      // E-posta istemcisi bulunamadıysa veya açılamadıysa adresi panoya kopyala ve haber ver
      await Clipboard.setStringAsync(DEVELOPER_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 3500);
      Alert.alert(
        'E-posta Adresi Panoya Kopyalandı',
        `Cihazınızda doğrudan açılacak bir e-posta istemcisi bulunamadığı için geliştirici adresi (${DEVELOPER_EMAIL}) panoya kopyalandı.\n\nKullandığınız e-posta uygulamasını (Gmail, Outlook vb.) açıp "Kime" kısmına yapıştırarak kolayca mesaj gönderebilirsiniz.`,
        [{ text: 'Tamam' }]
      );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleModalClose}>
      <Pressable style={styles.backdrop} onPress={handleModalClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
          onPress={(e) => e.stopPropagation()}>
          {/* Header Bölümü */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {currentView !== 'main' ? (
                <Pressable
                  hitSlop={8}
                  style={styles.backButton}
                  onPress={() => setCurrentView('main')}>
                  <Ionicons name="arrow-back" size={20} color={theme.text} />
                  <Text style={[styles.backText, { color: theme.textSecondary }]}>Ayarlar</Text>
                </Pressable>
              ) : (
                <View>
                  <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.serif }]}>
                    Ayarlar
                  </Text>
                  <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    Uygulama tercihleri ve iletişim
                  </Text>
                </View>
              )}
            </View>

            <Pressable
              hitSlop={8}
              onPress={handleModalClose}
              style={[styles.closeButton, { backgroundColor: theme.card }]}>
              <Ionicons name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          {/* 1. ANA MENÜ GÖRÜNÜMÜ */}
          {currentView === 'main' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollList}>
              {/* Bölüm 1: Görünüm & Renkler */}
              <Text style={[styles.sectionTitle, { color: theme.accent }]}>GÖRÜNÜM</Text>

              <Pressable
                style={({ pressed }) => [
                  styles.menuRow,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                  pressed && styles.pressed,
                ]}
                onPress={() => setCurrentView('themes')}>
                <View style={[styles.iconBox, { backgroundColor: theme.border }]}>
                  <Ionicons name="color-palette-outline" size={22} color={theme.text} />
                </View>

                <View style={styles.menuRowContent}>
                  <Text style={[styles.menuRowTitle, { color: theme.text }]}>Renk Teması</Text>
                  <Text style={[styles.menuRowSubtitle, { color: theme.textSecondary }]}>
                    {getActiveThemeName()}
                  </Text>
                </View>

                <View style={styles.menuRowRight}>
                  {/* Seçili temanın renk rozeti */}
                  <View
                    style={[
                      styles.currentThemeDot,
                      { backgroundColor: theme.accent, borderColor: theme.border },
                    ]}
                  />
                  <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
                </View>
              </Pressable>

              {/* Yazı Boyutu Seçimi */}
              <View
                style={[
                  styles.fontSizeContainer,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}>
                <View style={styles.fontSizeHeader}>
                  <View style={[styles.iconBox, { backgroundColor: theme.border }]}>
                    <Ionicons name="text-outline" size={20} color={theme.text} />
                  </View>
                  <View style={styles.menuRowContent}>
                    <Text style={[styles.menuRowTitle, { color: theme.text }]}>Yazı Boyutu</Text>
                    <Text style={[styles.menuRowSubtitle, { color: theme.textSecondary }]}>
                      {fontSize === 'small'
                        ? 'Küçük'
                        : fontSize === 'large'
                        ? 'Büyük'
                        : 'Standart (Önerilen)'}
                    </Text>
                  </View>
                </View>

                <View style={styles.fontSizePillsRow}>
                  {(
                    [
                      { id: 'small', label: 'Küçük', sample: 'Aa' },
                      { id: 'medium', label: 'Standart', sample: 'Aa' },
                      { id: 'large', label: 'Büyük', sample: 'Aa' },
                    ] as const
                  ).map((item) => {
                    const isSelected = fontSize === item.id;
                    return (
                      <Pressable
                        key={item.id}
                        style={({ pressed }) => [
                          styles.fontSizePill,
                          {
                            backgroundColor: isSelected ? theme.accent : theme.surface,
                            borderColor: isSelected ? theme.accent : theme.border,
                          },
                          pressed && styles.pressed,
                        ]}
                        onPress={() => onSelectFontSize(item.id)}>
                        <Text
                          style={[
                            styles.fontSizePillSample,
                            {
                              color: isSelected ? theme.accentContrast : theme.text,
                              fontSize: item.id === 'small' ? 13 : item.id === 'medium' ? 16 : 19,
                              fontWeight: isSelected ? '700' : '600',
                            },
                          ]}>
                          {item.sample}
                        </Text>
                        <Text
                          style={[
                            styles.fontSizePillLabel,
                            {
                              color: isSelected ? theme.accentContrast : theme.textSecondary,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}>
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Günlük Bildirim & Hatırlatıcı Kartı */}
              <View
                style={[
                  styles.fontSizeContainer,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 12 },
                ]}>
                <View style={styles.fontSizeHeader}>
                  <View style={[styles.iconBox, { backgroundColor: theme.border }]}>
                    <Ionicons
                      name={notifSettings.enabled ? 'notifications' : 'notifications-outline'}
                      size={20}
                      color={notifSettings.enabled ? theme.accent : theme.text}
                    />
                  </View>
                  <View style={styles.menuRowContent}>
                    <Text style={[styles.menuRowTitle, { color: theme.text }]}>
                      Günlük Ayet Hatırlatıcısı
                    </Text>
                    <Text style={[styles.menuRowSubtitle, { color: theme.textSecondary }]}>
                      {notifSettings.enabled
                        ? `Her gün saat ${String(notifSettings.hour).padStart(2, '0')}:${String(
                            notifSettings.minute
                          ).padStart(2, '0')}'da hatırlat`
                        : 'Kapalı · Günlük manevi hatırlatıcı'}
                    </Text>
                  </View>

                  <Pressable
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.toggleSwitch,
                      {
                        backgroundColor: notifSettings.enabled ? theme.accent : theme.border,
                      },
                      pressed && styles.pressed,
                    ]}
                    onPress={handleToggleNotification}>
                    <View
                      style={[
                        styles.toggleThumb,
                        {
                          backgroundColor: notifSettings.enabled
                            ? theme.accentContrast
                            : theme.surface,
                          transform: [{ translateX: notifSettings.enabled ? 16 : 0 }],
                        },
                      ]}
                    />
                  </Pressable>
                </View>

                {/* Hatırlatıcı Saat Seçenekleri */}
                {notifSettings.enabled && (
                  <View style={[styles.fontSizePillsRow, { marginTop: 12 }]}>
                    {[
                      { hour: 7, minute: 0, label: '07:00', desc: 'Sabah' },
                      { hour: 9, minute: 0, label: '09:00', desc: 'Kuşluk' },
                      { hour: 13, minute: 30, label: '13:30', desc: 'Öğle' },
                      { hour: 21, minute: 0, label: '21:00', desc: 'Akşam' },
                    ].map((item) => {
                      const isTimeSelected =
                        notifSettings.hour === item.hour && notifSettings.minute === item.minute;
                      return (
                        <Pressable
                          key={item.label}
                          style={({ pressed }) => [
                            styles.timePill,
                            {
                              backgroundColor: isTimeSelected ? theme.accent : theme.surface,
                              borderColor: isTimeSelected ? theme.accent : theme.border,
                            },
                            pressed && styles.pressed,
                          ]}
                          onPress={() => handleSelectNotificationTime(item.hour, item.minute)}>
                          <Text
                            style={[
                              styles.timePillLabel,
                              {
                                color: isTimeSelected ? theme.accentContrast : theme.text,
                                fontWeight: isTimeSelected ? '700' : '600',
                              },
                            ]}>
                            {item.label}
                          </Text>
                          <Text
                            style={[
                              styles.timePillDesc,
                              {
                                color: isTimeSelected
                                  ? theme.accentContrast
                                  : theme.textSecondary,
                              },
                            ]}>
                            {item.desc}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Ana Ekran Widget'ı Bilgi & Eşitleme Kartı */}
              <View
                style={[
                  styles.fontSizeContainer,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 12 },
                ]}>
                <View style={styles.fontSizeHeader}>
                  <View style={[styles.iconBox, { backgroundColor: theme.border }]}>
                    <Ionicons name="apps-outline" size={20} color={theme.accent} />
                  </View>
                  <View style={styles.menuRowContent}>
                    <Text style={[styles.menuRowTitle, { color: theme.text }]}>
                      Ana Ekran Widget’ı
                    </Text>
                    <Text style={[styles.menuRowSubtitle, { color: theme.textSecondary }]}>
                      Kare ve yatay geniş boyutlar
                    </Text>
                  </View>
                </View>

                <Text style={[styles.widgetInfoDesc, { color: theme.textSecondary }]}>
                  Telefonunuzun ana ekranına basılı tutup (+) simgesine dokunarak «1 Ayet» widget’ını ekleyebilirsiniz. Günün ayetini ve tefekkür duasını doğrudan ana ekranınızda görüntüleyin.
                </Text>

                <Pressable
                  style={({ pressed }) => [
                    styles.syncWidgetBtn,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    pressed && styles.pressed,
                  ]}
                  onPress={() => {
                    const success = syncDailyVerseWidget();
                    if (success) {
                      Alert.alert(
                        'Widget Senkronize Edildi',
                        'Günün ayeti ve önümüzdeki günlerin zaman çizelgesi widget’a başarıyla aktarıldı.'
                      );
                    } else if (Platform.OS === 'web') {
                      Alert.alert(
                        'Bilgi',
                        'Ana ekran widget’ı yalnızca iOS ve Android mobil cihazlarda desteklenmektedir.'
                      );
                    } else {
                      Alert.alert(
                        'Geliştirme Derlemesi Gerekli',
                        'Ana ekran widget’ları native modül içerdiğinden Expo Go yerine Development Build veya cihazınıza kurulu uygulama derlemesinde çalışır.'
                      );
                    }
                  }}>
                  <Ionicons name="refresh" size={15} color={theme.accent} />
                  <Text style={[styles.syncWidgetBtnText, { color: theme.accent }]}>
                    Widget Verilerini Şimdi Senkronize Et
                  </Text>
                </Pressable>
              </View>

              {/* Bölüm 2: Geliştirici & Geri Bildirim */}
              <Text style={[styles.sectionTitle, { color: theme.accent, marginTop: 22 }]}>
                GELİŞTİRİCİYE ULAŞIN
              </Text>

              {/* Öneri & İstek Kartı */}
              <Pressable
                style={({ pressed }) => [
                  styles.feedbackBanner,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                  pressed && styles.pressed,
                ]}
                onPress={() => setCurrentView('feedback')}>
                <View style={[styles.iconBox, { backgroundColor: theme.border }]}>
                  <Ionicons name="heart-outline" size={22} color={theme.accent} />
                </View>

                <View style={styles.menuRowContent}>
                  <Text style={[styles.menuRowTitle, { color: theme.text }]}>
                    Öneri, İstek ve Görüşleriniz
                  </Text>
                  <Text style={[styles.menuRowSubtitle, { color: theme.textSecondary }]}>
                    Fikirleriniz bizim için çok kıymetli · Doğrudan yazın
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </Pressable>

              {/* Bölüm 3: Bilgi */}
              <View
                style={[
                  styles.infoCard,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 22 },
                ]}>
                <View style={styles.infoTitleRow}>
                  <Text style={[styles.infoTitle, { color: theme.text, fontFamily: Fonts.serif }]}>
                    1 Ayet
                  </Text>
                  <Text style={[styles.versionBadge, { color: theme.textSecondary }]}>v1.0</Text>
                </View>
                <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                  Her gün 1 ayet meali ile Kur&apos;an-ı Kerim&apos;i baştan sona, sade ve düzenli bir
                  şekilde okuma rehberi. Diyanet İşleri Başkanlığı meali kullanılmıştır.
                </Text>
              </View>
            </ScrollView>
          )}

          {/* 2. İKİNCİ MENÜ: RENK TEMALARI */}
          {currentView === 'themes' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollList}>
              <View style={styles.subviewHeader}>
                <Text style={[styles.subviewTitle, { color: theme.text, fontFamily: Fonts.serif }]}>
                  Renk Kombinasyonları
                </Text>
                <Text style={[styles.subviewSubtitle, { color: theme.textSecondary }]}>
                  Okuma zevkinize ve ortam ışığına en uygun huzurlu tonu seçebilirsiniz.
                </Text>
              </View>

              <View style={styles.optionsList}>
                {themeOptions.map((opt) => {
                  const selected = isOptionSelected(opt.id);
                  return (
                    <Pressable
                      key={opt.id}
                      style={({ pressed }) => [
                        styles.optionItem,
                        {
                          backgroundColor: selected ? theme.card : 'transparent',
                          borderColor: selected ? theme.accent : theme.border,
                        },
                        pressed && styles.pressed,
                      ]}
                      onPress={() => setThemeId(opt.id)}>
                      {/* Renk önizleme rozetleri */}
                      {opt.colors ? (
                        <View style={styles.paletteSwatches}>
                          <View
                            style={[
                              styles.swatch,
                              { backgroundColor: opt.colors.bg, borderColor: theme.border },
                            ]}
                          />
                          <View
                            style={[styles.swatchOverlap, { backgroundColor: opt.colors.text }]}
                          />
                          <View
                            style={[styles.swatchOverlap2, { backgroundColor: opt.colors.accent }]}
                          />
                        </View>
                      ) : (
                        <View style={[styles.iconBox, { backgroundColor: theme.border }]}>
                          <Ionicons name="phone-portrait-outline" size={18} color={theme.text} />
                        </View>
                      )}

                      {/* Başlık ve Açıklama */}
                      <View style={styles.optionContent}>
                        <View style={styles.titleRow}>
                          <Text style={[styles.optionLabel, { color: theme.text }]}>
                            {opt.label}
                          </Text>
                          {opt.badge && (
                            <View
                              style={[
                                styles.badge,
                                {
                                  backgroundColor:
                                    opt.badge === 'Koyu'
                                      ? 'rgba(0,0,0,0.12)'
                                      : 'rgba(255,255,255,0.16)',
                                },
                              ]}>
                              <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
                                {opt.badge}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                          {opt.desc}
                        </Text>
                      </View>

                      {/* Seçim İşareti */}
                      <View
                        style={[
                          styles.radioCircle,
                          {
                            borderColor: selected ? theme.accent : theme.border,
                            backgroundColor: selected ? theme.accent : 'transparent',
                          },
                        ]}>
                        {selected && <View style={styles.radioDot} />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          )}

          {/* 3. İKİNCİ MENÜ: GELİŞTİRİCİYE ULAŞIN / ÖNERİ VE İSTEK */}
          {currentView === 'feedback' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollList}>
              <View style={styles.subviewHeader}>
                <Text style={[styles.subviewTitle, { color: theme.text, fontFamily: Fonts.serif }]}>
                  Görüş ve Önerileriniz
                </Text>
                <Text style={[styles.subviewSubtitle, { color: theme.textSecondary }]}>
                  Fikirlerinizi doğrudan geliştiriciye iletin
                </Text>
              </View>

              {/* Değer Verildiğini Vurgulayan Samimi Mesaj Kartı */}
              <View
                style={[
                  styles.heartMessageCard,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}>
                <View style={[styles.heartBadge, { backgroundColor: theme.border }]}>
                  <Ionicons name="sparkles" size={20} color={theme.accent} />
                </View>
                <Text style={[styles.heartTitle, { color: theme.text, fontFamily: Fonts.serif }]}>
                  Görüşleriniz Bizim İçin Çok Kıymetli
                </Text>
                <Text style={[styles.heartText, { color: theme.textSecondary }]}>
                  1 Ayet&apos;i sade, huzurlu ve hayatınıza dokunan bir rehber haline getirmek için
                  çalışıyoruz. Aklınıza gelen her yeni fikir, eksik gördüğünüz bir nokta veya meal
                  önerisi bizim için son derece değerlidir.
                </Text>
                <Text style={[styles.heartSubtext, { color: theme.accent }]}>
                  İlettiğiniz her mesaj geliştirici tarafından bizzat ve özenle okunur.
                </Text>
              </View>

              {/* Konu Başlıkları İlhamı */}
              <Text style={[styles.sectionTitle, { color: theme.accent, marginTop: 18 }]}>
                PAYLAŞABİLECEĞİNİZ KONULAR
              </Text>
              <View style={styles.topicTagsRow}>
                <View style={[styles.topicTag, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <Text style={[styles.topicTagText, { color: theme.text }]}>💡 Yeni Özellik İstekleri</Text>
                </View>
                <View style={[styles.topicTag, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <Text style={[styles.topicTagText, { color: theme.text }]}>🎨 Tasarım & Tema Fikirleri</Text>
                </View>
                <View style={[styles.topicTag, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <Text style={[styles.topicTagText, { color: theme.text }]}>📖 Meal & İmla Düzeltmeleri</Text>
                </View>
                <View style={[styles.topicTag, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <Text style={[styles.topicTagText, { color: theme.text }]}>✨ Genel Düşünce ve Dua</Text>
                </View>
              </View>

              {/* Aksiyon Butonu */}
              <Text style={[styles.sectionTitle, { color: theme.accent, marginTop: 20 }]}>
                İLETİŞİM
              </Text>

              {/* E-posta Gönder */}
              <Pressable
                style={({ pressed }) => [
                  styles.actionContactBtn,
                  {
                    backgroundColor: copied ? theme.card : theme.accent,
                    borderColor: theme.accent,
                    borderWidth: copied ? 1.5 : 0,
                  },
                  pressed && styles.pressed,
                ]}
                onPress={() => setShowEmailActions(true)}>
                <Ionicons
                  name={copied ? 'checkmark-circle' : 'mail'}
                  size={20}
                  color={copied ? theme.accent : theme.accentContrast}
                />
                <View style={styles.actionBtnContent}>
                  <Text
                    style={[
                      styles.actionBtnPrimaryText,
                      { color: copied ? theme.text : theme.accentContrast },
                    ]}>
                    {copied ? 'E-posta Adresi Kopyalandı! ✓' : 'E-posta Gönder'}
                  </Text>
                  <Text
                    style={[
                      styles.actionBtnPrimarySub,
                      {
                        color: copied ? theme.textSecondary : theme.accentContrast,
                        opacity: copied ? 1 : 0.85,
                      },
                    ]}>
                    {DEVELOPER_EMAIL}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={copied ? theme.accent : theme.accentContrast}
                />
              </Pressable>
            </ScrollView>
          )}

          {/* E-posta Seçenekleri Modalı / Action Sheet */}
          {showEmailActions && (
            <View style={styles.actionPromptOverlay}>
              <Pressable
                style={styles.actionPromptBackdrop}
                onPress={() => setShowEmailActions(false)}
              />
              <View
                style={[
                  styles.actionPromptCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}>
                <View style={styles.actionPromptHeader}>
                  <View style={[styles.actionPromptIconCircle, { backgroundColor: theme.card }]}>
                    <Ionicons name="mail-outline" size={24} color={theme.accent} />
                  </View>
                  <Text
                    style={[
                      styles.actionPromptTitle,
                      { color: theme.text, fontFamily: Fonts.serif },
                    ]}>
                    E-posta ile İletişim
                  </Text>
                  <Text style={[styles.actionPromptSub, { color: theme.textSecondary }]}>
                    {DEVELOPER_EMAIL}
                  </Text>
                </View>

                <View style={styles.actionPromptButtons}>
                  {/* Seçenek 1: E-posta Gönder */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionPromptOptionBtn,
                      { backgroundColor: theme.accent },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => {
                      setShowEmailActions(false);
                      handleOpenEmail('Öneri & İstek');
                    }}>
                    <Ionicons name="paper-plane-outline" size={20} color={theme.accentContrast} />
                    <View style={styles.actionPromptOptionContent}>
                      <Text
                        style={[
                          styles.actionPromptOptionTitle,
                          { color: theme.accentContrast },
                        ]}>
                        E-posta Gönder
                      </Text>
                      <Text
                        style={[
                          styles.actionPromptOptionDesc,
                          { color: theme.accentContrast, opacity: 0.85 },
                        ]}>
                        Cihazınızdaki e-posta uygulamasını açar
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.accentContrast} />
                  </Pressable>

                  {/* Seçenek 2: E-posta Adresini Kopyala */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionPromptOptionBtn,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.cardBorder,
                        borderWidth: 1,
                      },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => {
                      setShowEmailActions(false);
                      handleCopyEmail();
                    }}>
                    <Ionicons name="copy-outline" size={20} color={theme.text} />
                    <View style={styles.actionPromptOptionContent}>
                      <Text style={[styles.actionPromptOptionTitle, { color: theme.text }]}>
                        E-posta Adresini Kopyala
                      </Text>
                      <Text
                        style={[
                          styles.actionPromptOptionDesc,
                          { color: theme.textSecondary },
                        ]}>
                        {DEVELOPER_EMAIL} panoya kopyalanır
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
                  </Pressable>

                  {/* Vazgeç Butonu */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionPromptCancelBtn,
                      { backgroundColor: theme.border },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => setShowEmailActions(false)}>
                    <Text style={[styles.actionPromptCancelText, { color: theme.text }]}>
                      Vazgeç
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollList: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 10,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  menuRowContent: {
    flex: 1,
  },
  menuRowTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuRowSubtitle: {
    fontSize: 13,
  },
  menuRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currentThemeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  subviewHeader: {
    marginBottom: 16,
  },
  subviewTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  subviewSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  optionsList: {
    gap: 10,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  pressed: {
    opacity: 0.8,
  },
  paletteSwatches: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 44,
    height: 28,
    position: 'relative',
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  swatchOverlap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    left: 12,
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  swatchOverlap2: {
    width: 18,
    height: 18,
    borderRadius: 9,
    position: 'absolute',
    left: 24,
    zIndex: 3,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  optionDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  versionBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  heartMessageCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 8,
  },
  heartBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heartTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  heartText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  heartSubtext: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  topicTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  topicTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  topicTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginBottom: 10,
  },
  actionBtnContent: {
    flex: 1,
  },
  actionBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionBtnPrimarySub: {
    fontSize: 12,
  },
  copiedNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
  },
  copiedNotificationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionPromptOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  actionPromptBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    zIndex: 1,
  },
  actionPromptCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 10,
  },
  actionPromptHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionPromptIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionPromptTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionPromptSub: {
    fontSize: 13,
    marginTop: 2,
    textAlign: 'center',
  },
  actionPromptButtons: {
    gap: 10,
  },
  actionPromptOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    gap: 12,
  },
  actionPromptOptionContent: {
    flex: 1,
  },
  actionPromptOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionPromptOptionDesc: {
    fontSize: 12,
  },
  actionPromptCancelBtn: {
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  actionPromptCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fontSizeContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
    gap: 12,
  },
  fontSizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fontSizePillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fontSizePill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 2,
  },
  fontSizePillSample: {
    fontFamily: Fonts.serif,
  },
  fontSizePillLabel: {
    fontSize: 11,
  },
  toggleSwitch: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 3,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  timePill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 2,
  },
  timePillLabel: {
    fontSize: 13,
  },
  timePillDesc: {
    fontSize: 10,
  },
  widgetInfoDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  syncWidgetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  syncWidgetBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
