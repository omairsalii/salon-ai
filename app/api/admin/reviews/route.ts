import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminSession';
import { listParams } from '@/lib/adminList';

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  const { q, page, take, skip, url } = listParams(request);
  const maxRating = parseInt(url.searchParams.get('maxRating') || '', 10);
  const where = {
    ...(Number.isInteger(maxRating) && maxRating >= 1 && maxRating <= 5 ? { rating: { lte: maxRating } } : {}),
    ...(q
      ? {
          OR: [
            { comment: { contains: q, mode: 'insensitive' as const } },
            { tenant: { name: { contains: q, mode: 'insensitive' as const } } },
            { account: { name: { contains: q, mode: 'insensitive' as const } } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: { tenant: { select: { id: true, name: true } }, account: { select: { name: true, email: true } } },
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({ success: true, data: rows, total, page, pageSize: take });
}
