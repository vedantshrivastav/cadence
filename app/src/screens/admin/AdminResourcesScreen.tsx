import { Alert, Linking } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useApi } from '@/hooks/useApi';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import type { AdminScreenProps } from '@/navigation/types';
import { RESOURCE_TYPES } from '@/screens/learn/components/ResourceItem';
import { adminService, type AdminResource } from '@/services/admin';
import { capitalize } from '@/utils/text';
import { formatDate } from '@/utils/time';

import { ListRow, ListState } from './components/ui';

export function AdminResourcesScreen({ navigation }: AdminScreenProps<'AdminResources'>) {
  const { data, error, loading, refreshing, refresh, reload } = useApi(adminService.resources);
  useRefreshOnFocus(refresh);
  const items = data?.resources ?? [];

  const actions = (r: AdminResource) =>
    Alert.alert(r.title, r.url, [
      { text: 'Open', onPress: () => Linking.openURL(r.url).catch(() => {}) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminService.deleteResource(r._id);
            refresh();
          } catch (e) {
            Alert.alert('Could not delete', e instanceof Error ? e.message : 'Please try again.');
          }
        },
      },
      { text: 'Close', style: 'cancel' },
    ]);

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      <Button title="+ Add material" onPress={() => navigation.navigate('ResourceForm')} />
      <ListState
        loading={loading}
        error={error}
        empty={items.length === 0}
        emptyText="Nothing shared yet. Add sheet music, practice videos or class recordings."
        onRetry={reload}>
        {items.map(r => (
          <ListRow
            key={r._id}
            title={`${RESOURCE_TYPES[r.type].icon} ${r.title}`}
            subtitle={[
              `${capitalize(r.instrument)} · ${r.batch ? r.batch.title : 'All batches'} · ${formatDate(new Date(r.createdAt))}`,
              r.description,
            ]}
            onPress={() => actions(r)}
          />
        ))}
      </ListState>
    </Screen>
  );
}
