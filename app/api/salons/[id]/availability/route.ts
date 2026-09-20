import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeSlots } from '@/lib/availability';

// مواعيد متاحة لخدمة في يوم معين (عام — تُستخدم بنموذج الحجز)
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const serviceId = url.searchParams.get('serviceId');
  const date = url.searchParams.get('date');
  const employeeId = url.searchParams.get('employeeId') || undefined;
  const excludeAppointmentId = url.searchParams.get('excludeAppointmentId') || undefined;

  if (!serviceId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ success: false, error: 'serviceId and date (YYYY-MM-DD) are required' }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant || !tenant.isPublished) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }
  const service = await prisma.service.findFirst({ where: { id: serviceId, tenantId: id } });
  if (!service) {
    return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
  }

  const slots = await computeSlots({
    tenant,
    date,
    durationMinutes: service.baseDurationMinutes || 60,
    employeeId,
    excludeAppointmentId,
  });

  return NextResponse.json({ success: true, data: { slots, timezone: tenant.timezone } }, { status: 200 });
}
