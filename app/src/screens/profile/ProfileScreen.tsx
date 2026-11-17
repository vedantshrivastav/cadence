import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Placeholder } from '@/components/Placeholder';
import { Screen } from '@/components/Screen';
import { useSession } from '@/lib/session';

export function ProfileScreen() {
  const { user, signOut } = useSession();

  return (
    <Screen>
      <AppText variant="heading">{user?.name}</AppText>
      <AppText color="textSecondary">{user?.email}</AppText>
      <AppText color="textSecondary">{user?.phone ? `+91 ${user.phone}` : 'Phone not verified'}</AppText>

      <Placeholder
        title="To build"
        items={[
          'Subscription status per instrument + Renew',
          'Payment history (paymentsService.history)',
          'Attendance (classesService.myAttendance)',
          'Edit name / instruments',
        ]}
      />

      <Button title="Sign out" variant="secondary" onPress={signOut} />
    </Screen>
  );
}
