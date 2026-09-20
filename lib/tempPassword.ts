import { randomInt } from 'crypto';

// كلمة مرور مؤقتة مقروءة (بدون رموز ملتبسة مثل 0/O و1/l)
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

export function generateTempPassword(length = 14): string {
  return Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
}
