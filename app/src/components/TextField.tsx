import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/AppText';
import { fontSize, radius, spacing, useColors } from '@/theme';

interface Props extends TextInputProps {
  label: string;
  error?: string | null;
}

/** Labelled text input with an optional error message. */
export function TextField({ label, error, style, ...rest }: Props) {
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      <AppText variant="caption" color="textSecondary" style={styles.label}>
        {label}
      </AppText>
      <TextInput
        placeholderTextColor={colors.textSecondary}
        style={[
          styles.input,
          { color: colors.text, backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <AppText variant="caption" color="danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { fontWeight: '600' },
  input: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    fontSize: fontSize.md,
  },
});
