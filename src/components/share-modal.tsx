import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { useState, type RefObject } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { Fonts, type ThemePalette } from '@/constants/theme';
import type { DailyVerse } from '@/lib/daily-verse';

type ShareModalProps = {
  visible: boolean;
  onClose: () => void;
  verse: DailyVerse;
  dateLabel: string;
  theme: ThemePalette;
  storyCardRef: RefObject<View | null>;
  isFriday?: boolean;
};

export function ShareModal({
  visible,
  onClose,
  verse,
  theme,
  storyCardRef,
  isFriday = false,
}: ShareModalProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const shareAsText = async () => {
    try {
      const message = isFriday
        ? `🌸 Hayırlı Cumalar 🌿\n\n“${verse.meaning}”\n\n— ${verse.surahName} Suresi, ${verse.ayahNumber}. Ayet (${verse.juz}. Cüz)\n\nCumanız mübarek, dualarınız kabul olsun. · 1 Ayet`
        : `${verse.surahName} Suresi, ${verse.ayahNumber}. Ayet (${verse.juz}. Cüz)\n\n“${verse.meaning}”\n\n— 1 Ayet`;
      await Share.share({
        message,
        title: isFriday
          ? `Hayırlı Cumalar - ${verse.surahName} Suresi, ${verse.ayahNumber}. Ayet`
          : `${verse.surahName} Suresi, ${verse.ayahNumber}. Ayet`,
      });
      onClose();
    } catch (error) {
      console.error('Metin paylaşılırken hata:', error);
    }
  };

  const captureImageUri = async (): Promise<string | null> => {
    if (!storyCardRef.current) {
      Alert.alert('Hata', 'Görsel henüz hazır değil, lütfen tekrar deneyin.');
      return null;
    }
    return await captureRef(storyCardRef.current, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
  };

  const shareAsImage = async () => {
    setLoadingAction('image');
    try {
      const uri = await captureImageUri();
      if (!uri) return;

      if (Platform.OS === 'web') {
        downloadImageOnWeb(uri, `1ayet-${verse.surahName}-${verse.ayahNumber}.png`);
        Alert.alert('Görsel İndirildi', 'Hikaye görseli cihazınıza indirildi. WhatsApp veya Instagram üzerinden paylaşabilirsiniz.');
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: `${verse.surahName} Suresi Paylaş`,
            UTI: 'public.png',
          });
        } else {
          Alert.alert('Paylaşım', 'Cihazınızda dosya paylaşımı desteklenmiyor.');
        }
      }
      onClose();
    } catch (error) {
      console.error('Görsel paylaşılırken hata:', error);
      Alert.alert('Hata', 'Görsel paylaşılırken bir sorun oluştu.');
    } finally {
      setLoadingAction(null);
    }
  };

  const saveImageToDevice = async () => {
    setLoadingAction('save');
    try {
      const uri = await captureImageUri();
      if (!uri) return;

      if (Platform.OS === 'web') {
        downloadImageOnWeb(uri, `1ayet-${verse.surahName}-${verse.ayahNumber}.png`);
        Alert.alert('Başarılı', 'Görsel cihazınıza indirildi.');
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Görseli Kaydet',
            UTI: 'public.png',
          });
        } else {
          Alert.alert('Hata', 'Görsel kaydedilemedi.');
        }
      }
      onClose();
    } catch (error) {
      console.error('Görsel kaydedilirken hata:', error);
      Alert.alert('Hata', 'Görsel kaydedilirken bir sorun oluştu.');
    } finally {
      setLoadingAction(null);
    }
  };

  const downloadImageOnWeb = (dataUri: string, filename: string) => {
    if (typeof document === 'undefined') return;
    const a = document.createElement('a');
    a.href = dataUri;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
          onPress={(e) => e.stopPropagation()}>
          {/* Başlık ve Kapat */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.serif }]}>
                Ayeti Paylaş
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Nasıl paylaşmak istersiniz?
              </Text>
            </View>
            <Pressable
              hitSlop={8}
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: theme.card }]}>
              <Ionicons name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          {/* Seçenekler */}
          <View style={styles.optionsList}>
            {/* Metin Paylaşımı */}
            <Pressable
              style={({ pressed }) => [
                styles.optionItem,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
                pressed && styles.pressed,
              ]}
              onPress={shareAsText}>
              <View style={[styles.optionIconBox, { backgroundColor: theme.border }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color={theme.text} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>
                  Metin Mesajı Olarak Paylaş
                </Text>
                <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                  WhatsApp, SMS veya kopyalayarak doğrudan ilet
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </Pressable>

            {/* Dikey Görsel Paylaşımı */}
            <Pressable
              disabled={loadingAction !== null}
              style={({ pressed }) => [
                styles.optionItem,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
                pressed && styles.pressed,
              ]}
              onPress={shareAsImage}>
              <View style={[styles.optionIconBox, { backgroundColor: theme.border }]}>
                {loadingAction === 'image' ? (
                  <ActivityIndicator size="small" color={theme.text} />
                ) : (
                  <Ionicons name="share-social-outline" size={22} color={theme.text} />
                )}
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>
                  Dikey Görsel Olarak Paylaş
                </Text>
                <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                  Instagram Hikaye veya WhatsApp Durum için 9:16 görsel kart
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </Pressable>

            {/* Görseli Kaydet */}
            <Pressable
              disabled={loadingAction !== null}
              style={({ pressed }) => [
                styles.optionItem,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
                pressed && styles.pressed,
              ]}
              onPress={saveImageToDevice}>
              <View style={[styles.optionIconBox, { backgroundColor: theme.border }]}>
                {loadingAction === 'save' ? (
                  <ActivityIndicator size="small" color={theme.text} />
                ) : (
                  <Ionicons name="download-outline" size={22} color={theme.text} />
                )}
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>
                  Görseli Cihaza Kaydet
                </Text>
                <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                  Hikaye görselini fotoğraflarına veya indirilenlere kaydet
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </Pressable>
          </View>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsList: {
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  pressed: {
    opacity: 0.8,
  },
  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
});
