import { ResetPasswordForm } from '@/components/AuthFlowForms';

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ audience?: string; token?: string }>;
}) {
  const { locale } = await params;
  const { audience, token } = await searchParams;
  return (
    <ResetPasswordForm
      locale={locale}
      audience={audience === 'customer' ? 'customer' : 'owner'}
      token={token || ''}
    />
  );
}
