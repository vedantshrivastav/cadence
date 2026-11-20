import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { colors, instrumentColors, size, spacing } from '@/theme';
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
 * A printed timetable: day, time, batch. The instrument is a colour dot, not repeated text.
 * The row for `nextClass` (the one in the feature card) gets a thin accent marker on the card's edge.
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
    <Card list>
      {sortSlotsFromToday(rows, now).map((r, i) => {
        const isToday = r.day === todayIst;
        const isNext = !!next && r.batchId === nextClass?._id && r.day === next.day && r.startTime === next.startTime;
        return (
          <View key={r.key} style={[styles.row, i > 0 && styles.divider]}>
            {isNext ? <View style={styles.nextMarker} /> : null}
            <AppText variant="label" style={styles.day} color={isToday ? 'primary' : 'muted'}>
              {isToday ? 'Today' : shortDay(r.day)}
            </AppText>
            <AppText variant="figure" style={styles.time}>
              {formatHHmm(r.startTime)}
            </AppText>
            <View style={[styles.dot, { backgroundColor: instrumentColors[r.instrument] }]} />
            <AppText color="textSecondary" style={styles.flex} numberOfLines={1}>
              {r.title}
            </AppText>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: size.row },
  divider: { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
  day: { width: size.scheduleDay },
  time: { width: size.scheduleTime },
  // Sits on the card's inner edge.
  nextMarker: {
    position: 'absolute',
    left: -spacing.card,
    top: spacing.sm,
    bottom: spacing.sm,
    width: size.marker,
    borderTopRightRadius: size.marker / 2,
    borderBottomRightRadius: size.marker / 2,
    backgroundColor: colors.primary,
  },
  dot: { width: size.dot, height: size.dot, borderRadius: size.dot / 2 },
  flex: { flex: 1 },
});
