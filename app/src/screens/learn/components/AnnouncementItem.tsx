import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { spacing, useColors } from '@/theme';
import type { Announcement } from '@/types/api';
import { capitalize } from '@/utils/text';
import { formatDate } from '@/utils/time';

const COLLAPSED_LINES = 4;

/** One notice from the academy. Long messages expand on tap. */
export function AnnouncementItem({ item }: { item: Announcement }) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);

  return (
    <Pressable
      disabled={!truncated && !expanded}
      onPress={() => setExpanded(e => !e)}
      accessibilityRole="button"
      accessibilityHint={expanded ? 'Collapse' : 'Read the full message'}>
      <Card style={item.isPinned && [styles.pinned, { borderColor: colors.primary }]}>
        <View style={styles.tags}>
          {item.isPinned && <Badge label="📌 PINNED" color={colors.primary} textColor={colors.onPrimary} />}
          {item.instruments.map(i => (
            <Badge key={i} label={capitalize(i)} color={colors.border} textColor={colors.text} />
          ))}
        </View>
        <AppText style={styles.title}>{item.title}</AppText>
        <AppText
          color="textSecondary"
          numberOfLines={expanded ? undefined : COLLAPSED_LINES}
          onTextLayout={e => {
            if (!expanded) setTruncated(e.nativeEvent.lines.length >= COLLAPSED_LINES);
          }}>
          {item.body}
        </AppText>
        <View style={styles.footer}>
          <AppText variant="caption" color="textSecondary">
            {formatDate(new Date(item.createdAt))}
          </AppText>
          {(truncated || expanded) && (
            <AppText variant="caption" color="primary" style={styles.title}>
              {expanded ? 'Show less' : 'Read more'}
            </AppText>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pinned: { borderWidth: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  title: { fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
});
