import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminSession';
import { createSession } from '@/lib/session';
import { logAdminAction } from '@/lib/audit';

// الدخول بدل المالك لتشخيص مشكلة عنده. جلسة قصيرة (ساعة)، موسومة باسم الأدمن،
// ومسجّلة في سجل التدقيق. لا يعمل على مالك موقوف.
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  const body = await request.json().catch(() => ({}));
  const owner = typeof body.ownerId === 'string'
    ? await prisma.owner.findUnique({ where: { id: body.ownerId }, include: { tenant: { select: { name: true } } } })
    : null;
  if (!owner) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  if (owner.suspendedAt) return NextResponse.json({ success: false, error: 'الحساب موقوف' }, { status: 400 });

  await createSession(
    { ownerId: owner.id, tenantId: owner.tenantId, email: owner.email, imp: guard.session.email },
    { maxAgeSeconds: 3600 }
  );
  await logAdminAction(guard.session, {
    action: 'IMPERSONATE_OWNER',
    targetType: 'OWNER',
    targetId: owner.id,
    targetLabel: `${owner.email} (${owner.tenant.name})`,
  });
  return NextResponse.json({ success: true });
}
