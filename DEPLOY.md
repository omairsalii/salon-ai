# النشر على Vercel + Supabase

الخطة: التطبيق على **Vercel**، وقاعدة البيانات وتخزين الصور على **Supabase** (حساب واحد لكليهما).

## 1) قاعدة البيانات على Supabase

1. أنشئ مشروعًا جديدًا. **اختر أقرب منطقة للبحرين** (مثلًا Frankfurt أو Mumbai)، ودوّنها: تلزم لاختيار منطقة Vercel.
2. من **Project Settings ← Database ← Connection string** انسخ رابطين:
   - **Transaction pooler** (منفذ 6543) ← يصبح `DATABASE_URL`، وأضف في آخره `?pgbouncer=true&connection_limit=1`
   - **Direct connection** (منفذ 5432) أو Session pooler ← يصبح `DIRECT_URL` (للهجرات فقط)
3. طبّق الهجرات على القاعدة الجديدة من جهازك (مرة واحدة):

```powershell
$env:DATABASE_URL="<الرابط المباشر DIRECT>"; $env:DIRECT_URL=$env:DATABASE_URL
npx prisma migrate deploy
```

4. (اختياري) انسخ الصالونات الحالية من جهازك إلى Supabase (آمن للإعادة ولا يحذف شيئًا):

```powershell
$env:SOURCE_URL="<رابط قاعدتك المحلية>"; $env:TARGET_URL="<الرابط المباشر DIRECT>"; node scripts/copy-data.js
```

## 2) تخزين الصور (الشعار)

من **Project Settings ← API**: `Project URL` و`service_role key`. الحاوية `salon-media` تُنشأ تلقائيًا عند أول رفع.

## 3) Vercel

1. **Add New ← Project** واستورد المستودع `omairsalii/salon-ai` (Framework: Next.js تلقائيًا).
2. أضف متغيرات البيئة (Production):

| المتغير | القيمة |
|---|---|
| `DATABASE_URL` | رابط الـ pooler مع `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | الرابط المباشر |
| `SESSION_SECRET` | قيمة عشوائية **جديدة** (لا تنسخ قيمة جهازك): `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_SITE_URL` و`APP_URL` | رابط موقعك النهائي بدون `/` في آخره، مثل `https://salon.example.com` |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | مفتاح service_role (سرّي) |
| `RESEND_API_KEY` و`EMAIL_FROM` | لإرسال البريد (بدونهما لا تصل رسائل الاستعادة والتأكيد) |

3. من **Settings ← Functions** اختر **Function Region** الأقرب لمنطقة Supabase نفسها (يقلل زمن الاستعلامات كثيرًا).
4. **Deploy**، ثم افتح `https://موقعك/api/health` ويجب أن يرد `{"ok":true}`.
5. **الدومين**: من **Settings ← Domains** أضف نطاقك واتبع تعليمات الـ DNS، ثم حدّث `NEXT_PUBLIC_SITE_URL` و`APP_URL`.

## 4) بعد أول نشر

- افتح `/ar/admin/register` وأنشئ **المدير الأول فورًا** (يعمل مرة واحدة فقط، ومن يصل أولًا يصبح المدير).
- اختبر: تسجيل صالون جديد، رفع شعار، حجز موعد، وصول بريد التأكيد.

## تنبيهات معروفة

- **محدد المعدل** (`lib/rateLimit.ts`) يعمل داخل الذاكرة، وعلى Vercel لكل نسخة دالة على حدة، فحمايته أضعف. للإطلاق الجاد استبدله بـ Redis (Upstash).
- **الدفع الفعلي** غير مربوط: الاشتراكات والعربون بلا دفع. لا تروّج للعامة قبل ربط بوابة.
- الهجرات لا تعمل تلقائيًا عند النشر عمدًا؛ شغّلها يدويًا كما في الخطوة 1 عند كل تغيير في قاعدة البيانات.
