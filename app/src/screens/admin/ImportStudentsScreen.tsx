import { useMemo, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import type { AdminScreenProps } from '@/navigation/types';
import { adminService } from '@/services/admin';
import { fontSize, radius, spacing, useColors } from '@/theme';

import { parseStudentList } from './importParser';

const EXAMPLE = `name, phone, instrument, classes per week, paid until, email
Asha Patil, 9876543210, piano, 2, 31/12/2026
Rohan Mehta, +91 91234 56789, drums, 4, 2026-11-30, rohan@gmail.com`;

export function ImportStudentsScreen({ navigation }: AdminScreenProps<'ImportStudents'>) {
  const colors = useColors();
  const [text, setText] = useState('');
  const [importing, setImporting] = useState(false);

  const rows = useMemo(() => parseStudentList(text), [text]);
  const valid = rows.flatMap(r => (r.student ? [r.student] : []));
  const invalid = rows.filter(r => r.error);

  const runImport = async () => {
    if (valid.length === 0) return;
    setImporting(true);
    try {
      const res = await adminService.importExistingStudents(valid);
      Alert.alert(
        'Imported',
        `${res.imported} student(s) saved. ${res.linkedToExistingAccounts} already had accounts and got access right away.`,
      );
      navigation.goBack();
    } catch (e) {
      Alert.alert('Import failed', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Screen>
      <Card>
        <AppText style={styles.bold}>Paste your fee list</AppText>
        <AppText color="textSecondary">
          Copy rows from Excel / Google Sheets (or type them), one student per line in this order:
        </AppText>
        <AppText variant="caption" style={styles.mono}>
          {EXAMPLE}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          Same phone + instrument again just updates the record, so re-importing is safe.
        </AppText>
      </Card>

      <TextInput
        style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
        value={text}
        onChangeText={setText}
        multiline
        placeholder="Paste here…"
        placeholderTextColor={colors.textSecondary}
        autoCorrect={false}
        autoCapitalize="none"
        textAlignVertical="top"
      />

      {rows.length > 0 && (
        <Card>
          <AppText style={styles.bold}>
            {valid.length} ready to import{invalid.length > 0 ? ` · ${invalid.length} with problems` : ''}
          </AppText>
          {invalid.slice(0, 20).map(r => (
            <AppText key={r.line} variant="caption" color="danger">
              Line {r.line}: {r.error}
            </AppText>
          ))}
          {invalid.length > 0 && (
            <AppText variant="caption" color="textSecondary">
              Lines with problems are skipped. Fix them and import again any time.
            </AppText>
          )}
        </Card>
      )}

      <View>
        <Button
          title={valid.length ? `Import ${valid.length} student${valid.length === 1 ? '' : 's'}` : 'Import'}
          onPress={runImport}
          disabled={valid.length === 0 || valid.length > 1000}
          loading={importing}
        />
        {valid.length > 1000 && <AppText color="danger">Max 1000 per import — split the list.</AppText>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bold: { fontWeight: '600' },
  mono: { fontFamily: 'monospace' },
  input: {
    minHeight: 180,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    fontSize: fontSize.sm,
    fontFamily: 'monospace',
  },
});
