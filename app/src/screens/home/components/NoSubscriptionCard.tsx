import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

/** Shown instead of the class cards when the student has no active subscription. */
export function NoSubscriptionCard({ onViewPlans }: { onViewPlans: () => void }) {
  return (
    <Card variant="feature">
      <AppText variant="title">Learn violin, piano or drums, live</AppText>
      <AppText color="textSecondary">2 or 4 classes a week on Google Meet. Pay with UPI.</AppText>
      <Button title="See plans" onPress={onViewPlans} />
      <AppText variant="caption" color="muted">
        Already paid the academy? Your classes appear here once your phone number matches our records.
      </AppText>
    </Card>
  );
}
