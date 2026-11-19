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
import { Card } from '@/components/Card';
import {
  colors,
  fonts,
  fontSize,
  motion,
  radius,
  size,
  spacing,
  type as typeScale,
} from '@/theme';
import type { MyClass } from '@/types/api';
import {
  formatClassStart,
  formatHHmm,
  JOIN_OPENS_BEFORE_MS,
  MS,
} from '@/utils/time';

/** Disabled Join on the accent: faint ink wash, ink label at ~65% (readable, clearly inactive). */
const JOIN_DISABLED_BG = 'rgba(28,24,21,0.14)';
const JOIN_DISABLED_TEXT_OPACITY = 0.65;

/** Hero padding is 24 in Card; this card wants 20, so its content pulls out by the difference. */
const PADDING_TRIM = 20 - 24;

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

/** Hero: the next class. The start time is the one big number. */
export function NextClassCard({ cls, now, joining, onJoin, onCopied }: Props) {
  const start = cls.nextClassAt ? new Date(cls.nextClassAt) : null;
  const end = start
    ? new Date(start.getTime() + (cls.durationMinutes ?? 60) * MS.MINUTE)
    : null;
  const isLive = !!start && !!end && now >= start && now < end;
  const msToStart = start ? start.getTime() - now.getTime() : Infinity;
  // const canJoin = isLive || msToStart <= JOIN_OPENS_BEFORE_MS;
  const canJoin = true;

  // ----- Entrance: fade + rise -----
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: motion.slow,
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
      <Card variant="hero" fill="flat">
        {/* One child so the card's own gap doesn't apply; all spacing is set here. */}
        <View style={styles.body}>
          <View>
            {/* When, relative to now */}
            <View style={styles.meta}>
              {isLive ? <View style={styles.liveDot} /> : null}
              <AppText
                variant="label"
                color="onPrimary"
                style={[styles.metaText, styles.dim]}
                numberOfLines={1}
              >
                {isLive
                  ? `Live now · ends ${endTime}`
                  : `${day} · ${countdown(msToStart)}`}
              </AppText>
            </View>

            {/* The start time is the one big number */}
            <AppText
              style={[typeScale.heroTime, styles.time]}
              color="onPrimary"
            >
              {time}
            </AppText>

            <AppText color="onPrimary" style={styles.title} numberOfLines={1}>
              {cls.title}
              {cls.teacherName ? (
                <AppText
                  color="onPrimary"
                  style={styles.dim}
                >{` with ${cls.teacherName}`}</AppText>
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
                  styles.join,
                  styles.joinActive,
                  pressed && styles.pressed,
                ]}
              >
                {joining ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <>
                    <MeetLogo size={20} />
                    <AppText color="primary" style={styles.joinText}>
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
                style={[styles.join, styles.joinDisabled]}
              >
                <AppText color="onPrimary" style={styles.joinDisabledText}>
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
              style={({ pressed }) => [styles.copy, pressed && styles.pressed]}
            >
              <CopyIcon
                color={colors.onPrimary}
                size={size.icon}
                strokeWidth={2}
              />
            </Pressable>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // 20px on all sides; text block → buttons 20.
  body: { margin: PADDING_TRIM, gap: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metaText: { fontVariant: ['tabular-nums'], flexShrink: 1 },
  liveDot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.xs,
    backgroundColor: colors.onPrimary,
  },
  // label → time 4; line-height ~1.05 so the display face adds no extra space.
  time: {
    marginTop: spacing.xs,
    lineHeight: Math.round(fontSize.hero * 1.05),
    includeFontPadding: false,
    fontVariant: ['tabular-nums'],
  },
  // time → class name 8.
  title: { marginTop: spacing.sm, fontFamily: fonts.bodyMedium },
  dim: { opacity: 0.75 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  join: { flex: 1, height: size.control, minHeight: size.control },
  // Ink fill with a 1px warm top highlight, echoing the card's own edge.
  joinActive: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.onPrimary,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,235,210,0.12)',
  },
  joinText: {
    fontFamily: fonts.bodyMedium,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  joinDisabled: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: JOIN_DISABLED_BG,
  },
  joinDisabledText: {
    fontWeight: '600',
    opacity: JOIN_DISABLED_TEXT_OPACITY,
  },
  copy: {
    width: size.iconButton,
    height: size.iconButton,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.onPrimarySubtle,
  },
  pressed: { opacity: 0.7 },
});
