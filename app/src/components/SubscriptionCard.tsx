import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { radius, useColors } from '@/theme';
import type { Subscription } from '@/types/api';
import { capitalize } from '@/utils/text';
import { daysLeft, formatDate, MS } from '@/utils/time';

const RENEW_WARNING_DAYS = 5;

interface Props {
  sub: Subscription;
  now: Date;
  onRenew: () => void;
}

/** Instrument + plan, days left with a progress bar, and a Renew prompt near expiry. */
export function SubscriptionCard({ sub, now, onRenew }: Props) {
  const colors = useColors();
  const start = new Date(sub.startDate);
  const end = new Date(sub.endDate);
  const left = daysLeft(end, now);
  const total = Math.max(1, Math.round((end.getTime() - start.getTime()) / MS.DAY));
  const progress = Math.min(1, Math.max(0, left / total));
  const expiringSoon = left <= RENEW_WARNING_DAYS;
  const barColor = expiringSoon ? colors.danger : colors.success;

  return (
    <Card>
      <View style={styles.row}>
        <AppText style={styles.bold}>{capitalize(sub.instrument)}</AppText>
        <AppText variant="caption" color="textSecondary">
          {sub.plan?.name ?? `${sub.classesPerWeek} classes / week`}
        </AppText>
      </View>

      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View style={[styles.fill, { backgroundColor: barColor, width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.row}>
        <AppText variant="caption" color={expiringSoon ? 'danger' : 'textSecondary'} style={styles.bold}>
          {left === 0 ? 'Ends today' : `${left} day${left === 1 ? '' : 's'} left`}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          Valid till {formatDate(end)}
        </AppText>
      </View>

      {expiringSoon && <Button title="Renew now" onPress={onRenew} />}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  bold: { fontWeight: '600' },
  track: { height: 6, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
