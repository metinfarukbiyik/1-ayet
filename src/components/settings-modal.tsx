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

type ViewMode = 'main' | 'themes' | 'fontSize' | 'notifications' | 'widget' | 'contact';

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

  const getActiveFontSizeName = () => {
    switch (fontSize) {
      case 'small':
        return 'Küçük (17 pt)';
      case 'large':
        return 'Büyük (26 pt)';
      case 'medium':
      default:
        return 'Standart (21 pt)';
    }
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
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        setShowEmailActions(false);
      } else {
        handleCopyEmail();
        setShowEmailActions(false);
        Alert.alert(
          'E-posta Uygulaması Bulunamadı',
          `Cihazınızda varsayılan bir e-posta istemcisi bulunamadı. E-posta adresi (${DEVELOPER_EMAIL}) panoya kopyalandı.`,
          [{ text: 'Tamam' }]
        );
      }
    } catch {
      handleCopyEmail();
      setShowEmailActions(false);
      Alert.alert(
        'E-posta Gönderilemedi',
        `E-posta adresi (${DEVELOPER_EMAIL}) panoya kopyalandı.`,
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
                    Uygulama tercihleri ve araçlar
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

          {/* ======================================================== */}
          {/* 1. ANA MENÜ GÖRÜNÜMÜ                                     */}
          {/* ======================================================== */}
          {currentView === 'main' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollList}>
              {/* Bölüm: Görünüm & Okuma */}
              <Text style={[styles.sectionTitle, { color: theme.accent }]}>GÖRÜNÜM & OKUMA</Text>

              {/* Renk Teması Butonu */}
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
                  <View
                    style={[
                      styles.currentThemeDot,
                      { backgroundColor: theme.accent, borderColor: theme.border },
                    ]}
                  />
                  <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
                </View>
              </Pressable>

              {/* Yazı Boyutu Butonu */}
              <Pressable
                style={({ pressed }) => [
                  styles.menuRow,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 10 },
                  pressed && styles.pressed,
                ]}
                onPress={() => setCurrentView('fontSize')}>
                <View style={[styles.iconBox, { backgroundColor: theme.border }]}>
                  <Ionicons name="text-outline" size={22} color={theme.text} />
                </View>

                <View style={styles.menuRowContent}>
                  <Text style={[styles.menuRowTitle, { color: theme.text }]}>Yazı Boyutu</Text>
                  <Text style={[styles.menuRowSubtitle, { color: theme.textSecondary }]}>
                    {getActiveFontSizeName()}
                  </Text>
                </View>

                <View style={styles.menuRowRight}>
                  <Text style={[styles.menuBadgeText, { color: theme.accent, fontWeight: '700' }]}>
                    Aa
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
                </View>
              </Pressable>

              {/* Bölüm: Bildirim & Widget */}
              <Text style={[styles.sectionTitle, { color: theme.accent, marginTop: 22 }]}>
                BİLDİRİM & ARAÇLAR
              </Text>

              {/* Günlük Hatırlatıcı Butonu */}
              <Pressable
                style={({ pressed }) => [
                  styles.menuRow,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                  pressed && styles.pressed,
                ]}
                onPress={() => setCurrentView('notifications')}>
                <View style={[styles.iconBox, { backgroundColor: theme.border }]}>
                  <Ionicons
                    name={notifSettings.enabled ? 'notifications' : 'notifications-outline'}
                    size={22}
                    color={notifSettings.enabled ? theme.accent : theme.text}
                  />
                </View>

                <View style={styles.menuRowContent}>
                  <Text style={[styles.menuRowTitle, { color: theme.text }]}>
                    Günlük Hatırlatıcı
                  </Text>
                  <Text style={[styles.menuRowSubtitle, { color: theme.textSecondary }]}>
                    {notifSettings.enabled
                      ? `Açık · Her gün ${String(notifSettings.hour).padStart(2, '0')}:${String(
                          notifSettings.minute
                        ).padStart(2, '0')}`
                      : 'Kapalı · Günlük manevi hatırlatıcı'}
                  </Text>
                </View>

                <View style={styles.menuRowRight}>
                  {notifSettings.enabled && (
                    <View style={[styles.activeStatusPill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      <Text style={[styles.activeStatusText, { color: theme.accent }]}>
                        {`${String(notifSettings.hour).padStart(2, '0')}:${String(notifSettings.minute).padStart(2, '0')}`}
                      </Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
                </View>
              </Pressable>

              {/* Ana Ekran Widget'ı Butonu */}
              <Pressable
                style={({ pressed }) => [
                  styles.menuRow,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 10 },
                  pressed && styles.pressed,
                ]}
                onPress={() => setCurrentView('widget')}>
                <View style={[styles.iconBox, { backgroundColor: theme.border }]}>
                  <Ionicons name="apps-outline" size={22} color={theme.accent} />
                </View>

                <View style={styles.menuRowContent}>
                  <Text style={[styles.menuRowTitle, { color: theme.text }]}>
                    Ana Ekran Widget’ı
                  </Text>
                  <Text style={[styles.menuRowSubtitle, { color: theme.textSecondary }]}>
                    Kurulum rehberi & anlık eşitleme
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </Pressable>

              {/* Bölüm: Geliştirici & İletişim */}
              <Text style={[styles.sectionTitle, { color: theme.accent, marginTop: 22 }]}>
                İLETİŞİM & DESTEK
              </Text>

              {/* İletişim / Öneri Butonu */}
              <Pressable
                style={({ pressed }) => [
                  styles.menuRow,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                  pressed && styles.pressed,
                ]}
                onPress={() => setCurrentView('contact')}>
                <View style={[styles.iconBox, { backgroundColor: theme.border }]}>
                  <Ionicons name="heart-outline" size={22} color={theme.accent} />
                </View>

                <View style={styles.menuRowContent}>
                  <Text style={[styles.menuRowTitle, { color: theme.text }]}>
                    Geliştiriciye Ulaşın & İletişim
                  </Text>
                  <Text style={[styles.menuRowSubtitle, { color: theme.textSecondary }]}>
                    Öneri, görüş ve teşekkür mesajlarınız
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </Pressable>

              {/* Bilgi Kartı */}
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

          {/* ======================================================== */}
          {/* 2. PENCERE: RENK TEMALARI                                */}
          {/* ======================================================== */}
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

          {/* ======================================================== */}
          {/* 3. PENCERE: YAZI BOYUTU                                  */}
          {/* ======================================================== */}
          {currentView === 'fontSize' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollList}>
              <View style={styles.subviewHeader}>
                <Text style={[styles.subviewTitle, { color: theme.text, fontFamily: Fonts.serif }]}>
                  Yazı Boyutu Tercihi
                </Text>
                <Text style={[styles.subviewSubtitle, { color: theme.textSecondary }]}>
                  Ayet meali metinlerinin ekrandaki büyüklüğünü ayarlayın.
                </Text>
              </View>

              {/* Canlı Önizleme Kartı */}
              <View
                style={[
                  styles.previewVerseBox,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}>
                <Text style={[styles.previewKicker, { color: theme.accent }]}>CANLI ÖNİZLEME</Text>
                <Text
                  style={[
                    styles.previewVerseText,
                    {
                      color: theme.text,
                      fontFamily: Fonts.serif,
                      fontSize: fontSize === 'small' ? 17 : fontSize === 'large' ? 26 : 21,
                      lineHeight: fontSize === 'small' ? 27 : fontSize === 'large' ? 40 : 33,
                    },
                  ]}>
                  &ldquo;Hamd, Âlemlerin Rabbi olan Allah’a mahsustur.&rdquo;
                </Text>
                <Text style={[styles.previewMeta, { color: theme.textSecondary }]}>
                  — Fâtiha Suresi, 2. Ayet
                </Text>
              </View>

              {/* Seçenek Listesi */}
              <View style={[styles.optionsList, { marginTop: 14 }]}>
                {[
                  {
                    id: 'small' as const,
                    title: 'Küçük (17 pt)',
                    desc: 'Daha fazla metin sığdırmak için kompakt ve zarif görünüm',
                    sampleSize: 15,
                  },
                  {
                    id: 'medium' as const,
                    title: 'Standart (21 pt) · Önerilen',
                    desc: 'En dengeli, rahat ve huzurlu günlük okuma deneyimi',
                    sampleSize: 19,
                  },
                  {
                    id: 'large' as const,
                    title: 'Büyük (26 pt)',
                    desc: 'Gözleri yormayan, ferah ve rahatça seçilebilen büyük harfler',
                    sampleSize: 24,
                  },
                ].map((item) => {
                  const isSelected = fontSize === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      style={({ pressed }) => [
                        styles.optionItem,
                        {
                          backgroundColor: isSelected ? theme.card : 'transparent',
                          borderColor: isSelected ? theme.accent : theme.border,
                        },
                        pressed && styles.pressed,
                      ]}
                      onPress={() => onSelectFontSize(item.id)}>
                      <View style={[styles.iconBox, { backgroundColor: theme.border }]}>
                        <Text
                          style={{
                            fontSize: item.sampleSize,
                            fontWeight: '700',
                            color: isSelected ? theme.accent : theme.text,
                          }}>
                          Aa
                        </Text>
                      </View>

                      <View style={styles.optionContent}>
                        <Text style={[styles.optionLabel, { color: theme.text }]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                          {item.desc}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.radioCircle,
                          {
                            borderColor: isSelected ? theme.accent : theme.border,
                            backgroundColor: isSelected ? theme.accent : 'transparent',
                          },
                        ]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          )}

          {/* ======================================================== */}
          {/* 4. PENCERE: GÜNLÜK HATIRLATICI                           */}
          {/* ======================================================== */}
          {currentView === 'notifications' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollList}>
              <View style={styles.subviewHeader}>
                <Text style={[styles.subviewTitle, { color: theme.text, fontFamily: Fonts.serif }]}>
                  Günlük Hatırlatıcı
                </Text>
                <Text style={[styles.subviewSubtitle, { color: theme.textSecondary }]}>
                  Günün koşturmacasında bir ayetlik manevi durak için bildirim alın.
                </Text>
              </View>

              {/* Açma / Kapama Kartı */}
              <View
                style={[
                  styles.fontSizeContainer,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
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
                      Hatırlatıcı Durumu
                    </Text>
                    <Text style={[styles.menuRowSubtitle, { color: theme.textSecondary }]}>
                      {notifSettings.enabled
                        ? `Her gün saat ${String(notifSettings.hour).padStart(2, '0')}:${String(
                            notifSettings.minute
                          ).padStart(2, '0')}'da aktiftir`
                        : 'Şu anda kapalı'}
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
                  <View style={{ marginTop: 16 }}>
                    <Text
                      style={[
                        styles.sectionTitle,
                        { color: theme.accent, fontSize: 11, marginBottom: 8 },
                      ]}>
                      BİLDİRİM SAATİNİ SEÇİN
                    </Text>
                    <View style={styles.fontSizePillsRow}>
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
                  </View>
                )}
              </View>

              {/* Bilgi Kutusu */}
              <View
                style={[
                  styles.widgetInfoBox,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 14 },
                ]}>
                <Ionicons name="information-circle-outline" size={18} color={theme.accent} />
                <Text style={[styles.widgetInfoBoxText, { color: theme.textSecondary }]}>
                  Bildirimler tamamen cihazınız üzerinde planlanır. İnternet bağlantısı gerektirmez,
                  pilinizi tüketmez ve verileriniz cihazınızda kalır.
                </Text>
              </View>
            </ScrollView>
          )}

          {/* ======================================================== */}
          {/* 5. PENCERE: ANA EKRAN WİDGET'I                           */}
          {/* ======================================================== */}
          {currentView === 'widget' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollList}>
              <View style={styles.subviewHeader}>
                <Text style={[styles.subviewTitle, { color: theme.text, fontFamily: Fonts.serif }]}>
                  Ana Ekran Widget’ı
                </Text>
                <Text style={[styles.subviewSubtitle, { color: theme.textSecondary }]}>
                  Günün ayetini ve tefekkür duasını telefonunuzun ana ekranında her an görüntüleyin.
                </Text>
              </View>

              {/* Desteklenen Boyutlar */}
              <View
                style={[
                  styles.widgetCard,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}>
                <Text style={[styles.previewKicker, { color: theme.accent }]}>
                  DESTEKLENEN BOYUTLAR
                </Text>

                <View style={styles.widgetSizeRow}>
                  <View style={[styles.widgetSizeIconBox, { backgroundColor: theme.surface }]}>
                    <Ionicons name="square-outline" size={18} color={theme.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.widgetSizeTitle, { color: theme.text }]}>
                      Küçük Kare (2x2)
                    </Text>
                    <Text style={[styles.widgetSizeDesc, { color: theme.textSecondary }]}>
                      Sure adı, ayet meali ve duaya tek dokunuşla ulaşım
                    </Text>
                  </View>
                </View>

                <View style={styles.widgetSizeRow}>
                  <View style={[styles.widgetSizeIconBox, { backgroundColor: theme.surface }]}>
                    <Ionicons name="phone-landscape-outline" size={18} color={theme.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.widgetSizeTitle, { color: theme.text }]}>
                      Yatay Geniş (4x2) · Önerilen
                    </Text>
                    <Text style={[styles.widgetSizeDesc, { color: theme.textSecondary }]}>
                      Geniş okuma alanı, Cüz numarası ve doğrudan «Ayetin Duası» butonu
                    </Text>
                  </View>
                </View>

                <View style={styles.widgetSizeRow}>
                  <View style={[styles.widgetSizeIconBox, { backgroundColor: theme.surface }]}>
                    <Ionicons name="grid-outline" size={18} color={theme.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.widgetSizeTitle, { color: theme.text }]}>
                      Büyük Kare (4x4)
                    </Text>
                    <Text style={[styles.widgetSizeDesc, { color: theme.textSecondary }]}>
                      Tam ayet meali ve genişletilmiş tefekkür duası bölümü
                    </Text>
                  </View>
                </View>
              </View>

              {/* Nasıl Eklenir? */}
              <View
                style={[
                  styles.widgetCard,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 12 },
                ]}>
                <Text style={[styles.previewKicker, { color: theme.accent }]}>NASIL EKLENİR?</Text>

                <View style={styles.guideStepRow}>
                  <View style={[styles.stepNumberBadge, { backgroundColor: theme.accent }]}>
                    <Text style={[styles.stepNumberText, { color: theme.accentContrast }]}>1</Text>
                  </View>
                  <Text style={[styles.guideStepText, { color: theme.text }]}>
                    Telefonunuzun ana ekranında boş bir alana basılı tutun.
                  </Text>
                </View>

                <View style={styles.guideStepRow}>
                  <View style={[styles.stepNumberBadge, { backgroundColor: theme.accent }]}>
                    <Text style={[styles.stepNumberText, { color: theme.accentContrast }]}>2</Text>
                  </View>
                  <Text style={[styles.guideStepText, { color: theme.text }]}>
                    Sol üst köşede beliren <Text style={{ fontWeight: '700' }}>(+) Ekle</Text>{' '}
                    simgesine dokunun.
                  </Text>
                </View>

                <View style={styles.guideStepRow}>
                  <View style={[styles.stepNumberBadge, { backgroundColor: theme.accent }]}>
                    <Text style={[styles.stepNumberText, { color: theme.accentContrast }]}>3</Text>
                  </View>
                  <Text style={[styles.guideStepText, { color: theme.text }]}>
                    Listeden <Text style={{ fontWeight: '700' }}>1 Ayet</Text>&apos;i seçip
                    dilediğiniz boyutu ana ekranınıza ekleyin.
                  </Text>
                </View>
              </View>

              {/* Senkronizasyon Aksiyon Butonu */}
              <Pressable
                style={({ pressed }) => [
                  styles.primaryActionBtn,
                  { backgroundColor: theme.accent, marginTop: 16 },
                  pressed && styles.pressed,
                ]}
                onPress={() => {
                  const success = syncDailyVerseWidget();
                  if (success) {
                    Alert.alert(
                      'Widget Senkronize Edildi ✓',
                      'Günün ayeti ve önümüzdeki günlerin zaman çizelgesi widget’a başarıyla aktarıldı.'
                    );
                  } else if (Platform.OS === 'web') {
                    Alert.alert(
                      'Bilgi',
                      'Ana ekran widget’ı yalnızca mobil cihazlarda desteklenmektedir.'
                    );
                  } else {
                    Alert.alert(
                      'Bilgi',
                      'Widget verileri senkronize edildi. Ana ekranınızdaki widget kısa süre içinde güncellenecektir.'
                    );
                  }
                }}>
                <Ionicons name="refresh" size={18} color={theme.accentContrast} />
                <Text style={[styles.primaryActionBtnText, { color: theme.accentContrast }]}>
                  Widget Verilerini Şimdi Senkronize Et
                </Text>
              </Pressable>
            </ScrollView>
          )}

          {/* ======================================================== */}
          {/* 6. PENCERE: İLETİŞİM & GERİ BİLDİRİM                     */}
          {/* ======================================================== */}
          {currentView === 'contact' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollList}>
              <View style={styles.subviewHeader}>
                <Text style={[styles.subviewTitle, { color: theme.text, fontFamily: Fonts.serif }]}>
                  Görüş ve Önerileriniz
                </Text>
                <Text style={[styles.subviewSubtitle, { color: theme.textSecondary }]}>
                  Fikirlerinizi ve dualarınızı doğrudan geliştiriciye iletin.
                </Text>
              </View>

              {/* Samimi Mesaj Kartı */}
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
                  1 Ayet&apos;i sade, huzurlu ve hayatınıza dokunan bir manevi rehber haline
                  getirmek için özenle geliştiriyoruz. Aklınıza gelen her yeni fikir, eksik gördüğünüz
                  bir detay veya meal önerisi bizim için son derece kıymetlidir.
                </Text>
                <Text style={[styles.heartSubtext, { color: theme.accent }]}>
                  İlettiğiniz her mesaj geliştirici tarafından bizzat ve dikkatle okunur.
                </Text>
              </View>

              {/* İletişim Konuları */}
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
                  <Text style={[styles.topicTagText, { color: theme.text }]}>📖 Meal & İmla İpuçları</Text>
                </View>
                <View style={[styles.topicTag, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <Text style={[styles.topicTagText, { color: theme.text }]}>✨ Teşekkür & Selam</Text>
                </View>
              </View>

              {/* E-posta Gönderme Butonu */}
              <Text style={[styles.sectionTitle, { color: theme.accent, marginTop: 20 }]}>
                DOĞRUDAN ULAŞIN
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryActionBtn,
                  { backgroundColor: theme.accent },
                  pressed && styles.pressed,
                ]}
                onPress={() => setShowEmailActions(true)}>
                <Ionicons name="mail" size={18} color={theme.accentContrast} />
                <Text style={[styles.primaryActionBtnText, { color: theme.accentContrast }]}>
                  E-posta ile Mesaj Gönder
                </Text>
              </Pressable>

              {/* E-posta Adresi Kopyalama Butonu */}
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryActionBtn,
                  {
                    backgroundColor: copied ? theme.border : theme.surface,
                    borderColor: copied ? theme.accent : theme.border,
                    marginTop: 10,
                  },
                  pressed && styles.pressed,
                ]}
                onPress={handleCopyEmail}>
                <Ionicons
                  name={copied ? 'checkmark-circle' : 'copy-outline'}
                  size={16}
                  color={copied ? theme.accent : theme.text}
                />
                <Text
                  style={[
                    styles.secondaryActionBtnText,
                    { color: copied ? theme.accent : theme.text },
                  ]}>
                  {copied ? 'E-posta Kopyalandı (metin@biyik.dev)' : 'E-posta Adresini Kopyala'}
                </Text>
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
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionPromptOptionBtn,
                      { backgroundColor: theme.accent },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => handleOpenEmail('Öneri & İstek')}>
                    <Ionicons name="bulb-outline" size={17} color={theme.accentContrast} />
                    <Text
                      style={[
                        styles.actionPromptOptionText,
                        { color: theme.accentContrast, fontWeight: '700' },
                      ]}>
                      Öneri veya İstek Paylaş
                    </Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.actionPromptOptionBtn,
                      { backgroundColor: theme.card, borderColor: theme.cardBorder, borderWidth: 1 },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => handleOpenEmail('Hata Bildirimi')}>
                    <Ionicons name="bug-outline" size={17} color={theme.text} />
                    <Text style={[styles.actionPromptOptionText, { color: theme.text }]}>
                      Hata / Eksik Bildir
                    </Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.actionPromptOptionBtn,
                      { backgroundColor: theme.card, borderColor: theme.cardBorder, borderWidth: 1 },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => handleOpenEmail('Teşekkür & Selam')}>
                    <Ionicons name="heart-outline" size={17} color={theme.text} />
                    <Text style={[styles.actionPromptOptionText, { color: theme.text }]}>
                      Teşekkür veya Selam İlet
                    </Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.actionPromptOptionBtn,
                      { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => {
                      handleCopyEmail();
                      setShowEmailActions(false);
                    }}>
                    <Ionicons name="copy-outline" size={17} color={theme.textSecondary} />
                    <Text style={[styles.actionPromptOptionText, { color: theme.textSecondary }]}>
                      Sadece Adresi Kopyala
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  style={[styles.actionPromptCancelBtn, { borderColor: theme.border }]}
                  onPress={() => setShowEmailActions(false)}>
                  <Text style={[styles.actionPromptCancelText, { color: theme.textSecondary }]}>
                    Vazgeç
                  </Text>
                </Pressable>
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
    maxHeight: '88%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 36,
    borderWidth: 1,
    borderBottomWidth: 0,
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
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
  scrollList: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
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
  },
  menuRowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  menuRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentThemeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  menuBadgeText: {
    fontSize: 14,
  },
  activeStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  activeStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  subviewHeader: {
    marginBottom: 16,
  },
  subviewTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  subviewSubtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  optionsList: {
    gap: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  optionContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  optionDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
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
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  paletteSwatches: {
    width: 38,
    height: 38,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
  },
  swatchOverlap: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    bottom: 2,
    left: 2,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  swatchOverlap2: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    top: 2,
    right: 2,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  previewVerseBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  previewKicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  previewVerseText: {
    fontStyle: 'italic',
  },
  previewMeta: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  fontSizeContainer: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  fontSizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  fontSizePillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timePill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  timePillLabel: {
    fontSize: 14,
  },
  timePillDesc: {
    fontSize: 10,
    marginTop: 2,
  },
  widgetInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  widgetInfoBoxText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  widgetCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  widgetSizeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  widgetSizeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  widgetSizeTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  widgetSizeDesc: {
    fontSize: 11,
    marginTop: 1,
    lineHeight: 15,
  },
  guideStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '700',
  },
  guideStepText: {
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 8,
  },
  primaryActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  secondaryActionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  heartMessageCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  heartBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  heartText: {
    fontSize: 13,
    lineHeight: 20,
  },
  heartSubtext: {
    fontSize: 12,
    fontWeight: '600',
  },
  topicTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicTag: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  topicTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  infoTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  versionBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  actionPromptOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  actionPromptBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  actionPromptCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    borderWidth: 1,
    gap: 14,
  },
  actionPromptHeader: {
    alignItems: 'center',
    gap: 4,
    paddingBottom: 4,
  },
  actionPromptIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionPromptTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionPromptSub: {
    fontSize: 12,
  },
  actionPromptButtons: {
    gap: 10,
  },
  actionPromptOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 8,
  },
  actionPromptOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionPromptCancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  actionPromptCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
