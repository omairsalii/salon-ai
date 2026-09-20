import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';

export default async function AdminAuditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('Admin');
  const logs = await prisma.adminAuditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('audit')}</h1>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        {logs.length === 0 ? (
          <p className="p-6 text-center text-slate-400 text-sm">{t('noAudit')}</p>
        ) : (
          <table className="w-full text-right text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs">
              <tr>
                <th className="p-3">{t('auditWhen')}</th>
                <th className="p-3">{t('auditWho')}</th>
                <th className="p-3">{t('auditAction')}</th>
                <th className="p-3">{t('auditTarget')}</th>
                <th className="p-3">{t('auditDetails')}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-slate-100 align-top">
                  <td className="p-3 whitespace-nowrap">
                    {l.createdAt.toLocaleString(locale === 'ar' ? 'ar-BH' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="p-3" dir="ltr">{l.adminEmail}</td>
                  <td className="p-3 font-mono text-xs">{l.action}</td>
                  <td className="p-3">{l.targetLabel || l.targetId || '—'}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-500 max-w-xs break-words" dir="ltr">
                    {l.details ? JSON.stringify(l.details) : '—'}
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
