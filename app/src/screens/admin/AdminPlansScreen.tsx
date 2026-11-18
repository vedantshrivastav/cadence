import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useApi } from '@/hooks/useApi';
import { adminService } from '@/services/admin';
import type { Plan } from '@/types/api';

import { ListState, SwitchRow } from './components/ui';

export function AdminPlansScreen() {
  const { data, error, loading, refreshing, refresh, reload } = useApi(adminService.plans);
  const plans = data?.plans ?? [];

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      <AppText color="textSecondary">
        New prices apply to new payments only. Students who already paid keep their current period.
      </AppText>
      <ListState loading={loading} error={error} empty={plans.length === 0} emptyText="No plans. Run npm run seed on the backend." onRetry={reload}>
        {plans.map(p => (
          <PlanEditor key={p._id} plan={p} onSaved={refresh} />
        ))}
      </ListState>
    </Screen>
  );
}

function PlanEditor({ plan, onSaved }: { plan: Plan; onSaved: () => void }) {
  const [name, setName] = useState(plan.name);
  const [price, setPrice] = useState(String(plan.pricePaise / 100));
  const [days, setDays] = useState(String(plan.durationDays));
  const [description, setDescription] = useState(plan.description ?? '');
  const [features, setFeatures] = useState((plan.features ?? []).join('\n'));
  const [isActive, setIsActive] = useState(plan.isActive);
  const [saving, setSaving] = useState(false);

  const priceNum = Number(price);
  const daysNum = Number(days);
  const valid = name.trim().length >= 2 && priceNum >= 1 && Number.isInteger(daysNum) && daysNum >= 1 && daysNum <= 366;

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      await adminService.updatePlan(plan._id, {
        name: name.trim(),
        pricePaise: Math.round(priceNum * 100),
        durationDays: daysNum,
        description: description.trim(),
        features: features.split('\n').map(f => f.trim()).filter(Boolean),
        isActive,
      });
      onSaved();
      Alert.alert('Saved', `${name.trim()} updated.`);
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <AppText variant="heading">{plan.classesPerWeek} classes / week</AppText>
      <TextField label="Name" value={name} onChangeText={setName} />
      <TextField
        label="Price (₹)"
        value={price}
        onChangeText={t => setPrice(t.replace(/[^\d.]/g, ''))}
        keyboardType="decimal-pad"
      />
      <TextField label="Valid for (days)" value={days} onChangeText={t => setDays(t.replace(/\D/g, ''))} keyboardType="number-pad" />
      <TextField label="Short description (optional)" value={description} onChangeText={setDescription} />
      <TextField
        label="Features — one per line (optional)"
        value={features}
        onChangeText={setFeatures}
        multiline
        textAlignVertical="top"
        style={styles.multiline}
      />
      <SwitchRow label="Available to buy" value={isActive} onChange={setIsActive} />
      <Button title="Save" onPress={save} disabled={!valid} loading={saving} />
    </Card>
  );
}

const styles = StyleSheet.create({
  multiline: { minHeight: 96, paddingTop: 12 },
});
