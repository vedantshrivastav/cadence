import { Image, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, fonts } from '@/theme';

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1]![0] : '')).toUpperCase() || '?';
}

interface Props {
  name: string;
  url?: string | null;
  size?: number;
  onPress?: () => void;
}

/** Profile photo, or initials on a raised circle. */
export function Avatar({ name, url, size = 44, onPress }: Props) {
  const shape = { width: size, height: size, borderRadius: size / 2 };
  const content = url ? (
    <Image source={{ uri: url }} style={[shape, styles.ring]} accessibilityIgnoresInvertColors />
  ) : (
    <View style={[shape, styles.ring, styles.initials]}>
      <AppText style={[styles.text, { fontSize: size * 0.38, lineHeight: size * 0.5 }]} color="primary">
        {initials(name)}
      </AppText>
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Open profile" hitSlop={8}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ring: { borderWidth: 1, borderColor: colors.borderStrong },
  initials: { backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.display, fontWeight: '600' },
});
