import { Platform, type TextStyle, type ViewStyle } from 'react-native';

import type { Instrument } from '@/types/api';

/**
 * Cadence design tokens — dark theme only.
 * Warm "music room at night" palette: espresso surfaces, parchment text, one moonlight-blue accent (Clair de lune: a lamp-lit room, cool light at the window).
 * Components must read colours from here; no hard-coded hex values in screens.
 */

export const colors = {
  background: '#1C1815',
  surface: '#25201C',
  surfaceRaised: '#2E2823',
  border: 'rgba(255,235,210,0.08)',
  borderStrong: 'rgba(255,235,210,0.16)',

  text: '#F3EBDD',
  muted: '#A89C8C',
  /** Alias of `muted`, kept so existing `color="textSecondary"` usages keep working. */
  textSecondary: '#A89C8C',

  /** The single accent: buttons, active tab, links, focus. */
  primary: '#8FAFD6',
  /** Text/icons placed on top of `primary`. */
  onPrimary: '#1C1815',

  success: '#8FBF84',
  danger: '#E86F57',

  // Translucent overlays used on top of the accent hero.
  onPrimarySubtle: 'rgba(28,24,21,0.10)',
  onPrimaryBorder: 'rgba(28,24,21,0.22)',
  highlight: 'rgba(255,255,255,0.45)',
  white: '#FFFFFF',
  toast: '#2E2823',
} as const;

export type Colors = { [K in keyof typeof colors]: string };

/** Hero card fill: a 145° accent tonal gradient, a soft top-left highlight and a faint grain. */
export const heroSurface = {
  gradient: ['#A6C1E1', '#8FAFD6', '#7598C4'] as const,
  angleDeg: 145,
  highlightOpacity: 0.35,
  noiseOpacity: 0.05,
} as const;

/** Per-instrument accents for tags, icons and schedule markers (not for large fills). */
export const instrumentColors: Record<Instrument, string> = {
  violin: '#D2805F', // rosewood
  piano: '#E2D2B4', // ivory
  drums: '#9CB879', // sage
};

/** Paper-grain overlay drawn on the app background. */
export const grain = { source: require('../assets/grain.png') as number, opacity: 0.35 } as const;

// ----- Typography -----
export const fonts = {
  /** Headings and big numbers. System serif keeps the "printed programme" feel without bundling font files. */
  display: Platform.select({ android: 'serif', ios: 'Georgia', default: 'serif' }),
  body: Platform.select({ android: 'sans-serif', ios: 'System', default: 'System' }),
  bodyMedium: Platform.select({ android: 'sans-serif-medium', ios: 'System', default: 'System' }),
} as const;

export const fontSize = { xs: 12, sm: 13, md: 16, lg: 20, xl: 28, display: 34, hero: 38 } as const;

export const type = {
  display: { fontFamily: fonts.display, fontSize: fontSize.display, lineHeight: 40, fontWeight: '600' },
  title: { fontFamily: fonts.display, fontSize: fontSize.xl, lineHeight: 34, fontWeight: '600' },
  heading: { fontFamily: fonts.display, fontSize: fontSize.lg, lineHeight: 26, fontWeight: '600' },
  body: { fontFamily: fonts.body, fontSize: fontSize.md, lineHeight: 22 },
  caption: { fontFamily: fonts.body, fontSize: fontSize.sm, lineHeight: 18 },
  /** 12px uppercase, 0.08em tracking. */
  label: { fontFamily: fonts.bodyMedium, fontSize: fontSize.xs, lineHeight: 16, letterSpacing: fontSize.xs * 0.08, textTransform: 'uppercase' },
  heroTime: { fontFamily: fonts.display, fontSize: fontSize.hero, lineHeight: 44, fontWeight: '600' },
} as const satisfies Record<string, TextStyle>;

// ----- Layout -----
/**
 * 8pt grid. Inside a group (title → its meta, card → card) is always tighter than between groups (section → section).
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  /** Screen side and top padding. */
  screen: 20,
  /** Card inner padding. */
  card: 20,
  cardHero: 24,
  /** Between items inside a card. */
  inCard: 8,
  inCardHero: 12,
  /** Section title → its first card. */
  sectionHeader: 12,
  /** Between cards in one section. */
  cardGap: 16,
  /** Between sections. */
  section: 28,
} as const;

/** Fixed control sizes. */
export const size = { control: 52, iconButton: 52, icon: 20 } as const;
export const radius = { sm: 8, md: 12, lg: 18, pill: 999 } as const;

export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  /** Soft accent glow under the hero card. */
  heroGlow: { boxShadow: '0px 10px 28px rgba(143,175,214,0.30)' },
} as const satisfies Record<string, ViewStyle>;

/** Animation durations in ms. */
export const motion = {
  fast: 150,
  base: 240,
  slow: 400,
  /** Entrance: fade in while rising this far (px). */
  riseDistance: 8,
  /** Join button pulse when class starts soon. */
  pulsePeriod: 1400,
  pulseScale: 1.03,
  pulseWindowMs: 5 * 60_000,
  /** How long the copy icon shows its check / the toast stays. */
  feedbackMs: 1500,
} as const;

/** The app is dark-only; kept as a hook so components don't care where colours come from. */
export function useColors(): Colors {
  return colors;
}
