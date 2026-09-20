import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminSession';
import { getPlatformSettings, savePlatformSettings } from '@/lib/platformSettings';
import { logAdminAction } from '@/lib/audit';

export async function GET() {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;
  return NextResponse.json({ success: true, data: await getPlatformSettings() });
}

export async function PUT(request: Request) {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
  }

  const before = await getPlatformSettings();
  const saved = await savePlatformSettings(body);
  await logAdminAction(guard.session, {
    action: 'SETTINGS_UPDATE',
    targetType: 'SETTINGS',
    targetLabel: 'platform',
    details: { before, after: saved },
  });
  return NextResponse.json({ success: true, data: saved });
}
