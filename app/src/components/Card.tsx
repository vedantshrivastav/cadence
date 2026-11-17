import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, spacing, useColors } from '@/theme';

interface Props extends PropsWithChildren {
  /** "primary" = filled brand colour (hero cards), "surface" = neutral (default). */
  tone?: 'surface' | 'primary';
  style?: StyleProp<ViewStyle>;
}

export function Card({ tone = 'surface', style, children }: Props) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        tone === 'primary'
          ? { backgroundColor: colors.primary }
          : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
});
