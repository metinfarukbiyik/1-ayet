import { useAppTheme } from '@/context/theme-context';
import type { ThemePalette } from '@/constants/theme';

export function useTheme(): ThemePalette {
  const { theme } = useAppTheme();
  return theme;
}
