import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import type { AdminScreenProps } from '@/navigation/types';
import { adminService, type BatchInput } from '@/services/admin';
import { radius, spacing, useColors } from '@/theme';
import type { Batch, ClassesPerWeek, Instrument, ScheduleSlot, Weekday } from '@/types/api';
import { shortDay, WEEKDAYS } from '@/utils/time';

import { CPW_OPTIONS, FieldLabel, INSTRUMENT_OPTIONS, OptionChips, SwitchRow } from './components/ui';

const LEVELS: { value: Batch['level']; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];
// Monday-first is easier to scan for a weekly timetable.
const DAYS: Weekday[] = [...WEEKDAYS.slice(1), WEEKDAYS[0]!];
const TIME_RX = /^([01]\d|2[0-3]):[0-5]\d$/;
const MEET_RX = /^https:\/\/meet\.google\.com\/[a-z0-9-]+/i;

export function BatchFormScreen({ route, navigation }: AdminScreenProps<'BatchForm'>) {
  const existing = route.params?.batch;
  const [title, setTitle] = useState(existing?.title ?? '');
  const [instrument, setInstrument] = useState<Instrument | null>(existing?.instrument ?? null);
  const [classesPerWeek, setClassesPerWeek] = useState<ClassesPerWeek | null>(existing?.classesPerWeek ?? null);
  const [level, setLevel] = useState<Batch['level']>(existing?.level ?? 'beginner');
  const [teacherName, setTeacherName] = useState(existing?.teacherName ?? '');
  const [duration, setDuration] = useState(String(existing?.durationMinutes ?? 60));
  const [meetLink, setMeetLink] = useState(existing?.meetLink ?? '');
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(existing?.schedule ?? [{ day: 'mon', startTime: '18:00' }]);
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const durationNum = Number(duration);
  const errors = {
    title: title.trim().length < 2 ? 'Enter a batch name' : null,
    instrument: !instrument ? 'Choose an instrument' : null,
    classesPerWeek: !classesPerWeek ? 'Choose 2 or 4 classes a week' : null,
    duration: !Number.isInteger(durationNum) || durationNum < 15 || durationNum > 240 ? '15–240 minutes' : null,
    meetLink: !MEET_RX.test(meetLink.trim()) ? 'Paste a link like https://meet.google.com/abc-defg-hij' : null,
    schedule:
      schedule.length === 0
        ? 'Add at least one class time'
        : schedule.some(s => !TIME_RX.test(s.startTime))
          ? 'Times must be HH:mm in 24-hour format, e.g. 18:30'
          : null,
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const err = (k: keyof typeof errors) => (showErrors ? errors[k] : null);

  const updateSlot = (i: number, patch: Partial<ScheduleSlot>) =>
    setSchedule(list => list.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const save = async () => {
    setShowErrors(true);
    if (hasErrors || !instrument || !classesPerWeek) return;
    if (schedule.length !== classesPerWeek) {
      const ok = await new Promise<boolean>(resolve =>
        Alert.alert(
          'Check the timetable',
          `This is a ${classesPerWeek}×/week batch but it has ${schedule.length} class time(s). Save anyway?`,
          [
            { text: 'Go back', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Save', onPress: () => resolve(true) },
          ],
        ),
      );
      if (!ok) return;
    }

    const body: BatchInput = {
      title: title.trim(),
      instrument,
      classesPerWeek,
      level,
      teacherName: teacherName.trim() || undefined,
      durationMinutes: durationNum,
      meetLink: meetLink.trim(),
      schedule,
      isActive,
    };
    setSaving(true);
    try {
      if (existing) await adminService.updateBatch(existing._id, body);
      else await adminService.createBatch(body);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <TextField label="Batch name" value={title} onChangeText={setTitle} placeholder="Piano Beginners (Evening)" error={err('title')} />
      <OptionChips label="Instrument" options={INSTRUMENT_OPTIONS} value={instrument} onChange={setInstrument} />
      {err('instrument') && <AppText color="danger">{err('instrument')}</AppText>}
      <OptionChips label="Plan" options={CPW_OPTIONS} value={classesPerWeek} onChange={setClassesPerWeek} />
      {err('classesPerWeek') && <AppText color="danger">{err('classesPerWeek')}</AppText>}
      <OptionChips label="Level" options={LEVELS} value={level} onChange={setLevel} />
      <TextField label="Teacher (optional)" value={teacherName} onChangeText={setTeacherName} placeholder="Ms. Sharma" />
      <TextField
        label="Class length (minutes)"
        value={duration}
        onChangeText={t => setDuration(t.replace(/\D/g, ''))}
        keyboardType="number-pad"
        error={err('duration')}
      />

      <View style={styles.field}>
        <TextField
          label="Google Meet link"
          value={meetLink}
          onChangeText={setMeetLink}
          placeholder="https://meet.google.com/abc-defg-hij"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          error={err('meetLink')}
        />
        <AppText variant="caption" color="textSecondary">
          Only subscribed students of this batch can see it, shortly before class.
        </AppText>
        {MEET_RX.test(meetLink.trim()) && (
          <Button title="Test link" variant="secondary" onPress={() => Linking.openURL(meetLink.trim())} />
        )}
      </View>

      {/* Timetable */}
      <View style={styles.field}>
        <FieldLabel>Weekly timetable (IST)</FieldLabel>
        {schedule.map((slot, i) => (
          <Card key={i}>
            <DayPicker value={slot.day} onChange={d => updateSlot(i, { day: d })} />
            <View style={styles.slotRow}>
              <View style={styles.flex}>
                <TextField
                  label="Start time (24h)"
                  value={slot.startTime}
                  onChangeText={t => updateSlot(i, { startTime: formatTimeInput(t) })}
                  placeholder="18:30"
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              <Button
                title="Remove"
                variant="secondary"
                onPress={() => setSchedule(list => list.filter((_, j) => j !== i))}
              />
            </View>
          </Card>
        ))}
        {err('schedule') && <AppText color="danger">{err('schedule')}</AppText>}
        <Button
          title="+ Add class time"
          variant="secondary"
          onPress={() => setSchedule(list => [...list, { day: 'thu', startTime: list.at(-1)?.startTime ?? '18:00' }])}
        />
      </View>

      <SwitchRow
        label="Active"
        hint="Inactive batches are hidden from students and can't be joined."
        value={isActive}
        onChange={setIsActive}
      />

      <Button title={existing ? 'Save changes' : 'Create batch'} onPress={save} loading={saving} />
    </Screen>
  );
}

function DayPicker({ value, onChange }: { value: Weekday; onChange: (d: Weekday) => void }) {
  const colors = useColors();
  return (
    <View style={styles.days} accessibilityRole="radiogroup">
      {DAYS.map(d => {
        const selected = d === value;
        return (
          <Pressable
            key={d}
            accessibilityRole="radio"
            accessibilityLabel={shortDay(d)}
            accessibilityState={{ selected }}
            onPress={() => onChange(d)}
            style={[
              styles.day,
              selected
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: colors.background, borderColor: colors.border },
            ]}>
            <AppText variant="caption" style={styles.dayText} color={selected ? 'onPrimary' : 'text'}>
              {shortDay(d).slice(0, 2)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

/** "1830" → "18:30" while typing. */
function formatTimeInput(t: string) {
  const digits = t.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  days: { flexDirection: 'row', gap: spacing.xs },
  day: { flex: 1, height: 36, borderRadius: radius.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontWeight: '700' },
  slotRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  flex: { flex: 1 },
});
