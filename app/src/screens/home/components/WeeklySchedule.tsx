import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { spacing, useColors } from '@/theme';
import type { MyClass, ScheduleSlot } from '@/types/api';
import { capitalize } from '@/utils/text';
import { formatHHmm, shortDay, sortSlotsFromToday, WEEKDAYS } from '@/utils/time';

interface Row extends ScheduleSlot {
  key: string;
  title: string;
  instrument: string;
}

/** Every weekly slot across the student's classes, ordered from today onwards. */
export function WeeklySchedule({ classes, now }: { classes: MyClass[]; now: Date }) {
  const colors = useColors();
  const rows: Row[] = classes.flatMap(c =>
    c.schedule.map(s => ({ ...s, key: `${c._id}-${s.day}-${s.startTime}`, title: c.title, instrument: c.instrument })),
  );
  if (rows.length === 0) return null;

  const todayIst = WEEKDAYS[new Date(now.getTime() + 330 * 60_000).getUTCDay()];

  return (
    <Card>
      {sortSlotsFromToday(rows, now).map((r, i) => {
        const isToday = r.day === todayIst;
        return (
          <View
            key={r.key}
            style={[styles.row, i > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <View style={styles.day}>
              <AppText style={styles.bold} color={isToday ? 'primary' : 'text'}>
                {isToday ? 'Today' : shortDay(r.day)}
              </AppText>
            </View>
            <View style={styles.flex}>
              <AppText>{r.title}</AppText>
              <AppText variant="caption" color="textSecondary">
                {capitalize(r.instrument)}
              </AppText>
            </View>
            <AppText style={styles.bold}>{formatHHmm(r.startTime)}</AppText>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  day: { width: 52 },
  flex: { flex: 1 },
  bold: { fontWeight: '600' },
});
