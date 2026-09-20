import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { createCustomerSession } from '@/lib/customerSession';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await prisma.customerAccount.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const account = await prisma.customerAccount.create({
      data: { name, email: normalizedEmail, passwordHash },
    });

    await createCustomerSession({ accountId: account.id, email: account.email, name: account.name });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Error registering customer account:', error);
    return NextResponse.json(
      { success: false, error: 'فشل إنشاء الحساب', details: error.message },
      { status: 500 }
    );
  }
}
