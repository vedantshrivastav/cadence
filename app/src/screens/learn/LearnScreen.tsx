import { Placeholder } from '@/components/Placeholder';
import { Screen } from '@/components/Screen';

export function LearnScreen() {
  return (
    <Screen>
      <Placeholder
        title="To build"
        items={[
          'Announcements feed, pinned first (contentService.announcements)',
          'Practice material: PDFs, videos, class recordings (contentService.resources)',
        ]}
      />
    </Screen>
  );
}
