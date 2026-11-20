import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, motion, radius, size, spacing } from '@/theme';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Stretch to share the row equally (default). Off for chips in a horizontal scroller. */
  fill?: boolean;
  /** Optional category colour shown as a small dot before the label (e.g. an instrument). */
  dotColor?: string;
}

/**
 * Single-choice option. Selection is a surface step with an accent hairline, not a solid fill,
 * so the screen's primary action keeps the only accent fill.
 */
export function Chip({ label, selected, onPress, fill = true, dotColor }: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        fill && styles.fill,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}>
      {dotColor ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
      <AppText variant="bodyMedium" color={selected ? 'text' : 'textSecondary'}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  chip: {
    minHeight: size.chip,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  selected: { backgroundColor: colors.surfaceRaised, borderColor: colors.primary },
  dot: { width: size.dot, height: size.dot, borderRadius: size.dot / 2 },
  pressed: { opacity: motion.pressedOpacity },
});
