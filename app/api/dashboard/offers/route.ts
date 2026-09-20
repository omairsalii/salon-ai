import { NextResponse } from 'next/server';
import { getTenantSubscription, upgradeRequired } from '@/lib/subscription';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

const VALID_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SERVICE', 'BUY_X_GET_Y', 'FIRST_BOOKING', 'SEASONAL'];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const offers = await prisma.offer.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: 'desc' },
    include: { appliesToService: true, freeService: true },
  });

  return NextResponse.json({ success: true, data: offers }, { status: 200 });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sub = await getTenantSubscription(session.tenantId);
    if (sub && !sub.offers) {
      return upgradeRequired('العروض والخصومات متاحة في الباقة الاحترافية أو أعلى');
    }

    const body = await request.json();
    const { type, discountPercent, discountAmount, appliesToServiceId, freeServiceId, endsAt } = body;

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ success: false, error: 'نوع العرض غير صحيح' }, { status: 400 });
    }

    // التحقق أن أي خدمة مُشار إليها تتبع فعليًا لنفس الصالون
    for (const svcId of [appliesToServiceId, freeServiceId].filter(Boolean)) {
      const svc = await prisma.service.findFirst({ where: { id: svcId, tenantId: session.tenantId } });
      if (!svc) {
        return NextResponse.json({ success: false, error: 'خدمة غير موجودة' }, { status: 404 });
      }
    }

    if ((type === 'FREE_SERVICE' || type === 'BUY_X_GET_Y') && !freeServiceId) {
      return NextResponse.json({ success: false, error: 'حدد الخدمة المجانية' }, { status: 400 });
    }
    if (type === 'PERCENTAGE' && !discountPercent) {
      return NextResponse.json({ success: false, error: 'حدد نسبة الخصم' }, { status: 400 });
    }
    if (type === 'FIXED_AMOUNT' && !discountAmount) {
      return NextResponse.json({ success: false, error: 'حدد مبلغ الخصم' }, { status: 400 });
    }

    const offer = await prisma.offer.create({
      data: {
        tenantId: session.tenantId,
        type,
        discountPercent: discountPercent ? Math.max(1, Math.min(100, parseInt(discountPercent, 10))) : null,
        discountAmount: discountAmount ? parseFloat(discountAmount) : null,
        appliesToServiceId: appliesToServiceId || null,
        freeServiceId: freeServiceId || null,
        endsAt: endsAt ? new Date(endsAt) : null,
      },
      include: { appliesToService: true, freeService: true },
    });

    return NextResponse.json({ success: true, data: offer }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { success: false, error: 'فشل إنشاء العرض', details: error.message },
      { status: 500 }
    );
  }
}
