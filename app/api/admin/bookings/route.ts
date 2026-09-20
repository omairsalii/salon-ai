import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminSession';
import { listParams } from '@/lib/adminList';

const STATUSES = ['PENDING_DEPOSIT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  const { q, page, take, skip, url } = listParams(request);
  const status = url.searchParams.get('status') || '';
  const where = {
    ...(STATUSES.includes(status) ? { status } : {}),
    ...(q
      ? {
          OR: [
            { tenant: { name: { contains: q, mode: 'insensitive' as const } } },
            { customer: { name: { contains: q, mode: 'insensitive' as const } } },
            { customer: { phone: { contains: q } } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { startTime: 'desc' },
      take,
      skip,
      include: {
        tenant: { select: { id: true, name: true, currency: true } },
        customer: { select: { name: true, phone: true } },
        service: { select: { name: true } },
        employee: { select: { name: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  return NextResponse.json({ success: true, data: rows, total, page, pageSize: take });
}
