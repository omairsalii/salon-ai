import { NextResponse } from 'next/server';

// محدد معدل بسيط داخل الذاكرة (نافذة ثابتة). يعمل لكل نسخة من السيرفر على حدة،
// لذا عند التوسع لعدة نسخ يُستبدل بـ Redis بدون تغيير الواجهة.
type Bucket = { count: number; resetAt: number };

const globalStore = globalThis as unknown as { __rateBuckets?: Map<string, Bucket> };
const buckets = (globalStore.__rateBuckets ??= new Map<string, Bucket>());

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();

  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const, retryAfterSec: 0 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false as const, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true as const, retryAfterSec: 0 };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'local';
}

// يرجع استجابة 429 جاهزة إذا تجاوز الحد، وإلا null
export function limitOrResponse(key: string, limit: number, windowMs: number) {
  const r = rateLimit(key, limit, windowMs);
  if (r.ok) return null;
  return NextResponse.json(
    { success: false, error: 'محاولات كثيرة، حاول مرة أخرى لاحقًا' },
    { status: 429, headers: { 'Retry-After': String(r.retryAfterSec) } }
  );
}
