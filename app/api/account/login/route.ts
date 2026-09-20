import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { createCustomerSession } from '@/lib/customerSession';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    const account = await prisma.customerAccount.findUnique({ where: { email } });
    if (!account) {
      return NextResponse.json({ success: false, error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    const valid = await verifyPassword(password, account.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    await createCustomerSession({ accountId: account.id, email: account.email, name: account.name });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Customer login error:', error);
    return NextResponse.json(
      { success: false, error: 'فشل تسجيل الدخول', details: error.message },
      { status: 500 }
    );
  }
}
