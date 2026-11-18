import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useSession } from '@/lib/session';
import {
  confirmOtp,
  firebaseSignOut,
  isValidIndianMobile,
  onAutoVerified,
  sendOtp,
  type Confirmation,
} from '@/lib/phoneAuth';
import { authService } from '@/services/auth';
import { fontSize, radius, spacing, useColors } from '@/theme';

const RESEND_AFTER_S = 30;
const CODE_LENGTH = 6;

export function VerifyPhoneScreen() {
  const colors = useColors();
  const { user, refresh, signOut } = useSession();

  const [phone, setPhone] = useState(user?.phone ?? '');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [busy, setBusy] = useState<'send' | 'verify' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const finished = useRef(false);

  // Resend countdown.
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  /** Firebase proved the number → tell the backend, which may also link a pre-paid enrolment. */
  const finish = async (firebaseIdToken: string) => {
    if (finished.current) return;
    finished.current = true;
    setBusy('verify');
    try {
      const res = await authService.verifyPhone(firebaseIdToken);
      await firebaseSignOut();
      if (res.linkedSubscriptions > 0) {
        Alert.alert('Welcome back! 🎶', 'We found your existing enrolment — your classes are ready on Home.');
      }
      await refresh(); // navigator switches to the app
    } catch (e) {
      finished.current = false;
      await firebaseSignOut();
      setError(e instanceof Error ? e.message : 'Verification failed. Please try again.');
      setBusy(null);
    }
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;

  // Android may verify the SMS automatically, without the code being typed.
  useEffect(() => (confirmation ? onAutoVerified(token => finishRef.current(token)) : undefined), [confirmation]);

  const send = async () => {
    if (!isValidIndianMobile(phone)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setBusy('send');
    setError(null);
    try {
      setConfirmation(await sendOtp(phone));
      setCode('');
      setResendIn(RESEND_AFTER_S);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the code.');
    } finally {
      setBusy(null);
    }
  };

  const verify = async (value = code) => {
    if (!confirmation || value.length !== CODE_LENGTH) return;
    setBusy('verify');
    setError(null);
    try {
      await finish(await confirmOtp(confirmation, value));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Wrong code.');
      setBusy(null);
    }
  };

  const changeNumber = () => {
    setConfirmation(null);
    setCode('');
    setError(null);
    setResendIn(0);
  };

  const inputStyle = [
    styles.input,
    { color: colors.text, backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border },
  ];

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <AppText variant="title">{confirmation ? 'Enter the code' : 'Verify your phone'}</AppText>
        <AppText color="textSecondary">
          {confirmation
            ? `We sent a ${CODE_LENGTH}-digit code by SMS to +91 ${phone}.`
            : `Hi ${user?.name?.split(' ')[0] ?? 'there'}, one last step. We use your number for class reminders and to find your enrolment if you've already paid the academy.`}
        </AppText>
      </View>

      {!confirmation ? (
        <>
          <View style={styles.phoneRow}>
            <View style={[styles.prefix, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <AppText style={styles.bold}>🇮🇳 +91</AppText>
            </View>
            <TextInput
              style={[inputStyle, styles.flex]}
              value={phone}
              onChangeText={t => {
                setPhone(t.replace(/\D/g, '').slice(-10));
                setError(null);
              }}
              placeholder="98765 43210"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              maxLength={10}
              autoFocus
              onSubmitEditing={send}
              accessibilityLabel="Mobile number"
            />
          </View>
          {error && <AppText color="danger">{error}</AppText>}
          <Button title="Send code" onPress={send} loading={busy === 'send'} disabled={phone.length !== 10} />
        </>
      ) : (
        <>
          <TextInput
            style={[inputStyle, styles.code]}
            value={code}
            onChangeText={t => {
              const digits = t.replace(/\D/g, '').slice(0, CODE_LENGTH);
              setCode(digits);
              setError(null);
              if (digits.length === CODE_LENGTH) verify(digits);
            }}
            placeholder={'•'.repeat(CODE_LENGTH)}
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            autoComplete="sms-otp"
            textContentType="oneTimeCode"
            maxLength={CODE_LENGTH}
            autoFocus
            editable={busy !== 'verify'}
            accessibilityLabel="Verification code"
          />
          {error && <AppText color="danger">{error}</AppText>}
          <Button
            title="Verify"
            onPress={() => verify()}
            loading={busy === 'verify'}
            disabled={code.length !== CODE_LENGTH}
          />
          <View style={styles.links}>
            <Button
              title={resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
              variant="secondary"
              onPress={send}
              disabled={resendIn > 0 || busy !== null}
              loading={busy === 'send'}
            />
            <Button title="Change number" variant="secondary" onPress={changeNumber} disabled={busy !== null} />
          </View>
        </>
      )}

      <View style={styles.spacer} />
      <AppText variant="caption" color="textSecondary" style={styles.textCenter}>
        Signed in as {user?.email}
      </AppText>
      <Button title="Use a different Google account" variant="secondary" onPress={signOut} disabled={busy !== null} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, paddingTop: spacing.lg },
  phoneRow: { flexDirection: 'row', gap: spacing.sm },
  prefix: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
  },
  input: { minHeight: 52, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, fontSize: fontSize.lg },
  code: { textAlign: 'center', letterSpacing: 12, fontSize: fontSize.xl },
  links: { gap: spacing.sm },
  flex: { flex: 1 },
  bold: { fontWeight: '600' },
  spacer: { flexGrow: 1, minHeight: spacing.xl },
  textCenter: { textAlign: 'center' },
});
