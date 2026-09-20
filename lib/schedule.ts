// ساعات الدوام الأسبوعية: المفتاح رقم اليوم (0 = الأحد ... 6 = السبت)، والقيمة
// فترة الدوام أو null إذا كان اليوم إجازة. الأوقات بتوقيت الصالون (tenant.timezone).
export type DayHours = { open: string; close: string } | null;
export type WeeklyHours = Record<string, DayHours>;

export const DEFAULT_TIMEZONE = 'Asia/Bahrain';
export const SLOT_STEP_MINUTES = 30;

// يُستخدم لصالون لم يضبط ساعاته بعد
export const DEFAULT_HOURS: WeeklyHours = Object.fromEntries(
  [0, 1, 2, 3, 4, 5, 6].map((d) => [String(d), { open: '10:00', close: '22:00' }])
);

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// تنظيف وتحقق من مدخلات المستخدم؛ يرجع null إذا كان الشكل غير صالح
export function parseWeeklyHours(input: unknown): WeeklyHours | null {
  if (!input || typeof input !== 'object') return null;
  const out: WeeklyHours = {};
  for (let d = 0; d < 7; d++) {
    const day = (input as Record<string, unknown>)[String(d)];
    if (day === null || day === undefined) {
      out[String(d)] = null;
      continue;
    }
    const { open, close } = day as { open?: string; close?: string };
    if (!open || !close || !HHMM.test(open) || !HHMM.test(close) || toMinutes(close) <= toMinutes(open)) {
      return null;
    }
    out[String(d)] = { open, close };
  }
  return out;
}

export function resolveHours(stored: unknown): WeeklyHours {
  // كائن بلا أي مفتاح يوم (0-6) يعني بيانات تالفة وليس "مغلق دائمًا"
  const hasDayKey =
    !!stored && typeof stored === 'object' && [0, 1, 2, 3, 4, 5, 6].some((d) => String(d) in (stored as object));
  return (hasDayKey && parseWeeklyHours(stored)) || DEFAULT_HOURS;
}

function tzOffsetMinutes(at: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return Math.round((asUtc - at.getTime()) / 60000);
}

// تاريخ محلي (YYYY-MM-DD) + وقت محلي → لحظة UTC
export function zonedToUtc(dateStr: string, hhmm: string, timeZone: string): Date {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const [h, mi] = hhmm.split(':').map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  return new Date(guess - tzOffsetMinutes(new Date(guess), timeZone) * 60000);
}

export function localParts(at: Date, timeZone: string) {
  const local = new Date(at.getTime() + tzOffsetMinutes(at, timeZone) * 60000);
  return {
    dateStr: local.toISOString().slice(0, 10),
    weekday: local.getUTCDay(),
    minutes: local.getUTCHours() * 60 + local.getUTCMinutes(),
  };
}

export function weekdayOfDate(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

// هل الفترة [start, end) تقع بالكامل داخل دوام ذلك اليوم؟
export function fitsWorkingHours(start: Date, end: Date, timeZone: string, hours: WeeklyHours): boolean {
  const s = localParts(start, timeZone);
  const e = localParts(end, timeZone);
  const day = hours[String(s.weekday)];
  if (!day || e.dateStr !== s.dateStr) return false;
  return s.minutes >= toMinutes(day.open) && e.minutes <= toMinutes(day.close);
}
