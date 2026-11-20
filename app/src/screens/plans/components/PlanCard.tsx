import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card, Stave } from '@/components/Card';
import { Radio } from '@/components/Radio';
import { colors, motion, size, spacing, type as typeScale } from '@/theme';
import type { Plan } from '@/types/api';
import { formatRupees, perClassPrice } from '@/utils/money';

interface Props {
  plan: Plan;
  selected: boolean;
  /** Shows a quiet "Popular" note next to the name (the 4×/week plan). */
  highlight?: boolean;
  /** Colour of the chosen instrument, for the note heads. */
  noteColor?: string;
  onPress: () => void;
}

function defaultFeatures(plan: Plan): string[] {
  return [
    `${plan.classesPerWeek} live classes every week on Google Meet`,
    `Valid for ${plan.durationDays} days`,
    'Pay with UPI, cards or netbanking',
  ];
}

/** The price is the one figure, written on the stave with one note per weekly class. */
export function PlanCard({ plan, selected, highlight, noteColor, onPress }: Props) {
  const features = plan.features?.length ? plan.features : defaultFeatures(plan);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}>
      <Card selected={selected}>
        <View style={styles.header}>
          <View style={styles.flex}>
            <AppText variant="heading">
              {plan.name}
              {highlight ? (
                <AppText variant="label" color="primary">
                  {'  Popular'}
                </AppText>
              ) : null}
            </AppText>
            {plan.description ? <AppText color="textSecondary">{plan.description}</AppText> : null}
          </View>
          <Radio selected={selected} />
        </View>

        <View style={styles.priceRow}>
          <AppText variant="title">{formatRupees(plan.pricePaise)}</AppText>
          <Stave notes={plan.classesPerWeek} noteColor={noteColor} />
        </View>
        <AppText variant="caption" color="textSecondary">
          {plan.durationDays} days · about {perClassPrice(plan.pricePaise, plan.classesPerWeek, plan.durationDays)} per
          class
        </AppText>

        <View style={styles.features}>
          {features.map(f => (
            <View key={f} style={styles.feature}>
              <Check color={colors.muted} size={size.iconSmall} strokeWidth={1.75} style={styles.featureIcon} />
              <AppText color="textSecondary" style={styles.flex}>
                {f}
              </AppText>
            </View>
          ))}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  flex: { flex: 1 },
  // name → price 8 (card gap), price → stave 16.
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs },
  features: { gap: spacing.xs, marginTop: spacing.xs },
  feature: { flexDirection: 'row', gap: spacing.sm },
  // Centres the icon on the first line of body text.
  featureIcon: { marginTop: (typeScale.body.lineHeight - size.iconSmall) / 2 },
  pressed: { transform: [{ scale: motion.pressScale }] },
});
