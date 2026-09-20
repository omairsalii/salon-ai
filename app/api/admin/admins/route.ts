import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminSession';
import { hashPassword } from '@/lib/password';
import { generateTempPassword } from '@/lib/tempPassword';
import { logAdminAction } from '@/lib/audit';

export async function GET() {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, email: true, mustChangePassword: true, createdAt: true },
  });
  return NextResponse.json({ success: true, data: admins, currentAdminId: guard.session.adminId });
}

// إضافة مدير جديد بكلمة مرور مؤقتة تُعرض مرة واحدة للأدمن الحالي
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, error: 'الاسم والبريد الإلكتروني الصحيح مطلوبان' }, { status: 400 });
  }
  if (await prisma.admin.findUnique({ where: { email } })) {
    return NextResponse.json({ success: false, error: 'يوجد مدير بهذا البريد بالفعل' }, { status: 409 });
  }

  const tempPassword = generateTempPassword();
  const admin = await prisma.admin.create({
    data: { name, email, passwordHash: await hashPassword(tempPassword), mustChangePassword: true },
    select: { id: true, name: true, email: true },
  });

  await logAdminAction(guard.session, { action: 'ADMIN_CREATE', targetType: 'ADMIN', targetId: admin.id, targetLabel: admin.email });
  return NextResponse.json({ success: true, data: admin, tempPassword }, { status: 201 });
}
