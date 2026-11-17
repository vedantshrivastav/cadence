import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { DevLoginPanel } from '@/components/DevLoginPanel';
import { Placeholder } from '@/components/Placeholder';
import { Screen } from '@/components/Screen';
import { spacing } from '@/theme';

export function SignInScreen() {
  return (
    <Screen scroll={false} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.hero}>
        <AppText variant="title">Cadence</AppText>
        <AppText color="textSecondary">
          Music Academy — Violin · Piano · Drums
        </AppText>
      </View>

      <Placeholder
        title="To build"
        items={[
          'Google Sign-In (@react-native-google-signin/google-signin)',
          'Send idToken → authService.googleLogin → session.signIn(res)',
          'Navigator then shows Verify Phone or Home automatically',
        ]}
      />

      <Button title="Continue with Google" onPress={() => {}} />

      <DevLoginPanel />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, justifyContent: 'center', gap: spacing.sm },
});
