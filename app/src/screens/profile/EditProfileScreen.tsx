import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useSession } from '@/lib/session';
import type { ProfileScreenProps } from '@/navigation/types';
import { authService } from '@/services/auth';
import { spacing } from '@/theme';
import type { Instrument } from '@/types/api';

const INSTRUMENTS: { value: Instrument; label: string }[] = [
  { value: 'violin', label: '🎻 Violin' },
  { value: 'piano', label: '🎹 Piano' },
  { value: 'drums', label: '🥁 Drums' },
];

export function EditProfileScreen({ navigation }: ProfileScreenProps<'EditProfile'>) {
  const { user, refresh } = useSession();
  const [name, setName] = useState(user?.name ?? '');
  const [instruments, setInstruments] = useState<Instrument[]>(user?.instruments ?? []);
  const [saving, setSaving] = useState(false);

  const trimmed = name.trim();
  const nameError = trimmed.length < 2 ? 'Please enter your name' : null;
  const changed =
    trimmed !== user?.name ||
    instruments.length !== user.instruments.length ||
    instruments.some(i => !user.instruments.includes(i));

  const toggle = (i: Instrument) =>
    setInstruments(list => (list.includes(i) ? list.filter(x => x !== i) : [...list, i]));

  const save = async () => {
    if (nameError) return;
    setSaving(true);
    try {
      await authService.updateProfile({ name: trimmed, instruments });
      await refresh();
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <TextField
        label="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoComplete="name"
        maxLength={80}
        returnKeyType="done"
        error={name.length > 0 ? nameError : null}
      />

      <View style={styles.group}>
        <AppText variant="caption" color="textSecondary" style={styles.bold}>
          Instruments you're learning
        </AppText>
        <View style={styles.chips}>
          {INSTRUMENTS.map(i => (
            <Chip key={i.value} label={i.label} selected={instruments.includes(i.value)} onPress={() => toggle(i.value)} />
          ))}
        </View>
        <AppText variant="caption" color="textSecondary">
          Used to show you the right updates. It doesn't change your subscription.
        </AppText>
      </View>

      <View style={styles.group}>
        <AppText variant="caption" color="textSecondary" style={styles.bold}>
          Email and phone
        </AppText>
        <AppText color="textSecondary">
          {user?.email}
          {user?.phone ? `  ·  +91 ${user.phone}` : ''}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          These come from your Google account and OTP verification, so they can't be edited here. Contact the academy
          to change them.
        </AppText>
      </View>

      <Button title="Save" onPress={save} loading={saving} disabled={!changed || !!nameError} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.sm },
  chips: { flexDirection: 'row', gap: spacing.sm },
  bold: { fontWeight: '600' },
});
