import type { ExistingStudentInput } from '@/services/admin';
import type { Instrument } from '@/types/api';

/** "+91 98765-43210" / "098765 43210" → "9876543210", or null if not a valid Indian mobile. */
export function normalizeIndianPhone(raw: string): string | null {
  let d = raw.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

export function isIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** Accepts 31/12/2026, 31-12-2026 (Indian order) or 2026-12-31. */
function parseDate(raw: string): string | null {
  const s = raw.trim();
  if (isIsoDate(s)) return s;
  const m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (!m) return null;
  const iso = `${m[3]}-${m[2]!.padStart(2, '0')}-${m[1]!.padStart(2, '0')}`;
  return isIsoDate(iso) ? iso : null;
}

const INSTRUMENT_ALIASES: Record<string, Instrument> = {
  violin: 'violin',
  voilin: 'violin',
  piano: 'piano',
  keyboard: 'piano',
  drums: 'drums',
  drum: 'drums',
};

export interface ParsedRow {
  line: number;
  student?: ExistingStudentInput;
  error?: string;
}

/**
 * One student per line, comma- or tab-separated (paste straight from Excel / Google Sheets):
 *   name, phone, instrument, classes per week, paid until, email (optional)
 * A header row is skipped automatically.
 */
export function parseStudentList(text: string): ParsedRow[] {
  const rows: ParsedRow[] = [];
  text.split(/\r?\n/).forEach((rawLine, i) => {
    const line = rawLine.trim();
    if (!line) return;
    const cols = line.split(line.includes('\t') ? '\t' : ',').map(c => c.trim());
    if (i === 0 && /name/i.test(cols[0] ?? '') && /phone|mobile/i.test(cols[1] ?? '')) return; // header

    const [name, phoneRaw, instrumentRaw, cpwRaw, dateRaw, emailRaw] = cols;
    const fail = (error: string) => rows.push({ line: i + 1, error });

    if (!name) return fail('Missing name');
    const phone = normalizeIndianPhone(phoneRaw ?? '');
    if (!phone) return fail(`Invalid phone "${phoneRaw ?? ''}"`);
    const instrument = INSTRUMENT_ALIASES[(instrumentRaw ?? '').toLowerCase()];
    if (!instrument) return fail(`Unknown instrument "${instrumentRaw ?? ''}" (use violin, piano or drums)`);
    const cpw = Number((cpwRaw ?? '').replace(/\D/g, ''));
    if (cpw !== 2 && cpw !== 4) return fail(`Classes per week must be 2 or 4, got "${cpwRaw ?? ''}"`);
    const paidUntil = parseDate(dateRaw ?? '');
    if (!paidUntil) return fail(`Invalid date "${dateRaw ?? ''}" (use DD/MM/YYYY or YYYY-MM-DD)`);
    const email = emailRaw?.trim().toLowerCase();
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return fail(`Invalid email "${emailRaw}"`);

    rows.push({
      line: i + 1,
      student: { name, phone, instrument, classesPerWeek: cpw, paidUntil, ...(email ? { email } : {}) },
    });
  });
  return rows;
}
