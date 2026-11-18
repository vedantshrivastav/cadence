import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import type { AdminScreenProps } from '@/navigation/types';
import { adminService, type AdminStudent } from '@/services/admin';
import { spacing, useColors } from '@/theme';
import { capitalize } from '@/utils/text';

import { ListRow, ListState } from './components/ui';

export function AdminStudentsScreen({ navigation }: AdminScreenProps<'AdminStudents'>) {
  const colors = useColors();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce typing → query.
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(
    async (mode: 'first' | 'refresh' | 'more', nextPage = 1) => {
      if (mode === 'first') setLoading(true);
      if (mode === 'refresh') setRefreshing(true);
      if (mode === 'more') setLoadingMore(true);
      try {
        const res = await adminService.students({ search: query, page: nextPage });
        setStudents(list => (mode === 'more' ? [...list, ...res.students] : res.students));
        setTotal(res.total);
        setPage(nextPage);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load students');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [query],
  );

  useEffect(() => {
    load('first');
  }, [load]);
  const refresh = useCallback(() => load('refresh'), [load]);
  useRefreshOnFocus(refresh);

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      <TextField
        label="Search"
        value={search}
        onChangeText={setSearch}
        placeholder="Name, email or phone"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      {!loading && (
        <AppText variant="caption" color="textSecondary">
          {total} student{total === 1 ? '' : 's'}
        </AppText>
      )}
      <ListState
        loading={loading}
        error={error}
        empty={students.length === 0}
        emptyText={query ? 'No students match your search.' : 'No students have signed up yet.'}
        onRetry={() => load('first')}>
        {students.map(s => {
          const active = s.subscriptions.filter(x => x.isActive);
          return (
            <ListRow
              key={s._id}
              title={s.name}
              dimmed={!s.isActive}
              subtitle={[
                [s.phone ? `+91 ${s.phone}` : 'Phone not verified', s.email].join(' · '),
                active.length > 0
                  ? active.map(x => `${capitalize(x.instrument)} ${x.classesPerWeek}×/wk`).join(', ')
                  : 'No active subscription',
              ]}
              right={
                <View style={styles.badges}>
                  {!s.isActive && <Badge label="DISABLED" color={colors.danger} />}
                  {s.isActive && active.length > 0 && <Badge label="ACTIVE" color={colors.success} />}
                </View>
              }
              onPress={() => navigation.navigate('StudentDetail', { student: s })}
            />
          );
        })}
        {students.length < total && (
          <Button
            title="Load more"
            variant="secondary"
            loading={loadingMore}
            onPress={() => load('more', page + 1)}
          />
        )}
      </ListState>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badges: { gap: spacing.xs, alignItems: 'flex-end' },
});
