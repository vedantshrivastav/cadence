import { useColorScheme } from 'react-native';

// Cadence brand palette — placeholder, swap freely.
export const palette = {
  light: {
    text: '#14121A',
    textSecondary: '#625D70',
    background: '#FFFFFF',
    surface: '#F3F1F8',
    border: '#E6E1F2',
    primary: '#6C3BFF',
    onPrimary: '#FFFFFF',
    danger: '#D92D20',
    success: '#12805C',
  },
  dark: {
    text: '#F5F3FA',
    textSecondary: '#ADA8BC',
    background: '#0E0C14',
    surface: '#1C1926',
    border: '#2A2638',
    primary: '#9B7BFF',
    onPrimary: '#0E0C14',
    danger: '#F97066',
    success: '#47CD89',
  },
} as const;

export type Colors = { [K in keyof typeof palette.light]: string };

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 20, pill: 999 } as const;
export const fontSize = { sm: 13, md: 16, lg: 20, xl: 28 } as const;

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? palette.dark : palette.light;
}
