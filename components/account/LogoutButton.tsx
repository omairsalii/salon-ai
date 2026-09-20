'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function LogoutButton() {
  const t = useTranslations('Account');
  const router = useRouter();
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'ar';
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch('/api/account/logout', { method: 'POST' });
    router.push(`/${locale}`);
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-sm text-red-500 hover:text-red-700 transition disabled:opacity-50"
    >
      {t('logout')}
    </button>
  );
}
