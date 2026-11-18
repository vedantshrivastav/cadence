import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { radius, spacing, useColors } from '@/theme';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Stretch to share the row equally (default). Off for chips in a horizontal scroller. */
  fill?: boolean;
}

/** Pill-shaped single-choice option. */
export function Chip({ label, selected, onPress, fill = true }: Props) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        fill && styles.fill,
        selected
          ? { backgroundColor: colors.primary, borderColor: colors.primary }
          : { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.pressed,
      ]}>
      <AppText style={styles.label} color={selected ? 'onPrimary' : 'text'}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  chip: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  label: { fontWeight: '600' },
  pressed: { opacity: 0.7 },
});
