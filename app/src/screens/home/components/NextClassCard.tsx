import Clipboard from '@react-native-clipboard/clipboard';
import { Check, Copy } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import HapticFeedback from 'react-native-haptic-feedback';

import { AppText } from '@/components/AppText';
import { MeetLogo } from '@/components/MeetLogo';
import { Card, Stave } from '@/components/Card';
import {
  colors,
  instrumentColors,
  motion,
  radius,
  size,
  spacing,
} from '@/theme';
import type { MyClass } from '@/types/api';
import {
  formatClassStart,
  formatHHmm,
  JOIN_OPENS_BEFORE_MS,
  MS,
} from '@/utils/time';

/** "in 2 days" from 24h on; "in 5h 20m" / "in 20m" below that. */
function countdown(ms: number): string {
  if (ms <= MS.MINUTE) return 'in less than a minute';
  const days = Math.floor(ms / MS.DAY);
  if (days > 0) return `in ${days} ${days === 1 ? 'day' : 'days'}`;
  const h = Math.floor(ms / MS.HOUR);
  const m = Math.floor((ms % MS.HOUR) / MS.MINUTE);
  return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
}

interface Props {
  cls: MyClass;
  now: Date;
  joining: boolean;
  onJoin: () => void;
  /** Called after the Meet link is copied (Home shows the toast). */
  onCopied: () => void;
}

/**
 * The next class. The start time is the one big figure, written on the stave with the
 * instrument as its note head. The off-white Join button is the brightest thing on Home.
 */
export function NextClassCard({ cls, now, joining, onJoin, onCopied }: Props) {
  const start = cls.nextClassAt ? new Date(cls.nextClassAt) : null;
  const end = start
    ? new Date(start.getTime() + (cls.durationMinutes ?? 60) * MS.MINUTE)
    : null;
  const isLive = !!start && !!end && now >= start && now < end;
  const msToStart = start ? start.getTime() - now.getTime() : Infinity;
  // const canJoin = isLive || msToStart <= JOIN_OPENS_BEFORE_MS;
  const canJoin = true;

  // ----- Entrance: one fade + rise -----
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: motion.slow,
      easing: motion.easing,
      useNativeDriver: true,
    }).start();
  }, [enter]);

  // ----- Copy link -----
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), motion.feedbackMs);
    return () => clearTimeout(t);
  }, [copied]);
  const copyLink = () => {
    Clipboard.setString(cls.meetLink);
    HapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
    setCopied(true);
    onCopied();
  };

  if (!start || !end) return null;
  const [day, time] = formatClassStart(start, now).split(' · ');
  const endTime = formatClassStart(end, now).split(' · ')[1];
  const opensAtIst = new Date(
    start.getTime() - JOIN_OPENS_BEFORE_MS + 330 * MS.MINUTE,
  )
    .toISOString()
    .slice(11, 16);
  const CopyIcon = copied ? Check : Copy;

  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [
          {
            translateY: enter.interpolate({
              inputRange: [0, 1],
              outputRange: [motion.riseDistance, 0],
            }),
          },
        ],
      }}
    >
      <Card variant="feature">
        <View>
          {/* When, relative to now */}
          <View style={styles.meta}>
            {isLive ? <View style={styles.liveDot} /> : null}
            <AppText
              variant="label"
              color="text"
              style={styles.metaText}
              numberOfLines={1}
            >
              {isLive
                ? `Live now · ends ${endTime}`
                : `${day} · ${countdown(msToStart)}`}
            </AppText>
          </View>

          {/* The start time on the stave */}
          <View style={styles.timeRow}>
            <AppText variant="heroTime">{time}</AppText>
            <Stave noteColor={instrumentColors[cls.instrument]} />
          </View>

          <AppText variant="bodyMedium" numberOfLines={1}>
            {cls.title}
            {cls.teacherName ? (
              <AppText variant="body" color="textSecondary">
                {` with ${cls.teacherName}`}
              </AppText>
            ) : null}
          </AppText>
        </View>

        <View style={styles.actions}>
          {canJoin ? (
            <Pressable
              onPress={onJoin}
              disabled={joining}
              accessibilityRole="button"
              accessibilityLabel="Join on Google Meet"
              accessibilityState={{ busy: joining }}
              style={({ pressed }) => [
                styles.control,
                styles.join,
                pressed && styles.pressed,
              ]}
            >
              {joining ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <>
                  <MeetLogo size={size.icon} color={colors.onPrimary} />
                  <AppText variant="bodyMedium" color="onPrimary">
                    Join on Google Meet
                  </AppText>
                </>
              )}
            </Pressable>
          ) : (
            <View
              accessible
              accessibilityRole="button"
              accessibilityState={{ disabled: true }}
              style={[styles.control, styles.join, styles.joinDisabled]}
            >
              <AppText variant="bodyMedium" color="muted">
                {`Join opens at ${formatHHmm(opensAtIst)}`}
              </AppText>
            </View>
          )}
          <Pressable
            onPress={copyLink}
            accessibilityRole="button"
            accessibilityLabel={
              copied ? 'Meet link copied' : 'Copy Google Meet link'
            }
            hitSlop={spacing.xs}
            style={({ pressed }) => [
              styles.control,
              styles.copy,
              pressed && styles.pressed,
            ]}
          >
            <CopyIcon
              color={copied ? colors.text : colors.muted}
              size={size.icon}
              strokeWidth={1.75}
            />
          </Pressable>
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metaText: { flexShrink: 1 },
  liveDot: {
    width: size.dot,
    height: size.dot,
    borderRadius: size.dot / 2,
    backgroundColor: colors.primary,
  },
  // meta → time 8, time → class name 4.
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
  control: {
    height: size.controlFeature,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  join: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
  },
  // Quiet secondary controls on the raised card: no fill, a 1px slate outline.
  joinDisabled: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  copy: {
    width: size.controlFeature,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  pressed: { transform: [{ scale: motion.pressScale }] },
});
