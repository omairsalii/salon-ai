import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminSession';
import { toCsv } from '@/lib/csv';
import { logAdminAction } from '@/lib/audit';

const svcName = (n: unknown) => {
  const o = (n as Record<string, string> | null) || {};
  return o.ar || o.en || '';
};

// GET /api/admin/export?type=salons|owners|customers|bookings
export async function GET(request: Request) {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  const type = new URL(request.url).searchParams.get('type');
  let csv: string;

  if (type === 'salons') {
    const rows = await prisma.tenant.findMany({ orderBy: { createdAt: 'desc' }, include: { owner: { select: { email: true } } } });
    csv = toCsv(
      ['id', 'name', 'city', 'owner_email', 'plan', 'trial_ends_at', 'published', 'created_at'],
      rows.map((t) => [t.id, t.name, t.city, t.owner?.email, t.plan, t.trialEndsAt, t.isPublished, t.createdAt])
    );
  } else if (type === 'owners') {
    const rows = await prisma.owner.findMany({ orderBy: { createdAt: 'desc' }, include: { tenant: { select: { name: true } } } });
    csv = toCsv(
      ['id', 'name', 'email', 'salon', 'email_verified', 'suspended', 'created_at'],
      rows.map((o) => [o.id, o.name, o.email, o.tenant.name, Boolean(o.emailVerifiedAt), Boolean(o.suspendedAt), o.createdAt])
    );
  } else if (type === 'customers') {
    const rows = await prisma.customerAccount.findMany({ orderBy: { createdAt: 'desc' } });
    csv = toCsv(
      ['id', 'name', 'email', 'email_verified', 'suspended', 'created_at'],
      rows.map((c) => [c.id, c.name, c.email, Boolean(c.emailVerifiedAt), Boolean(c.suspendedAt), c.createdAt])
    );
  } else if (type === 'bookings') {
    const rows = await prisma.appointment.findMany({
      orderBy: { startTime: 'desc' },
      take: 20000,
      include: { tenant: { select: { name: true } }, customer: { select: { name: true, phone: true } }, service: { select: { name: true } }, employee: { select: { name: true } } },
    });
    csv = toCsv(
      ['id', 'salon', 'customer', 'phone', 'service', 'staff', 'status', 'total', 'start_time'],
      rows.map((a) => [a.id, a.tenant?.name, a.customer?.name, a.customer?.phone, svcName(a.service?.name), a.employee?.name, a.status, a.totalAmount?.toString(), a.startTime])
    );
  } else {
    return NextResponse.json({ success: false, error: 'type must be salons|owners|customers|bookings' }, { status: 400 });
  }

  await logAdminAction(guard.session, { action: 'EXPORT', targetType: 'SETTINGS', targetLabel: String(type) });
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
