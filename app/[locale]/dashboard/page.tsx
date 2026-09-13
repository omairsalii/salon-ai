"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function SalonDashboard() {
  const t = useTranslations('Dashboard');
  const common = useTranslations('Common');

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* القائمة الجانبية (Sidebar) */}
      <aside className="w-64 bg-white border-e border-stone-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-stone-200">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {common('appName')} - {t('title')}
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {/* رابط نظرة عامة (الرئيسية) */}
          <Link href="/ar/dashboard" className="flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-700 rounded-xl font-medium text-sm transition">
            📊 {t('overview')}
          </Link>
          
          {/* رابط المواعيد والحجوزات */}
          <Link href="/ar/dashboard/bookings" className="flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-stone-50 rounded-xl font-medium text-sm transition">
            📅 {t('appointments')}
          </Link>

          {/* رابط إدارة العملاء (CRM) */}
          <Link href="/ar/dashboard/clients" className="flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-stone-50 rounded-xl font-medium text-sm transition">
            👥 إدارة العملاء
          </Link>

          {/* رابط الخدمات والأسعار */}
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-stone-50 rounded-xl font-medium text-sm transition">
            💇‍♀️ {t('services')}
          </Link>
          
          {/* رابط فريق العمل */}
          <Link href="/ar/dashboard/staff" className="flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-stone-50 rounded-xl font-medium text-sm transition">
            👥 {t('staff')}
          </Link>

          {/* رابط الإعدادات */}
          <Link href="/ar/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-stone-50 rounded-xl font-medium text-sm transition">
            ⚙️ {t('settings')}
          </Link>
        </nav>
        <div className="p-4 border-t border-stone-200">
          <Link href="/ar" className="block text-center text-sm text-stone-500 hover:text-stone-800 transition">
            ← {t('backToStore')}
          </Link>
        </div>
      </aside>

      {/* المحتوى الرئيسي للوحة التحكم */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">{t('welcome')}</h1>
            <p className="text-sm text-stone-500">{t('subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
              {t('statusOpen')}
            </span>
          </div>
        </header>

        {/* إحصائيات سريعة (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <p className="text-sm font-medium text-stone-500 mb-1">{t('todayBookings')}</p>
            <h3 className="text-3xl font-extrabold text-stone-900">14</h3>
            <span className="text-xs text-emerald-600 font-semibold mt-2 inline-block">+12%</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <p className="text-sm font-medium text-stone-500 mb-1">{t('expectedRevenue')}</p>
            <h3 className="text-3xl font-extrabold text-stone-900">1,850 {common('currency')}</h3>
            <span className="text-xs text-emerald-600 font-semibold mt-2 inline-block">ممتاز</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <p className="text-sm font-medium text-stone-500 mb-1">{t('customerRating')}</p>
            <h3 className="text-3xl font-extrabold text-stone-900">4.9 / 5.0</h3>
            <span className="text-xs text-purple-600 font-semibold mt-2 inline-block">120+</span>
          </div>
        </div>

        {/* قسم الحجوزات الأخيرة */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-stone-900 mb-4">{t('recentBookings')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-stone-600">
              <thead className="bg-stone-50 text-stone-700 uppercase text-xs">
                <tr>
                  <th className="p-3 rounded-s-xl">{t('clientName')}</th>
                  <th className="p-3">{t('service')}</th>
                  <th className="p-3">{t('time')}</th>
                  <th className="p-3">{t('assignedStaff')}</th>
                  <th className="p-3 rounded-e-xl">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-stone-100">
                  <td className="p-3 font-medium text-stone-900">سارة الشمري</td>
                  <td className="p-3">قص وتصفيف شعر</td>
                  <td className="p-3">04:30 م</td>
                  <td className="p-3">نورة</td>
                  <td className="p-3"><span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium">{t('confirmed')}</span></td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="p-3 font-medium text-stone-900">فاطمة القحطاني</td>
                  <td className="p-3">عناية بالبشرة (فخامة)</td>
                  <td className="p-3">06:00 م</td>
                  <td className="p-3">سارة</td>
                  <td className="p-3"><span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-md font-medium">{t('completed')}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}