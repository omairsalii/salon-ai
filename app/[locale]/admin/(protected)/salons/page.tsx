'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface TenantRow {
  id: string;
  name: string;
  city: string | null;
  isPublished: boolean;
  plan: string;
  trialEndsAt: string | null;
  createdAt: string | null;
  owner: { email: string; name: string } | null;
}

export default function AdminSalonsPage() {
  const t = useTranslations('Admin');
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'ar';

  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/salons');
    const data = await res.json();
    if (data.success) setTenants(data.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const patchTenant = async (id: string, patch: Record<string, unknown>) => {
    await fetch(`/api/admin/salons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    await load();
  };

  const togglePublished = async (tenant: TenantRow) => {
    setTogglingId(tenant.id);
    await fetch(`/api/admin/salons/${tenant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !tenant.isPublished }),
    });
    await load();
    setTogglingId(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('salons')}</h1>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        {loading ? (
          <p className="p-6 text-center text-slate-400 text-sm">...</p>
        ) : tenants.length === 0 ? (
          <p className="p-6 text-center text-slate-400 text-sm">—</p>
        ) : (
          <table className="w-full text-right text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
              <tr>
                <th className="p-3">{t('salonName')}</th>
                <th className="p-3">{t('ownerEmail')}</th>
                <th className="p-3">{t('city')}</th>
                <th className="p-3">{t('status')}</th>
                <th className="p-3">{t('plan')}</th>
                <th className="p-3">{t('createdAt')}</th>
                <th className="p-3">{t('editSalon')}</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="border-b border-slate-100">
                  <td className="p-3 font-medium text-slate-900">{tenant.name}</td>
                  <td className="p-3" dir="ltr">{tenant.owner?.email || '—'}</td>
                  <td className="p-3">{tenant.city || '—'}</td>
                  <td className="p-3">
                    <select
                      value={tenant.plan}
                      onChange={(e) => patchTenant(tenant.id, { plan: e.target.value })}
                      className="border rounded-md text-xs p-1 text-black"
                    >
                      <option value="TRIAL">TRIAL</option>
                      <option value="BASIC">BASIC</option>
                      <option value="PROFESSIONAL">PROFESSIONAL</option>
                      <option value="ENTERPRISE">ENTERPRISE</option>
                    </select>
                    {tenant.plan === 'TRIAL' && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <span>{tenant.trialEndsAt ? new Date(tenant.trialEndsAt).toLocaleDateString() : '—'}</span>
                        <button onClick={() => patchTenant(tenant.id, { extendTrialDays: 14 })} className="text-blue-600 hover:underline">+14d</button>
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => togglePublished(tenant)}
                      disabled={togglingId === tenant.id}
                      className={`text-xs px-2 py-1 rounded-md font-medium disabled:opacity-50 ${
                        tenant.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {tenant.isPublished ? t('published') : t('unpublished')}
                    </button>
                  </td>
                  <td className="p-3">
                    {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US') : '—'}
                  </td>
                  <td className="p-3">
                    <Link href={`/${locale}/admin/salons/${tenant.id}`} className="text-slate-700 hover:underline">
                      {t('editSalon')}
                    </Link>
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
