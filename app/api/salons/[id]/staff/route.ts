import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// قائمة عامة (بدون حماية) بموظفي صالون معيّن على رأس العمل — تُستخدم بنموذج
// حجز العميل ليختار موظفًا معينًا (اختياري).
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const staff = await prisma.staff.findMany({
    where: { tenantId: id, status: 'ACTIVE' },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ success: true, data: staff }, { status: 200 });
}
