import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminSession';

export async function GET() {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  const owners = await prisma.owner.findMany({
    orderBy: { createdAt: 'desc' },
    include: { tenant: { select: { name: true, id: true } } },
  });

  return NextResponse.json({ success: true, data: owners }, { status: 200 });
}
