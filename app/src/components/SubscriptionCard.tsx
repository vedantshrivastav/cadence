import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors, instrumentColors, radius, spacing } from '@/theme';
import type { Subscription } from '@/types/api';
import { capitalize } from '@/utils/text';
import { daysLeft, formatDate, MS } from '@/utils/time';

const RENEW_WARNING_DAYS = 5;

interface Props {
  sub: Subscription;
  now: Date;
  onRenew: () => void;
}

/** Days left is the one number; plan and end date are one quiet line each. */
export function SubscriptionCard({ sub, now, onRenew }: Props) {
  const start = new Date(sub.startDate);
  const end = new Date(sub.endDate);
  const left = daysLeft(end, now);
  const total = Math.max(1, Math.round((end.getTime() - start.getTime()) / MS.DAY));
  const progress = Math.min(1, Math.max(0, left / total));
  const expiringSoon = left <= RENEW_WARNING_DAYS;

  return (
    <Card>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: instrumentColors[sub.instrument] }]} />
        <AppText style={styles.flex} numberOfLines={1}>
          {capitalize(sub.instrument)} · {sub.classesPerWeek} classes a week
        </AppText>
      </View>

      <View style={styles.numberRow}>
        <AppText variant="title" color={expiringSoon ? 'danger' : 'text'}>
          {left === 0 ? 'Last day' : left}
        </AppText>
        {left > 0 && (
          <AppText color="muted" style={styles.flex}>
            {left === 1 ? 'day left' : 'days left'}
          </AppText>
        )}
        <AppText variant="caption" color="muted">
          Ends {formatDate(end)}
        </AppText>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { backgroundColor: expiringSoon ? colors.danger : colors.primary, width: `${progress * 100}%` },
          ]}
        />
      </View>

      {expiringSoon && <Button title="Renew" onPress={onRenew} />}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  numberRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  flex: { flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  track: { height: 4, borderRadius: radius.pill, overflow: 'hidden', backgroundColor: colors.border },
  fill: { height: '100%', borderRadius: radius.pill },
});
