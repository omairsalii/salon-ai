import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // في الإنتاج لا نسجّل الاستعلامات (تحوي بيانات شخصية: بريد، جوال، رموز) — أخطاء فقط
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;