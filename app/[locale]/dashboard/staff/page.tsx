"use client";

import { useTranslations } from 'next-intl';

export default function StaffPage() {
  const t = useTranslations('Staff');
  const common = useTranslations('Common');

  const staffList = [
    { id: 1, name: 'نورة السعيد', role: 'خبير تصفيف شعر', phone: '+966 50 111 2233', status: 'active' },
    { id: 2, name: 'سارة خالد', role: 'أخصائية عناية بالبشرة', phone: '+966 55 444 5566', status: 'active' },
    { id: 3, name: 'ريم العتيبي', role: 'خبير أظافر ومكياج', phone: '+966 54 777 8899', status: 'onLeave' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-stone-900">{t('title')}</h1>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition font-medium text-sm">
          {t('newStaff')}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 text-sm">
            <tr>
              <th className="p-4">{t('name')}</th>
              <th className="p-4">{t('role')}</th>
              <th className="p-4">{t('phone')}</th>
              <th className="p-4">{t('status')}</th>
              <th className="p-4">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {staffList.map((member) => (
              <tr key={member.id} className="hover:bg-stone-50/50 transition">
                <td className="p-4 font-medium text-stone-900">{member.name}</td>
                <td className="p-4 text-stone-600">{member.role}</td>
                <td className="p-4 text-stone-600 font-mono" dir="ltr">{member.phone}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    member.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {member.status === 'active' ? t('active') : t('onLeave')}
                  </span>
                </td>
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