import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { radius, spacing, useColors } from '@/theme';
import type { Resource } from '@/types/api';
import { capitalize } from '@/utils/text';
import { formatDate } from '@/utils/time';

export const RESOURCE_TYPES: Record<Resource['type'], { icon: string; label: string; plural: string }> = {
  pdf: { icon: '📄', label: 'Sheet / PDF', plural: 'Sheets' },
  video: { icon: '▶️', label: 'Video', plural: 'Videos' },
  audio: { icon: '🎧', label: 'Audio', plural: 'Audio' },
  recording: { icon: '🎬', label: 'Class recording', plural: 'Recordings' },
  link: { icon: '🔗', label: 'Link', plural: 'Links' },
};

/** A practice item; tapping opens it (Drive, YouTube, PDF viewer…). */
export function ResourceItem({ item, onOpen }: { item: Resource; onOpen: () => void }) {
  const colors = useColors();
  const type = RESOURCE_TYPES[item.type];

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="link"
      accessibilityLabel={`${type.label}: ${item.title}`}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.icon, { backgroundColor: colors.background }]}>
        <AppText style={styles.iconText}>{type.icon}</AppText>
      </View>
      <View style={styles.flex}>
        <AppText style={styles.title} numberOfLines={2}>
          {item.title}
        </AppText>
        {item.description ? (
          <AppText variant="caption" color="textSecondary" numberOfLines={2}>
            {item.description}
          </AppText>
        ) : null}
        <AppText variant="caption" color="textSecondary">
          {type.label} · {capitalize(item.instrument)} · {formatDate(new Date(item.createdAt))}
        </AppText>
      </View>
      <AppText color="primary" style={styles.title}>
        Open
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  icon: { width: 44, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 22, lineHeight: 28 },
  flex: { flex: 1, gap: 2 },
  title: { fontWeight: '600' },
  pressed: { opacity: 0.7 },
});
