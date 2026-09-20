import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import SalonMap from '@/components/SalonMap';
import ServicesList from '@/components/ServicesList';
import { describeOffer } from '@/lib/offers';

export default async function SalonDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant || !tenant.isPublished) notFound();

  const services = await prisma.service.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: 'desc' },
  });

  const offers = await prisma.offer.findMany({
    where: {
      tenantId: tenant.id,
      isActive: true,
      OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }],
    },
    include: { appliesToService: true, freeService: true },
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
          {tenant.phone && (
            <p className="text-gray-500 text-sm mt-1" dir="ltr">
              📞 {tenant.phone}
            </p>
          )}
          {(() => {
            const description = (tenant.description as Record<string, string> | null) || {};
            const text = description[locale] || description.ar || description.en;
            return text ? <p className="text-gray-700 mt-4 leading-relaxed">{text}</p> : null;
          })()}
        </header>

        {offers.length > 0 && (
          <div className="mb-8 space-y-2">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4"
              >
                <span className="text-lg">🔔</span>
                <div>
                  <p className="font-semibold text-rose-900">{tenant.name}</p>
                  <p className="text-sm text-rose-700 mt-0.5">
                    {describeOffer(offer as any, locale, tenant.currency || 'USD')}
                    {offer.appliesToService && (
                      <>
                        {' — '}
                        {(() => {
                          const name = (offer.appliesToService!.name as Record<string, string> | null) || {};
                          return name[locale] || name.ar || name.en || '';
                        })()}
                      </>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {(tenant.latitude && tenant.longitude) && (
          <div className="mb-8 bg-white p-2 rounded-lg shadow border border-gray-100">
            <SalonMap salons={mapSalons} />
          </div>
        )}

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('services')}</h2>
          <ServicesList
            tenantId={tenant.id}
            services={serviceRows}
            currency={tenant.currency || 'USD'}
            depositPercentage={tenant.depositPercentage}
            offers={offers
              .filter((o) => ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SERVICE'].includes(o.type))
              .map((o) => ({
                id: o.id,
                type: o.type,
                discountPercent: o.discountPercent,
                discountAmount: o.discountAmount ? Number(o.discountAmount) : null,
                appliesToServiceId: o.appliesToServiceId,
                freeServiceId: o.freeServiceId,
              }))}
          />
        </section>
      </div>
    </main>
  );
}
