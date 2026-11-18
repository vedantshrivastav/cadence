import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useApi } from '@/hooks/useApi';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import type { AdminScreenProps } from '@/navigation/types';
import { adminService, type ExistingStudentRecord } from '@/services/admin';
import { spacing, useColors } from '@/theme';
import { capitalize } from '@/utils/text';
import { formatDate } from '@/utils/time';

import { ListRow, ListState, OptionChips } from './components/ui';

type Filter = 'all' | 'waiting' | 'claimed';

export function ExistingStudentsScreen({ navigation }: AdminScreenProps<'ExistingStudents'>) {
  const colors = useColors();
  const [filter, setFilter] = useState<Filter>('all');
  const fetcher = useCallback(
    () => adminService.existingStudents(filter === 'all' ? undefined : filter === 'claimed'),
    [filter],
  );
  const { data, error, loading, refreshing, refresh, reload } = useApi(fetcher);
  useRefreshOnFocus(refresh);

  // useApi only fetches on mount; reload when the filter changes.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    reload();
  }, [filter, reload]);

  const remove = (r: ExistingStudentRecord) =>
    Alert.alert('Remove record?', `${r.name} (+91 ${r.phone}) will no longer get automatic access.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminService.deleteExistingStudent(r._id);
            refresh();
          } catch (e) {
            Alert.alert('Failed', e instanceof Error ? e.message : 'Please try again.');
          }
        },
      },
    ]);

  const records = data?.records ?? [];

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      <Card>
        <AppText color="textSecondary">
          Students who paid you directly. When they sign in and verify this phone number, their subscription is
          created automatically until the "paid until" date.
        </AppText>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Button title="+ Add one" onPress={() => navigation.navigate('ExistingStudentForm')} />
          </View>
          <View style={styles.flex}>
            <Button title="Import list" variant="secondary" onPress={() => navigation.navigate('ImportStudents')} />
          </View>
        </View>
      </Card>

      <OptionChips
        options={[
          { value: 'all', label: 'All' },
          { value: 'waiting', label: 'Not signed up' },
          { value: 'claimed', label: 'Signed up' },
        ]}
        value={filter}
        onChange={setFilter}
      />

      <ListState loading={loading} error={error} empty={records.length === 0} emptyText="No records." onRetry={reload}>
        {records.map(r => (
          <ListRow
            key={r._id}
            title={r.name}
            subtitle={[
              `+91 ${r.phone}${r.email ? ` · ${r.email}` : ''}`,
              `${capitalize(r.instrument)} ${r.classesPerWeek}×/week · paid until ${formatDate(new Date(r.paidUntil))}`,
              r.claimedBy ? `Linked to ${r.claimedBy.name}` : null,
            ]}
            right={
              r.claimedBy ? (
                <Badge label="LINKED" color={colors.success} />
              ) : (
                <Button title="Remove" variant="secondary" onPress={() => remove(r)} />
              )
            }
          />
        ))}
      </ListState>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
