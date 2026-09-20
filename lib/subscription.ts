import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PLANS, isPaidPlan, type PaidPlanKey } from '@/lib/plans';

export interface Subscription {
  plan: 'TRIAL' | PaidPlanKey;
  onTrial: boolean;
  trialExpired: boolean;
  trialDaysLeft: number;
  bookingEnabled: boolean;
  maxStaff: number | null;
  offers: boolean;
  analytics: boolean;
}

// الصلاحيات الفعلية: التجربة الفعالة = مزايا الباقة الاحترافية، وبعد انتهائها
// بدون اختيار باقة يتوقف استقبال الحجوزات الجديدة (والمالك يختار باقة ليعود).
export function resolveSubscription(t: { plan: string; trialEndsAt: Date | null }, now = new Date()): Subscription {
  if (isPaidPlan(t.plan)) {
    const p = PLANS[t.plan];
    return {
      plan: p.key,
      onTrial: false,
      trialExpired: false,
      trialDaysLeft: 0,
      bookingEnabled: true,
      maxStaff: p.maxStaff,
      offers: p.offers,
      analytics: p.analytics,
    };
  }

  const msLeft = t.trialEndsAt ? t.trialEndsAt.getTime() - now.getTime() : 0;
  const active = msLeft > 0;
  const pro = PLANS.PROFESSIONAL;
  return {
    plan: 'TRIAL',
    onTrial: active,
    trialExpired: !active,
    trialDaysLeft: active ? Math.ceil(msLeft / 86400000) : 0,
    bookingEnabled: active,
    maxStaff: active ? pro.maxStaff : 0,
    offers: active,
    analytics: active,
  };
}

export async function getTenantSubscription(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { plan: true, trialEndsAt: true } });
  return tenant ? resolveSubscription(tenant) : null;
}

export function upgradeRequired(message: string) {
  return NextResponse.json({ success: false, error: message, code: 'UPGRADE_REQUIRED' }, { status: 403 });
}
