import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminSession';
import { logAdminAction } from '@/lib/audit';

// حذف مدير. الحماية: لا يحذف نفسه، ولا يمكن حذف آخر مدير على المنصة.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  const { id } = await params;
  if (id === guard.session.adminId) {
    return NextResponse.json({ success: false, error: 'لا يمكنك حذف حسابك' }, { status: 400 });
  }

  const target = await prisma.admin.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  if ((await prisma.admin.count()) <= 1) {
    return NextResponse.json({ success: false, error: 'لا يمكن حذف آخر مدير' }, { status: 400 });
  }

  await prisma.admin.delete({ where: { id } });
  await logAdminAction(guard.session, { action: 'ADMIN_DELETE', targetType: 'ADMIN', targetId: id, targetLabel: target.email });
  return NextResponse.json({ success: true });
}
