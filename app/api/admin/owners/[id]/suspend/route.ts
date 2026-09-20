import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminSession';
import { logAdminAction } from '@/lib/audit';

// إيقاف/إعادة تفعيل حساب مالك. الإيقاف يُسقط جلسته فورًا ويمنع دخوله.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const suspend = body.suspend !== false;

  const owner = await prisma.owner.findUnique({ where: { id } });
  if (!owner) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

  await prisma.owner.update({ where: { id }, data: { suspendedAt: suspend ? new Date() : null } });
  await logAdminAction(guard.session, {
    action: suspend ? 'OWNER_SUSPEND' : 'OWNER_UNSUSPEND',
    targetType: 'OWNER',
    targetId: id,
    targetLabel: owner.email,
  });
  return NextResponse.json({ success: true });
}
