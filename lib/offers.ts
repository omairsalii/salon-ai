interface ServiceNameShape {
  name: unknown;
}

function serviceDisplayName(svc: ServiceNameShape | null, locale: string): string {
  if (!svc?.name || typeof svc.name !== 'object') return '';
  const names = svc.name as Record<string, string>;
  return names[locale] || names.ar || names.en || '';
}

export interface OfferLike {
  type: string;
  discountPercent: number | null;
  discountAmount: unknown;
  appliesToService: ServiceNameShape | null;
  freeService: ServiceNameShape | null;
}

// نص العرض المعروض للعميل — عربي/إنجليزي بدون الحاجة لتحميل next-intl هنا
// أنواع تُطبَّق فعليًا عند الحجز، وأنواع خصمها نسبة مئوية
export const DIRECT_OFFER_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SERVICE', 'FIRST_BOOKING', 'SEASONAL'];
export const PERCENT_OFFER_TYPES = ['PERCENTAGE', 'FIRST_BOOKING', 'SEASONAL'];

export function describeOffer(offer: OfferLike, locale: string, currency: string): string {
  const ar = locale === 'ar';
  switch (offer.type) {
    case 'PERCENTAGE':
      return ar ? `خصم ${offer.discountPercent}%` : `${offer.discountPercent}% off`;
    case 'FIXED_AMOUNT':
      return ar
        ? `خصم ${offer.discountAmount} ${currency}`
        : `${offer.discountAmount} ${currency} off`;
    case 'FREE_SERVICE': {
      const name = serviceDisplayName(offer.freeService, locale);
      return ar ? `${name} مجانًا` : `${name} for free`;
    }
    case 'BUY_X_GET_Y': {
      const name = serviceDisplayName(offer.freeService, locale);
      return ar ? `احصل على ${name} مجانًا` : `Get ${name} for free`;
    }
    case 'FIRST_BOOKING':
      if (offer.discountPercent) return ar ? `خصم ${offer.discountPercent}% لأول حجز` : `${offer.discountPercent}% off your first booking`;
      return ar ? 'خصم لأول حجز' : 'Discount on your first booking';
    default:
      if (offer.discountPercent) return ar ? `عرض خاص بمناسبة: خصم ${offer.discountPercent}%` : `Special offer: ${offer.discountPercent}% off`;
      return ar ? 'عرض خاص بمناسبة' : 'Special occasion offer';
  }
}
