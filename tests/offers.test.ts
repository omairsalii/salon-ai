import { describe, expect, it } from 'vitest';
import { DIRECT_OFFER_TYPES, PERCENT_OFFER_TYPES, describeOffer } from '@/lib/offers';

const offer = (over: Record<string, unknown>) =>
  ({ type: 'PERCENTAGE', discountPercent: null, discountAmount: null, freeService: null, ...over }) as never;

describe('describeOffer', () => {
  it('describes percentage offers in both languages', () => {
    expect(describeOffer(offer({ discountPercent: 20 }), 'ar', 'BHD')).toBe('خصم 20%');
    expect(describeOffer(offer({ discountPercent: 20 }), 'en', 'BHD')).toBe('20% off');
  });

  it('describes fixed amounts with the currency', () => {
    expect(describeOffer(offer({ type: 'FIXED_AMOUNT', discountAmount: 3 }), 'en', 'BHD')).toBe('3 BHD off');
  });

  it('includes the percent for first-booking and seasonal offers', () => {
    expect(describeOffer(offer({ type: 'FIRST_BOOKING', discountPercent: 50 }), 'en', 'BHD')).toContain('50%');
    expect(describeOffer(offer({ type: 'SEASONAL', discountPercent: 15 }), 'en', 'BHD')).toContain('15%');
  });

  it('keeps a readable fallback for legacy first-booking offers without a percent', () => {
    expect(describeOffer(offer({ type: 'FIRST_BOOKING' }), 'en', 'BHD')).toMatch(/first booking/i);
  });
});

describe('offer type groups', () => {
  it('BUY_X_GET_Y stays banner-only (not applied at checkout)', () => {
    expect(DIRECT_OFFER_TYPES).not.toContain('BUY_X_GET_Y');
  });

  it('every percent type is applicable at checkout', () => {
    for (const t of PERCENT_OFFER_TYPES) expect(DIRECT_OFFER_TYPES).toContain(t);
  });
});
