import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Fonts, type ThemePalette } from '@/constants/theme';

type KehfModalProps = {
  visible: boolean;
  onClose: () => void;
  theme: ThemePalette;
  onOpenKehfSurah: () => void;
  onOpenJumaSurah: () => void;
};

export function KehfModal({
  visible,
  onClose,
  theme,
  onOpenKehfSurah,
  onOpenJumaSurah,
}: KehfModalProps) {
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
              <View style={[styles.iconBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Ionicons name="sparkles" size={18} color={theme.accent} />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.serif }]}>
                  Cuma & Kehf Suresi
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Peygamber Efendimiz&apos;in (s.a.v.) Cuma Sünneti
                </Text>
              </View>
            </View>

            <Pressable
              hitSlop={8}
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: theme.card }]}>
              <Ionicons name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* 1. Hadis Kartı */}
            <View
              style={[
                styles.hadithCard,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
              ]}>
              <View style={styles.cardHeaderBadge}>
                <Text style={styles.flowerEmoji}>🌸</Text>
                <Text style={[styles.badgeLabel, { color: theme.accent }]}>HADİS-İ ŞERİF</Text>
              </View>

              <Text
                style={[
                  styles.hadithText,
                  { color: theme.text, fontFamily: Fonts.serif },
                ]}>
                &ldquo;Kim Cuma günü Kehf Sûresi&apos;ni okursa, iki Cuma arası onun için nur gibi aydınlanır.&rdquo;
              </Text>
              <Text style={[styles.hadithSource, { color: theme.textSecondary }]}>
                — Hâkim, el-Müstedrek, II, 399; Beyhakî
              </Text>
            </View>

            {/* 2. Deccal Fitnesinden Korunma Hadisi */}
            <View
              style={[
                styles.hadithCard,
                { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 12 },
              ]}>
              <View style={styles.cardHeaderBadge}>
                <Text style={styles.flowerEmoji}>🌿</Text>
                <Text style={[styles.badgeLabel, { color: theme.accent }]}>MANEVİ SİPER</Text>
              </View>

              <Text
                style={[
                  styles.hadithText,
                  { color: theme.text, fontFamily: Fonts.serif },
                ]}>
                &ldquo;Kim Kehf Sûresi&apos;nin başından (veya sonundan) on ayet ezberlerse, fitnelerden ve Deccal&apos;in şerrinden korunur.&rdquo;
              </Text>
              <Text style={[styles.hadithSource, { color: theme.textSecondary }]}>
                — Müslim, Müsâfirîn, 257; Ebû Dâvûd
              </Text>
            </View>

            {/* Hızlı Erişim Aksiyonları */}
            <Text style={[styles.sectionTitle, { color: theme.accent, marginTop: 20 }]}>
              CUMA GÜNÜ AYETLERİNE HIZLI ERİŞİM
            </Text>

            {/* Kehf Suresi 1. Ayet Butonu */}
            <Pressable
              style={({ pressed }) => [
                styles.actionRowBtn,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
                pressed && styles.pressed,
              ]}
              onPress={() => {
                onClose();
                onOpenKehfSurah();
              }}>
              <View style={[styles.btnIconBox, { backgroundColor: theme.surface }]}>
                <Ionicons name="book-outline" size={20} color={theme.accent} />
              </View>
              <View style={styles.btnTextContent}>
                <Text style={[styles.btnTitle, { color: theme.text }]}>
                  Kehf Suresi 1. Ayetine Git
                </Text>
                <Text style={[styles.btnSub, { color: theme.textSecondary }]}>
                  18. Sure · 15. Cüz · Hamd edenlerin suresi
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </Pressable>

            {/* Cum'a Suresi 9. Ayet Butonu */}
            <Pressable
              style={({ pressed }) => [
                styles.actionRowBtn,
                { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 10 },
                pressed && styles.pressed,
              ]}
              onPress={() => {
                onClose();
                onOpenJumaSurah();
              }}>
              <View style={[styles.btnIconBox, { backgroundColor: theme.surface }]}>
                <Ionicons name="notifications-outline" size={20} color={theme.accent} />
              </View>
              <View style={styles.btnTextContent}>
                <Text style={[styles.btnTitle, { color: theme.text }]}>
                  Cum&apos;a Suresi 9. Ayetine Git
                </Text>
                <Text style={[styles.btnSub, { color: theme.textSecondary }]}>
                  62. Sure · 28. Cüz · Cuma namazına ve zikre çağrı
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '85%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 20,
  },
  hadithCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
  },
  cardHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flowerEmoji: {
    fontSize: 13,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  hadithText: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  hadithSource: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  btnIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTextContent: {
    flex: 1,
  },
  btnTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  btnSub: {
    fontSize: 12,
  },
  pressed: {
    opacity: 0.75,
  },
});
