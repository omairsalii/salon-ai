import { prisma } from '@/lib/prisma';
import { DEFAULT_TIMEZONE, zonedToUtc } from '@/lib/schedule';

export interface MonthStats {
  label: string; // YYYY-MM
  bookings: number;
  cancelled: number;
  revenue: number;
  newCustomers: number;
}

function monthKey(date: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit' }).formatToParts(date);
  return `${parts.find((p) => p.type === 'year')!.value}-${parts.find((p) => p.type === 'month')!.value}`;
}

function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export const growth = (current: number, previous: number): number | null =>
  previous === 0 ? (current === 0 ? 0 : null) : Math.round(((current - previous) / previous) * 100);

// إحصائيات آخر `months` أشهر (تنتهي بالشهر الحالي) بتوقيت الصالون
export async function getMonthlyStats(tenantId: string, timezone: string | null, months = 6) {
  const tz = timezone || DEFAULT_TIMEZONE;
  const current = monthKey(new Date(), tz);
  const keys = Array.from({ length: months }, (_, i) => shiftMonth(current, i - (months - 1)));
  const rangeStart = zonedToUtc(`${keys[0]}-01`, '00:00', tz);
  const rangeEnd = zonedToUtc(`${shiftMonth(current, 1)}-01`, '00:00', tz);

  const [appointments, customers] = await Promise.all([
    prisma.appointment.findMany({
      where: { tenantId, startTime: { gte: rangeStart, lt: rangeEnd } },
      select: { startTime: true, status: true, totalAmount: true, serviceId: true, employeeId: true },
    }),
    prisma.customer.findMany({
      where: { tenantId, createdAt: { gte: rangeStart, lt: rangeEnd } },
      select: { createdAt: true },
    }),
  ]);

  const stats = new Map<string, MonthStats>(
    keys.map((k) => [k, { label: k, bookings: 0, cancelled: 0, revenue: 0, newCustomers: 0 }])
  );
  for (const a of appointments) {
    const s = stats.get(monthKey(a.startTime!, tz));
    if (!s) continue;
    if (a.status === 'CANCELLED') {
      s.cancelled += 1;
    } else {
      s.bookings += 1;
      s.revenue += a.totalAmount ? Number(a.totalAmount) : 0;
    }
  }
  for (const c of customers) {
    const s = stats.get(monthKey(c.createdAt, tz));
    if (s) s.newCustomers += 1;
  }

  const series = keys.map((k) => stats.get(k)!);
  const thisMonth = series[series.length - 1];
  const lastMonth = series[series.length - 2] ?? { ...thisMonth, bookings: 0, revenue: 0, newCustomers: 0, cancelled: 0 };

  // أكثر الخدمات حجزًا هذا الشهر
  const currentStart = zonedToUtc(`${current}-01`, '00:00', tz);
  const serviceCounts = new Map<string, number>();
  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const a of appointments) {
    if (a.status === 'CANCELLED' || !a.startTime || a.startTime < currentStart) continue;
    if (a.serviceId) serviceCounts.set(a.serviceId, (serviceCounts.get(a.serviceId) || 0) + 1);
    const wd = new Date(a.startTime.getTime() + 0).toLocaleDateString('en-US', { timeZone: tz, weekday: 'short' });
    const idx = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd);
    if (idx >= 0) weekdayCounts[idx] += 1;
  }
  const topServiceIds = [...serviceCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const services = topServiceIds.length
    ? await prisma.service.findMany({ where: { id: { in: topServiceIds.map(([id]) => id) }, tenantId }, select: { id: true, name: true } })
    : [];
  const topServices = topServiceIds.map(([id, count]) => ({
    count,
    name: (services.find((s) => s.id === id)?.name as Record<string, string> | null) ?? null,
  }));

  return { series, thisMonth, lastMonth, topServices, weekdayCounts };
}
