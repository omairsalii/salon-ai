"use client";

import { useTranslations } from 'next-intl';

export default function BookingsPage() {
  const t = useTranslations('Bookings');
  const common = useTranslations('Common');

  // بيانات تجريبية (مؤقتة لحين ربط قاعدة البيانات)
  const bookings = [
    { id: 1, client: 'سارة أحمد', service: 'قص شعر وشتوي', time: 'اليوم، 04:00 م', status: 'confirmed' },
    { id: 2, client: 'فاطمة محمد', service: 'عناية بالبشرة', time: 'غداً، 02:00 م', status: 'pending' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          {t('newBooking')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="p-4">{t('clientName')}</th>
              <th className="p-4">{t('service')}</th>
              <th className="p-4">{t('time')}</th>
              <th className="p-4">{t('status')}</th>
              <th className="p-4">{common('edit')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50/50">
                <td className="p-4 font-medium text-gray-800">{b.client}</td>
                <td className="p-4 text-gray-600">{b.service}</td>
                <td className="p-4 text-gray-600">{b.time}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    b.status === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {b.status === 'confirmed' ? t('confirmed') : t('pending')}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-indigo-600 hover:underline">{common('edit')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}