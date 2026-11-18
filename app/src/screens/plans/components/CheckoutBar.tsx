import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { spacing, useColors } from '@/theme';

interface Props {
  /** e.g. "Piano · 2 classes / week" or a hint like "Choose a plan". */
  summary: string;
  total: string | null;
  buttonTitle: string;
  disabled: boolean;
  loading: boolean;
  onPay: () => void;
}

/** Pinned bar at the bottom of the Plans screen. */
export function CheckoutBar({ summary, total, buttonTitle, disabled, loading, onPay }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.bar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      <View style={styles.row}>
        <AppText color="textSecondary" style={styles.flex} numberOfLines={1}>
          {summary}
        </AppText>
        {total && <AppText variant="heading">{total}</AppText>}
      </View>
      <Button title={buttonTitle} onPress={onPay} disabled={disabled} loading={loading} />
      <AppText variant="caption" color="textSecondary" style={styles.center}>
        🔒 Secure payment by Razorpay · UPI, cards, netbanking
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { padding: spacing.md, gap: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
});
