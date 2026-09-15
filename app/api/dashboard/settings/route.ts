import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } });
  if (!tenant) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: tenant }, { status: 200 });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, city, workingHoursText, currency, timezone } = body;

    const tenant = await prisma.tenant.update({
      where: { id: session.tenantId },
      data: {
        ...(name ? { name } : {}),
        ...(city !== undefined ? { city: city || null } : {}),
        ...(workingHoursText !== undefined ? { workingHoursText: workingHoursText || null } : {}),
        ...(currency ? { currency } : {}),
        ...(timezone ? { timezone } : {}),
      },
    });

    return NextResponse.json({ success: true, data: tenant }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'فشل تحديث الإعدادات', details: error.message },
      { status: 500 }
    );
  }
}
