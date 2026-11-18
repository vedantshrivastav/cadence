import { Alert, Linking, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { config } from '@/config';
import { spacing } from '@/theme';
import type { User } from '@/types/api';

async function open(url: string, fallback: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Could not open', fallback);
  }
}

/** Quick ways to reach the academy, with the student's details pre-filled on WhatsApp. */
export function HelpCard({ user }: { user: User }) {
  const { phone, email, name } = config.academy;
  const message = encodeURIComponent(`Hi ${name}, this is ${user.name} (${user.email}). I need help with: `);

  return (
    <Card>
      <AppText color="textSecondary">
        Questions about classes, timings or payments? We usually reply within a few hours.
      </AppText>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Button
            title="WhatsApp"
            onPress={() => open(`https://wa.me/${phone}?text=${message}`, 'WhatsApp is not installed.')}
          />
        </View>
        <View style={styles.flex}>
          <Button title="Call" variant="secondary" onPress={() => open(`tel:+${phone}`, `Call +${phone}`)} />
        </View>
      </View>
      <Button
        title={`Email ${email}`}
        variant="secondary"
        onPress={() => open(`mailto:${email}`, `Write to ${email}`)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
