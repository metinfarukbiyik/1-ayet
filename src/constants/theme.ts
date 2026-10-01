import '@/global.css';

import { Platform } from 'react-native';

export type ThemePalette = {
  id: string;
  name: string;
  isDark: boolean;
  text: string;
  background: string;
  textSecondary: string;
  border: string;
  accent: string;
  accentContrast: string;
  card: string;
  cardBorder: string;
  surface: string;
  danger: string;
};

export const ThemePalettes = {
  parchment: {
    id: 'parchment',
    name: 'Klasik Parşömen',
    isDark: false,
    text: '#1B1914',
    background: '#F4F0E8',
    textSecondary: '#726C62',
    border: '#E2DACB',
    accent: '#1F3D32',
    accentContrast: '#FFFFFF',
    card: '#EAE4D7',
    cardBorder: '#D9D1C1',
    surface: '#FFFFFF',
    danger: '#B33927',
  },
  night: {
    id: 'night',
    name: 'Kömür & Altın',
    isDark: true,
    text: '#F3EEE6',
    background: '#12110E',
    textSecondary: '#A8A092',
    border: '#27241E',
    accent: '#C9B896',
    accentContrast: '#12110E',
    card: '#1D1B16',
    cardBorder: '#2D2A23',
    surface: '#181713',
    danger: '#E05D49',
  },
  emerald: {
    id: 'emerald',
    name: 'Zümrüt Huzuru',
    isDark: true,
    text: '#E8F1EC',
    background: '#0C1613',
    textSecondary: '#8CA79B',
    border: '#1B2F28',
    accent: '#4EBA8E',
    accentContrast: '#0C1613',
    card: '#152520',
    cardBorder: '#233E35',
    surface: '#111E1A',
    danger: '#E57368',
  },
  sapphire: {
    id: 'sapphire',
    name: 'Gece Mavisi',
    isDark: true,
    text: '#ECF2FA',
    background: '#0B121E',
    textSecondary: '#8B9DB9',
    border: '#1A2942',
    accent: '#6BA6F3',
    accentContrast: '#0B121E',
    card: '#142136',
    cardBorder: '#223657',
    surface: '#101A2B',
    danger: '#E57373',
  },
  terracotta: {
    id: 'terracotta',
    name: 'Sıcak Kum & Tarçın',
    isDark: false,
    text: '#271C14',
    background: '#F8F2EC',
    textSecondary: '#7F6B5C',
    border: '#E5D8CB',
    accent: '#964B29',
    accentContrast: '#FFFFFF',
    card: '#EDE1D3',
    cardBorder: '#DECDBE',
    surface: '#FFFFFF',
    danger: '#B33927',
  },
  sage: {
    id: 'sage',
    name: 'Adaçayı & Zeytin',
    isDark: false,
    text: '#17231A',
    background: '#EFF4F0',
    textSecondary: '#5E7363',
    border: '#D3E0D5',
    accent: '#2B5E3F',
    accentContrast: '#FFFFFF',
    card: '#DFEAE1',
    cardBorder: '#C9DACB',
    surface: '#FFFFFF',
    danger: '#B33927',
  },
  rose: {
    id: 'rose',
    name: 'Mürdüm & Gül Kurusu',
    isDark: true,
    text: '#F5EDF2',
    background: '#161115',
    textSecondary: '#B29CA7',
    border: '#2E222B',
    accent: '#D48DAE',
    accentContrast: '#161115',
    card: '#221920',
    cardBorder: '#3A2A37',
    surface: '#1B141A',
    danger: '#E57373',
  },
} as const;

export type PresetThemeKey = keyof typeof ThemePalettes;

export const Colors = {
  light: ThemePalettes.parchment,
  dark: ThemePalettes.night,
};

export type ThemeColor = keyof ThemePalette;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 560;
