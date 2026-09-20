import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { getAdminSession } from '@/lib/adminSession';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getAdminSession();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (session.mustChangePassword) {
    redirect(`/${locale}/admin/change-password`);
  }

  return (
    <AdminShell locale={locale} adminEmail={session.email}>
      {children}
    </AdminShell>
  );
}
