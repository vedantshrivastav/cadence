import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useApi } from '@/hooks/useApi';
import { useNow } from '@/hooks/useNow';
import { useSession } from '@/lib/session';
import { classesService } from '@/services/classes';
import { contentService } from '@/services/content';
import { spacing, useColors } from '@/theme';
import { firstName } from '@/utils/text';
import { formatDate, greeting, MS } from '@/utils/time';

import { AnnouncementPreview } from './components/AnnouncementPreview';
import { NextClassCard } from './components/NextClassCard';
import { NoSubscriptionCard } from './components/NoSubscriptionCard';
import { SubscriptionCard } from './components/SubscriptionCard';
import { WeeklySchedule } from './components/WeeklySchedule';

async function loadHome() {
  const [classes, announcements] = await Promise.all([
    classesService.myClasses(),
    // A failing announcements call shouldn't break the whole Home screen.
    contentService.announcements().catch(() => null),
  ]);
  return { ...classes, latestAnnouncement: announcements?.announcements[0] ?? null };
}

export function HomeScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const { user, subscriptions: sessionSubs } = useSession();
  const now = useNow(30_000);
  const { data, error, loading, refreshing, refresh, reload } = useApi(loadHome);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const classes = useMemo(() => data?.classes ?? [], [data]);
  const subscriptions = data?.subscriptions ?? sessionSubs;

  // First class that hasn't finished yet (server order is by next start time).
  const nextClass = useMemo(
    () =>
      classes.find(c => {
        if (!c.nextClassAt) return false;
        const end = new Date(c.nextClassAt).getTime() + (c.durationMinutes ?? 60) * MS.MINUTE;
        return end > now.getTime();
      }),
    [classes, now],
  );

  // When the shown class finishes, fetch the following occurrence from the server.
  // At most once a minute, so a failing network doesn't cause a request loop.
  const allEnded = classes.length > 0 && !nextClass;
  const lastAutoRefresh = useRef(0);
  useEffect(() => {
    if (!allEnded || refreshing) return;
    if (Date.now() - lastAutoRefresh.current < MS.MINUTE) return;
    lastAutoRefresh.current = Date.now();
    refresh();
  }, [allEnded, refreshing, refresh, now]);

  const goToPlans = useCallback(
    () => navigation.navigate('Main', { screen: 'PlansTab', params: { screen: 'Plans' } }),
    [navigation],
  );
  const goToLearn = useCallback(
    () => navigation.navigate('Main', { screen: 'LearnTab', params: { screen: 'Learn' } }),
    [navigation],
  );

  const join = async (batchId: string) => {
    setJoiningId(batchId);
    try {
      const { meetLink } = await classesService.join(batchId);
      await Linking.openURL(meetLink);
    } catch (e) {
      Alert.alert('Could not join', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setJoiningId(null);
    }
  };

  // ----- First load / error -----
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
          <AppText variant="heading">Couldn't load your classes</AppText>
          <AppText color="textSecondary" style={styles.textCenter}>
            {error}
          </AppText>
          <Button title="Try again" onPress={reload} />
        </View>
      </Screen>
    );
  }

  const hasSubscription = data?.hasActiveSubscription ?? subscriptions.length > 0;

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      {/* Greeting */}
      <View>
        <AppText variant="title">
          {greeting(now)}, {firstName(user?.name)}
        </AppText>
        <AppText color="textSecondary">{formatDate(now)}</AppText>
      </View>

      {!hasSubscription ? (
        <NoSubscriptionCard onViewPlans={goToPlans} />
      ) : (
        <>
          {/* Next class */}
          {nextClass ? (
            <NextClassCard
              cls={nextClass}
              now={now}
              joining={joiningId === nextClass._id}
              onJoin={() => join(nextClass._id)}
            />
          ) : (
            <Card>
              <AppText style={styles.bold}>No classes scheduled yet</AppText>
              <AppText color="textSecondary">
                Your class timings will appear here once the academy assigns your batch.
              </AppText>
            </Card>
          )}

          {/* Subscriptions */}
          <Section title={subscriptions.length > 1 ? 'Your subscriptions' : 'Your subscription'}>
            {subscriptions.map(s => (
              <SubscriptionCard key={s._id} sub={s} now={now} onRenew={goToPlans} />
            ))}
          </Section>

          {/* Weekly timetable */}
          {classes.length > 0 && (
            <Section title="This week">
              <WeeklySchedule classes={classes} now={now} />
            </Section>
          )}
        </>
      )}

      {/* Latest announcement */}
      {data?.latestAnnouncement && (
        <Section title="Latest update">
          <AnnouncementPreview item={data.latestAnnouncement} onPress={goToLearn} />
        </Section>
      )}
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="heading">{title}</AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerGap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  textCenter: { textAlign: 'center' },
  bold: { fontWeight: '600' },
  section: { gap: spacing.sm },
});
