import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('Admin');

  const [totalSalons, totalOwners, totalAppointments, recentSalons] = await Promise.all([
    prisma.tenant.count(),
    prisma.owner.count(),
    prisma.appointment.count(),
    prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { owner: { select: { email: true } } },
    }),
  ]);

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
