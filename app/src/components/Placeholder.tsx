import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { radius, spacing, useColors } from '@/theme';

/** Temporary block listing what a screen will contain. Delete once the screen is built. */
export function Placeholder({ title, items }: { title: string; items: string[] }) {
  const colors = useColors();
  return (
    <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <AppText variant="heading">{title}</AppText>
      {items.map(item => (
        <AppText key={item} color="textSecondary">
          • {item}
        </AppText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, gap: spacing.xs },
});
