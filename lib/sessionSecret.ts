// مصدر موحّد لمفتاح توقيع الجلسات (JWT HS256) لكل أنواع الجلسات: مالك، أدمن، عميل.
// يرفض الإقلاع إذا كان المفتاح ناقصًا أو ضعيفًا أو القيمة الافتراضية من .env.example،
// حتى لا يُنشر الموقع بمفتاح يمكن تخمينه فتُزوَّر كل الجلسات.
const WEAK_DEFAULTS = new Set([
  'change-me-to-a-long-random-secret',
  'change-me',
  'secret',
]);

let cached: Uint8Array | null = null;

export function getSecretKey(): Uint8Array {
  if (cached) return cached;

  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not configured');
  }
  if (WEAK_DEFAULTS.has(secret) || secret.length < 32) {
    throw new Error(
      'SESSION_SECRET ضعيف أو هو القيمة الافتراضية — ولّد قيمة عشوائية ≥ 32 حرفًا: ' +
        'node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }

  cached = new TextEncoder().encode(secret);
  return cached;
}
