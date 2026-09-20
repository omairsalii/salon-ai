import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminSession';
import { sendVerificationEmail } from '@/lib/verification';
import { logAdminAction } from '@/lib/audit';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const owner = await prisma.owner.findUnique({ where: { id } });
  if (!owner) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  if (owner.emailVerifiedAt) return NextResponse.json({ success: true, alreadyVerified: true });

  await sendVerificationEmail(request, 'owner', owner.id, owner.email);
  await logAdminAction(guard.session, { action: 'OWNER_RESEND_VERIFICATION', targetType: 'OWNER', targetId: id, targetLabel: owner.email });
  return NextResponse.json({ success: true });
}
