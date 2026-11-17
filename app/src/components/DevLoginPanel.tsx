import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ApiError } from '@/lib/api';
import { useSession } from '@/lib/session';
import { authService } from '@/services/auth';
import { radius, spacing, useColors } from '@/theme';

type Persona = 'student' | 'admin' | 'unverified';

/**
 * DEBUG BUILDS ONLY — log in as a backend test user (no Google / OTP).
 * Needs the backend running with DEV_LOGIN_ENABLED=true. Renders nothing in release builds.
 * Delete this file once real sign-in works.
 */
export function DevLoginPanel() {
  const { signIn } = useSession();
  const colors = useColors();
  const [busy, setBusy] = useState<Persona | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!__DEV__) return null;

  const login = async (persona: Persona) => {
    setBusy(persona);
    setError(null);
    try {
      await signIn(await authService.devLogin(persona));
    } catch (e) {
      setError(
        e instanceof ApiError && (e.status === 404 || e.status === 401)
          ? 'Dev login is off. Set DEV_LOGIN_ENABLED=true in backend/.env and restart it.'
          : e instanceof Error ? e.message : 'Login failed',
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={[styles.box, { borderColor: colors.danger }]}>
      <AppText variant="caption" color="danger">
        DEV ONLY — test login (hidden in release builds)
      </AppText>
      <Button title="Enter as Student" variant="secondary" loading={busy === 'student'} disabled={!!busy} onPress={() => login('student')} />
      <Button title="Enter as Admin" variant="secondary" loading={busy === 'admin'} disabled={!!busy} onPress={() => login('admin')} />
      <Button title="Preview phone verification" variant="secondary" loading={busy === 'unverified'} disabled={!!busy} onPress={() => login('unverified')} />
      {error && (
        <AppText variant="caption" color="danger">
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderStyle: 'dashed', borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
});
