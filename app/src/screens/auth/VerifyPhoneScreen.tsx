import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Placeholder } from '@/components/Placeholder';
import { Screen } from '@/components/Screen';
import { useSession } from '@/lib/session';

export function VerifyPhoneScreen() {
  const { user, signOut } = useSession();

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <AppText variant="title">Verify your phone</AppText>
      <AppText color="textSecondary">Hi {user?.name}, one last step before you can join classes.</AppText>

      <Placeholder
        title="To build"
        items={[
          'Phone input (+91) → Firebase auth().signInWithPhoneNumber()',
          'OTP input → confirmation.confirm(code)',
          'firebaseUser.getIdToken() → authService.verifyPhone → session.refresh()',
          'Already-paid students get access automatically here',
        ]}
      />

      <Button title="Use a different Google account" variant="secondary" onPress={signOut} />
    </Screen>
  );
}
