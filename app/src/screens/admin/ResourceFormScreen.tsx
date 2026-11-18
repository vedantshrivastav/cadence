import { useState } from 'react';
import { Alert } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useApi } from '@/hooks/useApi';
import type { AdminScreenProps } from '@/navigation/types';
import { RESOURCE_TYPES } from '@/screens/learn/components/ResourceItem';
import { adminService } from '@/services/admin';
import type { Instrument, Resource } from '@/types/api';

import { INSTRUMENT_OPTIONS, OptionChips } from './components/ui';

const TYPE_OPTIONS = (Object.keys(RESOURCE_TYPES) as Resource['type'][]).map(t => ({
  value: t,
  label: `${RESOURCE_TYPES[t].icon} ${RESOURCE_TYPES[t].label}`,
}));

export function ResourceFormScreen({ navigation }: AdminScreenProps<'ResourceForm'>) {
  const batchesApi = useApi(adminService.batches);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [type, setType] = useState<Resource['type'] | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const urlOk = /^https?:\/\/\S+$/i.test(url.trim());
  const valid = title.trim().length >= 2 && urlOk && instrument && type;
  const batches = (batchesApi.data?.batches ?? []).filter(b => b.isActive && b.instrument === instrument);

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      await adminService.createResource({
        title: title.trim(),
        url: url.trim(),
        instrument,
        type,
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(batchId ? { batchId } : {}),
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
      setSaving(false);
    }
  };

  return (
    <Screen>
      <TextField label="Title" value={title} onChangeText={setTitle} placeholder="C major scale — fingering chart" />
      <TextField label="Description (optional)" value={description} onChangeText={setDescription} />
      <TextField
        label="Link"
        value={url}
        onChangeText={setUrl}
        placeholder="https://drive.google.com/…  or  https://youtu.be/…"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        error={url.length > 0 && !urlOk ? 'Must start with https://' : null}
      />
      <AppText variant="caption" color="textSecondary">
        Upload files to Google Drive or YouTube (unlisted) and paste the share link. Make sure “Anyone with the link”
        can view.
      </AppText>
      <OptionChips label="Type" options={TYPE_OPTIONS} value={type} onChange={setType} />
      <OptionChips label="Instrument" options={INSTRUMENT_OPTIONS} value={instrument} onChange={v => { setInstrument(v); setBatchId(null); }} />
      {batches.length > 0 && (
        <OptionChips
          label="Only for one batch? (optional)"
          options={[{ value: '', label: 'All batches' }, ...batches.map(b => ({ value: b._id, label: b.title }))]}
          value={batchId ?? ''}
          onChange={id => setBatchId(id || null)}
        />
      )}
      <Button title="Share with students" onPress={save} disabled={!valid} loading={saving} />
    </Screen>
  );
}
