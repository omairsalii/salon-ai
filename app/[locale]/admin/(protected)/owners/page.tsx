'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface OwnerRow {
  id: string;
  name: string;
  email: string;
  createdAt: string | null;
  tenant: { id: string; name: string } | null;
}

export default function AdminOwnersPage() {
  const t = useTranslations('Admin');
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'ar';

  const [owners, setOwners] = useState<OwnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<{ ownerEmail: string; password: string } | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/owners');
      const data = await res.json();
      if (data.success) setOwners(data.data);
      setLoading(false);
    })();
  }, []);

  const handleReset = async (owner: OwnerRow) => {
    if (!confirm(t('resetPasswordConfirm'))) return;
    setResettingId(owner.id);
    const res = await fetch(`/api/admin/owners/${owner.id}/reset-password`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setNewPassword({ ownerEmail: owner.email, password: data.newPassword });
    }
    setResettingId(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('owners')}</h1>

      {newPassword && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
          <p className="font-medium text-amber-800 mb-1" dir="ltr">{newPassword.ownerEmail}</p>
          <p className="text-amber-700">{t('newPasswordGenerated')}</p>
          <code className="block mt-2 p-2 bg-white rounded border border-amber-200 text-black" dir="ltr">
            {newPassword.password}
          </code>
          <button onClick={() => setNewPassword(null)} className="mt-2 text-xs text-amber-700 hover:underline">
            إغلاق
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        {loading ? (
          <p className="p-6 text-center text-slate-400 text-sm">...</p>
        ) : owners.length === 0 ? (
          <p className="p-6 text-center text-slate-400 text-sm">—</p>
        ) : (
          <table className="w-full text-right text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
              <tr>
                <th className="p-3">{t('ownerName')}</th>
                <th className="p-3">{t('email')}</th>
                <th className="p-3">{t('salon')}</th>
                <th className="p-3">{t('createdAt')}</th>
                <th className="p-3">{t('resetPassword')}</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => (
                <tr key={owner.id} className="border-b border-slate-100">
                  <td className="p-3 font-medium text-slate-900">{owner.name}</td>
                  <td className="p-3" dir="ltr">{owner.email}</td>
                  <td className="p-3">{owner.tenant?.name || '—'}</td>
                  <td className="p-3">
                    {owner.createdAt ? new Date(owner.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US') : '—'}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleReset(owner)}
                      disabled={resettingId === owner.id}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      {t('resetPassword')}
                    </button>
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
