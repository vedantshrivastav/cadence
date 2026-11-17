/**
 * Class times are defined in IST by the academy. All formatting here is done in IST explicitly
 * (not the phone's timezone), so a student travelling abroad still sees the academy's schedule.
 */
import type { ScheduleSlot, Weekday } from '@/types/api';

const IST_OFFSET_MS = 330 * 60 * 1000;
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const WEEKDAYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** A Date shifted so its UTC getters read IST wall-clock values. */
function ist(d: Date | number) {
  return new Date((typeof d === 'number' ? d : d.getTime()) + IST_OFFSET_MS);
}

/** "18:30" → "6:30 PM" */
export function formatHHmm(hhmm: string): string {
  const [h = 0, m = 0] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function timeOf(d: Date): string {
  const t = ist(d);
  return formatHHmm(`${t.getUTCHours()}:${t.getUTCMinutes()}`);
}

/** "Today · 6:00 PM" / "Tomorrow · 6:00 PM" / "Fri, 21 Nov · 6:00 PM" */
export function formatClassStart(start: Date, now: Date): string {
  const a = ist(start);
  const b = ist(now);
  const dayDiff = Math.round(
    (Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate()) -
      Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate())) / DAY,
  );
  const label =
    dayDiff === 0 ? 'Today'
      : dayDiff === 1 ? 'Tomorrow'
        : `${DAY_SHORT[a.getUTCDay()]}, ${a.getUTCDate()} ${MONTH_SHORT[a.getUTCMonth()]}`;
  return `${label} · ${timeOf(start)}`;
}

/** "21 Nov 2026" */
export function formatDate(d: Date): string {
  const t = ist(d);
  return `${t.getUTCDate()} ${MONTH_SHORT[t.getUTCMonth()]} ${t.getUTCFullYear()}`;
}

/** "in 2d 3h" / "in 2h 15m" / "in 9m" / "in less than a minute" */
export function formatCountdown(ms: number): string {
  if (ms <= MINUTE) return 'in less than a minute';
  const d = Math.floor(ms / DAY);
  const h = Math.floor((ms % DAY) / HOUR);
  const m = Math.floor((ms % HOUR) / MINUTE);
  if (d > 0) return `in ${d}d ${h}h`;
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

/** Whole days remaining (rounded up), 0 if past. */
export function daysLeft(end: Date, now: Date): number {
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / DAY));
}

/** Greeting by IST hour. */
export function greeting(now: Date): string {
  const h = ist(now).getUTCHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function shortDay(day: Weekday): string {
  return DAY_SHORT[WEEKDAYS.indexOf(day)] ?? day;
}

/** Orders slots starting from today's weekday (IST), then by time. */
export function sortSlotsFromToday<T extends ScheduleSlot>(slots: T[], now: Date): T[] {
  const today = ist(now).getUTCDay();
  const rank = (s: T) => ((WEEKDAYS.indexOf(s.day) - today + 7) % 7) * 10000 + Number(s.startTime.replace(':', ''));
  return [...slots].sort((x, y) => rank(x) - rank(y));
}

export const JOIN_OPENS_BEFORE_MS = 10 * MINUTE;
export const MS = { MINUTE, HOUR, DAY };
