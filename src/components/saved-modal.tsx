import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Fonts, type ThemePalette } from '@/constants/theme';
import { getAllVerseNotes, type SavedVerse, type VerseNote } from '@/lib/storage';

type SavedModalProps = {
  visible: boolean;
  onClose: () => void;
  savedVerses: SavedVerse[];
  onRemove: (id: string) => void;
  onSelectVerse: (verse: SavedVerse) => void;
  theme: ThemePalette;
};

export function SavedModal({
  visible,
  onClose,
  savedVerses,
  onRemove,
  onSelectVerse,
  theme,
}: SavedModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notesMap, setNotesMap] = useState<Record<string, VerseNote>>({});

  useEffect(() => {
    if (visible) {
      let active = true;
      getAllVerseNotes().then((notes) => {
        if (active) setNotesMap(notes);
      });
      return () => {
        active = false;
      };
    }
  }, [visible]);

  const filteredVerses = useMemo(() => {
    if (!searchQuery.trim()) return savedVerses;
    const q = searchQuery.toLowerCase().trim();
    return savedVerses.filter(
      (v) =>
        v.surahName.toLowerCase().includes(q) ||
        v.meaning.toLowerCase().includes(q) ||
        `${v.ayahNumber}` === q ||
        (notesMap[v.id]?.note && notesMap[v.id].note.toLowerCase().includes(q))
    );
  }, [savedVerses, searchQuery, notesMap]);

  const copySavedText = async (item: SavedVerse) => {
    const text = `${item.surahName} Suresi, ${item.ayahNumber}. Ayet (${item.juz}. Cüz)\n\n“${item.meaning}”\n\n— 1 Ayet`;
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        try {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        } catch {
          await Clipboard.setStringAsync(text);
        }
      } else {
        await Clipboard.setStringAsync(text);
      }
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      Alert.alert('Hata', 'Ayet panoya kopyalanamadı.');
    }
  };

  const shareSavedText = async (item: SavedVerse) => {
    try {
      const message = `${item.surahName} Suresi, ${item.ayahNumber}. Ayet (${item.juz}. Cüz)\n\n“${item.meaning}”\n\n— 1 Ayet`;
      await Share.share({
        message,
        title: `${item.surahName} Suresi, ${item.ayahNumber}. Ayet`,
      });
    } catch (error) {
      console.error('Paylaşım hatası:', error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.container,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
          onPress={(e) => e.stopPropagation()}>
          {/* Başlık Çubuğu */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.serif }]}>
                Kaydedilenler
              </Text>
              {savedVerses.length > 0 && (
                <View style={[styles.countBadge, { backgroundColor: theme.card }]}>
                  <Text style={[styles.countText, { color: theme.textSecondary }]}>
                    {savedVerses.length}
                  </Text>
                </View>
              )}
            </View>
            <Pressable
              hitSlop={8}
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: theme.card }]}>
              <Ionicons name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          {/* Arama Kutusu (Kaydedilen ayet sayısı 2 veya fazlaysa) */}
          {savedVerses.length >= 2 && (
            <View
              style={[
                styles.searchBox,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
              ]}>
              <Ionicons name="search-outline" size={16} color={theme.textSecondary} />
              <TextInput
                placeholder="Sure veya ayet içeriğinde ara..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.searchInput, { color: theme.text }]}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <Pressable hitSlop={6} onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
                </Pressable>
              )}
            </View>
          )}

          {/* Liste veya Boş Durum */}
          {savedVerses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconBox, { backgroundColor: theme.card }]}>
                <Ionicons name="bookmark-outline" size={36} color={theme.textSecondary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                Henüz kayıtlı ayet yok
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Günün ayetini ana ekrandaki &ldquo;Kaydet&rdquo; butonuna dokunarak buraya ekleyebilirsiniz.
              </Text>
            </View>
          ) : filteredVerses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Sonuç bulunamadı</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                &ldquo;{searchQuery}&rdquo; ile eşleşen bir ayet bulunamadı.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredVerses}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isCopied = copiedId === item.id;
                return (
                  <View
                    style={[
                      styles.verseCard,
                      { backgroundColor: theme.card, borderColor: theme.cardBorder },
                    ]}>
                    <Pressable
                      style={styles.cardHeader}
                      onPress={() => {
                        onSelectVerse(item);
                        onClose();
                      }}>
                      <View style={styles.cardInfo}>
                        <View style={styles.cardSurahRow}>
                          <Ionicons
                            name="leaf-outline"
                            size={15}
                            color={theme.accent}
                            style={styles.cardSurahLeaf}
                          />
                          <Text style={[styles.cardSurah, { color: theme.text, fontFamily: Fonts.serif }]}>
                            {item.surahName} Suresi
                          </Text>
                        </View>
                        <Text style={[styles.cardMeta, { color: theme.textSecondary }]}>
                          {item.juz}. Cüz · {item.ayahNumber}. Ayet
                        </Text>
                      </View>
                      <Ionicons name="open-outline" size={18} color={theme.textSecondary} />
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        onSelectVerse(item);
                        onClose();
                      }}>
                      <Text
                        numberOfLines={4}
                        style={[styles.cardMeaning, { color: theme.text, fontFamily: Fonts.serif }]}>
                        {`“${item.meaning}”`}
                      </Text>
                    </Pressable>

                    {/* Varsa Ayete Eklenen Tefekkür Notu */}
                    {notesMap[item.id]?.note && (
                      <View
                        style={[
                          styles.noteBadgeContainer,
                          { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                        ]}>
                        <View style={styles.noteBadgeHeader}>
                          <Ionicons name="journal-outline" size={13} color={theme.accent} />
                          <Text style={[styles.noteBadgeTitle, { color: theme.accent }]}>
                            Tefekkür Notunuz
                          </Text>
                        </View>
                        <Text
                          numberOfLines={2}
                          style={[styles.noteBadgeText, { color: theme.textSecondary }]}>
                          {notesMap[item.id].note}
                        </Text>
                      </View>
                    )}

                    <View style={[styles.cardDivider, { backgroundColor: theme.cardBorder }]} />

                    <View style={styles.cardActions}>
                      {/* Hızlı Kopyala Butonu */}
                      <Pressable
                        style={styles.actionBtn}
                        hitSlop={6}
                        onPress={() => copySavedText(item)}>
                        <Ionicons
                          name={isCopied ? 'checkmark-circle' : 'copy-outline'}
                          size={16}
                          color={isCopied ? theme.accent : theme.textSecondary}
                        />
                        <Text
                          style={[
                            styles.actionBtnText,
                            { color: isCopied ? theme.accent : theme.textSecondary },
                          ]}>
                          {isCopied ? 'Kopyalandı' : 'Kopyala'}
                        </Text>
                      </Pressable>

                      {/* Paylaş Butonu */}
                      <Pressable
                        style={styles.actionBtn}
                        hitSlop={6}
                        onPress={() => shareSavedText(item)}>
                        <Ionicons name="share-outline" size={16} color={theme.textSecondary} />
                        <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>
                          Paylaş
                        </Text>
                      </Pressable>

                      {/* Sil Butonu */}
                      <Pressable
                        style={styles.actionBtn}
                        hitSlop={6}
                        onPress={() => onRemove(item.id)}>
                        <Ionicons name="trash-outline" size={16} color={theme.danger} />
                        <Text style={[styles.actionBtnText, { color: theme.danger }]}>
                          Sil
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              }}
            />
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
  container: {
    width: '100%',
    maxWidth: 520,
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 14,
  },
  verseCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardInfo: {
    flex: 1,
  },
  cardSurahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardSurahLeaf: {
    marginTop: 1,
  },
  cardSurah: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  cardMeaning: {
    fontSize: 15,
    lineHeight: 24,
    marginTop: 4,
  },
  noteBadgeContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  noteBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  noteBadgeTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  noteBadgeText: {
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  cardDivider: {
    height: 1,
    marginTop: 12,
    marginBottom: 10,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
