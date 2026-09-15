import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

// ملاحظة: كانت القائمة تضم 8 لغات لكن مجلد messages/ يحتوي فقط ar/en،
// ما كان يسبب خطأ 500 عند زيارة أي لغة أخرى. أعد التوسّع لاحقًا بعد
// إضافة ملفات ترجمة فعلية لكل لغة جديدة.
export const routing = defineRouting({
  locales: ['ar', 'en'],
  defaultLocale: 'ar'
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);