'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function AdminRegisterPage() {
  const t = useTranslations('Admin');
  const router = useRouter();
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'ar';

  const [checking, setChecking] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/status');
      const data = await res.json();
      if (data.hasAdmin) {
        router.replace(`/${locale}/admin/login`);
      } else {
        setChecking(false);
      }
    })();
  }, [locale, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      router.push(`/${locale}/admin`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <p className="text-center text-gray-400 text-sm py-20">...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg border border-gray-100 p-8 text-black">
        <h1 className="text-2xl font-bold mb-1 text-gray-800">{t('registerTitle')}</h1>
        <p className="text-sm text-gray-500 mb-6">{t('registerSubtitle')}</p>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('yourName')}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" className="w-full px-3 py-2 border rounded-md text-left" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} dir="ltr" className="w-full px-3 py-2 border rounded-md text-left" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition disabled:opacity-50">
            {loading ? '...' : t('createAccount')}
          </button>
        </form>
      </div>
    </div>
  );
}
