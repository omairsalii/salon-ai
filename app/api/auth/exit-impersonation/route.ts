import { NextResponse } from 'next/server';
import { clearSession, getSession } from '@/lib/session';

// ينهي جلسة "الدخول بدل المالك" فقط (لا يمس جلسة الأدمن)
export async function POST() {
  const session = await getSession();
  if (session?.imp) await clearSession();
  return NextResponse.json({ success: true });
}
