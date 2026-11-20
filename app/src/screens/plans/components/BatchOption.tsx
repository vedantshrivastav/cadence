import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Radio } from '@/components/Radio';
import { motion, spacing } from '@/theme';
import type { Batch } from '@/types/api';
import { capitalize } from '@/utils/text';
import { formatHHmm, shortDay, sortSlotsFromToday } from '@/utils/time';

interface Props {
  batch: Batch;
  selected: boolean;
  now: Date;
  onPress: () => void;
}

/** One batch timing the student can join, e.g. "Mon 6:00 PM · Thu 6:00 PM". */
export function BatchOption({ batch, selected, now, onPress }: Props) {
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
      style={({ pressed }) => pressed && styles.pressed}>
      <Card selected={selected} style={styles.row}>
        <View style={styles.flex}>
          <AppText variant="bodyMedium">{batch.title}</AppText>
          <AppText variant="figure" color="textSecondary">
            {slots || 'Timings to be announced'}
          </AppText>
          <AppText variant="caption" color="muted">
            {details}
          </AppText>
        </View>
        <Radio selected={selected} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Card content laid out as a row; the radio centres against the text block.
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, gap: spacing.xs / 2 },
  pressed: { transform: [{ scale: motion.pressScale }] },
});
