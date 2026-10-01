import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  Share,
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
  const [copied, setCopied] = useState(false);

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const toggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  };

  const prayerData = useMemo(() => getPrayerForVerse(verse), [verse]);

  const handleCopyPrayer = async () => {
    const textToCopy = `“${prayerData.prayer}”\n\n— ${verse.surahName} Suresi ${verse.ayahNumber}. Ayet Tefekkür Duası · 1 Ayet`;
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sessizce geç
    }
  };

  const handleSharePrayer = async () => {
    try {
      await Share.share({
        message: `“${prayerData.prayer}”\n\n— ${verse.surahName} Suresi ${verse.ayahNumber}. Ayet Tefekkür Duası · 1 Ayet`,
        title: 'Ayetin Duası',
      });
    } catch {
      // Sessizce geç
    }
  };

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

      {/* Alt Eylemler: Sadece Kopyala ve Paylaş */}
      <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

      <View style={styles.actionsRow}>
        <Pressable
          style={({ pressed }) => [
            styles.actionBtn,
            {
              backgroundColor: copied ? theme.border : theme.surface,
              borderColor: copied ? theme.accent : theme.border,
            },
            pressed && styles.pressed,
          ]}
          onPress={handleCopyPrayer}>
          <Ionicons
            name={copied ? 'checkmark-circle' : 'copy-outline'}
            size={13}
            color={copied ? theme.accent : theme.text}
          />
          <Text
            style={[
              styles.actionBtnText,
              { color: copied ? theme.accent : theme.text },
            ]}>
            {copied ? 'Kopyalandı' : 'Kopyala'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: theme.surface, borderColor: theme.border },
            pressed && styles.pressed,
          ]}
          onPress={handleSharePrayer}>
          <Ionicons name="share-outline" size={13} color={theme.text} />
          <Text style={[styles.actionBtnText, { color: theme.text }]}>Paylaş</Text>
        </Pressable>
      </View>
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
    alignItems: 'center',
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
  divider: {
    height: 1,
    width: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
});
