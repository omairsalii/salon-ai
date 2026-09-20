import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminSession';
import { logAdminAction } from '@/lib/audit';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const suspend = body.suspend !== false;

  const account = await prisma.customerAccount.findUnique({ where: { id } });
  if (!account) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

  await prisma.customerAccount.update({ where: { id }, data: { suspendedAt: suspend ? new Date() : null } });
  await logAdminAction(guard.session, {
    action: suspend ? 'CUSTOMER_SUSPEND' : 'CUSTOMER_UNSUSPEND',
    targetType: 'CUSTOMER',
    targetId: id,
    targetLabel: account.email,
  });
  return NextResponse.json({ success: true });
}
