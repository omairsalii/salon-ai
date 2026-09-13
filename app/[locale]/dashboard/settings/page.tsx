"use client";

import { useTranslations } from 'next-intl';

export default function SettingsPage() {
  const t = useTranslations('Settings');

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">{t('title')}</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">{t('salonName')}</label>
          <input 
            type="text" 
            defaultValue="صالون النخبة للتجميل" 
            className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">{t('city')}</label>
          <input 
            type="text" 
            defaultValue="الرياض" 
            className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">{t('workingHours')}</label>
          <input 
            type="text" 
            defaultValue="01:00 م - 11:00 م" 
            className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <button className="bg-purple-600 text-white px-6 py-2.5 rounded-xl hover:bg-purple-700 transition font-medium text-sm">
          {t('saveChanges')}
        </button>
      </div>
    </div>
  );
}