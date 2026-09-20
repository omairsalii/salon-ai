import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  DEFAULT_TIMEZONE,
  SLOT_STEP_MINUTES,
  fitsWorkingHours,
  resolveHours,
  toMinutes,
  weekdayOfDate,
  zonedToUtc,
  type WeeklyHours,
} from '@/lib/schedule';

export class SlotConflictError extends Error {
  constructor() {
    super('SLOT_CONFLICT');
  }
}

export class OutsideHoursError extends Error {
  constructor() {
    super('OUTSIDE_HOURS');
  }
}

type TenantSchedule = { timezone: string | null; workingHours: unknown };

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

function staffHours(staff: { workingHours: unknown }, tenant: TenantSchedule): WeeklyHours {
  return resolveHours(staff.workingHours ?? tenant.workingHours);
}

export async function hasConflict(
  tx: Prisma.TransactionClient,
  tenantId: string,
  employeeId: string,
  start: Date,
  end: Date,
  excludeId?: string
) {
  const found = await tx.appointment.findFirst({
    where: {
      tenantId,
      employeeId,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      startTime: { lt: end },
      endTime: { gt: start },
      AND: [blockingStatusFilter(new Date())],
    },
    select: { id: true },
  });
  return Boolean(found);
}

// ينشئ الحجز داخل معاملة Serializable: يتحقق من ساعات الدوام والتعارض، وإذا
// لم يُحدَّد موظف وللصالون موظفون فيُسند الحجز تلقائيًا لأول موظف متاح.
export async function createAppointmentGuarded<T extends Prisma.AppointmentInclude | undefined = undefined>(
  data: Prisma.AppointmentUncheckedCreateInput & { startTime: Date; endTime: Date },
  opts: { tenant: TenantSchedule; enforceHours: boolean; autoAssign: boolean },
  include?: T
) {
  const { tenantId, startTime, endTime } = data;
  const tz = opts.tenant.timezone || DEFAULT_TIMEZONE;

  return prisma.$transaction(
    async (tx) => {
      let employeeId = data.employeeId ?? null;

      if (employeeId && tenantId) {
        const staff = await tx.staff.findFirst({ where: { id: employeeId, tenantId } });
        if (!staff) throw new SlotConflictError();
        if (opts.enforceHours && !fitsWorkingHours(startTime, endTime, tz, staffHours(staff, opts.tenant))) {
          throw new OutsideHoursError();
        }
        if (await hasConflict(tx, tenantId, employeeId, startTime, endTime)) throw new SlotConflictError();
      } else if (tenantId) {
        const activeStaff = opts.autoAssign
          ? await tx.staff.findMany({ where: { tenantId, status: 'ACTIVE' }, orderBy: { createdAt: 'asc' } })
          : [];

        if (activeStaff.length > 0) {
          let sawWorking = false;
          for (const staff of activeStaff) {
            if (!fitsWorkingHours(startTime, endTime, tz, staffHours(staff, opts.tenant))) continue;
            sawWorking = true;
            if (!(await hasConflict(tx, tenantId, staff.id, startTime, endTime))) {
              employeeId = staff.id;
              break;
            }
          }
          if (!employeeId) throw sawWorking || !opts.enforceHours ? new SlotConflictError() : new OutsideHoursError();
        } else if (opts.enforceHours && !fitsWorkingHours(startTime, endTime, tz, resolveHours(opts.tenant.workingHours))) {
          throw new OutsideHoursError();
        }
      }

      return tx.appointment.create({ data: { ...data, employeeId }, include });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
}

// نقل موعد قائم لوقت جديد بنفس الفحوصات (دوام + تعارض) مع استثناء الحجز نفسه.
// إذا لم يكن له موظف والصالون فيه موظفون، يُسند تلقائيًا.
export async function rescheduleAppointmentGuarded(
  appointmentId: string,
  newStart: Date,
  tenant: TenantSchedule
) {
  const tz = tenant.timezone || DEFAULT_TIMEZONE;

  return prisma.$transaction(
    async (tx) => {
      const appt = await tx.appointment.findUnique({ where: { id: appointmentId }, include: { service: true } });
      if (!appt || !appt.tenantId) throw new SlotConflictError();

      const duration = appt.service?.baseDurationMinutes || 60;
      const newEnd = new Date(newStart.getTime() + duration * 60000);
      let employeeId = appt.employeeId;

      if (employeeId) {
        const staff = await tx.staff.findFirst({ where: { id: employeeId, tenantId: appt.tenantId } });
        if (staff && !fitsWorkingHours(newStart, newEnd, tz, staffHours(staff, tenant))) throw new OutsideHoursError();
        if (await hasConflict(tx, appt.tenantId, employeeId, newStart, newEnd, appt.id)) throw new SlotConflictError();
      } else {
        const activeStaff = await tx.staff.findMany({
          where: { tenantId: appt.tenantId, status: 'ACTIVE' },
          orderBy: { createdAt: 'asc' },
        });
        if (activeStaff.length > 0) {
          let sawWorking = false;
          for (const staff of activeStaff) {
            if (!fitsWorkingHours(newStart, newEnd, tz, staffHours(staff, tenant))) continue;
            sawWorking = true;
            if (!(await hasConflict(tx, appt.tenantId, staff.id, newStart, newEnd, appt.id))) {
              employeeId = staff.id;
              break;
            }
          }
          if (!employeeId) throw sawWorking ? new SlotConflictError() : new OutsideHoursError();
        } else if (!fitsWorkingHours(newStart, newEnd, tz, resolveHours(tenant.workingHours))) {
          throw new OutsideHoursError();
        }
      }

      return tx.appointment.update({
        where: { id: appt.id },
        data: { startTime: newStart, endTime: newEnd, employeeId },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
}

export function isSlotConflict(error: unknown): boolean {
  if (error instanceof SlotConflictError) return true;
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034';
}

export function isOutsideHours(error: unknown): boolean {
  return error instanceof OutsideHoursError;
}

// المواعيد المتاحة ليوم معين (YYYY-MM-DD بتوقيت الصالون) لخدمة مدتها durationMinutes.
// employeeId اختياري: بدونه يظهر الموعد إذا كان أي موظف متاحًا.
export async function computeSlots(params: {
  tenant: TenantSchedule & { id: string; minBookingNoticeHours: number };
  date: string;
  durationMinutes: number;
  employeeId?: string;
  excludeAppointmentId?: string; // عند نقل موعد: لا نحسب الحجز نفسه كمشغول
}): Promise<string[]> {
  const { tenant, date, durationMinutes, employeeId, excludeAppointmentId } = params;
  const tz = tenant.timezone || DEFAULT_TIMEZONE;
  const salonHours = resolveHours(tenant.workingHours);

  const staffList = await prisma.staff.findMany({
    where: { tenantId: tenant.id, status: 'ACTIVE', ...(employeeId ? { id: employeeId } : {}) },
  });
  if (employeeId && staffList.length === 0) return [];

  const dayStart = zonedToUtc(date, '00:00', tz);
  const dayEnd = new Date(dayStart.getTime() + 24 * 3600 * 1000);
  const busy = await prisma.appointment.findMany({
    where: {
      tenantId: tenant.id,
      employeeId: { in: staffList.map((s) => s.id) },
      ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
      startTime: { lt: dayEnd },
      endTime: { gt: dayStart },
      AND: [blockingStatusFilter(new Date())],
    },
    select: { employeeId: true, startTime: true, endTime: true },
  });

  const earliest = Date.now() + tenant.minBookingNoticeHours * 3600 * 1000;
  const weekday = String(weekdayOfDate(date));
  // صالون بدون موظفين: نستخدم دوام الصالون فقط (لا يوجد ما نتحقق من تعارضه)
  const resources = staffList.length > 0 ? staffList.map((s) => ({ id: s.id, hours: staffHours(s, tenant) })) : [{ id: null, hours: salonHours }];

  const slots: string[] = [];
  for (let m = 0; m < 24 * 60; m += SLOT_STEP_MINUTES) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    const start = zonedToUtc(date, `${hh}:${mm}`, tz);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    if (start.getTime() < earliest) continue;

    const free = resources.some((r) => {
      const day = r.hours[weekday];
      if (!day || m < toMinutes(day.open)) return false;
      if (!fitsWorkingHours(start, end, tz, r.hours)) return false;
      return !busy.some((b) => b.employeeId === r.id && b.startTime! < end && b.endTime! > start);
    });
    if (free) slots.push(start.toISOString());
  }
  return slots;
}
