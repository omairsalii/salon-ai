import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminSession';
import { logAdminAction } from '@/lib/audit';

// حذف حساب عميل نهائيًا: سجلات CRM عند الصالونات تبقى لكنها تُفصل عن الحساب
// (onDelete SetNull)، وتُحذف مراجعاته ومفضلاته. يتطلب كتابة بريد الحساب للتأكيد.
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const account = await prisma.customerAccount.findUnique({ where: { id } });
  if (!account) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

  if (typeof body.confirmEmail !== 'string' || body.confirmEmail.trim().toLowerCase() !== account.email) {
    return NextResponse.json({ success: false, error: 'البريد غير مطابق، لم يتم الحذف' }, { status: 400 });
  }

  await logAdminAction(guard.session, { action: 'CUSTOMER_DELETE', targetType: 'CUSTOMER', targetId: id, targetLabel: account.email });
  await prisma.customerAccount.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
