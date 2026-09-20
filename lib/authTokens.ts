import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

export type TokenPurpose = 'RESET_PASSWORD' | 'VERIFY_EMAIL';
export type TokenAudience = 'owner' | 'customer';

const TTL_MS: Record<TokenPurpose, number> = {
  RESET_PASSWORD: 60 * 60 * 1000, // ساعة
  VERIFY_EMAIL: 3 * 24 * 60 * 60 * 1000, // 3 أيام
};

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

// يرجع الرمز الخام (يُرسل بالبريد فقط)؛ في القاعدة نخزن hash فقط
export async function issueToken(purpose: TokenPurpose, audience: TokenAudience, subjectId: string, email: string) {
  await prisma.authToken.deleteMany({ where: { subjectId, purpose, usedAt: null } });
  const raw = randomBytes(32).toString('hex');
  await prisma.authToken.create({
    data: {
      purpose,
      audience,
      subjectId,
      email,
      tokenHash: sha256(raw),
      expiresAt: new Date(Date.now() + TTL_MS[purpose]),
    },
  });
  return raw;
}

// استهلاك ذري: ينجح مرة واحدة فقط ولا يقبل رمزًا منتهيًا أو لجمهور مختلف
export async function consumeToken(purpose: TokenPurpose, audience: TokenAudience, raw: string) {
  const tokenHash = sha256(raw);
  const claimed = await prisma.authToken.updateMany({
    where: { tokenHash, purpose, audience, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });
  if (claimed.count !== 1) return null;
  return prisma.authToken.findUnique({ where: { tokenHash } });
}
