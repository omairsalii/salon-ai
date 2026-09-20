import { describe, expect, it } from 'vitest';
import { resolveSubscription } from '@/lib/subscription';

const NOW = new Date('2026-09-20T12:00:00Z');
const inDays = (n: number) => new Date(NOW.getTime() + n * 86400000);

describe('resolveSubscription', () => {
  it('active trial has Professional features and counts days left', () => {
    const s = resolveSubscription({ plan: 'TRIAL', trialEndsAt: inDays(5) }, NOW);
    expect(s).toMatchObject({ plan: 'TRIAL', onTrial: true, trialExpired: false, trialDaysLeft: 5, bookingEnabled: true, offers: true, analytics: true, maxStaff: 10 });
  });

  it('rounds a partial last day up', () => {
    const s = resolveSubscription({ plan: 'TRIAL', trialEndsAt: new Date(NOW.getTime() + 3600_000) }, NOW);
    expect(s.trialDaysLeft).toBe(1);
  });

  it('expired trial blocks bookings, features and adding staff', () => {
    const s = resolveSubscription({ plan: 'TRIAL', trialEndsAt: inDays(-1) }, NOW);
    expect(s).toMatchObject({ trialExpired: true, bookingEnabled: false, offers: false, analytics: false, maxStaff: 0 });
  });

  it('a trial with no end date counts as expired (fails closed)', () => {
    expect(resolveSubscription({ plan: 'TRIAL', trialEndsAt: null }, NOW).bookingEnabled).toBe(false);
  });

  it('BASIC: 2 staff, no offers, no analytics, but bookable', () => {
    const s = resolveSubscription({ plan: 'BASIC', trialEndsAt: inDays(-30) }, NOW);
    expect(s).toMatchObject({ plan: 'BASIC', bookingEnabled: true, maxStaff: 2, offers: false, analytics: false });
  });

  it('ENTERPRISE has unlimited staff', () => {
    expect(resolveSubscription({ plan: 'ENTERPRISE', trialEndsAt: null }, NOW).maxStaff).toBeNull();
  });

  it('an unknown plan string is treated like a trial, not a paid plan', () => {
    const s = resolveSubscription({ plan: 'FREE_FOREVER', trialEndsAt: inDays(-1) }, NOW);
    expect(s.plan).toBe('TRIAL');
    expect(s.bookingEnabled).toBe(false);
  });
});
