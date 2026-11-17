import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { spacing } from '@/theme';
import type { Announcement } from '@/types/api';
import { formatDate } from '@/utils/time';

/** Latest notice from the academy; tapping opens the Learn tab with the full list. */
export function AnnouncementPreview({ item, onPress }: { item: Announcement; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => pressed && styles.pressed}>
      <Card>
        <View style={styles.row}>
          <AppText style={styles.title}>
            {item.isPinned ? '📌 ' : ''}
            {item.title}
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {formatDate(new Date(item.createdAt))}
          </AppText>
        </View>
        <AppText color="textSecondary" numberOfLines={3}>
          {item.body}
        </AppText>
        <AppText variant="caption" color="primary" style={styles.title}>
          See all updates →
        </AppText>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  title: { fontWeight: '600', flexShrink: 1 },
  pressed: { opacity: 0.7 },
});
