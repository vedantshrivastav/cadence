import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { useApi } from '@/hooks/useApi';
import { useNow } from '@/hooks/useNow';
import { CheckoutError, openCheckout } from '@/lib/razorpay';
import { useSession } from '@/lib/session';
import type { PlansScreenProps } from '@/navigation/types';
import { classesService } from '@/services/classes';
import { paymentsService } from '@/services/payments';
import { spacing, useColors } from '@/theme';
import type { Batch, Instrument } from '@/types/api';
import { formatRupees } from '@/utils/money';
import { capitalize } from '@/utils/text';
import { formatDate } from '@/utils/time';

import { BatchOption } from './components/BatchOption';
import { CheckoutBar } from './components/CheckoutBar';
import { PlanCard } from './components/PlanCard';

const INSTRUMENTS: { value: Instrument; label: string }[] = [
  { value: 'violin', label: '🎻 Violin' },
  { value: 'piano', label: '🎹 Piano' },
  { value: 'drums', label: '🥁 Drums' },
];

type PayStage = 'idle' | 'creating' | 'checkout' | 'verifying';

export function PlansScreen({ navigation }: PlansScreenProps<'Plans'>) {
  const colors = useColors();
  const now = useNow(60_000);
  const { user, subscriptions, refresh: refreshSession } = useSession();
  const { data, error, loading, refreshing, refresh, reload } = useApi(classesService.plans);
  const plans = useMemo(() => data?.plans ?? [], [data]);

  // Start from the student's current subscription, so "Renew" from Home lands pre-filled.
  const current = subscriptions[0];
  const [instrument, setInstrument] = useState<Instrument | null>(current?.instrument ?? user?.instruments[0] ?? null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [stage, setStage] = useState<PayStage>('idle');

  const plan = plans.find(p => p._id === planId) ?? null;
  const activeSub = subscriptions.find(s => s.instrument === instrument && new Date(s.endDate) > now);

  // Pre-select the plan matching the current subscription once plans arrive.
  useEffect(() => {
    if (planId || plans.length === 0) return;
    const match = activeSub && plans.find(p => p.classesPerWeek === activeSub.classesPerWeek);
    if (match) setPlanId(match._id);
  }, [plans, planId, activeSub]);

  // ----- Batches for the chosen instrument + plan -----
  const [batches, setBatches] = useState<Batch[] | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batchReloadKey, setBatchReloadKey] = useState(0);
  const classesPerWeek = plan?.classesPerWeek;
  const currentBatchId = activeSub?.batch;

  useEffect(() => {
    setBatches(null);
    setBatchError(null);
    setBatchId(null);
    if (!instrument || !classesPerWeek) return;

    let cancelled = false;
    classesService
      .batches({ instrument, classesPerWeek })
      .then(res => {
        if (cancelled) return;
        setBatches(res.batches);
        // Keep the student's current batch, or auto-pick when there is only one.
        const keep = res.batches.find(b => b._id === currentBatchId) ?? (res.batches.length === 1 ? res.batches[0] : null);
        setBatchId(keep?._id ?? null);
      })
      .catch(e => !cancelled && setBatchError(e instanceof Error ? e.message : 'Could not load timings'));
    return () => {
      cancelled = true;
    };
  }, [instrument, classesPerWeek, currentBatchId, batchReloadKey]);

  const batch = batches?.find(b => b._id === batchId) ?? null;
  const needsBatch = (batches?.length ?? 0) > 0;

  // ----- Checkout -----
  const missing = !instrument
    ? 'Choose an instrument'
    : !plan
      ? 'Choose a plan'
      : batches === null && !batchError
        ? 'Loading timings…'
        : needsBatch && !batch
          ? 'Choose a batch timing'
          : null;

  const pay = async () => {
    if (!instrument || !plan || missing) return;
    let paid = false;
    try {
      setStage('creating');
      const { checkout } = await paymentsService.createOrder({
        planId: plan._id,
        instrument,
        ...(batch ? { batchId: batch._id } : {}),
      });

      setStage('checkout');
      const result = await openCheckout(checkout);
      paid = true;

      setStage('verifying');
      const { subscription } = await paymentsService.verify(result);
      await refreshSession().catch(() => {});

      navigation.navigate('PaymentSuccess', {
        instrument,
        planName: plan.name,
        endsAt: subscription?.endDate ?? null,
        batchTitle: batch?.title ?? null,
      });
    } catch (e) {
      if (e instanceof CheckoutError && e.cancelled) return; // closed checkout: nothing to report
      if (paid) {
        // Money moved but /verify failed — the Razorpay webhook will still activate the subscription.
        refreshSession().catch(() => {});
        Alert.alert(
          'Payment received',
          "We're confirming your payment. Your classes will appear on Home within a few minutes. " +
            'If they don’t, contact the academy — you will not be charged twice.',
        );
      } else {
        Alert.alert('Payment failed', e instanceof Error ? e.message : 'Please try again.');
      }
    } finally {
      setStage('idle');
    }
  };

  // ----- Render -----
  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && !data) {
    return (
      <Screen scroll={false}>
        <View style={styles.centerGap}>
          <AppText variant="heading">Couldn't load plans</AppText>
          <AppText color="textSecondary" style={styles.textCenter}>
            {error}
          </AppText>
          <Button title="Try again" onPress={reload} />
        </View>
      </Screen>
    );
  }

  const busy = stage !== 'idle';
  const buttonTitle =
    stage === 'verifying'
      ? 'Confirming payment…'
      : plan
        ? `${activeSub ? 'Renew' : 'Pay'} ${formatRupees(plan.pricePaise)} with UPI`
        : 'Pay with UPI';

  return (
    <Screen
      onRefresh={refresh}
      refreshing={refreshing}
      footer={
        <CheckoutBar
          summary={missing ?? `${capitalize(instrument!)} · ${plan!.name}${batch ? ` · ${batch.title}` : ''}`}
          total={plan ? formatRupees(plan.pricePaise) : null}
          buttonTitle={buttonTitle}
          disabled={!!missing}
          loading={busy && stage !== 'verifying'}
          onPay={pay}
        />
      }>
      <View>
        <AppText variant="title">Choose your plan</AppText>
        <AppText color="textSecondary">Live online classes with Cadence teachers on Google Meet.</AppText>
      </View>

      {/* 1. Instrument */}
      <Step number={1} title="Instrument">
        <View style={styles.chips}>
          {INSTRUMENTS.map(i => (
            <Chip
              key={i.value}
              label={i.label}
              selected={instrument === i.value}
              onPress={() => !busy && setInstrument(i.value)}
            />
          ))}
        </View>
        {activeSub && (
          <Card>
            <AppText>
              You're subscribed to {capitalize(activeSub.instrument)} until{' '}
              <AppText style={styles.bold}>{formatDate(new Date(activeSub.endDate))}</AppText>. Paying now adds
              {plan ? ` ${plan.durationDays}` : ''} days on top — you won't lose any remaining days.
            </AppText>
          </Card>
        )}
      </Step>

      {/* 2. Plan */}
      <Step number={2} title="Plan">
        {plans.length === 0 ? (
          <AppText color="textSecondary">No plans are available right now. Please check back soon.</AppText>
        ) : (
          plans.map(p => (
            <PlanCard
              key={p._id}
              plan={p}
              selected={p._id === planId}
              highlight={p.classesPerWeek === 4}
              onPress={() => !busy && setPlanId(p._id)}
            />
          ))
        )}
      </Step>

      {/* 3. Batch timing */}
      {instrument && plan && (
        <Step number={3} title="Batch timing">
          {batchError ? (
            <Card>
              <AppText color="danger">{batchError}</AppText>
              <Button title="Retry" variant="secondary" onPress={() => setBatchReloadKey(k => k + 1)} />
            </Card>
          ) : batches === null ? (
            <ActivityIndicator color={colors.primary} />
          ) : batches.length === 0 ? (
            <Card>
              <AppText>
                No {capitalize(instrument)} batches for {plan.classesPerWeek} classes/week are open yet. You can still
                subscribe — the academy will assign your timing and it will show up on Home.
              </AppText>
            </Card>
          ) : (
            batches.map(b => (
              <BatchOption
                key={b._id}
                batch={b}
                now={now}
                selected={b._id === batchId}
                onPress={() => !busy && setBatchId(b._id)}
              />
            ))
          )}
          <AppText variant="caption" color="textSecondary">
            All timings are in IST.
          </AppText>
        </Step>
      )}
    </Screen>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.step}>
      <AppText variant="heading">
        {number}. {title}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerGap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  textCenter: { textAlign: 'center' },
  bold: { fontWeight: '600' },
  step: { gap: spacing.sm },
  chips: { flexDirection: 'row', gap: spacing.sm },
});
