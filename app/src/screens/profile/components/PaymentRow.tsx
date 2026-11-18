import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { useColors } from '@/theme';
import type { Payment } from '@/types/api';
import { formatRupees } from '@/utils/money';
import { capitalize } from '@/utils/text';
import { formatDate } from '@/utils/time';

export function PaymentRow({ payment }: { payment: Payment }) {
  const colors = useColors();
  const paid = payment.status === 'paid';
  const date = new Date(payment.paidAt ?? payment.createdAt);

  return (
    <View style={styles.row}>
      <View style={styles.flex}>
        <AppText style={styles.bold}>
          {capitalize(payment.instrument)} · {payment.plan?.name ?? 'Plan'}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          {formatDate(date)}
          {payment.method ? ` · ${payment.method.toUpperCase()}` : ''}
        </AppText>
      </View>
      <View style={styles.right}>
        <AppText style={styles.bold}>{formatRupees(payment.amountPaise)}</AppText>
        <Badge
          label={paid ? 'PAID' : payment.status === 'failed' ? 'FAILED' : 'PENDING'}
          color={paid ? colors.success : payment.status === 'failed' ? colors.danger : colors.border}
          textColor={paid || payment.status === 'failed' ? '#FFFFFF' : colors.text}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1, gap: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  bold: { fontWeight: '600' },
});
