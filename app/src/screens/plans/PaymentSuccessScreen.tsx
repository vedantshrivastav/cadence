import { useNavigation } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import type { PlansScreenProps } from '@/navigation/types';
import { spacing } from '@/theme';
import { capitalize } from '@/utils/text';
import { formatDate } from '@/utils/time';

export function PaymentSuccessScreen({ route, navigation }: PlansScreenProps<'PaymentSuccess'>) {
  const rootNavigation = useNavigation();
  const { instrument, planName, endsAt, batchTitle } = route.params;

  const goHome = () => {
    navigation.popToTop(); // so the Plans tab opens on the plan list next time
    rootNavigation.navigate('Main', { screen: 'HomeTab', params: { screen: 'Home' } });
  };

  return (
    <Screen scroll={false} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.body}>
        <AppText style={styles.icon}>🎉</AppText>
        <AppText variant="title" style={styles.textCenter}>
          You're in!
        </AppText>
        <AppText color="textSecondary" style={styles.textCenter}>
          Your {capitalize(instrument)} subscription is active. Your class link will appear on Home before each class.
        </AppText>

        <Card style={styles.summary}>
          <Row label="Instrument" value={capitalize(instrument)} />
          <Row label="Plan" value={planName} />
          {batchTitle && <Row label="Batch" value={batchTitle} />}
          {endsAt && <Row label="Valid until" value={formatDate(new Date(endsAt))} />}
        </Card>
      </View>

      <Button title="Go to Home" onPress={goHome} />
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText color="textSecondary">{label}</AppText>
      <AppText style={styles.bold}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  icon: { fontSize: 56, lineHeight: 68 },
  textCenter: { textAlign: 'center' },
  summary: { alignSelf: 'stretch' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  bold: { fontWeight: '500', flexShrink: 1, textAlign: 'right' },
});
