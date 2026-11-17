import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useColors } from '@/theme';

/** Shown while the saved login is being restored on app start. */
export function LoadingScreen() {
  const colors = useColors();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
