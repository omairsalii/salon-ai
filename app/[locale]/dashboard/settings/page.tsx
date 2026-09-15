'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
  const t = useTranslations('Settings');
  const common = useTranslations('Common');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [workingHoursText, setWorkingHoursText] = useState('');
  const [currency, setCurrency] = useState('');
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/dashboard/settings');
      const data = await res.json();
      if (data.success) {
        setName(data.data.name || '');
        setCity(data.data.city || '');
        setWorkingHoursText(data.data.workingHoursText || '');
        setCurrency(data.data.currency || '');
        setTimezone(data.data.timezone || '');
      }
      setLoading(false);
    })();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/api/dashboard/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, city, workingHoursText, currency, timezone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الحفظ');
      setSaved(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-center text-stone-400 text-sm py-10">...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">{t('title')}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 max-w-2xl space-y-4">
        {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
        {saved && <div className="p-3 bg-emerald-50 text-emerald-700 rounded text-sm">تم الحفظ بنجاح</div>}

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">{t('salonName')}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border rounded-md text-black" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">{t('city')}</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2 border rounded-md text-black" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">{t('workingHours')}</label>
          <input
            value={workingHoursText}
            onChange={(e) => setWorkingHoursText(e.target.value)}
            placeholder="مثال: 01:00 م - 11:00 م"
            className="w-full px-3 py-2 border rounded-md text-black"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">العملة</label>
            <input value={currency} onChange={(e) => setCurrency(e.target.value)} dir="ltr" className="w-full px-3 py-2 border rounded-md text-black text-left" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">المنطقة الزمنية</label>
            <input value={timezone} onChange={(e) => setTimezone(e.target.value)} dir="ltr" className="w-full px-3 py-2 border rounded-md text-black text-left" />
          </div>
        </div>

        <button type="submit" disabled={saving} className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
          {saving ? '...' : t('saveChanges')}
        </button>
      </form>
    </div>
  );
}
