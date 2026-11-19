import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { spacing, useColors } from '@/theme';
import type { User } from '@/types/api';
import { capitalize } from '@/utils/text';

export function ProfileHeader({
  user,
  onEdit,
}: {
  user: User;
  onEdit: () => void;
}) {
  const colors = useColors();
  return (
    <Card>
      <View style={styles.row}>
        <Avatar name={user.name} url={user.avatarUrl} size={64} />
        <View style={styles.flex}>
          <AppText variant="heading" numberOfLines={1}>
            {user.name}
          </AppText>
          <AppText color="textSecondary" numberOfLines={1}>
            {user.email}
          </AppText>
          <AppText color="textSecondary">
            {user.phone ? `+91 ${user.phone}` : 'Phone not added'}
            {user.phoneVerified && (
              <AppText color="success"> ✓ Verified</AppText>
            )}
          </AppText>
        </View>
      </View>

      <View style={styles.tags}>
        {user.role === 'admin' && (
          <Badge
            label="ADMIN"
            color={colors.primary}
            textColor={colors.onPrimary}
          />
        )}
        {user.instruments.map(i => (
          <Badge
            key={i}
            label={capitalize(i).toUpperCase()}
            color={colors.border}
            textColor={colors.text}
          />
        ))}
      </View>

      <Button title="Edit profile" variant="secondary" onPress={onEdit} />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, gap: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
