import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { rateLimit } from '@/lib/rateLimit';

describe('rateLimit', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('allows up to the limit then blocks', () => {
    const key = `t1:${Math.random()}`;
    const results = Array.from({ length: 5 }, () => rateLimit(key, 3, 60_000).ok);
    expect(results).toEqual([true, true, true, false, false]);
  });

  it('reports a retry-after in seconds when blocked', () => {
    const key = `t2:${Math.random()}`;
    rateLimit(key, 1, 60_000);
    const blocked = rateLimit(key, 1, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
    expect(blocked.retryAfterSec).toBeLessThanOrEqual(60);
  });

  it('resets after the window passes', () => {
    const key = `t3:${Math.random()}`;
    rateLimit(key, 1, 1_000);
    expect(rateLimit(key, 1, 1_000).ok).toBe(false);
    vi.advanceTimersByTime(1_001);
    expect(rateLimit(key, 1, 1_000).ok).toBe(true);
  });

  it('keeps separate keys independent', () => {
    const a = `t4a:${Math.random()}`;
    const b = `t4b:${Math.random()}`;
    rateLimit(a, 1, 60_000);
    expect(rateLimit(a, 1, 60_000).ok).toBe(false);
    expect(rateLimit(b, 1, 60_000).ok).toBe(true);
  });
});
