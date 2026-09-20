'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function FavoriteButton({ tenantId }: { tenantId: string }) {
  const params = useParams();
  const ar = params.locale !== 'en';
  const [fav, setFav] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/account/favorites')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.success) {
          setLoggedIn(true);
          setFav(d.data.includes(tenantId));
        }
      })
      .catch(() => {});
  }, [tenantId]);

  const toggle = async () => {
    if (!loggedIn) {
      window.location.href = `/${ar ? 'ar' : 'en'}/account/login`;
      return;
    }
    const next = !fav;
    setFav(next);
    const res = await fetch('/api/account/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, favorite: next }),
    });
    if (!res.ok) setFav(!next);
  };

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition ${
        fav ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
      }`}
      aria-pressed={fav}
    >
      {fav ? '♥' : '♡'} {fav ? (ar ? 'في المفضلة' : 'Saved') : ar ? 'أضف للمفضلة' : 'Save'}
    </button>
  );
}
