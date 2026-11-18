import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useApi } from '@/hooks/useApi';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import type { AdminScreenProps } from '@/navigation/types';
import { contentService } from '@/services/content';
import { formatDate } from '@/utils/time';

import { ListRow, ListState } from './components/ui';

export function AdminAnnouncementsScreen({ navigation }: AdminScreenProps<'AdminAnnouncements'>) {
  // For admins, /announcements returns every announcement.
  const { data, error, loading, refreshing, refresh, reload } = useApi(contentService.announcements);
  useRefreshOnFocus(refresh);
  const items = data?.announcements ?? [];

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      <Button title="+ New announcement" onPress={() => navigation.navigate('AnnouncementForm')} />
      <ListState loading={loading} error={error} empty={items.length === 0} emptyText="Nothing posted yet." onRetry={reload}>
        {items.map(a => (
          <ListRow
            key={a._id}
            title={`${a.isPinned ? '📌 ' : ''}${a.title}`}
            subtitle={[
              a.body,
              `${formatDate(new Date(a.createdAt))} · ${a.instruments.length ? a.instruments.join(', ') : 'Everyone'}`,
            ]}
            onPress={() => navigation.navigate('AnnouncementForm', { announcement: a })}
          />
        ))}
      </ListState>
    </Screen>
  );
}
