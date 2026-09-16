import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminSession';

export async function GET() {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'desc' },
    include: { owner: { select: { email: true, name: true } } },
  });

  return NextResponse.json({ success: true, data: tenants }, { status: 200 });
}
