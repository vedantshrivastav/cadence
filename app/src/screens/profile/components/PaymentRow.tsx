import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { type Colors, instrumentColors, size, spacing } from '@/theme';
import type { Payment } from '@/types/api';
import { formatRupees } from '@/utils/money';
import { capitalize } from '@/utils/text';
import { formatDate } from '@/utils/time';

const STATUS: Record<Payment['status'], { label: string; color: keyof Colors }> = {
  paid: { label: 'Paid', color: 'success' },
  failed: { label: 'Failed', color: 'danger' },
  created: { label: 'Pending', color: 'muted' },
};

/** Instrument dot, plan and date on the left; amount and status in one right-aligned column. */
export function PaymentRow({ payment }: { payment: Payment }) {
  const status = STATUS[payment.status];
  const date = new Date(payment.paidAt ?? payment.createdAt);
  const method = payment.method && payment.method.length <= 3 ? payment.method.toUpperCase() : capitalize(payment.method ?? '');

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: instrumentColors[payment.instrument] }]} />
      <View style={styles.flex}>
        <AppText variant="bodyMedium" numberOfLines={1}>
          {capitalize(payment.instrument)} · {payment.plan?.name ?? 'Plan'}
        </AppText>
        <AppText variant="caption" color="muted">
          {formatDate(date)}
          {method ? ` · ${method}` : ''}
        </AppText>
      </View>
      <View style={styles.right}>
        <AppText variant="figure">{formatRupees(payment.amountPaise)}</AppText>
        <AppText variant="caption" color={status.color}>
          {status.label}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  dot: { width: size.dot, height: size.dot, borderRadius: size.dot / 2 },
  flex: { flex: 1 },
  right: { alignItems: 'flex-end' },
});
