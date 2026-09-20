import { issueToken, type TokenAudience } from '@/lib/authTokens';
import { actionEmail, appOrigin, sendEmail } from '@/lib/email';

export function localeFromRequest(request: Request): string {
  const referer = request.headers.get('referer') || '';
  return /\/en(\/|$)/.test(new URL(referer, 'http://x').pathname) ? 'en' : 'ar';
}

export async function sendVerificationEmail(
  request: Request,
  audience: TokenAudience,
  subjectId: string,
  email: string
) {
  const locale = localeFromRequest(request);
  const raw = await issueToken('VERIFY_EMAIL', audience, subjectId, email);
  const link = `${appOrigin(request)}/${locale}/verify-email?audience=${audience}&token=${raw}`;
  const mail = actionEmail('verify', link, locale);
  await sendEmail({ to: email, ...mail });
}
