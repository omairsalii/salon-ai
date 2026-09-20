import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminSession';
import { logAdminAction } from '@/lib/audit';

// حذف تقييم مسيء
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const review = await prisma.review.findUnique({ where: { id }, include: { tenant: { select: { name: true } } } });
  if (!review) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

  await prisma.review.delete({ where: { id } });
  await logAdminAction(guard.session, {
    action: 'REVIEW_DELETE',
    targetType: 'REVIEW',
    targetId: id,
    targetLabel: review.tenant.name,
    details: { rating: review.rating, comment: review.comment },
  });
  return NextResponse.json({ success: true });
}
