// CSV آمن: يحمي من حقن الصيغ في Excel (خلية تبدأ بـ = + - @ تُسبق بعلامة ') ويهرّب الفواصل والاقتباس
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? '' : value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  // BOM حتى يعرض Excel العربية صحيحة
  return '﻿' + [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
