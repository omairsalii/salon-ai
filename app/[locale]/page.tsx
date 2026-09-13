import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

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

        {salons.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
            <p className="text-gray-500">
              {locale === 'ar' ? 'لا توجد صالونات متاحة حالياً.' : 'No salons available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salons.map((salon: any) => (
              <div 
                key={salon.id} 
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {salon.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {salon.addressText || (locale === 'ar' ? 'موقع مميز في دول الخليج' : 'Prime GCC Location')}
                </p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    {salon.currency || 'SAR'}
                  </span>
                  <Link
                    href={`/${locale}/salons/${salon.id}`}
                    className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    {locale === 'ar' ? 'احجز الآن' : 'Book Now'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}