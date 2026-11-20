import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { DevLoginPanel } from '@/components/DevLoginPanel';
import { Screen } from '@/components/Screen';
import { getGoogleIdToken, GoogleSignInCancelled } from '@/lib/googleAuth';
import { useSession } from '@/lib/session';
import { authService } from '@/services/auth';
import { radius, spacing, useColors } from '@/theme';

const HIGHLIGHTS = [
  { icon: '🎻', text: 'Violin, Piano and Drums' },
  { icon: '💻', text: 'Live classes on Google Meet' },
  { icon: '📅', text: '2 or 4 classes a week, pay with UPI' },
];

export function SignInScreen() {
  const colors = useColors();
  const { signIn } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const continueWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const idToken = await getGoogleIdToken();
      // The navigator moves on by itself: to Verify Phone for new students, otherwise Home.
      await signIn(await authService.googleLogin(idToken));
    } catch (e) {
      if (!(e instanceof GoogleSignInCancelled)) {
        setError(
          e instanceof Error ? e.message : 'Sign-in failed. Please try again.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.hero}>
        <AppText variant="title" style={styles.textCenter}>
          Cadence Music Academy
        </AppText>
        <AppText color="textSecondary" style={styles.textCenter}>
          Learn music live, from home.
        </AppText>
      </View>

      <View style={styles.highlights}>
        {HIGHLIGHTS.map(h => (
          <View
            key={h.text}
            style={[styles.highlight, { backgroundColor: colors.surface }]}
          >
            <AppText style={styles.icon}>{h.icon}</AppText>
            <AppText style={styles.flex}>{h.text}</AppText>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          title="Continue with Google"
          onPress={continueWithGoogle}
          loading={loading}
        />
        {error && (
          <AppText color="danger" style={styles.textCenter}>
            {error}
          </AppText>
        )}
        <AppText
          variant="caption"
          color="textSecondary"
          style={styles.textCenter}
        >
          Already a student of the academy? Sign in and verify the phone number
          you gave us — your classes will be added automatically.
        </AppText>
      </View>

      <DevLoginPanel />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 40, lineHeight: 48 },
  textCenter: { textAlign: 'center' },
  highlights: { gap: spacing.sm },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  icon: { fontSize: 22, lineHeight: 28 },
  flex: { flex: 1 },
  actions: { gap: spacing.sm, paddingTop: spacing.md },
});
