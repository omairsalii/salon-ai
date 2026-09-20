import { prisma } from '@/lib/prisma';

export interface RatingSummary {
  avg: number;
  count: number;
}

export async function getRatings(tenantIds: string[]): Promise<Map<string, RatingSummary>> {
  if (tenantIds.length === 0) return new Map();
  const rows = await prisma.review.groupBy({
    by: ['tenantId'],
    where: { tenantId: { in: tenantIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return new Map(rows.map((r) => [r.tenantId, { avg: Number((r._avg.rating ?? 0).toFixed(1)), count: r._count.rating }]));
}
