import { Image, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { spacing, useColors } from '@/theme';
import type { User } from '@/types/api';
import { capitalize } from '@/utils/text';

const AVATAR = 64;

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1]![0] : '')).toUpperCase() || '?';
}

export function ProfileHeader({ user, onEdit }: { user: User; onEdit: () => void }) {
  const colors = useColors();
  return (
    <Card>
      <View style={styles.row}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} accessibilityIgnoresInvertColors />
        ) : (
          <View style={[styles.avatar, styles.initials, { backgroundColor: colors.primary }]}>
            <AppText variant="heading" color="onPrimary">
              {initials(user.name)}
            </AppText>
          </View>
        )}
        <View style={styles.flex}>
          <AppText variant="heading" numberOfLines={1}>
            {user.name}
          </AppText>
          <AppText color="textSecondary" numberOfLines={1}>
            {user.email}
          </AppText>
          <AppText color="textSecondary">
            {user.phone ? `+91 ${user.phone}` : 'Phone not added'}
            {user.phoneVerified && <AppText color="success"> ✓ Verified</AppText>}
          </AppText>
        </View>
      </View>

      <View style={styles.tags}>
        {user.role === 'admin' && <Badge label="ADMIN" color={colors.primary} textColor={colors.onPrimary} />}
        {user.instruments.map(i => (
          <Badge key={i} label={capitalize(i).toUpperCase()} color={colors.border} textColor={colors.text} />
        ))}
      </View>

      <Button title="Edit profile" variant="secondary" onPress={onEdit} />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2 },
  initials: { alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
