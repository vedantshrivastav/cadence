import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { adminService, type AdminPayment } from '@/services/admin';
import { spacing, useColors } from '@/theme';
import type { Payment } from '@/types/api';
import { formatRupees } from '@/utils/money';
import { capitalize } from '@/utils/text';
import { formatDate } from '@/utils/time';

import { ListRow, ListState, OptionChips } from './components/ui';

type Filter = 'all' | Payment['status'];

export function AdminPaymentsScreen() {
  const colors = useColors();
  const [filter, setFilter] = useState<Filter>('paid');
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [state, setState] = useState<'loading' | 'refreshing' | 'more' | 'idle'>('loading');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: 'loading' | 'refreshing' | 'more', nextPage = 1) => {
      setState(mode);
      try {
        const res = await adminService.payments({ page: nextPage, ...(filter === 'all' ? {} : { status: filter }) });
        setPayments(list => (mode === 'more' ? [...list, ...res.payments] : res.payments));
        setTotal(res.total);
        setPage(nextPage);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load payments');
      } finally {
        setState('idle');
      }
    },
    [filter],
  );

  useEffect(() => {
    load('loading');
  }, [load]);

  const statusColor = (s: Payment['status']) =>
    s === 'paid' ? colors.success : s === 'failed' ? colors.danger : colors.border;

  return (
    <Screen onRefresh={() => load('refreshing')} refreshing={state === 'refreshing'}>
      <OptionChips
        options={[
          { value: 'paid', label: 'Paid' },
          { value: 'failed', label: 'Failed' },
          { value: 'created', label: 'Started' },
          { value: 'all', label: 'All' },
        ]}
        value={filter}
        onChange={setFilter}
      />
      {state !== 'loading' && (
        <AppText variant="caption" color="textSecondary">
          {total} payment{total === 1 ? '' : 's'}
          {filter === 'created' ? ' · checkout opened but not completed' : ''}
        </AppText>
      )}
      <ListState
        loading={state === 'loading'}
        error={error}
        empty={payments.length === 0}
        emptyText="No payments."
        onRetry={() => load('loading')}>
        {payments.map(p => (
          <ListRow
            key={p._id}
            title={`${p.user?.name ?? 'Deleted user'} · ${formatRupees(p.amountPaise)}`}
            subtitle={[
              `${capitalize(p.instrument)} · ${p.plan?.name ?? 'Plan'}${p.method ? ` · ${p.method.toUpperCase()}` : ''}`,
              `${formatDate(new Date(p.paidAt ?? p.createdAt))}${p.user?.phone ? ` · +91 ${p.user.phone}` : ''}`,
              p.razorpayPaymentId ?? p.razorpayOrderId,
              p.failureReason,
            ]}
            right={
              <View style={styles.right}>
                <Badge
                  label={p.status === 'created' ? 'Started' : capitalize(p.status)}
                  color={statusColor(p.status)}
                  textColor={p.status === 'created' ? colors.text : colors.onPrimary}
                />
              </View>
            }
          />
        ))}
        {payments.length < total && (
          <Button title="Load more" variant="secondary" loading={state === 'more'} onPress={() => load('more', page + 1)} />
        )}
      </ListState>
    </Screen>
  );
}

const styles = StyleSheet.create({
  right: { alignItems: 'flex-end', gap: spacing.xs },
});
