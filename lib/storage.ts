// تخزين الملفات على Supabase Storage عبر REST مباشرة (بدون SDK).
// المفتاح service_role يبقى في السيرفر فقط ولا يصل للمتصفح أبدًا.
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'salon-media';

function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export const isStorageConfigured = () => config() !== null;

const headers = (key: string) => ({ Authorization: `Bearer ${key}`, apikey: key });

// ينشئ الحاوية (عامة للقراءة) إن لم تكن موجودة
async function ensureBucket(url: string, key: string) {
  const res = await fetch(`${url}/storage/v1/bucket`, {
    method: 'POST',
    headers: { ...headers(key), 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  // 400/409 = موجودة مسبقًا
  if (!res.ok && res.status !== 400 && res.status !== 409) {
    throw new Error(`bucket create failed: ${res.status}`);
  }
}

export async function uploadPublicFile(path: string, bytes: Buffer, contentType: string) {
  const cfg = config();
  if (!cfg) throw new Error('STORAGE_NOT_CONFIGURED');

  const put = () =>
    fetch(`${cfg.url}/storage/v1/object/${BUCKET}/${path}`, {
      method: 'POST',
      headers: { ...headers(cfg.key), 'Content-Type': contentType, 'x-upsert': 'true', 'Cache-Control': 'max-age=31536000' },
      body: new Uint8Array(bytes),
    });

  let res = await put();
  if (res.status === 404 || res.status === 400) {
    await ensureBucket(cfg.url, cfg.key);
    res = await put();
  }
  if (!res.ok) throw new Error(`upload failed: ${res.status} ${await res.text()}`);

  return `${cfg.url}/storage/v1/object/public/${BUCKET}/${path}`;
}

export async function deleteFile(path: string) {
  const cfg = config();
  if (!cfg) return;
  await fetch(`${cfg.url}/storage/v1/object/${BUCKET}/${path}`, { method: 'DELETE', headers: headers(cfg.key) }).catch(
    () => {}
  );
}
