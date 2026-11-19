import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { useApi } from '@/hooks/useApi';
import { useSession } from '@/lib/session';
import type { LearnScreenProps, LearnTab } from '@/navigation/types';
import { contentService } from '@/services/content';
import { spacing, useColors } from '@/theme';
import type { Announcement, Instrument, Resource } from '@/types/api';
import { capitalize } from '@/utils/text';

import { AnnouncementItem } from './components/AnnouncementItem';
import { RESOURCE_TYPES, ResourceItem } from './components/ResourceItem';

export function LearnScreen({ route }: LearnScreenProps<'Learn'>) {
  const colors = useColors();
  const rootNavigation = useNavigation();
  const { subscriptions, isAdmin } = useSession();

  // Opened from Home's "See all updates" → jump to that tab, even if Learn is already mounted.
  const requestedTab = route.params?.tab;
  const [tab, setTab] = useState<LearnTab>(requestedTab ?? 'updates');
  useEffect(() => {
    if (requestedTab) setTab(requestedTab);
  }, [requestedTab]);

  const updates = useApi(contentService.announcements);
  const practice = useApi(contentService.resources);

  // Session subscriptions change after a payment → practice material may have unlocked.
  const reloadPractice = practice.refresh;
  const seenSubs = useRef(subscriptions);
  useEffect(() => {
    if (seenSubs.current === subscriptions) return;
    seenSubs.current = subscriptions;
    reloadPractice();
  }, [subscriptions, reloadPractice]);

  const active = tab === 'updates' ? updates : practice;

  return (
    <Screen onRefresh={active.refresh} refreshing={active.refreshing}>
      <View style={styles.tabs} accessibilityRole="tablist">
        <Chip label="Updates" selected={tab === 'updates'} onPress={() => setTab('updates')} />
        <Chip label="Practice" selected={tab === 'practice'} onPress={() => setTab('practice')} />
      </View>

      {active.loading ? (
        <ActivityIndicator style={styles.spinner} size="large" color={colors.primary} />
      ) : active.error && !active.data ? (
        <Card>
          <AppText style={styles.bold}>Couldn't load {tab === 'updates' ? 'updates' : 'practice material'}</AppText>
          <AppText color="textSecondary">{active.error}</AppText>
          <Button title="Try again" variant="secondary" onPress={active.reload} />
        </Card>
      ) : tab === 'updates' ? (
        <Updates items={updates.data?.announcements ?? []} />
      ) : (
        <Practice
          items={practice.data?.resources ?? []}
          locked={!isAdmin && subscriptions.length === 0}
          onViewPlans={() => rootNavigation.navigate('Main', { screen: 'PlansTab', params: { screen: 'Plans' } })}
        />
      )}
    </Screen>
  );
}

// ----- Updates tab -----
function Updates({ items }: { items: Announcement[] }) {
  if (items.length === 0) {
    return <Empty title="No updates yet" body="Notices from the academy — holidays, recitals, timing changes — show up here." />;
  }
  return (
    <View style={styles.list}>
      {items.map(a => (
        <AnnouncementItem key={a._id} item={a} />
      ))}
    </View>
  );
}

// ----- Practice tab -----
function Practice({ items, locked, onViewPlans }: { items: Resource[]; locked: boolean; onViewPlans: () => void }) {
  const [instrument, setInstrument] = useState<Instrument | 'all'>('all');
  const [type, setType] = useState<Resource['type'] | 'all'>('all');

  const instruments = useMemo(() => [...new Set(items.map(r => r.instrument))], [items]);
  const types = useMemo(
    () => (Object.keys(RESOURCE_TYPES) as Resource['type'][]).filter(t => items.some(r => r.type === t)),
    [items],
  );
  const shown = items.filter(r => (instrument === 'all' || r.instrument === instrument) && (type === 'all' || r.type === type));

  if (locked) {
    return (
      <Card variant="hero">
        <AppText variant="heading" color="onPrimary">
          Practice material is for subscribers 🔒
        </AppText>
        <AppText color="onPrimary">
          Get sheet music, practice videos and recordings of your classes when you subscribe.
        </AppText>
        <Button title="View plans" variant="inverse" onPress={onViewPlans} />
      </Card>
    );
  }

  if (items.length === 0) {
    return <Empty title="Nothing here yet" body="Your teachers will share sheet music, practice videos and class recordings here." />;
  }

  const open = async (r: Resource) => {
    try {
      await Linking.openURL(r.url);
    } catch {
      Alert.alert('Could not open', 'No app on this phone can open this link.');
    }
  };

  return (
    <View style={styles.list}>
      {instruments.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <Chip fill={false} label="All instruments" selected={instrument === 'all'} onPress={() => setInstrument('all')} />
          {instruments.map(i => (
            <Chip key={i} fill={false} label={capitalize(i)} selected={instrument === i} onPress={() => setInstrument(i)} />
          ))}
        </ScrollView>
      )}
      {types.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <Chip fill={false} label="All" selected={type === 'all'} onPress={() => setType('all')} />
          {types.map(t => (
            <Chip
              key={t}
              fill={false}
              label={`${RESOURCE_TYPES[t].icon} ${RESOURCE_TYPES[t].plural}`}
              selected={type === t}
              onPress={() => setType(t)}
            />
          ))}
        </ScrollView>
      )}
      {shown.length === 0 ? (
        <AppText color="textSecondary">Nothing matches these filters.</AppText>
      ) : (
        shown.map(r => <ResourceItem key={r._id} item={r} onOpen={() => open(r)} />)
      )}
    </View>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.empty}>
      <AppText variant="heading">{title}</AppText>
      <AppText color="textSecondary" style={styles.textCenter}>
        {body}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: spacing.sm },
  spinner: { marginTop: spacing.xl },
  bold: { fontWeight: '600' },
  list: { gap: spacing.sm },
  filters: { gap: spacing.sm },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  textCenter: { textAlign: 'center' },
});
