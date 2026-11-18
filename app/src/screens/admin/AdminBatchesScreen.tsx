import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useApi } from '@/hooks/useApi';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import type { AdminScreenProps } from '@/navigation/types';
import { adminService } from '@/services/admin';
import { useColors } from '@/theme';
import { capitalize } from '@/utils/text';
import { formatHHmm, shortDay } from '@/utils/time';

import { ListRow, ListState } from './components/ui';

export function AdminBatchesScreen({ navigation }: AdminScreenProps<'AdminBatches'>) {
  const colors = useColors();
  const { data, error, loading, refreshing, refresh, reload } = useApi(adminService.batches);
  useRefreshOnFocus(refresh);

  // Active first, then by instrument.
  const batches = [...(data?.batches ?? [])].sort((a, b) => Number(b.isActive) - Number(a.isActive));

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      <Button title="+ New batch" onPress={() => navigation.navigate('BatchForm')} />
      <ListState
        loading={loading}
        error={error}
        empty={batches.length === 0}
        emptyText="No batches yet. Create one with its timings and Google Meet link."
        onRetry={reload}>
        {batches.map(b => (
          <ListRow
            key={b._id}
            title={b.title}
            dimmed={!b.isActive}
            subtitle={[
              `${capitalize(b.instrument)} · ${b.classesPerWeek}×/week · ${capitalize(b.level)}${b.teacherName ? ` · ${b.teacherName}` : ''}`,
              b.schedule.map(s => `${shortDay(s.day)} ${formatHHmm(s.startTime)}`).join(', '),
              b.meetLink,
            ]}
            right={!b.isActive ? <Badge label="INACTIVE" color={colors.border} textColor={colors.text} /> : undefined}
            onPress={() => navigation.navigate('BatchForm', { batch: b })}
          />
        ))}
      </ListState>
    </Screen>
  );
}
