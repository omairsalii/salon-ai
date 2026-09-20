import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { getCustomerSession } from '@/lib/customerSession';

export default async function AccountLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getCustomerSession();

  if (!session) {
    redirect(`/${locale}/account/login`);
  }

  return <>{children}</>;
}
