import { Easing, Platform, type TextStyle, type ViewStyle } from 'react-native';

import type { Instrument } from '@/types/api';

/**
 * Cadence design tokens — dark theme only.
 * Strict two-tone navy: deep navy surfaces, off-white and slate text. No accent hue anywhere.
 * Emphasis comes from contrast and size only: the brightest thing on a screen is its primary action
 * (an off-white fill with navy text), active states and progress use off-white on slate tracks.
 * No gradients, glows or glossy highlights. Components must read colours from here; no hex in screens.
 */

const ink = {
  navy: '#10141D',
  card: '#1B202B',
  raised: '#262C38',
  slate: '#353C4A',
  white: '#F2F4F8',
  muted: '#9AA3B2',
} as const;

export const colors = {
  background: ink.navy,
  surface: ink.card,
  /** Raised and hero surfaces, e.g. the next-class card. */
  surfaceRaised: ink.raised,
  /** 1px borders. */
  border: 'rgba(255,255,255,0.06)',
  /** Quiet secondary controls and stave lines; a step above `border`. */
  borderStrong: 'rgba(255,255,255,0.12)',
  /** Unfilled part of progress bars. */
  track: ink.slate,

  /** Two text roles. `textSecondary` is kept as an alias so existing usages keep working. */
  text: ink.white,
  muted: ink.muted,
  textSecondary: ink.muted,

  /** Emphasis, not a hue: primary action fill, active tab, progress, selection, today. */
  primary: ink.white,
  /** Text/icons on top of `primary` (≈16:1). */
  onPrimary: ink.navy,

  /**
   * Status roles stay as keys but carry no hue: the words ("Paid", "Failed", "days left") and the
   * Renew button carry the meaning. Errors keep full contrast so they still read first.
   */
  success: ink.white,
  danger: ink.white,

  toast: ink.raised,
} as const;

export type Colors = { [K in keyof typeof colors]: string };

/** Per-instrument slate tints for dots and note heads (lightness steps, not hues). */
export const instrumentColors: Record<Instrument, string> = {
  violin: '#D5DBE5',
  piano: '#A3ADBD',
  drums: '#6C778A',
};

/** Background texture. 0 = off; the room is quiet, depth comes from surface steps. */
export const grain = { source: require('../assets/grain.png') as number, opacity: 0 } as const;

/** The signature: a five-line stave with the instrument as a note head. */
export const stave = {
  lines: 5,
  /** Distance between line centres. */
  gap: 6,
  lineColor: colors.borderStrong,
  noteWidth: 11,
  noteHeight: 8,
  noteTilt: '-20deg',
  /** A single note head's position along the stave, 0–1 from the left. */
  noteAt: 0.72,
  /** Several notes (one per weekly class) step through these positions, in half-gaps above the middle line. */
  melody: [-1, 1, 0, 2, 1, 3, 2],
  /** More notes than this stop reading as notes; the figure beside the stave carries the exact count. */
  maxNotes: 12,
  /** Note colour when no instrument is chosen yet. */
  noteNeutral: colors.muted,
} as const;

// ----- Typography -----
export const fonts = {
  /** Headings and big numbers. System serif keeps the "printed concert programme" feel without bundling fonts. */
  display: Platform.select({ android: 'serif', ios: 'Georgia', default: 'serif' }),
  body: Platform.select({ android: 'sans-serif', ios: 'System', default: 'System' }),
  bodyMedium: Platform.select({ android: 'sans-serif-medium', ios: 'System', default: 'System' }),
} as const;

export const fontSize = { xs: 12, sm: 13, md: 16, lg: 20, xl: 28, display: 34, hero: 44 } as const;

/** Lining, tabular figures for every number (Georgia defaults to old-style). */
const figures: TextStyle['fontVariant'] = ['lining-nums', 'tabular-nums'];

export const type = {
  display: { fontFamily: fonts.display, fontSize: fontSize.display, lineHeight: 40, fontWeight: '400' },
  title: { fontFamily: fonts.display, fontSize: fontSize.xl, lineHeight: 32, fontWeight: '400', fontVariant: figures },
  heading: { fontFamily: fonts.display, fontSize: fontSize.lg, lineHeight: 24, fontWeight: '400' },
  body: { fontFamily: fonts.body, fontSize: fontSize.md, lineHeight: 22 },
  /** Body weight for names, row values and button labels. Hierarchy comes from size and colour, not boldness. */
  bodyMedium: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md, lineHeight: 22, fontWeight: '500' },
  caption: { fontFamily: fonts.body, fontSize: fontSize.sm, lineHeight: 18 },
  /** Section titles and meta lines. Sentence case, no tracking. */
  label: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, lineHeight: 18, fontWeight: '500' },
  /** Times and counts inside rows. */
  figure: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md, lineHeight: 22, fontWeight: '500', fontVariant: figures },
  heroTime: { fontFamily: fonts.display, fontSize: fontSize.hero, lineHeight: 48, fontWeight: '400', fontVariant: figures },
} as const satisfies Record<string, TextStyle>;

// ----- Layout -----
/** 4pt grid. Inside a group is always tighter than between groups. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  /** Screen side and top padding. */
  screen: 20,
  /** Card inner padding (every variant). */
  card: 20,
  /** Between items inside a card. */
  inCard: 8,
  /** Between the feature card's text block and its actions. */
  inCardFeature: 20,
  /** Section title → its first card. */
  sectionHeader: 12,
  /** Between cards in one section. */
  cardGap: 12,
  /** Between sections. */
  section: 32,
} as const;

/** Fixed sizes. */
export const size = {
  control: 52,
  /** The Join button and its copy-link partner. */
  controlFeature: 56,
  iconButton: 52,
  icon: 20,
  /** Touch-height list row. */
  row: 44,
  dot: 8,
  /** Timetable columns. */
  scheduleDay: 48,
  scheduleTime: 80,
  /** Progress track and accent markers. */
  track: 4,
  marker: 2,
  /** Single-choice indicator and its inner dot. */
  radio: 20,
  radioDot: 8,
  /** Inline icons next to small text. */
  iconSmall: 16,
  /** Touch-height chip / option. */
  chip: 44,
} as const;

/** Cards 16, controls 10 (16 − 20 padding would go below the 4 minimum, so controls use their own step). */
export const radius = { sm: 6, md: 10, lg: 16, pill: 999 } as const;

export const shadow = {
  /** Soft, low-opacity lift under cards. Neutral black, never coloured. */
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  /** Things that float over content, like the toast. */
  float: {
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
} as const satisfies Record<string, ViewStyle>;

/** One easing curve and a few durations for the whole app. */
export const motion = {
  easing: Easing.bezier(0.22, 1, 0.36, 1),
  fast: 150,
  base: 220,
  slow: 400,
  /** Entrance: fade in while rising this far (px). */
  riseDistance: 8,
  /** Press feedback on primary controls. */
  pressScale: 0.98,
  pressedOpacity: 0.7,
  /** How long the copy icon shows its check / the toast stays. */
  feedbackMs: 1500,
} as const;

/** The app is dark-only; kept as a hook so components don't care where colours come from. */
export function useColors(): Colors {
  return colors;
}
