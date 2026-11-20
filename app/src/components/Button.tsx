import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { radius, spacing, useColors, type Colors } from '@/theme';

type Variant = 'primary' | 'secondary' | 'inverse';

interface Props {
  title: string;
  onPress: () => void;
  /** primary = brand fill · secondary = neutral · inverse = for use on a primary-coloured card */
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  /** Layout overrides for the button box (e.g. flex: 1 in a row). */
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const VARIANTS: Record<Variant, { bg: keyof Colors; fg: keyof Colors }> = {
  primary: { bg: 'primary', fg: 'onPrimary' },
  secondary: { bg: 'surface', fg: 'text' },
  inverse: { bg: 'onPrimary', fg: 'primary' },
};

export function Button({ title, onPress, variant = 'primary', loading, disabled, style, accessibilityLabel }: Props) {
  const colors = useColors();
  const { bg, fg } = VARIANTS[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [styles.base, { backgroundColor: colors[bg] }, style, (pressed || inactive) && styles.dim]}>
      {loading ? (
        <ActivityIndicator color={colors[fg]} />
      ) : (
        <AppText variant="bodyMedium" color={fg}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dim: { opacity: 0.6 },
});
