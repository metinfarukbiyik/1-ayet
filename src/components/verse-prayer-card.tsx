import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Fonts, type ThemePalette } from '@/constants/theme';
import type { DailyVerse } from '@/lib/daily-verse';
import { getPrayerForVerse } from '@/lib/verse-prayers';

type VersePrayerCardProps = {
  verse: DailyVerse;
  theme: ThemePalette;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
};

export function VersePrayerCard({
  verse,
  theme,
  isExpanded: controlledExpanded,
  onToggleExpand,
}: VersePrayerCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const toggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  };

  const prayerData = useMemo(() => getPrayerForVerse(verse), [verse]);

  if (!isExpanded) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.triggerPill,
          { backgroundColor: theme.card, borderColor: theme.cardBorder },
          pressed && styles.pressed,
        ]}
        onPress={toggleExpand}>
        <View style={styles.triggerLeft}>
          <Text style={styles.triggerEmoji}>🤲</Text>
          <Text style={[styles.triggerTitle, { color: theme.text }]}>
            Ayetin Duası & Tefekkür Damlası
          </Text>
        </View>
        <Ionicons name="chevron-down" size={15} color={theme.accent} />
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
      ]}>
      {/* Üst Başlık & Kapatma */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Text style={styles.headerEmoji}>🤲</Text>
          <View>
            <Text style={[styles.headerKicker, { color: theme.accent }]}>
              AYETİN DUASI & TEFEKKÜR
            </Text>
            <Text style={[styles.themeBadge, { color: theme.textSecondary }]}>
              {prayerData.theme}
            </Text>
          </View>
        </View>

        <Pressable
          hitSlop={8}
          style={styles.closeBtn}
          onPress={toggleExpand}>
          <Ionicons name="chevron-up" size={18} color={theme.textSecondary} />
        </Pressable>
      </View>

      {/* Dua Metni */}
      <Text
        selectable
        style={[
          styles.prayerText,
          { color: theme.text, fontFamily: Fonts.serif },
        ]}>
        &ldquo;{prayerData.prayer}&rdquo;
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  triggerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    width: '100%',
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  triggerEmoji: {
    fontSize: 15,
  },
  triggerTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  container: {
    width: '100%',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerEmoji: {
    fontSize: 18,
  },
  headerKicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  themeBadge: {
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  prayerText: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  pressed: {
    opacity: 0.7,
  },
});
