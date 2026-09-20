'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function ChangePasswordForm({ locale, forced }: { locale: string; forced: boolean }) {
  const t = useTranslations('Admin');
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(d.error || 'Failed');
    setDone(true);
    router.push(`/${locale}/admin`);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full bg-white shadow-md rounded-lg border border-gray-100 p-8 text-black">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">{t('changePassword')}</h1>
        {forced && <p className="mb-4 rounded bg-amber-50 p-3 text-sm text-amber-900">{t('mustChangeNotice')}</p>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
        {done && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded text-sm">{t('passwordChanged')}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('currentPassword')}</label>
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required dir="ltr" className="w-full px-3 py-2 border rounded-md text-left" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('newPassword')}</label>
            <input type="password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} required dir="ltr" className="w-full px-3 py-2 border rounded-md text-left" />
          </div>
          <button disabled={busy} className="w-full bg-black text-white py-2 rounded-md disabled:opacity-50">
            {busy ? '...' : t('changePassword')}
          </button>
        </form>
      </div>
    </div>
  );
}
