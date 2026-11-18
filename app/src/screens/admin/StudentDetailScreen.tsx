import { useCallback, useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useApi } from '@/hooks/useApi';
import type { AdminScreenProps } from '@/navigation/types';
import { adminService, type AdminStudent } from '@/services/admin';
import { spacing, useColors } from '@/theme';
import type { ClassesPerWeek, Instrument } from '@/types/api';
import { capitalize } from '@/utils/text';
import { daysLeft, formatDate } from '@/utils/time';

import { FieldLabel, INSTRUMENT_OPTIONS, OptionChips, SwitchRow } from './components/ui';

async function loadOptions() {
  const [plans, batches] = await Promise.all([adminService.plans(), adminService.batches()]);
  return { plans: plans.plans, batches: batches.batches.filter(b => b.isActive) };
}

export function StudentDetailScreen({ route }: AdminScreenProps<'StudentDetail'>) {
  const colors = useColors();
  const [student, setStudent] = useState<AdminStudent>(route.params.student);
  const options = useApi(loadOptions);
  const [busy, setBusy] = useState<string | null>(null);

  /** No single-student endpoint: re-find them by email. */
  const reloadStudent = useCallback(async () => {
    const res = await adminService.students({ search: student.email });
    const fresh = res.students.find(s => s._id === student._id);
    if (fresh) setStudent(fresh);
  }, [student._id, student.email]);

  const run = async (key: string, action: () => Promise<unknown>, done?: string) => {
    setBusy(key);
    try {
      await action();
      await reloadStudent();
      if (done) Alert.alert('Done', done);
    } catch (e) {
      Alert.alert('Failed', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(null);
    }
  };

  // ----- Grant / extend access -----
  const [grantInstrument, setGrantInstrument] = useState<Instrument | null>(null);
  const [grantCpw, setGrantCpw] = useState<ClassesPerWeek | null>(null);
  const [grantBatch, setGrantBatch] = useState<string | null>(null);
  const [grantDays, setGrantDays] = useState('30');
  const plans = options.data?.plans ?? [];
  const grantPlan = plans.find(p => p.classesPerWeek === grantCpw);
  const grantBatches = (options.data?.batches ?? []).filter(
    b => b.instrument === grantInstrument && b.classesPerWeek === grantCpw,
  );
  const days = Number(grantDays);
  const canGrant = grantInstrument && grantPlan && Number.isInteger(days) && days >= 1 && days <= 366;

  const grant = () => {
    if (!canGrant) return;
    Alert.alert(
      'Give access?',
      `${capitalize(grantInstrument)} · ${grantPlan.name} for ${days} days. If they already have time left, it is added on top.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Give access',
          onPress: () =>
            run(
              'grant',
              () =>
                adminService.grantSubscription({
                  userId: student._id,
                  instrument: grantInstrument,
                  planId: grantPlan._id,
                  days,
                  ...(grantBatch ? { batchId: grantBatch } : {}),
                }),
              'Access granted.',
            ),
        },
      ],
    );
  };

  const confirmCancel = (subId: string, label: string) =>
    Alert.alert('Cancel subscription?', `${label} will stop immediately. This does not refund any payment.`, [
      { text: 'Keep', style: 'cancel' },
      { text: 'Cancel subscription', style: 'destructive', onPress: () => run(subId, () => adminService.cancelSubscription(subId)) },
    ]);

  const now = new Date();

  return (
    <Screen>
      {/* Profile */}
      <Card>
        <AppText variant="heading">{student.name}</AppText>
        <AppText color="textSecondary">{student.email}</AppText>
        <AppText color="textSecondary">
          {student.phone ? `+91 ${student.phone}` : 'Phone not verified'}
          {student.phoneVerified ? ' ✓' : ''}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          Joined {formatDate(new Date(student.createdAt))}
        </AppText>
        {student.phone && (
          <View style={styles.row}>
            <View style={styles.flex}>
              <Button title="WhatsApp" variant="secondary" onPress={() => Linking.openURL(`https://wa.me/91${student.phone}`)} />
            </View>
            <View style={styles.flex}>
              <Button title="Call" variant="secondary" onPress={() => Linking.openURL(`tel:+91${student.phone}`)} />
            </View>
          </View>
        )}
      </Card>

      {/* Subscriptions */}
      <View style={styles.section}>
        <AppText variant="heading">Subscriptions</AppText>
        {student.subscriptions.length === 0 && <AppText color="textSecondary">None yet.</AppText>}
        {student.subscriptions.map(sub => {
          const label = `${capitalize(sub.instrument)} · ${sub.plan?.name ?? `${sub.classesPerWeek}×/week`}`;
          const batchOptions = (options.data?.batches ?? []).filter(
            b => b.instrument === sub.instrument && b.classesPerWeek === sub.classesPerWeek,
          );
          return (
            <Card key={sub._id}>
              <View style={styles.rowBetween}>
                <AppText style={styles.bold}>{label}</AppText>
                <Badge
                  label={sub.isActive ? 'ACTIVE' : sub.status === 'cancelled' ? 'CANCELLED' : 'EXPIRED'}
                  color={sub.isActive ? colors.success : colors.border}
                  textColor={sub.isActive ? '#FFFFFF' : colors.text}
                />
              </View>
              <AppText color="textSecondary">
                {formatDate(new Date(sub.startDate))} → {formatDate(new Date(sub.endDate))}
                {sub.isActive ? ` · ${daysLeft(new Date(sub.endDate), now)} days left` : ''}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                Source: {sub.source.replace('_', ' ')}
                {sub.notes ? ` · ${sub.notes}` : ''}
              </AppText>

              {sub.isActive && (
                <>
                  <FieldLabel>Batch</FieldLabel>
                  {batchOptions.length === 0 ? (
                    <AppText variant="caption" color="textSecondary">
                      No active {sub.instrument} {sub.classesPerWeek}×/week batches. Create one under Batches.
                    </AppText>
                  ) : (
                    <OptionChips
                      options={[{ value: '', label: 'Any' }, ...batchOptions.map(b => ({ value: b._id, label: b.title }))]}
                      value={sub.batch?._id ?? ''}
                      onChange={id => run(sub._id, () => adminService.assignBatch(sub._id, id || null))}
                    />
                  )}
                  <Button
                    title="Cancel subscription"
                    variant="secondary"
                    loading={busy === sub._id}
                    onPress={() => confirmCancel(sub._id, label)}
                  />
                </>
              )}
            </Card>
          );
        })}
      </View>

      {/* Manual grant */}
      <View style={styles.section}>
        <AppText variant="heading">Give or extend access</AppText>
        <AppText variant="caption" color="textSecondary">
          For cash / direct payments. Online payments activate automatically.
        </AppText>
        <Card>
          <OptionChips label="Instrument" options={INSTRUMENT_OPTIONS} value={grantInstrument} onChange={v => { setGrantInstrument(v); setGrantBatch(null); }} />
          <OptionChips
            label="Plan"
            options={plans.map(p => ({ value: p.classesPerWeek, label: p.name }))}
            value={grantCpw}
            onChange={v => {
              setGrantCpw(v);
              setGrantBatch(null);
              setGrantDays(String(plans.find(p => p.classesPerWeek === v)?.durationDays ?? 30));
            }}
          />
          {grantBatches.length > 0 && (
            <OptionChips
              label="Batch (optional)"
              options={[{ value: '', label: 'Any' }, ...grantBatches.map(b => ({ value: b._id, label: b.title }))]}
              value={grantBatch ?? ''}
              onChange={id => setGrantBatch(id || null)}
            />
          )}
          <TextField label="Days" value={grantDays} onChangeText={t => setGrantDays(t.replace(/\D/g, ''))} keyboardType="number-pad" />
          <Button title="Give access" onPress={grant} disabled={!canGrant} loading={busy === 'grant'} />
        </Card>
      </View>

      {/* Account */}
      <Card>
        <SwitchRow
          label="Account enabled"
          hint="Disabled students can't sign in."
          value={student.isActive}
          onChange={v => run('status', () => adminService.setStudentActive(student._id, v))}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  bold: { fontWeight: '600', flexShrink: 1 },
});
