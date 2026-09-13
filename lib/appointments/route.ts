import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST: إنشاء حجز جديد مع التحقق من الخدمات والأسعار
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, customerId, serviceId, employeeId, startTime } = body;

    // التحقق من الحقول الأساسية المطلوبة
    if (!tenantId || !serviceId || !startTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (tenantId, serviceId, startTime)' },
        { status: 400 }
      );
    }

    // جلب تفاصيل الخدمة والأسعار الأساسية
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    const basePrice = service.basePrice ? Number(service.basePrice) : 0;
    const depositAmount = basePrice * 0.3; // افتراض عربون بقيمة 30% كسياسة أولية للحجز

    // حساب وقت النهاية الافتراضي (مثلاً 60 دقيقة إذا لم توجد مدة محددة)
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    // إنشاء الحجز الجديد في قاعدة البيانات
    const newAppointment = await prisma.appointment.create({
      data: {
        tenantId,
        customerId: customerId || 'guest-customer',
        employeeId: employeeId || null,
        serviceId,
        status: 'PENDING_DEPOSIT', // حالة الحجز بانتظار دفع العربون
        totalAmount: basePrice,
        depositAmount: depositAmount,
        paymentStatus: 'UNPAID',
        startTime: startDateTime,
        endTime: endDateTime,
        holdExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // حجز مؤقت لمدة 15 دقيقة
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment reserved temporarily, pending payment.',
        data: newAppointment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create appointment',
        details: error.message,
      },
      { status: 500 }
    );
  }
}