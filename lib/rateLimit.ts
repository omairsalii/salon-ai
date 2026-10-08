import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ───────────────────────────────────────────────────────────────────────────
// محدّد معدل. على Vercel (serverless) تعمل عدة نسخ متوازية، فالمخزن داخل الذاكرة
// وحده غير كافٍ (كل نسخة لها عدّادها). لذلك إذا ضُبطت مفاتيح Upstash Redis نستخدم
// مخزنًا مشتركًا موثوقًا (sliding window)؛ وإلا نسقط تلقائيًا للذاكرة — فيبقى
// التطوير المحلي يعمل دون أي إعداد. الواجهة نفسها لم تتغيّر للمستدعين.
// ───────────────────────────────────────────────────────────────────────────

type Bucket = { count: number; resetAt: number };

const globalStore = globalThis as unknown as { __rateBuckets?: Map<string, Bucket> };
const buckets = (globalStore.__rateBuckets ??= new Map<string, Bucket>());

// محدّد داخل الذاكرة (نافذة ثابتة) — يُستخدم كـ fallback وفي الاختبارات.
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

// Redis مشترك عبر REST (يناسب serverless) — null إذا لم تُضبط المفاتيح.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// نحتفظ بنسخة Ratelimit واحدة لكل تركيبة (limit, window). الـ prefix يتضمن
// التركيبة حتى لا تتداخل حالة مفتاح استُعمل بإعدادات مختلفة.
const limiters = new Map<string, Ratelimit>();

function limiterFor(limit: number, windowMs: number): Ratelimit {
  const seconds = Math.max(1, Math.ceil(windowMs / 1000));
  const cacheKey = `${limit}:${seconds}`;
  let rl = limiters.get(cacheKey);
  if (!rl) {
    rl = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(limit, `${seconds} s` as `${number} s`),
      prefix: `rl:${cacheKey}`,
      analytics: false,
    });
    limiters.set(cacheKey, rl);
  }
  return rl;
}

// الفحص الفعلي: Upstash إن توفّر، وإلا الذاكرة. أي خطأ في الوصول لـ Redis لا
// يجب أن يكسر تسجيل الدخول — نسقط للذاكرة بدل رفض كل الطلبات.
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ ok: boolean; retryAfterSec: number }> {
  if (!redis) return rateLimit(key, limit, windowMs);
  try {
    const res = await limiterFor(limit, windowMs).limit(key);
    if (res.success) return { ok: true, retryAfterSec: 0 };
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((res.reset - Date.now()) / 1000)) };
  } catch (err) {
    console.error('rate limit: redis unavailable, falling back to memory:', err);
    return rateLimit(key, limit, windowMs);
  }
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'local';
}

// يرجع استجابة 429 جاهزة إذا تجاوز الحد، وإلا null
export async function limitOrResponse(key: string, limit: number, windowMs: number) {
  const r = await checkRateLimit(key, limit, windowMs);
  if (r.ok) return null;
  return NextResponse.json(
    { success: false, error: 'محاولات كثيرة، حاول مرة أخرى لاحقًا' },
    { status: 429, headers: { 'Retry-After': String(r.retryAfterSec) } }
  );
}
