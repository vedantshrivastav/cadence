import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useSession } from '@/lib/session';
import { SignInScreen } from '@/screens/auth/SignInScreen';
import { VerifyPhoneScreen } from '@/screens/auth/VerifyPhoneScreen';
import { LoadingScreen } from '@/screens/LoadingScreen';

import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Auth flow: only the screens allowed for the current state exist.
 *   signed out            → SignIn
 *   signed in, no phone   → VerifyPhone
 *   fully verified        → Main (tabs)
 * When the session changes, React Navigation switches automatically — no manual navigate() needed.
 */
export function RootNavigator() {
  const { isLoading, isSignedIn, needsPhoneVerification } = useSession();

  if (isLoading) return <LoadingScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isSignedIn ? (
        <Stack.Screen name="SignIn" component={SignInScreen} />
      ) : needsPhoneVerification ? (
        <Stack.Screen name="VerifyPhone" component={VerifyPhoneScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}
