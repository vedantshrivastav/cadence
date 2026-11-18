import type { PropsWithChildren, ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { spacing, useColors } from '@/theme';

interface Props extends PropsWithChildren {
  /** Scrollable content (default true). */
  scroll?: boolean;
  /** Screens under a navigator header only need bottom/side insets. */
  edges?: Edge[];
  /** Enables pull-to-refresh (scrollable screens only). */
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Pinned below the scrolling content, e.g. a checkout bar. */
  footer?: ReactNode;
}

/** Standard page wrapper: safe area + background + padding. */
export function Screen({
  children,
  scroll = true,
  edges = ['left', 'right'],
  onRefresh,
  refreshing = false,
  footer,
}: Props) {
  const colors = useColors();
  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: colors.background }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
            ) : undefined
          }>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.content]}>{children}</View>
      )}
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md },
});
