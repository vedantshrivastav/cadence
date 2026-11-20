import { StyleSheet, View } from 'react-native';

import { colors, size } from '@/theme';

/** Single-choice indicator: hairline ring, accent ring + dot when selected. */
export function Radio({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.ring, selected && styles.ringOn]}>
      {selected ? <View style={styles.dot} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: size.radio,
    height: size.radio,
    borderRadius: size.radio / 2,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOn: { borderColor: colors.primary },
  dot: { width: size.radioDot, height: size.radioDot, borderRadius: size.radioDot / 2, backgroundColor: colors.primary },
});
