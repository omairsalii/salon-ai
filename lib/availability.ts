import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class SlotConflictError extends Error {
  constructor() {
    super('SLOT_CONFLICT');
  }
}

// الحجز يشغل الموظف إذا لم يكن ملغيًا، وحجز العربون المؤقت المنتهي لا يُحتسب
function blockingStatusFilter(now: Date): Prisma.AppointmentWhereInput {
  return {
    OR: [
      { status: { in: ['CONFIRMED', 'COMPLETED'] } },
      { status: 'PENDING_DEPOSIT', holdExpiresAt: { gt: now } },
      { status: 'PENDING_DEPOSIT', holdExpiresAt: null },
    ],
  };
}

// ينشئ الحجز داخل معاملة Serializable بعد التأكد أن الموظف غير مشغول في
// نفس الفترة، حتى لا يمر حجزان متزامنان لنفس الموظف. بدون موظف محدد لا يوجد
// شيء يتعارض معه فيُنشأ الحجز مباشرة.
export async function createAppointmentGuarded<T extends Prisma.AppointmentInclude | undefined = undefined>(
  data: Prisma.AppointmentUncheckedCreateInput & { startTime: Date; endTime: Date },
  include?: T
) {
  const { tenantId, employeeId, startTime, endTime } = data;

  return prisma.$transaction(
    async (tx) => {
      if (employeeId && tenantId) {
        const conflict = await tx.appointment.findFirst({
          where: {
            tenantId,
            employeeId,
            startTime: { lt: endTime },
            endTime: { gt: startTime },
            AND: [blockingStatusFilter(new Date())],
          },
          select: { id: true },
        });
        if (conflict) throw new SlotConflictError();
      }
      return tx.appointment.create({ data, include });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
}

// أخطاء التسلسل (تزامن حقيقي) تُعامل كتعارض أيضًا
export function isSlotConflict(error: unknown): boolean {
  if (error instanceof SlotConflictError) return true;
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034';
}
