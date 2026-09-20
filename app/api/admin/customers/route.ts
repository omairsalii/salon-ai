import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminSession';
import { listParams } from '@/lib/adminList';

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  const { q, page, take, skip } = listParams(request);
  const where = q
    ? { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { email: { contains: q, mode: 'insensitive' as const } }] }
    : {};

  const [rows, total] = await Promise.all([
    prisma.customerAccount.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerifiedAt: true,
        suspendedAt: true,
        createdAt: true,
        _count: { select: { customers: true, reviews: true } },
      },
    }),
    prisma.customerAccount.count({ where }),
  ]);

  return NextResponse.json({ success: true, data: rows, total, page, pageSize: take });
}
