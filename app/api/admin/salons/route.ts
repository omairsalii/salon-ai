import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminSession';

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  const q = (new URL(request.url).searchParams.get('q') || '').trim().slice(0, 100);
  const tenants = await prisma.tenant.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
            { owner: { email: { contains: q, mode: 'insensitive' } } },
          ],
        }
      : {},
    orderBy: { createdAt: 'desc' },
    include: { owner: { select: { email: true, name: true } } },
  });

  return NextResponse.json({ success: true, data: tenants }, { status: 200 });
}
