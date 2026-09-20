'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function VerifyEmailBanner({ audience }: { audience: 'owner' | 'customer' }) {
  const params = useParams();
  const ar = params.locale !== 'en';
  const [verified, setVerified] = useState(true);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch(`/api/auth/resend-verification?audience=${audience}`)
      .then((r) => r.json())
      .then((d) => d.success && setVerified(d.verified))
      .catch(() => {});
  }, [audience]);

  if (verified) return null;

  const resend = async () => {
    const res = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audience }),
    });
    if (res.ok) setSent(true);
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <span>{ar ? 'بريدك الإلكتروني غير مؤكد بعد. تحقق من صندوق الوارد.' : 'Your email is not confirmed yet. Check your inbox.'}</span>
      {sent ? (
        <span className="font-medium text-emerald-700">{ar ? 'تم إرسال الرابط' : 'Link sent'}</span>
      ) : (
        <button onClick={resend} className="font-medium underline">
          {ar ? 'أعد إرسال الرابط' : 'Resend link'}
        </button>
      )}
    </div>
  );
}
