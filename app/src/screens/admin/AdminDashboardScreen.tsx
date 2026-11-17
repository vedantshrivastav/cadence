import { Placeholder } from '@/components/Placeholder';
import { Screen } from '@/components/Screen';

/** Only visible to users with role "admin". */
export function AdminDashboardScreen() {
  return (
    <Screen>
      <Placeholder
        title="To build"
        items={[
          'Stats: students, active subs, expiring soon, revenue (adminService.dashboard)',
          'Batches: create/edit timings + Google Meet links',
          'Existing students: add / bulk import (auto-access on phone match)',
          'Students list + manual grant / assign batch',
          'Payments list',
          'Post announcement',
        ]}
      />
    </Screen>
  );
}
