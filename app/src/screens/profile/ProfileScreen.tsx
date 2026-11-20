import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card, Stave } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { useApi } from '@/hooks/useApi';
import { useNow } from '@/hooks/useNow';
import { useSession } from '@/lib/session';
import type { ProfileScreenProps } from '@/navigation/types';
import { classesService } from '@/services/classes';
import { paymentsService } from '@/services/payments';
import { colors, instrumentColors, motion, size, spacing, stave } from '@/theme';
import { formatDate } from '@/utils/time';

import { HelpCard } from './components/HelpCard';
import { PaymentRow } from './components/PaymentRow';
import { ProfileHeader } from './components/ProfileHeader';

const PREVIEW_COUNT = 5;
const IST_MS = 330 * 60_000;

/** Payments and attendance load independently, so one failing doesn't hide the other. */
async function loadActivity() {
  const [payments, attendance] = await Promise.all([
    paymentsService.history().catch(() => null),
    classesService.myAttendance().catch(() => null),
  ]);
  if (!payments && !attendance) throw new Error('Could not load your activity. Pull down to retry.');
  return { payments: payments?.payments ?? null, attendance };
}

export function ProfileScreen({ navigation }: ProfileScreenProps<'Profile'>) {
  const rootNavigation = useNavigation();
  const now = useNow(60_000);
  const { user, subscriptions, isAdmin, refresh: refreshSession, signOut } = useSession();
  const activity = useApi(loadActivity);
  const [showAllPayments, setShowAllPayments] = useState(false);

  // Session subscriptions change after a payment → new payment + subscription to show.
  const reloadActivity = activity.refresh;
  const seenSubs = useRef(subscriptions);
  useEffect(() => {
    if (seenSubs.current === subscriptions) return;
    seenSubs.current = subscriptions;
    reloadActivity();
  }, [subscriptions, reloadActivity]);

  const onRefresh = async () => {
    await Promise.all([activity.refresh(), refreshSession().catch(() => {})]);
  };

  const goToPlans = () => rootNavigation.navigate('Main', { screen: 'PlansTab', params: { screen: 'Plans' } });

  const confirmSignOut = () =>
    Alert.alert('Sign out?', 'You will need to sign in with Google again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);

  if (!user) return null;

  const payments = activity.data?.payments ?? [];
  const attendance = activity.data?.attendance;
  const istMonth = (d: Date) => new Date(d.getTime() + IST_MS).toISOString().slice(0, 7);
  const thisMonth = attendance?.attendance.filter(a => istMonth(new Date(a.date)) === istMonth(now)) ?? [];

  return (
    <Screen onRefresh={onRefresh} refreshing={activity.refreshing}>
      <ProfileHeader user={user} onEdit={() => navigation.navigate('EditProfile')} />

      {!isAdmin && (
        <>
          {/* Subscriptions */}
          <Section title="My subscriptions">
            {subscriptions.length === 0 ? (
              <Card>
                <AppText color="textSecondary">You don't have an active subscription</AppText>
                <Button title="View plans" onPress={goToPlans} />
              </Card>
            ) : (
              subscriptions.map(s => <SubscriptionCard key={s._id} sub={s} now={now} onRenew={goToPlans} />)
            )}
          </Section>

          {activity.loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : activity.error && !activity.data ? (
            <Card>
              <AppText color="textSecondary">{activity.error}</AppText>
              <Button title="Try again" variant="secondary" onPress={activity.reload} />
            </Card>
          ) : (
            <>
              {/* Attendance: this month's classes as notes on the stave */}
              {attendance && (
                <Section title="Attendance">
                  <Card>
                    <View style={styles.figureRow}>
                      <AppText variant="title">{thisMonth.length}</AppText>
                      <Stave noteColors={thisMonth.map(a => instrumentColors[a.batch?.instrument] ?? stave.noteNeutral)} />
                    </View>
                    <AppText variant="caption" color="textSecondary">
                      {thisMonth.length === 1 ? 'class' : 'classes'} this month · {attendance.count}{' '}
                      {attendance.count >= 100 ? 'recent' : 'all time'}
                    </AppText>
                  </Card>
                  {attendance.attendance.length > 0 && (
                    <Card list>
                      {attendance.attendance.slice(0, PREVIEW_COUNT).map((a, i) => (
                        <View key={a._id} style={[styles.listRow, i > 0 && styles.divider]}>
                          <View
                            style={[styles.dot, { backgroundColor: instrumentColors[a.batch?.instrument] ?? stave.noteNeutral }]}
                          />
                          <AppText color="textSecondary" style={styles.flex} numberOfLines={1}>
                            {a.batch?.title ?? 'Class'}
                          </AppText>
                          <AppText variant="label" color="muted">
                            {formatDate(new Date(a.date))}
                          </AppText>
                        </View>
                      ))}
                    </Card>
                  )}
                </Section>
              )}

              {/* Payments */}
              {activity.data?.payments && (
                <Section title="Payment history">
                  {payments.length === 0 ? (
                    <AppText color="textSecondary">No payments yet</AppText>
                  ) : (
                    <Card list>
                      {(showAllPayments ? payments : payments.slice(0, PREVIEW_COUNT)).map((p, i) => (
                        <View key={p._id} style={i > 0 && styles.divider}>
                          <PaymentRow payment={p} />
                        </View>
                      ))}
                      {payments.length > PREVIEW_COUNT && (
                        <Pressable
                          onPress={() => setShowAllPayments(v => !v)}
                          accessibilityRole="button"
                          style={({ pressed }) => [styles.listRow, styles.divider, pressed && styles.pressed]}>
                          <AppText variant="label" color="primary">
                            {showAllPayments ? 'Show less' : `Show all ${payments.length}`}
                          </AppText>
                        </Pressable>
                      )}
                    </Card>
                  )}
                </Section>
              )}
            </>
          )}
        </>
      )}

      <Section title="Help">
        <HelpCard user={user} />
      </Section>

      <Button title="Sign out" variant="secondary" onPress={confirmSignOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  figureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: size.row },
  divider: { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
  dot: { width: size.dot, height: size.dot, borderRadius: size.dot / 2 },
  pressed: { opacity: motion.pressedOpacity },
});
