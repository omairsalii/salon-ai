'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ListToolbar from '@/components/admin/ListToolbar';

interface Row {
  id: string;
  status: string | null;
  startTime: string | null;
  totalAmount: string | null;
  tenant: { id: string; name: string; currency: string | null } | null;
  customer: { name: string; phone: string | null } | null;
  service: { name: Record<string, string> | null } | null;
  employee: { name: string } | null;
}

const STATUSES = ['PENDING_DEPOSIT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function AdminBookingsPage() {
  const params = useParams();
  const ar = params.locale !== 'en';
  const L = (a: string, e: string) => (ar ? a : e);
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/bookings?q=${encodeURIComponent(q)}&page=${page}&status=${status}`);
    const d = await res.json();
    if (d.success) {
      setRows(d.data);
      setTotal(d.total);
      setPageSize(d.pageSize);
    }
  }, [q, page, status]);

  useEffect(() => {
    const id = setTimeout(load, 250);
    return () => clearTimeout(id);
  }, [load]);

  const cancel = async (id: string) => {
    await fetch(`/api/admin/bookings/${id}/cancel`, { method: 'POST' });
    load();
  };
  const svc = (n: Record<string, string> | null | undefined) => (n && (n[ar ? 'ar' : 'en'] || n.ar || n.en)) || '—';

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{L('كل الحجوزات', 'All bookings')}</h1>
      <ListToolbar q={q} onQ={(v) => { setQ(v); setPage(1); }} exportType="bookings" page={page} total={total} pageSize={pageSize} onPage={setPage}>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-md border px-3 py-2 text-sm text-black">
          <option value="">{L('كل الحالات', 'All statuses')}</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </ListToolbar>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-right text-sm text-slate-600">
          <tbody>
            {rows.length === 0 && <tr><td className="p-6 text-center text-slate-400">—</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="p-3 whitespace-nowrap text-xs">{r.startTime ? new Date(r.startTime).toLocaleString(ar ? 'ar-BH' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</td>
                <td className="p-3 font-medium text-slate-900">{r.tenant?.name || '—'}</td>
                <td className="p-3">{svc(r.service?.name)}</td>
                <td className="p-3">{r.customer?.name || '—'} <span className="text-xs text-slate-400" dir="ltr">{r.customer?.phone}</span></td>
                <td className="p-3">{r.employee?.name || '—'}</td>
                <td className="p-3 text-xs">{r.status}</td>
                <td className="p-3">
                  {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' && (
                    <button onClick={() => cancel(r.id)} className="text-xs text-red-600 hover:underline">{L('إلغاء', 'Cancel')}</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
