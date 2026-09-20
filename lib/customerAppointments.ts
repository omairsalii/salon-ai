import { prisma } from '@/lib/prisma';
import { getCustomerSession } from '@/lib/customerSession';

// يجلب حجزًا يخص العميل المسجّل حاليًا فقط (عبر حسابه)، مع التحقق من نافذة الإلغاء
export async function loadOwnedAppointment(id: string) {
  const session = await getCustomerSession();
  if (!session) return { error: 'Unauthorized' as const, status: 401 };

  const appt = await prisma.appointment.findFirst({
    where: { id, customer: { accountId: session.accountId } },
    include: { tenant: true },
  });
  if (!appt || !appt.tenant || !appt.startTime) return { error: 'Not found' as const, status: 404 };

  if (!['CONFIRMED', 'PENDING_DEPOSIT'].includes(appt.status || '')) {
    return { error: 'لا يمكن تعديل هذا الحجز' as const, status: 400 };
  }

  const cutoff = appt.startTime.getTime() - appt.tenant.cancellationHours * 3600 * 1000;
  if (Date.now() > cutoff) {
    return {
      error: `يمكن الإلغاء أو التعديل قبل الموعد بـ ${appt.tenant.cancellationHours} ساعة على الأقل` as const,
      status: 400,
    };
  }

  return { appt, tenant: appt.tenant };
}
