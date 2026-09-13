"use client";

import { useTranslations } from 'next-intl';

export default function ClientsPage() {
  const t = useTranslations('Clients');
  const common = useTranslations('Common');

  // بيانات تجريبية للعملاء
  const clients = [
    { id: 1, name: 'سارة أحمد', phone: '+966 50 123 4567', visits: 5, lastVisit: '2026-06-01' },
    { id: 2, name: 'فاطمة محمد', phone: '+966 55 987 6543', visits: 2, lastVisit: '2026-06-05' },
    { id: 3, name: 'نورة القحطاني', phone: '+966 54 333 2211', visits: 8, lastVisit: '2026-06-08' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-stone-900">{t('title')}</h1>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition font-medium text-sm">
          {t('newClient')}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 text-sm">
            <tr>
              <th className="p-4">{t('name')}</th>
              <th className="p-4">{t('phone')}</th>
              <th className="p-4">{t('totalVisits')}</th>
              <th className="p-4">{t('lastVisit')}</th>
              <th className="p-4">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-stone-50/50 transition">
                <td className="p-4 font-medium text-stone-900">{client.name}</td>
                <td className="p-4 text-stone-600 font-mono" dir="ltr">{client.phone}</td>
                <td className="p-4 text-stone-600">
                  <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                    {client.visits} زيارات
                  </span>
                </td>
                <td className="p-4 text-stone-600">{client.lastVisit}</td>
                <td className="p-4">
                  <button className="text-purple-600 hover:underline font-medium">{common('edit')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}