import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { spacing } from '@/theme';

/** A titled group of cards: small sentence-case title, optional text action on the right. */
export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: { label: string; onPress: () => void };
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText variant="label" color="textSecondary" style={styles.flex}>
          {title}
        </AppText>
        {action && (
          <Pressable onPress={action.onPress} hitSlop={spacing.sm} accessibilityRole="button">
            <AppText variant="label" color="primary">
              {action.label}
            </AppText>
          </Pressable>
        )}
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sectionHeader },
  body: { gap: spacing.cardGap },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
});
