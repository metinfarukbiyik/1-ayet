import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Fonts, type ThemePalette } from '@/constants/theme';
import type { DailyVerse } from '@/lib/daily-verse';
import { getVerseNote, saveVerseNote } from '@/lib/storage';

type VerseNoteModalProps = {
  visible: boolean;
  onClose: () => void;
  verse: DailyVerse;
  theme: ThemePalette;
  onNoteSaved?: (hasNote: boolean) => void;
};

export function VerseNoteModal({
  visible,
  onClose,
  verse,
  theme,
  onNoteSaved,
}: VerseNoteModalProps) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isMeaningExpanded, setIsMeaningExpanded] = useState(false);

  const handleClose = () => {
    setIsMeaningExpanded(false);
    onClose();
  };

  useEffect(() => {
    if (visible) {
      let active = true;
      getVerseNote(verse.surahNumber, verse.ayahNumber).then((saved) => {
        if (active) {
          setNote(saved);
          setSavedSuccess(false);
        }
      });
      return () => {
        active = false;
      };
    }
  }, [visible, verse.surahNumber, verse.ayahNumber]);

  const handleSave = async () => {
    setSaving(true);
    await saveVerseNote(verse.surahNumber, verse.ayahNumber, note);
    setSaving(false);
    setSavedSuccess(true);
    onNoteSaved?.(note.trim().length > 0);
    setTimeout(() => {
      setSavedSuccess(false);
      handleClose();
    }, 900);
  };

  const handleClear = async () => {
    setNote('');
    setSaving(true);
    await saveVerseNote(verse.surahNumber, verse.ayahNumber, '');
    setSaving(false);
    onNoteSaved?.(false);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}>
        <Pressable style={styles.backdropClickable} onPress={handleClose} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.background,
              borderColor: theme.cardBorder,
            },
          ]}>
          {/* Başlık ve Kapatma Butonu */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={[styles.iconBadge, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="journal-outline" size={18} color={theme.accent} />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.serif }]}>
                  Tefekkür & Kişisel Not
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  {verse.surahName} Suresi · {verse.ayahNumber}. Ayet
                </Text>
              </View>
            </View>

            <Pressable
              hitSlop={8}
              onPress={handleClose}
              style={[styles.closeBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="close" size={18} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}>
            {/* Ayet Hatırlatıcı Kartı (Tıklanınca Tamamı Açılır / Daralır) */}
            <Pressable
              style={({ pressed }) => [
                styles.versePreview,
                { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                pressed && styles.pressed,
              ]}
              onPress={() => setIsMeaningExpanded((prev) => !prev)}>
              <Text
                numberOfLines={isMeaningExpanded ? undefined : 3}
                style={[
                  styles.versePreviewText,
                  { color: theme.textSecondary, fontFamily: Fonts.serif },
                ]}>
                “{verse.meaning}”
              </Text>

              <View style={styles.expandRow}>
                <Text style={[styles.expandText, { color: theme.accent }]}>
                  {isMeaningExpanded ? 'Daha az göster' : 'Tamamını oku'}
                </Text>
                <Ionicons
                  name={isMeaningExpanded ? 'chevron-up' : 'chevron-down'}
                  size={13}
                  color={theme.accent}
                />
              </View>
            </Pressable>

            {/* Not Yazma Alanı */}
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                BU AYETTEN ALDIĞINIZ İLHAM VE DÜŞÜNCELERİNİZ
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    color: theme.text,
                    fontFamily: Fonts.serif,
                  },
                ]}
                placeholder="Bu ayet size ne hissettirdi? Hayatınıza dair nasıl bir ders veya hatırlatma çıkardınız..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={note}
                onChangeText={setNote}
              />
            </View>

            {/* Alt Eylemler */}
            <View style={styles.actionRow}>
              {note.length > 0 && (
                <Pressable
                  style={({ pressed }) => [
                    styles.clearBtn,
                    { borderColor: theme.border },
                    pressed && styles.pressed,
                  ]}
                  onPress={handleClear}>
                  <Ionicons name="trash-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.clearBtnText, { color: theme.textSecondary }]}>Temizle</Text>
                </Pressable>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.saveBtn,
                  {
                    backgroundColor: savedSuccess ? theme.border : theme.accent,
                    borderColor: theme.accent,
                  },
                  pressed && styles.pressed,
                ]}
                disabled={saving}
                onPress={handleSave}>
                <Ionicons
                  name={savedSuccess ? 'checkmark-circle' : 'checkmark'}
                  size={18}
                  color={savedSuccess ? theme.accent : theme.accentContrast}
                />
                <Text
                  style={[
                    styles.saveBtnText,
                    { color: savedSuccess ? theme.accent : theme.accentContrast },
                  ]}>
                  {savedSuccess ? 'Kaydedildi ✓' : saving ? 'Kaydediliyor...' : 'Notu Kaydet'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdropClickable: {
    flex: 1,
  },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  versePreview: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 18,
  },
  versePreviewText: {
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  expandText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    fontSize: 15,
    lineHeight: 24,
    minHeight: 140,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
});
