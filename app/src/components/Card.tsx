import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadow, spacing, stave } from '@/theme';

export type CardVariant = 'default' | 'feature' | 'quiet' | 'hero';

interface Props extends PropsWithChildren {
  /**
   * default = flat surface panel ·
   * feature = the one card that matters most on a screen: raised surface, its primary action is the brightest element ·
   * quiet = outline only, for secondary info ·
   * hero = raised surface for a marketing/locked message (same look as feature, default gap). No gradient, no glow.
   */
  variant?: CardVariant;
  /** For a list of rows that carry their own touch height: side padding only, no gap. */
  list?: boolean;
  /** Chosen option in a single-choice list: accent hairline, same width so nothing shifts. */
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** The only card in the app: one radius, one padding, depth from surface steps and hairlines. */
export function Card({ variant = 'default', list = false, selected = false, style, children }: Props) {
  return (
    <View style={[styles.base, styles[variant], list && styles.list, selected && styles.selected, style]}>{children}</View>
  );
}

/**
 * The Cadence signature: five stave lines with note heads in the instrument's colour.
 * One note sits on the middle line; several (one per weekly class) step through `stave.melody`.
 * Fills the width it is given; place it beside a large figure in a row.
 */
export function Stave({
  noteColor = stave.noteNeutral,
  notes = 1,
  noteColors,
}: {
  noteColor?: string;
  notes?: number;
  /** One colour per note (e.g. each attended class's instrument); overrides `notes` and `noteColor`. */
  noteColors?: string[];
}) {
  const count = Math.min(noteColors?.length ?? notes, stave.maxNotes);
  return (
    <View style={styles.stave} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: stave.lines }, (_, i) => (
        <View key={i} style={styles.staveLine} />
      ))}
      {Array.from({ length: count }, (_, i) => {
        const at = count === 1 && !noteColors ? stave.noteAt : (i + 0.5) / count;
        const lift = count === 1 && !noteColors ? 0 : (stave.melody[i % stave.melody.length] * stave.gap) / 2;
        return (
          <View
            key={`n${i}`}
            style={[styles.note, { left: `${at * 100}%`, marginTop: -lift, backgroundColor: noteColors?.[i] ?? noteColor }]}
          />
        );
      })}
    </View>
  );
}

const STAVE_HEIGHT = (stave.lines - 1) * stave.gap + StyleSheet.hairlineWidth;

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.card,
    gap: spacing.inCard,
  },
  default: { backgroundColor: colors.surface, borderColor: colors.border, ...shadow.card },
  feature: { backgroundColor: colors.surfaceRaised, borderColor: colors.border, gap: spacing.inCardFeature, ...shadow.card },
  quiet: { backgroundColor: 'transparent', borderColor: colors.border },
  hero: { backgroundColor: colors.surfaceRaised, borderColor: colors.border, ...shadow.card },
  list: { paddingVertical: spacing.xs, gap: 0 },
  selected: { borderColor: colors.primary },

  stave: { flex: 1, height: STAVE_HEIGHT, justifyContent: 'space-between' },
  staveLine: { height: StyleSheet.hairlineWidth, backgroundColor: stave.lineColor },
  // Sits on the middle line.
  note: {
    position: 'absolute',
    marginLeft: -stave.noteWidth / 2,
    top: STAVE_HEIGHT / 2 - stave.noteHeight / 2,
    width: stave.noteWidth,
    height: stave.noteHeight,
    borderRadius: stave.noteHeight / 2,
    transform: [{ rotate: stave.noteTilt }],
  },
});
