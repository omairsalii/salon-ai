import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import VerifyEmailBanner from '@/components/VerifyEmailBanner';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: { name: true },
  });

  if (!tenant) {
    redirect(`/${locale}/login`);
  }

  return (
    <DashboardShell locale={locale} tenantName={tenant.name}>
      <VerifyEmailBanner audience="owner" />
      {children}
    </DashboardShell>
  );
}
