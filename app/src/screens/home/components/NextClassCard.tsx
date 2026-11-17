import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useColors } from '@/theme';
import type { MyClass } from '@/types/api';
import { formatClassStart, formatCountdown, JOIN_OPENS_BEFORE_MS, MS } from '@/utils/time';
import { capitalize } from '@/utils/text';

interface Props {
  cls: MyClass;
  now: Date;
  joining: boolean;
  onJoin: () => void;
}

/** Hero card: the student's very next class, with countdown, LIVE badge and Join button. */
export function NextClassCard({ cls, now, joining, onJoin }: Props) {
  const colors = useColors();

  if (!cls.nextClassAt) return null;
  const start = new Date(cls.nextClassAt);
  const end = new Date(start.getTime() + (cls.durationMinutes ?? 60) * MS.MINUTE);
  const isLive = now >= start && now < end;
  const msToStart = start.getTime() - now.getTime();
  const canJoin = isLive || msToStart <= JOIN_OPENS_BEFORE_MS;

  return (
    <Card tone="primary">
      <View style={styles.topRow}>
        {isLive ? (
          <Badge label="LIVE NOW" color={colors.danger} dot />
        ) : (
          <AppText variant="caption" color="onPrimary" style={styles.eyebrow}>
            NEXT CLASS
          </AppText>
        )}
        {!isLive && (
          <AppText variant="caption" color="onPrimary" style={styles.countdown}>
            {formatCountdown(msToStart)}
          </AppText>
        )}
      </View>

      <AppText variant="heading" color="onPrimary">
        {cls.title}
      </AppText>
      <AppText color="onPrimary" style={styles.muted}>
        {capitalize(cls.instrument)}
        {cls.teacherName ? ` · ${cls.teacherName}` : ''} · {cls.durationMinutes ?? 60} min
      </AppText>
      <AppText color="onPrimary" style={styles.time}>
        {formatClassStart(start, now)}
      </AppText>

      <Button
        title={isLive ? 'Join class now' : 'Join on Google Meet'}
        variant="inverse"
        onPress={onJoin}
        loading={joining}
        disabled={!canJoin}
      />
      {!canJoin && (
        <AppText variant="caption" color="onPrimary" style={[styles.muted, styles.center]}>
          Join opens 10 minutes before class
        </AppText>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontWeight: '700', letterSpacing: 1, opacity: 0.85 },
  countdown: { fontWeight: '600' },
  muted: { opacity: 0.85 },
  time: { fontWeight: '600', marginBottom: 4 },
  center: { textAlign: 'center' },
});
