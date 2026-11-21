import '@/global.css';

import { Platform } from 'react-native';

export const Palette = {
  void: '#030607',
  surface: '#081014',
  surfaceRaised: '#0d1a1f',
  border: '#17383d',
  borderBright: '#2d6b68',
  green: '#6dffb3',
  greenDim: '#2fc47d',
  cyan: '#5ce1ff',
  amber: '#ffd166',
  red: '#ff5f7e',
  text: '#dcfff0',
  muted: '#78a79d',
  white: '#f4fff9',
} as const;

const fallbackFonts = {
  sans: 'system-ui',
  mono: 'monospace',
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    mono: 'ui-monospace',
  },
  web: {
    sans: 'var(--font-display)',
    mono: 'var(--font-mono)',
  },
  default: fallbackFonts,
}) ?? fallbackFonts;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
} as const;

export const MaxContentWidth = 760;
