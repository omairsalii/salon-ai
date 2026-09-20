import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCustomerSession } from '@/lib/customerSession';

const DIRECTLY_APPLICABLE_OFFER_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SERVICE'];

// POST: إنشاء حجز جديد مع التحقق من الخدمات والأسعار
// حجز الضيف (بدون تسجيل دخول) مدعوم عبر customerName + customerPhone: نبحث
// عن عميل بنفس الجوال لدى هذا الصالون، وإذا ما وُجد ننشئ سجل Customer جديد له
// — هذا يخليه يظهر فورًا في CRM صاحب الصالون بدل ما يكون "ضيف" منفصل ومخفي.
// لو فيه عميل مسجّل دخوله (حساب)، نربط سجل Customer بحسابه بدل الاعتماد على
// الاسم/الجوال فقط، حتى يظهر الحجز بسجل حجوزاته لاحقًا مهما كان الصالون.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, customerId, customerName, customerPhone, serviceId, employeeId, offerId, startTime } = body;

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

    if (!service || service.tenantId !== tenantId) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant || !tenant.isPublished) {
      return NextResponse.json({ success: false, error: 'Salon not found' }, { status: 404 });
    }

    // التحقق من أقل مدة إشعار مسبق قبل الحجز (إعداد يتحكم به صاحب الصالون)
    const startDateTime = new Date(startTime);
    const minNoticeMs = (tenant.minBookingNoticeHours || 0) * 60 * 60 * 1000;
    if (startDateTime.getTime() < Date.now() + minNoticeMs) {
      return NextResponse.json(
        {
          success: false,
          error: `يجب الحجز قبل الموعد بـ ${tenant.minBookingNoticeHours} ساعة على الأقل`,
        },
        { status: 400 }
      );
    }

    // إيجاد أو إنشاء سجل العميل — مرتبط بحساب العميل لو مسجّل دخوله، وإلا
    // بالاسم والجوال كضيف (نفس السلوك السابق تمامًا)
    const customerSession = await getCustomerSession();
    let resolvedCustomerId: string | null = customerId || null;

    if (!resolvedCustomerId && customerSession) {
      const existingLinked = await prisma.customer.findFirst({
        where: { tenantId, accountId: customerSession.accountId },
      });
      const linkedCustomer =
        existingLinked ||
        (await prisma.customer.create({
          data: {
            tenantId,
            accountId: customerSession.accountId,
            name: customerSession.name,
            phone: customerPhone || null,
          },
        }));
      resolvedCustomerId = linkedCustomer.id;
    } else if (!resolvedCustomerId && customerName && customerPhone) {
      const existingCustomer = await prisma.customer.findFirst({
        where: { tenantId, phone: customerPhone },
      });
      const customer =
        existingCustomer ||
        (await prisma.customer.create({
          data: { tenantId, name: customerName, phone: customerPhone },
        }));
      resolvedCustomerId = customer.id;
    }

    const basePrice = service.basePrice ? Number(service.basePrice) : 0;

    // التحقق من العرض المُطبّق (إن وُجد) وحساب الخصم من طرف السيرفر دائمًا —
    // لا نثق بأي مبلغ خصم يُرسل من العميل
    let appliedOfferId: string | null = null;
    let finalAmount = basePrice;

    if (offerId) {
      const offer = await prisma.offer.findFirst({ where: { id: offerId, tenantId, isActive: true } });
      const notExpired = offer && (!offer.endsAt || offer.endsAt >= new Date());

      if (!offer || !notExpired || !DIRECTLY_APPLICABLE_OFFER_TYPES.includes(offer.type)) {
        return NextResponse.json({ success: false, error: 'العرض غير صالح' }, { status: 400 });
      }

      const appliesToThisService =
        offer.type === 'FREE_SERVICE'
          ? offer.freeServiceId === serviceId
          : offer.appliesToServiceId === null || offer.appliesToServiceId === serviceId;

      if (!appliesToThisService) {
        return NextResponse.json({ success: false, error: 'هذا العرض لا ينطبق على هذه الخدمة' }, { status: 400 });
      }

      if (offer.type === 'PERCENTAGE' && offer.discountPercent) {
        finalAmount = Math.max(0, basePrice * (1 - offer.discountPercent / 100));
      } else if (offer.type === 'FIXED_AMOUNT' && offer.discountAmount) {
        finalAmount = Math.max(0, basePrice - Number(offer.discountAmount));
      } else if (offer.type === 'FREE_SERVICE') {
        finalAmount = 0;
      }
      appliedOfferId = offer.id;
    }

    const depositAmount = finalAmount * (tenant.depositPercentage / 100);

    // حساب وقت النهاية بحسب مدة الخدمة (أو 60 دقيقة افتراضياً إذا لم تُحدد)
    const durationMinutes = service.baseDurationMinutes || 60;
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

    // إنشاء الحجز الجديد في قاعدة البيانات
    const newAppointment = await prisma.appointment.create({
      data: {
        tenantId,
        customerId: resolvedCustomerId,
        employeeId: employeeId || null,
        serviceId,
        appliedOfferId,
        status: depositAmount > 0 ? 'PENDING_DEPOSIT' : 'CONFIRMED',
        totalAmount: finalAmount,
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
