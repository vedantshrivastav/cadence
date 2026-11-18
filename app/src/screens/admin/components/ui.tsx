/** Small building blocks shared by the admin screens. */
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { radius, spacing, useColors } from '@/theme';
import type { ClassesPerWeek, Instrument } from '@/types/api';

export const INSTRUMENT_OPTIONS: { value: Instrument; label: string }[] = [
  { value: 'violin', label: 'Violin' },
  { value: 'piano', label: 'Piano' },
  { value: 'drums', label: 'Drums' },
];

export const CPW_OPTIONS: { value: ClassesPerWeek; label: string }[] = [
  { value: 2, label: '2× / week' },
  { value: 4, label: '4× / week' },
];

/** Single-choice chip row. */
export function OptionChips<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.field}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <View style={styles.chips}>
        {options.map(o => (
          <Chip key={String(o.value)} label={o.label} selected={value === o.value} onPress={() => onChange(o.value)} />
        ))}
      </View>
    </View>
  );
}

/** Multi-choice chip row. */
export function MultiChips<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  options: { value: T; label: string }[];
  value: T[];
  onChange: (v: T[]) => void;
}) {
  return (
    <View style={styles.field}>
      <FieldLabel>{label}</FieldLabel>
      <View style={styles.chips}>
        {options.map(o => (
          <Chip
            key={o.value}
            label={o.label}
            selected={value.includes(o.value)}
            onPress={() => onChange(value.includes(o.value) ? value.filter(v => v !== o.value) : [...value, o.value])}
          />
        ))}
      </View>
      {hint && (
        <AppText variant="caption" color="textSecondary">
          {hint}
        </AppText>
      )}
    </View>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <AppText variant="caption" color="textSecondary" style={styles.bold}>
      {children}
    </AppText>
  );
}

export function SwitchRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.switchRow}>
      <View style={styles.flex}>
        <AppText style={styles.bold}>{label}</AppText>
        {hint && (
          <AppText variant="caption" color="textSecondary">
            {hint}
          </AppText>
        )}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} />
    </View>
  );
}

/** Tappable list row with a title, subtitle lines and optional right-hand content. */
export function ListRow({
  title,
  subtitle,
  right,
  onPress,
  dimmed,
}: {
  title: string;
  subtitle?: (string | null | undefined | false)[];
  right?: ReactNode;
  onPress?: () => void;
  dimmed?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.surface, borderColor: colors.border },
        (pressed || dimmed) && styles.dim,
      ]}>
      <View style={styles.flexGap}>
        <AppText style={styles.bold} numberOfLines={1}>
          {title}
        </AppText>
        {subtitle?.filter(Boolean).map((line, i) => (
          <AppText key={i} variant="caption" color="textSecondary" numberOfLines={2}>
            {line}
          </AppText>
        ))}
      </View>
      {right}
      {onPress && <AppText color="textSecondary">›</AppText>}
    </Pressable>
  );
}

/** Standard loading / error / empty wrapper for admin lists. */
export function ListState({
  loading,
  error,
  empty,
  emptyText,
  onRetry,
  children,
}: {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyText: string;
  onRetry: () => void;
  children: ReactNode;
}) {
  const colors = useColors();
  if (loading) return <ActivityIndicator style={styles.spinner} size="large" color={colors.primary} />;
  if (error && empty) {
    return (
      <Card>
        <AppText color="danger">{error}</AppText>
        <Button title="Try again" variant="secondary" onPress={onRetry} />
      </Card>
    );
  }
  if (empty) {
    return (
      <AppText color="textSecondary" style={styles.emptyText}>
        {emptyText}
      </AppText>
    );
  }
  return <View style={styles.list}>{children}</View>;
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  bold: { fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
  flexGap: { flex: 1, gap: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dim: { opacity: 0.6 },
  spinner: { marginTop: spacing.xl },
  emptyText: { textAlign: 'center', paddingVertical: spacing.xl },
  list: { gap: spacing.sm },
});
