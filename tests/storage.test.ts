import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sniffImage } from '@/lib/imageSniff';
import { deleteFile, isStorageConfigured, uploadPublicFile } from '@/lib/storage';

describe('sniffImage', () => {
  it('detects PNG, JPEG and WebP from bytes', () => {
    expect(sniffImage(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0]))?.ext).toBe('png');
    expect(sniffImage(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]))?.ext).toBe('jpg');
    const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.from([1, 0, 0, 0]), Buffer.from('WEBP'), Buffer.from([0, 0])]);
    expect(sniffImage(webp)?.ext).toBe('webp');
  });

  it('rejects SVG, HTML and random bytes even if named like an image', () => {
    expect(sniffImage(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBeNull();
    expect(sniffImage(Buffer.from('<html><script>alert(1)</script></html>'))).toBeNull();
    expect(sniffImage(Buffer.from('GIF89a......'))).toBeNull();
    expect(sniffImage(Buffer.alloc(0))).toBeNull();
  });
});

describe('storage (mocked Supabase)', () => {
  const calls: Array<{ url: string; method: string; headers: Record<string, string> }> = [];

  beforeEach(() => {
    calls.length = 0;
    process.env.SUPABASE_URL = 'https://proj.supabase.co/';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  const stubFetch = (handler: (url: string, n: number) => number) => {
    let n = 0;
    vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
      calls.push({ url, method: String(init?.method), headers: init?.headers as Record<string, string> });
      const status = handler(url, n++);
      return new Response(status < 300 ? '{}' : 'err', { status });
    });
  };

  it('reports whether it is configured', () => {
    expect(isStorageConfigured()).toBe(true);
    delete process.env.SUPABASE_URL;
    expect(isStorageConfigured()).toBe(false);
  });

  it('uploads and returns the public URL', async () => {
    stubFetch(() => 200);
    const url = await uploadPublicFile('tenant-1/logo.png', Buffer.from('x'), 'image/png');
    expect(url).toBe('https://proj.supabase.co/storage/v1/object/public/salon-media/tenant-1/logo.png');
    expect(calls[0].url).toBe('https://proj.supabase.co/storage/v1/object/salon-media/tenant-1/logo.png');
    expect(calls[0].headers.Authorization).toBe('Bearer service-key');
    expect(calls[0].headers['Content-Type']).toBe('image/png');
  });

  it('creates the bucket and retries when it does not exist yet', async () => {
    stubFetch((_url, n) => (n === 0 ? 404 : 200)); // upload 404 -> create bucket -> upload again
    await uploadPublicFile('t/a.png', Buffer.from('x'), 'image/png');
    expect(calls.map((c) => c.method)).toEqual(['POST', 'POST', 'POST']);
    expect(calls[1].url).toBe('https://proj.supabase.co/storage/v1/bucket');
  });

  it('throws a clear error when not configured', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    await expect(uploadPublicFile('t/a.png', Buffer.from('x'), 'image/png')).rejects.toThrow('STORAGE_NOT_CONFIGURED');
  });

  it('surfaces upload failures', async () => {
    stubFetch(() => 500);
    await expect(uploadPublicFile('t/a.png', Buffer.from('x'), 'image/png')).rejects.toThrow(/upload failed: 500/);
  });

  it('delete is a silent no-op when not configured', async () => {
    delete process.env.SUPABASE_URL;
    await expect(deleteFile('t/a.png')).resolves.toBeUndefined();
  });
});
