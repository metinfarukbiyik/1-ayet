import {
  Divider,
  HStack,
  Link,
  Spacer,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import {
  background,
  containerBackground,
  cornerRadius,
  font,
  foregroundStyle,
  lineLimit,
  lineSpacing,
  multilineTextAlignment,
  padding,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type DailyVerseWidgetProps = {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  juz: number;
  meaning: string;
  dateLabel: string;
  isFriday: boolean;
  prayer: string;
  prayerTheme: string;
  bgStart?: string;
  bgEnd?: string;
  accentColor?: string;
  textColor?: string;
  secondaryTextColor?: string;
  cardBgColor?: string;
  badgeBgColor?: string;
};

export const DailyVerseWidget = createWidget<DailyVerseWidgetProps>(
  'DailyVerseWidget',
  (rawProps, context: WidgetEnvironment) => {
    'widget';

    const p = {
      surahName: rawProps?.surahName || 'Fâtiha',
      surahNumber: rawProps?.surahNumber || 1,
      ayahNumber: rawProps?.ayahNumber || 2,
      juz: rawProps?.juz || 1,
      meaning: rawProps?.meaning || 'Hamd, Âlemlerin Rabbi olan Allah’a mahsustur.',
      dateLabel: rawProps?.dateLabel || 'Günün Ayeti',
      isFriday: Boolean(rawProps?.isFriday),
      prayer: rawProps?.prayer || 'Hamdolsun bizi yaratan, yaşatan ve hidayet bahşeden Rabbimize.',
      prayerTheme: rawProps?.prayerTheme || 'Şükür ve Hamd',
      bgStart: rawProps?.bgStart || '#0B3D34',
      bgEnd: rawProps?.bgEnd || '#06201B',
      accentColor: rawProps?.accentColor || '#E8C488',
      textColor: rawProps?.textColor || '#F6F1E8',
      secondaryTextColor: rawProps?.secondaryTextColor || '#A1BFB8',
      cardBgColor: rawProps?.cardBgColor || '#09322A',
      badgeBgColor: rawProps?.badgeBgColor || '#124E43',
    };

    const widgetBackground = containerBackground(
      {
        type: 'linearGradient',
        colors: [p.bgStart, p.bgEnd],
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 1, y: 1 },
      },
      'widget'
    );

    // 1) KARE WIDGET (systemSmall - 2x2)
    if (context.widgetFamily === 'systemSmall') {
      return (
        <VStack
          alignment="leading"
          spacing={6}
          modifiers={[
            widgetURL('birayet://?openPrayer=true'),
            widgetBackground,
          ]}
        >
          {/* Üst Rozet & Sure Bilgisi */}
          <HStack alignment="center">
            <Text
              modifiers={[
                font({ size: 11, weight: 'bold' }),
                foregroundStyle(p.accentColor),
              ]}
            >
              {p.isFriday ? '🌸 Cuma' : '🌿 Bir Ayet'}
            </Text>
            <Spacer />
            <Text
              modifiers={[
                font({ size: 10, weight: 'semibold' }),
                foregroundStyle(p.secondaryTextColor),
              ]}
            >
              {p.surahName} {p.ayahNumber}
            </Text>
          </HStack>

          {/* Ayet Meali */}
          <Text
            modifiers={[
              font({ size: 12, weight: 'regular', design: 'serif' }),
              foregroundStyle(p.textColor),
              multilineTextAlignment('leading'),
              lineLimit(5),
              lineSpacing(2),
            ]}
          >
            {`“${p.meaning}”`}
          </Text>

          <Spacer />

          {/* Alt: Ayetin Duası İpucu */}
          <HStack alignment="center">
            <Text
              modifiers={[
                font({ size: 10, weight: 'semibold' }),
                foregroundStyle(p.accentColor),
              ]}
            >
              🤲 Ayetin Duasını Oku
            </Text>
            <Spacer />
            <Text
              modifiers={[
                font({ size: 11, weight: 'bold' }),
                foregroundStyle(p.accentColor),
              ]}
            >
              →
            </Text>
          </HStack>
        </VStack>
      );
    }

    // 2) BÜYÜK KARE WIDGET (systemLarge - 4x4)
    if (context.widgetFamily === 'systemLarge') {
      return (
        <VStack
          alignment="leading"
          spacing={8}
          modifiers={[
            widgetURL('birayet://'),
            widgetBackground,
          ]}
        >
          {/* Üst Satır */}
          <HStack alignment="center">
            <Text
              modifiers={[
                font({ size: 12, weight: 'bold' }),
                foregroundStyle(p.accentColor),
              ]}
            >
              {p.isFriday ? '🌸 Bir Ayet · Cuma' : '🌿 Bir Ayet'}
            </Text>
            <Text
              modifiers={[
                font({ size: 12, weight: 'bold' }),
                foregroundStyle(p.textColor),
              ]}
            >
              {` · ${p.surahName} Suresi`}
            </Text>
            <Spacer />
            <Text
              modifiers={[
                font({ size: 11, weight: 'medium' }),
                foregroundStyle(p.secondaryTextColor),
              ]}
            >
              {p.dateLabel}
            </Text>
          </HStack>

          <Text
            modifiers={[
              font({ size: 11, weight: 'semibold' }),
              foregroundStyle(p.secondaryTextColor),
            ]}
          >
            {`${p.surahName} Suresi, ${p.ayahNumber}. Ayet (${p.juz}. Cüz)`}
          </Text>

          {/* Ayet Meali */}
          <Text
            modifiers={[
              font({ size: 14, weight: 'regular', design: 'serif' }),
              foregroundStyle(p.textColor),
              multilineTextAlignment('leading'),
              lineLimit(6),
              lineSpacing(3),
            ]}
          >
            {`“${p.meaning}”`}
          </Text>

          <Spacer />
          <Divider />
          <Spacer />

          {/* Tefekkür ve Dua Bölümü */}
          <Link destination="birayet://?openPrayer=true">
            <VStack
              alignment="leading"
              spacing={4}
              modifiers={[
                padding({ all: 10 }),
                background(p.cardBgColor),
                cornerRadius(10),
              ]}
            >
              <HStack alignment="center">
                <Text
                  modifiers={[
                    font({ size: 10, weight: 'bold' }),
                    foregroundStyle(p.accentColor),
                  ]}
                >
                  {`🤲 AYETİN DUASI · ${p.prayerTheme.toUpperCase()}`}
                </Text>
                <Spacer />
                <Text
                  modifiers={[
                    font({ size: 10, weight: 'bold' }),
                    foregroundStyle(p.accentColor),
                  ]}
                >
                  Uygulamada Aç →
                </Text>
              </HStack>
              <Text
                modifiers={[
                  font({ size: 11, weight: 'regular', design: 'serif' }),
                  foregroundStyle(p.textColor),
                  multilineTextAlignment('leading'),
                  lineLimit(3),
                  lineSpacing(2),
                ]}
              >
                {p.prayer}
              </Text>
            </VStack>
          </Link>
        </VStack>
      );
    }

    // 3) YATAYDA GENİŞ WIDGET (systemMedium - 4x2, Varsayılan)
    return (
      <VStack
        alignment="leading"
        spacing={6}
        modifiers={[
          widgetURL('birayet://'),
          widgetBackground,
        ]}
      >
        {/* Üst Satır */}
        <HStack alignment="center">
          <Text
            modifiers={[
              font({ size: 11, weight: 'bold' }),
              foregroundStyle(p.accentColor),
            ]}
          >
            {p.isFriday ? '🌸 Bir Ayet · Cuma' : '🌿 Bir Ayet'}
          </Text>
          <Text
            modifiers={[
              font({ size: 11, weight: 'semibold' }),
              foregroundStyle(p.textColor),
            ]}
          >
            {` · ${p.surahName} ${p.ayahNumber}. Ayet`}
          </Text>
          <Spacer />
          <Text
            modifiers={[
              font({ size: 10, weight: 'medium' }),
              foregroundStyle(p.secondaryTextColor),
            ]}
          >
            {p.dateLabel}
          </Text>
        </HStack>

        {/* Ayet Meali */}
        <Text
          modifiers={[
            font({ size: 13, weight: 'regular', design: 'serif' }),
            foregroundStyle(p.textColor),
            multilineTextAlignment('leading'),
            lineLimit(3),
            lineSpacing(3),
          ]}
        >
          {`“${p.meaning}”`}
        </Text>

        <Spacer />

        {/* Alt Satır: Cüz Bilgisi ve Ayetin Duası Butonu */}
        <HStack alignment="center">
          <Text
            modifiers={[
              font({ size: 10, weight: 'regular' }),
              foregroundStyle(p.secondaryTextColor),
            ]}
          >
            {`${p.juz}. Cüz · Diyanet Meali`}
          </Text>
          <Spacer />
          <Link destination="birayet://?openPrayer=true">
            <HStack
              alignment="center"
              spacing={4}
              modifiers={[
                padding({ horizontal: 10, vertical: 4 }),
                background(p.badgeBgColor),
                cornerRadius(12),
              ]}
            >
              <Text
                modifiers={[
                  font({ size: 11, weight: 'semibold' }),
                  foregroundStyle(p.accentColor),
                ]}
              >
                🤲 Ayetin Duası
              </Text>
            </HStack>
          </Link>
        </HStack>
      </VStack>
    );
  }
);
