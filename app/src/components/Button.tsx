import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

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
}

const VARIANTS: Record<Variant, { bg: keyof Colors; fg: keyof Colors }> = {
  primary: { bg: 'primary', fg: 'onPrimary' },
  secondary: { bg: 'surface', fg: 'text' },
  inverse: { bg: 'onPrimary', fg: 'primary' },
};

export function Button({ title, onPress, variant = 'primary', loading, disabled }: Props) {
  const colors = useColors();
  const { bg, fg } = VARIANTS[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [styles.base, { backgroundColor: colors[bg] }, (pressed || inactive) && styles.dim]}>
      {loading ? (
        <ActivityIndicator color={colors[fg]} />
      ) : (
        <AppText style={styles.label} color={fg}>
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
  label: { fontWeight: '600' },
  dim: { opacity: 0.6 },
});
