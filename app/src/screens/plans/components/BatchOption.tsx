import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { radius, spacing, useColors } from '@/theme';
import type { Batch } from '@/types/api';
import { capitalize } from '@/utils/text';
import { formatHHmm, shortDay, sortSlotsFromToday } from '@/utils/time';

interface Props {
  batch: Batch;
  selected: boolean;
  now: Date;
  onPress: () => void;
}

/** One batch timing the student can join, e.g. "Mon, Thu · 6:00 PM". */
export function BatchOption({ batch, selected, now, onPress }: Props) {
  const colors = useColors();
  const slots = sortSlotsFromToday(batch.schedule, now)
    .map(s => `${shortDay(s.day)} ${formatHHmm(s.startTime)}`)
    .join(' · ');
  const details = [capitalize(batch.level), `${batch.durationMinutes} min`, batch.teacherName && `with ${batch.teacherName}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          borderWidth: selected ? 2 : 1,
        },
        pressed && styles.pressed,
      ]}>
      <View style={styles.flex}>
        <AppText style={styles.bold}>{batch.title}</AppText>
        <AppText>{slots || 'Timings to be announced'}</AppText>
        <AppText variant="caption" color="textSecondary">
          {details}
        </AppText>
      </View>
      <View style={[styles.radio, { borderColor: selected ? colors.primary : colors.border }]}>
        {selected && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md },
  flex: { flex: 1, gap: 2 },
  bold: { fontWeight: '600' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  pressed: { opacity: 0.8 },
});
