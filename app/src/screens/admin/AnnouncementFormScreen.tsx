import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import type { AdminScreenProps } from '@/navigation/types';
import { adminService } from '@/services/admin';
import type { Instrument } from '@/types/api';

import { INSTRUMENT_OPTIONS, MultiChips, SwitchRow } from './components/ui';

export function AnnouncementFormScreen({ route, navigation }: AdminScreenProps<'AnnouncementForm'>) {
  const existing = route.params?.announcement;
  const [title, setTitle] = useState(existing?.title ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [instruments, setInstruments] = useState<Instrument[]>(existing?.instruments ?? []);
  const [isPinned, setIsPinned] = useState(existing?.isPinned ?? false);
  const [busy, setBusy] = useState<'save' | 'delete' | null>(null);

  const valid = title.trim().length >= 2 && body.trim().length > 0;

  const save = async () => {
    if (!valid) return;
    setBusy('save');
    const input = { title: title.trim(), body: body.trim(), instruments, isPinned };
    try {
      if (existing) await adminService.updateAnnouncement(existing._id, input);
      else await adminService.createAnnouncement(input);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
      setBusy(null);
    }
  };

  const remove = () =>
    existing &&
    Alert.alert('Delete announcement?', 'Students will no longer see it.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setBusy('delete');
          try {
            await adminService.deleteAnnouncement(existing._id);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Could not delete', e instanceof Error ? e.message : 'Please try again.');
            setBusy(null);
          }
        },
      },
    ]);

  return (
    <Screen>
      <TextField label="Title" value={title} onChangeText={setTitle} maxLength={150} placeholder="No class on Diwali" />
      <TextField
        label="Message"
        value={body}
        onChangeText={setBody}
        multiline
        maxLength={5000}
        textAlignVertical="top"
        style={styles.multiline}
        placeholder="All classes are off on 1 Nov. Regular classes resume on 2 Nov."
      />
      <MultiChips
        label="Who sees it"
        hint={instruments.length === 0 ? 'Everyone (no instrument selected).' : 'Only students of these instruments.'}
        options={INSTRUMENT_OPTIONS}
        value={instruments}
        onChange={setInstruments}
      />
      <SwitchRow label="Pin to top" hint="Pinned updates stay first on Home and Learn." value={isPinned} onChange={setIsPinned} />
      {!existing && (
        <AppText variant="caption" color="textSecondary">
          Students see it on Home and in Learn → Updates.
        </AppText>
      )}
      <Button title={existing ? 'Save changes' : 'Post'} onPress={save} disabled={!valid} loading={busy === 'save'} />
      {existing && <Button title="Delete" variant="secondary" onPress={remove} loading={busy === 'delete'} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  multiline: { minHeight: 140, paddingTop: 12 },
});
