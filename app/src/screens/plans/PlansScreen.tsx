import { Placeholder } from '@/components/Placeholder';
import { Screen } from '@/components/Screen';

export function PlansScreen() {
  return (
    <Screen>
      <Placeholder
        title="To build"
        items={[
          'Plan cards: 2 classes/week and 4 classes/week (classesService.plans)',
          'Pick instrument: violin / piano / drums',
          'Pick batch timing (classesService.batches)',
          'Pay with UPI: paymentsService.createOrder → react-native-razorpay → paymentsService.verify',
          'Success screen → session.refresh()',
        ]}
      />
    </Screen>
  );
}
