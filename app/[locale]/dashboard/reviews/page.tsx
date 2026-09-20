import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getRatings } from '@/lib/ratings';

export default async function DashboardReviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getSession();
  if (!session) redirect(`/${locale}/login`);

  const t = await getTranslations('Dashboard');
  const [reviews, ratings] = await Promise.all([
    prisma.review.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { account: { select: { name: true } } },
    }),
    getRatings([session.tenantId]),
  ]);
  const summary = ratings.get(session.tenantId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">{t('reviews')}</h1>
        {summary && (
          <span className="text-amber-600 font-semibold">
            ★ {summary.avg} <span className="text-stone-400 font-normal">({summary.count})</span>
          </span>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-x-auto">
        {reviews.length === 0 ? (
          <p className="p-6 text-center text-stone-400 text-sm">{t('noReviews')}</p>
        ) : (
          <table className="w-full text-right text-sm text-stone-600">
            <thead className="bg-stone-50 text-stone-700 text-xs">
              <tr>
                <th className="p-3">{t('reviewer')}</th>
                <th className="p-3">{t('ratingCol')}</th>
                <th className="p-3">{t('commentCol')}</th>
                <th className="p-3">{t('dateCol')}</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-b border-stone-100">
                  <td className="p-3 font-medium text-stone-900">{r.account.name}</td>
                  <td className="p-3 text-amber-500" dir="ltr">
                    {'★'.repeat(r.rating)}
                    <span className="text-stone-300">{'★'.repeat(5 - r.rating)}</span>
                  </td>
                  <td className="p-3">{r.comment || '—'}</td>
                  <td className="p-3">{r.createdAt.toLocaleDateString(locale === 'ar' ? 'ar-BH' : 'en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
