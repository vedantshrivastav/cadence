import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { colors, instrumentColors, spacing } from '@/theme';
import type { Instrument, MyClass, ScheduleSlot } from '@/types/api';
import { formatHHmm, shortDay, sortSlotsFromToday, WEEKDAYS } from '@/utils/time';

interface Row extends ScheduleSlot {
  key: string;
  batchId: string;
  title: string;
  instrument: Instrument;
}

/** The slot (IST weekday + "HH:mm") a class's next occurrence falls on. */
function slotOf(cls: MyClass): ScheduleSlot | null {
  if (!cls.nextClassAt) return null;
  const t = new Date(new Date(cls.nextClassAt).getTime() + 330 * 60_000);
  return { day: WEEKDAYS[t.getUTCDay()], startTime: t.toISOString().slice(11, 16) };
}

/**
 * One line per class: day, time, batch. The instrument is a colour dot, not repeated text.
 * The row for `nextClass` (the one in the hero card) gets a thin accent bar on the card's edge.
 */
export function WeeklySchedule({ classes, now, nextClass }: { classes: MyClass[]; now: Date; nextClass?: MyClass }) {
  const rows: Row[] = classes.flatMap(c =>
    c.schedule.map(s => ({
      ...s,
      key: `${c._id}-${s.day}-${s.startTime}`,
      batchId: c._id,
      title: c.title,
      instrument: c.instrument,
    })),
  );
  const next = nextClass ? slotOf(nextClass) : null;
  if (rows.length === 0) return null;

  const todayIst = WEEKDAYS[new Date(now.getTime() + 330 * 60_000).getUTCDay()];

  return (
    <Card>
      {sortSlotsFromToday(rows, now).map((r, i) => {
        const isToday = r.day === todayIst;
        const isNext = !!next && r.batchId === nextClass?._id && r.day === next.day && r.startTime === next.startTime;
        return (
          <View key={r.key} style={[styles.row, i > 0 && styles.divider]}>
            {isNext ? <View style={styles.nextBar} /> : null}
            <AppText style={[styles.day, styles.medium]} color={isToday ? 'primary' : 'muted'}>
              {isToday ? 'Today' : shortDay(r.day)}
            </AppText>
            <AppText style={[styles.time, styles.medium]}>{formatHHmm(r.startTime)}</AppText>
            <View style={[styles.dot, { backgroundColor: instrumentColors[r.instrument] }]} />
            <AppText color="muted" style={styles.flex} numberOfLines={1}>
              {r.title}
            </AppText>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 10 },
  divider: { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
  day: { width: 48 },
  time: { width: 76 },
  medium: { fontWeight: '600' },
  // Sits on the card's inner edge (card padding is spacing.card).
  nextBar: {
    position: 'absolute',
    left: -spacing.card,
    top: spacing.sm,
    bottom: spacing.sm,
    width: 2,
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
    backgroundColor: colors.primary,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  flex: { flex: 1 },
});
