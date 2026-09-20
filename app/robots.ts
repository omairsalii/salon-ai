import type { MetadataRoute } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // لوحات التحكم والحسابات والـ API ليست للفهرسة
        disallow: ['/api/', '/ar/dashboard', '/en/dashboard', '/ar/admin', '/en/admin', '/ar/account', '/en/account'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
