export type WidgetThemeId =
  | 'auto'
  | 'emerald'
  | 'night'
  | 'sapphire'
  | 'parchment'
  | 'terracotta'
  | 'sage'
  | 'rose'
  | 'pureDark';

export type WidgetThemeConfig = {
  id: WidgetThemeId;
  name: string;
  description: string;
  bgStart: string;
  bgEnd: string;
  accentColor: string;
  textColor: string;
  secondaryTextColor: string;
  cardBgColor: string;
  badgeBgColor: string;
};

export const WidgetThemeConfigs: Record<Exclude<WidgetThemeId, 'auto'>, WidgetThemeConfig> = {
  emerald: {
    id: 'emerald',
    name: 'Zümrüt Huzuru',
    description: 'Klasik zümrüt yeşili ve sıcak altın',
    bgStart: '#0B3D34',
    bgEnd: '#06201B',
    accentColor: '#E8C488',
    textColor: '#F6F1E8',
    secondaryTextColor: '#A1BFB8',
    cardBgColor: '#09322A',
    badgeBgColor: '#124E43',
  },
  night: {
    id: 'night',
    name: 'Kömür & Altın',
    description: 'Asil koyu zemin ve ışıltılı altın',
    bgStart: '#221F1A',
    bgEnd: '#11100D',
    accentColor: '#DEC284',
    textColor: '#FAF6EE',
    secondaryTextColor: '#B8B0A2',
    cardBgColor: '#1C1914',
    badgeBgColor: '#332D24',
  },
  sapphire: {
    id: 'sapphire',
    name: 'Gece Mavisi',
    description: 'Derin okyanus laciverti ve gök mavisi',
    bgStart: '#0E1F36',
    bgEnd: '#070E1A',
    accentColor: '#7EB5F8',
    textColor: '#F0F5FD',
    secondaryTextColor: '#9BB2D4',
    cardBgColor: '#132845',
    badgeBgColor: '#1E3B65',
  },
  parchment: {
    id: 'parchment',
    name: 'Klasik Parşömen',
    description: 'Aydınlık krem zemin ve orman yeşili',
    bgStart: '#F8F4EC',
    bgEnd: '#EBE1D0',
    accentColor: '#1B4033',
    textColor: '#241F18',
    secondaryTextColor: '#736B5E',
    cardBgColor: '#DFCDB5',
    badgeBgColor: '#CFBCA2',
  },
  terracotta: {
    id: 'terracotta',
    name: 'Sıcak Kum & Tarçın',
    description: 'Sıcak toprak ve tarçın esintisi',
    bgStart: '#3D1F13',
    bgEnd: '#1D0E08',
    accentColor: '#EAA482',
    textColor: '#FFF4EE',
    secondaryTextColor: '#C9A393',
    cardBgColor: '#2F170D',
    badgeBgColor: '#532917',
  },
  sage: {
    id: 'sage',
    name: 'Adaçayı & Zeytin',
    description: 'Huzurlu dingin doğal yeşil',
    bgStart: '#1E3928',
    bgEnd: '#0E1B13',
    accentColor: '#9ED8B2',
    textColor: '#F1F8F3',
    secondaryTextColor: '#96B8A0',
    cardBgColor: '#172C1F',
    badgeBgColor: '#284E37',
  },
  rose: {
    id: 'rose',
    name: 'Mürdüm & Gül Kurusu',
    description: 'Zarif koyu mürdüm ve pudra gülü',
    bgStart: '#311927',
    bgEnd: '#160A11',
    accentColor: '#ECA4C2',
    textColor: '#FDF6F9',
    secondaryTextColor: '#BFA1B0',
    cardBgColor: '#26121D',
    badgeBgColor: '#482438',
  },
  pureDark: {
    id: 'pureDark',
    name: 'Saf Gece (OLED)',
    description: 'Derin OLED siyahı ve saf altın',
    bgStart: '#121212',
    bgEnd: '#000000',
    accentColor: '#DFB858',
    textColor: '#FFFFFF',
    secondaryTextColor: '#A0A0A0',
    cardBgColor: '#1A1A1A',
    badgeBgColor: '#2B2B2B',
  },
};

/**
 * Verilen widgetThemeId ve appThemeId değerlerine göre
 * kullanılacak en uygun WidgetThemeConfig nesnesini çözer.
 */
export function resolveWidgetTheme(
  widgetThemeId?: string | null,
  appThemeId?: string | null
): WidgetThemeConfig {
  const chosen = widgetThemeId || 'auto';

  if (chosen !== 'auto' && chosen in WidgetThemeConfigs) {
    return WidgetThemeConfigs[chosen as keyof typeof WidgetThemeConfigs];
  }

  // 'auto' modunda uygulamanın aktif temasını temel al
  const fallbackKey = (appThemeId || 'emerald') as keyof typeof WidgetThemeConfigs;
  if (fallbackKey in WidgetThemeConfigs) {
    return WidgetThemeConfigs[fallbackKey];
  }

  if (appThemeId === 'light') return WidgetThemeConfigs.parchment;
  if (appThemeId === 'dark') return WidgetThemeConfigs.night;

  return WidgetThemeConfigs.emerald;
}
