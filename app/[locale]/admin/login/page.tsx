'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function AdminLoginPage() {
  const t = useTranslations('Admin');
  const router = useRouter();
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'ar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg border border-gray-100 p-8 text-black">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">{t('loginTitle')}</h1>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" className="w-full px-3 py-2 border rounded-md text-left" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" className="w-full px-3 py-2 border rounded-md text-left" />
          </div>

          <p className="text-sm">
            <a href={`/${locale}/forgot-password?audience=admin`} className="text-blue-600 hover:underline">
              {locale === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
            </a>
          </p>

          <button type="submit" disabled={loading} className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition disabled:opacity-50">
            {loading ? '...' : t('login')}
          </button>
        </form>
      </div>
    </div>
  );
}
