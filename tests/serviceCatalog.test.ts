import { describe, expect, it } from 'vitest';
import { SERVICE_CATALOG, SERVICE_CATEGORIES } from '@/lib/serviceCatalog';

describe('service catalog', () => {
  it('every service belongs to a known category', () => {
    const keys = new Set(SERVICE_CATEGORIES.map((c) => c.key));
    for (const s of SERVICE_CATALOG) expect(keys.has(s.category), s.en).toBe(true);
  });

  it('has no duplicate Arabic or English names', () => {
    const ar = SERVICE_CATALOG.map((s) => s.ar);
    const en = SERVICE_CATALOG.map((s) => s.en.toLowerCase());
    expect(new Set(ar).size).toBe(ar.length);
    expect(new Set(en).size).toBe(en.length);
  });

  it('every category has services and every entry has both languages', () => {
    for (const c of SERVICE_CATEGORIES) {
      expect(SERVICE_CATALOG.some((s) => s.category === c.key), c.key).toBe(true);
    }
    for (const s of SERVICE_CATALOG) {
      expect(s.ar.trim()).not.toBe('');
      expect(s.en.trim()).not.toBe('');
    }
  });
});
