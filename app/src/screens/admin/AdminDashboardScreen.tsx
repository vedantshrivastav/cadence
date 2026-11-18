import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useApi } from '@/hooks/useApi';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import type { AdminScreenProps, AdminStackParamList } from '@/navigation/types';
import { adminService } from '@/services/admin';
import { spacing, type Colors } from '@/theme';
import { formatRupees } from '@/utils/money';

import { ListRow, ListState } from './components/ui';

type MenuTarget = Exclude<keyof AdminStackParamList, 'AdminDashboard' | 'BatchForm' | 'StudentDetail' | 'AnnouncementForm' | 'ExistingStudentForm' | 'ImportStudents' | 'ResourceForm'>;

const MENU: { screen: MenuTarget; title: string; subtitle: string }[] = [
  { screen: 'AdminBatches', title: '🎼 Batches & Meet links', subtitle: 'Class timings, teachers and Google Meet links' },
  { screen: 'AdminStudents', title: '👩‍🎓 Students', subtitle: 'Search, give access, assign batches' },
  { screen: 'ExistingStudents', title: '📋 Already-paid students', subtitle: 'Import your fee list — access on phone match' },
  { screen: 'AdminPayments', title: '💳 Payments', subtitle: 'All UPI / card payments' },
  { screen: 'AdminAnnouncements', title: '📣 Announcements', subtitle: 'Post updates to students' },
  { screen: 'AdminResources', title: '📚 Practice material', subtitle: 'Sheets, videos, recordings' },
  { screen: 'AdminPlans', title: '🏷️ Plans & prices', subtitle: 'Edit the 2× and 4× / week plans' },
];

export function AdminDashboardScreen({ navigation }: AdminScreenProps<'AdminDashboard'>) {
  const { data, error, loading, refreshing, refresh, reload } = useApi(adminService.dashboard);
  useRefreshOnFocus(refresh);
  const s = data?.stats;

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      <ListState loading={loading} error={error} empty={!s} emptyText="" onRetry={reload}>
        {s && (
          <View style={styles.grid}>
            <Stat label="Revenue this month" value={formatRupees(s.revenueThisMonthPaise)} note={`${s.paymentsThisMonth} payments`} />
            <Stat label="Active subscriptions" value={String(s.activeSubscriptions)} />
            <Stat
              label="Expiring in 7 days"
              value={String(s.expiringIn7Days)}
              color={s.expiringIn7Days > 0 ? 'danger' : 'text'}
            />
            <Stat label="Students" value={String(s.totalStudents)} />
            <Stat
              label="Paid, not signed up yet"
              value={String(s.existingStudentsNotYetSignedUp)}
              note="From your imported list"
            />
          </View>
        )}
      </ListState>

      <View style={styles.menu}>
        <AppText variant="heading">Manage</AppText>
        {MENU.map(m => (
          <ListRow key={m.screen} title={m.title} subtitle={[m.subtitle]} onPress={() => navigation.navigate(m.screen)} />
        ))}
      </View>
    </Screen>
  );
}

function Stat({ label, value, note, color = 'primary' }: { label: string; value: string; note?: string; color?: keyof Colors }) {
  return (
    <Card style={styles.stat}>
      <AppText variant="title" color={color}>
        {value}
      </AppText>
      <AppText variant="caption" color="textSecondary">
        {label}
        {note ? `\n${note}` : ''}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: { flexBasis: '47%', flexGrow: 1, gap: spacing.xs },
  menu: { gap: spacing.sm },
});
