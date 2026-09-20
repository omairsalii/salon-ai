// معاملات البحث والترقيم المشتركة لقوائم الأدمن
export const ADMIN_PAGE_SIZE = 25;

export function listParams(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim().slice(0, 100);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  return { q, page, take: ADMIN_PAGE_SIZE, skip: (page - 1) * ADMIN_PAGE_SIZE, url };
}
