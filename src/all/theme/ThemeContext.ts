import { createContext } from 'react';

export const Theme = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type ThemeType = (typeof Theme)[keyof typeof Theme];
export type ResolvedThemeType = 'light' | 'dark';

export interface ThemeContextType {
  theme: ThemeType;
  resolvedTheme: ResolvedThemeType;
  isDark: boolean;
  setTheme: (theme: ThemeType, event?: React.MouseEvent | MouseEvent) => void;
  toggleTheme: (event?: React.MouseEvent | MouseEvent) => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);
