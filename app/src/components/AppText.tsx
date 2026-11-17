import { StyleSheet, Text, type TextProps } from 'react-native';

import { fontSize, useColors, type Colors } from '@/theme';

type Variant = 'title' | 'heading' | 'body' | 'caption';

interface Props extends TextProps {
  variant?: Variant;
  color?: keyof Colors;
}

export function AppText({ variant = 'body', color = 'text', style, ...rest }: Props) {
  const colors = useColors();
  return <Text style={[styles[variant], { color: colors[color] }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xl, fontWeight: '700' },
  heading: { fontSize: fontSize.lg, fontWeight: '600' },
  body: { fontSize: fontSize.md, lineHeight: 22 },
  caption: { fontSize: fontSize.sm, lineHeight: 18 },
});
