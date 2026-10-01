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
};

const DEFAULT_PROPS: DailyVerseWidgetProps = {
  surahName: 'Fâtiha',
  surahNumber: 1,
  ayahNumber: 2,
  juz: 1,
  meaning: 'Hamd, Âlemlerin Rabbi olan Allah’a mahsustur.',
  dateLabel: 'Günün Ayeti',
  isFriday: false,
  prayer: 'Hamdolsun bizi yaratan, yaşatan ve hidayet bahşeden Rabbimize.',
  prayerTheme: 'Şükür ve Hamd',
};

const widgetBackground = containerBackground(
  {
    type: 'linearGradient',
    colors: ['#0B3D34', '#07241E'],
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 1, y: 1 },
  },
  'widget'
);

export const DailyVerseWidget = createWidget<DailyVerseWidgetProps>(
  'DailyVerseWidget',
  (rawProps, context: WidgetEnvironment) => {
    'widget';

    const p = {
      surahName: rawProps?.surahName ?? DEFAULT_PROPS.surahName,
      surahNumber: rawProps?.surahNumber ?? DEFAULT_PROPS.surahNumber,
      ayahNumber: rawProps?.ayahNumber ?? DEFAULT_PROPS.ayahNumber,
      juz: rawProps?.juz ?? DEFAULT_PROPS.juz,
      meaning: rawProps?.meaning ?? DEFAULT_PROPS.meaning,
      dateLabel: rawProps?.dateLabel ?? DEFAULT_PROPS.dateLabel,
      isFriday: Boolean(rawProps?.isFriday),
      prayer: rawProps?.prayer ?? DEFAULT_PROPS.prayer,
      prayerTheme: rawProps?.prayerTheme ?? DEFAULT_PROPS.prayerTheme,
    };

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
                foregroundStyle('#E8C488'),
              ]}
            >
              {p.isFriday ? '🌸 Cuma' : '🌿 Bir Ayet'}
            </Text>
            <Spacer />
            <Text
              modifiers={[
                font({ size: 10, weight: 'semibold' }),
                foregroundStyle('#B3CBC5'),
              ]}
            >
              {p.surahName} {p.ayahNumber}
            </Text>
          </HStack>

          {/* Ayet Meali */}
          <Text
            modifiers={[
              font({ size: 12, weight: 'regular', design: 'serif' }),
              foregroundStyle('#F6F1E8'),
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
                foregroundStyle('#E8C488'),
              ]}
            >
              🤲 Ayetin Duasını Oku
            </Text>
            <Spacer />
            <Text
              modifiers={[
                font({ size: 11, weight: 'bold' }),
                foregroundStyle('#E8C488'),
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
                foregroundStyle('#E8C488'),
              ]}
            >
              {p.isFriday ? '🌸 Bir Ayet · Cuma' : '🌿 Bir Ayet'}
            </Text>
            <Text
              modifiers={[
                font({ size: 12, weight: 'bold' }),
                foregroundStyle('#FFFFFF'),
              ]}
            >
              {` · ${p.surahName} Suresi`}
            </Text>
            <Spacer />
            <Text
              modifiers={[
                font({ size: 11, weight: 'medium' }),
                foregroundStyle('#A1BFB8'),
              ]}
            >
              {p.dateLabel}
            </Text>
          </HStack>

          <Text
            modifiers={[
              font({ size: 11, weight: 'semibold' }),
              foregroundStyle('#D1E4E0'),
            ]}
          >
            {`${p.surahName} Suresi, ${p.ayahNumber}. Ayet (${p.juz}. Cüz)`}
          </Text>

          {/* Ayet Meali */}
          <Text
            modifiers={[
              font({ size: 14, weight: 'regular', design: 'serif' }),
              foregroundStyle('#F6F1E8'),
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
                background('#09322A'),
                cornerRadius(10),
              ]}
            >
              <HStack alignment="center">
                <Text
                  modifiers={[
                    font({ size: 10, weight: 'bold' }),
                    foregroundStyle('#E8C488'),
                  ]}
                >
                  {`🤲 AYETİN DUASI · ${p.prayerTheme.toUpperCase()}`}
                </Text>
                <Spacer />
                <Text
                  modifiers={[
                    font({ size: 10, weight: 'bold' }),
                    foregroundStyle('#E8C488'),
                  ]}
                >
                  Uygulamada Aç →
                </Text>
              </HStack>
              <Text
                modifiers={[
                  font({ size: 11, weight: 'regular', design: 'serif' }),
                  foregroundStyle('#EFE8DC'),
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
              foregroundStyle('#E8C488'),
            ]}
          >
            {p.isFriday ? '🌸 Bir Ayet · Cuma' : '🌿 Bir Ayet'}
          </Text>
          <Text
            modifiers={[
              font({ size: 11, weight: 'semibold' }),
              foregroundStyle('#FFFFFF'),
            ]}
          >
            {` · ${p.surahName} ${p.ayahNumber}. Ayet`}
          </Text>
          <Spacer />
          <Text
            modifiers={[
              font({ size: 10, weight: 'medium' }),
              foregroundStyle('#9BB7B0'),
            ]}
          >
            {p.dateLabel}
          </Text>
        </HStack>

        {/* Ayet Meali */}
        <Text
          modifiers={[
            font({ size: 13, weight: 'regular', design: 'serif' }),
            foregroundStyle('#F6F1E8'),
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
              foregroundStyle('#88A9A2'),
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
                background('#124E43'),
                cornerRadius(12),
              ]}
            >
              <Text
                modifiers={[
                  font({ size: 11, weight: 'semibold' }),
                  foregroundStyle('#F6E2B8'),
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
