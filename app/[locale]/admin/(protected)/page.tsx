import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('Admin');

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
  const since30 = new Date(now.getTime() - 30 * 86400000);

  const [totalSalons, totalOwners, totalAppointments, recentSalons, tenantsForReport, bookings30d, customerAccounts] = await Promise.all([
    prisma.tenant.count(),
    prisma.owner.count(),
    prisma.appointment.count(),
    prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { owner: { select: { email: true } } },
    }),
    prisma.tenant.findMany({ select: { createdAt: true, plan: true, trialEndsAt: true } }),
    prisma.appointment.count({ where: { startTime: { gte: since30 } } }),
    prisma.customerAccount.count(),
  ]);

  const signups = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    return {
      key,
      count: tenantsForReport.filter((x) => x.createdAt && x.createdAt.toISOString().startsWith(key)).length,
    };
  });
  const maxSignups = Math.max(1, ...signups.map((s) => s.count));
  const paid = tenantsForReport.filter((x) => x.plan !== 'TRIAL').length;
  const activeTrials = tenantsForReport.filter((x) => x.plan === 'TRIAL' && x.trialEndsAt && x.trialEndsAt > now).length;
  const expiredTrials = tenantsForReport.filter((x) => x.plan === 'TRIAL' && !(x.trialEndsAt && x.trialEndsAt > now)).length;
  const kpis = [
    { label: t('paidSalons'), value: paid },
    { label: t('activeTrials'), value: activeTrials },
    { label: t('expiredTrials'), value: expiredTrials },
    { label: t('bookings30d'), value: bookings30d },
    { label: t('customerAccounts'), value: customerAccounts },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">{t('overview')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">{t('totalSalons')}</p>
          <h3 className="text-3xl font-extrabold text-slate-900">{totalSalons}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">{t('totalOwners')}</p>
          <h3 className="text-3xl font-extrabold text-slate-900">{totalOwners}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">{t('totalAppointments')}</p>
          <h3 className="text-3xl font-extrabold text-slate-900">{totalAppointments}</h3>
        </div>
      </div>

      <h2 className="text-lg font-bold text-slate-900 mb-4">{t('reportsTitle')}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">{k.label}</p>
            <p className="text-2xl font-extrabold text-slate-900">{k.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <p className="text-sm font-semibold text-slate-700 mb-4">{t('signupsPerMonth')}</p>
        <div className="flex items-end gap-3 h-28" dir="ltr">
          {signups.map((s) => (
            <div key={s.key} className="flex-1 flex flex-col items-center justify-end h-full">
              <span className="text-[10px] text-slate-500 mb-1">{s.count || ''}</span>
              <div className="w-full rounded-t-md bg-slate-700/80" style={{ height: `${Math.max(2, (s.count / maxSignups) * 100)}%` }} />
              <span className="text-[11px] text-slate-500 mt-1">{s.key.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">{t('recentSalons')}</h3>
        {recentSalons.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">—</p>
        ) : (
          <table className="w-full text-right text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
              <tr>
                <th className="p-3 rounded-s-xl">{t('salonName')}</th>
                <th className="p-3">{t('ownerEmail')}</th>
                <th className="p-3">{t('city')}</th>
                <th className="p-3 rounded-e-xl">{t('createdAt')}</th>
              </tr>
            </thead>
            <tbody>
              {recentSalons.map((s) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="p-3 font-medium text-slate-900">{s.name}</td>
                  <td className="p-3" dir="ltr">{s.owner?.email || '—'}</td>
                  <td className="p-3">{s.city || '—'}</td>
                  <td className="p-3">
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
