import { ForgotPasswordForm } from '@/components/AuthFlowForms';

export default async function ForgotPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ audience?: string }>;
}) {
  const { locale } = await params;
  const { audience } = await searchParams;
  return <ForgotPasswordForm locale={locale} audience={audience === 'customer' || audience === 'admin' ? audience : 'owner'} />;
}
