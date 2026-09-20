import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const load = (locale: string) => JSON.parse(readFileSync(`messages/${locale}.json`, 'utf8')) as Record<string, Record<string, string>>;

const flatten = (o: Record<string, Record<string, string>>) =>
  Object.entries(o).flatMap(([ns, keys]) => Object.keys(keys).map((k) => `${ns}.${k}`));

describe('translation files', () => {
  it('are valid JSON', () => {
    expect(() => load('ar')).not.toThrow();
    expect(() => load('en')).not.toThrow();
  });

  it('have exactly the same namespaces and keys in Arabic and English', () => {
    const ar = new Set(flatten(load('ar')));
    const en = new Set(flatten(load('en')));
    expect([...ar].filter((k) => !en.has(k))).toEqual([]);
    expect([...en].filter((k) => !ar.has(k))).toEqual([]);
  });

  it('have no empty values', () => {
    for (const locale of ['ar', 'en']) {
      for (const [ns, keys] of Object.entries(load(locale))) {
        for (const [k, v] of Object.entries(keys)) expect(v.trim(), `${locale}:${ns}.${k}`).not.toBe('');
      }
    }
  });
});
