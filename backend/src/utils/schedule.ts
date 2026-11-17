import { IST_OFFSET_MINUTES, WEEKDAYS, type Weekday } from "../config/constants.js";

export interface ScheduleSlot {
  day: Weekday;
  startTime: string; // "HH:mm" in IST
}

const DAY_MS = 24 * 60 * 60 * 1000;
const OFFSET_MS = IST_OFFSET_MINUTES * 60 * 1000;

/**
 * Next start time (as a real UTC instant) of a weekly schedule.
 * `graceMinutes` keeps a class that started a few minutes ago as "next" so the Join button stays visible.
 */
export function nextOccurrence(slots: ScheduleSlot[], from = new Date(), graceMinutes = 0): Date | null {
  if (slots.length === 0) return null;
  // IST wall-clock expressed as a UTC timestamp, so UTC getters read IST values.
  const nowIst = from.getTime() + OFFSET_MS - graceMinutes * 60 * 1000;
  const nowIstDate = new Date(nowIst);
  let best: number | null = null;

  for (const slot of slots) {
    const [h = 0, m = 0] = slot.startTime.split(":").map(Number);
    const diffDays = (WEEKDAYS.indexOf(slot.day) - nowIstDate.getUTCDay() + 7) % 7;
    let ts = Date.UTC(
      nowIstDate.getUTCFullYear(), nowIstDate.getUTCMonth(), nowIstDate.getUTCDate() + diffDays, h, m,
    );
    if (ts <= nowIst) ts += 7 * DAY_MS;
    const utcTs = ts - OFFSET_MS;
    if (best === null || utcTs < best) best = utcTs;
  }
  return best === null ? null : new Date(best);
}

/** "YYYY-MM-DD" of the given instant in IST — used as the attendance day key. */
export function istDateKey(d = new Date()): string {
  return new Date(d.getTime() + OFFSET_MS).toISOString().slice(0, 10);
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * DAY_MS);
}
