import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

const handleIntlRouting = createMiddleware({
  locales: ['ar', 'en', 'fr', 'es', 'fa', 'ur', 'hi', 'tr'],
  defaultLocale: 'ar'
});

export default function proxy(request: NextRequest) {
  return handleIntlRouting(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};