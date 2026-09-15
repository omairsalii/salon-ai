'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';

interface ServiceOption {
  id: string;
  displayName: string;
  basePrice: number | null;
}

export default function BookingForm({
  tenantId,
  service,
  onClose,
}: {
  tenantId: string;
  service: ServiceOption;
  onClose: () => void;
}) {
  const t = useTranslations('SalonDetail');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [startTime, setStartTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          serviceId: service.id,
          customerName: name,
          customerPhone: phone,
          startTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to book');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-black">
        {success ? (
          <div className="text-center py-4">
            <p className="text-emerald-600 text-2xl mb-3">✓</p>
            <p className="text-gray-800 font-medium mb-4">{t('bookingSuccess')}</p>
            <button
              onClick={onClose}
              className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition"
            >
              {t('close')}
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold mb-1">{t('bookingFormTitle')}</h3>
            <p className="text-sm text-gray-500 mb-4">{service.displayName}</p>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('yourName')}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('yourPhone')}</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  dir="ltr"
                  className="w-full px-3 py-2 border rounded-md text-left"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('dateTime')}</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <p className="text-xs text-gray-400">{t('depositNote')}</p>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-black text-white py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {submitting ? t('submitting') : t('confirmBooking')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  {t('close')}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
