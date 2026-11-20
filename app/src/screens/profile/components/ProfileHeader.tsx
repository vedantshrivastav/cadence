import { BadgeCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors, instrumentColors, size, spacing } from '@/theme';
import type { User } from '@/types/api';
import { capitalize } from '@/utils/text';

const AVATAR = 64;

export function ProfileHeader({ user, onEdit }: { user: User; onEdit: () => void }) {
  return (
    <Card>
      <View style={styles.row}>
        <Avatar name={user.name} url={user.avatarUrl} size={AVATAR} />
        <View style={styles.flex}>
          <AppText variant="heading" numberOfLines={1}>
            {user.name}
            {user.role === 'admin' ? (
              <AppText variant="label" color="primary">
                {'  Admin'}
              </AppText>
            ) : null}
          </AppText>
          <AppText color="textSecondary" numberOfLines={1}>
            {user.email}
          </AppText>
          <View style={styles.line}>
            <AppText variant="figure" color="textSecondary">
              {user.phone ? `+91 ${user.phone}` : 'Phone not added'}
            </AppText>
            {user.phoneVerified && (
              <BadgeCheck
                color={colors.success}
                size={size.iconSmall}
                strokeWidth={1.75}
                accessibilityLabel="Verified"
              />
            )}
          </View>
        </View>
      </View>

      {user.instruments.length > 0 && (
        <View style={styles.instruments}>
          {user.instruments.map(i => (
            <View key={i} style={styles.line}>
              <View style={[styles.dot, { backgroundColor: instrumentColors[i] }]} />
              <AppText variant="label" color="textSecondary">
                {capitalize(i)}
              </AppText>
            </View>
          ))}
        </View>
      )}

      <Button title="Edit profile" variant="secondary" onPress={onEdit} />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
  line: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  // Instruments line up under the name column.
  instruments: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.md, rowGap: spacing.xs, marginLeft: AVATAR + spacing.md },
  dot: { width: size.dot, height: size.dot, borderRadius: size.dot / 2 },
});
