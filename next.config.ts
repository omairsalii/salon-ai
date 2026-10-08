import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// سياسة أمان المحتوى (CSP): طبقة دفاع أساسية ضد XSS وحقن المحتوى.
// المصادر الخارجية الفعلية: بلاط OpenStreetMap، صور علامات Leaflet من unpkg،
// شعارات الصالونات من Supabase Storage (https أي مضيف)، وبحث المواقع من nominatim.
// ملاحظة: Next (App Router) يحقن سكربتات inline، لذا نسمح بـ 'unsafe-inline'
// للسكربت/الستايل؛ تقوية مستقبلية: CSP قائمة على nonce.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://nominatim.openstreetmap.org",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // الموقع الجغرافي مستخدم في "الأقرب لي" فقط
  { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(), microphone=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
];

const nextConfig = {
  turbopack: {},
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
