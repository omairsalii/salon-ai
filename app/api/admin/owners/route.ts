import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminSession';

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  const q = (new URL(request.url).searchParams.get('q') || '').trim().slice(0, 100);
  const owners = await prisma.owner.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] }
      : {},
    orderBy: { createdAt: 'desc' },
    include: { tenant: { select: { name: true, id: true } } },
  });

  return NextResponse.json({ success: true, data: owners }, { status: 200 });
}
