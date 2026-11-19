import { StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

/** Shown instead of the class cards when the student has no active subscription. */
export function NoSubscriptionCard({ onViewPlans }: { onViewPlans: () => void }) {
  return (
    <Card variant="hero">
      <AppText variant="heading" color="onPrimary">
        Learn violin, piano or drums, live
      </AppText>
      <AppText color="onPrimary" style={styles.muted}>
        2 or 4 classes a week on Google Meet. Pay with UPI.
      </AppText>
      <Button title="See plans" variant="inverse" onPress={onViewPlans} />
      <AppText variant="caption" color="onPrimary" style={styles.muted}>
        Already paid the academy? Your classes appear here once your phone number matches our records.
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  muted: { opacity: 0.8 },
});
