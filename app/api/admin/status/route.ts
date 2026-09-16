import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// نقطة عامة (بدون حماية) تخبر واجهة الإعداد هل يوجد حساب أدمن مسجل بالفعل
// أو لا — تُستخدم لتوجيه الزائر بين صفحة "إنشاء أول حساب" وصفحة "تسجيل الدخول".
export async function GET() {
  const count = await prisma.admin.count();
  return NextResponse.json({ success: true, hasAdmin: count > 0 }, { status: 200 });
}
