'use client';

import { useParams } from 'next/navigation';

export default function ImpersonationBanner({ adminEmail }: { adminEmail: string }) {
  const params = useParams();
  const locale = params.locale === 'en' ? 'en' : 'ar';

  const exit = async () => {
    await fetch('/api/auth/exit-impersonation', { method: 'POST' });
    window.location.href = `/${locale}/admin/salons`;
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
      <span>
        {locale === 'ar'
          ? `أنت تتصفح كمالك (بواسطة الأدمن ${adminEmail}). كل تغيير هنا حقيقي.`
          : `Viewing as the owner (by admin ${adminEmail}). Every change here is real.`}
      </span>
      <button onClick={exit} className="font-semibold underline">
        {locale === 'ar' ? 'خروج من وضع المالك' : 'Exit owner view'}
      </button>
    </div>
  );
}
