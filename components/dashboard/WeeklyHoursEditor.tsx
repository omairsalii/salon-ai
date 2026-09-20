'use client';

import { useTranslations } from 'next-intl';
import { DEFAULT_HOURS, type WeeklyHours } from '@/lib/schedule';

export function initialHours(stored: unknown): WeeklyHours {
  if (stored && typeof stored === 'object') return stored as WeeklyHours;
  return { ...DEFAULT_HOURS };
}

export default function WeeklyHoursEditor({
  value,
  onChange,
}: {
  value: WeeklyHours;
  onChange: (next: WeeklyHours) => void;
}) {
  const t = useTranslations('Settings');

  const setDay = (d: number, day: WeeklyHours[string]) => onChange({ ...value, [String(d)]: day });

  return (
    <div className="space-y-2">
      {[0, 1, 2, 3, 4, 5, 6].map((d) => {
        const day = value[String(d)];
        return (
          <div key={d} className="flex flex-wrap items-center gap-3 text-sm">
            <span className="w-20 font-medium text-stone-700">{t(`day${d}`)}</span>
            <label className="flex items-center gap-1 text-stone-500">
              <input
                type="checkbox"
                checked={!day}
                onChange={(e) => setDay(d, e.target.checked ? null : { open: '10:00', close: '22:00' })}
              />
              {t('closed')}
            </label>
            {day && (
              <>
                <input
                  type="time"
                  value={day.open}
                  onChange={(e) => setDay(d, { ...day, open: e.target.value })}
                  className="px-2 py-1 border rounded-md text-black"
                />
                <span className="text-stone-400">–</span>
                <input
                  type="time"
                  value={day.close}
                  onChange={(e) => setDay(d, { ...day, close: e.target.value })}
                  className="px-2 py-1 border rounded-md text-black"
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
