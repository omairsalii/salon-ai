import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import SalonMap from '@/components/SalonMap';
import ServicesList from '@/components/ServicesList';

export default async function SalonDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) notFound();

  const services = await prisma.service.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: 'desc' },
  });

  const t = await getTranslations('SalonDetail');

  const serviceRows = services.map((s) => {
    const name = (s.name as Record<string, string> | null) || {};
    return {
      id: s.id,
      displayName: name[locale] || name.ar || name.en || '—',
      basePrice: s.basePrice ? Number(s.basePrice) : null,
      baseDurationMinutes: s.baseDurationMinutes,
    };
  });

  const mapSalons = [
    {
      id: tenant.id,
      name: tenant.name,
      city: tenant.city,
      lat: tenant.latitude ? Number(tenant.latitude) : null,
      lng: tenant.longitude ? Number(tenant.longitude) : null,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{tenant.name}</h1>
          <p className="text-gray-600">
            {tenant.addressText || tenant.city || (locale === 'ar' ? 'موقع مميز في دول الخليج' : 'Prime GCC Location')}
          </p>
        </header>

        {(tenant.latitude && tenant.longitude) && (
          <div className="mb-8 bg-white p-2 rounded-lg shadow border border-gray-100">
            <SalonMap salons={mapSalons} />
          </div>
        )}

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('services')}</h2>
          <ServicesList tenantId={tenant.id} services={serviceRows} currency={tenant.currency || 'USD'} />
        </section>
      </div>
    </main>
  );
}
