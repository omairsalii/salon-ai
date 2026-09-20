// باقات الاشتراك. الأسعار هنا مؤقتة (BHD/شهريًا) ريثما تُحسم؛ لا يوجد دفع فعلي بعد.
export type PlanKey = 'TRIAL' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
export type PaidPlanKey = Exclude<PlanKey, 'TRIAL'>;

export const TRIAL_DAYS = 14;

export interface PlanDef {
  key: PaidPlanKey;
  priceBhdMonthly: number; // TODO: مؤقت
  maxStaff: number | null; // null = بلا حد
  offers: boolean;
  analytics: boolean;
}

export const PLANS: Record<PaidPlanKey, PlanDef> = {
  BASIC: { key: 'BASIC', priceBhdMonthly: 9, maxStaff: 2, offers: false, analytics: false },
  PROFESSIONAL: { key: 'PROFESSIONAL', priceBhdMonthly: 19, maxStaff: 10, offers: true, analytics: true },
  ENTERPRISE: { key: 'ENTERPRISE', priceBhdMonthly: 39, maxStaff: null, offers: true, analytics: true },
};

export const PAID_PLAN_KEYS = Object.keys(PLANS) as PaidPlanKey[];

export const isPaidPlan = (v: unknown): v is PaidPlanKey =>
  typeof v === 'string' && (PAID_PLAN_KEYS as string[]).includes(v);
