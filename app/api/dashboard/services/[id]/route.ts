import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

async function assertOwnedByTenant(id: string, tenantId: string) {
  const service = await prisma.service.findUnique({ where: { id } });
  return service && service.tenantId === tenantId;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!(await assertOwnedByTenant(id, session.tenantId))) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { nameAr, nameEn, basePrice, baseDurationMinutes } = body;

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(nameAr && nameEn ? { name: { ar: nameAr, en: nameEn } } : {}),
        ...(basePrice !== undefined ? { basePrice: basePrice ? parseFloat(basePrice) : null } : {}),
        ...(baseDurationMinutes !== undefined
          ? { baseDurationMinutes: baseDurationMinutes ? parseInt(baseDurationMinutes, 10) : null }
          : {}),
      },
    });

    return NextResponse.json({ success: true, data: service }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { success: false, error: 'فشل تحديث الخدمة', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!(await assertOwnedByTenant(id, session.tenantId))) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  await prisma.service.delete({ where: { id } });
  return NextResponse.json({ success: true }, { status: 200 });
}
