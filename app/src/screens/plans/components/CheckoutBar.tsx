import { Lock } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { colors, size, spacing } from '@/theme';

interface Props {
  /** e.g. "Piano · 2 classes / week" or a hint like "Choose a plan". */
  summary: string;
  total: string | null;
  buttonTitle: string;
  disabled: boolean;
  loading: boolean;
  onPay: () => void;
}

/** Pinned bar at the bottom of the Plans screen. The Pay button is the screen's one accent fill. */
export function CheckoutBar({ summary, total, buttonTitle, disabled, loading, onPay }: Props) {
  return (
    <View style={styles.bar}>
      <View style={styles.row}>
        <AppText color="textSecondary" style={styles.flex} numberOfLines={1}>
          {summary}
        </AppText>
        {total && <AppText variant="title">{total}</AppText>}
      </View>
      <Button title={buttonTitle} onPress={onPay} disabled={disabled} loading={loading} />
      <View style={styles.secure}>
        <Lock color={colors.muted} size={size.iconSmall} strokeWidth={1.75} />
        <AppText variant="caption" color="muted">
          Secure payment by Razorpay · UPI, cards, netbanking
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  row: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.md },
  flex: { flex: 1 },
  secure: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
});
