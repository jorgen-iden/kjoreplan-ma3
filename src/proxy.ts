import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next internals, generated share images (served directly at
  // /<locale>/opengraph-image so crawlers get no redirect) and files with an extension.
  matcher: '/((?!api|_next|_vercel|[a-z]{2}/opengraph-image|.*\\..*).*)',
};
