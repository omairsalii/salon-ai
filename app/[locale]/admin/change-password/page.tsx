import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/adminSession';
import ChangePasswordForm from './ChangePasswordForm';

// خارج مجموعة (protected) عمدًا: الأدمن ذو كلمة المرور المؤقتة يُحوَّل إليها ولا يصل لغيرها
export default async function AdminChangePasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getAdminSession();
  if (!session) redirect(`/${locale}/admin/login`);

  return <ChangePasswordForm locale={locale} forced={Boolean(session.mustChangePassword)} />;
}
