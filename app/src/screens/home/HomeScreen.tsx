import { useNavigation } from '@react-navigation/native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { Toast } from '@/components/Toast';
import { useApi } from '@/hooks/useApi';
import { useNow } from '@/hooks/useNow';
import { useSession } from '@/lib/session';
import { classesService } from '@/services/classes';
import { contentService } from '@/services/content';
import { motion, spacing, useColors } from '@/theme';
import { firstName } from '@/utils/text';
import { formatDate, greeting, MS } from '@/utils/time';

import { AnnouncementPreview } from './components/AnnouncementPreview';
import { NextClassCard } from './components/NextClassCard';
import { NoSubscriptionCard } from './components/NoSubscriptionCard';
import { WeeklySchedule } from './components/WeeklySchedule';

async function loadHome() {
  const [classes, announcements] = await Promise.all([
    classesService.myClasses(),
    // A failing announcements call shouldn't break the whole Home screen.
    contentService.announcements().catch(() => null),
  ]);
  return {
    ...classes,
    latestAnnouncement: announcements?.announcements[0] ?? null,
  };
}

export function HomeScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const { user, subscriptions: sessionSubs } = useSession();
  const now = useNow(30_000);
  const { data, error, loading, refreshing, refresh, reload } =
    useApi(loadHome);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), motion.feedbackMs);
  }, []);
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const classes = useMemo(() => data?.classes ?? [], [data]);
  const subscriptions = data?.subscriptions ?? sessionSubs;

  // First class that hasn't finished yet (server order is by next start time).
  const nextClass = useMemo(
    () =>
      classes.find(c => {
        if (!c.nextClassAt) return false;
        const end =
          new Date(c.nextClassAt).getTime() +
          (c.durationMinutes ?? 60) * MS.MINUTE;
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

  // Session subscriptions change after a payment / phone verification → reload classes.
  const seenSubs = useRef(sessionSubs);
  useEffect(() => {
    if (seenSubs.current === sessionSubs) return;
    seenSubs.current = sessionSubs;
    refresh();
  }, [sessionSubs, refresh]);

  const goToPlans = useCallback(
    () =>
      navigation.navigate('Main', {
        screen: 'PlansTab',
        params: { screen: 'Plans' },
      }),
    [navigation],
  );
  // const goToProfile = useCallback(
  //   () =>
  //     navigation.navigate('Main', {
  //       screen: 'ProfileTab',
  //       params: { screen: 'Profile' },
  //     }),
  //   [navigation],
  // );
  const goToLearn = useCallback(
    () =>
      navigation.navigate('Main', {
        screen: 'LearnTab',
        params: { screen: 'Learn', params: { tab: 'updates' } },
      }),
    [navigation],
  );

  const join = async (batchId: string) => {
    setJoiningId(batchId);
    try {
      const { meetLink } = await classesService.join(batchId);
      await Linking.openURL(meetLink);
    } catch (e) {
      Alert.alert(
        'Could not join',
        e instanceof Error ? e.message : 'Please try again.',
      );
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

  const hasSubscription =
    data?.hasActiveSubscription ?? subscriptions.length > 0;

  return (
    <Screen
      tiledGrain
      onRefresh={refresh}
      refreshing={refreshing}
      edges={['top', 'left', 'right']}
      footer={<Toast message={toast} />}
    >
      {/* Header: app name, then date + greeting, all on the screen's 20px side padding */}
      <View style={styles.header}>
        <AppText variant="heading">Cadence</AppText>
        <View>
          <AppText variant="caption" color="muted">
            {formatDate(now)}
          </AppText>
          <AppText variant="title" numberOfLines={1}>
            {greeting(now)}, {firstName(user?.name)}
          </AppText>
        </View>
        {/* <Avatar
          name={user?.name ?? ''}
          url={user?.avatarUrl}
          onPress={goToProfile}
        /> */}
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
              onCopied={() => showToast('Link copied')}
            />
          ) : (
            <Card variant="quiet">
              <AppText style={styles.bold}>No classes scheduled yet</AppText>
              <AppText color="textSecondary">
                Your class timings will appear here once the academy assigns
                your batch.
              </AppText>
            </Card>
          )}

          {/* Weekly timetable */}
          {classes.length > 0 && (
            <Section title="This week">
              <WeeklySchedule
                classes={classes}
                now={now}
                nextClass={nextClass}
              />
            </Section>
          )}
        </>
      )}

      {/* Subscriptions */}
      {subscriptions.length > 0 && (
        <Section
          title={
            subscriptions.length > 1
              ? 'Your subscriptions'
              : 'Your subscription'
          }
        >
          {subscriptions.map(s => (
            <SubscriptionCard
              key={s._id}
              sub={s}
              now={now}
              onRenew={goToPlans}
            />
          ))}
        </Section>
      )}

      {/* Latest announcement */}
      {data?.latestAnnouncement && (
        <Section
          title="Latest update"
          action={{ label: 'See all', onPress: goToLearn }}
        >
          <AnnouncementPreview
            item={data.latestAnnouncement}
            onPress={goToLearn}
          />
        </Section>
      )}
    </Screen>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: { label: string; onPress: () => void };
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText variant="label" color="muted" style={styles.flex}>
          {title}
        </AppText>
        {action && (
          <Pressable
            onPress={action.onPress}
            hitSlop={8}
            accessibilityRole="button"
          >
            <AppText color="primary" style={styles.bold}>
              {action.label}
            </AppText>
          </Pressable>
        )}
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerGap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  textCenter: { textAlign: 'center' },
  bold: { fontWeight: '600' },
  section: { gap: spacing.sectionHeader },
  sectionBody: { gap: spacing.cardGap },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  // App name → date: 24.
  header: { gap: spacing.lg },
  flex: { flex: 1 },
});
