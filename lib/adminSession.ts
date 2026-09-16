import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const COOKIE_NAME = 'salon_admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 يوم

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not configured');
  }
  return new TextEncoder().encode(secret);
}

export interface AdminSessionPayload {
  adminId: string;
  email: string;
}

// جلسة أدمن منفصلة تمامًا عن جلسة صاحب الصالون — كوكي مختلف الاسم، ولا يمكن
// الخلط بينها أو الترقية من جلسة owner لجلسة admin بأي شكل.
export async function createAdminSession(payload: AdminSessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE_SECONDS,
    path: '/',
  });
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.adminId !== 'string' || typeof payload.email !== 'string') {
      return null;
    }
    return { adminId: payload.adminId, email: payload.email };
  } catch {
    return null;
  }
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// حارس للاستخدام داخل مسارات app/api/admin/... — يرجّع استجابة 401 جاهزة
// إذا ما فيه جلسة أدمن صالحة، أو null إذا كل شي تمام.
export async function requireAdmin(): Promise<{ response: NextResponse } | { session: AdminSessionPayload }> {
  const session = await getAdminSession();
  if (!session) {
    return { response: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session };
}
