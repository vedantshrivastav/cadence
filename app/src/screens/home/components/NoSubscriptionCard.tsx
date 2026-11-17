import { StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

/** Shown instead of the class cards when the student has no active subscription. */
export function NoSubscriptionCard({ onViewPlans }: { onViewPlans: () => void }) {
  return (
    <Card tone="primary">
      <AppText variant="heading" color="onPrimary">
        Start your music journey 🎶
      </AppText>
      <AppText color="onPrimary" style={styles.muted}>
        Live online classes for Violin, Piano and Drums — 2 or 4 classes a week. Pay securely with UPI.
      </AppText>
      <Button title="View plans" variant="inverse" onPress={onViewPlans} />
      <AppText variant="caption" color="onPrimary" style={styles.muted}>
        Already paid the academy directly? Access is added automatically when your phone number matches our
        records. Contact the academy if you don't see your classes.
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  muted: { opacity: 0.9 },
});
