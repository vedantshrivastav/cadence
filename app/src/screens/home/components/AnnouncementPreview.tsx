import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { motion } from '@/theme';
import type { Announcement } from '@/types/api';
import { formatDate } from '@/utils/time';

/** Latest notice: title, two lines, date. The "See all" link lives in the section header. */
export function AnnouncementPreview({ item, onPress }: { item: Announcement; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => pressed && styles.pressed}>
      <Card variant="quiet">
        <AppText variant="bodyMedium" numberOfLines={1}>
          {item.title}
        </AppText>
        <AppText color="textSecondary" numberOfLines={2}>
          {item.body}
        </AppText>
        <AppText variant="caption" color="muted">
          {formatDate(new Date(item.createdAt))}
        </AppText>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: motion.pressedOpacity },
});
