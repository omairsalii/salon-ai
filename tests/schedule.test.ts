import { describe, expect, it } from 'vitest';
import {
  DEFAULT_HOURS,
  fitsWorkingHours,
  localParts,
  parseWeeklyHours,
  resolveHours,
  weekdayOfDate,
  zonedToUtc,
  type WeeklyHours,
} from '@/lib/schedule';

const TZ = 'Asia/Bahrain'; // UTC+3 بدون توقيت صيفي

const hours = (over: WeeklyHours = {}): WeeklyHours => ({
  ...Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((d) => [String(d), { open: '10:00', close: '14:00' }])),
  ...over,
});

describe('zonedToUtc / localParts', () => {
  it('converts Bahrain local time to UTC', () => {
    expect(zonedToUtc('2026-09-27', '10:00', TZ).toISOString()).toBe('2026-09-27T07:00:00.000Z');
  });

  it('round-trips through localParts', () => {
    const d = zonedToUtc('2026-09-27', '23:30', TZ);
    expect(localParts(d, TZ)).toEqual({ dateStr: '2026-09-27', weekday: 0, minutes: 23 * 60 + 30 });
  });

  it('rolls the local date over correctly near midnight UTC', () => {
    // 22:00Z = 01:00 اليوم التالي بتوقيت البحرين
    const d = new Date('2026-09-27T22:00:00Z');
    expect(localParts(d, TZ).dateStr).toBe('2026-09-28');
  });

  it('knows the weekday of a date string', () => {
    expect(weekdayOfDate('2026-09-27')).toBe(0); // الأحد
  });
});

describe('parseWeeklyHours', () => {
  it('accepts a valid week with closed days', () => {
    expect(parseWeeklyHours(hours({ '5': null }))).not.toBeNull();
  });

  it.each([
    ['null', null],
    ['string', 'x'],
    ['close before open', hours({ '1': { open: '14:00', close: '10:00' } })],
    ['bad time format', hours({ '1': { open: '9:00', close: '14:00' } })],
    ['hour 24', hours({ '1': { open: '10:00', close: '24:00' } })],
  ])('rejects %s', (_label, input) => {
    expect(parseWeeklyHours(input)).toBeNull();
  });

  it('falls back to default hours when nothing valid is stored', () => {
    expect(resolveHours(null)).toBe(DEFAULT_HOURS);
    expect(resolveHours({ bogus: true })).toBe(DEFAULT_HOURS);
  });
});

describe('fitsWorkingHours', () => {
  const h = hours({ '5': null }); // الجمعة إجازة
  const at = (date: string, hhmm: string, mins: number) => {
    const s = zonedToUtc(date, hhmm, TZ);
    return [s, new Date(s.getTime() + mins * 60000)] as const;
  };

  it('allows a booking fully inside opening hours', () => {
    expect(fitsWorkingHours(...at('2026-09-27', '10:00', 60), TZ, h)).toBe(true);
  });

  it('allows a booking that ends exactly at closing time', () => {
    expect(fitsWorkingHours(...at('2026-09-27', '13:00', 60), TZ, h)).toBe(true);
  });

  it('rejects a booking that runs past closing time', () => {
    expect(fitsWorkingHours(...at('2026-09-27', '13:30', 60), TZ, h)).toBe(false);
  });

  it('rejects a booking before opening', () => {
    expect(fitsWorkingHours(...at('2026-09-27', '09:30', 60), TZ, h)).toBe(false);
  });

  it('rejects any booking on a closed day', () => {
    expect(fitsWorkingHours(...at('2026-10-02', '11:00', 30), TZ, h)).toBe(false); // الجمعة
  });

  it('rejects a booking that crosses midnight', () => {
    const wide = hours({ '0': { open: '10:00', close: '23:59' } });
    expect(fitsWorkingHours(...at('2026-09-27', '23:30', 60), TZ, wide)).toBe(false);
  });
});
