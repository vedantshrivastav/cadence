import { useState } from 'react';
import { Alert } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useApi } from '@/hooks/useApi';
import type { AdminScreenProps } from '@/navigation/types';
import { adminService } from '@/services/admin';
import type { ClassesPerWeek, Instrument } from '@/types/api';

import { CPW_OPTIONS, INSTRUMENT_OPTIONS, OptionChips } from './components/ui';
import { isIsoDate, normalizeIndianPhone } from './importParser';

export function ExistingStudentFormScreen({ navigation }: AdminScreenProps<'ExistingStudentForm'>) {
  const batchesApi = useApi(adminService.batches);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [cpw, setCpw] = useState<ClassesPerWeek | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [paidUntil, setPaidUntil] = useState('');
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const cleanPhone = normalizeIndianPhone(phone);
  const errors = {
    name: name.trim() ? null : 'Required',
    phone: cleanPhone ? null : 'Enter a valid 10-digit mobile number',
    email: !email.trim() || /^\S+@\S+\.\S+$/.test(email.trim()) ? null : 'Not a valid email',
    paidUntil: isIsoDate(paidUntil) ? null : 'Use YYYY-MM-DD, e.g. 2026-12-31',
  };
  const ok = !Object.values(errors).some(Boolean) && instrument && cpw;
  const batches = (batchesApi.data?.batches ?? []).filter(
    b => b.isActive && b.instrument === instrument && b.classesPerWeek === cpw,
  );

  const save = async () => {
    setShowErrors(true);
    if (!ok || !cleanPhone) return;
    setSaving(true);
    try {
      const res = await adminService.addExistingStudent({
        name: name.trim(),
        phone: cleanPhone,
        instrument,
        classesPerWeek: cpw,
        paidUntil,
        ...(email.trim() ? { email: email.trim() } : {}),
        ...(batchId ? { batchId } : {}),
      });
      Alert.alert(
        'Saved',
        res.linkedToExistingAccount
          ? 'This student already had an account — their access is active now.'
          : 'They will get access as soon as they sign in and verify this number.',
      );
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const err = (k: keyof typeof errors) => (showErrors ? errors[k] : null);

  return (
    <Screen>
      <TextField label="Name" value={name} onChangeText={setName} autoCapitalize="words" error={err('name')} />
      <TextField
        label="Phone (the number they will verify)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="98765 43210"
        error={err('phone')}
      />
      <TextField
        label="Email (optional)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={err('email')}
      />
      <OptionChips label="Instrument" options={INSTRUMENT_OPTIONS} value={instrument} onChange={v => { setInstrument(v); setBatchId(null); }} />
      <OptionChips label="Plan" options={CPW_OPTIONS} value={cpw} onChange={v => { setCpw(v); setBatchId(null); }} />
      {batches.length > 0 && (
        <OptionChips
          label="Batch (optional)"
          options={[{ value: '', label: 'Any' }, ...batches.map(b => ({ value: b._id, label: b.title }))]}
          value={batchId ?? ''}
          onChange={id => setBatchId(id || null)}
        />
      )}
      <TextField
        label="Fees paid until"
        value={paidUntil}
        onChangeText={setPaidUntil}
        placeholder="2026-12-31"
        keyboardType="numbers-and-punctuation"
        maxLength={10}
        error={err('paidUntil')}
      />
      <Button title="Save" onPress={save} loading={saving} disabled={showErrors && !ok} />
    </Screen>
  );
}
