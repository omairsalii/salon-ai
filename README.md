# Salon AI

منصة حجز صالونات متعددة المستأجرين (multi-tenant) للخليج، بالعربية أولًا ومع الإنجليزية. ثلاثة أدوار مستقلة: **العميل**، **صاحب الصالون**، **مدير المنصة**.

Multi-tenant salon-booking SaaS for the GCC (Bahrain first), Arabic-first with English.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind v4 · next-intl (ar/en) · Prisma 5 + PostgreSQL (PostGIS) · Leaflet · jose (JWT) · bcryptjs · Vitest.

## Setup

```bash
npm install
cp .env.example .env      # ثم عدّل القيم (انظر الجدول أدناه)
npx prisma migrate deploy # على قاعدة جديدة
npm run dev
```

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL (PostGIS مثبّت) |
| `SESSION_SECRET` | yes | مفتاح توقيع الجلسات الثلاث (owner / admin / customer) |
| `NEXT_PUBLIC_SITE_URL`, `APP_URL` | prod | الروابط المطلقة (بريد، sitemap، SEO) |
| `RESEND_API_KEY`, `EMAIL_FROM` | prod | إرسال البريد. بدونهما تُطبع الرسائل في سجل السيرفر |

## Scripts

```bash
npm run dev         # خادم التطوير
npm run build       # بناء الإنتاج
npm test            # اختبارات الوحدات (Vitest)
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint
```

## Architecture notes

- **ثلاث جلسات منفصلة** (JWT في httpOnly cookies): `salon_session`, `salon_admin_session`, `salon_customer_session`. كل مسار dashboard يشتق `tenantId` من الجلسة ولا يقبله من العميل أبدًا.
- **الحجز**: `lib/availability.ts` يحسب المواعيد المتاحة ويُنشئ/ينقل الحجز داخل معاملة `Serializable` مع فحص ساعات الدوام وتعارض الموظف، ويُسند موظفًا تلقائيًا عند عدم الاختيار. الأوقات بتوقيت الصالون (`tenant.timezone`، افتراضيًا `Asia/Bahrain`).
- **الاشتراكات**: `lib/plans.ts` + `lib/subscription.ts`. تجربة 14 يومًا (مزايا الاحترافية) ثم 3 باقات. الدفع الفعلي **غير مربوط بعد**: اختيار الباقة يُطبَّق مباشرة (انظر `app/api/dashboard/subscription/route.ts`).
- **الأمان**: تحديد المعدل داخل الذاكرة (`lib/rateLimit.ts`، لكل نسخة سيرفر)، رموز استعادة/تأكيد بريد لمرة واحدة مخزّنة كـ SHA-256، سجل تدقيق لإجراءات الأدمن، ترويسات أمان في `next.config.ts`.
- **الأدمن الأول**: التسجيل يعمل مرة واحدة فقط (عند عدم وجود أي أدمن).

## Database migrations (مهم)

`prisma migrate diff --from-url` يفشل على قاعدة فيها views من PostGIS. لذلك تُكتب الهجرات يدويًا:

```bash
# 1) اكتب prisma/migrations/<timestamp>_name/migration.sql (إضافي وآمن، IF NOT EXISTS)
# 2) طبّقه
npx prisma db execute --file prisma/migrations/<timestamp>_name/migration.sql --schema prisma/schema.prisma
# 3) سجّله كمطبَّق
npx prisma migrate resolve --applied <timestamp>_name
# 4) حدّث schema.prisma ثم أوقف السيرفر وشغّل (Windows يقفل ملف المحرك)
npx prisma generate
```

## Production checklist

- [ ] استضافة مع PostgreSQL + PostGIS، ونسخ احتياطي تلقائي
- [ ] ضبط كل متغيرات البيئة أعلاه (`SESSION_SECRET` قوي وفريد)
- [ ] مزوّد بريد (Resend) ونطاق مُوثَّق
- [ ] **بوابة دفع** قبل الإطلاق العام: الاشتراكات وعربون الحجز حاليًا بلا دفع فعلي
- [ ] استبدال محدد المعدل بـ Redis إذا شُغِّلت أكثر من نسخة سيرفر
- [ ] مراقبة أخطاء (Sentry أو مشابه)

## Not built yet

رفع شعار الصالون ومعرض الصور (يحتاج مزوّد تخزين سحابي)، التسجيل برقم الجوال + رمز SMS (يحتاج مزوّد رسائل)، الدفع الفعلي، دوام يعبر منتصف الليل، Content-Security-Policy.
