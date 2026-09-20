'use client';

import { useParams } from 'next/navigation';

// شريط بحث + تصدير + ترقيم مشترك بين قوائم الأدمن
export default function ListToolbar({
  q,
  onQ,
  exportType,
  page,
  total,
  pageSize,
  onPage,
  children,
}: {
  q: string;
  onQ: (v: string) => void;
  exportType?: string;
  page?: number;
  total?: number;
  pageSize?: number;
  onPage?: (p: number) => void;
  children?: React.ReactNode;
}) {
  const params = useParams();
  const ar = params.locale !== 'en';
  const pages = total && pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <input
        value={q}
        onChange={(e) => onQ(e.target.value)}
        placeholder={ar ? 'بحث...' : 'Search...'}
        className="min-w-56 flex-1 rounded-md border px-3 py-2 text-sm text-black"
      />
      {children}
      {exportType && (
        <a href={`/api/admin/export?type=${exportType}`} className="rounded-md border bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
          ⬇ CSV
        </a>
      )}
      {page && onPage && pages > 1 && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded border bg-white px-2 py-1 disabled:opacity-40">‹</button>
          <span>
            {page} / {pages}
          </span>
          <button disabled={page >= pages} onClick={() => onPage(page + 1)} className="rounded border bg-white px-2 py-1 disabled:opacity-40">›</button>
        </div>
      )}
    </div>
  );
}
