import { getTranslations } from 'next-intl/server';
import SalonGrid from '@/components/SalonGrid';

async function getSalons() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/salons`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch salons:', error);
    return [];
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // استخدام getTranslations بدلاً من useTranslations في الـ Async Server Component
  const t = await getTranslations('Index');
  const salons = await getSalons();

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* ترويسة المنصة */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
          {t('title')}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t('description')}
        </p>
      </header>

      {/* قسم استعراض الصالونات */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {locale === 'ar' ? 'الصالونات المتاحة بالقرب منك' : 'Available Salons Near You'}
        </h2>

        <SalonGrid locale={locale} salons={salons} />
      </section>
    </main>
  );
}
