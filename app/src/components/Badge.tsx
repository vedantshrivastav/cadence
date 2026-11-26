import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, radius, spacing } from '@/theme';

interface Props {
  label: string;
  /** Background colour; text is `onPrimary` (navy) unless `textColor` is given. */
  color: string;
  textColor?: string;
  /** Shows a small dot before the label (used for LIVE). */
  dot?: boolean;
}

export function Badge({ label, color, textColor = colors.onPrimary, dot }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      {dot && <View style={[styles.dot, { backgroundColor: textColor }]} />}
      <AppText variant="caption" style={[styles.text, { color: textColor }]}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontWeight: '500' },
});
