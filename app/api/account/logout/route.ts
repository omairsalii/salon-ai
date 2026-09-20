import { NextResponse } from 'next/server';
import { clearCustomerSession } from '@/lib/customerSession';

export async function POST() {
  await clearCustomerSession();
  return NextResponse.json({ success: true }, { status: 200 });
}
