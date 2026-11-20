import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, motion, radius, shadow, spacing } from '@/theme';

/** Small pill at the bottom of the screen. Render inside `Screen`'s `footer` so it floats over content. */
export function Toast({ message }: { message: string | null }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: message ? 1 : 0, duration: motion.base, useNativeDriver: true }).start();
    if (message) AccessibilityInfo.announceForAccessibility(message);
  }, [message, anim]);

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[
        styles.toast,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [motion.riseDistance, 0] }) }],
        },
      ]}>
      {message ? <AppText style={styles.text}>{message}</AppText> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.toast,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadow.float,
  },
  text: { fontWeight: '600' },
});
