import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { radius, spacing, useColors } from '@/theme';
import type { Plan } from '@/types/api';
import { formatRupees, perClassPrice } from '@/utils/money';

interface Props {
  plan: Plan;
  selected: boolean;
  /** Shows a "Popular" tag (the 4×/week plan). */
  highlight?: boolean;
  onPress: () => void;
}

function defaultFeatures(plan: Plan): string[] {
  return [
    `${plan.classesPerWeek} live classes every week on Google Meet`,
    `Valid for ${plan.durationDays} days`,
    'Pay with UPI, cards or netbanking',
  ];
}

export function PlanCard({ plan, selected, highlight, onPress }: Props) {
  const colors = useColors();
  const features = plan.features?.length ? plan.features : defaultFeatures(plan);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          borderWidth: selected ? 2 : 1,
        },
        pressed && styles.pressed,
      ]}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <AppText variant="heading">{plan.name}</AppText>
          {plan.description ? <AppText color="textSecondary">{plan.description}</AppText> : null}
        </View>
        <View style={[styles.radio, { borderColor: selected ? colors.primary : colors.border }]}>
          {selected && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
        </View>
      </View>

      {highlight && <Badge label="POPULAR" color={colors.primary} textColor={colors.onPrimary} />}

      <View style={styles.priceRow}>
        <AppText variant="title">{formatRupees(plan.pricePaise)}</AppText>
        <AppText color="textSecondary"> / {plan.durationDays} days</AppText>
      </View>
      <AppText variant="caption" color="textSecondary">
        About {perClassPrice(plan.pricePaise, plan.classesPerWeek, plan.durationDays)} per class
      </AppText>

      <View style={styles.features}>
        {features.map(f => (
          <AppText key={f}>
            <AppText color="success">✓ </AppText>
            {f}
          </AppText>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  flex: { flex: 1 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  features: { gap: spacing.xs },
  pressed: { opacity: 0.8 },
});
