import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminSession';
import { logAdminAction } from '@/lib/audit';
import { notifyBooking } from '@/lib/notify';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const appt = await prisma.appointment.findUnique({ where: { id }, include: { tenant: { select: { name: true } } } });
  if (!appt) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  if (appt.status === 'CANCELLED' || appt.status === 'COMPLETED') {
    return NextResponse.json({ success: false, error: 'لا يمكن إلغاء هذا الحجز' }, { status: 400 });
  }

  await prisma.appointment.update({ where: { id }, data: { status: 'CANCELLED' } });
  void notifyBooking(id, 'cancelled', ['owner', 'customer']);
  await logAdminAction(guard.session, { action: 'BOOKING_CANCEL', targetType: 'BOOKING', targetId: id, targetLabel: appt.tenant?.name });
  return NextResponse.json({ success: true });
}
