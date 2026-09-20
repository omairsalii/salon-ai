import { VerifyEmailStatus } from '@/components/AuthFlowForms';

export default async function VerifyEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ audience?: string; token?: string }>;
}) {
  const { locale } = await params;
  const { audience, token } = await searchParams;
  return (
    <VerifyEmailStatus
      locale={locale}
      audience={audience === 'customer' ? 'customer' : 'owner'}
      token={token || ''}
    />
  );
}
