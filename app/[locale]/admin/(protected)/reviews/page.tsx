'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ListToolbar from '@/components/admin/ListToolbar';

interface Row {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  tenant: { id: string; name: string };
  account: { name: string; email: string };
}

export default function AdminReviewsPage() {
  const params = useParams();
  const ar = params.locale !== 'en';
  const L = (a: string, e: string) => (ar ? a : e);
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [low, setLow] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/reviews?q=${encodeURIComponent(q)}&page=${page}${low ? '&maxRating=2' : ''}`);
    const d = await res.json();
    if (d.success) {
      setRows(d.data);
      setTotal(d.total);
      setPageSize(d.pageSize);
    }
  }, [q, page, low]);

  useEffect(() => {
    const id = setTimeout(load, 250);
    return () => clearTimeout(id);
  }, [load]);

  const remove = async (id: string) => {
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{L('التقييمات', 'Reviews')}</h1>
      <ListToolbar q={q} onQ={(v) => { setQ(v); setPage(1); }} page={page} total={total} pageSize={pageSize} onPage={setPage}>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={low} onChange={(e) => { setLow(e.target.checked); setPage(1); }} />
          {L('نجمتان فأقل فقط', '2 stars or below')}
        </label>
      </ListToolbar>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-right text-sm text-slate-600">
          <tbody>
            {rows.length === 0 && <tr><td className="p-6 text-center text-slate-400">—</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 align-top">
                <td className="p-3 font-medium text-slate-900">{r.tenant.name}</td>
                <td className="p-3 text-amber-500 whitespace-nowrap" dir="ltr">{'★'.repeat(r.rating)}<span className="text-slate-300">{'★'.repeat(5 - r.rating)}</span></td>
                <td className="p-3">{r.comment || '—'}</td>
                <td className="p-3 text-xs">{r.account.name}<br /><span dir="ltr">{r.account.email}</span></td>
                <td className="p-3 whitespace-nowrap text-xs">{new Date(r.createdAt).toLocaleDateString(ar ? 'ar-BH' : 'en-GB')}</td>
                <td className="p-3"><button onClick={() => remove(r.id)} className="text-xs text-red-600 hover:underline">{L('حذف', 'Delete')}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
