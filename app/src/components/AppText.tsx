import { Text, type TextProps } from 'react-native';

import { colors, type as typeScale, type Colors } from '@/theme';

type Variant = keyof typeof typeScale;

interface Props extends TextProps {
  variant?: Variant;
  color?: keyof Colors;
}

export function AppText({ variant = 'body', color = 'text', style, ...rest }: Props) {
  return <Text style={[typeScale[variant], { color: colors[color] }, style]} {...rest} />;
}
