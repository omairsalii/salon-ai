"use client";

import { useTranslations } from 'next-intl';

export default function ServicesPage() {
  const t = useTranslations('Services');
  const common = useTranslations('Common');

  // بيانات تجريبية للخدمات
  const servicesList = [
    { id: 1, name: 'قص وتصفيف شعر فخم', price: '150 ر.س', duration: '45 دقيقة', category: 'الشعر' },
    { id: 2, name: 'عناية عميقة بالبشرة', price: '350 ر.س', duration: '60 دقيقة', category: 'البشرة' },
    { id: 3, name: 'منيكير وبديكير ملكي', price: '200 ر.س', duration: '50 دقيقة', category: 'الأظافر' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-stone-900">{t('title')}</h1>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition font-medium text-sm">
          {t('newService')}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 text-sm">
            <tr>
              <th className="p-4">{t('serviceName')}</th>
              <th className="p-4">{t('category')}</th>
              <th className="p-4">{t('price')}</th>
              <th className="p-4">{t('duration')}</th>
              <th className="p-4">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {servicesList.map((service) => (
              <tr key={service.id} className="hover:bg-stone-50/50 transition">
                <td className="p-4 font-medium text-stone-900">{service.name}</td>
                <td className="p-4">
                  <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full text-xs font-medium">
                    {service.category}
                  </span>
                </td>
                <td className="p-4 font-semibold text-purple-600">{service.price}</td>
                <td className="p-4 text-stone-600">{service.duration}</td>
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